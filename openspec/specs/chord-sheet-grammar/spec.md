# chord-sheet-grammar Specification

## Purpose
TBD - created by archiving change chord-sheet-plugin-v1. Update Purpose after archive.
## Requirements
### Requirement: Parse order
The parser SHALL process a block in this order: split into lines; classify each line as blank, comment, header, section label, line-level marker, or line of bars; split a line of bars on bar lines; extract bracket markers from the start of each bar; extract a time signature token; tokenize the remaining bar content on whitespace. Bracket markers SHALL be extracted before whitespace tokenization so that markers containing spaces (`[D.S. al Coda]`) are never split.

#### Scenario: Marker with spaces survives tokenization
- **WHEN** a bar is `[D.S. al Coda] G7 C`
- **THEN** the bar has one marker `D.S. al Coda` and two chord tokens

### Requirement: Blank lines and comments
Blank lines (empty or whitespace only) SHALL be ignored anywhere in the block. A line whose first non-blank characters are `//` SHALL be a comment and ignored. Neither produces a diagnostic or affects layout.

#### Scenario: Blank line between systems
- **WHEN** two lines of bars are separated by an empty line
- **THEN** the AST has two lines of bars and no diagnostic

#### Scenario: Comment line
- **WHEN** a line is `// swing feel`
- **THEN** the line is ignored and no diagnostic is produced

### Requirement: Header keys
Lines before the first line of bars matching `<key>: <value>` SHALL be header lines, where `<key>` is one or more letters and the value is everything after the first colon, trimmed. Recognized keys are `title`, `key` and `time`. Unknown keys SHALL be stored in `header.extra` as a map and SHALL not produce a diagnostic. `time` MUST match the time signature token grammar and MUST default to `4/4` when absent or invalid (invalid produces a warning). `key` SHALL be parsed with the chord parser; its value is a root, optional accidental and optional minor spelling (`-`, `m`, `min`). A `key` value that does not parse SHALL be kept as raw text with a warning. A header-shaped line after the first line of bars SHALL be treated as an unrecognized line.

#### Scenario: Header with all keys
- **WHEN** the block starts with `title: All of Me`, `key: Bb` and `time: 3/4` lines
- **THEN** the AST header contains those three values and the initial time signature is 3/4

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

### Requirement: Bar lines
The parser SHALL recognize these bar lines: `|` (single), `||` (double), `||:` (opening repeat), `:||` (closing repeat), `:||:` (closing then opening repeat). The shorter spellings `|:` and `:|` SHALL be accepted as aliases for `||:` and `:||`. A closing repeat MAY be followed by optional spaces, then `x` or `X` and a positive integer, giving a repeat count; the count is part of the bar line and never a token. Each line of bars SHALL begin and end with a bar line. An opening repeat at the end of a line SHALL be treated as the opening bar line of the next line of bars; if there is no next line it SHALL produce a warning and be treated as `||`.

#### Scenario: Simple line
- **WHEN** a line is `|| Bb | % | % | % |`
- **THEN** the AST contains one line with four bars, an opening double bar and single bar lines between and after

#### Scenario: Repeat with count
- **WHEN** a line is `||: C | G :||x3`
- **THEN** the line has an opening repeat, a closing repeat and a repeat count of 3

#### Scenario: Repeat count with space
- **WHEN** a line is `||: C | G :|| x3`
- **THEN** the repeat count is 3 and no extra bar is created

#### Scenario: Short repeat spellings
- **WHEN** a line is `|: C | G :|`
- **THEN** it parses identically to `||: C | G :||`

#### Scenario: Close and reopen
- **WHEN** a line is `||: C :||: G :||`
- **THEN** there are two bars and the bar line between them is a closing-then-opening repeat

#### Scenario: Opening repeat at line end
- **WHEN** one line is `| C | G ||:` and the next is `| A- | D7 :||`
- **THEN** the second line's opening bar line is an opening repeat

#### Scenario: Missing closing bar line
- **WHEN** a line is `| C | G`
- **THEN** the parser records an error diagnostic for that line and still emits the two bars

#### Scenario: Empty bar
- **WHEN** a line is `| C | | G |`
- **THEN** the second bar has no tokens, is marked empty, and a warning diagnostic is recorded

### Requirement: Repeat bar
A bar whose only timing token is `%` SHALL be marked as a repeat of the previous bar. Markers and a time signature token MAY precede it. A repeat bar with no previous bar in the chart SHALL produce a warning and still be marked as a repeat bar.

#### Scenario: Repeat token
- **WHEN** a line is `| Bb | % |`
- **THEN** the second bar is a repeat bar with no chord tokens

