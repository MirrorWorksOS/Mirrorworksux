# Workflow archetypes (shared)

Added 2026-05-29 (commit `b16089b4`). Companion ADR: [ADR-006](../../audits/adr/ADR-006-workflow-archetype-service.md).

Workflow is the cross-module service + component family that encodes the seven Figma fulfilment archetypes (MTO, Catalogue, MTS, ETO, Variation, Rework, Subcontract) and the four named validation gates between them. Lives under `apps/web/src/services/workflowService.ts` + `apps/web/src/components/workflow/` rather than per-module folders because every consumer of these surfaces crosses Sell, Plan, Buy, Make, and Ship.

## File map

| Path | Export | Role |
|---|---|---|
| `apps/web/src/services/workflowService.ts` | `workflowService`, `GateFailure`, `evaluateSoToJob`, `evaluatePlanToMake`, `evaluateMakeToShip`, `evaluateGateReceiving` | Cross-module orchestrator + gate evaluators. |
| `apps/web/src/services/mock/workflow.ts` | mock collections for replenishment / engineering / subcontract Jobs | Seed data used by `workflowService` mutations. |
| `apps/web/src/test/unit/workflowService.test.ts` | unit tests | Coverage for the gate evaluators + cross-module mutations. |
| `apps/web/src/components/workflow/OrderJourneyPage.tsx` | `<OrderJourneyPage>` | Universal Order canvas at `/sell/orders/:id/journey`. |
| `apps/web/src/components/workflow/EngineeringJobsPage.tsx` | `<EngineeringJobsPage>` | ETO queue at `/plan/engineering`. |
| `apps/web/src/components/workflow/ReorderRulesPage.tsx` | `<ReorderRulesPage>` | Reorder rules admin at `/plan/reorder-rules`. |
| `apps/web/src/components/workflow/JourneyStepper.tsx` | `<JourneyStepper>` | Horizontal stage strip. |
| `apps/web/src/components/workflow/GateBanner.tsx` | `<GateBanner>` | Renders `GateFailureDetail[]` with deep-link CTAs. |
| `apps/web/src/components/workflow/AdvanceButton.tsx` | `<AdvanceButton>` | Stage-advance button — wires to `workflowService`, catches `GateFailure`. |
| `apps/web/src/components/workflow/RouteChip.tsx` / `RouteOverrideSelect.tsx` | `<RouteChip>`, `<RouteOverrideSelect>` | Display / edit `ProductRoute` per SO line. |
| `apps/web/src/components/workflow/EntityPeek.tsx` | `<EntityPeek>` | Read-only side-rail for linked Jobs / MOs / WOs. |
| `apps/web/src/components/workflow/JobGraphMini.tsx` | `<JobGraphMini>` | Visualises `parentJobId` chains. |
| `apps/web/src/components/workflow/VOImpactPanel.tsx` | `<VOImpactPanel>` | Variation impact preview against the live Job. |
| `apps/web/src/components/workflow/SubcontractTimeline.tsx` | `<SubcontractTimeline>` | Dispatch → receive timeline. |
| `apps/web/src/components/workflow/QcReworkInspector.tsx` | `<QcReworkInspector>` | Rework decision UI. |

## Domain extensions

Touched in `apps/web/src/types/entities.ts`:

- `Job.source` adds `engineering` | `replenishment` | `subcontract` to the existing union.
- `SalesOrderLine.route?: ProductRoute` + `Product.defaultRoute?: ProductRoute` — overrides ripple down via the `lineRoute(line)` resolver in `workflowService`.
- `GateFailureDetail = { code, message, fixUrl? }` — surfaced by every gate evaluator.
- `JourneyStage = 'quote' | 'sales_order' | 'job' | 'bom' | 'mrp' | 'schedule' | 'manufacturing' | 'dispatch' | 'invoice'`.

Replenishment / engineering / variation Jobs use the `Stock` pseudo-customer rather than nullable `customerId` (audit §4.4 alternative).

## Gate evaluators

Pure functions returning `GateFailureDetail[]`. `length === 0` → gate is open.

```ts
evaluateSoToJob(so) →
  - SO must be confirmed or in_production
  - Every line's product must exist + be active
  - MTO and Make-to-Stock lines must have a BoM (engineering / catalogue / variation skip)

evaluatePlanToMake(job) →
  - Job has startDate + dueDate
  - At least one MO exists for the job
  - Every MO has a routing
  - Material status is OK (no shortages without a covering PO)

evaluateMakeToShip(job) →
  - Every WO is closed
  - All required QC checks have a final decision
  - No outstanding rework chains

evaluateGateReceiving(receipt) →
  - PO line matches
  - Qty within tolerance band
```

`workflowService` methods that advance state through a gate throw `GateFailure { details: GateFailureDetail[] }` rather than returning the array; callers `try/catch` and surface via `<GateBanner>`.

## Service surface (`workflowService`)

Async methods, each mutates the relevant mock collection and returns the resulting domain object. Names are stable contracts; the implementation will move to Convex once the service ports for production.

