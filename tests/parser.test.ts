import { describe, expect, it } from "vitest";
import { parseChordSheet, type Bar, type ChordSheet, type Token } from "../src/parser";

function bars(sheet: ChordSheet): Bar[] {
  return sheet.sections.flatMap((s) => s.lines.flatMap((l) => l.bars));
}

function firstBar(source: string): Bar {
  return bars(parseChordSheet(source))[0];
}

/** Compact description of a bar's tokens, e.g. "C hold D- G7". */
function kinds(tokens: Token[]): string {
  return tokens
    .map((t) => {
      switch (t.kind) {
        case "chord":
          return t.chord.raw;
        case "hold":
          return "hold";
        case "nc":
          return "nc";
        case "unknown":
          return `?${t.raw}`;
      }
    })
    .join(" ");
}

function bar(content: string, header = ""): Bar {
  return firstBar(`${header}|${content}|`);
}

describe("parse order and line classification", () => {
  it("marker with spaces survives tokenization", () => {
    const b = bar(" [D.S. al Coda] G7 C ");
    expect(b.markers).toEqual([{ kind: "jump", text: "D.S. al Coda" }]);
    expect(kinds(b.tokens)).toBe("G7 C");
  });

  it("blank lines between systems are ignored", () => {
    const sheet = parseChordSheet("| C |\n\n| G |");
    expect(sheet.sections[0].lines).toHaveLength(2);
    expect(sheet.diagnostics).toEqual([]);
  });

  it("comment lines are ignored", () => {
    const sheet = parseChordSheet("// swing feel\n| C |");
    expect(bars(sheet)).toHaveLength(1);
    expect(sheet.diagnostics).toEqual([]);
  });

  it("garbage line is an error and parsing continues", () => {
    const sheet = parseChordSheet("| C |\nthis is not a bar\n| G |");
    expect(sheet.diagnostics).toEqual([{ line: 2, severity: "error", message: expect.stringContaining("Unrecognized line") }]);
    expect(bars(sheet)).toHaveLength(2);
  });
});

describe("header", () => {
  it("all keys", () => {
    const sheet = parseChordSheet("title: All of Me\nkey: Bb\ntime: 3/4\n| C |");
    expect(sheet.header.title).toBe("All of Me");
    expect(sheet.header.key).toMatchObject({ root: { letter: "B", accidental: "flat" }, quality: "major" });
    expect(sheet.header.time).toEqual({ beats: 3, unit: 4 });
    expect(bars(sheet)[0].time).toEqual({ beats: 3, unit: 4 });
  });

  it("author and notes", () => {
    const sheet = parseChordSheet("author: Esteban\nnotes: Play it uptempo\n| C |");
    expect(sheet.header.author).toBe("Esteban");
    expect(sheet.header.notes).toEqual(["Play it uptempo"]);
    expect(sheet.diagnostics).toEqual([]);
  });

  it("repeated notes", () => {
    const sheet = parseChordSheet("notes: Medium swing\nnotes: Solos on A only\n| C |");
    expect(sheet.header.notes).toEqual(["Medium swing", "Solos on A only"]);
  });

  it("header value starting with a colon", () => {
    const sheet = parseChordSheet("title: :) smile\n| C |");
    expect(sheet.header.title).toBe(":) smile");
    expect(sheet.diagnostics).toEqual([]);
  });

  it("header value containing a bar character", () => {
    const sheet = parseChordSheet("title: Me | You\nnotes: Intro | Head | Solos\n| C |");
    expect(sheet.header.title).toBe("Me | You");
    expect(sheet.header.notes).toEqual(["Intro | Head | Solos"]);
    expect(bars(sheet)).toHaveLength(1);
    expect(sheet.diagnostics).toEqual([]);
  });

  it("empty notes value is dropped", () => {
    expect(parseChordSheet("notes:\n| C |").header.notes).toEqual([]);
  });

  it("empty key value is ignored without a warning", () => {
    const sheet = parseChordSheet("key:\n| C |");
    expect(sheet.header.key).toBeUndefined();
    expect(sheet.header.keyRaw).toBeUndefined();
    expect(sheet.diagnostics).toEqual([]);
  });

  it("header-shaped line with a bar after bars is unrecognized", () => {
    const sheet = parseChordSheet("| C |\ntitle: Me | You");
    expect(bars(sheet)).toHaveLength(1);
    expect(sheet.diagnostics).toEqual([{ line: 2, severity: "error", message: expect.stringContaining("Unrecognized") }]);
  });

  it("word and colon before a bar line is a malformed line of bars", () => {
    const sheet = parseChordSheet("Intro: | C | G |");
    expect(sheet.header.extra).toEqual({});
    expect(bars(sheet)).toHaveLength(3);
    expect(sheet.diagnostics[0]).toMatchObject({ line: 1, severity: "error", message: "Line of bars must begin with a bar line" });
  });

  it("minor key", () => {
    const sheet = parseChordSheet("key: G-\n| C |");
    expect(sheet.header.key).toMatchObject({ root: { letter: "G", accidental: null }, quality: "minor" });
  });

  it("title containing a colon", () => {
    expect(parseChordSheet("title: Song: Part 2\n| C |").header.title).toBe("Song: Part 2");
  });

  it("unknown key stored in extra", () => {
    const sheet = parseChordSheet("composer: Gerald Marks\n| C |");
    expect(sheet.header.extra.composer).toBe("Gerald Marks");
    expect(sheet.diagnostics).toEqual([]);
  });

  it("header line after bars is an error", () => {
    const sheet = parseChordSheet("| C |\ntitle: Late");
    expect(sheet.header.title).toBeUndefined();
    expect(sheet.diagnostics).toEqual([{ line: 2, severity: "error", message: expect.any(String) }]);
  });

  it("no header defaults to 4/4", () => {
    const sheet = parseChordSheet("| C |");
    expect(sheet.header.title).toBeUndefined();
    expect(sheet.header.key).toBeUndefined();
    expect(sheet.header.author).toBeUndefined();
    expect(sheet.header.notes).toEqual([]);
    expect(sheet.header.time).toEqual({ beats: 4, unit: 4 });
  });

  it("invalid time and key produce warnings", () => {
    const sheet = parseChordSheet("time: 4/3\nkey: G minor\n| C |");
    expect(sheet.header.time).toEqual({ beats: 4, unit: 4 });
    expect(sheet.header.keyRaw).toBe("G minor");
    expect(sheet.diagnostics.map((d) => d.severity)).toEqual(["warning", "warning"]);
  });
});

