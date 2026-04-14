# Gamification

## Summary
Gamification & Targets screen. Current implementation includes mock/seed data paths.

## Route
`/control/gamification`

## User Intent
Complete gamification work and move records to the next stage.

## Primary Actions
- Create or add records/items.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Primary table/list region for records.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

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
- `@/components/shared/motion/motion-variants`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/switch`

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
- `apps/web/src/components/control/ControlGamification.tsx`
