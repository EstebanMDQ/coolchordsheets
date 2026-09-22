import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("Obsidian plugin guidelines", () => {
  it("no innerHTML, outerHTML or insertAdjacentHTML under src/", () => {
    for (const file of walk("src")) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/);
    }
  });

  it("manifest is consistent", () => {
    const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const versions = JSON.parse(readFileSync("versions.json", "utf8"));
    expect(manifest.version).toBe(pkg.version);
    expect(versions[manifest.version]).toBe(manifest.minAppVersion);
    expect(manifest.id).not.toMatch(/obsidian/i);
    expect(manifest.name).not.toMatch(/obsidian/i);
    expect(manifest.isDesktopOnly).toBe(false);
    expect(manifest.authorUrl).toMatch(/^https:\/\/github\.com\//);
  });
});
