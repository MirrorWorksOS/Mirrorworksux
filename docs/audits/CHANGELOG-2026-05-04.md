# Changelog — 2026-05-04

Daily documentation review. Run by the `documentation` scheduled task.

## Summary

**Two big features landed in one window**, plus two long-running gap branches were finally merged into `main`:

1. **Floor Execution refactor** (`942a13f4`) — the monolithic `FloorExecutionScreen` is split into ten focused Andon-style cards plus six explicit dialogs (Hold / NCR / Scrap / Print Label / Close WO / Barcode). The pre-refactor sheets (`ActionConsole`, `ExceptionSheet`, `HandoverSheet`, `InspectionSheet`, `ReferenceWorkspace`) are deleted; the canonical AI surface treatment (`MirrorWorksAgentCard` + `.ai-card-glow`, teal accent) is documented in `DesignSystem.md`.
2. **AI Schedule Engine** (`07d6a040`) — new screen at `/plan/schedule-engine` with a 5-card KPI row (Avg Utilisation · Active Jobs · Schedule Health · Bottleneck · Late Risk), a work-centre Gantt with capacity heatmap / shift bands / now-line, and an Auto-Schedule confirmation flow that produces a proposed snapshot reviewed via `ProposalBanner` / `IssuesSheet` / `JobDetailSheet`. `/plan/schedule` and `/plan/activities` now redirect into the engine.
3. **AgentCard double-stroke fix** (`55c94659` merging `1997f4cf`, originally authored 2026-04-21) — drops the inner `border` class so `BorderGlow` is the only edge treatment; tunes glow intensity +15% to match the app-level AI search bars.
4. **Global Shop gap-fix docs** (`2bc727b1` merging `189dedf5`, originally 2026-04-21) — Live Floor user + dev docs, Make Dashboard rewrite (3-tab structure), costing-method documentation on Stock Valuation, Bridge `StepReviewConfirm` "Preview in context" sandbox, Live Floor route added to Make module README, Global Shop gap audit checked in.

## Verification

| Check | Result |
|---|---|
| `git log -1` | `2bc727b1` (2026-05-04 21:11 +1000) — *Merge branch 'docs/global-shop-gap-fixes' into main* |
| Commits this run (since `a8ce046b`, last commit before this window) | **4 commits on `main`** (2 feat + 2 merges; the merged-in branches add `1997f4cf` + `189dedf5`) |
| `git log --since="24 hours ago"` | 4 first-parent commits on `main` |
| Working tree | **clean** |
| Stash | unchanged from yesterday's run (none since the day-9 stash was cleared) |

## Shipped today

### 1. Floor Execution refactor — `942a13f4`

34 files, **+3636 / −2415** — the largest single commit of the run.

The refactor breaks the 1,463-line `FloorExecutionScreen.tsx` into focused components, then routes operator actions through six explicit dialogs instead of ad-hoc bottom sheets. The screen itself becomes an orchestrator that reads the `WorkOrderExecutionSnapshot`, derives a state (`awaiting_first_off` / `pick_required` / `running` / `on_hold` / `failed_pending_ncr` / `complete`), and renders one yellow CTA at a time via `PrimaryActionCard`.

**New files (15):**

