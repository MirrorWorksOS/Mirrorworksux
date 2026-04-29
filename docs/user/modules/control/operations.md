# Operations

## Summary
Standard Operations master-data screen — the atomic units that routings and standard routes are built from. Each operation has a category, a default work centre, default minutes, and an optional subcontract flag.

## Route
`/control/operations`

## User Intent
Define and maintain the catalogue of operations the factory performs (e.g. *Laser Cut*, *Press Brake Bend*, *MIG Weld*, *Powder Coat*) so they can be picked into routings and routes.

## Primary Actions
- Search and filter operations.
- *New operation* — opens [`OperationFormDialog`](apps/web/src/components/control/OperationFormDialog.tsx) in create mode.
- Click a row in the operations table to open the same dialog in edit mode.

### Create / edit form fields
- **Name** *(required)* — e.g. *Laser Cut*.
- **Category** — one of *Planning* / *Cutting* / *Forming* / *Machining* / *Joining* / *Finishing* / *Quality*. Drives the chip colour shown anywhere this operation appears in a route or BOM-routing tree.
- **Default work centre** *(required)* — the work centre this operation runs at by default (e.g. *Laser Cutter*).
- **Default minutes** *(required)* — non-zero positive integer; the per-step minutes used in routes if no override is set.
- **Description** — optional, shown on hover in the operation picker.
- **Subcontract toggle** — when on, this operation defaults to outside processing.

## Key UI Sections
- Page header with search + *New operation* toolbar button.
- Primary table listing operations with category chip, default work centre, default minutes, subcontract flag.
- Dialog overlay for create / edit.

## Data Shown
- Operation catalogue: name, category, default work centre, default minutes, subcontract flag, description.

## States
- default
- empty
- error
- success
- populated

## Design / UX Notes
- The 7-key category palette is shared with [Routes](./routes.md) — a *Cutting* operation looks the same in the operations table and on a route step chip.
- Backend writes are mocked: the dialog hands the new/edited operation to the parent which currently fires a confirmation toast. Production wiring is gated on the `// TODO(backend)` markers in `OperationFormDialog`.

## See also
- [Routes](./routes.md) — uses the operations catalogue as the source of route steps.
- [BOMs](./boms.md) — labour lines reference an operation's id + minutes.
