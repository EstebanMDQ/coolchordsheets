// @vitest-environment happy-dom
import { existsSync, readFileSync } from "fs";
import { beforeAll, describe, expect, it } from "vitest";
import { buildWeb } from "../esbuild.config.mjs";

describe("web build outputs", () => {
  beforeAll(async () => {
    await buildWeb();
  }, 60000);

  it("produces the three files", () => {
    for (const f of ["dist/coolchordsheets.js", "dist/coolchordsheets.esm.js", "dist/coolchordsheets.css"]) {
      expect(existsSync(f), f).toBe(true);
    }
    expect(readFileSync("dist/coolchordsheets.js", "utf8")).toContain("CoolChordSheets");
    expect(readFileSync("dist/coolchordsheets.css", "utf8")).toBe(readFileSync("styles.css", "utf8"));
  });

  it("script build auto-renders on a ready document", () => {
    document.body.innerHTML = '<pre class="chordsheet">| C | G |</pre>';
    const code = readFileSync("dist/coolchordsheets.js", "utf8");
    // The bundle is strict, so its top-level var is scoped to the eval; read it from inside.
    const api = (0, eval)(`${code};CoolChordSheets`) as { render: unknown; renderAll: unknown };
    expect(document.querySelector("pre")).toBeNull();
    expect(document.querySelectorAll(".ccs-cell")).toHaveLength(2);
    expect(typeof api?.render).toBe("function");
    expect(typeof api?.renderAll).toBe("function");
  });

  it("module build never auto-renders", () => {
    const code = readFileSync("dist/coolchordsheets.esm.js", "utf8");
    expect(code).not.toContain("DOMContentLoaded");
  });
});
