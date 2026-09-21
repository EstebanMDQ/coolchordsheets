## Why

There is no good way to keep chord charts as plain text in an Obsidian vault and still get a readable, iReal Pro style page out of them. Existing chord plugins are built around lyrics with inline chords, which is the wrong shape for instrumental charts that are just bars and chord symbols.

## What Changes

- New Obsidian plugin that renders a fenced `chords` code block as a chord sheet in reading mode and live preview.
- A plain-text grammar for chord sheets: optional header (title, key, time), bar lines with repeats, `%` repeat bars, section labels, first and second endings, coda and segno markers, and a time signature token at the start of any bar.
- Timing expressed through spacing inside a bar: tokens divide the bar evenly, and a run of three spaces is a hold that extends the previous chord by one token.
- Chord symbol formatting in the iReal Pro style: `-` minor, `^` major seventh, `h` half-diminished, `o` diminished, with common long-form aliases (`m7`, `maj7`, `dim`) accepted; accidentals rendered as flat and sharp glyphs; qualities superscripted; slash chords and `N.C.` supported.
- A CSS grid renderer that follows the source line breaks (no re-flowing), draws bar lines as borders, and ships a print stylesheet so Obsidian's PDF export looks right.
- A settings tab for the few visual options (font size, hold marker visibility).

## Capabilities

### New Capabilities
- `chord-sheet-grammar`: parsing a `chords` block into an AST of header, sections, lines, bars and tokens, including the spacing-based timing rules and error reporting.
- `chord-symbol-notation`: parsing a chord token into root, accidental, quality, extensions and bass note, and formatting it for display with iReal Pro spellings.
- `chord-sheet-rendering`: turning the AST into DOM with iReal Pro style layout, bar lines, repeats, endings, section boxes and print output.
- `plugin-integration`: registering the code block processor with Obsidian, the settings tab, and how parse errors are surfaced to the user.

### Modified Capabilities

(none, this is the first change in the project)

## Impact

- New codebase: TypeScript (strict), esbuild bundling, vitest for parser tests. Runtime dependency is only the `obsidian` API package.
- The parser and chord symbol modules have no Obsidian imports so they can be tested in Node and reused later (for example for transposition or export).
- Non-goals for v1: lyrics, playback, transposition, auto-layout of bars per line. The AST keeps root and quality separate so transposition can be added without a grammar change.