| Component | Role |
|---|---|
| [`AndonTopBar`](apps/web/src/components/floor/execution/AndonTopBar.tsx) | Sticky header — status pill + cycle clock + sync indicator + theme toggle |
| [`OperationHeaderCard`](apps/web/src/components/floor/execution/OperationHeaderCard.tsx) | WO/MO/job, customer, revision, station — left side of the action row |
| [`PrimaryActionCard`](apps/web/src/components/floor/execution/PrimaryActionCard.tsx) | The single yellow CTA — picks copy + handler from derived state |
| [`MaterialsPickListCard`](apps/web/src/components/floor/execution/MaterialsPickListCard.tsx) | Per-row picks, scan-to-pick, "pick all" |
| [`ReferencePanel`](apps/web/src/components/floor/execution/ReferencePanel.tsx) | Drawing / Instructions / Camera segmented tabs (replaces `ReferenceWorkspace`) |
| [`QualityActionsRow`](apps/web/src/components/floor/execution/QualityActionsRow.tsx) | NCR · Hold · Scrap entry points |
| [`RoutingStrip`](apps/web/src/components/floor/execution/RoutingStrip.tsx) | Horizontal step list (replaces `CurrentStepCard`) |
| [`RoutingStepDrawer`](apps/web/src/components/floor/execution/RoutingStepDrawer.tsx) | Side sheet for one step's checklist + inspection gate |
| [`TimeSummaryGrid`](apps/web/src/components/floor/execution/TimeSummaryGrid.tsx) | 3 tiles — setup / run / first-off est-vs-actual |
| [`QuickActionsFooter`](apps/web/src/components/floor/execution/QuickActionsFooter.tsx) | Print Label / Help / Sign out / theme |
| [`ExecutionModelViewer`](apps/web/src/components/floor/execution/ExecutionModelViewer.tsx) | 3D model viewer overlay (replaces inline render) |
| [`HoldDialog`](apps/web/src/components/floor/execution/dialogs/HoldDialog.tsx) | Reason + note → queues `set-state: on_hold` |
| [`NCRDialog`](apps/web/src/components/floor/execution/dialogs/NCRDialog.tsx) | Defect type / qty / measurement / note |
| [`ScrapDialog`](apps/web/src/components/floor/execution/dialogs/ScrapDialog.tsx) | Reason from canonical 7-item list + qty + note |
| [`PrintLabelDialog`](apps/web/src/components/floor/execution/dialogs/PrintLabelDialog.tsx) | Template + qty + printer |
| [`CloseWODialog`](apps/web/src/components/floor/execution/dialogs/CloseWODialog.tsx) | Final qty + optional label print |
| [`Barcode`](apps/web/src/components/floor/execution/dialogs/Barcode.tsx) | Manual barcode entry / lookup |

**New shared types** in [`floor/execution/types.ts`](apps/web/src/components/floor/execution/types.ts) — `AndonStatus`, `WorkOrderExecutionSnapshot`, `ExecutionMutation`, `ExecutionWorkflowStep`, `PickListRow`, `TimeSummary`, `ScrapReportRow`, `NcrRecord`, `LabelPrintEvent` — plus the central [`snapshot.ts`](apps/web/src/components/floor/execution/snapshot.ts) builder that hydrates all of the above from a WO seed.

**Deleted files (5):** `ActionConsole.tsx` (279), `CurrentStepCard.tsx` (116), `ExceptionSheet.tsx` (162), `ExecutionHeader.tsx` (144), `HandoverSheet.tsx` (127), `InspectionSheet.tsx` (188), `ReferenceWorkspace.tsx` (588). Roughly 1,604 lines of pre-refactor code removed.

**Design-system note:** the commit also adds 21 lines to [`DesignSystem.md`](apps/web/src/guidelines/DesignSystem.md) documenting the canonical AI surface — `MirrorWorksAgentCard` + `.ai-card-glow`, teal accent. Any new AI affordance on the floor must reuse this; new chrome must not roll a fresh accent.

### 2. AI Schedule Engine — `07d6a040`

36 files, **+2846 / −372**.

A complete replacement for the legacy `PlanSchedule.tsx` (which is deleted in this commit). The new view at `/plan/schedule-engine` is composed of:

- **`PlanScheduleEngine.tsx`** — orchestrator (411 lines) reading the new `scheduleEngineStore`. Manages the AI run state machine (`idle → confirming → running → awaiting_approval → idle`), bridges store toasts to sonner, and computes which blocks moved between snapshots for the yellow-border highlight.
- **5 KPI cards** in [`schedule-engine/cards/`](apps/web/src/components/plan/schedule-engine/cards) — each consumes the new `ScheduleSnapshotKpis` shape:
    - `AvgUtilisationCard` — % across all WCs + 7-day sparkline + delta vs last week
    - `ActiveJobsCard` — running / queued split + due-today / at-risk sub-line
    - `ScheduleHealthCard` — 0–100 score on a dark anchor card; opens `IssuesSheet`
    - `BottleneckCard` — overload % + queue depth + backlog hours for the worst WC
    - `LateRiskCard` — count + AUD value at risk + mini job preview list
- **Gantt** in [`schedule-engine/gantt/`](apps/web/src/components/plan/schedule-engine/gantt) — `ScheduleGantt` (272), `ScheduleGanttRow` (99), `ScheduleGanttBlock` (211), `ScheduleGanttToolbar` (117), `ScheduleHeatmap` (190), `CapacityOverlay` (49), `ShiftBands` (65), `NowLine` (37), and `ganttGeometry.ts` (33). Day view = full Gantt with drag-to-reschedule; Week / Month swap to a heatmap.
- **`AutoScheduleDialog`** — priority (Balanced / Throughput / On-time / Setup minimisation) × horizon (Today / Next 24h / Next 7d / Next 14d) × lock options (already-running, rush-priority).
- **Panels:** `AiStatusPanel` (5-step progress while running), `ProposalBanner` (apply/discard CTA + summary), `JobDetailSheet`, `IssuesSheet`.
- **`useAutoScheduleRunner`** hook — drives the parallel timer (5 × 800 ms = 4 s) + service call (~3.5 s mock). Whichever completes second commits the proposed snapshot; cancel uses a ref flag so the in-flight promise's result is discarded.

