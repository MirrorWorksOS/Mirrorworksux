# BOMs

## Summary
BOMs screen. Behavior is documented from current component implementation.

## Route
`/control/boms`

## User Intent
Complete boms work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.

## Key UI Sections
- Primary table/list region for records.

## Data Shown
- Product/material/BOM and inventory planning records.

## States
- default
- empty
- error
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
