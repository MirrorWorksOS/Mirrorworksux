# Purchase Order Detail

## Summary
Purchase Order Detail screen. This is a dynamic detail route. Current implementation includes mock/seed data paths.

## Route
`/buy/orders/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Open related pages and record detail views.

## Key UI Sections
- Primary table/list region for records.
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Order headers, statuses, due dates, quantities, and values.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- empty
- error
- success
- populated

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
