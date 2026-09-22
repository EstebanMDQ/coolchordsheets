## MODIFIED Requirements

### Requirement: Theme and print
All styles SHALL be scoped under a single root class. Colors and the font SHALL be read from the Obsidian variables `--text-normal`, `--text-muted`, `--text-error` and `--font-interface` with fallbacks (`#1f1f1f`, `#6b6b6b`, `#b3261e`, `system-ui, sans-serif`) so the chart renders on a page that defines none of them. Outside Obsidian the fallbacks SHALL switch to light-on-dark values under `prefers-color-scheme: dark` (`#e6e6e6`, `#9a9a9a`, `#ff7b72`). The option classes `ccs-show-holds` and `ccs-show-uneven` and the variable `--ccs-font-size` SHALL take effect when set on any ancestor of the sheet, including the sheet root itself. A print stylesheet SHALL force black on white, avoid page breaks inside a row, and scale rows to the printable width.

#### Scenario: Dark theme
- **WHEN** Obsidian uses a dark theme
- **THEN** bar lines and chord text use the theme's foreground color

#### Scenario: No theme variables
- **WHEN** the stylesheet is loaded on a page that defines no Obsidian variables
- **THEN** chord text resolves to `#1f1f1f` in light mode and `#e6e6e6` when the browser prefers dark

#### Scenario: Options on the sheet root
- **WHEN** the `.ccs-sheet` element has class `ccs-show-holds` and `body` does not
- **THEN** hold dots are visible

#### Scenario: PDF export
- **WHEN** the note is exported to PDF
- **THEN** the chart prints black on white with no row split across pages and no row cut off at the right edge
