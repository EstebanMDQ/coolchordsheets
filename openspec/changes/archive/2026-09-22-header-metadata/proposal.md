## Why

A chart usually carries more than a title and key: who wrote it and a performance note such as "play it uptempo". The grammar keeps unknown header keys but never shows them, so there is no way to put this on the page.

## What Changes

- `author` and `notes` become recognized header keys. `notes` MAY appear more than once; each line is kept in order.
- The rendered header becomes a lead sheet header: key on the left, title centered, author on the right, and notes below in smaller italic text.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `chord-sheet-grammar`: "Header keys" recognizes `author` and repeatable `notes`.
- `chord-sheet-rendering`: "Header display" lays out key, title, author and notes.

## Impact

- `src/parser` (Header type and header parsing), `src/render` (header), `styles.css`, tests, README header table, the All of Me example and its generated screenshot.
