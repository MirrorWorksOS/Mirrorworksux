# Receipts

## Summary
Goods Receipt screen. Current implementation includes mock/seed data paths.

## Route
`/buy/receipts`

## User Intent
Complete receipts work and move records to the next stage.

## Primary Actions
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Form controls for editing/creation.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- success
- blocked
- populated

## Components Used
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/shared/surfaces/SpotlightCard`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
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
- `apps/web/src/components/buy/BuyReceipts.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
