// @vitest-environment happy-dom
import { readFileSync } from "fs";
import { beforeAll, describe, expect, it } from "vitest";
import { buildWeb } from "../esbuild.config.mjs";

const html = readFileSync("docs/index.html", "utf8");

function fence(path: string): string {
  const m = /```chordsheet\n([\s\S]*?)```/.exec(readFileSync(path, "utf8"));
  return (m?.[1] ?? "").replace(/\n$/, "");
}

/** Loads the page body, then runs the built library and the demo script as a browser would. */
function loadPage(): void {
  const body = /<body>([\s\S]*)<\/body>/.exec(html)?.[1] ?? "";
  document.body.innerHTML = body.replace(/<script[^>]*><\/script>/g, "");
  (0, eval)(readFileSync("dist/coolchordsheets.js", "utf8"));
  (0, eval)(`${readFileSync("dist/coolchordsheets.js", "utf8")};globalThis.CoolChordSheets = CoolChordSheets;`);
  (0, eval)(readFileSync("docs/demo.js", "utf8"));
}

function fire(el: Element, type = "input"): void {
  el.dispatchEvent(new Event(type, { bubbles: true }));
}

describe("demo page content", () => {
  it("sections present and one library script", () => {
    for (const id of ["editor", "examples", "obsidian", "library"]) {
      expect(html, id).toMatch(new RegExp(`<section id="${id}"`));
    }
    const scripts = Array.from(html.matchAll(/<script[^>]*src="([^"]+)"/g)).map((m) => m[1]);
    expect(scripts.filter((s) => s === "./dist/coolchordsheets.js")).toHaveLength(1);
  });

  it("no external scripts or stylesheets", () => {
    const srcs = Array.from(html.matchAll(/<script[^>]*src="([^"]+)"/g)).map((m) => m[1]);
    const hrefs = Array.from(html.matchAll(/<link[^>]*href="([^"]+)"/g)).map((m) => m[1]);
    for (const ref of [...srcs, ...hrefs]) expect(ref, ref).toMatch(/^\.\//);
  });

  it("examples match the files under examples/", () => {
    for (const name of ["All of Me", "Timing", "Structure"]) {
      const text = fence(`examples/${name}.md`).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      expect(html, name).toContain(text);
    }
  });
});

describe("live editor", () => {
  beforeAll(async () => {
    await buildWeb();
  }, 60000);

  it("initial render", () => {
    loadPage();
    const preview = document.getElementById("preview")!;
    expect(preview.querySelector(".ccs-sheet")).not.toBeNull();
    expect(preview.querySelector(".ccs-title")?.textContent).toBe("All of Me");
  });

  it("typing re-renders", () => {
    loadPage();
    const source = document.getElementById("source") as HTMLTextAreaElement;
    source.value = "| C | G |";
    fire(source);
    expect(document.querySelectorAll("#preview .ccs-cell")).toHaveLength(2);
  });

  it("options applied", () => {
    loadPage();
    const holds = document.getElementById("opt-holds") as HTMLInputElement;
    const size = document.getElementById("opt-size") as HTMLInputElement;
    holds.checked = true;
    fire(holds);
    size.value = "20";
    fire(size);
    const root = document.querySelector<HTMLElement>("#preview .ccs-sheet")!;
    expect(root.classList.contains("ccs-show-holds")).toBe(true);
    expect(root.style.getPropertyValue("--ccs-font-size")).toBe("20px");
    expect(document.getElementById("opt-size-label")?.textContent).toBe("20 px");
  });

  it("diagnostics shown", () => {
    loadPage();
    const source = document.getElementById("source") as HTMLTextAreaElement;
    source.value = "| C |\nnot a bar";
    fire(source);
    expect(document.querySelector("#preview .ccs-diag-error")).not.toBeNull();
  });

  it("example blocks are rendered by the library on load", () => {
    loadPage();
    expect(document.querySelectorAll("#examples .ccs-sheet")).toHaveLength(3);
    expect(document.querySelectorAll("#examples pre.chordsheet")).toHaveLength(0);
  });
});
