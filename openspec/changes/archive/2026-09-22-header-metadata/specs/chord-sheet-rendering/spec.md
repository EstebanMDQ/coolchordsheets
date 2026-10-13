## MODIFIED Requirements

### Requirement: Header display
The header SHALL render above the chart when any of title, key, author or notes is present. The first row SHALL have three columns: the key on the left formatted with the chord formatter (so `Bb-` displays as `B♭-`), the title centered in a larger font, and the author on the right. Empty columns keep their space so the title stays centered. Notes SHALL render below that row, one line per note, in smaller italic muted text.

#### Scenario: Title and key
- **WHEN** the header has title `All of Me` and key `Bb`
- **THEN** the title appears centered above the chart and `B♭` appears in the left column

#### Scenario: Author and notes
- **WHEN** the header has author `Esteban` and notes `Play it uptempo`
- **THEN** `Esteban` appears in the right column and `Play it uptempo` appears below the title row

#### Scenario: Notes only
- **WHEN** the header has only `notes: Ballad`
- **THEN** a header is rendered with an empty title row and the note below it
