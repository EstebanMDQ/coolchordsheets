import { parseChord } from "../chords";
import type {
  Bar,
  BarLine,
  BarLineKind,
  ChordSheet,
  Diagnostic,
  Header,
  Line,
  Marker,
  Section,
  Severity,
  TimeSignature,
} from "./ast";

export * from "./ast";

const DEFAULT_TIME: TimeSignature = { beats: 4, unit: 4 };
const VALID_UNITS = new Set([1, 2, 4, 8, 16]);

// Longest spellings first so ":||:" wins over ":||" and "||:" over "||".
const BAR_LINE_RE = /:\|\|:|:\|\|(?:\s*[xX](\d+))?|\|\|:|\|\||:\|(?:\s*[xX](\d+))?|\|:|\|/g;

const HOLD = Symbol("hold");
type Word = string | typeof HOLD;

export function parseTimeSignature(text: string): TimeSignature | null {
  const m = /^(\d+)\/(\d+)$/.exec(text);
  if (!m) return null;
  const beats = Number(m[1]);
  const unit = Number(m[2]);
  if (beats < 1 || !VALID_UNITS.has(unit)) return null;
  return { beats, unit };
}

/** Returns a marker for reserved bracket text, or null when the text is not reserved. */
export function parseReservedMarker(text: string): Marker | null {
  const t = text.trim();
  if (/^\d+\.(?:-\d+\.)?$/.test(t)) return { kind: "ending", text: t };
  const lower = t.toLowerCase();
  if (lower === "coda") return { kind: "coda" };
  if (lower === "segno") return { kind: "segno" };
  if (lower === "fine") return { kind: "fine" };
  if (/^d\.?[sc]\.? al (?:coda|fine)$/i.test(t)) return { kind: "jump", text: t };
  return null;
}

function barLineFromText(text: string): BarLine {
  const count = /[xX](\d+)$/.exec(text);
  const core = text.replace(/\s*[xX]\d+$/, "");
  let kind: BarLineKind;
  switch (core) {
    case ":||:":
      kind = "repeatBoth";
      break;
    case ":||":
    case ":|":
      kind = "repeatClose";
      break;
    case "||:":
    case "|:":
      kind = "repeatOpen";
      break;
    case "||":
      kind = "double";
      break;
    default:
      kind = "single";
  }
  const line: BarLine = { kind };
  if (count) line.repeatCount = Number(count[1]);
  return line;
}

/** Whitespace tokenization of bar content after markers and time signature were removed. */
export function tokenizeWords(text: string): Word[] {
  const words: Word[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\t") {
      words.push(HOLD);
      i++;
    } else if (ch === " ") {
      let j = i;
      while (j < text.length && text[j] === " ") j++;
      const holds = Math.floor((j - i) / 3);
      for (let k = 0; k < holds; k++) words.push(HOLD);
      i = j;
    } else {
      let j = i;
      while (j < text.length && text[j] !== " " && text[j] !== "\t") j++;
      const word = text.slice(i, j);
      words.push(word === "_" ? HOLD : word);
      i = j;
    }
  }
  return words;
}

function isNoChord(word: string): boolean {
  return /^(?:n\.c\.|n\.c|nc)$/i.test(word);
}

class Parser {
  private diagnostics: Diagnostic[] = [];
  private header: Header = { time: DEFAULT_TIME, notes: [], extra: {} };
  private sections: Section[] = [{ label: null, lines: [] }];
  private currentTime: TimeSignature = DEFAULT_TIME;
  private seenBars = false;
  private barCount = 0;
  private pendingMarkers: Marker[] = [];
  private pendingMarkerLine = 0;
  private pendingOpenRepeat = false;
  private pendingOpenRepeatLine = 0;

  private diag(line: number, severity: Severity, message: string): void {
    this.diagnostics.push({ line, severity, message });
  }

