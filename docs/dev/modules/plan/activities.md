# Plan → Activities (dev)

New module at `/plan/activities`. Activity logging + live timers against jobs.

## Route

`apps/web/src/routes.tsx:344` — `{ path: 'activities', element: <L><PlanActivities /></L> }` under the Plan route group.

## Page

`apps/web/src/components/plan/PlanActivities.tsx` — the page shell. Renders a `JobActivityCard` per active job and provides the entry point for `LogJobActivityModal` and `TimeEntryDialog`.

## Components

Under `apps/web/src/components/plan/activities/`:

```
GlobalTimerPill.tsx   Header-mounted timer that follows the user across pages
JobActivityCard.tsx   Per-job card on the Activities page
TimerPill.tsx         The non-global, in-card timer chip
TimeEntryDialog.tsx   Edit dialog for a logged time entry
```

Job-detail integration (under `apps/web/src/components/plan/job-detail/`):

```
JobActivitiesTab.tsx          The Activities tab inside PlanJobDetail
JobActivityTimeSummary.tsx    Side-panel summary card
```

Settings panel (under `apps/web/src/components/plan/settings/`):

```
ActivityTypesPanel.tsx        Curates the list of activity types
```

Modal:

```
apps/web/src/components/plan/LogJobActivityModal.tsx   Quick-log entry point
```

## Shared file

`apps/web/src/components/plan/plan-activity-shared.ts` — types, formatters, and helpers shared across the activities components and the job-detail tab.

## State

`apps/web/src/store/jobActivityStore.ts` — Zustand store. Owns:

- the currently-running timer (if any) — what powers `GlobalTimerPill`
- optimistic appends for newly-saved entries
- per-job summary caches

## Data

- `apps/web/src/data/job-activity-templates.ts` — seed list for the activity-type picker
- `apps/web/src/data/plan-activities-mock.ts` — mock entries for development
- `apps/web/src/types/job-activity.ts` — `JobActivity`, `JobActivityType`, `TimerState` types
- `apps/web/src/types/entities.ts` — extended with job-activity references on jobs

## Service-layer note

There is no `planActivityService.ts` yet — reads and writes go through the mock data layer directly via the store. When activity logging moves to real services, it should follow the same shape as `chatterService.ts` (single file under `services/`, mock-backed first, then swapped for the real backend without consumers changing).

## Cross-cutting

Activities is the second consumer of [MwGantt](../../shared/mw-gantt.md) — the per-job activity timeline lives inside `JobActivitiesTab`.

## Breadcrumbs / sub-items

`apps/web/src/lib/navigation/breadcrumbs.ts` and `apps/web/src/lib/sub-item-meta.ts` were extended to include the new Activities entry — keep those in sync when adding further plan sub-pages.

## Cross-module surface

`apps/web/src/components/sell/SellActivities.tsx` was also touched in the same commit — Sell has a parallel activities list. They are separate components; the shared moving parts are `LogActivityModal` (under `shared/activities/`) and the underlying `auditService`. Don't merge the two pages; they serve different audiences (Plan = "what is being made", Sell = "what is being sold").
