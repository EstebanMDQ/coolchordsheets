# chord-sheet-rendering Specification

## Purpose
TBD - created by archiving change chord-sheet-plugin-v1. Update Purpose after archive.
## Requirements
### Requirement: Grid layout follows source lines
The renderer SHALL render each source line of bars as one row, with one cell per bar. Bars SHALL never be re-flowed across rows. The chart body SHALL be a single grid whose columns are one gutter column followed by one column per bar position, the count being the largest bar count of any row; each row SHALL place its cells in those shared columns so that bar N of every row has the same left edge and width. Every row SHALL have a fixed left gutter for the section box.

#### Scenario: Three lines of four bars
- **WHEN** the chart has three lines with four bars each
- **THEN** the output has three rows of four cells in source order

#### Scenario: Lines with different bar counts
- **WHEN** one line has four bars and the next has two
- **THEN** the second row has two cells placed in the first two columns and does not stretch to fill the width of the first

#### Scenario: Column count on the body
- **WHEN** the widest row has four bars
- **THEN** the chart body carries `--ccs-cols: 4`

### Requirement: Cell sizing
Each cell SHALL have a minimum width of `max(baseWidth, timingTokenCount * minSlotWidth)` where `baseWidth` and `minSlotWidth` are CSS variables (defaults 6em and 2.5em in chord font units). Columns SHALL share the available width equally, each at least as wide as the widest minimum among its cells. On screen, a chart wider than the container SHALL scroll horizontally as a whole, never wrap. In print, the grid SHALL fill the printable width.

#### Scenario: Dense bar widens its column
- **WHEN** a bar has four chords `C7 F7 Bb7 Eb7` and `4 * minSlotWidth` exceeds `baseWidth`
- **THEN** that cell's minimum width is larger than a one-chord cell's and no chord text overlaps

#### Scenario: Wide chart on screen
- **WHEN** the grid is wider than the note pane
- **THEN** the chart body scrolls horizontally and the columns stay aligned

### Requirement: Bar lines
Bar line kinds SHALL be visually distinct: single line, double line, opening repeat with dots, closing repeat with dots, closing-then-opening repeat. Repeat dots SHALL be drawn with CSS (pseudo elements), not font glyphs. Repeat dots SHALL NOT overlap the time signature or any chord: the cell body, including the time signature gutter, is inset by at least 0.5em on the side that carries dots. A repeat count SHALL be shown as `x<n>` above the closing repeat.

#### Scenario: Repeat signs
- **WHEN** a line is `||: C | G :||x3`
- **THEN** the first cell shows an opening repeat sign, the last cell shows a closing repeat sign with `x3`

#### Scenario: Repeat with time signature
- **WHEN** a line is `||: 3/4 C | G :||`
- **THEN** the time signature in the first cell starts to the right of the repeat dots (manual check in a browser)

### Requirement: Chord placement inside a bar
Each timing token SHALL be placed horizontally at its position fraction within the cell's chord area, except that a bar with exactly one timing token SHALL center that token in the chord area. The chord area is the cell width minus the time signature gutter when the bar carries a time signature. Holds SHALL always be rendered as a small dot element; the dot is hidden by default and shown when the "show holds" setting is enabled. Unknown tokens SHALL render their raw text in plain style at their slot.

#### Scenario: Single chord centered
- **WHEN** a bar has the single token C
- **THEN** C is centered in the chord area

#### Scenario: Two chords
- **WHEN** a bar has tokens C and G
- **THEN** C is at the left edge and G starts at the horizontal middle of the chord area

#### Scenario: Chord plus hold is not centered
- **WHEN** the bar is `C   ` (chord followed by one hold)
- **THEN** C is at the left edge

#### Scenario: Hold shown
- **WHEN** the bar is `C   D- G7` and show holds is enabled
- **THEN** a dot appears at the second quarter of the cell

#### Scenario: Unknown token
- **WHEN** a bar is `H7 C`
- **THEN** `H7` is rendered as plain text in the first half of the cell

### Requirement: Repeat bar symbol
A repeat bar SHALL render the measure repeat symbol as an inline SVG centered in the cell.

