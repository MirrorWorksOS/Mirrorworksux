# Purchase Orders

## Summary
Purchase orders screen. Behavior is documented from current component implementation.

## Route
`/book/purchases`

## User Intent
Complete purchase orders work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.

## Data Shown
- Procurement transactions, supplier records, and sourcing comparisons.

## States
- default
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
