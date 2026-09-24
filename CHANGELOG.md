# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-09-24

### Added

Obsidian plugin

- Renders `chordsheet` fenced code blocks as iReal Pro style charts in reading mode and live preview.
- Settings tab: chord font size (10 to 32 px), show holds as small dots, mark uneven bars. Changes apply to open charts immediately.
- Parse warnings are listed under the chart and never hide it.

Grammar

- Header lines `title`, `key` and `time`; unknown keys are kept but not displayed. `//` comments and blank lines are ignored.
- Bar lines: single, double, opening and closing repeats, close and reopen, and closing repeats with a count (`:||x3`).
- `%` repeats the previous bar. A line ending in `||:` opens a repeat on the next line.
- Section labels (`[A]`) drawn as boxed labels in the left gutter.
- Bar markers: endings (`[1.]`, `[2.]`, `[1.-2.]`) with brackets spanning to the next ending or closing repeat, `[coda]`, `[segno]`, `[fine]`, `[D.S. al Coda]`, `[D.S. al Fine]`, `[D.C. al Coda]`, `[D.C. al Fine]`, and free text markers such as `[Solo]`.
- Time signature tokens (`3/4`) at the start of a bar, drawn in the bar; denominators 1, 2, 4, 8 and 16.

Timing

- Chords divide the bar evenly by slot count.
- Holds by spacing: a run of three spaces, a tab or `_` gives the previous chord one more slot.
- Bars whose slot count does not fit the time signature get a dotted top edge.
- `N.C.` takes a slot like a chord. Unrecognised tokens are rendered verbatim, take a slot and raise a warning.

Chord symbols

- Root, accidental, quality, extensions and optional `/bass`.
- iReal Pro spellings (`-`, `^`, `h`, `o`, `+`) and long form aliases (`m`, `min`, `maj`, `M`, `dim`, `aug`, `sus`, `add`, `m7b5`).
- Alterations `b5 #5 b9 #9 #11 b13`, with or without parentheses, in any order.
- Accidentals rendered as glyphs, `^` as Δ, `h` as ø. Unknown qualities are rendered verbatim and flagged.

Layout and styling

- CSS grid layout: one row per source line, bars never re-flowed, column widths aligned across rows.
- Dark mode support and a print stylesheet.

Standalone web build

- `dist/coolchordsheets.js` and `dist/coolchordsheets.css` with no dependencies; replaces every `pre.chordsheet` on page load, including `<pre><code class="language-chordsheet">` output from Markdown pipelines.
- Per-element options via `data-show-holds`, `data-show-uneven` and `data-font-size`.
- `data-manual` script attribute plus `CoolChordSheets.render` and `CoolChordSheets.renderAll` API.
- ES module build `dist/coolchordsheets.esm.js` exporting `render` and `renderAll`.

Project

- Demo site with live examples published to GitHub Pages.
- CI running tests, plugin build, web build and docs checks; tag-driven release workflow publishing plugin files and standalone bundles.
