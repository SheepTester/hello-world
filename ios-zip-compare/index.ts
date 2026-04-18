import * as fsp from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'
import yauzl from 'yauzl'
import os from 'os'

// CLI Arguments
const args = process.argv.slice(2)
if (args.length !== 2) {
  console.error('Usage: node index.ts <path_to_zip_1> <path_to_zip_2>')
  process.exit(1)
}

const zipPath1 = args[0]
const zipPath2 = args[1]

interface Entry {
  fileName: string
  uncompressedSize: number
  zipfile: yauzl.ZipFile
  entry: yauzl.Entry
}

// Helpers
function getZipEntries(
  zipFilePath: string
): Promise<{ entries: Entry[]; zipfile: yauzl.ZipFile }> {
  return new Promise((resolve, reject) => {
    const entries: Entry[] = []
    yauzl.open(
      zipFilePath,
      { lazyEntries: true, autoClose: false },
      (err, zipfile) => {
        if (err) return reject(err)

        zipfile.on('entry', (entry: yauzl.Entry) => {
          if (/\/$/.test(entry.fileName)) {
            // directory
            zipfile.readEntry()
          } else {
            entries.push({
              fileName: entry.fileName,
              uncompressedSize: entry.uncompressedSize,
              zipfile,
              entry
            })
            zipfile.readEntry()
          }
        })

        zipfile.on('end', () => {
          resolve({ entries, zipfile })
        })

        zipfile.readEntry()
      }
    )
  })
}

const remainingFilesPath = path.join(process.cwd(), 'remaining-files.txt')
const outDir = path.join(os.homedir(), 'storage', 'downloads', 'identical')
await fsp.mkdir(outDir, { recursive: true })

// Handle pre-existing remaining-files.txt
const remainingFilesContent = await fsp
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
    const { entries: entries1, zipfile: zipfile1 } =
      await getZipEntries(zipPath1)
    const { entries: entries2, zipfile: zipfile2 } =
      await getZipEntries(zipPath2)

    for (const item of actionable) {
      if (!item) continue
      const e1 = entries1.find(e => e.fileName === item.fileName)
      const e2 = entries2.find(e => e.fileName === item.fileName)

      const baseName = path.basename(item.fileName, path.extname(item.fileName))
      const ext = path.extname(item.fileName)

      let larger = e1
      let smaller = e2

      if (e1 && e2) {
        if (e2.uncompressedSize > e1.uncompressedSize) {
          larger = e2
          smaller = e1
        }
      } else {
        // If it only exists in one zip, we just use that one regardless of 'u' or 'f'
        larger = e1 || e2
        smaller = e1 || e2
      }

      if (!larger) {
        console.log(`Warning: File ${item.fileName} not found in either zip.`)
        continue
      }

      if (item.action === 'l') {
        const outPath = await getUniquePath(outDir, `${baseName}${ext}`)
        await extractFile(larger.zipfile, larger.entry, outPath)
        console.log(`Extracted larger file: ${outPath}`)
      } else if (item.action === 's') {
        if (smaller) {
          const outPath = await getUniquePath(outDir, `${baseName}${ext}`)
          await extractFile(smaller.zipfile, smaller.entry, outPath)
          console.log(`Extracted smaller file: ${outPath}`)
        }
      } else if (item.action === 'b') {
        if (e1 && e2 && smaller) {
          const unmodOut = await getUniquePath(
            outDir,
            `${baseName}_larger${ext}`
          )
          await extractFile(larger.zipfile, larger.entry, unmodOut)
          console.log(`Extracted larger: ${unmodOut}`)

          const savedOut = await getUniquePath(
            outDir,
            `${baseName}_smaller${ext}`
          )
          await extractFile(smaller.zipfile, smaller.entry, savedOut)
          console.log(`Extracted smaller: ${savedOut}`)
        } else {
          const outPath = await getUniquePath(outDir, `${baseName}${ext}`)
          await extractFile(larger.zipfile, larger.entry, outPath)
          console.log(
            `Extracted single file (only exists in one zip): ${outPath}`
          )
        }
      }
    }

    zipfile1.close()
    zipfile2.close()

    // Rewrite file removing processed items, keeping skips (n) and comments
    const newLines = lines.filter(
      line => line.startsWith('n ') || line.startsWith('#')
    )
    // If there are only comments left, just remove the file
    const onlyComments = newLines.every(line => line.startsWith('#'))

    if (!onlyComments) {
      await fsp.writeFile(remainingFilesPath, newLines.join('\n') + '\n')
      console.log(`Updated ${remainingFilesPath} with skipped files.`)
    } else {
      await fsp.unlink(remainingFilesPath)
      console.log(`Removed empty ${remainingFilesPath}.`)
    }

    process.exit(0)
  }
}

