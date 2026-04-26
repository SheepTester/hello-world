import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { execFile, spawn } from 'child_process'
import { promisify } from 'util'
import { exists, getUniquePath, safeMove } from './utils.ts'

const execFileAsync = promisify(execFile)

async function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args)
    const stderrLines: string[] = []

    child.stderr.on('data', data => {
      const lines = data.toString().split('\n')
      for (const line of lines) {
        if (line.trim()) {
          stderrLines.push(line)
          if (stderrLines.length > 20) {
            stderrLines.shift()
          }
        }
      }
    })

    child.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        const errorMsg =
          stderrLines.length > 0
            ? `\nLast few lines of error output:\n${stderrLines.join('\n')}`
            : ''
        reject(new Error(`Command failed with code ${code}${errorMsg}`))
      }
    })

    child.on('error', err => {
      reject(err)
    })
  })
}

interface MediaProperties {
  propsId: string
  creationTime: Date | null
}

async function getMediaProperties(filePath: string): Promise<MediaProperties> {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'stream=codec_type,codec_name,profile,width,height,pix_fmt,color_space,color_transfer,color_primaries,sample_rate,channels:format_tags=creation_time,com.apple.quicktime.creationdate',
        '-of',
        'json',
        filePath
      ],
      { maxBuffer: 10 * 1024 * 1024 }
    )
    const data = JSON.parse(stdout)

    let videoProps = ''
    let audioProps = ''

    if (data.streams) {
      for (const stream of data.streams) {
        if (stream.codec_type === 'video') {
          videoProps = [
            stream.codec_name || '',
            stream.profile || '',
            stream.width || '',
            stream.height || '',
            stream.pix_fmt || '',
            stream.color_space || '',
            stream.color_transfer || '',
            stream.color_primaries || ''
          ].join('|')
        } else if (stream.codec_type === 'audio') {
          audioProps = [
            stream.codec_name || '',
            stream.profile || '',
            stream.sample_rate || '',
            stream.channels || ''
          ].join('|')
        }
      }
    }

    let creationTime: Date | null = null
    const tags = data.format?.tags
    if (tags) {
      const timeStr =
        tags['com.apple.quicktime.creationdate'] || tags.creation_time
      if (timeStr) {
        creationTime = new Date(timeStr)
        if (isNaN(creationTime.getTime())) {
          creationTime = null
        }
      }
    }

    return {
      propsId: `${videoProps}::${audioProps}`,
      creationTime
    }
  } catch (err) {
    console.error(`\nError probing file ${filePath}:`, err)
    return { propsId: 'error', creationTime: null }
  }
}

interface FileWithMetadata {
  file: string
  creationTime: Date | null
}

