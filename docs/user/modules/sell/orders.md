# Sales Orders

## Summary
Sales Orders screen. Current implementation includes mock/seed data paths.

## Route
`/sell/orders`

## User Intent
Complete sales orders work and move records to the next stage.

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
- empty
- error
- success
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/feedback/EmptyState`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/ToolbarFilterButton`
- `@/components/shared/layout/ToolbarPrimaryButton`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/dropdown-menu`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/animated-icons.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/sell/SellOrders.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/animated-icons.tsx`
