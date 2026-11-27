// Sicherheits-Tests ohne Browser (laufen in GitHub Actions und lokal: node scripts/test-sicherheit.mjs)
// Prüft index.html (CSP passt zu den eingebetteten Skripten, keine Inline-Handler, sichere externe Links),
// die Service-Worker-Regeln, nginx.conf und docker-compose.yml. Der Live-Test der Auslieferung ist scripts/test-nginx.sh.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { buildAll, root } from "./build.mjs";

const errors = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); else console.log("ok  " + msg); };
const html = readFileSync(join(root, "index.html"), "utf8");
const built = buildAll();

// 1. CSP vorhanden und streng
const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
check(!!meta, "index.html hat eine Content-Security-Policy");
const csp = meta ? meta[1] : "";
const dir = n => (csp.split(";").map(s => s.trim()).find(s => s.startsWith(n + " ")) || "");
check(!/unsafe-inline|unsafe-eval|\*/.test(dir("script-src")), "script-src ohne unsafe-inline, unsafe-eval und *");
check(/object-src 'none'/.test(csp) && /base-uri 'none'/.test(csp) && /form-action 'none'/.test(csp), "object-src, base-uri und form-action sind 'none'");
check(/default-src 'self'/.test(csp) && /connect-src 'self'/.test(csp), "default-src und connect-src nur 'self'");
check(html.indexOf("Content-Security-Policy") < html.indexOf("<script"), "CSP steht vor dem ersten Skript");

// 2. Jede ausführbare Inline-Script hat ihre Prüfsumme in der CSP, und es gibt keine überflüssigen
const want = [];
for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  const a = m[1] || "", type = (a.match(/\btype="([^"]*)"/) || [])[1];
  if (/\bsrc=/.test(a)) { errors.push("Externes Skript gefunden: " + a); continue; }
  if (type && !/^(text\/javascript|module)$/.test(type)) continue;
  want.push(`'sha256-${createHash("sha256").update(m[2], "utf8").digest("base64")}'`);
}
const have = (dir("script-src").match(/'sha256-[^']+'/g) || []);
check(want.length > 0 && want.every(h => have.includes(h)) && have.length === want.length, `alle ${want.length} eingebetteten Skripte stehen genau so in der CSP`);
check(html === built["index.html"], "index.html entspricht dem Build (node scripts/build.mjs)");

// 3. Keine Inline-Handler und keine javascript:-Adressen im Markup (die CSP würde sie ohnehin blockieren)
const markup = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
check(!/\son[a-z]+\s*=\s*["']/i.test(markup), "keine onclick=…-Attribute im HTML");
check(!/javascript:/i.test(html), "keine javascript:-Adressen");
check(!/<iframe|<object|<embed/i.test(markup), "keine iframes, object oder embed");

// 4. Externe Links öffnen ohne Zugriff auf die Seite (noopener)
const ext = [...markup.matchAll(/<a\s[^>]*href="https?:\/\/[^"]*"[^>]*>/g)].map(m => m[0]);
check(ext.length > 0 && ext.every(a => /target="_blank"/.test(a) && /rel="[^"]*noopener/.test(a)), `alle ${ext.length} externen Links mit target="_blank" haben rel="noopener"`);

// 5. Service Worker: nur eigene Adressen, nur GET
const sw = built["sw.js"];
check(/req\.method !== "GET"/.test(sw) && /origin !== location\.origin/.test(sw), "Service Worker behandelt nur GET-Anfragen an die eigene Adresse");

// 6. nginx.conf
const ng = readFileSync(join(root, "nginx.conf"), "utf8"), code = ng.replace(/#.*$/gm, "");
for (const h of ["X-Content-Type-Options", "X-Frame-Options", "Content-Security-Policy", "Referrer-Policy", "Permissions-Policy",
  "Cross-Origin-Opener-Policy", "Cross-Origin-Resource-Policy", "Strict-Transport-Security"])
  check(new RegExp(`^\\s*add_header ${h} .* always;`, "m").test(code), `nginx setzt ${h}`);
const loc = code.split(/\blocation\b/).slice(1);
check(loc.every(l => !/add_header/.test(l.split("}")[0])), "kein add_header in location-Blöcken (würde die Sicherheits-Header aufheben)");
check(/server_tokens off;/.test(code), "nginx verrät seine Version nicht (server_tokens off)");
check(/location \/ \{\s*return 404;/.test(code), "alles außer der Webseite gibt 404");
check(/\$request_method !~ \^\(GET\|HEAD\)\$/.test(code), "nur GET und HEAD erlaubt");

// 7. docker-compose.yml
const dc = readFileSync(join(root, "docker-compose.yml"), "utf8");
check(/\.\/:\/srv\/site:ro/.test(dc) && /nginx\.conf:\/etc\/nginx\/conf\.d\/default\.conf:ro/.test(dc), "Repository und nginx.conf nur lesend eingebunden");
check(/no-new-privileges:true/.test(dc), "Container ohne zusätzliche Rechte (no-new-privileges)");
check(/read_only: true/.test(dc), "Container-Dateisystem schreibgeschützt (read_only)");

if (errors.length) { console.error("\nFehler:\n- " + errors.join("\n- ")); process.exit(1); }
console.log("\nAlles in Ordnung: Sicherheits-Tests bestanden.");