async function main() {
  const args = process.argv.slice(2)
  const dirPath =
    args.length === 1 ? args[0] : path.join(process.cwd(), 'live-photo-videos')

  if (args.length > 1) {
    console.error('Usage: npx tsx group-live-photos.ts [path_to_videos_dir]')
    process.exit(1)
  }

  let files: string[]

  try {
    const dirEntries = await fs.readdir(dirPath, { withFileTypes: true })
    files = dirEntries
      .filter(dirent => dirent.isFile() && /\.(mov|mp4)$/i.test(dirent.name))
      .map(dirent => dirent.name)
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err)
    process.exit(1)
  }

  if (files.length === 0) {
    console.log('No video files found in the specified directory.')
    await fs.rmdir(dirPath).catch(() => {})
    process.exit(0)
  }

  console.log(`Found ${files.length} video files. Extracting properties...`)

  const fileGroups = new Map<string, FileWithMetadata[]>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    process.stdout.write(`\rProcessing file ${i + 1}/${files.length}...`)
    const fullPath = path.join(dirPath, file)
    const { propsId, creationTime } = await getMediaProperties(fullPath)

    if (propsId === 'error') {
      console.log(`\nSkipping file ${file} due to probe error.`)
      continue
    }

    if (!fileGroups.has(propsId)) {
      fileGroups.set(propsId, [])
    }
    fileGroups.get(propsId)!.push({ file, creationTime })
  }
  console.log() // Print a new line after progress indicator finishes

  console.log(`Found ${fileGroups.size} distinct property groups.`)

  const concatGroupsDir = path.join(dirPath, 'concat_groups')
  try {
    await fs.mkdir(concatGroupsDir, { recursive: true })
  } catch (err) {
    console.error(`Error creating directory ${concatGroupsDir}:`, err)
    process.exit(1)
  }

  let groupIndex = 1
  for (const [propsId, groupFiles] of fileGroups.entries()) {
    // Sort files by creationTime
    groupFiles.sort((a, b) => {
      if (a.creationTime && b.creationTime) {
        return a.creationTime.getTime() - b.creationTime.getTime()
      } else if (a.creationTime) {
        return -1 // Put files with date first
      } else if (b.creationTime) {
        return 1
      }
      // If both are null, sort alphabetically by filename as fallback
      return a.file.localeCompare(b.file)
    })

    const outputFileName = `group_${groupIndex}.mov`
    const finalOutputDir = path.join(os.homedir(), 'storage', 'downloads')

    try {
      if (!(await exists(finalOutputDir))) {
        throw new Error(
          `Output directory does not exist: ${finalOutputDir}. Please create it first.`
        )
      }

      if (groupFiles.length === 1) {
        const { file } = groupFiles[0]
        const sourcePath = path.join(dirPath, file)
        const finalPath = await getUniquePath(finalOutputDir, outputFileName)

        console.log(
          `Group ${groupIndex} has only one video. Moving directly...`
        )
        await safeMove(sourcePath, finalPath)
        console.log(`Moved single video to ${finalPath}`)
      } else {
        let concatContent = ''
        for (const { file } of groupFiles) {
          // Escape single quotes in filenames for ffmpeg concat demuxer
          // The correct syntax for escaping a single quote in a single-quoted string in ffmpeg is:
          // replace ' with '\''
          const escapedFileName = file.replace(/'/g, "'\\''")

          // Since the concat file is in a subdirectory (concat_groups),
          // we need to step back one directory to reference the video files
          concatContent += `file '../${escapedFileName}'\n`
        }

        const concatFilePath = path.join(
          concatGroupsDir,
          `group_${groupIndex}.txt`
        )
        const localOutputPath = path.join(concatGroupsDir, outputFileName)

        await fs.writeFile(concatFilePath, concatContent, 'utf8')
        console.log(
          `Created group ${groupIndex} concat file with ${groupFiles.length} files. (ID: ${propsId})`
        )

        console.log(`Concatenating group ${groupIndex}...`)
        await runCommand('ffmpeg', [
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          concatFilePath,
          '-c',
          'copy',
          '-y',
          localOutputPath
        ])

        const finalPath = await getUniquePath(finalOutputDir, outputFileName)
        await safeMove(localOutputPath, finalPath)
        console.log(`Moved concatenated video to ${finalPath}`)

        // Cleanup
        console.log(`Cleaning up group ${groupIndex} source files...`)
        for (const { file } of groupFiles) {
          await fs.unlink(path.join(dirPath, file)).catch(err => {
            console.error(`Error deleting ${file}:`, err)
          })
        }
        await fs.unlink(concatFilePath).catch(() => {})
      }
    } catch (err) {
      console.error(`Error processing group ${groupIndex}:`, err)
    }

    groupIndex++
  }

  // Cleanup concat_groups dir if empty
  try {
    const remaining = await fs.readdir(concatGroupsDir)
    if (remaining.length === 0) {
      await fs.rmdir(concatGroupsDir)
    }
  } catch {}

  // Cleanup main dir if empty
  await fs.rmdir(dirPath).catch(() => {})
}

main().catch(console.error)
