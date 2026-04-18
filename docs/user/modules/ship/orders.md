# Orders

## Summary
Orders screen. Behavior is documented from current component implementation.

## Route
`/ship/orders`

## User Intent
Complete orders work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.

## Data Shown
- Order headers, statuses, due dates, quantities, and values.

## States
- default
- error
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
