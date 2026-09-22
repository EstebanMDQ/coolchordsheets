// Renders each chart under examples/ with headless Chrome into docs/img/<name>.png.
// Exits 0 with a message when no browser is found so CI is never blocked.
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { basename, resolve } from "path";
import { buildWeb } from "../esbuild.config.mjs";

const candidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.log("screenshots: no Chrome found (set CHROME_PATH). Skipping.");
  process.exit(0);
}

await buildWeb();
mkdirSync("docs/img", { recursive: true });
const outDir = resolve("scratch-screenshots");
mkdirSync(outDir, { recursive: true });

const WIDTH = 900;
const FONT = 16;
const ROW = 4.6 * FONT; // marks height + bar height in styles.css

function fence(markdown) {
  const m = /```chordsheet\n([\s\S]*?)```/.exec(markdown);
  return m ? m[1] : null;
}

for (const file of readdirSync("examples").filter((f) => f.endsWith(".md"))) {
  const text = fence(readFileSync(`examples/${file}`, "utf8"));
  if (!text) continue;
  const name = basename(file, ".md").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const rows = text.split("\n").filter((l) => l.includes("|")).length;
  const hasHeader = /^(title|key):/m.test(text);
  const height = Math.ceil(40 + (hasHeader ? 70 : 0) + rows * ROW + 40);
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${resolve("dist/coolchordsheets.css")}">
<style>body{margin:20px;background:#fff;font-size:${FONT}px}</style></head>
<body><pre class="chordsheet">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>
<script src="file://${resolve("dist/coolchordsheets.js")}"></script></body></html>`;
  const page = `${outDir}/${name}.html`;
  writeFileSync(page, html);
  const out = resolve(`docs/img/${name}.png`);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    `--window-size=${WIDTH},${height}`,
    `--screenshot=${out}`,
    `file://${page}`,
  ], { stdio: "ignore" });
  console.log(`wrote docs/img/${name}.png (${WIDTH}x${height} @2x)`);
}
