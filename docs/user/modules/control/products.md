# Products

## Summary
Products screen. Behavior is documented from current component implementation.

## Route
`/control/products`

## User Intent
Complete products work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Primary table/list region for records.
- Form controls for editing/creation.

## Data Shown
- Product/material/BOM and inventory planning records.

## States
- default
- empty
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
