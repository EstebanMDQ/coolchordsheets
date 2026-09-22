import { readFileSync } from "fs";
import { defineConfig } from "vitest/config";

const version = JSON.parse(readFileSync("package.json", "utf8")).version as string;

export default defineConfig({
  define: {
    __AUTO__: "false",
    __VERSION__: JSON.stringify(version),
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