describe("bar lines", () => {
  it("simple line", () => {
    const sheet = parseChordSheet("|| Bb | % | % | % |");
    const line = sheet.sections[0].lines[0];
    expect(line.bars).toHaveLength(4);
    expect(line.bars[0].open.kind).toBe("double");
    expect(line.bars[1].open.kind).toBe("single");
    expect(line.bars[3].close.kind).toBe("single");
  });

  it("repeat with count", () => {
    const line = parseChordSheet("||: C | G :||x3").sections[0].lines[0];
    expect(line.bars[0].open.kind).toBe("repeatOpen");
    expect(line.bars[1].close).toEqual({ kind: "repeatClose", repeatCount: 3 });
  });

  it("repeat count with space", () => {
    const line = parseChordSheet("||: C | G :|| x3").sections[0].lines[0];
    expect(line.bars).toHaveLength(2);
    expect(line.bars[1].close).toEqual({ kind: "repeatClose", repeatCount: 3 });
  });

  it("short repeat spellings", () => {
    const a = parseChordSheet("|: C | G :|");
    const b = parseChordSheet("||: C | G :||");
    expect(a.sections).toEqual(b.sections);
  });

  it("close and reopen", () => {
    const line = parseChordSheet("||: C :||: G :||").sections[0].lines[0];
    expect(line.bars).toHaveLength(2);
    expect(line.bars[0].close.kind).toBe("repeatBoth");
    expect(line.bars[1].open.kind).toBe("repeatBoth");
  });

  it("opening repeat at line end carries to the next line", () => {
    const sheet = parseChordSheet("| C | G ||:\n| A- | D7 :||");
    const lines = sheet.sections[0].lines;
    expect(lines[0].bars[1].close.kind).toBe("double");
    expect(lines[1].bars[0].open.kind).toBe("repeatOpen");
    expect(sheet.diagnostics).toEqual([]);
  });

  it("close and reopen at line end closes this line and opens the next", () => {
    const sheet = parseChordSheet("| C | G :||:\n| D | E :||");
    const [a, b] = sheet.sections[0].lines;
    expect(a.bars[1].close.kind).toBe("repeatClose");
    expect(b.bars[0].open.kind).toBe("repeatOpen");
    expect(sheet.diagnostics).toEqual([]);
  });

  it("bar line alone on a line warns", () => {
    const sheet = parseChordSheet("| C |\n:||\n| D |");
    expect(bars(sheet)).toHaveLength(2);
    expect(sheet.diagnostics).toEqual([{ line: 2, severity: "warning", message: expect.stringContaining("ignored") }]);
  });

  it("close and reopen alone on a line opens the next line and warns about the close", () => {
    const sheet = parseChordSheet("| C |\n:||:\n| D |");
    expect(sheet.sections[0].lines[1].bars[0].open.kind).toBe("repeatOpen");
    expect(sheet.diagnostics).toEqual([{ line: 2, severity: "warning", message: expect.stringContaining("Closing") }]);
  });

  it("opening repeat at end of last line warns", () => {
    const sheet = parseChordSheet("| C | G ||:");
    expect(sheet.diagnostics).toEqual([{ line: 1, severity: "warning", message: expect.any(String) }]);
  });

  it("missing closing bar line", () => {
    const sheet = parseChordSheet("| C | G");
    expect(bars(sheet)).toHaveLength(2);
    expect(sheet.diagnostics).toEqual([{ line: 1, severity: "error", message: expect.stringContaining("end with a bar line") }]);
  });

  it("missing opening bar line", () => {
    const sheet = parseChordSheet("C | G |");
    expect(bars(sheet)).toHaveLength(2);
    expect(sheet.diagnostics[0]).toMatchObject({ severity: "error" });
  });

  it("empty bar", () => {
    const sheet = parseChordSheet("| C | | G |");
    const b = bars(sheet);
    expect(b).toHaveLength(3);
    expect(b[1].empty).toBe(true);
    expect(b[1].tokens).toEqual([]);
    expect(sheet.diagnostics).toEqual([{ line: 1, severity: "warning", message: "Empty bar" }]);
  });
});

