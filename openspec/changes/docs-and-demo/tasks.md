## 1. Repository files

- [x] 1.1 Add LICENSE (MIT) and CHANGELOG.md with the 0.1.0 entry
- [x] 1.2 Add scripts/screenshots.mjs (esbuild bundle of the examples, headless Chrome, CHROME_PATH lookup, exit 0 without a browser) and the screenshots npm script
- [x] 1.3 Add scripts/docs-check.mjs verifying referenced images exist and the docs:check npm script, run it in CI
- [x] 1.4 Generate docs/img/all-of-me.png, timing.png and structure.png and commit them

## 2. README

- [x] 2.1 Rewrite README.md with the required sections in order, the hero image, and the install sub-sections
- [x] 2.2 Write the grammar reference and the chord symbols table from the main specs
- [x] 2.3 Write the settings, web page usage, development and license sections

## 3. Demo site

- [x] 3.1 Create docs/index.html with header, editor, examples, obsidian, library and footer sections loading ./dist files
- [x] 3.2 Create docs/demo.css for page layout only
- [x] 3.3 Create docs/demo.js: live editor with textarea, option controls and render on input; render the examples section
- [ ] 3.4 Take the two Obsidian screenshots by hand and add them under docs/img/obsidian/ (manual)
- [x] 3.5 Add the demo npm script (build:web, copy dist into docs/dist) and gitignore docs/dist
- [x] 3.6 Write tests/demo.test.ts under happy-dom loading docs/index.html and docs/demo.js against the built library: initial render, typing re-renders, options applied, diagnostics shown, section ids present, no external scripts

## 4. Deployment

- [x] 4.1 Add .github/workflows/pages.yml (push to main, build:web, artifact of docs plus dist, deploy-pages)
- [ ] 4.2 After the public repository exists: enable Pages, confirm the deployed site renders (manual)