#### Scenario: Repeat with time signature
- **WHEN** a bar is `3/4 %`
- **THEN** the bar is a repeat bar with time signature 3/4

#### Scenario: Repeat in first bar
- **WHEN** the first bar of the chart is `%`
- **THEN** it is a repeat bar and a warning diagnostic is recorded

### Requirement: Whitespace tokenization
Bar content is the text between two bar lines. The parser SHALL strip exactly one space from each end of the bar content if present (the padding space). In the remaining text, each contiguous run of spaces SHALL produce one hold token per full group of three spaces; leftover spaces (one or two) act only as a separator. Each tab character SHALL produce one hold token and act as a separator. Spaces and tabs are counted independently, so `C \t D-` is chord C, hold, chord D-. Runs at the start or end of the remaining text follow the same rule, which makes trailing holds possible. The character `_` standing alone as a token SHALL also be a hold token, as an alternative spelling that survives editors that collapse whitespace.

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

#### Scenario: Padding space stripped
- **WHEN** the bar text between bar lines is ` C D- ` (one space each side)
- **THEN** the tokens are chord C, chord D-

#### Scenario: Trailing hold
- **WHEN** the bar text between bar lines is ` C D- G7    ` (one padding space, then three trailing spaces)
- **THEN** the tokens are chord C, chord D-, chord G7, hold

#### Scenario: Leading hold
- **WHEN** the bar text between bar lines is `\tC`
- **THEN** the tokens are hold, chord C

#### Scenario: Two leading spaces are a separator
- **WHEN** the bar text between bar lines is `   C` (three spaces, one of which is padding)
- **THEN** the tokens are chord C only

#### Scenario: Tab is a hold
- **WHEN** a bar is `C\tD-`
- **THEN** the tokens are chord C, hold, chord D-

#### Scenario: Mixed tab and spaces
- **WHEN** a bar is `C \t   D-`
- **THEN** the tokens are chord C, hold, hold, chord D-

#### Scenario: Explicit hold character
- **WHEN** a bar is `C _ D- G7`
- **THEN** the tokens are chord C, hold, chord D-, chord G7

### Requirement: Timing tokens and even division
Timing tokens are chord, hold, no-chord and unknown tokens. Markers, time signature tokens and `%` are not timing tokens. Every timing token SHALL be assigned a position of `index / timingTokenCount` and a duration of `1 / timingTokenCount` of the bar, where index counts timing tokens only. A hold token SHALL extend the preceding chord by its duration. A hold with no preceding chord in the bar SHALL occupy its slot as empty space. A bar SHALL be flagged as uneven when `beats % timingTokenCount != 0 && timingTokenCount % beats != 0`, where beats is the numerator of the current time signature.

#### Scenario: Half note then two quarters
- **WHEN** the bar is `C   D- G7` in 4/4
- **THEN** C spans beats 1-2, D- is on beat 3 and G7 on beat 4

#### Scenario: Uneven token count flagged
- **WHEN** the bar is `C   D-` in 4/4
- **THEN** the tokens are placed at 0, 1/3 and 2/3 of the bar and the bar is flagged as uneven timing

#### Scenario: Subdivision is even
- **WHEN** the bar has 8 timing tokens in 4/4
- **THEN** the bar is not flagged as uneven

#### Scenario: Two tokens in three four
- **WHEN** the bar is `C D-` in 3/4
- **THEN** the bar is flagged as uneven

#### Scenario: Time signature does not shift positions
- **WHEN** the bar is `3/4 C D- G7`
- **THEN** the chords are at positions 0, 1/3 and 2/3

### Requirement: Time signature token
A token matching `<n>/<d>` with `n` a positive integer and `d` one of 1, 2, 4, 8, 16, placed at the start of a bar (after any markers), SHALL set the time signature for that bar and all following bars until changed. It SHALL not count as a timing token. The same grammar applies to the header `time` value. A `<n>/<d>` token anywhere else in a bar, or with an invalid denominator, SHALL be an unknown token.

#### Scenario: Time signature in first bar
- **WHEN** a line is `|| 4/4 A- Bbmaj7 ||`
- **THEN** the bar has time signature 4/4 and two chord tokens each spanning half the bar

#### Scenario: Time signature change mid chart
- **WHEN** a later bar starts with `3/4`
- **THEN** that bar and the following bars report 3/4 until another time signature token appears

#### Scenario: Marker before time signature
- **WHEN** a bar is `[1.] 3/4 C`
- **THEN** the bar has ending marker 1, time signature 3/4 and one chord token

#### Scenario: Time signature before marker
- **WHEN** a bar is `3/4 [1.] C`
- **THEN** the bar has time signature 3/4, ending marker 1 and one chord token

