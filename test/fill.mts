const [, , sizeStr] = process.argv
let size = +sizeStr
console.error(`Writing ${size} bytes to stdout`)

const CHUNK_SIZE = 1 << 10
const buffer = new ArrayBuffer(CHUNK_SIZE)

while (size > 0) {
  process.stdout.write(new Uint8Array(buffer, 0, Math.min(size, CHUNK_SIZE)))
  size -= CHUNK_SIZE
}
