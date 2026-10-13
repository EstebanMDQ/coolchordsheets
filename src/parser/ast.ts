import type { ChordSymbol } from "../chords";

export type Severity = "error" | "warning";

export interface Diagnostic {
  /** 1-based line number relative to the code block. */
  line: number;
  severity: Severity;
  message: string;
}

export interface TimeSignature {
  beats: number;
  unit: number;
}

export interface Header {
  title?: string;
  key?: ChordSymbol;
  /** Raw key text when it did not parse. */
  keyRaw?: string;
  author?: string;
  /** One entry per `notes:` line, in source order. */
  notes: string[];
  time: TimeSignature;
  extra: Record<string, string>;
}

export type BarLineKind = "single" | "double" | "repeatOpen" | "repeatClose" | "repeatBoth";

export interface BarLine {
  kind: BarLineKind;
  repeatCount?: number;
}

export type Marker =
  | { kind: "ending"; text: string }
  | { kind: "coda" }
  | { kind: "segno" }
  | { kind: "fine" }
  | { kind: "jump"; text: string }
  | { kind: "text"; text: string };

interface Timed {
  /** Fraction of the bar where the token starts, 0 to 1. */
  position: number;
  /** Fraction of the bar the token occupies. */
  duration: number;
}

export type Token =
  | ({ kind: "chord"; chord: ChordSymbol } & Timed)
  | ({ kind: "hold" } & Timed)
  | ({ kind: "nc" } & Timed)
  | ({ kind: "unknown"; raw: string } & Timed);

export interface Bar {
  open: BarLine;
  close: BarLine;
  markers: Marker[];
  time: TimeSignature;
  /** True when this bar carries its own time signature token. */
  timeToken: boolean;
  repeat: boolean;
  empty: boolean;
  tokens: Token[];
  uneven: boolean;
  line: number;
}

export interface Line {
  bars: Bar[];
  line: number;
}

export interface Section {
  label: string | null;
  lines: Line[];
}

export interface ChordSheet {
  header: Header;
  sections: Section[];
  diagnostics: Diagnostic[];
}
