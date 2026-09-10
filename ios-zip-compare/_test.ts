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

    // Clean outputs for sub-tests
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.rm(livePhotoVideosDir, { recursive: true, force: true })

    // Test request one: error if given directory is empty when remaining-files.txt is absent
    const emptyDir = path.join(tmpDir, 'emptyDir')
    await fs.mkdir(emptyDir, { recursive: true })

    await fs.rm(remainingFilesPath, { force: true })
    let emptyDirErrorThrown = false
    try {
      await execFileAsync('node', ['index.ts', emptyDir, dir2])
    } catch (err: any) {
      emptyDirErrorThrown = true
      if (!err.stderr?.includes('Directory is empty')) {
        throw new Error(`Expected 'Directory is empty' error, got: ${err.stderr}`)
      }
    }
    if (!emptyDirErrorThrown) {
      throw new Error('Expected error when passing an empty directory with no remaining-files.txt')
    }

    // Test request two: no live-photo-videos directory created if no videos are put in it
    const photoOnly1 = path.join(tmpDir, 'photoOnly1')
    const photoOnly2 = path.join(tmpDir, 'photoOnly2')
    await fs.mkdir(photoOnly1, { recursive: true })
    await fs.mkdir(photoOnly2, { recursive: true })
    const imgData = Buffer.alloc(100, 'i')
    await fs.writeFile(path.join(photoOnly1, 'pic.jpg'), imgData)
    await fs.writeFile(path.join(photoOnly2, 'pic.jpg'), imgData)

    await execFileAsync('node', ['index.ts', photoOnly1, photoOnly2])
    const liveDirExists = await fs.access(livePhotoVideosDir).then(() => true).catch(() => false)
    if (liveDirExists) {
      throw new Error('live-photo-videos directory should not exist when no videos are processed')
    }

    // Test relaxed requirement: remaining-files.txt exists and live-photo-videos directory does NOT exist
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.rm(livePhotoVideosDir, { recursive: true, force: true })
    const remDir1 = path.join(tmpDir, 'remDir1')
    const remDir2 = path.join(tmpDir, 'remDir2')
    await fs.mkdir(remDir1, { recursive: true })
    await fs.mkdir(remDir2, { recursive: true })
    await fs.writeFile(path.join(remDir1, 'test.jpg'), Buffer.alloc(100, 'x'))
    await fs.writeFile(path.join(remDir2, 'test.jpg'), Buffer.alloc(200, 'y'))

    // Create remaining-files.txt with manual action 'l'
    await fs.writeFile(outDir, '') // dummy touch outDir first via mkdir
    await fs.rm(outDir, { force: true })
    await fs.mkdir(outDir, { recursive: true })
    await fs.writeFile(remainingFilesPath, 'l test.jpg (modified: remDir1=100 (s), remDir2=200 (L), diff=100)\n')

    // Running index.ts should succeed without requiring live-photo-videos directory to exist
    await execFileAsync('node', ['index.ts', remDir1, remDir2])

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
