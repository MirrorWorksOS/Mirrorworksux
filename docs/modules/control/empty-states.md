# Empty States Showcase

## Summary
Empty State Showcase screen. Current implementation includes mock/seed data paths.

## Route
`/control/empty-states`

## User Intent
Complete empty states showcase work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Form controls for editing/creation.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- empty
- populated

## Components Used
- `@/components/shared/feedback/EmptyState`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- No explicit placeholder text found in current component.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/control/ControlEmptyStates.tsx`
