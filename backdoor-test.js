// for orbiit/backdoor-sw-test/

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', e => {
  e.respondWith(() => {
    const url = new URL(e.request.url);
    if (url.host !== location.host) return fetch(e.request);
    switch (url.pathname) {
      case '/backdoor-sw-test/hello':
        return new Response(
          '<strong>hello</strong>',
          {headers: {'Content-Type': 'text/html'}}
        );
      case '/backdoor-sw-test/':
        return fetch(e.request)
          .then(({text, headers, status, statusText}) => text()
            .then(html => new Response(
              html.replace('hello', 'CHANGE'),
              {headers, status, statusText}
            )));
      default:
        return fetch(e.request);
    }
  });
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
