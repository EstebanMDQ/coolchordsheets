# plugin-integration Specification

## Purpose
TBD - created by archiving change chord-sheet-plugin-v1. Update Purpose after archive.
## Requirements
### Requirement: Code block processor
The plugin SHALL register a markdown code block processor for the `chordsheet` language. Registration SHALL be wrapped so that a failure (for example another plugin already owns the language) shows an Obsidian Notice and leaves the plugin loaded. The block SHALL render in reading mode and in live preview.

#### Scenario: Reading mode
- **WHEN** a note containing a `chordsheet` fence is opened in reading mode
- **THEN** the fence is replaced by the rendered chart

#### Scenario: Live preview
- **WHEN** the user edits the fence in live preview and then moves the cursor outside it
- **THEN** the re-rendered chart reflects the edit

#### Scenario: Language already registered
- **WHEN** another plugin has registered `chordsheet`
- **THEN** a Notice explains the conflict and the plugin does not throw during load

### Requirement: Settings
The plugin SHALL provide a settings tab with: chord font size in pixels (integer, range 10-32, default 16), show holds (boolean, default off), uneven timing marker (boolean, default on). Settings SHALL persist across restarts. Settings SHALL be applied as CSS variables and classes on the document body so that already rendered charts update immediately without re-rendering.

#### Scenario: Change font size
- **WHEN** the user changes the font size setting
- **THEN** charts already visible and charts rendered later both use that size

#### Scenario: Persistence
- **WHEN** Obsidian is restarted
- **THEN** the previously chosen settings are still in effect

### Requirement: Never break the note
A malformed block SHALL never leave the note without content. On unexpected renderer failure the plugin SHALL fall back to showing the raw block text in a preformatted element with the error message inline below it. No toast notification is shown for render failures.

#### Scenario: Renderer exception
- **WHEN** rendering throws for any reason
- **THEN** the raw block text is shown in a preformatted element followed by the error message

### Requirement: Platform support
The manifest SHALL declare `isDesktopOnly: false` and a `minAppVersion` of `1.4.0` or later. The plugin SHALL not use Node or Electron APIs.

#### Scenario: Mobile load
- **WHEN** the plugin is enabled on Obsidian mobile
- **THEN** a `chordsheet` fence renders

### Requirement: Plugin manifest and build
The repository SHALL contain a valid Obsidian `manifest.json`, an esbuild configuration producing `main.js`, a `styles.css`, and a test script running vitest. Building and testing SHALL work with a single `npm install` followed by `npm run build` and `npm test`. A CI workflow SHALL run build and test on every push.

#### Scenario: Fresh clone
- **WHEN** a developer runs `npm install && npm run build && npm test`
- **THEN** `main.js` is produced and all tests pass

#### Scenario: CI
- **WHEN** a commit is pushed
- **THEN** the CI workflow runs build and test and reports the result

