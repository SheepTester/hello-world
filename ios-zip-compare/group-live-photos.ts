import * as fs from 'fs/promises'
import * as path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

async function getMediaProperties(filePath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'stream=codec_type,codec_name,profile,width,height,pix_fmt,color_space,color_transfer,color_primaries,sample_rate,channels,r_frame_rate',
      '-of',
      'json',
      filePath
    ])
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
            stream.color_primaries || '',
            stream.r_frame_rate || ''
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

    return `${videoProps}::${audioProps}`
  } catch (err) {
    console.error(`Error probing file ${filePath}:`, err)
    return 'error'
  }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    console.error('Usage: npx tsx group-live-photos.ts <path_to_videos_dir>')
    process.exit(1)
  }

  const dirPath = args[0]
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
    process.exit(0)
  }

  console.log(`Found ${files.length} video files. Extracting properties...`)

  const fileGroups = new Map<string, string[]>()

  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    const propsId = await getMediaProperties(fullPath)

    if (propsId === 'error') {
      console.log(`Skipping file ${file} due to probe error.`)
      continue
    }

    if (!fileGroups.has(propsId)) {
      fileGroups.set(propsId, [])
    }
    fileGroups.get(propsId)!.push(file)
  }

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
    let concatContent = ''

    for (const file of groupFiles) {
      // Escape single quotes in filenames for ffmpeg concat demuxer
      // The correct syntax for escaping a single quote in a single-quoted string in ffmpeg is:
      // replace ' with '\''
      const escapedFileName = file.replace(/'/g, "'\\''")

      // Since the concat file is in a subdirectory (concat_groups),
      // we need to step back one directory to reference the video files
      concatContent += `file '../${escapedFileName}'\n`
    }

    const concatFilePath = path.join(concatGroupsDir, `group_${groupIndex}.txt`)
    try {
      await fs.writeFile(concatFilePath, concatContent, 'utf8')
      console.log(
        `Created group ${groupIndex} concat file with ${groupFiles.length} files. (ID: ${propsId})`
      )
    } catch (err) {
      console.error(`Error writing ${concatFilePath}:`, err)
    }

    groupIndex++
  }
}

main().catch(console.error)