**New types** in [`types/entities.ts`](apps/web/src/types/entities.ts):

```ts
ScheduleSnapshot, ScheduleSnapshotKpis, ScheduleIssue, AutoScheduleRequest, AutoScheduleResult,
LateRiskJob, BottleneckQueueEntry, UtilisationPoint
```

`ScheduleBlock` and `WorkCentre` gained scheduling-specific fields (`status`, `isRush`, `customerName`, `liveStatus`, `hourlyLoad[]`, `shift`).

**New `JobScheduleStatus` union** in [`types/common.ts`](apps/web/src/types/common.ts) — `queued | setup | running | done | blocked | late | at_risk`. **Distinct from `JobStatus`** — describes per-block scheduling state, not the overall job lifecycle. Status colours mapped in [`schedule-engine/constants.ts`](apps/web/src/components/plan/schedule-engine/constants.ts).

**New store** [`scheduleEngineStore.ts`](apps/web/src/store/scheduleEngineStore.ts) — single source of truth for `current`/`proposed` snapshots, `runState`, `currentStepIndex`, gantt toolbar selections (`groupBy`/`zoom`/`filter`), side-sheet open flags. No persistence.

**Service** [`planService.ts`](apps/web/src/services/planService.ts) — four new endpoints (`getScheduleSnapshot`, `runAutoSchedule`, `applySchedule`, `discardProposal`), all flagged with `// TODO: CONVEX —` for the remote adapter.

**Mock data** ([`services/mock/data.ts`](apps/web/src/services/mock/data.ts) +295 lines) — `currentScheduleSnapshot` and `proposedScheduleSnapshot` with 14 demo blocks across 5 work centres, hand-tuned so the proposed snapshot demonstrates the "Moved 3 jobs, eliminated 2 late risks" banner copy.

**Routing** ([`routes.tsx`](apps/web/src/routes.tsx)) — `/plan/schedule-engine` is the canonical path; `/plan/schedule` and `/plan/activities` are now `<Navigate replace />` redirects. Sidebar, command palette, mobile menu, and breadcrumb lookups all updated to point at the new path.

### 3. AgentCard double-stroke fix — `1997f4cf` (merged via `55c94659`)

2 files, +29 / −18.

Tiny but visible: [`MirrorWorksAgentCard.tsx`](apps/web/src/components/shared/ai/MirrorWorksAgentCard.tsx) was rendering a grey CSS border behind the `BorderGlow` component, producing a double outline (especially noticeable on the dashboard feed and the "View all insights" modal). Fix:

- Drop the inner div's `border` class and per-tone `border-[var(--…)]/25` accent — `BorderGlow` already provides the edge treatment.
- Tone is now communicated solely via the status chip.
- `BorderGlow` intensity / fill tuned +15% so the card reads as a slightly more prominent surface than the app-level `AiCommandBar` / `AgentBar` without any stroke.

Also nudges `docs/dev/modules/bridge/bridge-wizard.md` — Bridge Wizard step count is **dynamic 3–8 steps** (common CSV path is 5), not the previously documented fixed 8.

### 4. Global Shop gap-fix docs — `189dedf5` (merged via `2bc727b1`)

8 files, +263 / −57.

A documentation-only commit dragging the 2026-04-21 *Global Shop gap analysis* reviewers' feedback into the docs tree:

- **New** [`docs/dev/global-shop-gap-analysis-2026-04-21.md`](docs/dev/global-shop-gap-analysis-2026-04-21.md) — the audit itself.
- **New** [`docs/dev/modules/make/live-floor.md`](docs/dev/modules/make/live-floor.md) + [user equivalent](docs/user/modules/make/live-floor.md) — wall-display Andon board, shift header, operator cards.
- **Rewrite** [`docs/dev/modules/make/dashboard.md`](docs/dev/modules/make/dashboard.md) — 3-tab structure (Overview / Live floor / Operations), notes that the Machine Status Grid moved into Live floor.
- **New** costing-method coverage on [`docs/dev/modules/book/stock-valuation.md`](docs/dev/modules/book/stock-valuation.md) + [user equivalent](docs/user/modules/book/stock-valuation.md) — FIFO / LIFO / Weighted Average (AVCO) / Standard / Actual.
- **New** Bridge `StepReviewConfirm` "Preview in context" sandbox documented in [`docs/dev/modules/bridge/bridge-wizard.md`](docs/dev/modules/bridge/bridge-wizard.md).
- Live Floor route added to [Make module README](docs/dev/modules/make/README.md).

