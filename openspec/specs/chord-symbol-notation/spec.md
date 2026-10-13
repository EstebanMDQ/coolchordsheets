# chord-symbol-notation Specification

## Purpose
TBD - created by archiving change chord-sheet-plugin-v1. Update Purpose after archive.
## Requirements
### Requirement: Chord token grammar
A chord token SHALL match this grammar, where `root` is a single uppercase letter A-G and accidentals are greedy (an accidental immediately after the root always belongs to the root):

```
chord      = root [accidental] [quality] [extensions] ["/" bass]
root       = "A" | "B" | "C" | "D" | "E" | "F" | "G"
accidental = "b" | "#" | "♭" | "♯"
bass       = root [accidental]
quality    = one alias from the alias table
extensions = any run of characters that is not a bass suffix; parentheses are stripped
```

The bass suffix is a `/` followed by a root and optional accidental at the very end of the token. Any other `/` (as in `6/9`) is part of the extensions. Lowercase roots are not chords. Parsing SHALL be deterministic and SHALL not throw.

#### Scenario: Minor seventh with flat root
- **WHEN** the token is `Bb-7`
- **THEN** root is B, accidental is flat, quality is `minor`, extensions is `7`, bass is absent

#### Scenario: Greedy root accidental
- **WHEN** the token is `Cb9`
- **THEN** root is C, accidental is flat, quality is `dominant`, extensions is `9`

#### Scenario: Slash chord
- **WHEN** the token is `C/E`
- **THEN** root is C, quality is `major`, bass is E

#### Scenario: Slash chord with accidental bass
- **WHEN** the token is `F#-7/A#`
- **THEN** root is F sharp, quality is `minor`, extensions is `7`, bass is A sharp

#### Scenario: Six nine with bass
- **WHEN** the token is `C6/9/E`
- **THEN** quality is `major`, extensions is `6/9`, bass is E

#### Scenario: Parentheses stripped
- **WHEN** the token is `C7(b9)`
- **THEN** it parses the same as `C7b9`

#### Scenario: Unicode input accepted
- **WHEN** the token is `B♭Δ7`
- **THEN** it parses the same as `Bb^7`

#### Scenario: Lowercase root rejected
- **WHEN** the token is `bb7`
- **THEN** the root does not parse and the parser reports the token as not a chord

#### Scenario: Unknown quality preserved
- **WHEN** the token is `Cweird9`
- **THEN** root is C, quality is `unknown`, and the raw text `weird9` is kept

### Requirement: Quality enum and alias table
Quality SHALL be one of: `major`, `minor`, `dominant`, `maj7`, `minmaj7`, `halfdim`, `dim`, `aug`, `sus2`, `sus4`, `unknown`. The parser SHALL map the text after the root to a quality and remaining extensions using this table, longest alias first:

| Input after root | Quality | Extensions |
|---|---|---|
| (nothing) | major | |
| `6`, `69`, `6/9`, `add9`, `add2` | major | as written |
| `maj`, `M` (no number) | major | |
| `^`, `^7`, `maj7`, `M7`, `Δ7`, `Δ` | maj7 | `7` |
| `^9`, `maj9`, `M9`, `^13`, `maj13` | maj7 | `9` or `13` |
| `-`, `m`, `min` | minor | |
| `-7`, `m7`, `min7`, `-9`, `m9`, `-11`, `m11`, `-6`, `m6` | minor | number as written |
| `-^7`, `-maj7`, `mM7`, `m^7`, `minmaj7` | minmaj7 | `7` |
| `7`, `9`, `11`, `13` | dominant | as written |
| `alt`, `7alt` | dominant | `alt` |
| `h`, `h7`, `ø`, `ø7`, `m7b5`, `-7b5`, `min7b5` | halfdim | `7` |
| `o`, `dim`, `°` | dim | |
| `o7`, `dim7`, `°7` | dim | `7` |
| `+`, `aug` | aug | |
| `+7`, `7+`, `aug7`, `7#5` | aug | `7` |
| `sus`, `sus4`, `7sus`, `7sus4`, `9sus`, `9sus4`, `13sus` | sus4 | number if any |
| `sus2`, `7sus2` | sus2 | number if any |

Alteration suffixes `b5`, `#5`, `b9`, `#9`, `#11`, `b13` MAY follow any row and SHALL be appended to extensions verbatim (for example `7b9#11` is dominant with extensions `7b9#11`). Text that matches no row SHALL give quality `unknown` with the text kept raw.

#### Scenario: Plain dominant
- **WHEN** the token is `G7`
- **THEN** quality is `dominant` and extensions is `7`

#### Scenario: Long-form minor alias
- **WHEN** the token is `Am7`
- **THEN** it parses the same as `A-7`

#### Scenario: Long-form major seventh alias
- **WHEN** the token is `Cmaj7`
- **THEN** it parses the same as `C^7`

#### Scenario: Major triad aliases
- **WHEN** the tokens are `Cmaj` and `CM`
- **THEN** both parse to quality `major` with no extensions

#### Scenario: Half-diminished aliases
- **WHEN** the tokens are `Bh7`, `Bm7b5`, `B-7b5` and `Bø7`
- **THEN** all four parse to root B, quality `halfdim`, extensions `7`

#### Scenario: Minor major seventh
- **WHEN** the token is `C-^7`
- **THEN** quality is `minmaj7` and extensions is `7`

#### Scenario: Augmented spellings
- **WHEN** the tokens are `C+7`, `C7+` and `C7#5`
- **THEN** all three parse to quality `aug`, extensions `7`

#### Scenario: Suspended
- **WHEN** the tokens are `C7sus4`, `C9sus` and `Csus`
- **THEN** they parse to quality `sus4` with extensions `7`, `9` and empty respectively

#### Scenario: Diminished seventh
- **WHEN** the tokens are `Co7` and `Cdim7`
- **THEN** both parse to quality `dim`, extensions `7`

#### Scenario: Altered dominant
- **WHEN** the tokens are `C13b9` and `Calt`
- **THEN** both are `dominant`, with extensions `13b9` and `alt`

#### Scenario: Six nine
- **WHEN** the token is `C6/9`
- **THEN** quality is `major` with extensions `6/9` and no bass note

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

