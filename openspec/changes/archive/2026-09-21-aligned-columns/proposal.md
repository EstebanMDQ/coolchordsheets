## Why

Each row currently sizes its own cells, so bar 2 of one row does not line up with bar 2 of the next. Chord charts are read as a grid; iReal Pro and printed lead sheets keep every column the same width down the page.

## What Changes

- The chart body becomes one CSS grid with a gutter column plus one column per bar position (as many as the widest row). Each row is a subgrid, so column N has a single width across the whole chart.
- Columns share the available width equally, and never shrink below the widest cell's minimum width (the existing `max(baseWidth, slots * minSlotWidth)` rule, now a minimum instead of a fixed width). Rows with fewer bars align to the leading columns.
- Horizontal scrolling moves from the row to the chart body so the whole grid scrolls together.
- Browsers without subgrid fall back to the previous per-row flex layout.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `chord-sheet-rendering`: "Grid layout follows source lines" gains column alignment across rows; "Cell sizing" changes the width rule to a minimum with equal column sharing.

## Impact

- `src/render/index.ts` (cells appended directly to the row, column count on the body), `styles.css`, renderer tests. No parser or plugin changes.
