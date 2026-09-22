// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, renderAll, version } from "../src/web";
import * as renderModule from "../src/render";

function setBody(html: string): void {
  document.body.innerHTML = html;
}

beforeEach(() => setBody(""));

describe("source elements", () => {
  it("pre with class", () => {
    setBody('<pre class="chordsheet">| C | G |</pre>');
    expect(renderAll(document)).toBe(1);
    expect(document.querySelector("pre")).toBeNull();
    expect(document.querySelectorAll(".ccs-cell")).toHaveLength(2);
  });

  it("markdown fence output", () => {
    setBody('<pre><code class="language-chordsheet">| C | G |</code></pre>');
    expect(renderAll(document)).toBe(1);
    expect(document.querySelector("pre")).toBeNull();
    expect(document.querySelectorAll(".ccs-cell")).toHaveLength(2);
  });

  it("entities decoded", () => {
    setBody('<pre class="chordsheet">| C&lt;weird |</pre>');
    renderAll(document);
    expect(document.querySelector(".ccs-container")?.getAttribute("data-chordsheet-source")).toBe("| C<weird |");
    expect(document.querySelector(".ccs-token")?.textContent).toBe("C<weird");
  });

  it("other elements ignored", () => {
    setBody('<div class="chordsheet">| C |</div><pre>| C |</pre><pre><code class="language-js">x</code></pre>');
    expect(renderAll(document)).toBe(0);
    expect(document.querySelector("div.chordsheet")?.textContent).toBe("| C |");
    expect(document.querySelectorAll("pre")).toHaveLength(2);
  });
});

describe("render API", () => {
  it("programmatic render", () => {
    const el = document.createElement("div");
    const root = render("| C | G |", el);
    expect(root.classList.contains("ccs-sheet")).toBe(true);
    expect(el.firstElementChild).toBe(root);
    expect(el.querySelectorAll(".ccs-cell")).toHaveLength(2);
  });

  it("renderAll count", () => {
    setBody('<pre class="chordsheet">| C |</pre><pre>plain</pre><pre class="chordsheet">| D |</pre><pre><code class="language-chordsheet">| E |</code></pre>');
    expect(renderAll(document)).toBe(3);
    expect(document.querySelector("pre")?.textContent).toBe("plain");
  });

  it("renderAll under a subtree", () => {
    setBody('<section id="a"><pre class="chordsheet">| C |</pre></section><section id="b"><pre class="chordsheet">| D |</pre></section>');
    expect(renderAll(document.getElementById("a")!)).toBe(1);
    expect(document.querySelector("#a pre")).toBeNull();
    expect(document.querySelector("#b pre")).not.toBeNull();
  });

  it("exports version", () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("replacement and source retention", () => {
  it("source retained", () => {
    setBody('<pre class="chordsheet">| C |</pre>');
    renderAll(document);
    const container = document.querySelector<HTMLElement>(".ccs-container")!;
    expect(container.dataset.chordsheetSource).toBe("| C |");
    expect(container.querySelector(".ccs-sheet")).not.toBeNull();
  });

  it("idempotent", () => {
    setBody('<pre class="chordsheet">| C |</pre>');
    renderAll(document);
    const html = document.body.innerHTML;
    expect(renderAll(document)).toBe(0);
    expect(document.body.innerHTML).toBe(html);
  });
});

describe("options", () => {
  it("defaults", () => {
    const root = render("| C |", document.createElement("div"));
    expect(root.classList.contains("ccs-show-uneven")).toBe(true);
    expect(root.classList.contains("ccs-show-holds")).toBe(false);
    expect(root.style.getPropertyValue("--ccs-font-size")).toBe("16px");
  });

  it("options applied", () => {
    const root = render("| C |", document.createElement("div"), { showHolds: true, showUneven: false, fontSize: 20 });
    expect(root.classList.contains("ccs-show-holds")).toBe(true);
    expect(root.classList.contains("ccs-show-uneven")).toBe(false);
    expect(root.style.getPropertyValue("--ccs-font-size")).toBe("20px");
  });

  it("font size clamped", () => {
    expect(render("| C |", document.createElement("div"), { fontSize: 40 }).style.getPropertyValue("--ccs-font-size")).toBe("32px");
    expect(render("| C |", document.createElement("div"), { fontSize: 2 }).style.getPropertyValue("--ccs-font-size")).toBe("10px");
    expect(render("| C |", document.createElement("div"), { fontSize: Number.NaN }).style.getPropertyValue("--ccs-font-size")).toBe("16px");
  });

  it("data attributes override", () => {
    setBody('<pre class="chordsheet" data-show-holds="true" data-font-size="12" data-show-uneven="false">| C |</pre>');
    renderAll(document, { showHolds: false, fontSize: 24 });
    const root = document.querySelector<HTMLElement>(".ccs-sheet")!;
    expect(root.classList.contains("ccs-show-holds")).toBe(true);
    expect(root.classList.contains("ccs-show-uneven")).toBe(false);
    expect(root.style.getPropertyValue("--ccs-font-size")).toBe("12px");
  });

  it("renderAll options apply without attributes", () => {
    setBody('<pre class="chordsheet">| C |</pre>');
    renderAll(document, { showHolds: true });
    expect(document.querySelector(".ccs-sheet")?.classList.contains("ccs-show-holds")).toBe(true);
  });
});

describe("error fallback", () => {
  it("one element fails", () => {
    setBody('<pre class="chordsheet" id="first">| C |</pre><pre class="chordsheet" id="second">| D |</pre>');
    const spy = vi.spyOn(renderModule, "renderSheet").mockImplementationOnce(() => {
      throw new Error("boom");
    });
    try {
      expect(renderAll(document)).toBe(1);
    } finally {
      spy.mockRestore();
    }
    const first = document.getElementById("first");
    expect(first).not.toBeNull();
    expect(first?.nextElementSibling?.className).toBe("ccs-render-error");
    expect(first?.nextElementSibling?.textContent).toContain("boom");
    expect(document.getElementById("second")).toBeNull();
    expect(document.querySelectorAll(".ccs-sheet")).toHaveLength(1);
  });
});

describe("module build is passive", () => {
  it("importing does not touch source elements", () => {
    setBody('<pre class="chordsheet">| C |</pre>');
    // The module was imported at the top of this file; nothing rendered until renderAll is called.
    expect(document.querySelector("pre")).not.toBeNull();
    expect(document.querySelector(".ccs-sheet")).toBeNull();
  });
});
