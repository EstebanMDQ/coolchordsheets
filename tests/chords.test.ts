import { describe, expect, it } from "vitest";
import { formatChord, formatNoChord, parseChord, type ChordSymbol } from "../src/chords";

function p(token: string): ChordSymbol {
  const c = parseChord(token);
  if (!c) throw new Error(`expected ${token} to parse`);
  return c;
}

function same(a: string, b: string): void {
  const { raw: _a, ...ca } = p(a);
  const { raw: _b, ...cb } = p(b);
  expect(ca).toEqual(cb);
}

describe("chord token grammar", () => {
  it("minor seventh with flat root", () => {
    const c = p("Bb-7");
    expect(c.root).toEqual({ letter: "B", accidental: "flat" });
    expect(c.quality).toBe("minor");
    expect(c.extensions).toBe("7");
    expect(c.bass).toBeNull();
  });

  it("greedy root accidental", () => {
    const c = p("Cb9");
    expect(c.root).toEqual({ letter: "C", accidental: "flat" });
    expect(c.quality).toBe("dominant");
    expect(c.extensions).toBe("9");
  });

  it("slash chord", () => {
    const c = p("C/E");
    expect(c.root.letter).toBe("C");
    expect(c.quality).toBe("major");
    expect(c.bass).toEqual({ letter: "E", accidental: null });
  });

  it("slash chord with accidental bass", () => {
    const c = p("F#-7/A#");
    expect(c.root).toEqual({ letter: "F", accidental: "sharp" });
    expect(c.quality).toBe("minor");
    expect(c.extensions).toBe("7");
    expect(c.bass).toEqual({ letter: "A", accidental: "sharp" });
  });

  it("six nine with bass", () => {
    const c = p("C6/9/E");
    expect(c.quality).toBe("major");
    expect(c.extensions).toBe("6/9");
    expect(c.bass).toEqual({ letter: "E", accidental: null });
  });

  it("parentheses stripped", () => same("C7(b9)", "C7b9"));

  it("unicode input accepted", () => same("B♭Δ7", "Bb^7"));

  it("lowercase root rejected", () => {
    expect(parseChord("bb7")).toBeNull();
    expect(parseChord("")).toBeNull();
    expect(parseChord("H7")).toBeNull();
  });

  it("unknown quality preserved", () => {
    const c = p("Cweird9");
    expect(c.root.letter).toBe("C");
    expect(c.quality).toBe("unknown");
    expect(c.extensions).toBe("weird9");
    expect(c.raw).toBe("Cweird9");
  });
});