describe("repeat bar", () => {
  it("repeat token", () => {
    const b = bars(parseChordSheet("| Bb | % |"));
    expect(b[1].repeat).toBe(true);
    expect(b[1].tokens).toEqual([]);
  });

  it("repeat with time signature", () => {
    const b = bar(" 3/4 % ");
    expect(b.repeat).toBe(true);
    expect(b.time).toEqual({ beats: 3, unit: 4 });
  });

  it("repeat in first bar warns", () => {
    const sheet = parseChordSheet("| % | C |");
    expect(bars(sheet)[0].repeat).toBe(true);
    expect(sheet.diagnostics).toEqual([{ line: 1, severity: "warning", message: expect.stringContaining("no previous bar") }]);
  });

  it("repeat in second bar of first line does not warn", () => {
    expect(parseChordSheet("| Bb | % |").diagnostics).toEqual([]);
  });

  it("percent among other tokens is unknown", () => {
    const b = bar(" C % ");
    expect(kinds(b.tokens)).toBe("C ?%");
  });
});

describe("whitespace tokenization", () => {
  it("two chords, single space", () => expect(kinds(bar(" A- Bbmaj7 ").tokens)).toBe("A- Bbmaj7"));
  it("three spaces produce a hold", () => expect(kinds(bar(" C   D- G7 ").tokens)).toBe("C hold D- G7"));
  it("six spaces produce two holds", () => expect(kinds(bar(" C      D- ").tokens)).toBe("C hold hold D-"));
  it("four spaces produce one hold", () => expect(kinds(bar(" C    D- ").tokens)).toBe("C hold D-"));
  it("padding space stripped", () => expect(kinds(bar(" C D- ").tokens)).toBe("C D-"));
  it("trailing hold", () => expect(kinds(bar(" C D- G7    ").tokens)).toBe("C D- G7 hold"));
  it("leading hold with tab", () => expect(kinds(bar("\tC").tokens)).toBe("hold C"));
  it("two leading spaces are a separator", () => expect(kinds(bar("   C").tokens)).toBe("C"));
  it("tab is a hold", () => expect(kinds(bar("C\tD-").tokens)).toBe("C hold D-"));
  it("mixed tab and spaces", () => expect(kinds(bar(" C \t   D- ").tokens)).toBe("C hold hold D-"));
  it("explicit hold character", () => expect(kinds(bar(" C _ D- G7 ").tokens)).toBe("C hold D- G7"));
  it("non-breaking space separates tokens", () => expect(kinds(bar(" C\u00a0D- ").tokens)).toBe("C D-"));
  it("other unicode spaces separate tokens", () => expect(kinds(bar(" C\u2009D-\u3000G7\u1680A-\u205fE7 ").tokens)).toBe("C D- G7 A- E7"));
});

