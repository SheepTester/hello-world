import * as fs from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export async function computeHash (filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath)
  const hashSum = crypto.createHash('sha256')
  hashSum.update(fileBuffer)
  return hashSum.digest('hex')
}

export async function exists (filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function getUniquePath (
  dir: string,
  fileName: string
): Promise<string> {
  let fullPath = path.join(dir, fileName)
  if (!(await exists(fullPath))) {
    return fullPath
  }

  const ext = path.extname(fileName)
  const name = path.basename(fileName, ext)
  let counter = 1

  while (await exists(fullPath)) {
    fullPath = path.join(dir, `${name}_${counter}${ext}`)
    counter++
  }

  return fullPath
}

export async function safeMove (
  sourcePath: string,
  destPath: string
): Promise<void> {
  await fs.rename(sourcePath, destPath).catch(async err => {
    if (err.code === 'EXDEV') {
      await fs.copyFile(sourcePath, destPath)
      await fs.unlink(sourcePath)
    } else {
      throw err
    }
  })
}

export async function getContainerDuration (filePath: string): Promise<number> {
  const { stdout } = await execFileAsync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'json',
      filePath
    ],
    { maxBuffer: 10 * 1024 * 1024 }
  )
  const data = JSON.parse(stdout)
  const dur = parseFloat(data.format?.duration || '0')
  return isNaN(dur) ? 0 : dur
}
