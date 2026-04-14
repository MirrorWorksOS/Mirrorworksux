# Products

## Summary
Products screen. Current implementation includes mock/seed data paths.

## Route
`/buy/products`

## User Intent
Complete products work and move records to the next stage.

## Primary Actions
- Open related pages and record detail views.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.

## Data Shown
- Product/material/BOM and inventory planning records.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- error
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/badge.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/buy/BuyProducts.tsx`
- `apps/web/src/components/ui/badge.tsx`
