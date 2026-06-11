# Overnight handoff — workflow audit fixes, 2026-06-12

Running status log for the 6-worker overnight implementation of
[frontend-workflow-gap-audit-2026-06-11.md](frontend-workflow-gap-audit-2026-06-11.md)
against [workflow-decisions-2026-06-11.md](../dev/shared/workflow-decisions-2026-06-11.md).
Each worker appends a section when done: items done / partial / blocked,
files touched, and anything the next worker must know.

Branch: `feat/workflow-audit-fixes` (worktree `Mirrorworksux-overnight`,
branched from `main` @ 8520f469). Worker 6 opens the PR.

---

## Worker 1 — enum + grain + spine (audit P0 items 1–3; decisions D1, D2, D3)

**Status: all scope items done. Typecheck, lint, and unit tests green
(8 files / 62 tests).**

| Scope | Status | Notes |
|---|---|---|
| A — route enum | done | `ProductRoute = 'mto' \| 'stock_sale' \| 'eto'`; `catalogue_sale` → `stock_sale` everywhere; `make_to_stock` removed as a route (prod-005 fixture now `stock_sale`; replenishment stays on its `ProductReorderRule`). `evaluateSoToJob` requires a BoM for **mto lines only**. |
| B — one Job per SO | done | `confirmSalesOrder` creates ONE Job covering manufactured (mto + eto) lines; each mto line → `ManufacturingOrder` under that Job with NEW fields `salesOrderLineId` / `qty` / `startDate` (line→MO link persisted; `so.jobId` also set); stock_sale lines reserve + raise pick lists; eto lines spawn a child engineering Job with `parentJobId` = the order's Job; pure stock-sale orders create NO Job and stay `confirmed` (not `in_production`). `ConfirmSalesOrderResult` now `{ salesOrder, job?, perLine[{ lineId, route, manufacturingOrderId?, engineeringJobId?, pickListId?, note? }] }` — the old per-line `jobId` field is gone. |
| C — JourneyStepper | done | 7-stage spine `quote → sales_order → job → manufacturing → work_orders → dispatch → invoice`; `JourneyStage` union slimmed (bom/mrp/schedule/qc removed); `OrderJourneyPage` `inferStage` (`in_production` → `work_orders`) + `completedBefore` + `actionForStage` updated. |
| D — SellOrderDetail + KickoffDialog | done | Dialog releases ONE Plan Job per order; included manufactured lines listed as MOs under it; stock-sale lines render dashed info rows "No Job — pick list raised"; pure stock-sale orders confirm with the no-Job message. `KickoffDialog.onApplied` now receives `KickoffResult { job?, lines, stockLineCount }` (was a per-line job array). `KickoffProduct` gained `route?: ProductRoute`. |
| E — OrderJourneyPage copy | done | B4 demo button reads "Publish ETO BoM → MOs under parent Job" (label only — `publishBomToProductionJob` left functional for worker 5); B1/confirm toasts report the single Job; "Catalogue" copy → "Stock Sale". |
| F — tests + checks | done | `workflowService.test.ts` rewritten for the new contract (one-Job assertion, MO line-link/qty/startDate, child-eng-Job parentJobId, no-Job-for-stock-only). `npm run typecheck`, `npm run lint`, `npm run test` all green in `apps/web`. |

**Files touched**

- `apps/web/src/types/entities.ts` — ProductRoute, JourneyStage, ManufacturingOrder (+3 optional fields), doc comments
- `apps/web/src/services/workflowService.ts` — confirmSalesOrder rework, ConfirmSalesOrderResult, evaluateSoToJob, `_createEngineeringJob(so, line, parentJobId?)`
- `apps/web/src/services/mock/data.ts` — prod-005 route, MO fixtures gain qty/startDate, comments
- `apps/web/src/services/mock/workflow.ts` — comment only
- `apps/web/src/components/workflow/RouteChip.tsx`, `RouteOverrideSelect.tsx` — 3 route options
- `apps/web/src/components/workflow/JourneyStepper.tsx`, `OrderJourneyPage.tsx` — 7-stage spine + copy
- `apps/web/src/components/sell/SellProducts.tsx`, `apps/web/src/components/shared/product/ProductDetail.tsx` — route option lists
- `apps/web/src/components/sell/SellOrderDetail.tsx`, `apps/web/src/components/sell/order-kickoff/KickoffDialog.tsx` — one-Job kickoff grain
- `apps/web/src/test/unit/workflowService.test.ts` — new contract

**For the next workers**

- `ConfirmSalesOrderResult.perLine[].jobId` no longer exists — use
  `result.job` (order Job), `perLine[].manufacturingOrderId` (mto) or
  `perLine[].engineeringJobId` (eto). Anything you build on confirm must
  consume this shape.
- MOs created at confirm have `status: 'draft'` — worker on audit item 4
  (G2 Release button) should drive `draft → confirmed/in_progress` from
  there; `salesOrderLineId`, `qty`, `startDate` are already populated.
- `publishBomToProductionJob` is UNTOUCHED and still spawns a separate
  production Job (old two-Job pattern) — worker 5 must rework it to
  create MOs under `engJob.parentJobId` (the order's Job) and rename it
  `publishBom` gated on `evaluateBomPublish` per the decisions doc.
  Engineering Jobs from confirm now carry `parentJobId`, so the parent is
  reachable.
- `approveVariation` still returns the `deltaJob` (D8 removal is the
  money-cluster worker's scope); `VOImpactPanel` untouched.
- Stage ids `bom`/`mrp`/`schedule`/`qc` no longer typecheck — if you add
  stepper deep-links, use the 7 new ids.
- A husky/lint-staged pre-commit hook runs `eslint --fix` on staged
  files; `npm install` has been run in this worktree.