Two minor merge-conflicts were resolved cleanly during the merge (`MirrorWorksAgentCard.tsx` between branches 3 + 4, and `bridge-wizard.md` + `make/dashboard.md` between branches 4 + the gap-fix branch).

## Headline numbers

| Surface | Count |
|---|---|
| New floor-execution components | **13** (10 cards + 3 layout: AndonTopBar, OperationHeaderCard, PrimaryActionCard, MaterialsPickListCard, ReferencePanel, QualityActionsRow, RoutingStrip, RoutingStepDrawer, TimeSummaryGrid, QuickActionsFooter, ExecutionModelViewer + dialog wiring + new types) |
| New floor-execution dialogs | **6** (Hold · NCR · Scrap · Print Label · Close WO · Barcode) |
| Pre-refactor floor files deleted | **7** (~1,604 lines: ActionConsole, CurrentStepCard, ExceptionSheet, ExecutionHeader, HandoverSheet, InspectionSheet, ReferenceWorkspace) |
| New schedule-engine components | **19** (1 container + 5 KPI cards + 9 Gantt parts + 1 dialog + 4 panels + 1 hook) |
| New types | `ScheduleSnapshot`, `ScheduleSnapshotKpis`, `ScheduleIssue`, `AutoScheduleRequest`, `AutoScheduleResult`, `JobScheduleStatus`, `LateRiskJob`, `BottleneckQueueEntry`, `UtilisationPoint`, `WorkOrderExecutionSnapshot`, `ExecutionMutation`, `AndonStatus`, `ExecutionWorkflowStep`, `ExecutionState`, `ReferenceView`, `IssueType`, `SyncState`, `InspectionGate`, plus 5 dialog row types |
| Routes redirected | **2** (`/plan/schedule`, `/plan/activities` → `/plan/schedule-engine`) |
| AI surfaces fixed | **1** (`MirrorWorksAgentCard` double stroke) |
| Doc files refreshed in this run | **6** (Schedule Engine dev + user, Schedule redirect dev + user, Floor Run dev + user) + 2 README updates |

## Documentation closure pass

Authored the new dev/user docs alongside the changelog:

| Doc | Type | What landed |
|---|---|---|
| [`docs/dev/modules/plan/schedule-engine.md`](docs/dev/modules/plan/schedule-engine.md) | new | Component tree, store state machine, snapshot types, service contract, geometry constants, AI run visual treatments, mock-data note, gaps |
| [`docs/user/modules/plan/schedule-engine.md`](docs/user/modules/plan/schedule-engine.md) | new | Page layout, Auto-Schedule flow (5-step), proposal review, day-vs-week-vs-month, filters, status colours |
| [`docs/dev/modules/plan/schedule.md`](docs/dev/modules/plan/schedule.md) | rewrite | Redirect stub naming `schedule-engine.md` as the canonical doc; migration notes |
| [`docs/user/modules/plan/schedule.md`](docs/user/modules/plan/schedule.md) | rewrite | One-liner pointing at Schedule Engine |
| [`docs/dev/modules/shop-floor/floor-run.md`](docs/dev/modules/shop-floor/floor-run.md) | rewrite | Full Andon-style component tree, snapshot contract, derived state machine, mutations queue, idle lock, demo-mode flag, AI-surface treatment pointer |
| [`docs/user/modules/shop-floor/floor-run.md`](docs/user/modules/shop-floor/floor-run.md) | rewrite | Page layout (top-bar through quick actions), six dialogs, idle lock, Andon status colours, offline-first behaviour |
| [`docs/user/modules/plan/README.md`](docs/user/modules/plan/README.md) | edit | Schedule → Schedule Engine in Main Routes; component swap; stale "placeholder/legacy" line dropped |
| [`docs/README.md`](docs/README.md) | edit | Top-level index updated to point at `schedule-engine.md` |