#### Scenario: Time signature mid bar
- **WHEN** a bar is `C 3/4 D-`
- **THEN** `3/4` is an unknown token and a warning diagnostic is recorded

### Requirement: Section labels and line-level markers
A line consisting only of `[text]` SHALL be either a line-level marker or a section label. If the bracket text is a reserved marker name (see Bar markers) it SHALL be attached as a marker to the first bar of the next line of bars. Otherwise it starts a new section with that label. Bars before any label SHALL belong to an unlabeled section. A line-level marker with no following line of bars SHALL produce a warning.

#### Scenario: Section label
- **WHEN** the block contains `[A]` on its own line followed by bar lines
- **THEN** the AST has a section labeled `A` containing those lines

#### Scenario: Coda on its own line
- **WHEN** `[coda]` is on its own line followed by `| F | C ||`
- **THEN** no section is created and the bar with F carries a coda marker

### Requirement: Bar markers
A bar MAY start with one or more markers in square brackets, in any order relative to each other and to the time signature token. Reserved marker names, matched case-insensitively, are: endings `[<n>.]` and ranges `[<n>.-<m>.]` for positive integers; `[coda]`; `[segno]`; `[fine]`; `[D.S. al Coda]`; `[D.S. al Fine]`; `[D.C. al Coda]`; `[D.C. al Fine]`. Any other bracket text at the start of a bar SHALL be a text marker carrying the text verbatim. Markers SHALL be attached to the bar and SHALL not count as timing tokens. A bracket token that is not at the start of the bar SHALL be an unknown token.

#### Scenario: First ending
- **WHEN** a bar is `[1.] G7 C`
- **THEN** the bar has an ending marker `1.` and two chord tokens

#### Scenario: Ending range
- **WHEN** a bar is `[1.-2.] G7`
- **THEN** the bar has an ending marker `1.-2.`

#### Scenario: Coda marker
- **WHEN** a bar is `[coda] F`
- **THEN** the bar has a coda marker and one chord token

#### Scenario: Marker case
- **WHEN** a bar is `[CODA] F`
- **THEN** the bar has a coda marker

#### Scenario: Text marker
- **WHEN** a bar is `[Solo] C`
- **THEN** the bar has a text marker `Solo` and one chord token, and no diagnostic

#### Scenario: Bracket inside bar
- **WHEN** a bar is `C [Solo] G`
- **THEN** `[Solo]` is an unknown token and a warning diagnostic is recorded

### Requirement: No chord
The tokens `N.C.`, `N.C` and `NC`, matched case-insensitively, SHALL be a no-chord token that takes a timing slot like a chord.

#### Scenario: N.C. token
- **WHEN** a bar is `N.C. G7`
- **THEN** the bar has a no-chord token followed by chord G7, each spanning half the bar

### Requirement: Unknown tokens
Any token that is not a bar line, marker, time signature, `%`, hold, no-chord, or a chord whose root parses (uppercase A-G) SHALL be an unknown token. An unknown token SHALL take a timing slot, keep its raw text, and produce a warning diagnostic. A chord token whose root parses but whose quality is unknown SHALL be a chord token and SHALL also produce a warning diagnostic.

#### Scenario: Unknown root
- **WHEN** a bar is `H7 C`
- **THEN** the tokens are unknown `H7` and chord C, each spanning half the bar, and a warning is recorded

#### Scenario: Two-bar repeat symbol
- **WHEN** a bar is `%%`
- **THEN** the token is unknown `%%` and a warning is recorded

#### Scenario: Unknown quality
- **WHEN** a bar is `Cweird9`
- **THEN** the token is a chord with raw text preserved and a warning is recorded

### Requirement: Diagnostics instead of exceptions
The parser SHALL never throw on any input. Each diagnostic SHALL carry a 1-based line number relative to the block, a severity of `error` or `warning`, and a message. Errors are structural problems (missing bar line, unrecognized line); warnings are recoverable oddities (unknown token, uneven bar, empty bar). Parsing SHALL continue after any diagnostic.

#### Scenario: Garbage line
- **WHEN** a line is `this is not a bar`
- **THEN** the AST contains an error diagnostic naming that line and the remaining lines are still parsed

#### Scenario: Severity assigned
- **WHEN** a bar contains `Cweird9`
- **THEN** the diagnostic severity is `warning`

### Requirement: Parsing performance
Parsing a 200-bar chart SHALL complete in under 10 ms on a desktop machine, measured in the test suite.

#### Scenario: Large chart
- **WHEN** a block with 200 bars is parsed
- **THEN** the elapsed time is under 10 ms

