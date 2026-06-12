# ADR-006 — Workflow archetypes as a cross-module service

Date: 2026-05-29
Triggering commit: `b16089b4` (feat(workflow): wire 7 fulfilment archetypes + Products usability remediation).

## Context

The Figma spec defines seven fulfilment archetypes that every order must funnel through:

1. **MTO** — make-to-order, the default.
2. **Catalogue sale** — pick stock, no Job.
3. **MTS replenishment** — reorder monitor trips a replenishment Job against the `Stock` pseudo-customer.
4. **ETO** — engineering authors a BoM, publishing it spawns a production Job (`parentJobId`).
5. **Variation order** — VO impact is calculated against the live Job + downstream MOs/WOs.
6. **Rework** — quality decision creates a rework chain on the original WO.
7. **Subcontract** — material dispatch + return into the WO timeline.

Until this commit, those archetypes existed only in `docs/architecture/workflows.md`. The UI implemented enough of MTO to look real on a demo but not enough to click through end-to-end, and there was no single place where the rules for "can this transition happen?" lived. Each module re-derived its own checks ad hoc.

We needed a place to encode:

- the archetype assigned to each SO line (the `route` field, with overrideable defaults),
- the four named validation gates (`SO → Job`, `Plan → Make`, `Make → Ship`, `Receiving`),
- the cross-module mutations that move state between Sell, Plan, Buy, Make, Ship (release-to-plan kickoff, publish-BoM, run-reorder-monitor, dispatch-subcontract, etc.),
- a universal Order canvas that could render any of the seven archetypes from one component tree.

## Decision

Introduce `apps/web/src/services/workflowService.ts` as the single cross-module orchestrator and a parallel `components/workflow/` family for the UI surfaces.

**Service shape.** `workflowService` is a flat object of async methods (`releaseSoToPlan`, `publishBomToProductionJob`, `runReorderMonitor`, `applyVariationOrder`, `decideQualityCheck`, `dispatchSubcontract`, `receiveSubcontract`, …). Each method mutates the in-memory mock collections under `services/mock/` and returns the resulting domain object so the UI can refresh; mutations are wrapped in a small `delay()` so the latency profile mimics Convex. When Convex backs these end-to-end (post-ADR-005), the implementation switches to a Convex client without touching consumer call sites.

Four **named validation gates** are exported as `evaluate*` functions returning `GateFailureDetail[]`:

```ts
evaluateSoToJob(so) → checks SO is confirmed, products active, BoM exists for MTO/MTS lines
evaluatePlanToMake(job) → checks dates set, routing exists, material status OK
evaluateMakeToShip(job) → checks every WO closed, QC passes recorded
evaluateGateReceiving(receipt) → checks PO matches, qty within tolerance
```

Callers surface failures via the shared `GateBanner` component. The gates are pure functions; `GateFailure` is the thrown variant for service methods that refuse to advance.

**Component family.** `components/workflow/`:

- `OrderJourneyPage` — universal canvas at `/sell/orders/:id/journey`. Infers the current journey stage from SO status + pick-list state and renders stage banners inline as the order progresses. Demo action buttons for every archetype live in a single sticky panel so a customer click-through can experience all seven flows from one URL.
- `JourneyStepper` — the horizontal stage strip (quote → SO → job → BoM → MRP → schedule → manufacturing → dispatch → invoice).
- `GateBanner` — renders `GateFailureDetail[]` with deep-link fix-up CTAs (`fixUrl`).
- `RouteChip` / `RouteOverrideSelect` — display + edit `ProductRoute` per SO line.
- `AdvanceButton` — one button per stage; calls the appropriate `workflowService` method, surfaces `GateFailure` as a banner.
- `EntityPeek` — read-only side-rail for linked Jobs/MOs/WOs.
- `JobGraphMini` — visualises `parentJobId` chains (ETO publish, replenishment, rework).
- `VOImpactPanel` — runs `workflowService.previewVariation` and shows the diff against the live Job.
- `SubcontractTimeline` — dispatch → receive timeline for the Subcontract archetype.
- `QcReworkInspector` — quality decision UI for the Rework archetype.

Two dedicated admin pages back the non-MTO archetypes:

- `EngineeringJobsPage` at `/plan/engineering` — ETO queue, publish-BoM action that spawns the production Job.
- `ReorderRulesPage` at `/plan/reorder-rules` — per-product reorder thresholds, manual `Run monitor now` CTA that fires the same cron the production deploy will run on a schedule.

**Domain extensions.** `Job.source` adds `engineering` | `replenishment` | `subcontract`. Replenishment/engineering/variation Jobs use the `Stock` pseudo-customer (audit §4.4 alternative) rather than nullable `customerId` — keeps every Job customer-scoped without special-casing nullability in every list view.

## Consequences

**Easier:**

- One place to read the rules. PRs that touch "what can happen next" land in `workflowService.ts` and `evaluate*`, not scattered across module pages.
- `OrderJourneyPage` is the canonical demo surface — a single URL that shows any archetype in motion. Sales calls don't need slide decks.
- Module pages stay focused on display. Calls like `await workflowService.releaseSoToPlan(so)` keep cross-module knowledge out of `SellOrderDetail`.
- Cron and manual paths share an implementation. `ReorderRulesPage`'s "Run monitor now" calls the same `runReorderMonitor` the production cron will, so engineers debug one code path.

**Harder / paid for:**

- `workflowService` reads + writes the mock collections directly; consumers that don't go through it can desync. We rely on convention that "writes that cross modules go via workflowService" — a lint rule would be defensible later.
- The four gates are pure but their inputs (`SalesOrder`, `Job`, `WorkOrderExecutionSnapshot`, `GoodsReceipt`) are wide. Changing a gate's signature ripples through every page that mounts a `GateBanner`.
- Demo data has to grow to cover all seven archetypes. The fixture set under `services/mock/` is now load-bearing for sales demos, not just unit tests; PRs that touch fixtures need to keep the seven archetypes coverable from a fresh seed.
- Workflow component family lives under `components/workflow/` rather than per-module folders. That's intentional (it's shared) but contradicts the otherwise-strict module-folder convention; new contributors have to learn that `workflow/` exists.

## Alternatives

- **Per-module orchestration.** Have `SellOrders` know how to release to Plan, `PlanJobs` know how to publish a BoM, etc. Rejected: that's the status quo before this commit, and it's exactly what made the seven archetypes impossible to demo end-to-end.
- **A workflow engine (XState, Temporal-style).** Rejected for v1: the seven archetypes are small enough to encode as a flat service. The complexity of a state machine library outweighs the readability win until we have a tenth archetype.
- **Stay in Figma.** Rejected: the spec said the seven archetypes are the product; shipping only one of them in code was incoherent with the pitch.
- **Bundle the workflow components into `components/shared/`.** Rejected: shared/ is for primitives that don't know domain concepts. `JourneyStepper` and `GateBanner` know Jobs and gates by name; they're not generic enough for `shared/`.
