## Context

Empty repository. The plugin targets Obsidian desktop and mobile and renders a fenced `chords` code block. The user writes charts by hand in a monospace editor, so the grammar must be forgiving about whitespace and easy to type. Visual reference is iReal Pro: bars in a grid, boxed section letters, chord qualities as small superscripts, repeat signs and endings drawn inline.

## Goals / Non-Goals

**Goals:**
- Render good looking iReal Pro style chord sheets from plain text.
- Grammar stable enough that charts written for v1 keep working in later versions.
- Parser and chord symbol logic fully unit tested without Obsidian.
- Reasonable PDF export through Obsidian's built-in export.

**Non-Goals:**
- Lyrics, melody, playback, audio of any kind.
- Transposition (kept easy by the AST shape, but not built).
- Automatic re-flow of bars per line. The source line breaks are the layout.
- Importing or exporting iReal Pro URLs.

## Decisions

**Fenced code block, not inline markdown.** A `chords` fence gives a clean boundary, works in both reading mode and live preview through `registerMarkdownCodeBlockProcessor`, and degrades to readable monospace text anywhere else. Rendering bare `| Bb | % |` lines was rejected because Obsidian's markdown pipeline collapses lines and detects tables.

**Timing by spacing, with even division.** Inside a bar, whitespace is tokenized: any run of 1-2 spaces separates tokens, every full run of 3 spaces becomes a hold token, and a tab is one hold. All tokens (chords and holds) divide the bar evenly. This matches how the charts look when typed in a fixed-width block, and needs no extra characters. Alternatives considered: `/` or `.` hold markers (rejected by the author as noise in a monospace block), proportional column measurement (rejected because chord name width would change timing). The renderer never needs the beat count to place chords; the time signature is used only for display and for flagging bars whose token count does not divide the beats.

**Layering.** Three modules with one-way dependencies:
- `src/parser/` (pure): text -> `ChordSheet` AST. Sections, lines, bars, bar line kinds, tokens (`chord`, `hold`, `repeat`, `time`, `nc`), plus a list of diagnostics with line numbers.
- `src/chords/` (pure): chord string -> `ChordSymbol` { root, accidental, quality, extensions, bass } and `ChordSymbol` -> display parts. Aliases normalized here (`m7` -> `-7`, `maj7` -> `^7`, `dim` -> `o`, `m7b5` -> `h7`).
- `src/render/`: AST -> DOM. Only this layer and `src/main.ts` import from `obsidian`.

**Layout with CSS grid.** Each source line becomes a grid row; each bar is a cell with a left border as the bar line and the last cell also drawing a right border. Chords inside a bar are absolutely positioned at `index / tokenCount` of the cell width. Double bars, repeat signs and endings are drawn with borders and Unicode music symbols (U+1D106, U+1D107, U+1D10B, U+1D10C). SVG was rejected for v1 because text rendering, theming and printing are simpler with DOM and CSS.

**Chord display.** Root letter at full size, accidental as a real glyph (U+266D, U+266F), quality and extensions as a superscript span, bass note after a slash at reduced size. `N.C.` renders as plain text. Unknown qualities are rendered verbatim rather than rejected, so odd spellings never break a chart.

**Time signature.** A token matching `\d+/\d+` at the start of a bar sets the time signature from that bar on and renders as a stacked numeral in that bar. The header `time:` sets the initial value; default is 4/4. Bars whose token count does not divide the beat count get a `data-timing="uneven"` attribute and a subtle marker, never an error.

**Errors.** The parser never throws. Unparseable lines become diagnostics; the renderer shows the chart it could parse and lists diagnostics below it. This keeps live preview usable while typing.

**Tooling.** Obsidian sample plugin layout: `manifest.json`, `main.ts`, esbuild config, `styles.css`. Vitest for parser and chord tests. No UI framework.

## Risks / Trade-offs

- [Space counting is invisible] -> Monospace editing makes it visible enough; the renderer shows holds as small dots when the "show holds" setting is on, so mistakes are easy to spot.
- [Live preview re-renders on every keystroke] -> Parsing is linear and tiny; no debouncing needed for realistic charts.
- [Unicode music glyphs missing on some platforms] -> Ship fallbacks: repeat signs can be drawn with borders and `:` characters if the glyph is not available. Decide after checking on iOS and Windows.
- [Themes override borders and fonts] -> Scope all CSS under a `.ccs-sheet` root and use Obsidian CSS variables for colors so light and dark themes both work.
- [Grid cells too narrow on mobile] -> Cells use a minimum width and the row scrolls horizontally rather than wrapping; the source line breaks stay authoritative.

## Open Questions

- Exact hold width in the "show holds" mode (dot vs thin tick).
- Whether repeat counts (`:||x3`) are shown as `x3` or spelled out.