  parse(source: string): ChordSheet {
    const lines = source.split(/\r?\n/);
    lines.forEach((raw, idx) => this.parseLine(raw, idx + 1));
    if (this.pendingMarkers.length > 0) {
      this.diag(this.pendingMarkerLine, "warning", "Marker on its own line has no following line of bars");
    }
    if (this.pendingOpenRepeat) {
      this.diag(this.pendingOpenRepeatLine, "warning", "Opening repeat at the end of the last line has no bars to open");
    }
    return {
      header: this.header,
      sections: this.sections.filter((s) => s.label !== null || s.lines.length > 0),
      diagnostics: this.diagnostics,
    };
  }

  private parseLine(rawLine: string, lineNo: number): void {
    // Non-breaking and other Unicode spaces count as plain spaces.
    const raw = rawLine.replace(/[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g, " ");
    const text = raw.trim();
    if (text === "" || text.startsWith("//")) return;

    // Header values are free text and may contain "|", so check them before bar lines.
    // A value that itself starts with a bar line is a malformed line of bars, not a header.
    const header = /^([A-Za-z]+):\s*(.*)$/.exec(text);
    if (header && !/^:?\|/.test(header[2])) {
      if (this.seenBars) {
        this.diag(lineNo, "error", `Unrecognized line: "${text}"`);
      } else {
        this.parseHeader(header[1].toLowerCase(), header[2].trim(), lineNo);
      }
      return;
    }

    if (text.includes("|")) {
      this.parseBarLine(raw, lineNo);
      return;
    }

    const bracket = /^\[([^\]]*)\]$/.exec(text);
    if (bracket) {
      const marker = parseReservedMarker(bracket[1]);
      if (marker) {
        this.pendingMarkers.push(marker);
        this.pendingMarkerLine = lineNo;
      } else {
        this.sections.push({ label: bracket[1].trim(), lines: [] });
      }
      return;
    }

    this.diag(lineNo, "error", `Unrecognized line: "${text}"`);
  }

  private parseHeader(key: string, value: string, lineNo: number): void {
    if (key === "title") {
      this.header.title = value;
    } else if (key === "author") {
      this.header.author = value;
    } else if (key === "notes") {
      if (value !== "") this.header.notes.push(value);
    } else if (key === "time") {
      const time = parseTimeSignature(value);
      if (time) {
        this.header.time = time;
        this.currentTime = time;
      } else {
        this.diag(lineNo, "warning", `Invalid time signature "${value}", using 4/4`);
      }
    } else if (key === "key") {
      if (value === "") return;
      const chord = parseChord(value);
      const simple =
        chord !== null &&
        (chord.quality === "major" || chord.quality === "minor") &&
        chord.extensions === "" &&
        chord.bass === null;
      if (chord && simple) {
        this.header.key = chord;
      } else {
        this.header.keyRaw = value;
        this.diag(lineNo, "warning", `Key "${value}" is not a root with optional minor spelling`);
      }
    } else {
      this.header.extra[key] = value;
    }
  }

