// Prüft, ob die Versionshinweise zusammenpassen:
//   1. Die neueste Version in CHANGELOG.md und in den Versionshinweisen der Webseite
//      (JSON-Block id="releaseData" in src/entdeckerheft.html) ist gleich – Nummer und Datum.
//   2. Die Versionen auf der Webseite sind absteigend sortiert und haben Einträge.
//   3. index.html, manifest.webmanifest und sw.js sind aktuell (entsprechen dem Build), die App-Symbole sind da.
//
// Aufrufe:
//   node scripts/check-release.mjs            → prüft alles (Exit-Code 1 bei Fehlern)
//   node scripts/check-release.mjs --version  → gibt nur die aktuelle Versionsnummer aus
//   node scripts/check-release.mjs --notes    → gibt die Release Notes der aktuellen Version (Markdown) aus
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { buildAll, ICONS, root } from "./build.mjs";

const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
const src = readFileSync(join(root, "src/entdeckerheft.html"), "utf8");

const HEAD_RE = /^## \[(\d+\.\d+\.\d+)\] [–-] (\d{4}-\d{2}-\d{2})\s*$/m;
const top = changelog.match(HEAD_RE);
if (!top) fail("In CHANGELOG.md fehlt eine Überschrift wie: ## [1.2.0] – 2026-11-08");
const [, version, date] = top;

const arg = process.argv[2];
if (arg === "--version") {
  console.log(version);
  process.exit(0);
}
if (arg === "--notes") {
  const start = top.index + top[0].length;
  const rest = changelog.slice(start);
  const next = rest.search(/^## \[/m);
  console.log((next === -1 ? rest : rest.slice(0, next)).trim());
  process.exit(0);
}

const errors = [];
const m = src.match(/<script type="application\/json" id="releaseData">([\s\S]*?)<\/script>/);
let rel = [], summaries = [];
if (!m) errors.push('In src/entdeckerheft.html fehlt der Block <script type="application/json" id="releaseData">.');
else {
  try {
    const data = JSON.parse(m[1]);
    if (!data || !Array.isArray(data.releases)) errors.push('releaseData muss ein Objekt {"releases":[…],"summaries":[…]} sein.');
    else { rel = data.releases; summaries = Array.isArray(data.summaries) ? data.summaries : []; }
  } catch (e) { errors.push("releaseData ist kein gültiges JSON: " + e.message); }
}
// Je zehn Versionen (vom ältesten an gezählt) bilden einen Block. Jeder Block außer dem neuesten
// braucht eine Zusammenfassung {from, to, title, items} in releaseData.summaries.
if (rel.length) {
  const asc = rel.slice().reverse();
  const blocks = [];
  for (let i = 0; i < asc.length; i += 10) blocks.push(asc.slice(i, i + 10));
  blocks.pop();
  blocks.forEach(b => {
    const from = b[0].version, to = b[b.length - 1].version;
    const sum = summaries.find(x => x.from === from && x.to === to);
    if (!sum) errors.push(`Zusammenfassung fehlt: Für die Versionen ${from} bis ${to} braucht releaseData.summaries einen Eintrag {"from":"${from}","to":"${to}","title":"…","items":["…"]}.`);
    else if (!Array.isArray(sum.items) || !sum.items.length) errors.push(`Zusammenfassung ${from} bis ${to} hat keine Einträge.`);
  });
}
if (rel.length) {
  const w = rel[0];
  if (w.version !== version) errors.push(`Versionsnummer passt nicht: CHANGELOG.md ${version}, Webseite ${w.version}.`);
  if (w.date !== date) errors.push(`Datum passt nicht: CHANGELOG.md ${date}, Webseite ${w.date}.`);
  const num = v => v.split(".").map(Number);
  const gt = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };
  rel.forEach((r, i) => {
    if (!/^\d+\.\d+\.\d+$/.test(r.version || "")) errors.push(`Webseite: Version „${r.version}“ ist keine gültige Nummer (z. B. 1.2.0).`);
    if (!Array.isArray(r.items) || !r.items.length) errors.push(`Webseite: Version ${r.version} hat keine Einträge.`);
    if (i > 0 && !gt(rel[i - 1].version, r.version)) errors.push(`Webseite: Versionen sind nicht absteigend sortiert (${rel[i - 1].version} vor ${r.version}).`);
  });
} else if (m) errors.push("Die Versionshinweise der Webseite sind leer.");

for (const f of ICONS) if (!existsSync(join(root, f))) errors.push(`${f} fehlt. Bitte \`node scripts/make-icons.mjs\` ausführen.`);
if (!errors.some(e => e.includes("icons/"))) {
  for (const [f, text] of Object.entries(buildAll())) {
    const p = join(root, f);
    if (!existsSync(p)) errors.push(`${f} fehlt. Bitte \`node scripts/build.mjs\` ausführen.`);
    else if (readFileSync(p, "utf8") !== text) errors.push(`${f} ist nicht aktuell. Bitte \`node scripts/build.mjs\` ausführen.`);
  }
}

if (errors.length) fail(errors.join("\n"));
console.log(`Alles in Ordnung: Version ${version} vom ${date}, CHANGELOG.md und Webseite stimmen überein, index.html, Manifest und Service Worker sind aktuell.`);

function fail(msg) {
  console.error("Fehler bei den Versionshinweisen:\n" + msg);
  process.exit(1);
}
