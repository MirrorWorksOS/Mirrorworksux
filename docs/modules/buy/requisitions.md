# Requisitions

## Summary
Purchase Requisitions screen. Current implementation includes mock/seed data paths.

## Route
`/buy/requisitions`

## User Intent
Complete requisitions work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.

## Data Shown
- Procurement transactions, supplier records, and sourcing comparisons.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- error
- success
- blocked
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/ToolbarFilterButton`
- `@/components/shared/layout/ToolbarPrimaryButton`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/button.tsx`
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
- `apps/web/src/components/buy/BuyRequisitions.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/animated-icons.tsx`
