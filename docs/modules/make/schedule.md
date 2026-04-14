# Schedule

## Summary
Production schedule screen. Current implementation includes mock/seed data paths.

## Route
`/make/schedule`

## User Intent
Complete schedule work and move records to the next stage.

## Primary Actions
- Create or add records/items.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Planning calculations, schedule allocations, and what-if outputs.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- error
- success
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/datetime/ScheduleCalendar`
- `@/components/shared/layout/IconViewToggle`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/ToolbarFilterButton`
- `@/components/shared/layout/ToolbarPrimaryButton`
- `@/components/shared/motion/motion-variants`
- `@/components/shared/schedule/GanttChart`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/utils.tsx`

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
- `apps/web/src/components/make/MakeSchedule.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/utils.tsx`
