## ADDED Requirements

### Requirement: Header keys
The parser SHALL accept optional `key: value` lines before the first bar line. Recognized keys are `title`, `key` and `time`. Unknown keys SHALL be ignored. `time` MUST default to `4/4` when absent.

#### Scenario: Header with all keys
- **WHEN** the block starts with `title: All of Me`, `key: Bb` and `time: 3/4` lines
- **THEN** the AST header contains those three values and the initial time signature is 3/4

#### Scenario: No header
- **WHEN** the block starts directly with a bar line
- **THEN** the AST header has no title or key and the time signature is 4/4

### Requirement: Bar lines
The parser SHALL recognize `|`, `||`, `||:` and `:||` as bar lines. `:||` MAY be followed immediately by `x` and a number to indicate a repeat count. Each line of bars SHALL begin and end with a bar line.

#### Scenario: Simple line
- **WHEN** a line is `|| Bb | % | % | % |`
- **THEN** the AST contains one line with four bars, an opening double bar and single bar lines between and after

#### Scenario: Repeat with count
- **WHEN** a line is `||: C | G :||x3`
- **THEN** the line has an opening repeat, a closing repeat and a repeat count of 3

#### Scenario: Missing closing bar line
- **WHEN** a line is `| C | G`
- **THEN** the parser records a diagnostic for that line and still emits the two bars

### Requirement: Repeat bar
A bar whose only token is `%` SHALL be marked as a repeat of the previous bar.

#### Scenario: Repeat token
- **WHEN** a line is `| Bb | % |`
- **THEN** the second bar is a repeat bar with no chord tokens

### Requirement: Whitespace tokenization
Inside a bar the parser SHALL ignore leading and trailing whitespace. Between tokens, each full run of three spaces SHALL produce one hold token; leftover spaces (one or two) SHALL act only as a separator. A tab character SHALL count as one hold.

#### Scenario: Two chords, single space
- **WHEN** a bar is `A- Bbmaj7`
- **THEN** the bar has two chord tokens and no holds

#### Scenario: Three spaces produce a hold
- **WHEN** a bar is `C   D- G7`
- **THEN** the tokens are chord C, hold, chord D-, chord G7

#### Scenario: Six spaces produce two holds
- **WHEN** a bar is `C      D-`
- **THEN** the tokens are chord C, hold, hold, chord D-

#### Scenario: Four spaces produce one hold
- **WHEN** a bar is `C    D-`
- **THEN** the tokens are chord C, hold, chord D-

#### Scenario: Leading whitespace ignored
- **WHEN** a bar is `  C   D-` with two leading spaces
- **THEN** the tokens are chord C, hold, chord D-

#### Scenario: Tab is a hold
- **WHEN** a bar is `C\tD-`
- **THEN** the tokens are chord C, hold, chord D-

### Requirement: Even division
Every token in a bar SHALL be assigned a position of `index / tokenCount` and a duration of `1 / tokenCount` of the bar. A hold token SHALL extend the preceding chord by its duration.

#### Scenario: Half note then two quarters
- **WHEN** the bar is `C   D- G7` in 4/4
- **THEN** C spans beats 1-2, D- is on beat 3 and G7 on beat 4

#### Scenario: Uneven token count flagged
- **WHEN** the bar is `C   D-` in 4/4
- **THEN** the tokens are placed at 0, 1/3 and 2/3 of the bar and the bar is flagged as uneven timing

### Requirement: Time signature token
A token matching `<number>/<number>` at the start of a bar SHALL set the time signature for that bar and all following bars until changed. It SHALL not count as a chord token for timing.

#### Scenario: Time signature in first bar
- **WHEN** a line is `|| 4/4 A- Bbmaj7 ||`
- **THEN** the bar has time signature 4/4 and two chord tokens each spanning half the bar

#### Scenario: Time signature change mid chart
- **WHEN** a later bar starts with `3/4`
- **THEN** that bar and the following bars report 3/4 until another time signature token appears

### Requirement: Section labels
A line consisting only of `[label]` SHALL start a new section with that label. Bars before any label SHALL belong to an unlabeled section.

#### Scenario: Section label
- **WHEN** the block contains `[A]` on its own line followed by bar lines
- **THEN** the AST has a section labeled `A` containing those lines

### Requirement: Bar markers
A bar MAY start with one or more markers in square brackets: `[1.]`, `[2.]`, `[coda]`, `[segno]`, `[fine]`, `[D.S. al Coda]`, `[D.C. al Fine]`. Markers SHALL be attached to the bar and SHALL not count as tokens for timing.

#### Scenario: First ending
- **WHEN** a bar is `[1.] G7 C`
- **THEN** the bar has an ending marker `1` and two chord tokens

#### Scenario: Coda marker
- **WHEN** a bar is `[coda] F`
- **THEN** the bar has a coda marker and one chord token

### Requirement: No chord
The token `N.C.` (case insensitive, with or without dots) SHALL be a no-chord token that takes a timing slot like a chord.

#### Scenario: N.C. token
- **WHEN** a bar is `N.C. G7`
- **THEN** the bar has a no-chord token followed by chord G7, each spanning half the bar

### Requirement: Diagnostics instead of exceptions
The parser SHALL never throw on any input. Unrecognized lines or tokens SHALL produce diagnostics with a line number and message, and parsing SHALL continue.

#### Scenario: Garbage line
- **WHEN** a line is `this is not a bar`
- **THEN** the AST contains a diagnostic naming that line and the remaining lines are still parsed
