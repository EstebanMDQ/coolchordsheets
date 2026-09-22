## Why

Testing the plugin in a vault showed three display problems: the chord part that holds the quality and extensions is named "superscript" although it now sits on the baseline, opening repeat dots overlap the time signature, and a bar with a single chord reads better with the chord centered instead of pinned to the left edge.

## What Changes

- Rename the `superscript` display part to `quality` in the formatter, the renderer and the specs. No visual change; this is the name that matches how it is drawn.
- Repeat dots SHALL NOT overlap the time signature or the first chord. The whole cell body, including the time signature gutter, moves clear of the dots.
- A bar with exactly one timing token SHALL center that token in the chord area. Bars with two or more timing tokens keep fractional placement so durations stay readable.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `chord-symbol-notation`: "Display formatting" renames the `superscript` part to `quality`.
- `chord-sheet-rendering`: "Bar lines" adds the no-overlap rule for repeat dots; "Chord placement inside a bar" adds the single-token centering rule.

## Impact

- `src/chords/index.ts`, `src/render/index.ts`, `styles.css`, tests. The `ChordDisplay` type changes shape, which only the renderer consumes.
- The web-renderer change is unaffected; its specs do not reference the part name.