console.log(`Parsing ${zipPath1}...`)
const { entries: entries1, zipfile: zipfile1 } = await getZipEntries(zipPath1)
console.log(`Parsed ${entries1.length} files from ${zipPath1}.`)

console.log(`Parsing ${zipPath2}...`)
const { entries: entries2, zipfile: zipfile2 } = await getZipEntries(zipPath2)
console.log(`Parsed ${entries2.length} files from ${zipPath2}.`)

console.log('Building size maps...')
const sizeMap1 = new Map()
for (const e of entries1) {
  if (!sizeMap1.has(e.uncompressedSize)) sizeMap1.set(e.uncompressedSize, [])
  sizeMap1.get(e.uncompressedSize).push(e)
}

const sizeMap2 = new Map()
for (const e of entries2) {
  if (!sizeMap2.has(e.uncompressedSize)) sizeMap2.set(e.uncompressedSize, [])
  sizeMap2.get(e.uncompressedSize).push(e)
}

const candidateSizes = new Set()
for (const size of sizeMap1.keys()) {
  if (sizeMap2.has(size)) candidateSizes.add(size)
}

console.log(
  `Found ${candidateSizes.size} unique file sizes present in both zips.`
)
console.log('Computing hashes for candidate files...')

const identicalFiles: { entry1: Entry; entry2: Entry; hash: string }[] = [] // Array of { entry1, entry2 }

