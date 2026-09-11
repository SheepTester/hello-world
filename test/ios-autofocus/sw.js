// v1

const prefixPromise = fetch('prefix.txt').then(r => r.text())
const dataPromise = fetch('data.json').then(r => r.json())
const context =
  '\n    <p>\n      context: ios safari keeps autofocusing my input for\n      <a href="https://sheeptester.github.io/javascripts/totp.html">totp</a>\n    '

self.addEventListener('fetch', e => {
  const k = new URL(e.request.url).searchParams.get('k')
  if (k) {
    e.respondWith(
      Promise.all([dataPromise, prefixPromise]).then(async ([data, prefix]) => {
        if (data[k]) {
          return new Response(
            data[k].replace('{CONTEXT}', context).replace('{PREFIX}', prefix),
            {
              headers: { 'content-type': 'text/html' }
            }
          )
        } else {
          return new Response(
            prefix + `<p><code>${k}</code> not found. <a href='?'>back</a></p>`,
            {
              headers: { 'content-type': 'text/html' },
              status: 404
            }
          )
        }
      })
    )
  }
})

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))
