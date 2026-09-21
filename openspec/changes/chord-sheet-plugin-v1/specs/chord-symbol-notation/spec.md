## ADDED Requirements

### Requirement: Chord symbol parsing
The chord parser SHALL split a chord token into root letter (A-G), optional accidental (`b` or `#`), quality, extensions and optional bass note after `/`. Parsing SHALL be deterministic and SHALL not throw.

#### Scenario: Minor seventh with flat root
- **WHEN** the token is `Bb-7`
- **THEN** root is B, accidental is flat, quality is minor, extensions is `7`, bass is absent

#### Scenario: Slash chord
- **WHEN** the token is `C/E`
- **THEN** root is C, quality is major, bass is E

#### Scenario: Slash chord with accidental bass
- **WHEN** the token is `F#-7/A#`
- **THEN** root is F sharp, quality is minor, extensions is `7`, bass is A sharp

#### Scenario: Unknown quality preserved
- **WHEN** the token is `Cweird9`
- **THEN** root is C and the quality text `weird9` is kept verbatim

### Requirement: iReal Pro spellings and aliases
The parser SHALL recognize `-` as minor, `^` as major seventh, `h` as half-diminished and `o` as diminished. It SHALL also accept the aliases `m`, `min`, `maj`, `M`, `dim`, `m7b5`, `ø`, `°`, `sus`, `sus2`, `sus4`, `aug`, `+`, `alt`, `add9`, `6/9` and numeric extensions (`6`, `7`, `9`, `11`, `13`, `b9`, `#9`, `#11`, `b13`).

#### Scenario: Long-form minor alias
- **WHEN** the token is `Am7`
- **THEN** it parses the same as `A-7`

#### Scenario: Long-form major seventh alias
- **WHEN** the token is `Cmaj7`
- **THEN** it parses the same as `C^7`

#### Scenario: Half-diminished aliases
- **WHEN** the tokens are `Bh7`, `Bm7b5` and `Bø7`
- **THEN** all three parse to root B, quality half-diminished, extensions `7`

#### Scenario: Six nine
- **WHEN** the token is `C6/9`
- **THEN** quality is major with extensions `6/9` and no bass note

### Requirement: Display formatting
The formatter SHALL produce display parts: root letter, accidental glyph (U+266D for flat, U+266F for sharp), a superscript quality string using iReal Pro spellings, and an optional bass part. Minor SHALL display as `-`, major seventh as a triangle (U+0394 or `^`), half-diminished as `ø`, diminished as `o`.

#### Scenario: Format minor seventh
- **WHEN** formatting `Bbm7`
- **THEN** the parts are root `B`, accidental `♭`, superscript `-7`

#### Scenario: Format major seventh
- **WHEN** formatting `Cmaj7`
- **THEN** the parts are root `C`, no accidental, superscript `Δ7`

#### Scenario: Format slash chord
- **WHEN** formatting `G7/B`
- **THEN** the parts are root `G`, superscript `7`, bass `B`

#### Scenario: Format no chord
- **WHEN** formatting the no-chord token
- **THEN** the display is the text `N.C.` with no superscript
