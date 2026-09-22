// Verifies that every image referenced by README.md and docs/index.html exists.
import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";

const files = ["README.md", "docs/index.html"];
const missing = [];
for (const file of files) {
  const text = readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const refs = [];
  for (const m of text.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) refs.push(m[1]);
  for (const m of text.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)) refs.push(m[1]);
  for (const ref of refs) {
    if (/^https?:/.test(ref)) continue;
    const path = resolve(dirname(file), ref);
    if (!existsSync(path)) missing.push(`${file}: ${ref}`);
  }
}
if (missing.length > 0) {
  console.error("Missing images:\n" + missing.join("\n"));
  process.exit(1);
}
console.log("docs-check: all referenced images exist");
