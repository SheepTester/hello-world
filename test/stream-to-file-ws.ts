// deno run --allow-all test/stream-to-file-ws.ts

// Allows me to stream a file onto my file system from a devtools console.

import { serve } from 'https://deno.land/std@0.117.0/http/server.ts'
import { ensureDir } from 'https://deno.land/std@0.117.0/fs/ensure_dir.ts'

const encoder = new TextEncoder()

await ensureDir('ignored')

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`)
await serve(
  async request => {
    const [, path = null] =
      new URL(request.url).pathname.match(/^\/([\w.]+)$/) ?? []
    if (!path) {
      return new Response(String.raw`The path must match /^\/([\w.]+)$/.`, {
        status: 404
      })
    }
    try {
      const { socket, response } = Deno.upgradeWebSocket(request)
      // Overwrite existing file
      await Deno.writeFile(`./ignored/${path}`, new Uint8Array())
      const file = await Deno.open(`./ignored/${path}`, {
        append: true
      })
      socket.addEventListener('message', ({ data }) => {
        if (data instanceof ArrayBuffer) {
          file.write(new Uint8Array(data))
        } else if (typeof data === 'string') {
          file.write(encoder.encode(data))
        } else {
          console.error(data)
          throw new TypeError('Expected a Uint8Array.')
        }
      })
      socket.addEventListener('close', () => {
        file.close()
      })
      return response
    } catch {
      return new Response('You may only open WebSocket connections with me.', {
        status: 500
      })
    }
  },
  { addr: ':8080' }
)
