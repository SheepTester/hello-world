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
export const MAX_SIZE = 10 * 1000 * 1000 - 1

/**
 * The size of the header, in bytes, at the start of each chunk.
 *
 * It consists of:
 * - 16 bytes for the MD5 hash of the next chunk
 * - 8 bytes representing an u64 of the total file size (excluding the unlinked,
 *   prior chunks)
 */
const HEADER_SIZE = 24

/**
 * Size of each chunk of the file to be uploaded to Scratch. This excludes the
 * 24-byte header.
 */
const CHUNK_SIZE = MAX_SIZE - 24

/**
 * Scratch's asset server host.
 */
const SERVER = 'https://assets.scratch.mit.edu/'

export type UploadFileResult = {
  hashBytes: ArrayBuffer
  hash: string
  url: string
}

/**
 * Upload a file directly to Scratch's asset servers, without any additional
 * metadata.
 *
 * This means the Blob must conform with the 10MB limit, and for some file
 * types, Scratch may enforce that the file is well-formed.
 */
export async function uploadFile (
  buffer: ArrayBuffer,
  scratchSessionsId?: string,
  extension = 'wav'
): Promise<UploadFileResult> {
  const md5 = new Md5().update(buffer)
  // NOTE: .digest() is not pure and calling it multiple times changes the
  // hash
  const hashBytes = md5.digest()
  const hash = encodeToString(new Uint8Array(hashBytes))

  const url = SERVER + hash + '.' + extension
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: scratchSessionsId
      ? { cookie: `scratchsessionsid=${scratchSessionsId}` }
      : {},
    body: buffer
  })

  if (!response.ok) {
    throw await HttpError.from(response)
  }

  return { hashBytes, hash, url }
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
  file: Blob,
  scratchSessionsId?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (file.size <= MAX_SIZE) {
    onProgress?.(0)
    const { hash } = await uploadFile(
      await file.arrayBuffer(),
      scratchSessionsId,
      'wav'
    )
    onProgress?.(1)
    return `${hash}.`
  }

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  // The last chunk's hash will just be zeroes
  let nextChunkHash = new ArrayBuffer(16)
  // Start from end of chunk backwards because the chunks form a linked list
  for (let i = totalChunks - 1; i >= 0; i--) {
    onProgress?.((totalChunks - 1 - i) / totalChunks)

    const byteIndex = i * CHUNK_SIZE

    // A u64 containing the number of bytes starting from this chunk
    // A DataView is required to make it reliably big-endian
    const bytesLeft = new DataView(new ArrayBuffer(8))
    bytesLeft.setBigUint64(0, BigInt(file.size - byteIndex))

    // Chunk data
    const blob = new Blob([
      // md5 hash of the next chunk
      nextChunkHash,
      bytesLeft,
      // Chunk data
      file.slice(byteIndex, byteIndex + CHUNK_SIZE)
    ])
    nextChunkHash = (
      await uploadFile(await blob.arrayBuffer(), scratchSessionsId, 'wav')
    ).hashBytes
  }

  onProgress?.(1)

  return encodeToString(new Uint8Array(nextChunkHash))
}

/**
 * Download a file from Scratch's asset servers given the md5 hash of the first
 * chunk.
 *
 * @param onProgress is given a value between 0 and 1.
 */
export async function download (
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
    const header = new Uint8Array(HEADER_SIZE)
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
        if (headerPos >= 16) {
          nextHash = encodeToString(header.slice(0, 16))
        }
        if (headerPos >= header.length) {
          const view = new DataView(header.buffer)
          const bytesLeft = Number(view.getBigUint64(16))
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
export async function downloadOld (
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
  const { url } = await uploadFile(
    file.buffer,
    scratchSessionsId,
    Deno.args[0].split('.').at(-1)
  )
  console.log(url)
}