describe("quality enum and alias table", () => {
  it("plain dominant", () => {
    const c = p("G7");
    expect(c.quality).toBe("dominant");
    expect(c.extensions).toBe("7");
  });

  it("plain major", () => {
    const c = p("C");
    expect(c.quality).toBe("major");
    expect(c.extensions).toBe("");
  });

  it("long-form minor alias", () => same("Am7", "A-7"));
  it("long-form major seventh alias", () => same("Cmaj7", "C^7"));

  it("major triad aliases", () => {
    for (const t of ["Cmaj", "CM"]) {
      expect(p(t).quality).toBe("major");
      expect(p(t).extensions).toBe("");
    }
  });

  it("half-diminished aliases", () => {
    for (const t of ["Bh7", "Bm7b5", "B-7b5", "Bø7", "Bh"]) {
      const c = p(t);
      expect(c.root.letter).toBe("B");
      expect(c.quality).toBe("halfdim");
      expect(c.extensions).toBe("7");
    }
  });

  it("minor major seventh", () => {
    for (const t of ["C-^7", "C-maj7", "CmM7", "Cm^7", "Cminmaj7"]) {
      expect(p(t).quality).toBe("minmaj7");
      expect(p(t).extensions).toBe("7");
    }
  });

  it("augmented spellings", () => {
    for (const t of ["C+7", "C7+", "C7#5", "Caug7"]) {
      expect(p(t).quality).toBe("aug");
      expect(p(t).extensions).toBe("7");
    }
    expect(p("C+").quality).toBe("aug");
    expect(p("C+").extensions).toBe("");
  });

  it("suspended", () => {
    expect(p("C7sus4")).toMatchObject({ quality: "sus4", extensions: "7" });
    expect(p("C9sus")).toMatchObject({ quality: "sus4", extensions: "9" });
    expect(p("Csus")).toMatchObject({ quality: "sus4", extensions: "" });
    expect(p("Csus2")).toMatchObject({ quality: "sus2", extensions: "" });
    expect(p("C7sus2")).toMatchObject({ quality: "sus2", extensions: "7" });
  });

  it("diminished", () => {
    for (const t of ["Co7", "Cdim7", "C°7"]) {
      expect(p(t)).toMatchObject({ quality: "dim", extensions: "7" });
    }
    expect(p("Co")).toMatchObject({ quality: "dim", extensions: "" });
    expect(p("Cdim")).toMatchObject({ quality: "dim", extensions: "" });
  });

  it("altered dominant", () => {
    expect(p("C13b9")).toMatchObject({ quality: "dominant", extensions: "13b9" });
    expect(p("Calt")).toMatchObject({ quality: "dominant", extensions: "alt" });
    expect(p("C7alt")).toMatchObject({ quality: "dominant", extensions: "alt" });
    expect(p("C7b9#11")).toMatchObject({ quality: "dominant", extensions: "7b9#11" });
  });

  it("six nine", () => {
    const c = p("C6/9");
    expect(c.quality).toBe("major");
    expect(c.extensions).toBe("6/9");
    expect(c.bass).toBeNull();
  });

  it("minor variants", () => {
    expect(p("C-")).toMatchObject({ quality: "minor", extensions: "" });
    expect(p("Cmin")).toMatchObject({ quality: "minor", extensions: "" });
    expect(p("C-6")).toMatchObject({ quality: "minor", extensions: "6" });
    expect(p("Cm11")).toMatchObject({ quality: "minor", extensions: "11" });
  });

  it("major seventh variants", () => {
    expect(p("C^")).toMatchObject({ quality: "maj7", extensions: "7" });
    expect(p("CM7")).toMatchObject({ quality: "maj7", extensions: "7" });
    expect(p("Cmaj9")).toMatchObject({ quality: "maj7", extensions: "9" });
    expect(p("C^13")).toMatchObject({ quality: "maj7", extensions: "13" });
  });
});

describe("display formatting", () => {
  it("format minor seventh", () => {
    expect(formatChord(p("Bbm7"))).toEqual({ root: "B", accidental: "♭", quality: "-7", bass: null });
  });

  it("format major seventh", () => {
    expect(formatChord(p("Cmaj7"))).toEqual({ root: "C", accidental: "", quality: "Δ7", bass: null });
  });

  it("format altered extension", () => {
    expect(formatChord(p("G7b9")).quality).toBe("7♭9");
    expect(formatChord(p("C7#11")).quality).toBe("7♯11");
  });

  it("format suspended", () => {
    expect(formatChord(p("C7sus4")).quality).toBe("7sus4");
    expect(formatChord(p("Csus")).quality).toBe("sus4");
  });

  it("format slash chord", () => {
    expect(formatChord(p("G7/B"))).toEqual({ root: "G", accidental: "", quality: "7", bass: "B" });
    expect(formatChord(p("C/Bb")).bass).toBe("B♭");
  });

  it("format other qualities", () => {
    expect(formatChord(p("Bh7")).quality).toBe("ø7");
    expect(formatChord(p("Co7")).quality).toBe("o7");
    expect(formatChord(p("C+7")).quality).toBe("+7");
    expect(formatChord(p("C-^7")).quality).toBe("-Δ7");
    expect(formatChord(p("C6/9")).quality).toBe("6/9");
    expect(formatChord(p("C")).quality).toBe("");
  });

  it("format unknown quality", () => {
    expect(formatChord(p("Cweird9"))).toEqual({ root: "C", accidental: "", quality: "weird9", bass: null });
  });

  it("format no chord", () => {
    expect(formatNoChord()).toEqual({ root: "N.C.", accidental: "", quality: "", bass: null });
  });
});
