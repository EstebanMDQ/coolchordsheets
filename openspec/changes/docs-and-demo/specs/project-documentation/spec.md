## ADDED Requirements

### Requirement: README structure
`README.md` SHALL contain, in this order, these sections: a one-sentence description with a rendered chart image; Installation with Obsidian community plugins, BRAT and manual sub-sections; Quick start with a `chordsheet` fence; Grammar reference; Chord symbols with a table of accepted spellings and their rendering; Settings with defaults; Using on a web page with the script tag, the `pre` forms, data attributes and the ES module import; Development; License.

#### Scenario: Sections present
- **WHEN** the README headings are listed
- **THEN** they include Installation, Quick start, Grammar reference, Chord symbols, Settings, Using on a web page, Development and License in that order

#### Scenario: Grammar reference matches the specs
- **WHEN** the grammar reference is compared with the chord-sheet-grammar spec
- **THEN** every bar line form, marker name, hold spelling and header key in the spec appears in the README (manual check)

### Requirement: License and changelog
The repository SHALL contain a `LICENSE` file with the MIT license text and the copyright holder, and a `CHANGELOG.md` following Keep a Changelog headings with an entry for the version in `manifest.json`.

#### Scenario: Files present
- **WHEN** the repository root is listed
- **THEN** `LICENSE` and `CHANGELOG.md` exist, `LICENSE` contains "MIT License", and `CHANGELOG.md` contains the `manifest.json` version as a heading

### Requirement: Generated screenshots
`npm run screenshots` SHALL render each chart under `examples/` with headless Chrome at 900 px width and device scale factor 2 into `docs/img/<name>.png`, where `<name>` is the example file name in kebab-case. The script SHALL read the browser path from `CHROME_PATH` or the default macOS and Linux locations, and SHALL exit 0 with a message when no browser is found. Every image referenced by the README and the demo page SHALL exist in the repository.

#### Scenario: Screenshots produced
- **WHEN** `npm run screenshots` runs with Chrome available
- **THEN** `docs/img/all-of-me.png`, `docs/img/timing.png` and `docs/img/structure.png` are written

#### Scenario: No browser
- **WHEN** `npm run screenshots` runs with no Chrome found
- **THEN** it prints a message and exits 0 without writing files

#### Scenario: Referenced images exist
- **WHEN** `npm run docs:check` runs
- **THEN** it fails if any image path referenced in `README.md` or `docs/index.html` does not exist
