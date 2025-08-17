// deno bundle questionable-host/upload-download.ts | terser --compress --mangle --module > questionable-host/upload-download.bundle.js

import { Md5 } from 'https://deno.land/std@0.95.0/hash/md5.ts'
import { encodeToString } from 'https://deno.land/std@0.95.0/encoding/hex.ts'

class HttpError extends Error {
  name = this.constructor.name

  static async from (response: Response): Promise<HttpError> {
    return new HttpError(
      `HTTP error ${response.status} for ${response.url}. ${await response
        .text()
        .catch(() => 'Could not get response text.')}`
    )
  }
}

/** Maximum size of an asset on Scratch in bytes = 10 MB */
export const MAX_SIZE = 10 * 1000 * 1000

/**
 * The size of the header, in bytes, at the start of each inode-like chunk.
 */
const INODE_HEADER_SIZE = 15

/** Length of a hash in bytes */
const HASH_SIZE = 16

/**
 * The size of the header, in bytes, at the start of each linked-list chunk.
 *
 * It consists of:
 * - 16 bytes for the MD5 hash of the next chunk
 * - 8 bytes representing an u64 of the total file size (excluding the unlinked,
 *   prior chunks)
 */
const LINKED_HEADER_SIZE = HASH_SIZE + 8

/**
 * Size of each chunk of the file to be uploaded to Scratch. This excludes the
 * 24-byte header.
 */
const CHUNK_SIZE = MAX_SIZE - LINKED_HEADER_SIZE

/**
 * Scratch's asset server host.
 */
const SERVER = 'https://assets.scratch.mit.edu/'

export type UploadFileResult = {
  hashBytes: ArrayBuffer
  hash: string
  url: string
  promise: Promise<void>
}

/**
 * Upload a file directly to Scratch's asset servers, without any additional
 * metadata.
 *
 * This means the Blob must conform with the 10MB limit, and for some file
 * types, Scratch may enforce that the file is well-formed.
 */
function uploadFile (
  buffer: ArrayBuffer,
  scratchSessionsId?: string,
  extension = 'wav'
): UploadFileResult {
  const md5 = new Md5().update(buffer)
  // NOTE: .digest() is not pure and calling it multiple times changes the
  // hash
  const hashBytes = md5.digest()
  const hash = encodeToString(new Uint8Array(hashBytes))

  const url = SERVER + hash + '.' + extension

  return {
    hashBytes,
    hash,
    url,
    promise: fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: scratchSessionsId
        ? { cookie: `scratchsessionsid=${scratchSessionsId}` }
        : {},
      body: buffer
    }).then(response =>
      response.ok ? undefined : HttpError.from(response).then(Promise.reject)
    )
  }
}

/**
 * Upload a file to Scratch's asset servers, split into 10MB chunks. Returns the
 * md5 hash of the first chunk.
 *
 * @param scratchSessionsId is required if uploading outside the browser.
 * Specifying it in the browser won't do anything because you can't set the
 * cookie header in front-end JS.
 *
 * @param onProgress is a bit chopier than when downloading because the Fetch
 * API does not support progress events for uploading.
 *
 * NOTE: Scratch prohibits the bytes "<script"; if your file might contain it
 * (especially if it is an HTML file), then you probably should encode it
 * somehow before uploading it.
 */
export async function upload (
  file: ArrayBuffer,
  scratchSessionsId?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (file.byteLength <= MAX_SIZE) {
    onProgress?.(0)
    const { hash, promise } = uploadFile(file, scratchSessionsId, 'wav')
    await promise
    onProgress?.(1)
    return `${hash}.`
  }

  let chunkCount = Math.ceil(file.byteLength / CHUNK_SIZE)
  const potentialMainChunkStorage =
    CHUNK_SIZE - (INODE_HEADER_SIZE + (chunkCount - 1) * HASH_SIZE)
  let offset = 0
  if (potentialMainChunkStorage <= file.byteLength % CHUNK_SIZE) {
    // We can save a chunk by storing it in the main chunk
    chunkCount--
    offset = potentialMainChunkStorage
  } else {
    // Might as well try storing as much data in the main chunk as we can
    offset = CHUNK_SIZE - (INODE_HEADER_SIZE + chunkCount * HASH_SIZE)
  }

  let loaded = 0
  const parts = Array.from({ length: chunkCount }, (_, i) => {
    const { hashBytes, promise } = uploadFile(
      file.slice(offset + i * CHUNK_SIZE, offset + (i + 1) * CHUNK_SIZE),
      scratchSessionsId,
      'wav'
    )
    return {
      hashBytes,
      promise: promise.then(() => {
        loaded++
        onProgress?.(loaded / (chunkCount + 1))
      })
    }
  })

  const main = new Uint8Array(
    INODE_HEADER_SIZE + chunkCount * HASH_SIZE + offset
  )
  const temp = new Uint8Array(12)
  const view = new DataView(temp.buffer)
  view.setBigUint64(0, BigInt(file.byteLength))
  view.setUint32(8, chunkCount)
  main.set(temp.slice(1, 8), 0)
  main.set(temp.slice(9, 12), 6)
  for (const [i, { hashBytes }] of parts.entries()) {
    main.set(new Uint8Array(hashBytes), INODE_HEADER_SIZE + i * HASH_SIZE)
  }
  main.set(
    new Uint8Array(file, 0, offset),
    INODE_HEADER_SIZE + chunkCount * HASH_SIZE
  )

  const { hash, promise } = uploadFile(main, scratchSessionsId, 'wav')
  await promise
  loaded++
  onProgress?.(loaded / (chunkCount + 1))

  await Promise.all(parts.map(({ promise }) => promise))
  return `i${hash}`
}

