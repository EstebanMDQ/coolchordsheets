## ADDED Requirements

### Requirement: Grid layout follows source lines
The renderer SHALL render each source line of bars as one row, with one cell per bar. Bars SHALL never be re-flowed across rows.

#### Scenario: Three lines of four bars
- **WHEN** the chart has three lines with four bars each
- **THEN** the output has three rows of four cells in source order

#### Scenario: Lines with different bar counts
- **WHEN** one line has four bars and the next has two
- **THEN** the second row has two cells and does not stretch to fill the width of the first

### Requirement: Bar lines
Bar line kinds SHALL be visually distinct: single line, double line, opening repeat with dots, closing repeat with dots. A repeat count SHALL be shown at the closing repeat.

#### Scenario: Repeat signs
- **WHEN** a line is `||: C | G :||x3`
- **THEN** the first cell shows an opening repeat sign, the last cell shows a closing repeat sign with `x3`

### Requirement: Chord placement inside a bar
Each chord SHALL be placed horizontally at its position fraction within the bar cell. Holds SHALL render as empty space by default and as a small dot when the "show holds" setting is enabled.

#### Scenario: Two chords
- **WHEN** a bar has tokens C and G
- **THEN** C is at the left edge and G starts at the horizontal middle of the cell

#### Scenario: Hold shown
- **WHEN** the bar is `C   D- G7` and show holds is enabled
- **THEN** a dot appears at the second quarter of the cell

### Requirement: Repeat bar symbol
A repeat bar SHALL render the `%` measure repeat symbol (U+1D10E or a CSS drawn equivalent) centered in the cell.

#### Scenario: Repeat bar
- **WHEN** a bar is a repeat bar
- **THEN** the cell contains only the repeat symbol

### Requirement: Time signature display
A bar carrying a time signature token SHALL show the numerals stacked at the left edge of the cell, before the first chord.

#### Scenario: Time signature in first bar
- **WHEN** the first bar has time signature 4/4
- **THEN** a stacked `4` over `4` appears at the start of that cell

### Requirement: Section labels and markers
Section labels SHALL render as boxed text at the left of the first row of the section. Ending markers SHALL render as a bracket over the bar with the ending number. Coda, segno and fine SHALL render as their music glyphs (U+1D10C, U+1D10B) or text above the bar. Uneven timing bars SHALL carry a subtle visual marker.

#### Scenario: Boxed section
- **WHEN** a section is labeled `A`
- **THEN** a boxed `A` appears at the left of its first row

#### Scenario: First ending bracket
- **WHEN** a bar has ending marker 1
- **THEN** a bracket with `1.` is drawn above the bar

### Requirement: Header display
The title SHALL render above the chart in a larger font. The key SHALL render below the title in smaller text when present.

#### Scenario: Title and key
- **WHEN** the header has title `All of Me` and key `C`
- **THEN** the title appears above the chart and the key appears under it

### Requirement: Theme and print
All styles SHALL be scoped under a single root class and use Obsidian color variables so the chart is readable in light and dark themes. A print stylesheet SHALL force black on white and avoid page breaks inside a row.

#### Scenario: Dark theme
- **WHEN** Obsidian uses a dark theme
- **THEN** bar lines and chord text use the theme's foreground color

#### Scenario: PDF export
- **WHEN** the note is exported to PDF
- **THEN** the chart prints black on white with no row split across pages

### Requirement: Diagnostics display
Parse diagnostics SHALL be listed below the rendered chart with their line numbers. The chart that could be parsed SHALL still render.

#### Scenario: One bad line
- **WHEN** one line is unparseable
- **THEN** the other lines render and a message naming the bad line appears below the chart
