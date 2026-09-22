## Why

The README is a developer note and there is no page that shows what the plugin and the library actually produce. Both are needed before the plugin can be submitted to the Obsidian community list and before the repository goes public: reviewers and users judge a chord sheet tool by what a chart looks like, and the Obsidian submission requires a README that explains the plugin.

## What Changes

- Rewrite `README.md` as a user-facing document: what it is, a rendered screenshot, installation in Obsidian (community plugins once listed, BRAT and manual until then), usage in Obsidian, usage on a web page, the full grammar reference, the chord symbol table, settings, development and license.
- Add `LICENSE` (MIT, matching `package.json`) and `CHANGELOG.md` with the 0.1.0 entry, both required or expected for the Obsidian listing.
- Add a demo site under `docs/` served by GitHub Pages: a live editor where the chart renders as you type using the standalone library, the example charts, a section for the Obsidian plugin with screenshots and install steps, and a section for the standalone library with the script tag snippet.
- Add `scripts/screenshots.mjs` that renders the example charts with headless Chrome so the README and demo images are generated, not hand-made, and stay in sync with the renderer.
- Add a GitHub Pages workflow that builds the library and publishes `docs/` plus `dist/` on every push to `main`.
- The demo page and README section previously listed in the `web-renderer` change move here; that change is reduced to the library and a manual check.

## Capabilities

### New Capabilities
- `project-documentation`: README content and structure, LICENSE, CHANGELOG, generated screenshots, and the documentation checks that keep them accurate.
- `demo-site`: the GitHub Pages site under `docs/`: live editor, examples, Obsidian and library sections, build and deploy workflow.

### Modified Capabilities

(none)

## Impact

- Depends on `web-renderer` being implemented first: the live editor and the library section load `dist/coolchordsheets.js` and `.css`.
- New files: `LICENSE`, `CHANGELOG.md`, `docs/` (index.html, demo.js, demo.css, images), `scripts/screenshots.mjs`, `.github/workflows/pages.yml`. `README.md` rewritten. `package.json` gains a `screenshots` script.
- No runtime code changes. No new runtime dependencies; screenshots use the Chrome already used for manual checks, and the script skips with a message when Chrome is not found.
- Non-goals: a documentation framework, versioned docs, i18n, analytics on the demo page, a hosted playground with sharing links.