```ts
workflowService.releaseSoToPlan(so) → { jobs: Job[], gates: [] }
workflowService.publishBomToProductionJob({ engineeringJobId, productId, revision, components }) → { bom, productionJob }
workflowService.runReorderMonitor() → Job[]                       // replenishment Jobs created
workflowService.applyVariationOrder({ jobId, changes }) → { vo, impactedMos, impactedWos }
workflowService.previewVariation({ jobId, changes }) → VariationImpact
workflowService.decideQualityCheck({ checkId, decision, comments }) → { check, reworkChain? }
workflowService.dispatchSubcontract({ moId, supplierId, components }) → SubcontractDispatch
workflowService.receiveSubcontract({ dispatchId, qty, qcDecision }) → { dispatch, qcCheck? }
```

Mutations go through `delay()` to mimic Convex latency so consumer code shapes its UX correctly today.

## Pages

### `/sell/orders/:id/journey` — `OrderJourneyPage`

Universal canvas. Renders stage banners inline as the order progresses; stage is inferred from SO status + pick-list state:

```ts
inferStage(so, pickLists): JourneyStage
  pickLists.length > 0 → 'manufacturing' or 'dispatch'
  so.status === 'draft'        → 'sales_order'
  so.status === 'confirmed'    → 'job'
  so.status === 'in_production' → 'manufacturing'
  so.status === 'shipped'       → 'dispatch'
  so.status === 'invoiced'      → 'invoice'
```

Sticky panel exposes demo action buttons (B1–B7) that fire the archetype's `workflowService` method. The page reactively shows whatever state the mutation produces (Jobs spawned, Pick Lists created, Variations awaiting approval, Rework chains, Subcontract dispatches).

### `/plan/engineering` — `EngineeringJobsPage`

Filters `mock.jobs` to `source: 'engineering'`. Each row has a `Publish BoM` action that calls `workflowService.publishBomToProductionJob` and surfaces the resulting production Job's `jobNumber`. Production Jobs spawned from this queue show up below the engineering list with `parentJobId` breadcrumbs (via `<JobGraphMini>`).

### `/plan/reorder-rules` — `ReorderRulesPage`

Per-product reorder thresholds (on-hand, reorder point, reorder qty, lead, shortage, enabled). The `Run monitor now` CTA fires `workflowService.runReorderMonitor` — the same code path the production cron will run. Below the rules table, lists the most-recent replenishment Jobs so customers see the monitor's output.

## Component contracts

### `JourneyStepper`

```ts
interface JourneyStepperProps {
  current: JourneyStage;
  completed: JourneyStage[];
}
```

Renders the canonical stage order (`quote` → `sales_order` → `job` → `bom` → `mrp` → `schedule` → `manufacturing` → `dispatch` → `invoice`). Completed stages render filled; current stage renders accent; future stages render outline.

### `GateBanner`

```ts
interface GateBannerProps {
  failures: GateFailureDetail[];
  onDismiss?: () => void;
}
```

Renders one row per failure with the message and an optional "Fix" CTA that links to `fixUrl`. Yellow background, dark text (per brand vocab).

### `RouteChip` / `RouteOverrideSelect`

```ts
type ProductRoute = 'mto' | 'catalogue' | 'make_to_stock' | 'eto' | 'variation' | 'rework' | 'subcontract';
```

`RouteChip` is read-only display. `RouteOverrideSelect` is the edit affordance that writes `line.routeOverride`.

### `AdvanceButton`

Wraps a `workflowService` method and the appropriate gate evaluator. Catches `GateFailure`, surfaces via injected `<GateBanner>` slot.

### `EntityPeek`

Read-only side-rail showing linked Jobs / MOs / WOs / Invoices for a given anchor entity. Click-through deep links use the standard module routes.

### `JobGraphMini`

Renders parent → child Job chains. Used in `EngineeringJobsPage` (publish-BoM lineage) and `ReorderRulesPage` (replenishment lineage).

### `VOImpactPanel`

Calls `workflowService.previewVariation`. Renders the diff against the live Job's MOs / WOs / dates.

### `SubcontractTimeline`

Renders dispatch → at-supplier → return → QC for a `SubcontractDispatch` row.

### `QcReworkInspector`

Surfaces the QC decision (pass / fail / rework) and, on rework, opens a child WO chain via `workflowService.decideQualityCheck`.

## Consumers

| File | Consumes | Notes |
|---|---|---|
| `apps/web/src/components/sell/SellOrderDetail.tsx` | `RouteChip`, `RouteOverrideSelect`, deep-link to `OrderJourneyPage` | Per-line route chip + KickoffDialog wiring. |
| `apps/web/src/routes.tsx` | mounts `OrderJourneyPage` at `/sell/orders/:id/journey`, `ReorderRulesPage` at `/plan/reorder-rules`, `EngineeringJobsPage` at `/plan/engineering` | — |

## Known gaps

- The service writes directly to mock collections. Consumers that bypass `workflowService` can desync — convention-only enforcement.
- Demo data has to cover all seven archetypes for the demo to be coherent. `services/mock/data.ts` is now load-bearing for sales calls, not just unit tests.
- Gate signatures are wide. Touching `evaluateSoToJob` ripples through every `<GateBanner>` mount.
- `workflowService` and `sellService` overlap on SO read paths — keep `workflowService` to *cross-module mutations*; reads of a single module's entities stay in the module's service.
