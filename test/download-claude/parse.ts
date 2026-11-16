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
const elfBigEndian = header.getUint8(4) === 2
if (header.getUint16(0x3a, elfBigEndian) !== 0x40) {
  throw new Error('section header size is not 0x40')
}
const sectionHeaderOffset = Number(header.getBigUint64(0x28, elfBigEndian))
const sectionEntryCount = header.getUint16(0x3c, elfBigEndian)
const sectionNameEntryIndex = header.getUint16(0x3e, elfBigEndian)

const sectionHeader = await read(
  sectionHeaderOffset,
  sectionHeaderOffset + sectionEntryCount * 0x40
)
const sectionNameSectionOffset = Number(
  sectionHeader.getBigUint64(sectionNameEntryIndex * 0x40 + 0x18, elfBigEndian)
)
const sectionNameSectionSize = Number(
  sectionHeader.getBigUint64(sectionNameEntryIndex * 0x40 + 0x20, elfBigEndian)
)
const sectionNames = toBytes(
  await read(
    sectionNameSectionOffset,
    sectionNameSectionOffset + sectionNameSectionSize
  )
)

let bunIndex: number | undefined
for (let i = 0; i < sectionEntryCount; i++) {
  const nameOffset = sectionHeader.getUint32(i * 0x40, elfBigEndian)
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
  sectionHeader.getBigUint64(bunIndex * 0x40 + 0x18, elfBigEndian)
)
const bunSize = Number(
  sectionHeader.getBigUint64(bunIndex * 0x40 + 0x20, elfBigEndian)
)
const TRAILER = '\n---- Bun! ----\n'
const bunTrailer = decoder.decode(
  toBytes(await read(bunOffset + bunSize - TRAILER.length, bunOffset + bunSize))
)
if (bunTrailer !== TRAILER) {
  throw new Error(`Saw "${bunTrailer}" instead of Bun trailer`)
}

// .bun payload parser:
// https://github.com/oven-sh/bun/blob/bd9ec3891323d23ef6696301a8bf8ded0c4ddcc0/src/standalone_graph/StandaloneModuleGraph.rs#L3540

// Right before the trailer at the end are the offsets:
// https://github.com/oven-sh/bun/blob/bd9ec3891323d23ef6696301a8bf8ded0c4ddcc0/src/standalone_graph/StandaloneModuleGraph.rs#L1143
// - byte_count: usize (8 bytes)
// - modules_ptr: u32 + u32 (8 bytes)
// - entry_point_id: u32 (4 bytes)
// - compile_exec_argv_ptr: u32 + u32 (8 bytes)
// - flags: u32 (4 bytes)
//   https://github.com/oven-sh/bun/blob/bd9ec3891323d23ef6696301a8bf8ded0c4ddcc0/src/standalone_graph/StandaloneModuleGraph.rs#L1154
const OFFSETS_SIZE = 8 + 8 + 4 + 8 + 4
const offsets = await read(
  bunOffset + bunSize - TRAILER.length - OFFSETS_SIZE,
  bunOffset + bunSize - TRAILER.length
)
// Apparently everything is still big endian ?
const modulesPtrOffset = offsets.getUint32(8, true)
const modulesPtrSize = offsets.getUint32(8 + 4, true)
const flags = offsets.getUint32(OFFSETS_SIZE - 4, true)

const FLAGS = {
  DISABLE_DEFAULT_ENV_FILES: 1 << 0,
  DISABLE_AUTOLOAD_BUNFIG: 1 << 1,
  DISABLE_AUTOLOAD_TSCONFIG: 1 << 2,
  DISABLE_AUTOLOAD_PACKAGE_JSON: 1 << 3,
  SOURCE_TEXT_CONTIGUOUS: 1 << 4,
  HAS_SOURCE_HASHES: 1 << 5,
  HAS_BUILTIN_BYTECODE: 1 << 6,
  HAS_BYTECODE_STRING_TABLE: 1 << 7,
  HAS_STARTUP_MODULE_COUNT: 1 << 8,
  HAS_MODULE_INFO_STRING_TABLE: 1 << 9,
  CROSS_COMPILED_BYTECODE: 1 << 10,
  HAS_PRELINKED_MODULE_GRAPH: 1 << 11,
  HAS_RUNTIME_OPTIONS: 1 << 12,
  HAS_LINKED_BYTECODE_PAYLOAD: 1 << 13,
  HAS_COMPILED_PROGRAM: 1 << 14
}
console.log(
  new Map(
    Map.groupBy(Object.entries(FLAGS), ([key, bit]) => !!(flags & bit))
      .entries()
      .map(([enabled, flags]) => [enabled, flags.map(([flag]) => flag)])
  )
)
// DISABLE_DEFAULT_ENV_FILES=1
// DISABLE_AUTOLOAD_BUNFIG=1
// DISABLE_AUTOLOAD_TSCONFIG=1
// DISABLE_AUTOLOAD_PACKAGE_JSON=1
// SOURCE_TEXT_CONTIGUOUS=1
// HAS_SOURCE_HASHES=1
// HAS_BUILTIN_BYTECODE=1
// HAS_BYTECODE_STRING_TABLE=1
// HAS_STARTUP_MODULE_COUNT=1
// HAS_MODULE_INFO_STRING_TABLE=1
// CROSS_COMPILED_BYTECODE=1
// HAS_PRELINKED_MODULE_GRAPH=1
// HAS_RUNTIME_OPTIONS=1
// HAS_LINKED_BYTECODE_PAYLOAD=1
// HAS_COMPILED_PROGRAM=0

// CompiledModuleGraphFile size:
// - name: u32 + u32 (8 bytes)
// - contents: u32 + u32 (8 bytes)
// - sourcemap: u32 + u32 (8 bytes)
// - bytecode: u32 + u32 (8 bytes)
// - module_info: u32 + u32 (8 bytes)
// - bytecode_origin_path: u32 + u32 (8 bytes)
// - encoding: u8 (1 byte) - latin 1 by default
// - loader: u8 (1 byte) - file format
// - module_format: u8 (1 byte)
// - side: u8 (1 byte) - server (default) / client
const COMPILED_MODULE_GRAPH_FILE_SIZE = 8 * 6 + 4

async function readString (
  view: DataView,
  structOffset: number
): Promise<string> {
  const length = view.getUint32(structOffset + 4, true)
  if (length === 0) {
    return ''
  }
  const offset = view.getUint32(structOffset, true)
  return decoder.decode(
    toBytes(await read(bunOffset + offset, bunOffset + offset + length))
  )
}

const moduleCount = modulesPtrSize / COMPILED_MODULE_GRAPH_FILE_SIZE
for (let i = 0; i < moduleCount; i++) {
  const module = await read(
    bunOffset + modulesPtrOffset + i * COMPILED_MODULE_GRAPH_FILE_SIZE,
    bunOffset + modulesPtrOffset + (i + 1) * COMPILED_MODULE_GRAPH_FILE_SIZE
  )
  console.log({
    name: await readString(module, 0),
    contents: await readString(module, 8),
    bytecode_origin_path: await readString(module, 8 * 5)
  })
  break
}

console.log({
  modulesPtrOffset,
  modulesPtrSize,
  moduleCount
})
