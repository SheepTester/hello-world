// deno bundle upload-download.ts | terser --compress toplevel --mangle toplevel > upload-download.bundle.js

import { Md5 } from 'https://deno.land/std@0.95.0/hash/md5.ts'
import { encodeToString } from 'https://deno.land/std@0.95.0/encoding/hex.ts'

/** Maximum size of an asset on Scratch in bytes = 10 MB */
const MAX_SIZE = 10 * 1000 * 1000

/**
 * Size of each chunk of the file to be uploaded to Scratch.
 *
 * This excludes a 24-byte header, which consists of:
 * - 16 bytes for the MD5 hash of the next chunk
 * - 8 bytes representing an u64 of the total file size (excluding the unlinked,
 *   prior chunks)
 */
const CHUNK_SIZE = MAX_SIZE - 24

/** Scratch's asset server host */
const SERVER = 'https://assets.scratch.mit.edu/'

/**
 * Upload a file to Scratch's asset servers. Returns the md5 hash of the first
 * chunk.
 */
export async function upload (file: Blob): Promise<string> {
  // The last chunk's hash will just be zeroes
  let nextChunkHash = new ArrayBuffer(16)
  // Start from end of chunk backwards because the chunks form a linked list
  for (let i = Math.ceil(file.size / CHUNK_SIZE) - 1; i >= 0; i--) {
    const byteIndex = i * CHUNK_SIZE
    // Chunk data
    const blob = new Blob([
      // md5 hash of the next chunk
      nextChunkHash,
      // A u64 containing the number of bytes starting from this chunk
      new BigUint64Array([BigInt(file.size - i)]),
      // Chunk data
      file.slice(byteIndex, byteIndex + CHUNK_SIZE),
    ])

    const md5 = new Md5().update(await blob.arrayBuffer())
    const hash = md5.toString('hex')
    nextChunkHash = md5.digest()

    const response = await fetch(SERVER + hash + '.wav', {
      method: 'POST',
      credentials: 'include',
      body: blob
    })
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} for ${response.url}`)
    }
  }
  return encodeToString(new Uint8Array(nextChunkHash))
}

/**
 * Download a file uploaded using the old userscript,
 * https://github.com/SheepTester/hello-world/blob/master/userscripts/skracxteamgxenanto.user.js
 *
 * `onProgress` is given a value between 0 and 1.
 */
export async function downloadOld (
  hashes: string[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const parts = []
  let i = 0
  for (const hash of hashes) {
    if (onProgress) onProgress(i / hashes.length)

    const response = await fetch(`${SERVER}internalapi/asset/${hash}.wav/get/`)
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} for ${response.url}`)
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
