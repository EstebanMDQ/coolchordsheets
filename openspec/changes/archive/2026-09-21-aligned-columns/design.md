## Context

Rows are flex containers and each cell has an explicit width, so nothing ties column widths across rows. The Obsidian runtime is current Chromium and mobile WebKit, both of which support CSS subgrid.

## Goals / Non-Goals

**Goals:** bar N aligned across rows; equal column widths by default; dense bars widen only their own column; the whole chart scrolls as one on narrow panes.

**Non-Goals:** re-flowing bars per row, or forcing four bars per row. Source line breaks stay authoritative.

## Decisions

**Grid plus subgrid, not a table.** The body is `display: grid` with `grid-template-columns: <gutter> repeat(var(--ccs-cols), minmax(auto, 1fr))`, where the renderer sets `--ccs-cols` to the largest bar count of any row. Each row is `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1`, so rows keep their wrapper element (padding for marks, `break-inside: avoid` in print) while cells land in shared columns. A table was rejected because ending brackets and repeat dots rely on absolutely positioned pseudo elements, which are unreliable on table cells. `display: contents` rows were rejected because they lose padding and print control.

**Cell width becomes a minimum.** `min-width: max(baseWidth, slots * minSlotWidth)` feeds the column's `auto` minimum, and `1fr` shares the rest equally. A column with a six-chord bar becomes wider than its neighbours; all other columns stay equal.

**Fallback.** The previous flex rules live under `@supports not (grid-template-columns: subgrid)`; the DOM is the same for both.

## Risks / Trade-offs

- [Equal columns fill the pane, so charts look wider in a large window] -> Matches iReal Pro and print; base width still applies as the minimum on narrow panes, where the body scrolls.
- [Print scaling] -> The grid fills the printable width; if the minimum widths exceed it the row is clipped, which is the same limit as before.
