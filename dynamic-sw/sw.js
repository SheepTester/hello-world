const CACHE_NAME = "test-cache-v01", // change cache name to force update
urlsToCache = [];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(response => new Response(`<!DOCTYPE html>
<html>
  <head>
    <title>muahahaha</title>
  </head>
  <body>
    <button id="off">unregister service worker</button>
    <script>
const off = document.getElementById("off");
off.addEventListener("click", e => {
  navigator.serviceWorker.getRegistrations().then(regis => regis.map(regis => regis.unregister()));
}, false);
    </script>
  </body>
</html>`)));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.map(cache => CACHE_NAME !== cache ? caches.delete(cache) : undefined))));
});
