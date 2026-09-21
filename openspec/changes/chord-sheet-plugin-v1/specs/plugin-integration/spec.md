## ADDED Requirements

### Requirement: Code block processor
The plugin SHALL register a markdown code block processor for the `chords` language. The block SHALL render in reading mode and in live preview.

#### Scenario: Reading mode
- **WHEN** a note containing a `chords` fence is opened in reading mode
- **THEN** the fence is replaced by the rendered chart

#### Scenario: Live preview
- **WHEN** the note is in live preview and the cursor is outside the fence
- **THEN** the rendered chart is shown, and editing the fence updates the chart

### Requirement: Settings
The plugin SHALL provide a settings tab with: base font size for chords, show holds toggle, and a toggle for the uneven timing marker. Settings SHALL persist across restarts.

#### Scenario: Change font size
- **WHEN** the user changes the font size setting
- **THEN** newly rendered charts use that size

#### Scenario: Persistence
- **WHEN** Obsidian is restarted
- **THEN** the previously chosen settings are still in effect

### Requirement: Never break the note
A malformed block SHALL never leave the note without content. On unexpected renderer failure the plugin SHALL fall back to showing the raw block text with an error notice.

#### Scenario: Renderer exception
- **WHEN** rendering throws for any reason
- **THEN** the raw block text is shown in a preformatted element with the error message

### Requirement: Plugin manifest and build
The repository SHALL contain a valid Obsidian `manifest.json`, an esbuild configuration producing `main.js`, a `styles.css`, and a test script running vitest. Building and testing SHALL work with a single `npm install` followed by `npm run build` and `npm test`.

#### Scenario: Fresh clone
- **WHEN** a developer runs `npm install && npm run build && npm test`
- **THEN** `main.js` is produced and all tests pass