Screenshots captured into [`docs/audits/screenshots/`](docs/audits/screenshots):
- [`plan/plan-schedule-engine.png`](docs/audits/screenshots/plan/plan-schedule-engine.png) — populated state, day view, work-centre group-by, KPI strip in default mode
- [`shop-floor/floor-run-andon-2026-05-04.png`](docs/audits/screenshots/shop-floor/floor-run-andon-2026-05-04.png) — overlay mode, *Record first-off* CTA, drawing reference active

## Documentation gaps surfaced today

### Stale `PlanSchedule` references in audit / migration logs

These files still mention the deleted `PlanSchedule.tsx` or `/plan/schedule`:

- [`docs/sidebar-audit.md`](docs/sidebar-audit.md) lines 78, 176 — sidebar/route audit, mentions the calendar-view query-param plan that's now obsolete (engine is the only view).
- [`docs/audits/MIGRATION-LOG.md`](docs/audits/MIGRATION-LOG.md) line 95 + [`MIGRATION-LOG-plan.md`](docs/audits/MIGRATION-LOG-plan.md) line 11 — mention `PlanScheduleEngine` (the *type name* matches by coincidence in older audits — those references should now be re-read against the new component).
- [`docs/audits/dev/AUDIT-plan.md`](docs/audits/dev/AUDIT-plan.md) lines 17, 34, 72 — flags `PlanScheduleEngine.tsx` as undocumented (closed today), notes the `?view=calendar` query-param (now obsolete), lists `/plan/activities` as needing a redirect entry (now wired).

These are historical audit snapshots — not auto-updated. **Decision deferred** to whether to amend or leave as-is for traceability; the carrying convention from the 2026-04-30 closure pass is to leave snapshot docs intact and note the resolution in the run-day changelog (i.e. here).

### `PlanScheduleTab.tsx` still referenced in `job-detail.md`

[`docs/dev/modules/plan/job-detail.md`](docs/dev/modules/plan/job-detail.md) lines 31, 50 mention `PlanScheduleTab.tsx`. That file still exists in the codebase and is unrelated to the engine refactor — `PlanScheduleTab` is a sub-tab on the Job detail page, not a route. **No change needed.**

### `floor-home.md` not refreshed

[`docs/dev/modules/shop-floor/floor-home.md`](docs/dev/modules/shop-floor/floor-home.md) and the user equivalent describe the queue page that links into Floor Run. The refactor doesn't change the queue itself, but the queue → run handover (kiosk session start) is now mediated by the new `WorkOrderFullScreen` shell. **Low-priority follow-up.**

## Suggested follow-ups for an interactive session

1. **Verify the redirect chain end-to-end** — from sidebar, command palette, mobile menu, and any deep-linked dashboard cards into `/plan/schedule-engine`. Worth a smoke-test pass since 5 different lookup tables were touched in commit `07d6a040`.
2. **Wire `moveBlock` persistence** — the drag-to-reschedule on the Day view mutates the snapshot in-memory only. The `// TODO: CONVEX —` comments mark the four endpoints; this is the natural moment to plumb the first one.
3. **Flip `USE_CANONICAL = false` in `FloorRun.tsx`** once production WO data is wired. The flag forces every kiosk entry into the demo *Differential Housing* batch, regardless of the URL.
4. **Triage `MIGRATION-LOG-plan.md` and `AUDIT-plan.md`** — both are pre-engine snapshots and now contradict reality. Either amend in place or add a "superseded by 2026-05-04 refactor" pointer.
5. **Decide the fate of `apps/web/src/components/shared/schedule/GanttChart.tsx`** — used to be Plan's Gantt; the engine has its own. If nothing else imports it, drop it.
6. **Refresh `floor-home.md` / `floor-home`** for the kiosk-session handover into the new `WorkOrderFullScreen`.
7. **Capture additional Schedule Engine screenshots** — proposed-state with the AI proposal pill + moved-block highlights, the AI status panel mid-run, the Issues sheet open. Today's capture only shows the populated/idle state. Same for Floor Run — the *Hold*, *NCR*, and *Close WO* dialogs all merit one screenshot each.
8. **Validate `JobScheduleStatus` vs `JobStatus`** at any new entry point — they look almost identical and easy to swap. The store and the Gantt only ever deal with `JobScheduleStatus`; anywhere a Job entity surfaces (Job detail, Jobs list) should keep using `JobStatus`.

## Output

This file plus the 8 doc files + 2 screenshots listed in *Documentation closure pass*. The shipping artefacts for today are the 4 commits on `main` documented above (the +6,514 lines of feature code plus 2 docs/agent-card merges) — those are self-documenting via their commit bodies and the `// TODO: CONVEX —` markers on the new service endpoints.
