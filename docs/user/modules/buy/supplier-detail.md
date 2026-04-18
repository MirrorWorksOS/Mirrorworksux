# Supplier Detail

## Summary
Supplier Detail screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/buy/suppliers/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- KPI/summary card strip.
- Primary table/list region for records.

## Data Shown
- Procurement transactions, supplier records, and sourcing comparisons.

## States
- default
- empty
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
