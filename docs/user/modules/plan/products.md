# Products

## Summary
Products screen. Behavior is documented from current component implementation.

## Route
`/plan/products`

## User Intent
Complete products work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Open related pages and record detail views.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.

## Data Shown
- Product/material/BOM and inventory planning records.

## States
- default
- success
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/button.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/lib/product-studio-catalog-map`

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Related Files
- `apps/web/src/components/plan/PlanProducts.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/button.tsx`
