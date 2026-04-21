import * as fs from 'fs/promises'
import { createReadStream } from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import * as os from 'os'

// CLI Arguments
const args = process.argv.slice(2)
if (args.length !== 2) {
  console.error('Usage: node index.ts <path_to_dir_1> <path_to_dir_2>')
  process.exit(1)
}

const dirPath1 = args[0]
const dirPath2 = args[1]

interface Entry {
  fileName: string
  fullPath: string
  size: number
}

// Helpers
function normalizeFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  const base = fileName.slice(0, fileName.length - ext.length).toLowerCase()
  const imageExtensions = ['.heic', '.jpg', '.jpeg', '.png']
  if (imageExtensions.includes(ext)) {
    return base + '.__image__'
  }
  return base + ext
}

async function getDirEntries(
  dirPath: string,
  basePath: string = dirPath
): Promise<{ entries: Entry[] }> {
  const entries: Entry[] = []

  async function walk(currentPath: string) {
    const files = await fs.readdir(currentPath, { withFileTypes: true })
    for (const file of files) {
      const fullPath = path.join(currentPath, file.name)
      if (file.isDirectory()) {
        await walk(fullPath)
      } else if (file.isFile()) {
        const stats = await fs.stat(fullPath)
        const fileName = path.relative(basePath, fullPath).replace(/\\/g, '/')
        entries.push({
          fileName,
          fullPath,
          size: stats.size
        })
      }
    }
  }

  await walk(dirPath)
  return { entries }
}

const remainingFilesPath = path.join(process.cwd(), 'remaining-files.txt')
const outDir = path.join(os.homedir(), 'storage', 'downloads', 'identical')
const livePhotoVideosDir = path.join(process.cwd(), 'live-photo-videos')

if (await exists(outDir)) {
  console.error(`Error: Output directory already exists: ${outDir}`)
  process.exit(1)
}
if (await exists(livePhotoVideosDir)) {
  console.error(
    `Error: Live Photo videos directory already exists: ${livePhotoVideosDir}`
  )
  process.exit(1)
}

await fs.mkdir(outDir, { recursive: true })
await fs.mkdir(livePhotoVideosDir, { recursive: true })

// Handle pre-existing remaining-files.txt
const remainingFilesContent = await fs
  .readFile(remainingFilesPath, 'utf8')
  .catch((err: any) => {
    if (err.code === 'ENOENT') return null
    throw err
  })

