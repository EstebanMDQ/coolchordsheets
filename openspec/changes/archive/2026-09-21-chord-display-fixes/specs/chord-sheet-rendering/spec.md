## MODIFIED Requirements

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
