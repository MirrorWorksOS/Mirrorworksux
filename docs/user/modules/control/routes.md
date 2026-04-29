# Routes

## Summary
Standard Routes master-data screen. A *route* is a named, ordered template of standard operations — the recipe that an Operations / Make / Plan workflow follows when manufacturing a product.

## Route
`/control/routes`

## User Intent
Define and maintain reusable manufacturing routes (e.g. *Plate Cut → Bend → Weld → Powder Coat*) so they can be applied to products / jobs without re-picking the underlying operations every time.

## Primary Actions
- Search and filter routes.
- *New route* — opens [`RouteEditorSheet`](apps/web/src/components/control/RouteEditorSheet.tsx) (a full-height side sheet) in create mode.
- Per-card *Edit* — opens the same sheet pre-populated.
- Inside the sheet:
  - Set route **name** (required), **category**, **description**.
  - Add steps via the *Add op* picker (grouped by category for fast scanning).
  - Drag steps with the grip handle to re-order.
  - Override the default minutes per step inline.
  - Remove a step with the trash icon.

## Key UI Sections
- Page header with search + *New route* toolbar button.
- Card-grid of existing routes with category chips.
- Side-sheet editor with name / category / description, drag-reorderable step list, total-minutes summary, *Add op* picker.

## Data Shown
- Route header: name, category, description, step count, total minutes (sum of step minutes / overrides).
- Step detail: operation, default work centre, minutes (default or override).

## States
- default
- empty
- error
- success
- populated

## Design / UX Notes
- Step chips use the [`operation-category-colors`](apps/web/src/lib/operation-category-colors.ts) palette — a *Cutting* step is yellow, *Joining* is mirage, etc. The chip colour is pulled from the underlying operation's category, not stored on the route.
- The default minutes shown next to each step come from the operation's catalogue value; only the **override** is stored on the route.
- The sheet is full-height (not a modal) because long routes (>10 steps) are common.

## See also
- [Operations](./operations.md) — source of route step pickers.
- [BOMs](./boms.md) — labour lines reference an operation; a route is a separate concept that orders multiple operations.
