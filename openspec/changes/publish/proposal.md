## Why

The plugin and the standalone library are built and documented but only exist on one machine. Users need a public repository, a demo site that is actually deployed, versioned releases with the plugin files attached, and a listing in the Obsidian community plugin directory so the plugin can be installed from inside Obsidian.

## What Changes

- Public repository `EstebanMDQ/coolchordsheets` becomes the home of the code; all links in the README, demo page, manifest and package metadata point at it.
- A release workflow publishes a draft GitHub release when a version tag matching `manifest.json` is pushed, attaching `main.js`, `manifest.json`, `styles.css` and the three `dist/` files. Obsidian installs plugins from exactly these release assets.
- GitHub Pages is enabled with the "GitHub Actions" source so the existing Pages workflow deploys the demo site on every push to `main`.
- The code is checked against the Obsidian plugin guidelines before submission. Known item: the SVG glyph helper uses `innerHTML` with static markup, which the review bot flags; it moves to element construction.
- A submission pull request to `obsidianmd/obsidian-releases` adds the plugin to `community-plugins.json`.

## Capabilities

### New Capabilities
- `release-automation`: the tag-triggered release workflow and its checks, plus the repository settings the workflows need.

### Modified Capabilities

(none. The Obsidian listing itself is a process, not a spec-level behavior.)

## Impact

- New file `.github/workflows/release.yml`. Link updates in `README.md`, `docs/index.html`, `manifest.json` (`authorUrl`), `package.json` (`repository`, `homepage`).
- `src/render/svg.ts` rewritten without `innerHTML`; tests unchanged since they query the resulting elements.
- Manual steps that need the account owner: first push, enabling Pages, cutting the first tag, opening the submission PR.
