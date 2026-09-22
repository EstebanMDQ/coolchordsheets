export type Accidental = "flat" | "sharp" | null;

export type Quality =
  | "major"
  | "minor"
  | "dominant"
  | "maj7"
  | "minmaj7"
  | "halfdim"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4"
  | "unknown";

export interface Note {
  letter: string;
  accidental: Accidental;
}

export interface ChordSymbol {
  root: Note;
  quality: Quality;
  /** Normalized extension text, e.g. "7", "7b9", "6/9". Raw text when quality is unknown. */
  extensions: string;
  bass: Note | null;
  raw: string;
}

export interface ChordDisplay {
  root: string;
  accidental: string;
  quality: string;
  bass: string | null;
}

const FLAT = "♭";
const SHARP = "♯";
const DELTA = "Δ";

// Alterations that may trail any quality row and are appended to extensions verbatim.
const ALT = "((?:[b#](?:5|9|11|13))*)";

type Row = [RegExp, Quality, (m: RegExpMatchArray) => string];

// Longest and most specific aliases first. See chord-symbol-notation spec for the table.
const TABLE: Row[] = [
  [new RegExp(`^${ALT}$`), "major", (m) => m[1]],
  [new RegExp(`^(6|69|6/9|add9|add2)${ALT}$`), "major", (m) => m[1] + m[2]],
  [new RegExp(`^(?:maj|M)${ALT}$`), "major", (m) => m[1]],
  [new RegExp(`^(?:\\^|maj|M)(7|9|13)?${ALT}$`), "maj7", (m) => (m[1] ?? "7") + m[2]],
  [new RegExp(`^(?:-|m|min)(?:\\^|maj|M)7?${ALT}$`), "minmaj7", (m) => "7" + m[1]],
  [new RegExp(`^(?:h7?|(?:-|m|min)7b5)${ALT}$`), "halfdim", (m) => "7" + m[1]],
  [new RegExp(`^(?:-|m|min)(6|7|9|11|13|69|6/9)?${ALT}$`), "minor", (m) => (m[1] ?? "") + m[2]],
  [new RegExp(`^(?:o|dim)(7)?${ALT}$`), "dim", (m) => (m[1] ?? "") + m[2]],
  [new RegExp(`^(?:\\+7|7\\+|aug7|7#5)${ALT}$`), "aug", (m) => "7" + m[1]],
  [new RegExp(`^(?:\\+|aug|#5)${ALT}$`), "aug", (m) => m[1]],
  [new RegExp(`^(7|9|13)?sus4?${ALT}$`), "sus4", (m) => (m[1] ?? "") + m[2]],
  [new RegExp(`^(7)?sus2${ALT}$`), "sus2", (m) => (m[1] ?? "") + m[2]],
  [new RegExp(`^(7|9|11|13)${ALT}$`), "dominant", (m) => m[1] + m[2]],
  [new RegExp(`^7?alt$`), "dominant", () => "alt"],
];

function normalizeInput(text: string): string {
  return text
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/Δ/g, "^")
    .replace(/ø/g, "h")
    .replace(/°/g, "o");
}

function parseAccidental(ch: string | undefined): Accidental {
  if (ch === "b") return "flat";
  if (ch === "#") return "sharp";
  return null;
}

/** Parses a chord token. Returns null when the token has no valid root (uppercase A-G). */
export function parseChord(token: string): ChordSymbol | null {
  const text = normalizeInput(token);
  const letter = text.charAt(0);
  if (letter < "A" || letter > "G" || letter.length === 0) return null;

  let rest = text.slice(1);
  const rootAccidental = parseAccidental(rest.charAt(0));
  if (rootAccidental) rest = rest.slice(1);

  let bass: Note | null = null;
  const bassMatch = /\/([A-G])([b#])?$/.exec(rest);
  if (bassMatch) {
    bass = { letter: bassMatch[1], accidental: parseAccidental(bassMatch[2]) };
    rest = rest.slice(0, bassMatch.index);
  }

  const body = rest.replace(/[()]/g, "");
  for (const [re, quality, ext] of TABLE) {
    const m = re.exec(body);
    if (m) {
      return { root: { letter, accidental: rootAccidental }, quality, extensions: ext(m), bass, raw: token };
    }
  }
  return { root: { letter, accidental: rootAccidental }, quality: "unknown", extensions: body, bass, raw: token };
}

function accidentalGlyph(acc: Accidental): string {
  if (acc === "flat") return FLAT;
  if (acc === "sharp") return SHARP;
  return "";
}

function glyphExtensions(ext: string): string {
  return ext.replace(/b(?=\d)/g, FLAT).replace(/#(?=\d)/g, SHARP);
}

const QUALITY_GLYPH: Record<Quality, string> = {
  major: "",
  minor: "-",
  dominant: "",
  maj7: DELTA,
  minmaj7: "-" + DELTA,
  halfdim: "ø",
  dim: "o",
  aug: "+",
  sus2: "",
  sus4: "",
  unknown: "",
};

export function formatChord(chord: ChordSymbol): ChordDisplay {
  let quality: string;
  if (chord.quality === "unknown") {
    quality = chord.extensions;
  } else if (chord.quality === "sus4" || chord.quality === "sus2") {
    quality = glyphExtensions(chord.extensions) + chord.quality;
  } else {
    quality = QUALITY_GLYPH[chord.quality] + glyphExtensions(chord.extensions);
  }
  return {
    root: chord.root.letter,
    accidental: accidentalGlyph(chord.root.accidental),
    quality,
    bass: chord.bass ? chord.bass.letter + accidentalGlyph(chord.bass.accidental) : null,
  };
}

export function formatNoChord(): ChordDisplay {
  return { root: "N.C.", accidental: "", quality: "", bass: null };
}