if (remainingFilesContent) {
  console.log(
    `Found existing ${remainingFilesPath}. Processing manual actions...`
  )
  const lines = remainingFilesContent
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  const actions = lines
    .map(line => {
      if (line.startsWith('#')) return null // skip comments
      const action = line[0]
      // Use match to grab everything between the action prefix and the " (modified:" or " (only in"
      const match = line.match(/^.\s+(.+?)\s+\((?:modified:|only in)/)
      if (!match) return null
      return { action, fileName: match[1] }
    })
    .filter(Boolean)

  const actionable = actions.filter(
    a => a?.action === 'l' || a?.action === 's' || a?.action === 'b'
  )

  if (actionable.length > 0) {
    console.log(`Found ${actionable.length} files to process.`)
    const { entries: entries1 } = await getDirEntries(dirPath1)
    const { entries: entries2 } = await getDirEntries(dirPath2)

    for (const item of actionable) {
      if (!item) continue
      const itemNorm = normalizeFileName(item.fileName)
      const e1 = entries1.find(e => normalizeFileName(e.fileName) === itemNorm)
      const e2 = entries2.find(e => normalizeFileName(e.fileName) === itemNorm)

      const actualName = e1?.fileName || e2?.fileName || item.fileName
      const baseName = path.basename(
        actualName,
        path.extname(actualName)
      )
      const ext = path.extname(item.fileName)

      let larger = e1
      let smaller = e2

      if (e1 && e2) {
        if (e2.size > e1.size) {
          larger = e2
          smaller = e1
        }
      } else {
        // If it only exists in one dir, we just use that one regardless of 'u' or 'f'
        larger = e1 || e2
        smaller = e1 || e2
      }

      if (!larger) {
        console.log(
          `Warning: File ${item.fileName} not found in either directory.`
        )
        continue
      }

      if (item.action === 'l') {
        const outPath = await getUniquePath(outDir, `${baseName}${ext}`)
        await safeMove(larger.fullPath, outPath)
        console.log(`Moved larger file: ${outPath}`)
        if (e1 && e2 && smaller) {
          await fs.unlink(smaller.fullPath).catch(() => {})
        }
      } else if (item.action === 's') {
        if (smaller) {
          const outPath = await getUniquePath(outDir, `${baseName}${ext}`)
          await safeMove(smaller.fullPath, outPath)
          console.log(`Moved smaller file: ${outPath}`)
          if (e1 && e2 && larger) {
            await fs.unlink(larger.fullPath).catch(() => {})
          }
        }
      } else if (item.action === 'b') {
        if (e1 && e2 && smaller) {
          const unmodOut = await getUniquePath(
            outDir,
            `${baseName}_larger${ext}`
          )
          await safeMove(larger.fullPath, unmodOut)
          console.log(`Moved larger: ${unmodOut}`)

          const savedOut = await getUniquePath(
            outDir,
            `${baseName}_smaller${ext}`
          )
          await safeMove(smaller.fullPath, savedOut)
          console.log(`Moved smaller: ${savedOut}`)
        } else {
          const outPath = await getUniquePath(outDir, `${baseName}${ext}`)
          await safeMove(larger.fullPath, outPath)
          console.log(
            `Moved single file (only exists in one directory): ${outPath}`
          )
        }
      }
    }

    // Rewrite file removing processed items, keeping skips (n) and comments
    const newLines = lines.filter(
      line => line.startsWith('n ') || line.startsWith('#')
    )
    // If there are only comments left, just remove the file
    const onlyComments = newLines.every(line => line.startsWith('#'))

    if (!onlyComments) {
      await fs.writeFile(remainingFilesPath, newLines.join('\n') + '\n')
      console.log(`Updated ${remainingFilesPath} with skipped files.`)
    } else {
      await fs.unlink(remainingFilesPath)
      console.log(`Removed empty ${remainingFilesPath}.`)
    }

    process.exit(0)
  }
}

console.log(`Parsing ${dirPath1}...`)
const { entries: entries1 } = await getDirEntries(dirPath1)
console.log(`Parsed ${entries1.length} files from ${dirPath1}.`)

console.log(`Parsing ${dirPath2}...`)
const { entries: entries2 } = await getDirEntries(dirPath2)
console.log(`Parsed ${entries2.length} files from ${dirPath2}.`)

console.log('Building size maps...')
const sizeMap1 = new Map()
for (const e of entries1) {
  if (!sizeMap1.has(e.size)) sizeMap1.set(e.size, [])
  sizeMap1.get(e.size).push(e)
}

const sizeMap2 = new Map()
for (const e of entries2) {
  if (!sizeMap2.has(e.size)) sizeMap2.set(e.size, [])
  sizeMap2.get(e.size).push(e)
}

const candidateSizes = new Set()
for (const size of sizeMap1.keys()) {
  if (sizeMap2.has(size)) candidateSizes.add(size)
}

console.log(
  `Found ${candidateSizes.size} unique file sizes present in both directories.`
)
console.log('Computing hashes for candidate files...')

const identicalFiles: { entry1: Entry; entry2: Entry; hash: string }[] = [] // Array of { entry1, entry2 }

for (const size of candidateSizes) {
  const group1 = sizeMap1.get(size)
  const group2 = sizeMap2.get(size)

  const hashes1 = new Map()
  for (const e of group1) {
    const h = await computeHash(e.fullPath)
    if (!hashes1.has(h)) hashes1.set(h, [])
    hashes1.get(h).push(e)
  }

  for (const e of group2) {
    const h = await computeHash(e.fullPath)
    if (hashes1.has(h)) {
      // Match found
      identicalFiles.push({
        entry1: hashes1.get(h)[0],
        entry2: e,
        hash: h
      })
    }
  }
}

console.log(`Found ${identicalFiles.length} identical files.`)

console.log('Processing identical files and handling Live Photo edge cases...')

const ignoredFiles = new Set()
const extractedCount = 0

// Process identical files to find Live Photo .mov files to ignore
const identicalNormalizedImageNames = new Set()
for (const pair of identicalFiles) {
  const ext = path.extname(pair.entry1.fileName).toLowerCase()
  const imageExtensions = ['.heic', '.jpg', '.jpeg', '.png']
  if (imageExtensions.includes(ext)) {
    const normalized = normalizeFileName(pair.entry1.fileName)
    identicalNormalizedImageNames.add(normalized)
  }
}

// Helper to check if a file is a sister .mov
function isSisterMov(fileName: string) {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === '.mov') {
    const normalizedImage = normalizeFileName(fileName).replace(
      /\.mov$/i,
      '.__image__'
    )
    if (identicalNormalizedImageNames.has(normalizedImage)) {
      return true
    }
  }
  return false
}

// Mark sister .mov files as ignored
for (const e of entries1) {
  if (isSisterMov(e.fileName)) ignoredFiles.add(e.fileName)
}
for (const e of entries2) {
  if (isSisterMov(e.fileName)) ignoredFiles.add(e.fileName)
}

