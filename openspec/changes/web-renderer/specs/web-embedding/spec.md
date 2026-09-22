## ADDED Requirements

### Requirement: Source elements
The library SHALL recognize two source element forms: a `pre` element with class `chordsheet`, and a `pre` element whose only element child is a `code` element with class `language-chordsheet`. The chart text SHALL be read with `textContent` so HTML entities are decoded. Any other element SHALL be ignored.

#### Scenario: Pre with class
- **WHEN** the page contains `<pre class="chordsheet">| C | G |</pre>` and `renderAll(document)` runs
- **THEN** the element is replaced by a rendered chart with two cells

#### Scenario: Markdown fence output
- **WHEN** the page contains `<pre><code class="language-chordsheet">| C | G |</code></pre>`
- **THEN** the `pre` element is replaced by a rendered chart with two cells

#### Scenario: Entities decoded
- **WHEN** the source element contains `| C&lt;weird |`
- **THEN** the chart shows a chord token with raw text `C<weird`

#### Scenario: Other elements ignored
- **WHEN** the page contains `<div class="chordsheet">| C |</div>`
- **THEN** it is left unchanged

### Requirement: Render API
The library SHALL export `render(text, container, options)` which parses `text`, renders into `container` (emptying it first) and returns the `.ccs-sheet` root element. It SHALL export `renderAll(root, options)` which converts every source element under `root` (default `document`) and returns the number of elements converted. It SHALL export `parseChordSheet` and a `version` string equal to the package version. `render` SHALL throw on unexpected failure; `renderAll` SHALL NOT throw because of a single element.

#### Scenario: Programmatic render
- **WHEN** `render("| C | G |", el)` is called on an empty `div`
- **THEN** the `div` contains one `.ccs-sheet` with two cells and the call returns that root

#### Scenario: renderAll count
- **WHEN** a document has three source elements and one unrelated `pre`
- **THEN** `renderAll(document)` returns 3 and the unrelated `pre` is unchanged

#### Scenario: renderAll under a subtree
- **WHEN** `renderAll(section)` is called with a `section` element
- **THEN** only source elements inside that section are converted

### Requirement: Replacement and source retention
`renderAll` SHALL replace each source element with a `div` of class `ccs-container` that holds the rendered sheet. The container SHALL carry the original chart text in a `data-chordsheet-source` attribute. A container already rendered SHALL NOT be rendered again by a later `renderAll`.

#### Scenario: Source retained
- **WHEN** a `pre.chordsheet` with text `| C |` is converted
- **THEN** the resulting container has `data-chordsheet-source` equal to `| C |`

#### Scenario: Idempotent
- **WHEN** `renderAll(document)` runs twice on the same page
- **THEN** the second call returns 0 and the DOM is unchanged

### Requirement: Options
Options are `showHolds` (boolean, default false), `showUneven` (boolean, default true) and `fontSize` (integer pixels, 10 to 32, default 16; values outside the range are clamped, non-numbers use the default). `render` SHALL apply them to the sheet root as the classes `ccs-show-holds` and `ccs-show-uneven` and the CSS variable `--ccs-font-size`. A source element MAY carry `data-show-holds`, `data-show-uneven` and `data-font-size` attributes; the values `true`/`false` and an integer are parsed, and these override the options passed to `renderAll`.

#### Scenario: Defaults
- **WHEN** `render(text, el)` is called with no options
- **THEN** the root has class `ccs-show-uneven`, does not have `ccs-show-holds`, and its `--ccs-font-size` is `16px`

#### Scenario: Options applied
- **WHEN** `render(text, el, { showHolds: true, showUneven: false, fontSize: 20 })` is called
- **THEN** the root has `ccs-show-holds`, lacks `ccs-show-uneven`, and `--ccs-font-size` is `20px`

#### Scenario: Font size clamped
- **WHEN** `fontSize` is 40
- **THEN** `--ccs-font-size` is `32px`

#### Scenario: Data attributes override
- **WHEN** `renderAll(document, { showHolds: false })` runs on `<pre class="chordsheet" data-show-holds="true" data-font-size="12">`
- **THEN** the rendered root has `ccs-show-holds` and `--ccs-font-size` is `12px`

### Requirement: Auto render
The script build SHALL call `renderAll(document)` once the document is ready: immediately if `document.readyState` is not `loading`, otherwise on `DOMContentLoaded`. It SHALL skip auto render when the script element that loaded it has a `data-manual` attribute. The ES module build SHALL never auto render.

#### Scenario: Script build renders on load
- **WHEN** a page loads `coolchordsheets.js` with a `pre.chordsheet` in the body
- **THEN** the chart is rendered without any page script (manual check in a browser)

#### Scenario: Manual opt-out
- **WHEN** the script tag has `data-manual`
- **THEN** the `pre.chordsheet` stays unrendered until the page calls `CoolChordSheets.renderAll()` (manual check in a browser)

#### Scenario: Module build is passive
- **WHEN** the ES module is imported
- **THEN** no source element is touched until `renderAll` or `render` is called

### Requirement: Error fallback
When rendering a source element throws, `renderAll` SHALL leave that element in place, insert a `div.ccs-render-error` with the error message directly after it, and continue with the remaining elements.

#### Scenario: One element fails
- **WHEN** the renderer throws for the first of two source elements
- **THEN** the first `pre` is still in the DOM followed by a `.ccs-render-error`, and the second is rendered

### Requirement: Build outputs and size budget
`npm run build:web` SHALL produce `dist/coolchordsheets.js` (minified IIFE exposing the global `CoolChordSheets`), `dist/coolchordsheets.esm.js` (minified ES module) and `dist/coolchordsheets.css` (a copy of `styles.css`). The build SHALL fail if the gzipped size of `dist/coolchordsheets.js` exceeds 12 KB (12288 bytes). `dist/` SHALL be gitignored. CI SHALL run the web build.

#### Scenario: Outputs exist
- **WHEN** `npm run build:web` completes
- **THEN** the three files exist and the IIFE file contains `CoolChordSheets`

#### Scenario: Budget enforced
- **WHEN** the gzipped IIFE exceeds 12288 bytes
- **THEN** the build exits with a non-zero status naming the size
