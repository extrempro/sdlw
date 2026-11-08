// Baut index.html (eigenständige Seite zum lokalen Öffnen und für GitHub)
// aus src/entdeckerheft.html (Quelldatei, gleichzeitig die Vorlage für das claude.ai-Artifact).
//
// Aufruf: node scripts/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SKELETON_STYLE = `:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
img{max-width:100%}
[hidden]{display:none!important}`;

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
<style>
${SKELETON_STYLE}
</style>
${head}
</head>
<body>
${body}
</body>
</html>
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(root, "index.html"), build());
  console.log("index.html wurde aus src/entdeckerheft.html gebaut.");
}