describe("timing tokens and even division", () => {
  it("half note then two quarters", () => {
    const b = bar(" C   D- G7 ");
    expect(b.tokens.map((t) => t.position)).toEqual([0, 0.25, 0.5, 0.75]);
    expect(b.tokens.map((t) => t.duration)).toEqual([0.25, 0.25, 0.25, 0.25]);
    expect(b.uneven).toBe(false);
  });

  it("uneven token count flagged", () => {
    const b = bar(" C   D- ");
    expect(b.tokens.map((t) => t.position)).toEqual([0, 1 / 3, 2 / 3]);
    expect(b.uneven).toBe(true);
  });

  it("subdivision is even", () => {
    expect(bar(" C D E F G A B C ").uneven).toBe(false);
  });

  it("two tokens in three four", () => {
    expect(bar(" C D- ", "time: 3/4\n").uneven).toBe(true);
    expect(bar(" C D- G ", "time: 3/4\n").uneven).toBe(false);
  });

  it("time signature does not shift positions", () => {
    const b = bar(" 3/4 C D- G7 ");
    expect(b.tokens.map((t) => t.position)).toEqual([0, 1 / 3, 2 / 3]);
  });

  it("hold with no preceding chord occupies a slot", () => {
    const b = bar(" _ C ");
    expect(kinds(b.tokens)).toBe("hold C");
    expect(b.tokens[1].position).toBe(0.5);
  });
});

describe("time signature token", () => {
  it("time signature in first bar", () => {
    const b = firstBar("|| 4/4 A- Bbmaj7 ||");
    expect(b.time).toEqual({ beats: 4, unit: 4 });
    expect(b.timeToken).toBe(true);
    expect(b.tokens.map((t) => t.duration)).toEqual([0.5, 0.5]);
  });

  it("time signature change mid chart", () => {
    const b = bars(parseChordSheet("| C | 3/4 D- | G |\n| A- |"));
    expect(b[0].time.beats).toBe(4);
    expect(b[1].time.beats).toBe(3);
    expect(b[2].time.beats).toBe(3);
    expect(b[3].time.beats).toBe(3);
    expect(b[2].timeToken).toBe(false);
  });

  it("marker before time signature", () => {
    const b = bar(" [1.] 3/4 C ");
    expect(b.markers).toEqual([{ kind: "ending", text: "1." }]);
    expect(b.time.beats).toBe(3);
    expect(kinds(b.tokens)).toBe("C");
  });

  it("time signature before marker", () => {
    const b = bar(" 3/4 [1.] C ");
    expect(b.markers).toEqual([{ kind: "ending", text: "1." }]);
    expect(b.time.beats).toBe(3);
    expect(kinds(b.tokens)).toBe("C");
  });

  it("time signature mid bar is unknown", () => {
    const sheet = parseChordSheet("| C 3/4 D- |");
    expect(kinds(bars(sheet)[0].tokens)).toBe("C ?3/4 D-");
    expect(sheet.diagnostics).toEqual([{ line: 1, severity: "warning", message: expect.stringContaining("3/4") }]);
  });

  it("invalid denominator is unknown", () => {
    expect(kinds(bar(" 4/3 C ").tokens)).toBe("?4/3 C");
  });
});

describe("section labels and line-level markers", () => {
  it("section label", () => {
    const sheet = parseChordSheet("| C |\n[A]\n| G |\n| D |");
    expect(sheet.sections.map((s) => s.label)).toEqual([null, "A"]);
    expect(sheet.sections[1].lines).toHaveLength(2);
  });

  it("first section label only", () => {
    const sheet = parseChordSheet("[A]\n| C |");
    expect(sheet.sections.map((s) => s.label)).toEqual(["A"]);
  });

  it("coda on its own line attaches to the next bar", () => {
    const sheet = parseChordSheet("[coda]\n| F | C ||");
    expect(sheet.sections).toHaveLength(1);
    expect(sheet.sections[0].label).toBeNull();
    expect(bars(sheet)[0].markers).toEqual([{ kind: "coda" }]);
  });

  it("line-level marker with no following bars warns", () => {
    const sheet = parseChordSheet("| C |\n[coda]");
    expect(sheet.diagnostics).toEqual([{ line: 2, severity: "warning", message: expect.any(String) }]);
  });
});

