// deno run -A test/listener.ts test/adminbot.html

const server = Deno.listen({ port: 8080 })
console.log(`HTTP webserver running.  Access it at:  http://localhost:8080/`)

// Connections to the server will be yielded up as an async iterable.
for await (const conn of server) {
  // In order to not be blocking, we need to handle each connection individually
  // without awaiting the function
  serveHttp(conn)
}

async function serve (requestEvent: Deno.RequestEvent) {
  console.log(requestEvent.request.url)
  const root =
    Deno.args[0] && new URL(requestEvent.request.url).pathname === '/'

  // The native HTTP server uses the web standard `Request` and `Response`
  // objects.
  const body = root
    ? await Deno.readTextFile(Deno.args[0])
    : `Your user-agent is:\n\n${
        requestEvent.request.headers.get('user-agent') ?? 'Unknown'
      }`
  // The requestEvent's `.respondWith()` method is how we send the response
  // back to the client.
  requestEvent.respondWith(
    new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    })
  )
}

async function serveHttp (conn: Deno.Conn) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn)
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    serve(requestEvent)
  }
}
