// deno bundle upload-download.ts | terser --compress toplevel --mangle toplevel > upload-download.bundle.js

import { Md5, Message } from 'https://deno.land/std@0.95.0/hash/md5.ts'

/**
 * MD5 hashes the given string or ArrayBuffer into a 32 character hexadecimal
 * string for Scratch.
 */
function md5 (message: Message): string {
  return new Md5().update(message).toString('hex')
}

/** Maximum size of an asset on Scratch in bytes = 10 MB */
const MAX_SIZE = 10 * 1000 * 1000

/** Scratch's asset server host */
const SERVER = 'https://assets.scratch.mit.edu/'

/**
 * Download a file uploaded using the old userscript,
 * https://github.com/SheepTester/hello-world/raw/master/userscripts/skracxteamgxenanto.user.js
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

    const response = await fetch(`${SERVER}/internalapi/asset/${hash}.wav/get/`)
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
