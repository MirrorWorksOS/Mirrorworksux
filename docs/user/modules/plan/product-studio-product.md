# Product Studio v2 (Product)

## Summary
Product Studio v2 (Product) screen. This is a dynamic detail route. Current implementation includes mock/seed data paths.

## Route
`/plan/product-studio/:productId`

## User Intent
Complete product studio v2 (product) work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.
- Switch tabs/sub-views within the page.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Tabbed content regions.
- Form controls for editing/creation.

## Data Shown
- Product/material/BOM and inventory planning records.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- loading
- empty
- error
- success
- blocked
- populated

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.
