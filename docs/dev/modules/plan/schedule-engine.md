# Schedule Engine

AI-powered work-centre Gantt with auto-sequencing. Replaces the legacy `PlanSchedule` view (commit `07d6a040`, 2026-05-04). The previous `/plan/schedule` and `/plan/activities` paths now redirect into this surface.

## Route

| Path | Behaviour |
|---|---|
| `/plan/schedule-engine` | Canonical route — renders `PlanScheduleEngine` |
| `/plan/schedule` | `<Navigate to="/plan/schedule-engine" replace />` |
| `/plan/activities` | `<Navigate to="/plan/schedule-engine" replace />` |

Wired in [`apps/web/src/routes.tsx`](apps/web/src/routes.tsx).

## Component tree

```
PlanScheduleEngine                 (container; reads scheduleEngineStore)
├── PageHeader                     (title + Auto-Schedule CTA)
├── ProposalBanner                 (visible only when `proposed` snapshot is loaded)
├── KPI grid (5 tiles)
│   ├── AvgUtilisationCard         (% + 7-day sparkline + delta)
│   ├── ActiveJobsCard             (running / queued counts + due-today / at-risk)
│   ├── ScheduleHealthCard         (0–100 score, dark anchor card, opens IssuesSheet)
│   ├── BottleneckCard             (overload % + queue depth + backlog hours)
│   └── LateRiskCard               (jobs at risk + AUD value at risk)
├── ScheduleGantt                  (day view — Gantt; week/month — heatmap)
│   ├── ScheduleGanttToolbar       (group-by, zoom, filter, jump-to-now)
│   ├── ScheduleGanttRow × N       (one per work centre, capacity bar in label)
│   │   └── ScheduleGanttBlock × N (status-tinted, drag-to-reschedule)
│   ├── CapacityOverlay            (translucent shift bands behind blocks)
│   ├── ShiftBands                 (07:00–17:00 + 12:00 lunch defaults)
│   ├── NowLine                    (vertical orange line at current time)
│   └── ScheduleHeatmap            (week/month zoom only — not the Gantt)
├── AutoScheduleDialog             (priority + horizon + lock options)
├── AiStatusPanel                  (5-step "AI thinking" indicator while running)
├── JobDetailSheet                 (right-side sheet, opened from a block click)
└── IssuesSheet                    (right-side sheet from ScheduleHealthCard)
```

## State machine — `scheduleEngineStore`

[`apps/web/src/store/scheduleEngineStore.ts`](apps/web/src/store/scheduleEngineStore.ts) is the single source of truth.

```ts
type ScheduleRunState = 'idle' | 'confirming' | 'running' | 'awaiting_approval';
```

Transitions:

```
idle ──[user clicks Auto-Schedule]──▶ confirming
confirming ──[Confirm in AutoScheduleDialog]──▶ running
running ──[planService.runAutoSchedule resolves]──▶ awaiting_approval
awaiting_approval ──[Apply]──▶ idle  (proposed promoted to current)
awaiting_approval ──[Discard]──▶ idle  (proposed cleared)
running ──[user cancel from AiStatusPanel]──▶ idle
```

### Store fields

- `current: ScheduleSnapshot | null` — the live schedule shown when no proposal is pending.
- `proposed: ScheduleSnapshot | null` — set by `setProposed` after `runAutoSchedule` resolves; render swaps to this snapshot and `isProposed` flag toggles on the Gantt.
- `currentStepIndex: 0..4` — drives `AiStatusPanel` and the Gantt's shimmer/dim/pulse treatments.
- `proposalSummary: string | null` — banner copy, e.g. *"Moved 3 jobs, eliminated 2 late risks…"*.
- `ganttGroupBy: 'workCentre' | 'job'`, `ganttZoom: 'day' | 'week' | 'month'`, `ganttFilter` (`all`, `late`, `at_risk`, `rush`, `today`).
- `toast: string | null` — bridged to sonner inside `PlanScheduleEngine` (apply / discard confirmation).

### Auto-Schedule run loop — `useAutoScheduleRunner`