describe("bar markers", () => {
  it("first ending", () => {
    const b = bar(" [1.] G7 C ");
    expect(b.markers).toEqual([{ kind: "ending", text: "1." }]);
    expect(kinds(b.tokens)).toBe("G7 C");
  });

  it("ending range", () => {
    expect(bar(" [1.-2.] G7 ").markers).toEqual([{ kind: "ending", text: "1.-2." }]);
  });

  it("coda marker", () => {
    const b = bar(" [coda] F ");
    expect(b.markers).toEqual([{ kind: "coda" }]);
    expect(kinds(b.tokens)).toBe("F");
  });

  it("marker case", () => {
    expect(bar(" [CODA] F ").markers).toEqual([{ kind: "coda" }]);
    expect(bar(" [Fine] F ").markers).toEqual([{ kind: "fine" }]);
    expect(bar(" [d.c. al fine] F ").markers).toEqual([{ kind: "jump", text: "d.c. al fine" }]);
  });

  it("text marker", () => {
    const sheet = parseChordSheet("| [Solo] C |");
    expect(bars(sheet)[0].markers).toEqual([{ kind: "text", text: "Solo" }]);
    expect(sheet.diagnostics).toEqual([]);
  });

  it("bracket inside bar is unknown", () => {
    const sheet = parseChordSheet("| C [Solo] G |");
    expect(kinds(bars(sheet)[0].tokens)).toBe("C ?[Solo] G");
    expect(sheet.diagnostics[0].severity).toBe("warning");
  });

  it("several markers", () => {
    const b = bar(" [segno] [2.] C ");
    expect(b.markers).toEqual([{ kind: "segno" }, { kind: "ending", text: "2." }]);
  });
});

describe("no chord", () => {
  it("N.C. token", () => {
    const b = bar(" N.C. G7 ");
    expect(kinds(b.tokens)).toBe("nc G7");
    expect(b.tokens.map((t) => t.duration)).toEqual([0.5, 0.5]);
  });

  it("accepted forms", () => {
    for (const form of ["N.C", "NC", "nc", "n.c."]) {
      expect(kinds(bar(` ${form} `).tokens)).toBe("nc");
    }
  });
});

describe("unknown tokens", () => {
  it("unknown root", () => {
    const sheet = parseChordSheet("| H7 C |");
    const b = bars(sheet)[0];
    expect(kinds(b.tokens)).toBe("?H7 C");
    expect(b.tokens.map((t) => t.duration)).toEqual([0.5, 0.5]);
    expect(sheet.diagnostics).toEqual([{ line: 1, severity: "warning", message: 'Unknown token "H7"' }]);
  });

  it("two-bar repeat symbol", () => {
    const sheet = parseChordSheet("| %% |");
    expect(kinds(bars(sheet)[0].tokens)).toBe("?%%");
    expect(sheet.diagnostics[0].severity).toBe("warning");
  });

  it("unknown quality", () => {
    const sheet = parseChordSheet("| Cweird9 |");
    const t = bars(sheet)[0].tokens[0];
    expect(t.kind).toBe("chord");
    if (t.kind === "chord") expect(t.chord.raw).toBe("Cweird9");
    expect(sheet.diagnostics).toEqual([{ line: 1, severity: "warning", message: expect.stringContaining("Cweird9") }]);
  });
});

describe("worked examples from the proposal", () => {
  it("whole bar", () => expect(bar(" C ").tokens.map((t) => t.duration)).toEqual([1]));
  it("two half notes", () => expect(kinds(bar(" C G7 ").tokens)).toBe("C G7"));
  it("half then two quarters", () => expect(kinds(bar(" C   D- G7 ").tokens)).toBe("C hold D- G7"));
  it("three quarters with held last", () => expect(kinds(bar(" C D- G7    ").tokens)).toBe("C D- G7 hold"));

  it("full chart", () => {
    const source = [
      "title: All of Me",
      "key: C",
      "time: 4/4",
      "",
      "[A]",
      "||: C | % | E7 | % |",
      "| A7 | % | D- | % |",
      "| [1.] E7 | % | A- | % :||",
      "| [2.] E7 | % | A- | % ||",
    ].join("\n");
    const sheet = parseChordSheet(source);
    expect(sheet.diagnostics).toEqual([]);
    expect(sheet.sections).toHaveLength(1);
    expect(sheet.sections[0].label).toBe("A");
    expect(sheet.sections[0].lines).toHaveLength(4);
    expect(bars(sheet)).toHaveLength(16);
    expect(sheet.sections[0].lines[2].bars[3].close.kind).toBe("repeatClose");
  });
});

describe("diagnostics and robustness", () => {
  it("never throws on odd input", () => {
    for (const s of ["", "|", "||||", "|:|", "[", "[]", "a: b: c", ":||x", "| [ |", "\t\t", "| C |\r\n| G |"]) {
      expect(() => parseChordSheet(s)).not.toThrow();
    }
  });

  it("200 bars parse in under 10 ms", () => {
    const line = "| C   D- G7 | F^7 | Bb7 A-7 D7 G-7 | %% |";
    const source = Array.from({ length: 50 }, () => line).join("\n");
    parseChordSheet(source);
    const start = performance.now();
    const sheet = parseChordSheet(source);
    const elapsed = performance.now() - start;
    expect(bars(sheet)).toHaveLength(200);
    expect(elapsed).toBeLessThan(10);
  });
});
