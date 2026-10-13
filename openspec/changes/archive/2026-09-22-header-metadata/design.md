## Context

The header today shows a centered title with the key under it. `header.extra` already keeps unknown keys, so `author` and `notes` were being parsed and dropped.

## Decisions

**Three-column header row.** Key left, title center, author right, using a grid with `1fr auto 1fr` so the title stays centered even when only one side is present. Notes go on their own line below, left aligned, italic, muted. This is how iReal Pro and most printed lead sheets place composer and style.

**Repeatable notes.** `notes:` may be written several times; each becomes a line. A single long note works too. Other keys stay in `header.extra` as before.

## Risks / Trade-offs

- [Long author or key text pushes the title off center] -> The side columns share leftover space equally; on very narrow panes the row wraps to title above, key and author below.
