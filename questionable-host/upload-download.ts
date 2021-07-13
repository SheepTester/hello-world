// deno bundle upload-download.ts | terser --compress toplevel --mangle toplevel > upload-download.bundle.js

import { Md5 } from 'https://deno.land/std@0.95.0/hash/md5.ts'
import { encodeToString } from 'https://deno.land/std@0.95.0/encoding/hex.ts'

class HttpError extends Error {
  name = this.constructor.name

  static async from (response: Response): Promise<HttpError> {
    return new HttpError(
      `HTTP error ${response.status} for ${
        response.url
      }. ${await response.text().catch(() => 'Could not get response text.')}`
    )
  }
}

/** Maximum size of an asset on Scratch in bytes = 10 MB */
const MAX_SIZE = 10 * 1000 * 1000

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
 *
 * Decoding from base64 to discourage this file from being picked up by GitHub
 * search.
 */
const SERVER = atob('aHR0cHM6Ly9hc3NldHMuc2NyYXRjaC5taXQuZWR1Lw==')

/**
 * Upload a file to Scratch's asset servers. Returns the md5 hash of the first
 * chunk.
 *
 * `scratchSessionsId` is required if uploading outside the browser. Specifying
 * it in the browser won't do anything because you can't set the cookie header
 * in front-end JS.
 */
export async function upload (
  file: Blob,
  scratchSessionsId?: string
): Promise<string> {
  // The last chunk's hash will just be zeroes
  let nextChunkHash = new ArrayBuffer(16)
  // Start from end of chunk backwards because the chunks form a linked list
  for (let i = Math.ceil(file.size / CHUNK_SIZE) - 1; i >= 0; i--) {
    // A u64 containing the number of bytes starting from this chunk
    const bytesLeft = new DataView(new ArrayBuffer(8))
    bytesLeft.setBigUint64(0, BigInt(file.size - i))

    const byteIndex = i * CHUNK_SIZE
    // Chunk data
    const blob = new Blob([
      // md5 hash of the next chunk
      nextChunkHash,
      bytesLeft,
      // Chunk data
      file.slice(byteIndex, byteIndex + CHUNK_SIZE)
    ])

    const md5 = new Md5().update(await blob.arrayBuffer())
    // NOTE: .digest() is not pure and calling it multiple times changes the
    // hash
    nextChunkHash = md5.digest()
    const hash = encodeToString(new Uint8Array(nextChunkHash))

    const response = await fetch(SERVER + hash + '.wav', {
      method: 'POST',
      credentials: 'include',
      headers: scratchSessionsId
        ? {
            cookie: `scratchsessionsid=${scratchSessionsId}`
          }
        : {},
      body: blob
    })
    if (!response.ok) {
      throw await HttpError.from(response)
    }
  }
  return encodeToString(new Uint8Array(nextChunkHash))
}

/**
 * Download a file from Scratch's asset servers given the md5 hash of the first
 * chunk.
 *
 * `onProgress` is given a value between 0 and 1.
 */
export async function download (
  hash: string,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  if (onProgress) onProgress(0)

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

      const bytes = result.value
      parts.push(bytes)
      byteCount += bytes.length

      // Copy bytes into the header
      if (headerPos < header.length) {
        header.set(bytes.slice(0, header.length - headerPos), headerPos)
        headerPos += bytes.length
        if (headerPos >= 16) {
          nextHash = encodeToString(header.slice(0, 16))
        }
        if (headerPos >= header.length) {
          const view = new DataView(header.buffer)
          const bytesLeft = Number(view.getBigUint64(16))
          console.log(bytesLeft, header)

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
      }

      if (onProgress && totalBytes) {
        onProgress(byteCount / totalBytes)
      }
    }
  }

  if (onProgress) onProgress(1)

  return new Blob(parts)
}

/**
 * Download a file uploaded using the old userscript,
 * https://github.com/SheepTester/hello-world/blob/master/userscripts/skracxteamgxenanto.user.js
 *
 * `onProgress` is given a value between 0 and 1.
 */
export async function downloadOld (
  hashes: string[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const parts = []
  let i = 0
  for (const hash of hashes) {
    if (onProgress) onProgress(i / hashes.length)

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
        onProgress((i + loaded / responseSize) / hashes.length)
      }
    }
    i++
  }
  if (onProgress) onProgress(1)
  return new Blob(parts)
}
