# New Invoice

## Summary
New invoice screen. Behavior is documented from current component implementation.

## Route
`/sell/invoices/new`

## User Intent
Complete new invoice work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.

## Data Shown
- Invoice amounts, payment status, and aging details.

## States
- default
- error
- success
- blocked
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.
