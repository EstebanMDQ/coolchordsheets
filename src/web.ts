import { parseChordSheet } from "./parser";
import { renderSheet } from "./render";

declare const __AUTO__: boolean;
declare const __VERSION__: string;

export { parseChordSheet };
export const version: string = __VERSION__;

export interface WebOptions {
  /** Draw a dot where a chord is held for an extra slot. Default false. */
  showHolds?: boolean;
  /** Dotted top edge on bars whose slot count does not fit the time signature. Default true. */
  showUneven?: boolean;
  /** Chord font size in pixels, 10 to 32. Default 16. */
  fontSize?: number;
}

const FONT_MIN = 10;
const FONT_MAX = 32;
const FONT_DEFAULT = 16;

function clampFontSize(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return FONT_DEFAULT;
  return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(n)));
}

function applyOptions(root: HTMLElement, options: WebOptions): void {
  root.classList.toggle("ccs-show-holds", options.showHolds === true);
  root.classList.toggle("ccs-show-uneven", options.showUneven !== false);
  root.style.setProperty("--ccs-font-size", `${clampFontSize(options.fontSize)}px`);
}

/** Parses text and renders it into container (emptied first). Returns the sheet root. Throws on failure. */
export function render(text: string, container: HTMLElement, options: WebOptions = {}): HTMLElement {
  const root = renderSheet(parseChordSheet(text), container.ownerDocument, container);
  applyOptions(root, options);
  return root;
}

function isSource(pre: Element): boolean {
  if (pre.classList.contains("chordsheet")) return true;
  const child = pre.firstElementChild;
  return pre.children.length === 1 && child !== null && child.matches("code.language-chordsheet");
}

function parseBool(value: string | undefined): boolean | undefined {
  if (value === "true" || value === "") return true;
  if (value === "false") return false;
  return undefined;
}

function elementOptions(pre: HTMLElement, base: WebOptions): WebOptions {
  const holds = parseBool(pre.dataset.showHolds);
  const uneven = parseBool(pre.dataset.showUneven);
  const size = pre.dataset.fontSize;
  return {
    showHolds: holds ?? base.showHolds,
    showUneven: uneven ?? base.showUneven,
    fontSize: size !== undefined && size !== "" ? clampFontSize(size) : base.fontSize,
  };
}

/**
 * Replaces every `pre.chordsheet` and `pre > code.language-chordsheet` under root with a rendered chart.
 * Returns how many were converted. A failing element is left in place with an error after it.
 */
export function renderAll(root: ParentNode = document, options: WebOptions = {}): number {
  const pres = Array.from(root.querySelectorAll("pre")).filter(isSource) as HTMLElement[];
  let count = 0;
  for (const pre of pres) {
    const doc = pre.ownerDocument;
    const text = pre.textContent ?? "";
    try {
      const container = doc.createElement("div");
      container.className = "ccs-container";
      container.dataset.chordsheetSource = text;
      render(text, container, elementOptions(pre, options));
      pre.replaceWith(container);
      count++;
    } catch (err) {
      const note = doc.createElement("div");
      note.className = "ccs-render-error";
      note.textContent = `Chord sheet could not be rendered: ${err instanceof Error ? err.message : String(err)}`;
      pre.after(note);
    }
  }
  return count;
}

if (__AUTO__) {
  const script = document.currentScript;
  if (!(script instanceof HTMLElement && script.hasAttribute("data-manual"))) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => renderAll(document));
    } else {
      renderAll(document);
    }
  }
}
