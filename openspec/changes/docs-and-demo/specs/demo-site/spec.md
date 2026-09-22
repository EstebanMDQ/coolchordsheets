## ADDED Requirements

### Requirement: Demo page content
`docs/index.html` SHALL contain: a header with the project name and one-sentence description; a live editor section; an examples section rendering every chart from `examples/`; an Obsidian section with install steps and two screenshots (reading mode and settings); a standalone library section with the script tag snippet and a link to the README's web usage section; a footer linking to the repository and the license. The page SHALL load `./dist/coolchordsheets.js` and `./dist/coolchordsheets.css` with relative paths and no other external script.

#### Scenario: Sections present
- **WHEN** `docs/index.html` is parsed
- **THEN** it contains elements with ids `editor`, `examples`, `obsidian` and `library`, and exactly one script tag whose src is `./dist/coolchordsheets.js`

#### Scenario: No external dependencies
- **WHEN** the script and link tags in `docs/index.html` are listed
- **THEN** every `src` and `href` for scripts and stylesheets is a relative path

### Requirement: Live editor
The live editor SHALL have a textarea pre-filled with the "All of Me" example, a render target, a show holds checkbox (default off), an uneven marker checkbox (default on) and a font size range input (10 to 32, default 16). The chart SHALL re-render on every `input` event of the textarea or controls using the library's `render` with the current options. Parse diagnostics SHALL appear below the chart through the renderer's own list.

#### Scenario: Initial render
- **WHEN** the page loads
- **THEN** the render target contains a `.ccs-sheet` with the "All of Me" chart

#### Scenario: Typing re-renders
- **WHEN** the textarea value changes to `| C | G |` and an `input` event fires
- **THEN** the render target shows two cells

#### Scenario: Options applied
- **WHEN** the show holds checkbox is checked and the font size is set to 20
- **THEN** the `.ccs-sheet` has class `ccs-show-holds` and `--ccs-font-size` is `20px`

#### Scenario: Diagnostics shown
- **WHEN** the textarea contains a line that is not a bar
- **THEN** a `.ccs-diag-error` appears under the chart

### Requirement: Local demo script
`npm run demo` SHALL build the library, copy `dist/` into `docs/dist/`, and print the path of `docs/index.html`. `docs/dist/` SHALL be gitignored.

#### Scenario: Local demo
- **WHEN** `npm run demo` completes
- **THEN** `docs/dist/coolchordsheets.js` and `docs/dist/coolchordsheets.css` exist and opening `docs/index.html` renders the editor (manual check in a browser)

### Requirement: Pages deployment
A workflow at `.github/workflows/pages.yml` SHALL, on push to `main`, install dependencies, run `npm run build:web`, assemble an artifact containing `docs/` with `dist/` inside it, and deploy it with the GitHub Pages actions. It SHALL NOT run on pull requests.

#### Scenario: Workflow shape
- **WHEN** the workflow file is read
- **THEN** it triggers on push to `main` only, runs `npm run build:web`, and uses `actions/deploy-pages`

#### Scenario: Deployed page
- **WHEN** the workflow succeeds on a public repository with Pages enabled
- **THEN** the site serves `index.html` with a working live editor (manual check after the repository is created)
