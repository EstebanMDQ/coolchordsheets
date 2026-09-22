## 1. Stylesheet

- [x] 1.1 Add fallbacks to every Obsidian variable in styles.css and a prefers-color-scheme dark block for the fallbacks
- [x] 1.2 Change option selectors from body.ccs-show-holds and body.ccs-show-uneven to ancestor selectors
- [x] 1.3 Add resets on sup, ul, li and svg inside .ccs-sheet so page styles do not bleed in
- [x] 1.4 Extend the renderer test to cover options on the sheet root (class present, computed visibility of a hold in happy-dom)

## 2. Web entry

- [x] 2.1 Create src/web.ts exporting render, renderAll, parseChordSheet and version, with an options type and clamping
- [x] 2.2 Implement source element matching (pre.chordsheet and pre > code.language-chordsheet), replacement with div.ccs-container, and data-chordsheet-source retention
- [x] 2.3 Implement data attribute parsing and precedence over renderAll options
- [x] 2.4 Implement per-element error fallback in renderAll
- [x] 2.5 Implement the auto render bootstrap guarded by the __AUTO__ define and data-manual

## 3. Build

- [x] 3.1 Add the IIFE and ESM web builds to esbuild.config.mjs with the __AUTO__ define, minification and a stylesheet copy to dist/
- [x] 3.2 Add scripts/check-size.mjs failing above 12288 gzipped bytes and wire it into npm run build:web
- [x] 3.3 Add dist/ to .gitignore and build:web to package.json and the CI workflow

## 4. Tests

- [x] 4.1 Write tests/web.test.ts under happy-dom covering source element forms, entity decoding, ignored elements, render and renderAll return values, subtree scope, idempotence, options and clamping, data attribute overrides, error fallback and module passivity
- [x] 4.2 Add a build test or CI step asserting the three dist files exist and the IIFE contains CoolChordSheets

## 5. Manual check

- [ ] 5.1 Manually check a scratch HTML page in a browser: auto render, data-manual opt-out, ESM import, dark mode, print preview
