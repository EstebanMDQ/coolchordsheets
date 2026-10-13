## Context

The Obsidian plugin is built from three layers. `src/parser` and `src/chords` are pure TypeScript, and `src/render` takes a `Document` and builds DOM with `createElement`, so none of them import `obsidian`. Only `src/main.ts` and `src/settings.ts` do. The stylesheet, however, was written for Obsidian: it reads `--text-normal`, `--text-muted`, `--text-error` and `--font-interface` with no fallbacks, and the option selectors are `body.ccs-show-holds` and `body.ccs-show-uneven`. The build produces a single CommonJS `main.js` with `obsidian` external.

The web build must be small and dependency free because the target is a static page or a CMS that can only load a script tag.

## Goals / Non-Goals

**Goals:**
- Two files (script and stylesheet) that turn `<pre class="chordsheet">` blocks into charts on any page.
- No runtime dependencies, no framework, no build step required by the page author.
- Same rendering as the Obsidian plugin, so the two never drift.
- Size budget enforced in CI.

**Non-Goals:**
- Publishing to npm or a CDN. The outputs can be copied or attached to a GitHub release; a registry decision comes later and does not change the code.
- In-browser editing, transposition, printing beyond what the existing print stylesheet does.
- React, Vue or web component wrappers. A web component was considered and rejected for v1: it adds shadow DOM styling questions and buys nothing over a class on `<pre>`.
- Server-side rendering. The renderer needs a `Document`; running it under happy-dom on a server is possible but not designed for here.

## Decisions

**Source element is `<pre>`, matched by class.** The grammar is whitespace-significant: three spaces are a hold. Only `<pre>` (or CSS `white-space: pre`) preserves runs of spaces in HTML, and the HTML parser itself collapses nothing inside it. Two forms are matched: `pre.chordsheet` for hand-written pages and `pre > code.language-chordsheet` for markdown pipelines (marked, markdown-it, Hugo, Jekyll and others emit that shape for a `chordsheet` fence). The text is read with `textContent`, which decodes entities such as `&lt;`. Alternatives rejected: `<script type="text/chordsheet">` (invisible without JavaScript, and blocked by some sanitizers) and `<div data-chordsheet>` (collapses whitespace, and `_` holds alone are not enough because 1-2 space separators also collapse into one, though that case still parses).

**Rendered chart replaces the source element.** The library creates a `div.ccs-container`, renders into it, and replaces the `<pre>` in the DOM. The original source text is kept on the container as `data-chordsheet-source` so a page script can re-render with different options, and so the fallback path can restore it. Alternatives rejected: rendering into a sibling and hiding the `<pre>` (double content for screen readers and print), and rendering into the `<pre>` itself (the `<pre>` styling fights the grid).

**Options scoped to the sheet root, not `body`.** `render(text, container, options)` sets `ccs-show-holds` and `ccs-show-uneven` classes and the `--ccs-font-size` variable on the `.ccs-sheet` element it creates. The stylesheet changes `body.ccs-show-holds .ccs-hold` to `.ccs-show-holds .ccs-hold`, which still matches when the Obsidian plugin sets the class on `body`, so the plugin is untouched. Per-element options use `data-show-holds`, `data-show-uneven` and `data-font-size` on the `<pre>`; they override the options passed to `renderAll`. Defaults match the plugin (holds off, uneven on, 16 px, range 10-32).

**Stylesheet fallbacks.** Every `var(--x)` from Obsidian becomes `var(--x, fallback)`: text `currentColor`, muted `color-mix(in srgb, currentColor 60%, transparent)`, error `#d0453c`, font `system-ui, sans-serif`. Using `currentColor` means the chart inherits whatever text color the host page uses, so light and dark pages both work. A `prefers-color-scheme` block was tried first and rejected: a light page viewed by a user whose OS prefers dark got light-gray chords on white. Alternative rejected: a separate web stylesheet. One file keeps the two builds identical; the cost is a few fallback values.

**Two bundles from one entry.** `src/web.ts` exports `render`, `renderAll`, `parseChordSheet` and the version, and contains the auto-render bootstrap guarded by a flag. esbuild builds it twice: IIFE with `globalName: "CoolChordSheets"` and `define: { __AUTO__: "true" }`, and ESM with `__AUTO__: "false"`. The auto bootstrap runs `renderAll(document)` on `DOMContentLoaded` (or immediately if the document is already interactive) unless `document.currentScript` carries `data-manual`. The stylesheet is copied to `dist/coolchordsheets.css` by the build script. Minified with esbuild, no source maps in the IIFE (an `.map` file is emitted beside it).

**Size budget.** `scripts/check-size.mjs` gzips `dist/coolchordsheets.js` and fails above 12 KB. The current renderer, parser and chord code bundle to roughly 26 KB unminified; minified and gzipped it is expected under 8 KB, so 12 KB leaves room without allowing a dependency to slip in. The check runs in `npm run build:web` and in CI.

**Error handling.** `renderAll` wraps each element: on a thrown error the `<pre>` is left in place, a `div.ccs-render-error` with the message is inserted after it, and the loop continues with the next element. `render` itself rethrows so programmatic callers can handle failures. Parse diagnostics are not errors and render below the chart as in Obsidian.

**dist is a build output, not committed.** `dist/` is gitignored; `npm run build:web` produces it. Committing built files was rejected because every source change would produce a noisy diff; a GitHub release can carry the files when needed.

## Risks / Trade-offs

- [CMS editors rewrite whitespace inside `<pre>`] -> Documented; the `_` hold survives, and the uneven marker shows most mistakes. Not fixable in the library.
- [Page CSS bleeds into the chart (`sup`, `ul`, `pre` resets)] -> All chart elements already carry `ccs-` classes; add explicit `margin`, `line-height` and `list-style` on the elements the page is likely to style (`sup`, `ul`, `li`, `svg`).
- [Auto-render surprises a page that only wanted the API] -> The ESM build never auto-renders; the IIFE honours `data-manual`.
- [`max()` and `break-inside` in CSS] -> Supported by all evergreen browsers since 2020; no polyfill.
- [Two builds drift] -> Same source, same stylesheet, one esbuild config file; the web tests render the same example charts as the plugin tests.

## Open Questions

- Whether to expose `formatChord` for pages that want to render inline chord symbols in prose. Cheap to add; left out until asked.
