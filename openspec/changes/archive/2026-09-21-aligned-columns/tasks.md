## 1. Layout

- [x] 1.1 Renderer: append cells directly to the row, drop the cells wrapper, set --ccs-cols on the body
- [x] 1.2 styles.css: body grid with gutter plus repeat(var(--ccs-cols)) columns, subgrid rows, min-width cells, body scroll, flex fallback under @supports not
- [x] 1.3 Update print rules for the grid
- [x] 1.4 Renderer tests: --ccs-cols on the body, cells are direct children of the row, min-width via --ccs-slots
- [x] 1.5 Build, test, screenshot with rows of different bar counts and a dense bar
