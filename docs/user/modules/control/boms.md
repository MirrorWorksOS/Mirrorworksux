# BOMs

## Summary
Bill of Materials master-data screen. Lists every BOM with version + status, opens a side-sheet editor for create / edit. Multi-tier (nested) BOMs are supported via `subAssembly` line references that point at another BOM by id.

## Route
`/control/boms`

## User Intent
Define a Bill of Materials for a product so downstream Plan / Make / Buy / Book modules can compute material demand, routing, and costs.

## Primary Actions
- Search and filter BOMs.
- *New BOM* — opens [`BomEditorSheet`](apps/web/src/components/control/BomEditorSheet.tsx) in create mode.
- Per-row *Edit* — opens the same sheet pre-populated.
- Inside the sheet:
  - Add lines of four kinds: **material** (raw stock, e.g. *10mm MS Plate*), **purchased** (off-the-shelf, e.g. *M10 fastener kit*), **labour** (time-based, e.g. *Welding — MIG · 3 hrs*), **subAssembly** (reference to another BOM by id; renders nested).
  - Re-order, edit, or remove lines.
  - The sub-assembly picker only offers BOMs that already exist (`availableSubAssemblies` is passed in by the page) so dangling refs are prevented.

## Key UI Sections
- Page header with search + *New BOM* toolbar button.
- Primary table of BOMs (product, SKU, version, status, line count).
- Side-sheet editor (overlays the table, full-height on the right).

## Data Shown
- BOM headers: product, SKU, version, status (`active` / `draft` / `obsolete`), line count.
- Line detail (inside the sheet): kind, SKU / sub-BOM ref, description, qty, unit.

## States
- default
- empty
- error
- success
- populated

## Design / UX Notes
- The editor uses `Sheet` not `Dialog` because the line list often grows beyond a modal's vertical budget.
- Sub-assembly lines render with a *Sub-assembly* badge using the `--mw-blue` chip; expanding to view children is done by re-opening the referenced BOM.
- Status changes (`active` ↔ `draft`) are part of the editor save payload; no inline status toggle on the table.
