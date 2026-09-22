## Context

Small fixes found while testing the v1 plugin in a vault. All three are contained in the chord formatter, the renderer and the stylesheet.

## Goals / Non-Goals

**Goals:** rename the display part, stop the dot overlap, center single chords.

**Non-Goals:** any grammar change, any change to fractional placement for bars with several tokens.

## Decisions

**Center by token count, not chord count.** A bar with `C   ` (chord plus hold) has two timing tokens and keeps fractional placement, because the hold was written on purpose. Only a bar whose token list has length one is centered. `N.C.` and an unknown token alone are centered too.

**Center in the renderer, not with a CSS-only rule.** The renderer sets `left: 50%` and a `ccs-centered` class on the token; the class adds `translateX(-50%)`. This keeps position math in one place and makes the DOM test trivial.

**Clear the dots by moving the cell body.** The earlier fix added a margin to the chord area only, so a time signature gutter still sat under the dots. The margin now applies to the cell body, which contains both.

## Risks / Trade-offs

- [A single chord with a time signature gutter is centered in the remaining width, not the full cell] -> Acceptable; it matches how the fractional positions already work.
