# Bills

## Summary
Bills screen. Behavior is documented from current component implementation.

## Route
`/buy/bills`

## User Intent
Complete bills work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.

## Data Shown
- Procurement transactions, supplier records, and sourcing comparisons.

## States
- default
- error
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
