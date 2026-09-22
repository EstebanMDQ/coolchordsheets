// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { parseChordSheet } from "../src/parser";
import { renderSheet } from "../src/render";

function render(source: string): HTMLElement {
  const container = document.createElement("div");
  return renderSheet(parseChordSheet(source), document, container);
}

function rows(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(".ccs-row"));
}

function cells(row: HTMLElement): HTMLElement[] {
  return Array.from(row.querySelectorAll<HTMLElement>(".ccs-cell"));
}

describe("grid layout follows source lines", () => {
  it("three lines of four bars", () => {
    const root = render("| C | D | E | F |\n| G | A | B | C |\n| D | E | F | G |");
    const r = rows(root);
    expect(r).toHaveLength(3);
    expect(r.map((row) => cells(row).length)).toEqual([4, 4, 4]);
  });

  it("lines with different bar counts", () => {
    const r = rows(render("| C | D | E | F |\n| G | A |"));
    expect(r.map((row) => cells(row).length)).toEqual([4, 2]);
  });

  it("cells are direct children of the row and the body carries the column count", () => {
    const root = render("| C | D | E | F |\n| G | A |");
    const body = root.querySelector<HTMLElement>(".ccs-body")!;
    expect(body.style.getPropertyValue("--ccs-cols")).toBe("4");
    const row = rows(root)[1];
    expect(Array.from(row.children).map((c) => c.className)).toEqual(["ccs-gutter", "ccs-cell", "ccs-cell"]);
  });

  it("every row has a gutter", () => {
    const r = rows(render("[A]\n| C |\n| D |"));
    expect(r.every((row) => row.querySelector(".ccs-gutter") !== null)).toBe(true);
  });
});

describe("cell sizing", () => {
  it("dense bar sets more slots", () => {
    const [a, b] = cells(rows(render("| C | C7 F7 Bb7 Eb7 |"))[0]);
    expect(a.style.getPropertyValue("--ccs-slots")).toBe("1");
    expect(b.style.getPropertyValue("--ccs-slots")).toBe("4");
  });
});

describe("bar lines", () => {
  it("repeat signs with count", () => {
    const c = cells(rows(render("||: C | G :||x3"))[0]);
    expect(c[0].dataset.open).toBe("repeatOpen");
    expect(c[1].dataset.close).toBe("repeatClose");
    expect(c[1].querySelector(".ccs-repeat-count")?.textContent).toBe("x3");
    expect(c[0].dataset.close).toBeUndefined();
  });
});

describe("bar lines between cells", () => {
  it("close and reopen draws closing dots in the previous cell", () => {
    const c = cells(rows(render("||: C :||: G :||"))[0]);
    expect(c[0].dataset.closeDots).toBe("");
    expect(c[0].dataset.close).toBeUndefined();
    expect(c[1].dataset.open).toBe("repeatBoth");
    expect(c[1].dataset.close).toBe("repeatClose");
  });
});

describe("chord placement", () => {
  it("single chord centered", () => {
    const token = render("| C |").querySelector<HTMLElement>(".ccs-token")!;
    expect(token.style.left).toBe("50%");
    expect(token.classList.contains("ccs-centered")).toBe(true);
  });

  it("single no-chord centered", () => {
    expect(render("| N.C. |").querySelector<HTMLElement>(".ccs-token")!.style.left).toBe("50%");
  });

  it("chord plus hold is not centered", () => {
    const tokens = render("| C    |").querySelectorAll<HTMLElement>(".ccs-token");
    expect(tokens).toHaveLength(2);
    expect(tokens[0].style.left).toBe("0%");
    expect(tokens[0].classList.contains("ccs-centered")).toBe(false);
  });

  it("two chords", () => {
    const tokens = render("| C G |").querySelectorAll<HTMLElement>(".ccs-token");
    expect(tokens[0].style.left).toBe("0%");
    expect(tokens[1].style.left).toBe("50%");
  });

  it("hold rendered as dot element", () => {
    const tokens = render("| C   D- G7 |").querySelectorAll<HTMLElement>(".ccs-token");
    expect(tokens[1].classList.contains("ccs-hold")).toBe(true);
    expect(tokens[1].style.left).toBe("25%");
  });

  it("unknown token as plain text", () => {
    const tokens = render("| H7 C |").querySelectorAll<HTMLElement>(".ccs-token");
    expect(tokens[0].classList.contains("ccs-unknown")).toBe(true);
    expect(tokens[0].textContent).toBe("H7");
    expect(tokens[0].querySelector(".ccs-quality")).toBeNull();
  });

  it("chord parts", () => {
    const chord = render("| Bb-7/F |").querySelector(".ccs-chord")!;
    expect(chord.querySelector(".ccs-root")?.textContent).toBe("B");
    expect(chord.querySelector(".ccs-accidental")?.textContent).toBe("♭");
    expect(chord.querySelector(".ccs-quality")?.textContent).toBe("-7");
    expect(chord.querySelector(".ccs-bass")?.textContent).toBe("F");
  });
});

describe("repeat bar symbol", () => {
  it("cell contains only the repeat symbol", () => {
    const cell = cells(rows(render("| C | % |"))[0])[1];
    expect(cell.querySelectorAll(".ccs-token")).toHaveLength(0);
    expect(cell.querySelector(".ccs-svg-repeat")).not.toBeNull();
  });
});

