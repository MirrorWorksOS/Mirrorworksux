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

## Components Used
- `@/components/shared/ai/AIInsightCard`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/JobWorkspaceLayout`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/table`
- `@/components/ui/utils`

## Logic / Behaviour
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
- `apps/web/src/components/buy/BuyOrderDetail.tsx`
