# Schedule — redirect stub

`/plan/schedule` is now a `<Navigate to="/plan/schedule-engine" replace />` (commit `07d6a040`, 2026-05-04). The legacy `PlanSchedule.tsx` file has been removed.

See [Schedule Engine](schedule-engine.md) for the canonical doc covering the Gantt + KPI cards + Auto-Schedule flow at `/plan/schedule-engine`.

## Migration notes

- `/plan/activities` also redirects into the engine.
- Sidebar, command palette, mobile menu, and breadcrumb lookups all point at `/plan/schedule-engine` now — search-and-replace any remaining `/plan/schedule` references in new code.
- The old `GanttChart` and `ScheduleCalendar` shared components are no longer imported by Plan; they remain in the codebase for now and may be removed once nothing else uses them.
