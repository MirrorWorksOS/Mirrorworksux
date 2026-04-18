# Schedule — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/schedule.md -->

Developer-focused sections to extract:

- Components Used (`PlanScheduleEngine`, `GanttChart`, `ScheduleCalendar`)
- Logic / Behaviour
- Dependencies
- View modes (calendar, gantt)

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

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Related Files
- `apps/web/src/components/plan/PlanSchedule.tsx`
- `apps/web/src/components/ui/utils.tsx`