[`schedule-engine/hooks/useAutoScheduleRunner.ts`](apps/web/src/components/plan/schedule-engine/hooks/useAutoScheduleRunner.ts).

The 5-step status indicator advances on its own 800 ms timer (`AI_STEP_DURATION_MS`); the network call (`planService.runAutoSchedule`) resolves in parallel after ~3.5 s of mock delay. Whichever completes second commits the proposed snapshot. Cancel sets a ref flag and clears the interval — the in-flight promise still resolves but its result is discarded.

## Snapshot types

New types in [`apps/web/src/types/entities.ts`](apps/web/src/types/entities.ts):

```ts
ScheduleSnapshot {
  id, generatedAt,
  source: { kind: 'manual'; byName } | { kind: 'ai'; movedJobIds; eliminatedRisks },
  workCentres: WorkCentre[],   // each with `liveStatus`, `hourlyLoad[]`, `shift`
  blocks: ScheduleBlock[],     // each with `status: JobScheduleStatus`, `isRush`, `customerName`
  kpis: ScheduleSnapshotKpis,  // utilisation + active jobs + health + bottleneck + lateRisk
  issues: ScheduleIssue[],     // severity + title + detail (drives IssuesSheet)
}
```

`JobScheduleStatus` (in [`types/common.ts`](apps/web/src/types/common.ts)) is **distinct from `JobStatus`** — it describes per-block scheduling state (`queued | setup | running | done | blocked | late | at_risk`), not the overall job lifecycle. Status colour mapping lives in [`schedule-engine/constants.ts`](apps/web/src/components/plan/schedule-engine/constants.ts) — yellow stays the brand-spine accent, status fills are token-driven.

## Service contract

[`apps/web/src/services/planService.ts`](apps/web/src/services/planService.ts) — four new endpoints:

- `getScheduleSnapshot(): Promise<ScheduleSnapshot>` — returns `_currentSnapshot` (in-memory swap).
- `runAutoSchedule(req: AutoScheduleRequest): Promise<AutoScheduleResult>` — 3.5 s mock delay, returns `{ proposed, summary, movedJobIds }`.
- `applySchedule(snapshotId): Promise<void>` — promotes the proposed template to current with a fresh `id` + `generatedAt`.
- `discardProposal(): Promise<void>` — no-op for the mock.

All four are flagged with `// TODO: CONVEX —` comments, noting where the remote adapter slots in.

## Gantt geometry

Constants in [`schedule-engine/constants.ts`](apps/web/src/components/plan/schedule-engine/constants.ts):

| Constant | Value | Use |
|---|---:|---|
| `HOUR_PX` | 64 | Width of one hour column |
| `DAY_START_HOUR` / `DAY_END_HOUR` | 6 / 21 | Day-view bounds (15 hours visible) |
| `ROW_LABEL_PX` | 200 | Work-centre label gutter width |
| `BLOCK_HEIGHT_PX` | 32 | Single block height |
| `HATCHED_STRIPES` | repeating-linear-gradient | Fill for proposed-state blocks |

Px-time conversions live in [`schedule-engine/gantt/ganttGeometry.ts`](apps/web/src/components/plan/schedule-engine/gantt/ganttGeometry.ts) — `pxNow()`, `TIMELINE_WIDTH_PX`, etc.

## Day-vs-Week-vs-Month behaviour

- **Day** — full Gantt with drag-to-reschedule via `ScheduleGanttBlock`. `moveBlock(id, newStart, newEnd)` mutates the current snapshot in the store; not persisted to the service yet.
- **Week / Month** — Gantt is replaced by `ScheduleHeatmap` (15-min blocks would be illegible at those zooms). Toolbar still renders.

## AI run visual treatments

Inside `ScheduleGantt`:

