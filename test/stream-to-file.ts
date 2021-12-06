// deno run --allow-all test/stream-to-file.ts

// Allows me to stream a file onto my file system from a devtools console.

import { serve } from 'https://deno.land/std@0.117.0/http/server.ts'
import { ensureDir } from 'https://deno.land/std@0.117.0/fs/ensure_dir.ts'
import {
  copy,
  readerFromStreamReader
} from 'https://deno.land/std@0.117.0/streams/mod.ts'

await ensureDir('ignored')

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`)
await serve(
  async request => {
    if (request.method === 'POST') {
      const [, path = null] =
        new URL(request.url).pathname.match(/^\/([\w.]+)$/) ?? []
      if (path) {
        if (!request.body) {
          return new Response('I need a response body.', { status: 400 })
        }
        const file = await Deno.open(`./ignored/${path}`, {
          create: true,
          write: true
        })
        await copy(readerFromStreamReader(request.body.getReader()), file)
        file.close()
        return new Response(`Cool, thanks. I saved it to ignored/${path}.`, {
          status: 200
        })
      } else {
        return new Response(String.raw`The path must match /^\/([\w.]+)$/.`, {
          status: 404
        })
      }
    } else {
      return new Response('You must send a POST request.', { status: 405 })
    }
  },
  { addr: ':8080' }
)
