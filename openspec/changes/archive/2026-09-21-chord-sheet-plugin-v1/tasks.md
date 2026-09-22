## 1. Project setup

- [x] 1.1 Create package.json with obsidian, typescript, esbuild, vitest, happy-dom dev dependencies and build, dev, test scripts
- [x] 1.2 Add tsconfig.json (strict, ES2018 target, DOM lib) and esbuild.config.mjs bundling src/main.ts to main.js
- [x] 1.3 Add manifest.json (isDesktopOnly false, minAppVersion 1.4.0), versions.json, .gitignore (node_modules, main.js) and a README with the grammar reference and the worked examples from the proposal
- [x] 1.4 Add a GitHub Actions workflow running npm ci, build and test on push
- [x] 1.5 Verify `npm install && npm run build && npm test` succeeds with a placeholder test

## 2. Chord symbol module (src/chords)

- [x] 2.1 Define ChordSymbol type: root, accidental, quality enum, extensions, bass, raw
- [x] 2.2 Implement parseChord following the token grammar (greedy root accidental, bass suffix rule, parentheses stripping, Unicode input) and the alias table from the spec
- [x] 2.3 Implement formatChord producing display parts (root, accidental glyph, superscript with glyph accidentals, reduced-size bass)
- [x] 2.4 Unit tests covering every scenario in chord-symbol-notation spec

## 3. Parser module (src/parser)

- [x] 3.1 Define AST types: ChordSheet, Header (with extra map and parsed key), Section, Line, Bar, BarLine, Token, Marker, Diagnostic (line, severity, message)
- [x] 3.2 Implement line classification: blank, comment, header, section label, line-level marker, line of bars
- [x] 3.3 Implement header parsing (title, key via chord parser, time, extra keys) with 4/4 default
- [x] 3.4 Implement bar line splitting for |, ||, ||:, :||, :||:, the |: and :| aliases, repeat counts with optional space, opening repeat carried to the next line, and empty bars
- [x] 3.5 Implement marker extraction (reserved names, endings and ranges, text markers) and time signature token in either order at bar start
- [x] 3.6 Implement whitespace tokenizer: strip one padding space per side, 1-2 spaces separator, each full run of 3 spaces one hold, tab one hold, `_` hold, edge runs produce holds
- [x] 3.7 Implement token classification: %, N.C. forms, chords, unknown tokens with warnings
- [x] 3.8 Compute timing token positions and durations by even division, and flag uneven bars with the divisibility rule
- [x] 3.9 Implement sections, line-level markers attaching to the next bar, and diagnostics with severities, never throwing
- [x] 3.10 Unit tests covering every scenario in chord-sheet-grammar spec, including the four worked examples from the proposal and the 200-bar timing check

## 4. Renderer (src/render)

- [x] 4.1 Implement renderSheet(ast, doc, container) building rows with a section gutter and cells sized by slot count
- [x] 4.2 Render bar line kinds with borders and CSS repeat dots, plus repeat counts
- [x] 4.3 Render timing tokens positioned by fraction within the chord area, using formatChord parts; unknown tokens as plain text
- [x] 4.4 Render holds (always present, CSS toggled), inline SVG measure repeat, time signature gutter (initial and per-bar), uneven border
- [x] 4.5 Render section boxes, ending brackets spanning to the next ending or closing repeat, inline SVG coda and segno, text markers, right-aligned fine, D.S. and D.C. text
- [x] 4.6 Render header (title, formatted key) and diagnostics list with error and warning styles
- [x] 4.7 Write styles.css scoped under .ccs-sheet using Obsidian variables, horizontal scroll for wide rows, plus @media print rules with row scaling
- [x] 4.8 Renderer tests under happy-dom with a stubbed obsidian module covering every scenario in chord-sheet-rendering spec that can be asserted on DOM

## 5. Plugin shell (src/main.ts, src/settings.ts)

- [x] 5.1 Register the chordsheet code block processor in a try/catch with a Notice on failure, and wire parse, render and the raw text fallback with inline error
- [x] 5.2 Implement settings (font size 10-32 default 16, show holds default off, uneven marker default on) with load and save, a settings tab, and application as a CSS variable and body classes

## 6. Verification

- [x] 6.1 Add sample notes under examples/ covering the four worked examples, repeats, endings, coda, D.S. al Coda, section labels, a time change, trailing holds and an unknown token
- [ ] 6.2 Manually check reading mode, live preview, dark theme, PDF export with a wide row, and Obsidian mobile
