const NS = "http://www.w3.org/2000/svg";

type Attrs = Record<string, string>;

function shape(doc: Document, tag: string, attrs: Attrs): SVGElement {
  const node = doc.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function svg(doc: Document, cls: string, children: SVGElement[]): SVGElement {
  const root = shape(doc, "svg", { viewBox: "0 0 24 24", class: `ccs-svg ${cls}`, "aria-hidden": "true" });
  for (const child of children) root.appendChild(child);
  return root;
}

const dot = (doc: Document, cx: string, cy: string, r: string): SVGElement =>
  shape(doc, "circle", { cx, cy, r, fill: "currentColor" });

const line = (doc: Document, x1: string, y1: string, x2: string, y2: string, width: string): SVGElement =>
  shape(doc, "line", { x1, y1, x2, y2, stroke: "currentColor", "stroke-width": width, "stroke-linecap": "round" });

/** Measure repeat sign: a slash between two dots. */
export function measureRepeatSvg(doc: Document): SVGElement {
  return svg(doc, "ccs-svg-repeat", [
    dot(doc, "6", "8", "2.2"),
    dot(doc, "18", "16", "2.2"),
    line(doc, "7", "20", "17", "4", "3"),
  ]);
}

/** Coda sign: a circle with a cross through it. */
export function codaSvg(doc: Document): SVGElement {
  return svg(doc, "ccs-svg-coda", [
    shape(doc, "circle", { cx: "12", cy: "12", r: "6", fill: "none", stroke: "currentColor", "stroke-width": "2" }),
    line(doc, "12", "2", "12", "22", "2"),
    line(doc, "2", "12", "22", "12", "2"),
  ]);
}

/** Segno sign: an S crossed by a diagonal line with two dots. */
export function segnoSvg(doc: Document): SVGElement {
  return svg(doc, "ccs-svg-segno", [
    shape(doc, "path", {
      d: "M16 5 C 8 2, 6 9, 12 12 C 18 15, 16 22, 8 19",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2.2",
      "stroke-linecap": "round",
    }),
    line(doc, "5", "21", "19", "3", "1.6"),
    dot(doc, "5", "8", "1.6"),
    dot(doc, "19", "16", "1.6"),
  ]);
}
