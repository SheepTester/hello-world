import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

async function runTest () {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ios-test-'))
  const dir1 = path.join(tmpDir, 'dir1')
  const dir2 = path.join(tmpDir, 'dir2')
  await fs.mkdir(dir1, { recursive: true })
  await fs.mkdir(dir2, { recursive: true })

  // Clean up any existing identical output or live-photo-videos in home or current directory
  const outDir = path.join(os.homedir(), 'storage', 'downloads', 'identical')
  const livePhotoVideosDir = path.join(process.cwd(), 'live-photo-videos')
  const remainingFilesPath = path.join(process.cwd(), 'remaining-files.txt')

  await fs.rm(outDir, { recursive: true, force: true })
  await fs.rm(livePhotoVideosDir, { recursive: true, force: true })
  await fs.rm(remainingFilesPath, { force: true })

  try {
    // Scenario:
    // 1. Photo 1: photo1.jpg in dir1 (1000 bytes) vs photo1.jpg in dir2 (1050 bytes) -> size diff is minor (< 20%).
    //    Also sister MOV video photo1.mov in dir1.
    //    Expected: photo1.mov moved to live-photo-videos/ even though photo1.jpg isn't byte-wise identical.
    //    photo1.jpg listed in remaining-files.txt with (L) and (s).

    const p1a = Buffer.alloc(1000, 'a')
    const p1b = Buffer.alloc(1050, 'b')
    await fs.writeFile(path.join(dir1, 'photo1.jpg'), p1a)
    await fs.writeFile(path.join(dir2, 'photo1.jpg'), p1b)

    const mov1 = Buffer.alloc(500, 'm')
    await fs.writeFile(path.join(dir1, 'photo1.mov'), mov1)

    // Run index.ts
    await execFileAsync('node', ['index.ts', dir1, dir2])

    // Verify sister MOV was moved to live-photo-videos/
    const liveFiles = await fs.readdir(livePhotoVideosDir)
    if (!liveFiles.includes('photo1.mov')) {
      throw new Error('Expected photo1.mov in live-photo-videos/')
    }

    // Verify remaining-files.txt contents
    const remainingContent = await fs.readFile(remainingFilesPath, 'utf8')
    console.log('remaining-files.txt content:\n', remainingContent)

    if (!remainingContent.includes('photo1.jpg')) {
      throw new Error('Expected photo1.jpg in remaining-files.txt')
    }
    // dir1=1000 (s), dir2=1050 (L)
    if (
      !remainingContent.includes('(s)') ||
      !remainingContent.includes('(L)')
    ) {
      throw new Error('Expected (s) and (L) indicators in remaining-files.txt')
    }

    console.log('All automated tests passed successfully!')
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.rm(livePhotoVideosDir, { recursive: true, force: true })
    await fs.rm(remainingFilesPath, { force: true })
  }
}

runTest().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
