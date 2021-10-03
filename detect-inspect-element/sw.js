self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  console.log(e.request.url);
  if (url.pathname.endsWith('/test.js')) {
    e.respondWith(new Response(new Blob(['// lol'], { type: 'application/javascript' }), {
      headers: {
        SourceMap: './test.js.map'
      }
    }))
    return
  }
  if (url.pathname.endsWith('.js.map')) {
    console.log('😳')
  }
  e.respondWith(fetch(e.request))
})
