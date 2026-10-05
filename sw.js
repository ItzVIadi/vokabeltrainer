// Offline-Cache: App-Dateien werden beim ersten Laden gespeichert. Version erhöhen, wenn sich Dateien ändern.
const CACHE = "vokabel-b3f2d9e4";
const FILES = ["./", "index.html", "style.css", "app.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Netz zuerst (immer aktuell), bei fehlendem Internet aus dem Cache
self.addEventListener("fetch", e => {
  // Nur eigene Dateien cachen – keine Google-/Drive-Antworten (enthalten Nutzerdaten, dürfen offline nicht veraltet zurückkommen)
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match("index.html"))));
});