type InodePart = {
  promise: Promise<Uint8Array[]>
  bytesLoaded: number
}

/**
 * Download a file from Scratch's asset servers given the md5 hash of the first
 * chunk.
 *
 * @param onProgress is given a value between 0 and 1.
 */
export async function downloadInode (
  hash: string,
  onProgress?: (percent: number, totalBytes?: number) => void,
  type?: string
): Promise<Blob> {
  onProgress?.(0)

  const response = await fetch(`${SERVER}internalapi/asset/${hash}.wav/get/`)
  if (!response.ok) {
    throw await HttpError.from(response)
  }
  if (!response.body) {
    throw new Error('No response body')
  }

  const parts: InodePart[] = []
  const mainParts: Uint8Array[] = []
  let mainBytesLoaded = 0
  const updateProgress = () => {
    if (!onProgress) {
      return
    }
    const bytesLoaded =
      mainBytesLoaded + parts.reduce((cum, curr) => cum + curr.bytesLoaded, 0)
    onProgress(bytesLoaded / fileSize, fileSize)
  }
  const fetchPart = async (hash: string, part: { bytesLoaded: number }) => {
    const parts: Uint8Array[] = []
    const response = await fetch(`${SERVER}internalapi/asset/${hash}.wav/get/`)
    if (!response.ok) {
      throw await HttpError.from(response)
    }
    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    while (true) {
      const result = await reader.read()
      if (result.done) break
      parts.push(result.value)
      part.bytesLoaded += result.value.length
      updateProgress()
    }
    return parts
  }
  const handleHash = (hashBytes: Uint8Array) => {
    const part = { bytesLoaded: 0 }
    parts.push(
      Object.assign(part, {
        promise: fetchPart(encodeToString(hashBytes), part)
      })
    )
  }

  const header = new Uint8Array(INODE_HEADER_SIZE)
  let headerBytesRead = 0
  let fileSize = 0
  let hashesLeft = 0

  let unfinishedHash: Uint8Array | null = null
  const reader = response.body.getReader()
  while (true) {
    const result = await reader.read()
    if (result.done) break

    let byteIndex = 0
    if (headerBytesRead < INODE_HEADER_SIZE) {
      byteIndex = Math.min(
        result.value.length,
        INODE_HEADER_SIZE - headerBytesRead
      )
      header.set(result.value.slice(0, byteIndex), headerBytesRead)
      headerBytesRead += byteIndex
      if (headerBytesRead >= INODE_HEADER_SIZE) {
        const temp = new Uint8Array(12)
        temp.set(header.slice(0, 6), 2)
        temp.set(header.slice(6, 9), 9)
        const view = new DataView(temp.buffer)
        fileSize = Number(view.getBigUint64(0))
        hashesLeft = view.getUint32(8)
      }
    }
    if (headerBytesRead < INODE_HEADER_SIZE) {
      // still need to read more header
      continue
    }

    if (unfinishedHash) {
      const hashBytes = new Uint8Array(HASH_SIZE)
      hashBytes.set(unfinishedHash)
      const moreBytes = HASH_SIZE - unfinishedHash.length
      hashBytes.set(
        result.value.slice(byteIndex, byteIndex + moreBytes),
        unfinishedHash.length
      )
      const filled = unfinishedHash.length + result.value.length - byteIndex
      if (filled < HASH_SIZE) {
        unfinishedHash = unfinishedHash.slice(0, filled)
        updateProgress()
        continue
      } else {
        handleHash(hashBytes)
        byteIndex += moreBytes
        hashesLeft--
        unfinishedHash = null
      }
    }
    while (hashesLeft > 0 && byteIndex + HASH_SIZE <= result.value.length) {
      handleHash(
        new Uint8Array(result.value.slice(byteIndex, byteIndex + HASH_SIZE))
      )
      byteIndex += HASH_SIZE
      hashesLeft--
    }
    if (hashesLeft > 0) {
      unfinishedHash = result.value.slice(byteIndex)
      updateProgress()
      continue
    }

    mainParts.push(result.value.slice(byteIndex))
    mainBytesLoaded += result.value.length - byteIndex
    updateProgress()
  }

  return new Blob(
    [
      ...mainParts,
      ...(await Promise.all(parts.map(({ promise }) => promise))).flat()
    ],
    { type }
  )
}

