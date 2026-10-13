## MODIFIED Requirements

### Requirement: Header keys
Lines before the first line of bars matching `<key>: <value>` SHALL be header lines, where `<key>` is one or more letters and the value is everything after the first colon, trimmed. Recognized keys are `title`, `key`, `time`, `author` and `notes`. `notes` MAY appear on several lines; each value is kept in order as one note. Unknown keys SHALL be stored in `header.extra` as a map and SHALL not produce a diagnostic. `time` MUST match the time signature token grammar and MUST default to `4/4` when absent or invalid (invalid produces a warning). `key` SHALL be parsed with the chord parser; its value is a root, optional accidental and optional minor spelling (`-`, `m`, `min`). A `key` value that does not parse SHALL be kept as raw text with a warning. A header-shaped line after the first line of bars SHALL be treated as an unrecognized line.

#### Scenario: Header with all keys
- **WHEN** the block starts with `title: All of Me`, `key: Bb` and `time: 3/4` lines
- **THEN** the AST header contains those three values and the initial time signature is 3/4

#### Scenario: Author and notes
- **WHEN** the header has `author: Esteban` and `notes: Play it uptempo`
- **THEN** `header.author` is `Esteban` and `header.notes` is `["Play it uptempo"]`

#### Scenario: Repeated notes
- **WHEN** the header has `notes: Medium swing` followed by `notes: Solos on A only`
- **THEN** `header.notes` is `["Medium swing", "Solos on A only"]`

#### Scenario: Minor key
- **WHEN** the header has `key: G-`
- **THEN** the header key has root G, quality minor

#### Scenario: Title containing a colon
- **WHEN** the header has `title: Song: Part 2`
- **THEN** the title is `Song: Part 2`

#### Scenario: Unknown key stored
- **WHEN** the header has `composer: Gerald Marks`
- **THEN** `header.extra.composer` is `Gerald Marks` and no diagnostic is produced

#### Scenario: Header line after bars
- **WHEN** `title: Late` appears after a line of bars
- **THEN** the parser records an error diagnostic for that line and does not change the title

#### Scenario: No header
- **WHEN** the block starts directly with a bar line
- **THEN** the AST header has no title or key and the time signature is 4/4
