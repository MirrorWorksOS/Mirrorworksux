# Purchase Orders

## Summary
Purchase Orders screen. Current implementation includes mock/seed data paths.

## Route
`/buy/orders`

## User Intent
Complete purchase orders work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.

## Data Shown
- Order headers, statuses, due dates, quantities, and values.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- error
- success
- blocked
- populated

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