- `currentStepIndex === 1` → row container fades to `opacity: 0.55` (`isDimming`).
- `currentStepIndex` 2 or 3 → teal shimmer overlay sweeps across the Gantt (`isShimmering`).
- `currentStepIndex === 4` → green pulse overlay (`isPulsing`).
- `isProposed` → moved blocks get a yellow border via `movedBlockIds`; an "AI proposal" pill appears in the top-left of the Gantt card.
- Auto-Schedule button itself wears `ai-card-glow ai-card-glow--animating` while `runState === 'running'` — the canonical AI surface treatment (see DesignSystem.md).

## Mock data

[`apps/web/src/services/mock/data.ts`](apps/web/src/services/mock/data.ts) gained ~295 lines for two snapshots — `currentScheduleSnapshot` and `proposedScheduleSnapshot` — plus 14 demo `ScheduleBlock`s across 5 work centres (Cutting / Forming / Welding / Machining / Finishing). The proposed snapshot is hand-tuned to demonstrate the "Moved 3 jobs, eliminated 2 late risks" banner copy.

## Components Used

- `@/components/shared/layout/PageShell`, `PageHeader`
- `@/components/shared/motion/motion-variants` — staggerContainer / staggerItem (KPI grid entry animation)
- `@/components/ui/{button, card, dialog, checkbox, select, sheet}`
- `@/store/scheduleEngineStore`
- `@/services` → `planService`
- `motion/react` — animated proposal swap; `sonner` — apply/discard toast
- `lucide-react` — `Sparkles`, `Check`

## Logic / Behaviour

- `current` snapshot lazily loaded on first mount via `loadSnapshot`.
- `view = proposed ?? current` — render path is shared between current and proposed; the only branch is the `isProposed` flag fed into the Gantt.
- `movedBlockIds` is computed in `PlanScheduleEngine` by comparing `(startTime, workCenterId)` pairs across snapshots — independent of block ids so drag-to-reschedule still highlights correctly.
- The state-line copy under the header updates with `formatRelative(generatedAt)` every render — no live ticker (the snapshot itself is the truth).

## Dependencies

- Store: `@/store/scheduleEngineStore`
- Service: `@/services/planService`
- Mock data: `mock.currentScheduleSnapshot`, `mock.proposedScheduleSnapshot`, `mock.scheduleBlocks`, `mock.workCentres`

## Known Gaps / TODO

- **No persistence on drag.** `moveBlock` mutates the current snapshot in memory only; no service call wired yet. This is intentional for the demo but flagged for backend.
- **Group-by job** synthesises pseudo-rows from blocks rather than from a real Job entity — fine for the demo but should hydrate real Jobs once Convex is wired.
- **Heatmap (week/month)** uses `WorkCentre.hourlyLoad[]` from mock data; real implementation will need an aggregation query.
- **Issues** list is static mock data on the snapshot; no rule engine yet.
- Mock summary copy (`"14 operations resequenced"` in the apply toast, `"5 work centres"` in `AI_STEPS[3]`) is hardcoded — the real service should return these counts so the strings stay accurate.
- The `Sidebar`, `CommandPalette`, `MobileMenu`, and `breadcrumbs` lookups all updated their `/plan/schedule` references to `/plan/schedule-engine` in this commit; any new entry point must point at the new path.

## Related Files

- [`apps/web/src/components/plan/PlanScheduleEngine.tsx`](apps/web/src/components/plan/PlanScheduleEngine.tsx) — top-level container
- [`apps/web/src/components/plan/schedule-engine/`](apps/web/src/components/plan/schedule-engine) — all 19 sub-components, hooks, panels, dialogs
- [`apps/web/src/store/scheduleEngineStore.ts`](apps/web/src/store/scheduleEngineStore.ts)
- [`apps/web/src/services/planService.ts`](apps/web/src/services/planService.ts)
- [`apps/web/src/types/entities.ts`](apps/web/src/types/entities.ts) — `ScheduleSnapshot`, `ScheduleSnapshotKpis`, `ScheduleIssue`, `AutoScheduleRequest`, `AutoScheduleResult`
- [`apps/web/src/types/common.ts`](apps/web/src/types/common.ts) — `JobScheduleStatus` union

## Screenshot

![Schedule Engine — populated state](../../../audits/screenshots/plan/plan-schedule-engine.png)
