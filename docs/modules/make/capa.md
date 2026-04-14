# CAPA

## Summary
CAPA Board screen. Current implementation includes mock/seed data paths.

## Route
`/make/capa`

## User Intent
Complete capa work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Charts and trend cards.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- empty
- populated

## Components Used
- `@/components/shared/feedback/EmptyState`
- `@/components/shared/kanban/KanbanBoard`
- `@/components/shared/kanban/KanbanCard`
- `@/components/shared/kanban/KanbanColumn`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/ui/badge`
- `@/components/ui/utils`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/make/MakeCapa.tsx`
