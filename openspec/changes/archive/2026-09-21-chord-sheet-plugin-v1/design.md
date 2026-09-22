## Context

Empty repository. The plugin targets Obsidian desktop and mobile and renders a fenced `chordsheet` code block. The user writes charts by hand in a monospace editor, so the grammar must be forgiving about whitespace and easy to type. Visual reference is iReal Pro: bars in a grid, boxed section letters, chord qualities as small superscripts, repeat signs and endings drawn inline.

## Goals / Non-Goals

**Goals:**
- Render good looking iReal Pro style chord sheets from plain text.
- Grammar stable enough that charts written for v1 keep working in later versions.
- Parser, chord symbol and renderer logic unit tested without a running Obsidian.
- Reasonable PDF export through Obsidian's built-in export.

**Non-Goals:**
- Lyrics, melody, playback, audio of any kind.
- Transposition (kept easy by the AST shape, but not built).
- Automatic re-flow of bars per line. The source line breaks are the layout.
- Importing or exporting iReal Pro URLs.
- Two-bar repeat (`%%`), display of extra header keys, multi-bar ending ranges beyond `[n.-m.]` text.

## Decisions

**Fenced code block named `chordsheet`, not inline markdown.** A fence gives a clean boundary, works in both reading mode and live preview through `registerMarkdownCodeBlockProcessor`, and degrades to readable monospace text anywhere else. Rendering bare `| Bb | % |` lines was rejected because Obsidian's markdown pipeline collapses lines and detects tables. The language is `chordsheet` rather than `chords` because Obsidian throws when two plugins register the same language and `chords` is taken by existing plugins; registration is still wrapped in try/catch with a Notice.

**Timing by spacing, with even division and an explicit escape hatch.** Inside a bar, one padding space is stripped from each end, then whitespace is tokenized: any run of 1-2 spaces separates tokens, every full run of 3 spaces becomes a hold token, a tab is one hold, and a standalone `_` is also a hold. Runs at the edges count too, so trailing holds (`| C D- G7    |`) work. All timing tokens (chords, holds, `N.C.`, unknown tokens) divide the bar evenly. This matches how the charts look when typed in a fixed-width block. The `_` spelling was added after review: linters, Prettier, trim-trailing-whitespace and mobile keyboards silently collapse runs of spaces, and a chart that depends only on whitespace can change timing with no diagnostic. Proportional column measurement was rejected because chord name width would change timing. The renderer never needs the beat count to place chords; the time signature is used only for display and for flagging bars whose slot count neither divides nor is divisible by the beat count.

**Parse order.** Lines are classified first (blank, comment, header, section label or line-level marker, line of bars). A line of bars is split on bar lines, then bracket markers and the time signature token are pulled from the start of each bar, and only then is the remainder whitespace-tokenized. This is what lets `[D.S. al Coda]` contain spaces. Section labels and bar markers share the `[...]` syntax; a bracket alone on a line is a marker for the next bar if its text is a reserved marker name, otherwise a section label.

**Layering.** Three modules with one-way dependencies:
- `src/parser/` (pure): text -> `ChordSheet` AST. Header (with `extra` map and a parsed key), sections, lines, bars, bar line kinds, markers, tokens (`chord`, `hold`, `repeat`, `time`, `nc`, `unknown`), plus diagnostics with block-relative line numbers and a severity (`error` or `warning`).
- `src/chords/` (pure): chord string -> `ChordSymbol` { root, accidental, quality (enum), extensions (string), bass, raw } and `ChordSymbol` -> display parts. The alias table lives here.
- `src/render/`: AST -> DOM. Takes a `Document` so it runs under happy-dom in tests. Only this layer and `src/main.ts` import from `obsidian`, and the import is stubbed in tests.

**Layout with CSS grid and fixed cell widths.** Each source line becomes a row with a fixed left gutter for the section box; each bar is a cell with a left border as the bar line and the last cell also drawing a right border. Cell width is `max(baseWidth, slots * minSlotWidth)`, so dense bars widen instead of overlapping. Rows scroll horizontally on screen and are scaled to the page width in print. Chords inside a bar are absolutely positioned at `index / slots` of the chord area (cell minus time signature gutter). Repeat dots are CSS pseudo elements; segno, coda and the measure repeat symbol are inline SVG. Unicode Musical Symbols (U+1D100 block) were rejected because they are missing on Android and inconsistent on Windows; SVG for the whole layout was rejected because text rendering, theming and printing are simpler with DOM and CSS.

**Chord display.** Root letter at full size, accidental as a real glyph (U+266D, U+266F) in both root and extensions, quality and extensions as a superscript span, bass note after a slash at reduced size. Root accidentals are greedy (`Cb9` is C-flat 9). `N.C.` renders as plain text. Unknown qualities are rendered verbatim with a warning diagnostic so typos are visible but never break a chart.

**Time signature.** A token matching `<n>/<d>` (d in 1, 2, 4, 8, 16) at the start of a bar sets the time signature from that bar on and renders as a stacked numeral in a gutter inside that bar. The header `time:` sets the initial value, shown in the first bar; default is 4/4. Uneven bars get `data-timing="uneven"` and a dotted top border, never an error.

**Errors.** The parser never throws. Problems become diagnostics with a severity; the renderer shows the chart it could parse and lists diagnostics below it, with warnings muted so live preview stays calm while typing. Render failures fall back to the raw text with the error inline, no toast.

**Settings through CSS.** Font size, show holds and uneven marker are written as a CSS variable and two classes on `document.body`. Holds and uneven borders are always rendered and toggled by CSS, so changing a setting updates every open chart with no re-render bookkeeping.

**Tooling.** Obsidian sample plugin layout: `manifest.json` (`isDesktopOnly: false`), `main.ts`, esbuild config, `styles.css`. Vitest with happy-dom. GitHub Actions runs build and test. No UI framework.

## Risks / Trade-offs

- [Space counting is invisible] -> Monospace editing makes it visible enough for hand-typed charts; the `_` hold exists for text that has passed through whitespace-collapsing tools; the "show holds" setting reveals holds as small dots.
- [Live preview re-renders on every keystroke] -> Parsing is linear and tiny (spec requires under 10 ms for 200 bars); no debouncing needed.
- [Wide rows in print] -> Rows are scaled to the printable width; a very long row becomes small but is never cut off.
- [Themes override borders and fonts] -> Scope all CSS under a `.ccs-sheet` root and use Obsidian CSS variables for colors so light and dark themes both work.
- [Grid cells too narrow on mobile] -> Cells have a minimum width and the row scrolls horizontally rather than wrapping; the source line breaks stay authoritative.
- [Jump markers sit at bar start in the grammar but at bar end in engraving] -> Rendered right-aligned above the bar, which reads correctly; a bar-end marker syntax is deferred.

## Open Questions

- Exact hold width in the "show holds" mode (dot vs thin tick).
