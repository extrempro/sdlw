// Service Worker für S.D.L.W. – wird von scripts/build.mjs erzeugt, bitte nicht von Hand bearbeiten.
// Speichert die Seite auf dem Gerät, damit sie auch ohne Internet startet.
// Mit Internet kommt die Seite immer frisch vom Server (nach höchstens 4 Sekunden Warten die gespeicherte).
const CACHE = "sdlw-1.16.1-1db71f37db";
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

// Nur die Startadresse (/ oder /index.html) darf aus dem Speicher kommen. Weiterleitungen und Antworten des Servers
// wie 404 werden durchgereicht; die gespeicherte Seite gibt es nur ohne Netz, bei Serverfehlern (5xx) oder nach 4 s Warten.
async function page(req) {
  const path = new URL(req.url).pathname, start = path.endsWith("/") || path.endsWith("/index.html");
  const saved = () => caches.match("./index.html");
  const net = fetch(req).then(res =>
    res.type === "opaqueredirect" || res.status < 500 || !start ? res : saved().then(s => s || res));
  if (!start) return net;
  const slow = new Promise(r => setTimeout(r, 4000)).then(saved);
  try {
    const first = await Promise.race([net, slow]);
    return first || await net;
  } catch {
    return (await saved()) || Response.error();
  }
}
// Notschalter: Soll die App auf allen Geräten abgeschaltet werden, sw.js durch eine Datei ersetzen, die nur
// „self.addEventListener('activate', () => self.registration.unregister())“ enthält (siehe docs/sicherheit.md).
