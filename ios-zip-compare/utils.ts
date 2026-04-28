import * as fs from 'fs/promises'
import { createReadStream } from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

export async function computeHash(fullPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(fullPath)
    const hash = crypto.createHash('sha256')
    readStream.on('data', chunk => hash.update(chunk))
    readStream.on('end', () => resolve(hash.digest('hex')))
    readStream.on('error', reject)
  })
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function getUniquePath(
  dir: string,
  fileName: string
): Promise<string> {
  let outPath = path.join(dir, fileName)
  let counter = 1
  while (await exists(outPath)) {
    const ext = path.extname(fileName)
    const base = path.basename(fileName, ext)
    outPath = path.join(dir, `${base}_${counter}${ext}`)
    counter++
  }
  return outPath
}

export async function safeMove(
  srcPath: string,
  destPath: string
): Promise<void> {
  try {
    await fs.rename(srcPath, destPath)
  } catch (err: any) {
    if (err.code === 'EXDEV') {
      await fs.copyFile(srcPath, destPath)
      await fs.unlink(srcPath)
    } else {
      throw err
    }
  }
}