let extractCount = 0
let sisterMovCount = 0
for (const pair of identicalFiles) {
  const fileName = path.basename(pair.entry1.fileName)
  if (isSisterMov(pair.entry1.fileName)) {
    const outPath = await getUniquePath(livePhotoVideosDir, fileName)
    await safeMove(pair.entry1.fullPath, outPath)
    await fs.unlink(pair.entry2.fullPath).catch(() => {})
    sisterMovCount++
  } else {
    const outPath = await getUniquePath(outDir, fileName)
    await safeMove(pair.entry1.fullPath, outPath)
    await fs.unlink(pair.entry2.fullPath).catch(() => {})
    extractCount++
  }
}

console.log(`Moved ${extractCount} identical files to ${outDir}`)

const extractedNames1 = new Set(identicalFiles.map(p => p.entry1.fileName))
const extractedNames2 = new Set(identicalFiles.map(p => p.entry2.fileName))

// Process non-identical files to move sister .mov files
for (const e of entries1) {
  if (!extractedNames1.has(e.fileName) && ignoredFiles.has(e.fileName)) {
    const fileName = path.basename(e.fileName)
    const outPath = await getUniquePath(livePhotoVideosDir, fileName)
    await safeMove(e.fullPath, outPath)
    sisterMovCount++
    extractedNames1.add(e.fileName) // Mark as processed
  }
}

for (const e of entries2) {
  if (!extractedNames2.has(e.fileName) && ignoredFiles.has(e.fileName)) {
    const fileName = path.basename(e.fileName)
    const outPath = await getUniquePath(livePhotoVideosDir, fileName)
    await safeMove(e.fullPath, outPath)
    sisterMovCount++
    extractedNames2.add(e.fileName) // Mark as processed
  }
}

console.log(
  `Moved ${sisterMovCount} Live Photo sister .mov files to ${livePhotoVideosDir}`
)

console.log('\n--- Remaining Diff ---')

const remaining1 = entries1.filter(
  e => !extractedNames1.has(e.fileName) && !ignoredFiles.has(e.fileName)
)
const remaining2 = entries2.filter(
  e => !extractedNames2.has(e.fileName) && !ignoredFiles.has(e.fileName)
)

const remainingLines: string[] = []

const header = [
  '# Categorize non-identical files using the following prefixes:',
  '# - n: no action (skip) - leave in this diff status file',
  '# - l: move larger file (and delete the smaller)',
  '# - s: move smaller file (and delete the larger)',
  '# - b: move both (suffixed by _larger and _smaller)',
  '#',
  '# After editing and saving, run the script again with the same arguments.',
  ''
]

const remainingMap = new Map<
  string,
  { name1?: string; size1?: number; name2?: string; size2?: number }
>()

remaining1.forEach(e => {
  const norm = normalizeFileName(e.fileName)
  remainingMap.set(norm, { name1: e.fileName, size1: e.size })
})

remaining2.forEach(e => {
  const norm = normalizeFileName(e.fileName)
  if (remainingMap.has(norm)) {
    const entry = remainingMap.get(norm)!
    entry.name2 = e.fileName
    entry.size2 = e.size
  } else {
    remainingMap.set(norm, { name2: e.fileName, size2: e.size })
  }
})

console.log(`Files remaining for manual review:`)
if (remainingMap.size === 0) console.log('  (None)')

const dirName1 = path.basename(dirPath1)
const dirName2 = path.basename(dirPath2)

for (const [norm, data] of remainingMap.entries()) {
  let info = ''
  const fileName = data.name1 || data.name2!
  if (data.size1 !== undefined && data.size2 !== undefined) {
    const diff = Math.abs(data.size1 - data.size2)
    info = `(modified: ${dirName1}=${data.size1}, ${dirName2}=${data.size2}, diff=${diff})`
    if (data.name1 !== data.name2) {
      info += ` [names: ${data.name1} vs ${data.name2}]`
    }
  } else if (data.size1 !== undefined) {
    info = `(only in ${dirPath1}: size=${data.size1})`
  } else if (data.size2 !== undefined) {
    info = `(only in ${dirPath2}: size=${data.size2})`
  }
  console.log(`  ${fileName} ${info}`)
  remainingLines.push(`n ${fileName} ${info}`)
}

if (remainingLines.length > 0) {
  const finalLines = header.concat(remainingLines)
  await fs.writeFile(remainingFilesPath, finalLines.join('\n') + '\n')
  console.log(
    `\nWrote remaining diff to ${remainingFilesPath} for manual review.`
  )
}

console.log(
  '\nNote: .aae files are Apple sidecar files for non-destructive edits. If they are in the remaining diff, edits may not have been exported or applied differently.'
)

// Helper to check file existence synchronously is not in fs/promises.
// We can use a simple async check here.
async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function getUniquePath(dir: string, fileName: string): Promise<string> {
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

async function safeMove(srcPath: string, destPath: string): Promise<void> {
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

function computeHash(fullPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(fullPath)
    const hash = crypto.createHash('sha256')
    readStream.on('data', chunk => hash.update(chunk))
    readStream.on('end', () => resolve(hash.digest('hex')))
    readStream.on('error', reject)
  })
}
