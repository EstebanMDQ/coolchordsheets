## Why

The chord sheet grammar and renderer only run inside Obsidian today, so a chart cannot be shown on a website, a band's set list page, or a static site built from the same notes. The parser, chord and render modules already have no Obsidian dependency, so a standalone browser build is mostly packaging plus a small embedding API.

## What Changes

- New standalone browser library built from the existing `src/parser`, `src/chords` and `src/render` modules: one script file and one stylesheet, no runtime dependencies, no framework.
- Source markup for HTML pages: a `<pre class="chordsheet">` element, or `<pre><code class="language-chordsheet">` as produced by markdown pipelines. `<pre>` is required because the grammar is whitespace-significant and any other element collapses runs of spaces.
- A small API: `render(text, container, options)` for programmatic use and `renderAll(root)` to convert every source element under a root. The script build (IIFE) renders all source elements on page load unless opted out; the ES module build never auto-renders.
- Options (show holds, uneven marker, font size) scoped to the rendered sheet through classes and a CSS variable on the sheet root, so two charts on one page can differ. Options can be set per element with `data-*` attributes.
- Stylesheet works outside Obsidian: every Obsidian CSS variable gets a fallback, and the option selectors match any ancestor instead of `body` only. The Obsidian plugin keeps working unchanged because it sets the same classes on `body`.
- Build produces `dist/coolchordsheets.js` (IIFE, global `CoolChordSheets`), `dist/coolchordsheets.esm.js` and `dist/coolchordsheets.css`, with a size budget checked in CI.

## Capabilities

### New Capabilities
- `web-embedding`: the browser library: source element forms, the render and renderAll API, auto-render and opt-out, per-element options, error fallback, and the build outputs with their size budget. The public demo page and README documentation are in the separate `docs-and-demo` change.

### Modified Capabilities
- `chord-sheet-rendering`: the "Theme and print" requirement changes so styles use Obsidian variables with fallbacks and render correctly on a page that defines none of them; option classes (`ccs-show-holds`, `ccs-show-uneven`) and the font size variable are honoured on any ancestor of the sheet, not only `body`.

## Impact

- New files: `src/web.ts` (entry), `dist/` build outputs (gitignored, see design), web tests under `tests/`.
- Changed files: `esbuild.config.mjs` gains a second build; `styles.css` gains fallbacks and ancestor selectors; `package.json` gains a `build:web` script and a size check; CI runs it.
- The Obsidian plugin is unaffected in behavior. `src/main.ts` and `src/settings.ts` are not touched.
- Non-goals: publishing to npm or a CDN (the outputs are two files that can be copied; publishing is a later decision), editing charts in the browser, transposition, any server component, framework wrappers.
