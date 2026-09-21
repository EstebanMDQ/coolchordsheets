## 1. Project setup

- [ ] 1.1 Create package.json with obsidian, typescript, esbuild, vitest dev dependencies and build, dev, test scripts
- [ ] 1.2 Add tsconfig.json (strict, ES2018 target, DOM lib) and esbuild.config.mjs bundling src/main.ts to main.js
- [ ] 1.3 Add manifest.json, versions.json, .gitignore (node_modules, main.js) and a minimal README with the grammar
- [ ] 1.4 Verify `npm install && npm run build && npm test` succeeds with a placeholder test

## 2. Chord symbol module (src/chords)

- [ ] 2.1 Define ChordSymbol type: root, accidental, quality, extensions, bass, raw
- [ ] 2.2 Implement parseChord with iReal Pro spellings and the alias table from the spec
- [ ] 2.3 Implement formatChord producing display parts (root, accidental glyph, superscript, bass)
- [ ] 2.4 Unit tests covering every scenario in chord-symbol-notation spec

## 3. Parser module (src/parser)

- [ ] 3.1 Define AST types: ChordSheet, Header, Section, Line, Bar, BarLine, Token, Marker, Diagnostic
- [ ] 3.2 Implement header parsing (title, key, time) with 4/4 default
- [ ] 3.3 Implement line splitting into bar lines and bar contents, including ||: :|| and :||xN
- [ ] 3.4 Implement whitespace tokenizer: 1-2 spaces separator, each full run of 3 spaces one hold, tab one hold, trim edges
- [ ] 3.5 Implement token classification: time signature, %, N.C., markers in brackets, chords
- [ ] 3.6 Compute token positions and durations by even division, and flag uneven bars against the current time signature
- [ ] 3.7 Implement section labels and diagnostics, never throwing
- [ ] 3.8 Unit tests covering every scenario in chord-sheet-grammar spec, including the four worked examples from the proposal

## 4. Renderer (src/render)

- [ ] 4.1 Implement renderSheet(ast, settings, container) building the grid rows and bar cells
- [ ] 4.2 Render bar line kinds with borders and repeat dots, plus repeat counts
- [ ] 4.3 Render chords positioned by fraction, using formatChord parts (superscript quality, glyph accidentals, bass)
- [ ] 4.4 Render holds (optional dot), repeat bar symbol, time signature stack, uneven marker
- [ ] 4.5 Render section boxes, ending brackets, coda, segno, fine markers
- [ ] 4.6 Render header (title, key) and diagnostics list
- [ ] 4.7 Write styles.css scoped under .ccs-sheet using Obsidian variables, plus @media print rules

## 5. Plugin shell (src/main.ts, src/settings.ts)

- [ ] 5.1 Register the chords code block processor and wire parse, render and the raw text fallback
- [ ] 5.2 Implement settings (font size, show holds, uneven marker) with load and save and a settings tab
- [ ] 5.3 Re-render open charts when settings change

## 6. Verification

- [ ] 6.1 Add sample notes under examples/ covering the four timing examples, repeats, endings, coda, section labels and a time change
- [ ] 6.2 Manually check reading mode, live preview, dark theme and PDF export in an Obsidian vault
- [ ] 6.3 Check music glyph rendering on macOS and one other platform, and add fallbacks if missing