/**
 * Download a file from Scratch's asset servers given the md5 hash of the first
 * chunk.
 *
 * @param onProgress is given a value between 0 and 1.
 */
export async function downloadLinkedList (
  hash: string,
  onProgress?: (percent: number, totalBytes?: number) => void,
  type?: string
): Promise<Blob> {
  onProgress?.(0)

  const parts = []
  let byteCount = 0
  let totalBytes: number | undefined
  let nextHash: string | null = hash
  while (nextHash) {
    const response = await fetch(
      `${SERVER}internalapi/asset/${nextHash}.wav/get/`
    )
    if (!response.ok) {
      throw await HttpError.from(response)
    }
    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const header = new Uint8Array(LINKED_HEADER_SIZE)
    let headerPos = 0
    while (true) {
      const result = await reader.read()
      if (result.done) break

      let bytes = result.value

      // Copy bytes into the header
      if (headerPos < header.length) {
        const relativeHeaderEnd = header.length - headerPos
        header.set(bytes.slice(0, relativeHeaderEnd), headerPos)
        headerPos += bytes.length
        if (headerPos >= HASH_SIZE) {
          nextHash = encodeToString(header.slice(0, HASH_SIZE))
        }
        if (headerPos >= header.length) {
          const view = new DataView(header.buffer)
          const bytesLeft = Number(view.getBigUint64(HASH_SIZE))
          // If this is the first chunk, then the bytes left should be the total
          // size of the file
          if (!totalBytes) {
            totalBytes = bytesLeft
          }
          // Determine whether this is the last chunk
          if (bytesLeft <= CHUNK_SIZE) {
            nextHash = null
          }
        }
        if (headerPos > header.length) {
          // Set `bytes` to the non-header bytes
          bytes = bytes.slice(relativeHeaderEnd)
        } else {
          continue
        }
      }

      parts.push(bytes)
      byteCount += bytes.length

      if (onProgress && totalBytes) {
        onProgress(byteCount / totalBytes, totalBytes)
      }
    }
  }

  return new Blob(parts, { type })
}

/**
 * Download a file uploaded using the old userscript,
 * https://github.com/SheepTester/hello-world/blob/master/userscripts/skracxteamgxenanto.user.js
 *
 * @param onProgress is given a value between 0 and 1.
 */
export async function downloadConcat (
  hashes: string[],
  onProgress?: (percent: number, totalCount: number) => void,
  type?: string
): Promise<Blob> {
  const parts = []
  let i = 0
  for (const hash of hashes) {
    onProgress?.(i / hashes.length, hashes.length)

    const response = await fetch(`${SERVER}internalapi/asset/${hash}.wav/get/`)
    if (!response.ok) {
      throw await HttpError.from(response)
    }
    if (!response.body) {
      throw new Error('No response body')
    }

    const contentLength = response.headers.get('Content-Length')
    if (contentLength === null) {
      throw new Error("Content-Length header wasn't given")
    }
    const responseSize = +contentLength
    const reader = response.body.getReader()
    let loaded = 0
    while (true) {
      const result = await reader.read()
      if (result.done) break

      parts.push(result.value)

      if (onProgress) {
        loaded += result.value.length
        onProgress((i + loaded / responseSize) / hashes.length, hashes.length)
      }
    }
    i++
  }
  onProgress?.(1, hashes.length)
  return new Blob(parts, { type })
}

if (import.meta.main) {
  if (Deno.args.length !== 1) {
    console.log(
      'Usage: SCRATCHSESSIONSID=<scratchsessionsid> deno run questionable-host/upload-download.ts <file>'
    )
    Deno.exit(1)
  }
  const scratchSessionsId = Deno.env.get('SCRATCHSESSIONSID')
  if (!scratchSessionsId) {
    console.log(
      'The SCRATCHSESSIONSID environment variable should be set to your `scratchsessionsid` cookie.'
    )
    Deno.exit(1)
  }
  const file = await Deno.readFile(Deno.args[0])
  const { url, promise } = uploadFile(
    file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
    scratchSessionsId,
    Deno.args[0].split('.').at(-1)
  )
  await promise
  console.log(url)
}
