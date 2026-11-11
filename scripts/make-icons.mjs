// Erzeugt die App-Symbole für die Progressive Web App (Ordner icons/).
// Nur nötig, wenn sich Guckis Aussehen ändert. Die fertigen PNG-Dateien liegen im Repository.
//
// Aufruf: node scripts/make-icons.mjs
// Braucht Playwright mit Chromium (nicht Teil des Projekts, nur für diesen Schritt).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "./build.mjs";

const RAINBOW = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#8E24AA"];

// Gucki auf 512 × 512, wie das apple-touch-icon (Regenbogen-Streifen oben, Hände unten).
function gucki({ rainbow = true } = {}) {
  const stops = RAINBOW.map((c, i) => `<stop offset="${(i / (RAINBOW.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join("");
  return `
  <defs><linearGradient id="rb" x1="0" x2="1">${stops}</linearGradient></defs>
  <rect width="512" height="512" fill="#F6F7FA"/>
  ${rainbow ? '<rect width="512" height="24" fill="url(#rb)"/>' : ""}
  <rect x="106" y="120" width="300" height="520" rx="150" fill="#139DB3"/>
  <circle cx="186" cy="268" r="62" fill="#FFFFFF" stroke="#0E6F7E" stroke-width="14"/>
  <circle cx="326" cy="268" r="62" fill="#FFFFFF" stroke="#0E6F7E" stroke-width="14"/>
  <circle cx="196" cy="280" r="29" fill="#1C1F2E"/>
  <circle cx="336" cy="280" r="29" fill="#1C1F2E"/>
  <circle cx="186" cy="268" r="9" fill="#FFFFFF"/>
  <circle cx="326" cy="268" r="9" fill="#FFFFFF"/>
  <rect x="-20" y="446" width="150" height="100" rx="44" fill="#0E8496"/>
  <rect x="382" y="446" width="150" height="100" rx="44" fill="#0E8496"/>`;
}

// "maskable": Android schneidet das Symbol rund oder abgerundet zu. Gucki muss deshalb im inneren
// Kreis (80 % der Fläche) bleiben – er wird verkleinert und die Hände stehen auf dem Rand.
function maskable() {
  return `
  <rect width="512" height="512" fill="#F6F7FA"/>
  <clipPath id="c"><rect width="512" height="512"/></clipPath>
  <g clip-path="url(#c)"><g transform="translate(256 300) scale(.7) translate(-256 -256)">${gucki({ rainbow: false })
    .replace('<rect width="512" height="512" fill="#F6F7FA"/>', "")
    .replace('height="520" rx="150"', 'height="900" rx="150"')
    .replace('x="-20" y="446"', 'x="40" y="430"')
    .replace('x="382" y="446"', 'x="322" y="430"')}</g></g>`;
}

const svg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${inner}</svg>`;

// Playwright als CommonJS laden, damit auch eine global installierte Version gefunden wird.
const { createRequire } = await import("node:module");
const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch();
const page = await browser.newPage();
mkdirSync(join(root, "icons"), { recursive: true });
const jobs = [
  ["icon-192.png", gucki(), 192],
  ["icon-512.png", gucki(), 512],
  ["icon-maskable-512.png", maskable(), 512],
];
for (const [name, inner, size] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg(inner)}`);
  writeFileSync(join(root, "icons", name), await page.screenshot({ omitBackground: false }));
  console.log("icons/" + name);
}
await browser.close();
