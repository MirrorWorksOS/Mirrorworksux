# Floor Run

Operator kiosk surface for executing a single work order. Refactored 2026-05-04 (commit `942a13f4`) from a monolithic `FloorExecutionScreen` into a tree of focused Andon-style cards plus six explicit dialogs.

## Route

`/floor/run/:workOrderId` — wired in [`apps/web/src/routes.tsx`](apps/web/src/routes.tsx).

## Entry points

The same `FloorExecutionScreen` is reused by:

1. **Kiosk route** — `/floor/run/:workOrderId` via [`FloorRun.tsx`](apps/web/src/components/floor/FloorRun.tsx). Owns URL → snapshot hydration, kiosk session lifecycle (`floorSessionStore.startJob` / `endJob` / `switchOperator`).
2. **Office overlay** — opened from the make/shop-floor dashboards via [`WorkOrderFullScreen.tsx`](apps/web/src/components/shop-floor/WorkOrderFullScreen.tsx). Same component, `mode="overlay"` — different chrome, no session transitions.

`mode: 'overlay' | 'route'` is the only behavioural prop split.

## Component tree (post-refactor)

```
FloorExecutionScreen                      (orchestrator; reads floorExecutionStore)
├── AndonTopBar                           (sticky header; status dot + cycle time + sync state)
├── OperationHeaderCard                   (WO/MO/job number, customer, revision, station)
├── PrimaryActionCard                     (the single yellow CTA — first-off / pick / start / close)
├── MaterialsPickListCard                 (per-row pick toggle, scan-to-pick, "pick all")
├── ReferencePanel                        (Drawing / Instructions / Camera segmented tabs)
├── QualityActionsRow                     (NCR · Hold · Scrap buttons)
├── RoutingStrip                          (horizontal step list; click opens RoutingStepDrawer)
│   └── RoutingStepDrawer                 (step detail with checklist + inspection gate)
├── TimeSummaryGrid                       (setup/run/first-off est-vs-actual, 3 tiles)
├── QuickActionsFooter                    (Print Label · Help · Sign out · Theme toggle)
├── ExecutionModelViewer                  (3D model viewer overlay)
└── Dialogs (modal, opened by store actions)
    ├── HoldDialog                        (place WO on hold — reason + note)
    ├── NCRDialog                         (raise non-conformance — defect type + qty + measurement)
    ├── ScrapDialog                       (record scrap — reason from canonical 7-item list)
    ├── PrintLabelDialog                  (template + qty + printer selector)
    ├── CloseWODialog                     (close out + final qty + optional label print)
    └── BarcodeDialog                     (manual barcode entry / lookup)
```

The pre-refactor `ActionConsole`, `CurrentStepCard`, `ExceptionSheet`, `ExecutionHeader`, `HandoverSheet`, `InspectionSheet`, and `ReferenceWorkspace` files are deleted. Their behaviours are folded into the components above and the dialogs.

## Snapshot contract

`WorkOrderExecutionSnapshot` in [`floor/execution/types.ts`](apps/web/src/components/floor/execution/types.ts) is the only data the screen reads. Built by [`snapshot.ts`](apps/web/src/components/floor/execution/snapshot.ts) `buildExecutionSnapshot(seed, options)` and includes:

- **WO context** — `woNumber`, `moNumber`, `jobNumber`, `productName`, `customerName`, `revision`, `revisionRequiresAck`.
- **Operator** — `operatorName`, `operatorRole`, `operatorInitials`.
- **Machine** — `machineId`, `machineName`, `stationName`.
- **Routing** — `routing: ExecutionWorkflowStep[]`, plus pointer pairs `currentStep` / `previousStep` / `nextStep` and `stepsSummary { completed, total }`.
- **References** — `references: Record<ReferenceView, ExecutionReference>`, where `ReferenceView` ∈ `'drawing' | 'instructions' | 'checklist' | 'camera'` and `referenceViewDefault` picks the initial tab.
- **Quantities & quality** — `quantity`, `inspection`, `exceptions[]`, plus per-WO `scrapReports[]`, `ncrs[]`, `labelPrints[]` and a `scrapReasons` list (canonical 7 reasons live in `snapshot.ts` as `DEFAULT_SCRAP_REASONS`).
- **Time** — `elapsedSeconds`, `cycleTimeLabel`, `targetCycleTimeLabel`, `timeSummary { setup/run/firstOff × est/actual minutes }`.
- **Picking** — `pickList: PickListRow[]`.
- **3D** — `modelSrc` for `ExecutionModelViewer`.

`AndonStatus = 'running' | 'setup' | 'blocked' | 'idle'` is computed inside the screen from the derived state machine (see below) and drives the top-bar dot colour.

## Derived state machine

Internal to `FloorExecutionScreen`:

```ts
type DerivedState =
  | 'awaiting_first_off'       // first-off inspection due before run
  | 'pick_required'            // pick list incomplete
  | 'running'
  | 'on_hold'
  | 'failed_pending_ncr'       // failed inspection — must raise NCR before continuing
  | 'complete';
```