  private parseBarLine(raw: string, lineNo: number): void {
    const text = raw.trim();
    const barLines: { text: string; index: number; length: number }[] = [];
    BAR_LINE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = BAR_LINE_RE.exec(text)) !== null) {
      barLines.push({ text: m[0], index: m.index, length: m[0].length });
    }

    const contents: string[] = [];
    const lines: BarLine[] = [];

    const first = barLines[0];
    const leading = text.slice(0, first.index);
    if (leading.trim() !== "") {
      this.diag(lineNo, "error", "Line of bars must begin with a bar line");
      lines.push({ kind: "single" });
      contents.push(leading);
    }
    for (let i = 0; i < barLines.length; i++) {
      const bl = barLines[i];
      lines.push(barLineFromText(bl.text));
      const end = i + 1 < barLines.length ? barLines[i + 1].index : text.length;
      const content = text.slice(bl.index + bl.length, end);
      if (i + 1 < barLines.length) {
        contents.push(content);
      } else if (content.trim() !== "") {
        this.diag(lineNo, "error", "Line of bars must end with a bar line");
        contents.push(content);
        lines.push({ kind: "single" });
      }
    }

    // The opening half of a trailing "||:" or ":||:" belongs to the next line.
    const last = lines[lines.length - 1];
    const carryOpen = last.kind === "repeatOpen" || last.kind === "repeatBoth";
    if (carryOpen && contents.length > 0) last.kind = last.kind === "repeatOpen" ? "double" : "repeatClose";

    if (this.pendingOpenRepeat && contents.length > 0) {
      const open = lines[0];
      if (open.kind === "single" || open.kind === "double") open.kind = "repeatOpen";
      this.pendingOpenRepeat = false;
    }

    if (contents.length === 0) {
      // A bar line alone on its line: only an opening repeat has somewhere to go.
      if (carryOpen) {
        this.pendingOpenRepeat = true;
        this.pendingOpenRepeatLine = lineNo;
        if (last.kind === "repeatBoth") this.diag(lineNo, "warning", "Closing repeat with no bars is ignored");
      } else {
        this.diag(lineNo, "warning", "Bar line with no bars is ignored");
      }
      return;
    }

    const bars: Bar[] = contents.map((content, i) => this.parseBar(content, lines[i], lines[i + 1], lineNo));
    if (this.pendingMarkers.length > 0) {
      bars[0].markers.unshift(...this.pendingMarkers);
      this.pendingMarkers = [];
    }
    if (carryOpen) {
      this.pendingOpenRepeat = true;
      this.pendingOpenRepeatLine = lineNo;
    }

    const line: Line = { bars, line: lineNo };
    this.sections[this.sections.length - 1].lines.push(line);
    this.seenBars = true;
  }

  private parseBar(rawContent: string, open: BarLine, close: BarLine, lineNo: number): Bar {
    let content = rawContent;
    if (content.startsWith(" ")) content = content.slice(1);
    if (content.endsWith(" ")) content = content.slice(0, -1);

    const markers: Marker[] = [];
    let time = this.currentTime;
    let timeToken = false;

    // Markers and a time signature may appear in any order at the start of the bar.
    for (;;) {
      const marker = /^ {0,2}\[([^\]]*)\]/.exec(content);
      if (marker) {
        markers.push(parseReservedMarker(marker[1]) ?? { kind: "text", text: marker[1].trim() });
        content = content.slice(marker[0].length);
        continue;
      }
      if (!timeToken) {
        const ts = /^ {0,2}(\d+\/\d+)(?=[ \t]|$)/.exec(content);
        const parsed = ts ? parseTimeSignature(ts[1]) : null;
        if (ts && parsed) {
          time = parsed;
          timeToken = true;
          this.currentTime = parsed;
          content = content.slice(ts[0].length);
          continue;
        }
      }
      break;
    }

    const words = tokenizeWords(content);
    const barIndex = this.barCount++;
    const bar: Bar = {
      open,
      close,
      markers,
      time,
      timeToken,
      repeat: false,
      empty: false,
      tokens: [],
      uneven: false,
      line: lineNo,
    };

    if (words.length === 0) {
      bar.empty = true;
      this.diag(lineNo, "warning", "Empty bar");
      return bar;
    }

    if (words.length === 1 && words[0] === "%") {
      bar.repeat = true;
      if (barIndex === 0) this.diag(lineNo, "warning", "Repeat bar with no previous bar");
      return bar;
    }

    const count = words.length;
    words.forEach((word, index) => {
      const timed = { position: index / count, duration: 1 / count };
      if (word === HOLD) {
        bar.tokens.push({ kind: "hold", ...timed });
        return;
      }
      if (isNoChord(word)) {
        bar.tokens.push({ kind: "nc", ...timed });
        return;
      }
      const chord = word.startsWith("[") || word === "%" ? null : parseChord(word);
      if (chord) {
        if (chord.quality === "unknown") {
          this.diag(lineNo, "warning", `Unknown chord quality in "${word}"`);
        }
        bar.tokens.push({ kind: "chord", chord, ...timed });
        return;
      }
      this.diag(lineNo, "warning", `Unknown token "${word}"`);
      bar.tokens.push({ kind: "unknown", raw: word, ...timed });
    });

    const beats = time.beats;
    bar.uneven = beats % count !== 0 && count % beats !== 0;
    return bar;
  }
}

export function parseChordSheet(source: string): ChordSheet {
  return new Parser().parse(source);
}
