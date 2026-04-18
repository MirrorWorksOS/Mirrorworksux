# Inventory

## Summary
Inventory screen. Current implementation includes mock/seed data paths.

## Route
`/control/inventory`

## User Intent
Complete inventory work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.
- Switch tabs/sub-views within the page.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Primary table/list region for records.
- Charts and trend cards.
- Tabbed content regions.
- Form controls for editing/creation.

## Data Shown
- Product/material/BOM and inventory planning records.
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