describe("time signature display", () => {
  it("header time shown in first bar", () => {
    const c = cells(rows(render("time: 3/4\n| C | D |"))[0]);
    expect(c[0].querySelector(".ccs-time-beats")?.textContent).toBe("3");
    expect(c[0].querySelector(".ccs-time-unit")?.textContent).toBe("4");
    expect(c[1].querySelector(".ccs-time")).toBeNull();
  });

  it("time signature token shown", () => {
    const c = cells(rows(render("| C | 6/8 D |"))[0]);
    expect(c[1].querySelector(".ccs-time-beats")?.textContent).toBe("6");
  });

  it("default time shown in first bar only", () => {
    const r = rows(render("| C |\n| D |"));
    expect(r[0].querySelector(".ccs-time-beats")?.textContent).toBe("4");
    expect(r[1].querySelector(".ccs-time")).toBeNull();
  });
});

describe("section labels and markers", () => {
  it("boxed section", () => {
    const r = rows(render("[A]\n| C |\n| D |"));
    expect(r[0].querySelector(".ccs-section-box")?.textContent).toBe("A");
    expect(r[1].querySelector(".ccs-section-box")).toBeNull();
  });

  it("first ending bracket", () => {
    const cell = cells(rows(render("| [1.] G7 |"))[0])[0];
    expect(cell.querySelector(".ccs-ending-label")?.textContent).toBe("1.");
    expect(cell.querySelector(".ccs-marks")?.classList.contains("ccs-ending")).toBe(true);
  });

  it("ending bracket spans to repeat", () => {
    const c = cells(rows(render("| [1.] G7 | C :|| [2.] G7 | C ||"))[0]);
    const inSpan = c.map((cell) => cell.querySelector(".ccs-marks")!.classList.contains("ccs-ending"));
    const starts = c.map((cell) => cell.querySelector(".ccs-ending-label")?.textContent ?? null);
    expect(inSpan).toEqual([true, true, true, true]);
    expect(starts).toEqual(["1.", null, "2.", null]);
  });

  it("ending bracket stops before next ending", () => {
    const c = cells(rows(render("| [1.] G7 | [2.] C | D |"))[0]);
    const inSpan = c.map((cell) => cell.querySelector(".ccs-marks")!.classList.contains("ccs-ending"));
    expect(inSpan).toEqual([true, true, true]);
    const starts = c.map((cell) => cell.querySelector(".ccs-ending-label")?.textContent ?? null);
    expect(starts).toEqual(["1.", "2.", null]);
  });

  it("jump instruction right aligned", () => {
    const cell = cells(rows(render("| [D.S. al Coda] C |"))[0])[0];
    expect(cell.querySelector(".ccs-marks-right .ccs-mark-jump")?.textContent).toBe("D.S. al Coda");
  });

  it("coda, segno and text markers left aligned", () => {
    const root = render("| [coda] C | [segno] D | [Solo] E |");
    expect(root.querySelector(".ccs-marks-left .ccs-svg-coda")).not.toBeNull();
    expect(root.querySelector(".ccs-marks-left .ccs-svg-segno")).not.toBeNull();
    expect(root.querySelector(".ccs-marks-left .ccs-mark-text")?.textContent).toBe("Solo");
  });

  it("uneven marker attribute", () => {
    const c = cells(rows(render("| C   D- | C D |"))[0]);
    expect(c[0].dataset.timing).toBe("uneven");
    expect(c[1].dataset.timing).toBeUndefined();
  });
});

describe("header display", () => {
  it("title and key", () => {
    const root = render("title: All of Me\nkey: Bb\n| C |");
    expect(root.querySelector(".ccs-title")?.textContent).toBe("All of Me");
    expect(root.querySelector(".ccs-key")?.textContent).toBe("B♭");
  });

  it("minor key formatted", () => {
    expect(render("key: G-\n| C |").querySelector(".ccs-key")?.textContent).toBe("G-");
  });

  it("no header element without title or key", () => {
    expect(render("| C |").querySelector(".ccs-header")).toBeNull();
  });
});

describe("diagnostics display", () => {
  it("one bad line", () => {
    const root = render("| C |\nnot a bar\n| G |");
    expect(rows(root)).toHaveLength(2);
    const items = root.querySelectorAll(".ccs-diag");
    expect(items).toHaveLength(1);
    expect(items[0].classList.contains("ccs-diag-error")).toBe(true);
    expect(items[0].textContent).toContain("Line 2");
  });

  it("warning style", () => {
    const item = render("| H7 |").querySelector(".ccs-diag")!;
    expect(item.classList.contains("ccs-diag-warning")).toBe(true);
  });

  it("no list without diagnostics", () => {
    expect(render("| C |").querySelector(".ccs-diagnostics")).toBeNull();
  });
});

describe("headless render", () => {
  it("re-render empties the container", () => {
    const container = document.createElement("div");
    renderSheet(parseChordSheet("| C |"), document, container);
    renderSheet(parseChordSheet("| D | E |"), document, container);
    expect(container.querySelectorAll(".ccs-sheet")).toHaveLength(1);
    expect(container.querySelectorAll(".ccs-cell")).toHaveLength(2);
  });
});
