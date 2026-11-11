// Service Worker für S.D.L.W. – wird von scripts/build.mjs erzeugt, bitte nicht von Hand bearbeiten.
// Speichert die Seite auf dem Gerät, damit sie auch ohne Internet startet.
// Mit Internet kommt die Seite immer frisch vom Server (nach höchstens 4 Sekunden Warten die gespeicherte).
const CACHE = "sdlw-1.8.0-ff9e8af717";
const FILES = ["./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("sdlw-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") e.respondWith(page(req));
  else e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});

async function page(req) {
  const saved = () => caches.match("./index.html");
  const net = fetch(req).then(res => (res.ok ? res : saved().then(s => s || res)));
  const slow = new Promise(r => setTimeout(r, 4000)).then(saved);
  try {
    const first = await Promise.race([net, slow]);
    return first || await net;
  } catch {
    return (await saved()) || Response.error();
  }
}
