// Fails when the gzipped standalone script exceeds the size budget.
import { readFileSync } from "fs";
import { gzipSync } from "zlib";

const file = "dist/coolchordsheets.js";
const budget = 12288;
const raw = readFileSync(file);
const gz = gzipSync(raw).length;
console.log(`${file}: ${raw.length} bytes, ${gz} bytes gzipped (budget ${budget})`);
if (gz > budget) {
  console.error(`Size budget exceeded by ${gz - budget} bytes`);
  process.exit(1);
}