for (const size of candidateSizes) {
  const group1 = sizeMap1.get(size)
  const group2 = sizeMap2.get(size)

  const hashes1 = new Map()
  for (const e of group1) {
    const h = await computeHash(e.zipfile, e.entry)
    if (!hashes1.has(h)) hashes1.set(h, [])
    hashes1.get(h).push(e)
  }

  for (const e of group2) {
    const h = await computeHash(e.zipfile, e.entry)
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
const identicalBaseNames = new Set()
for (const pair of identicalFiles) {
  const ext = path.extname(pair.entry1.fileName).toLowerCase()
  if (ext === '.heic' || ext === '.jpg') {
    const base = path
      .basename(pair.entry1.fileName, path.extname(pair.entry1.fileName))
      .toLowerCase()
    identicalBaseNames.add(base)
  }
}

// Helper to check if a file is a sister .mov
function isSisterMov(entry: yauzl.Entry) {
  const ext = path.extname(entry.fileName).toLowerCase()
  if (ext === '.mov') {
    const base = path
      .basename(entry.fileName, path.extname(entry.fileName))
      .toLowerCase()
    if (identicalBaseNames.has(base)) {
      return true
    }
  }
  return false
}

// Mark sister .mov files as ignored
for (const e of entries1) {
  if (isSisterMov(e.entry)) ignoredFiles.add(e.entry.fileName)
}
for (const e of entries2) {
  if (isSisterMov(e.entry)) ignoredFiles.add(e.entry.fileName)
}

let extractCount = 0
for (const pair of identicalFiles) {
  const fileName = path.basename(pair.entry1.fileName)
  const outPath = await getUniquePath(outDir, fileName)
  await extractFile(pair.entry1.zipfile, pair.entry1.entry, outPath)
  extractCount++
}

console.log(`Extracted ${extractCount} identical files to ${outDir}`)
console.log(`Ignored ${ignoredFiles.size} Live Photo sister .mov files.`)

console.log('\n--- Remaining Diff ---')
const extractedNames1 = new Set(identicalFiles.map(p => p.entry1.fileName))
const extractedNames2 = new Set(identicalFiles.map(p => p.entry2.fileName))

const remaining1 = entries1.filter(
  e =>
    !extractedNames1.has(e.entry.fileName) &&
    !ignoredFiles.has(e.entry.fileName)
)
const remaining2 = entries2.filter(
  e =>
    !extractedNames2.has(e.entry.fileName) &&
    !ignoredFiles.has(e.entry.fileName)
)

const remainingLines: string[] = []

const header = [
  '# Categorize non-identical files using the following prefixes:',
  '# - n: no action (skip) - leave in this diff status file',
  '# - l: extract larger file',
  '# - s: extract smaller file',
  '# - b: extract both (suffixed by _larger and _smaller)',
  '#',
  '# After editing and saving, run the script again with the same arguments.',
  ''
]

const remainingMap = new Map<string, { size1?: number; size2?: number }>()

remaining1.forEach(e => {
  remainingMap.set(e.entry.fileName, { size1: e.uncompressedSize })
})

remaining2.forEach(e => {
  if (remainingMap.has(e.entry.fileName)) {
    remainingMap.get(e.entry.fileName)!.size2 = e.uncompressedSize
  } else {
    remainingMap.set(e.entry.fileName, { size2: e.uncompressedSize })
  }
})

console.log(`Files remaining for manual review:`)
if (remainingMap.size === 0) console.log('  (None)')

for (const [fileName, sizes] of remainingMap.entries()) {
  let info = ''
  if (sizes.size1 !== undefined && sizes.size2 !== undefined) {
    info = `(modified: size1=${sizes.size1}, size2=${sizes.size2})`
  } else if (sizes.size1 !== undefined) {
    info = `(only in ${zipPath1}: size=${sizes.size1})`
  } else if (sizes.size2 !== undefined) {
    info = `(only in ${zipPath2}: size=${sizes.size2})`
  }
  console.log(`  ${fileName} ${info}`)
  remainingLines.push(`n ${fileName} ${info}`)
}

if (remainingLines.length > 0) {
  const finalLines = header.concat(remainingLines)
  await fsp.writeFile(remainingFilesPath, finalLines.join('\n') + '\n')
  console.log(
    `\nWrote remaining diff to ${remainingFilesPath} for manual review.`
  )
}

console.log(
  '\nNote: .aae files are Apple sidecar files for non-destructive edits. If they are in the remaining diff, edits may not have been exported or applied differently.'
)

// Close zips
zipfile1.close()
zipfile2.close()

// Helper to check file existence synchronously is not in fs/promises.
// We can use a simple async check here.
async function exists(filePath: string): Promise<boolean> {
  try {
    await fsp.access(filePath)
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

function extractFile(
  zipfile: yauzl.ZipFile,
  entry: yauzl.Entry,
  outPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    zipfile.openReadStream(entry, (err, readStream) => {
      if (err) return reject(err)
      import('fs')
        .then(fs => {
          const writeStream = fs.createWriteStream(outPath)
          readStream.pipe(writeStream)
          writeStream.on('finish', resolve)
          writeStream.on('error', reject)
          readStream.on('error', reject)
        })
        .catch(reject)
    })
  })
}

function computeHash(
  zipfile: yauzl.ZipFile,
  entry: yauzl.Entry
): Promise<string> {
  return new Promise((resolve, reject) => {
    zipfile.openReadStream(entry, (err, readStream) => {
      if (err) return reject(err)
      const hash = crypto.createHash('sha256')
      readStream.on('data', chunk => hash.update(chunk))
      readStream.on('end', () => resolve(hash.digest('hex')))
      readStream.on('error', reject)
    })
  })
}