The state is recomputed on every render from snapshot + queued mutations (`floorExecutionStore.queuedMutations`). The `PrimaryActionCard` reads the derived state to choose the single yellow CTA (e.g. `Record first-off` vs `Pick all` vs `Start running` vs `Close WO`).

## Mutations queue

`floorExecutionStore` keeps a `queuedMutations: ExecutionMutation[]` array. Every operator action — pick, scrap, NCR, print-label, set-state, quantity ±, ack-revision, inspection, issue, handover — is appended as a typed mutation rather than calling a service directly. This is what powers the offline-first kiosk: the queue drains once `syncState` flips back from `degraded` / `offline` → `online`.

## Idle lock

After 5 minutes of no `pointerdown` / `keydown` / `touchstart` / `wheel` activity, a 30-second countdown starts, then the screen locks (`Lock` icon overlay, requires re-auth via `floorSessionStore`). Constants `IDLE_THRESHOLD_MS` and `LOCK_COUNTDOWN_MS` at the top of `FloorExecutionScreen.tsx`.

## Demo-mode normalisation

`FloorRun.tsx` ships with `USE_CANONICAL = true`. While that flag is on, every kiosk entry point loads the canonical *Differential Housing* WO regardless of the URL — `WO-2026-0005` / `MO-2026-0002` / 5-unit demo batch / `Laser Cutter #1`. Flip it to `false` once production data is wired.

## AI surface treatment

The agent feed card on this screen uses the canonical `MirrorWorksAgentCard` + `.ai-card-glow` (teal accent) treatment defined in [`apps/web/src/guidelines/DesignSystem.md`](apps/web/src/guidelines/DesignSystem.md) — see commit `942a13f4`'s 21-line addition to that file. Any new AI affordance on the floor must reuse the agent card; do **not** roll a fresh accent.

## Components Used

- `@/components/ui/{button, card, dialog, sheet, badge}`
- `@/components/floor/execution/*` — all of the cards, dialogs, drawer, and viewer above
- `@/components/shop-floor/WorkOrderFullScreen` — overlay/route shell
- `@/components/theme-provider` — light/dark toggle in `AndonTopBar`
- `lucide-react` — Andon icons (`Check`, `LifeBuoy`, `Lock`, `Printer`, `Moon`, `Sun`, `ChevronLeft`)
- `sonner` — toast confirmations on every queued mutation

## Logic / Behaviour

- All operator actions go through `queueMutation(...)`. Nothing on this screen calls a service directly; the store fans the mutations out to the appropriate services on flush.
- `referenceView` defaults from the snapshot but is sticky per `workOrderId` via `floorExecutionStore.referenceViews[woId]` — so an operator who switches to *Instructions* on one WO sees *Drawing* on the next one if that's its default.
- The 1-second `now` ticker drives the cycle-time display and the idle-lock countdown.
- `RoutingStrip` is purely presentational — clicking a step calls `setRoutingStep(step)` which mounts `RoutingStepDrawer` as a side sheet.

## Dependencies

- `@/store/floorExecutionStore` — `referenceViews`, `queuedMutations`, `setReferenceView`, `queueMutation`, `setPendingResumeWorkOrder`
- `@/store/floorSessionStore` — operator session, `startJob` / `endJob` / `switchOperator`, `stationName`
- `@/services` → `makeService.getWorkOrderById`, `getManufacturingOrderById`, `getMachineById`

## Known Gaps / TODO

- `USE_CANONICAL = true` is still on in `FloorRun.tsx` — every WO id resolves to the same demo batch.
- Mutations queue has no flush implementation yet — `queuedMutations` accumulates and is read for derived state, but the offline drain is not wired.
- 3D `ExecutionModelViewer` uses a hardcoded `modelSrc`; the production version will need per-WO model resolution.
- Inspection gate failures funnel into `failed_pending_ncr` but the routing back to `running` after the NCR is raised is not yet automatic.

## Related Files

- [`apps/web/src/components/floor/FloorRun.tsx`](apps/web/src/components/floor/FloorRun.tsx)
- [`apps/web/src/components/floor/execution/`](apps/web/src/components/floor/execution) — 26 files: cards, dialogs, drawer, viewer, snapshot builder, types
- [`apps/web/src/components/shop-floor/WorkOrderFullScreen.tsx`](apps/web/src/components/shop-floor/WorkOrderFullScreen.tsx)
- [`apps/web/src/store/floorExecutionStore.ts`](apps/web/src/store/floorExecutionStore.ts)
- [`apps/web/src/store/floorSessionStore.ts`](apps/web/src/store/floorSessionStore.ts)
- [`apps/web/src/guidelines/DesignSystem.md`](apps/web/src/guidelines/DesignSystem.md) — canonical AI surface treatment

## Screenshot

![Floor Run — Andon-style cards](../../../audits/screenshots/shop-floor/floor-run-andon-2026-05-04.png)