#### Scenario: Repeat bar
- **WHEN** a bar is a repeat bar
- **THEN** the cell contains only the repeat symbol

### Requirement: Time signature display
The first bar of the chart SHALL show the initial time signature (from the header or the default) as stacked numerals in a gutter at the left edge of the cell. Any bar carrying a time signature token SHALL show its numerals the same way. The gutter reserves horizontal space; chords are positioned in the remaining chord area.

#### Scenario: Header time signature shown
- **WHEN** the header has `time: 3/4` and the first bar has no time signature token
- **THEN** a stacked `3` over `4` appears at the start of the first cell

#### Scenario: Time signature in first bar
- **WHEN** the first bar has time signature 4/4
- **THEN** a stacked `4` over `4` appears at the start of that cell

### Requirement: Section labels and markers
Section labels SHALL render as boxed text in the left gutter of the first row of the section. Ending markers SHALL render as a bracket above the cells with the ending text; the bracket SHALL extend from the marked bar to the bar before the next ending marker, the bar with the next closing repeat (inclusive), or the end of the row, whichever comes first. Coda and segno SHALL render as inline SVG glyphs left-aligned above the bar. Text markers SHALL render as plain text left-aligned above the bar. Fine, D.S. and D.C. markers SHOULD render as italic text right-aligned above the bar. Uneven timing bars SHALL carry `data-timing="uneven"` and a dotted top border on the cell; the border is hidden when the "uneven marker" setting is off.

#### Scenario: Boxed section
- **WHEN** a section is labeled `A`
- **THEN** a boxed `A` appears in the gutter of its first row

#### Scenario: First ending bracket
- **WHEN** a bar has ending marker `1.`
- **THEN** a bracket with `1.` is drawn above the bar

#### Scenario: Ending bracket spans to repeat
- **WHEN** a line is `| [1.] G7 | C :|| [2.] G7 | C ||`
- **THEN** the `1.` bracket spans the first two cells and the `2.` bracket spans the last two

#### Scenario: Jump instruction
- **WHEN** a bar has marker `D.S. al Coda`
- **THEN** the text `D.S. al Coda` appears right-aligned above the bar

#### Scenario: Uneven marker
- **WHEN** a bar is flagged uneven and the uneven marker setting is on
- **THEN** the cell has `data-timing="uneven"` and a visible dotted top border

### Requirement: Header display
The title SHALL render above the chart in a larger font. The key SHALL render below the title in smaller text when present, formatted with the chord formatter (so `Bb-` displays as `B♭-`).

#### Scenario: Title and key
- **WHEN** the header has title `All of Me` and key `Bb`
- **THEN** the title appears above the chart and `B♭` appears under it

### Requirement: Theme and print
All styles SHALL be scoped under a single root class and use Obsidian color variables so the chart is readable in light and dark themes. A print stylesheet SHALL force black on white, avoid page breaks inside a row, and scale rows to the printable width.

#### Scenario: Dark theme
- **WHEN** Obsidian uses a dark theme
- **THEN** bar lines and chord text use the theme's foreground color

#### Scenario: PDF export
- **WHEN** the note is exported to PDF
- **THEN** the chart prints black on white with no row split across pages and no row cut off at the right edge

### Requirement: Diagnostics display
Parse diagnostics SHALL be listed below the rendered chart with their line numbers. Errors and warnings SHALL be visually distinct, and warnings SHALL use a muted style. The chart that could be parsed SHALL still render.

#### Scenario: One bad line
- **WHEN** one line is unparseable
- **THEN** the other lines render and an error message naming the bad line appears below the chart

#### Scenario: Warning style
- **WHEN** the only diagnostic is an unknown token warning
- **THEN** it appears in the muted warning style

### Requirement: Renderer testability
`renderSheet` SHALL accept a document object so it can run under a DOM test environment with the `obsidian` module stubbed. Layout assertions (cell count per row, token position styles, data attributes, marker elements) SHALL be covered by automated tests.

#### Scenario: Headless render
- **WHEN** the test suite renders a three-line chart in happy-dom
- **THEN** it can assert three rows, the cell count of each, and the `left` style of each token

