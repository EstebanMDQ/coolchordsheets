import { formatChord, formatNoChord, type ChordDisplay } from "../chords";
import type { Bar, ChordSheet, Line, Marker, Section, TimeSignature } from "../parser";
import { codaSvg, measureRepeatSvg, segnoSvg } from "./svg";

function el(doc: Document, tag: string, cls: string, text?: string): HTMLElement {
  const node = doc.createElement(tag);
  node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

interface EndingSpan {
  label: string | null;
  inSpan: boolean;
}

/**
 * For each bar in a row, whether it sits under an ending bracket and, for the first bar
 * of a bracket, its label. A bracket runs from its marker to the next ending marker,
 * the next closing repeat (inclusive), or the end of the row.
 */
function endingSpans(bars: Bar[]): EndingSpan[] {
  const spans: EndingSpan[] = [];
  let open = false;
  for (const bar of bars) {
    const ending = bar.markers.find((m): m is Extract<Marker, { kind: "ending" }> => m.kind === "ending");
    if (ending) {
      spans.push({ label: ending.text, inSpan: true });
      open = true;
    } else {
      spans.push({ label: null, inSpan: open });
    }
    if (open && (bar.close.kind === "repeatClose" || bar.close.kind === "repeatBoth")) open = false;
  }
  return spans;
}

function renderChordDisplay(doc: Document, display: ChordDisplay, cls: string): HTMLElement {
  const node = el(doc, "span", cls);
  node.appendChild(el(doc, "span", "ccs-root", display.root));
  if (display.accidental) node.appendChild(el(doc, "span", "ccs-accidental", display.accidental));
  if (display.quality) node.appendChild(el(doc, "span", "ccs-quality", display.quality));
  if (display.bass) {
    node.appendChild(el(doc, "span", "ccs-slash", "/"));
    node.appendChild(el(doc, "span", "ccs-bass", display.bass));
  }
  return node;
}

function renderTime(doc: Document, time: TimeSignature): HTMLElement {
  const node = el(doc, "span", "ccs-time");
  node.appendChild(el(doc, "span", "ccs-time-beats", String(time.beats)));
  node.appendChild(el(doc, "span", "ccs-time-unit", String(time.unit)));
  return node;
}

function renderMarkers(doc: Document, bar: Bar, span: EndingSpan): HTMLElement {
  const marks = el(doc, "div", "ccs-marks");
  const left = el(doc, "span", "ccs-marks-left");
  const right = el(doc, "span", "ccs-marks-right");
  if (span.inSpan) {
    marks.classList.add("ccs-ending");
    if (span.label !== null) {
      marks.classList.add("ccs-ending-start");
      left.appendChild(el(doc, "span", "ccs-ending-label", span.label));
    }
  }
  for (const marker of bar.markers) {
    switch (marker.kind) {
      case "coda":
        left.appendChild(codaSvg(doc));
        break;
      case "segno":
        left.appendChild(segnoSvg(doc));
        break;
      case "text":
        left.appendChild(el(doc, "span", "ccs-mark-text", marker.text));
        break;
      case "fine":
        right.appendChild(el(doc, "span", "ccs-mark-jump", "Fine"));
        break;
      case "jump":
        right.appendChild(el(doc, "span", "ccs-mark-jump", marker.text));
        break;
      case "ending":
        break;
    }
  }
  if (bar.close.repeatCount !== undefined) {
    right.appendChild(el(doc, "span", "ccs-repeat-count", `x${bar.close.repeatCount}`));
  }
  marks.appendChild(left);
  marks.appendChild(right);
  return marks;
}

function renderBar(doc: Document, bar: Bar, span: EndingSpan, isLast: boolean, showTime: boolean): HTMLElement {
  const cell = el(doc, "div", "ccs-cell");
  cell.dataset.open = bar.open.kind;
  if (isLast) cell.dataset.close = bar.close.kind;
  // A close-then-open repeat between two cells draws its closing dots in this cell.
  if (!isLast && bar.close.kind === "repeatBoth") cell.dataset.closeDots = "";
  if (bar.uneven) cell.dataset.timing = "uneven";
  const slots = Math.max(1, bar.tokens.length);
  cell.style.setProperty("--ccs-slots", String(slots));

  cell.appendChild(renderMarkers(doc, bar, span));

  const body = el(doc, "div", "ccs-cell-body");
  if (showTime) {
    body.appendChild(renderTime(doc, bar.time));
  }
  const chords = el(doc, "div", "ccs-chords");
  if (bar.repeat) {
    chords.classList.add("ccs-chords-repeat");
    chords.appendChild(measureRepeatSvg(doc));
  } else {
    for (const token of bar.tokens) {
      let node: HTMLElement;
      switch (token.kind) {
        case "chord":
          node = renderChordDisplay(doc, formatChord(token.chord), "ccs-token ccs-chord");
          break;
        case "nc":
          node = renderChordDisplay(doc, formatNoChord(), "ccs-token ccs-nc");
          break;
        case "unknown":
          node = el(doc, "span", "ccs-token ccs-unknown", token.raw);
          break;
        case "hold":
          node = el(doc, "span", "ccs-token ccs-hold");
          break;
      }
      if (bar.tokens.length === 1) {
        node.classList.add("ccs-centered");
        node.style.left = "50%";
      } else {
        node.style.left = `${token.position * 100}%`;
      }
      chords.appendChild(node);
    }
  }
  body.appendChild(chords);
  cell.appendChild(body);
  return cell;
}

function renderLine(doc: Document, line: Line, label: string | null, isFirstBarOfChart: boolean): HTMLElement {
  const row = el(doc, "div", "ccs-row");
  const gutter = el(doc, "div", "ccs-gutter");
  if (label !== null) gutter.appendChild(el(doc, "span", "ccs-section-box", label));
  row.appendChild(gutter);

  const spans = endingSpans(line.bars);
  line.bars.forEach((bar, i) => {
    const showTime = bar.timeToken || (isFirstBarOfChart && i === 0);
    row.appendChild(renderBar(doc, bar, spans[i], i === line.bars.length - 1, showTime));
  });
  return row;
}

function renderSection(doc: Document, section: Section, firstInChart: boolean): HTMLElement[] {
  return section.lines.map((line, i) =>
    renderLine(doc, line, i === 0 ? section.label : null, firstInChart && i === 0)
  );
}

function renderHeader(doc: Document, sheet: ChordSheet): HTMLElement | null {
  const { header } = sheet;
  if (!header.title && !header.key && !header.keyRaw) return null;
  const node = el(doc, "div", "ccs-header");
  if (header.title) node.appendChild(el(doc, "div", "ccs-title", header.title));
  if (header.key) {
    node.appendChild(renderChordDisplay(doc, formatChord(header.key), "ccs-key"));
  } else if (header.keyRaw) {
    node.appendChild(el(doc, "div", "ccs-key", header.keyRaw));
  }
  return node;
}

function renderDiagnostics(doc: Document, sheet: ChordSheet): HTMLElement | null {
  if (sheet.diagnostics.length === 0) return null;
  const list = el(doc, "ul", "ccs-diagnostics");
  for (const d of sheet.diagnostics) {
    list.appendChild(el(doc, "li", `ccs-diag ccs-diag-${d.severity}`, `Line ${d.line}: ${d.message}`));
  }
  return list;
}

/** Renders the chord sheet into container. The container is emptied first. */
export function renderSheet(sheet: ChordSheet, doc: Document, container: HTMLElement): HTMLElement {
  container.textContent = "";
  const root = el(doc, "div", "ccs-sheet");

  const header = renderHeader(doc, sheet);
  if (header) root.appendChild(header);

  const body = el(doc, "div", "ccs-body");
  const cols = Math.max(1, ...sheet.sections.flatMap((s) => s.lines.map((l) => l.bars.length)));
  body.style.setProperty("--ccs-cols", String(cols));
  let first = true;
  for (const section of sheet.sections) {
    for (const row of renderSection(doc, section, first)) body.appendChild(row);
    if (section.lines.length > 0) first = false;
  }
  root.appendChild(body);

  const diagnostics = renderDiagnostics(doc, sheet);
  if (diagnostics) root.appendChild(diagnostics);

  container.appendChild(root);
  return root;
}
