## Why

There is no good way to keep chord charts as plain text in an Obsidian vault and still get a readable, iReal Pro style page out of them. Existing chord plugins are built around lyrics with inline chords, which is the wrong shape for instrumental charts that are just bars and chord symbols.

## What Changes

- New Obsidian plugin that renders a fenced `chordsheet` code block as a chord sheet in reading mode and live preview. The fence name is deliberately specific because `chords` is already used by other plugins and Obsidian refuses duplicate registrations.
- A plain-text grammar for chord sheets: optional header (title, key, time, other keys kept as extra), bar lines with repeats (`|`, `||`, `||:`, `:||`, `:||:`, plus `|:` and `:|` aliases), `%` repeat bars, section labels, endings, coda, segno, fine and jump markers, free-text markers, comment lines, and a time signature token at the start of any bar.
- Timing expressed through spacing inside a bar: timing tokens divide the bar evenly, a run of three spaces or a tab is a hold that extends the previous chord by one slot, and `_` is an explicit hold for text that has passed through editors that collapse whitespace. `N.C.` and unrecognized tokens take a slot like a chord. Bars whose slot count does not fit the time signature get a subtle uneven marker, never an error.
- Chord symbol formatting in the iReal Pro style: `-` minor, `^` major seventh, `h` half-diminished, `o` diminished, with a fixed alias table for long forms (`m7`, `maj7`, `dim`, `m7b5`, `sus`, `aug`); accidentals rendered as flat and sharp glyphs in roots and extensions; qualities superscripted; slash chords supported.
- A CSS grid renderer that follows the source line breaks (no re-flowing), sizes cells by their slot count so dense bars never overlap, draws bar lines and repeat dots with CSS, uses inline SVG for music glyphs, and ships a print stylesheet so Obsidian's PDF export looks right.
- A settings tab for three visual options (font size, hold marker visibility, uneven marker visibility), applied through CSS so open charts update instantly.

## Worked examples

These four bars in 4/4 are the reference for the timing rules and are reused by the parser tests and the example notes.

| Source bar | Timing tokens | Result |
|---|---|---|
| `\| C \|` | C | C for the whole bar |
| `\| C G7 \|` | C, G7 | two half notes |
| `\| C   D- G7 \|` | C, hold, D-, G7 | C half note, D- and G7 quarters |
| `\| C D- G7    \|` | C, D-, G7, hold | three quarters, G7 held through beat 4 |

A full chart:

```
title: All of Me
key: C
time: 4/4

[A]
||: C | % | E7 | % |
| A7 | % | D- | % |
| [1.] E7 | % | A- | % :||
| [2.] E7 | % | A- | % ||
```

## Capabilities

### New Capabilities
- `chord-sheet-grammar`: parsing a `chordsheet` block into an AST of header, sections, lines, bars and tokens, including the spacing-based timing rules, marker handling and diagnostics with severities.
- `chord-symbol-notation`: parsing a chord token into root, accidental, quality, extensions and bass note through a fixed alias table, and formatting it for display with iReal Pro spellings.
- `chord-sheet-rendering`: turning the AST into DOM with iReal Pro style layout, cell sizing, bar lines, repeats, ending brackets, section boxes, markers and print output.
- `plugin-integration`: registering the code block processor with Obsidian, CSS-driven settings, mobile support, how failures are surfaced, and the build and CI setup.

### Modified Capabilities

(none, this is the first change in the project)

## Impact

- New codebase: TypeScript (strict), esbuild bundling, vitest with happy-dom for parser, chord and renderer tests. Runtime dependency is only the `obsidian` API package.
- The parser and chord symbol modules have no Obsidian imports so they can be tested in Node and reused later (for example for transposition or export).
- Non-goals for v1: lyrics, playback, transposition, auto-layout of bars per line, two-bar repeat (`%%`), displaying extra header keys such as `composer`, importing or exporting iReal Pro URLs. The AST keeps root and quality separate and parses the header key with the chord parser so transposition can be added without a grammar change.
