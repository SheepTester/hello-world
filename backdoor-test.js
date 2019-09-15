// for orbiit/backdoor-sw-test/

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', e => {
  e.respondWith((async () => {
    const url = new URL(e.request.url);
    if (url.host !== location.host) return fetch(e.request);
    switch (url.pathname) {
      case '/backdoor-sw-test/hello':
        return new Response(
          '<strong>hello</strong>',
          {headers: {'Content-Type': 'text/html'}}
        );
      case '/backdoor-sw-test/x':
        return new Response(
          '<strong>test change</strong>',
          {headers: {'Content-Type': 'text/html'}}
        );
      case '/backdoor-sw-test/':
        return fetch(e.request)
          .then(res => res.text()
            .then(html => new Response(
              html.replace('hello', `<a href=x>CHANGE</a>`),
              {headers: res.headers, status: res.status, statusText: res.statusText}
            )));
      default:
        return fetch(e.request);
    }
  })().catch(err => fetch(e.request)));
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
