// Baut aus src/entdeckerheft.html (Quelldatei, gleichzeitig die Vorlage für das claude.ai-Artifact):
//   index.html             eigenständige Seite zum lokalen Öffnen und für den Webserver
//   manifest.webmanifest   App-Beschreibung für die Progressive Web App (Name, Farben, Symbole)
//   sw.js                  Service Worker: speichert die Seite auf dem Gerät, damit sie offline startet
// Die App-Symbole in icons/ entstehen einmalig mit scripts/make-icons.mjs.
//
// Aufruf: node scripts/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SKELETON_STYLE = `:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
img{max-width:100%}
[hidden]{display:none!important}`;

// --- Progressive Web App -------------------------------------------------------------
// Alle Adressen sind relativ, damit die App in der Hauptadresse und in einem Unterordner funktioniert.
const PWA_HEAD = `<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#F6F7FA" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14161F" media="(prefers-color-scheme: dark)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="S.D.L.W.">`;
// Service Worker nur über https (oder localhost) anmelden – beim Öffnen als Datei (file://) passiert nichts.
const PWA_BODY = `<script>
if ("serviceWorker" in navigator && (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
</script>`;

export const ICONS = ["icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];

export function manifest() {
  return JSON.stringify({
    id: "./",
    name: "S.D.L.W. – Super Duper Lern Webseite",
    short_name: "S.D.L.W.",
    description: "Lernseite für die 5. Klasse: Deutsch, Kunst, Erdkunde, Musik, Lerntipps und Lernspiele mit Gucki.",
    lang: "de",
    dir: "ltr",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: "#F6F7FA",
    theme_color: "#F6F7FA",
    categories: ["education", "kids"],
    icons: [
      { src: ICONS[0], sizes: "192x192", type: "image/png", purpose: "any" },
      { src: ICONS[1], sizes: "512x512", type: "image/png", purpose: "any" },
      { src: ICONS[2], sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }, null, 2) + "\n";
}

function version() {
  const m = readFileSync(join(root, "CHANGELOG.md"), "utf8").match(/^## \[(\d+\.\d+\.\d+)\]/m);
  return m ? m[1] : "0.0.0";
}

// Der Name des Speichers enthält Version und Prüfsumme aller Dateien. Ändert sich etwas, ändert sich sw.js,
// der Browser installiert den neuen Service Worker und holt die neuen Dateien.
export function serviceWorker(html = build(), man = manifest()) {
  const h = createHash("sha256").update(html).update(man);
  for (const f of ICONS) h.update(readFileSync(join(root, f)));
  const cache = `sdlw-${version()}-${h.digest("hex").slice(0, 10)}`;
  const files = ["./index.html", "./manifest.webmanifest", ...ICONS.map(f => "./" + f)];
  return `// Service Worker für S.D.L.W. – wird von scripts/build.mjs erzeugt, bitte nicht von Hand bearbeiten.
// Speichert die Seite auf dem Gerät, damit sie auch ohne Internet startet.
// Mit Internet kommt die Seite immer frisch vom Server (nach höchstens 4 Sekunden Warten die gespeicherte).
const CACHE = ${JSON.stringify(cache)};
const FILES = ${JSON.stringify(files)};

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
`;
}

export function build() {
  const src = readFileSync(join(root, "src/entdeckerheft.html"), "utf8");
  const cut = src.indexOf("</style>") + "</style>".length;
  const head = src
    .slice(0, cut)
    .replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
    .trim();
  const body = src.slice(cut).trim();
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${PWA_HEAD}
<style>
${SKELETON_STYLE}
</style>
${head}
</head>
<body>
${body}
${PWA_BODY}
</body>
</html>
`;
}

// Alle erzeugten Dateien: Pfad → Inhalt
export function buildAll() {
  const html = build(), man = manifest();
  return { "index.html": html, "manifest.webmanifest": man, "sw.js": serviceWorker(html, man) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [f, text] of Object.entries(buildAll())) writeFileSync(join(root, f), text);
  console.log("index.html, manifest.webmanifest und sw.js wurden aus src/entdeckerheft.html gebaut.");
}
