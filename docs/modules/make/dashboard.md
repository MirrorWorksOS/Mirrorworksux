# Make Dashboard

## Summary
Make Dashboard screen. Current implementation includes mock/seed data paths.

## Route
`/make`

## User Intent
Get a fast Make status snapshot and drill into exceptions.

## Primary Actions
- Create or add records/items.

## Key UI Sections
- KPI/summary card strip.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- error
- success
- populated

## Components Used
- `@/components/shared/ai/AIFeed`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/hover-card.tsx`

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
- `apps/web/src/components/make/MakeDashboard.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/hover-card.tsx`
