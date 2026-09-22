## MODIFIED Requirements

### Requirement: Display formatting
The formatter SHALL produce display parts: root letter, accidental glyph (U+266D for flat, U+266F for sharp), a quality string, and an optional bass part rendered at reduced size after a slash. The quality string is the quality glyph followed by extensions, using these spellings: `minor` as `-`, `maj7` as `Δ` (U+0394), `minmaj7` as `-Δ`, `halfdim` as `ø`, `dim` as `o`, `aug` as `+`, `sus2` and `sus4` as `sus2` and `sus4` after any number, `dominant` and `major` with no glyph. Accidentals inside extensions (`b9`, `#11`) SHALL be rendered with the same glyphs as the root. `6/9` SHALL be rendered inline as `6/9`, not stacked. `unknown` quality SHALL render the raw text verbatim in the quality string. The renderer SHALL draw the accidental raised and reduced, and the quality string reduced and aligned to the root baseline.

#### Scenario: Format minor seventh
- **WHEN** formatting `Bbm7`
- **THEN** the parts are root `B`, accidental `♭`, quality `-7`

#### Scenario: Format major seventh
- **WHEN** formatting `Cmaj7`
- **THEN** the parts are root `C`, no accidental, quality `Δ7`

#### Scenario: Format altered extension
- **WHEN** formatting `G7b9`
- **THEN** the quality is `7♭9`

#### Scenario: Format suspended
- **WHEN** formatting `C7sus4`
- **THEN** the quality is `7sus4`

#### Scenario: Format slash chord
- **WHEN** formatting `G7/B`
- **THEN** the parts are root `G`, quality `7`, bass `B`

#### Scenario: Format unknown quality
- **WHEN** formatting `Cweird9`
- **THEN** the parts are root `C`, quality `weird9`

#### Scenario: Format no chord
- **WHEN** formatting the no-chord token
- **THEN** the display is the text `N.C.` with no quality string
