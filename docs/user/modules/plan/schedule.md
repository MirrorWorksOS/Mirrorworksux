# Schedule

## Summary
Schedule screen. Behavior is documented from current component implementation.

## Route
`/plan/schedule`

## User Intent
Complete schedule work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Charts and trend cards.

## Data Shown
- Planning calculations, schedule allocations, and what-if outputs.

## States
- default
- success
- populated

## Components Used
- `@/components/plan/PlanScheduleEngine`
- `@/components/shared/datetime/ScheduleCalendar`
- `@/components/shared/layout/IconViewToggle`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/ToolbarFilterButton`
- `@/components/shared/schedule/GanttChart`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Related Files
- `apps/web/src/components/plan/PlanSchedule.tsx`
- `apps/web/src/components/ui/utils.tsx`
