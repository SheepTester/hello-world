import { open } from 'node:fs/promises'

const decoder = new TextDecoder()

const file = await open(
  'node_modules/@anthropic-ai/claude-code-linux-arm64-musl/claude'
)

async function read (start: number, end: number): Promise<DataView> {
  const buffer = new ArrayBuffer(end - start)
  // gemini suggested this
  const { bytesRead } = await file.read(
    new DataView(buffer),
    0,
    end - start,
    start
  )
  return new DataView(buffer, 0, bytesRead)
}

function toBytes (view: DataView): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
}

// https://en.wikipedia.org/wiki/Executable_and_Linkable_Format
const header = await read(0, 64)
if (toBytes(header).slice(0, 4).toHex() !== '7f454c46') {
  throw new Error('not ELF')
}
if (header.getUint8(4) !== 2) {
  throw new Error('not 64-bit')
}
if (header.getUint8(4) !== 2) {
  throw new Error('not big endian')
}
if (header.getUint16(0x3a, true) !== 0x40) {
  throw new Error('section header size is not 0x40')
}
const sectionHeaderOffset = Number(header.getBigUint64(0x28, true))
const sectionEntryCount = header.getUint16(0x3c, true)
const sectionNameEntryIndex = header.getUint16(0x3e, true)

const sectionHeader = await read(
  sectionHeaderOffset,
  sectionHeaderOffset + sectionEntryCount * 0x40
)
const sectionNameSectionOffset = Number(
  sectionHeader.getBigUint64(sectionNameEntryIndex * 0x40 + 0x18, true)
)
const sectionNameSectionSize = Number(
  sectionHeader.getBigUint64(sectionNameEntryIndex * 0x40 + 0x20, true)
)
const sectionNames = toBytes(
  await read(
    sectionNameSectionOffset,
    sectionNameSectionOffset + sectionNameSectionSize
  )
)

let bunIndex: number | undefined
for (let i = 0; i < sectionEntryCount; i++) {
  const nameOffset = sectionHeader.getUint32(i * 0x40, true)
  let end = nameOffset
  while (sectionNames[end]) {
    end++
  }
  const sectionName = decoder.decode(sectionNames.subarray(nameOffset, end))
  if (sectionName === '.bun') {
    bunIndex = i
  }
}
if (bunIndex === undefined) {
  throw new Error("Couldn't find section .bun")
}

const bunOffset = Number(
  sectionHeader.getBigUint64(bunIndex * 0x40 + 0x18, true)
)
const bunSize = Number(sectionHeader.getBigUint64(bunIndex * 0x40 + 0x20, true))
console.log({ bunOffset, bunSize })
