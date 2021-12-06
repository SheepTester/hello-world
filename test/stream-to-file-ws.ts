// deno run --allow-all test/stream-to-file-ws.ts

// Allows me to stream a file onto my file system from a devtools console.

import { serve } from 'https://deno.land/std@0.117.0/http/server.ts'
import { ensureDir } from 'https://deno.land/std@0.117.0/fs/ensure_dir.ts'
import { writeAll } from 'https://deno.land/std@0.117.0/streams/conversion.ts'

const encoder = new TextEncoder()

await ensureDir('ignored')

function websocketToStream (
  ws: WebSocket
): ReadableStream<string | ArrayBuffer> {
  return new ReadableStream({
    start (controller) {
      ws.addEventListener('message', ({ data }) => {
        if (typeof data === 'string' || data instanceof ArrayBuffer) {
          controller.enqueue(data)
        } else {
          throw new TypeError('Expected a Uint8Array or a string.')
        }
      })
      ws.addEventListener('close', () => {
        controller.close()
      })
    }
  })
}

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`)
await serve(
  async request => {
    const [, path = null] =
      new URL(request.url).pathname.match(/^\/([\w.-]+)$/) ?? []
    if (!path) {
      return new Response(String.raw`The path must match /^\/([\w.-]+)$/.`, {
        status: 404,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }
    try {
      const { socket, response } = Deno.upgradeWebSocket(request)
      socket.addEventListener('open', async () => {
        // Overwrite existing file
        await Deno.writeFile(`./ignored/${path}`, new Uint8Array())
        const file = await Deno.open(`./ignored/${path}`, {
          append: true
        })
        for await (const message of websocketToStream(socket)) {
          // file.write does not write all bytes >_<
          if (message instanceof ArrayBuffer) {
            await writeAll(file, new Uint8Array(message))
          } else {
            await writeAll(file, encoder.encode(message))
          }
        }
        file.close()
      })
      // response.headers.append('Access-Control-Allow-Origin', '*')
      return response
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message === "Invalid Header: 'upgrade' header must be 'websocket'"
      ) {
        return new Response(
          'You may only open WebSocket connections with me.',
          {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        )
      }
      throw error
    }
  },
  { addr: ':8080' }
)
