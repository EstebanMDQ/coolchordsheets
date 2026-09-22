## MODIFIED Requirements

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
