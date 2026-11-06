/* Range Rat playtest service worker, build 2026-11-06-4999b036-5543db3d */
const CACHE = 'range-rat-2026-11-06-4999b036-5543db3d';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isApp = /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (isApp) { // network first (3 s), fall back to the cached page offline
    // only a good page (200, same origin, no redirect) replaces the cached one: a 404 / 5xx, a captive portal's redirect
    // or an opaque response is shown as it is, and the offline page stays the last good build
    e.respondWith(Promise.race([fetch(req), new Promise((_, rej) => setTimeout(rej, 3000))])
      .then((res) => { if (res.ok && res.type === 'basic' && !res.redirected) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('index.html', copy)); } return res; })
      .catch(() => caches.match('index.html').then((hit) => hit || fetch(req))));
    return;
  }
  // another page next to the game (site/privacy*.html, opened as a page or in the game's policy sheet): network first,
  // its own cached copy offline. Never stored as index.html (it used to be: opening the policy could replace the offline copy of the game).
  if (req.mode === 'navigate') {
    e.respondWith(Promise.race([fetch(req), new Promise((_, rej) => setTimeout(rej, 3000))])
      .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || Response.error())));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
