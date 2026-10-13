## MODIFIED Requirements

### Requirement: Theme and print
All styles SHALL be scoped under a single root class. Colors and the font SHALL be read from the Obsidian variables `--text-normal`, `--text-muted`, `--text-error` and `--font-interface` with fallbacks so the chart renders on a page that defines none of them: `currentColor` for lines and chord text, a 60% mix of `currentColor` for muted text, `#d0453c` for errors and `system-ui, sans-serif` for the font. The chart therefore follows the page's own text color in light and dark pages alike, without reading `prefers-color-scheme`. The option classes `ccs-show-holds` and `ccs-show-uneven` and the variable `--ccs-font-size` SHALL take effect when set on any ancestor of the sheet, including the sheet root itself. A print stylesheet SHALL force black on white, avoid page breaks inside a row, and scale rows to the printable width.

#### Scenario: Dark theme
- **WHEN** Obsidian uses a dark theme
- **THEN** bar lines and chord text use the theme's foreground color

#### Scenario: No theme variables
- **WHEN** the stylesheet is loaded on a page that defines no Obsidian variables and sets `body { color: #222 }`
- **THEN** chord text and bar lines resolve to `#222`, whatever the browser's color scheme preference

#### Scenario: Options on the sheet root
- **WHEN** the `.ccs-sheet` element has class `ccs-show-holds` and `body` does not
- **THEN** hold dots are visible

#### Scenario: PDF export
- **WHEN** the note is exported to PDF
- **THEN** the chart prints black on white with no row split across pages and no row cut off at the right edge
