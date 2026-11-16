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
const elfLittleEndian = header.getUint8(5) === 1
if (header.getUint16(0x3a, elfLittleEndian) !== 0x40) {
  throw new Error('section header size is not 0x40')
}
const sectionHeaderOffset = Number(header.getBigUint64(0x28, elfLittleEndian))
const sectionEntryCount = header.getUint16(0x3c, elfLittleEndian)
const sectionNameEntryIndex = header.getUint16(0x3e, elfLittleEndian)

const sectionHeader = await read(
  sectionHeaderOffset,
  sectionHeaderOffset + sectionEntryCount * 0x40
)
const sectionNameSectionOffset = Number(
  sectionHeader.getBigUint64(
    sectionNameEntryIndex * 0x40 + 0x18,
    elfLittleEndian
  )
)
const sectionNameSectionSize = Number(
  sectionHeader.getBigUint64(
    sectionNameEntryIndex * 0x40 + 0x20,
    elfLittleEndian
  )
)
const sectionNames = toBytes(
  await read(
    sectionNameSectionOffset,
    sectionNameSectionOffset + sectionNameSectionSize
  )
)

let bunIndex: number | undefined
for (let i = 0; i < sectionEntryCount; i++) {
  const nameOffset = sectionHeader.getUint32(i * 0x40, elfLittleEndian)
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

// bun seems to ignore the first 8 bytes
// https://github.com/oven-sh/bun/blob/bd9ec3891323d23ef6696301a8bf8ded0c4ddcc0/src/standalone_graph/StandaloneModuleGraph.rs#L657
const BUN_OFFSET = 8
const bunOffset =
  Number(sectionHeader.getBigUint64(bunIndex * 0x40 + 0x18, elfLittleEndian)) +
  BUN_OFFSET
const bunSize =
  Number(sectionHeader.getBigUint64(bunIndex * 0x40 + 0x20, elfLittleEndian)) -
  BUN_OFFSET
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
// I assume everything is little endian here
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

// https://github.com/oven-sh/bun/blob/main/src/ast/loader.rs
const LOADER = {
  Jsx: 0,
  Js: 1,
  Ts: 2,
  Tsx: 3,
  Css: 4,
  File: 5,
  Json: 6,
  Jsonc: 7,
  Toml: 8,
  Wasm: 9,
  Napi: 10,
  Base64: 11,
  Dataurl: 12,
  Text: 13,
  Bunsh: 14,
  Sqlite: 15,
  SqliteEmbedded: 16,
  Html: 17,
  Yaml: 18,
  Json5: 19,
  Md: 20,
  Xml: 21
}
const loaderReverse = new Map(
  Object.entries(LOADER)
    .values()
    .map(([name, byte]) => [byte, name])
)

const EMPTY = new Uint8Array()
async function readString (
  view: DataView,
  structOffset: number
): Promise<Uint8Array> {
  const length = view.getUint32(structOffset + 4, true)
  if (length === 0) {
    return EMPTY
  }
  const offset = view.getUint32(structOffset, true)
  return toBytes(await read(bunOffset + offset, bunOffset + offset + length))
}

const moduleCount = modulesPtrSize / COMPILED_MODULE_GRAPH_FILE_SIZE
for (let i = 0; i < moduleCount; i++) {
  const module = await read(
    bunOffset + modulesPtrOffset + i * COMPILED_MODULE_GRAPH_FILE_SIZE,
    bunOffset + modulesPtrOffset + (i + 1) * COMPILED_MODULE_GRAPH_FILE_SIZE
  )
  const name = decoder.decode(await readString(module, 0))
  const contents = await readString(module, 8)
  const bytecode_origin_path = decoder.decode(await readString(module, 8 * 5))
  const loader = loaderReverse.get(module.getUint8(8 * 6 + 1))
  if (bytecode_origin_path && bytecode_origin_path !== name) {
    console.error('why different?', { name, bytecode_origin_path })
  }
  if (!name.startsWith('/$bunfs/root/')) {
    console.error('weird name', name)
  }
  if (name.replace('/$bunfs/root/', '').includes('/')) {
    console.error('subdir', name)
  }
  // console.log({ loader, name })
}
