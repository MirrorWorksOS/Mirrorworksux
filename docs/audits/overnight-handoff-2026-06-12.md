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

---

## Worker 2 — gates at action sites (audit P0 items 4–6; decision D4, G2/G3/G5)

**Status: all scope items done. Typecheck, lint, and unit tests green
(8 files / 76 tests — 14 new).**

| Scope | Status | Notes |
|---|---|---|
| A — strengthen G2 | done | `evaluatePlanToMake` adds `routing_missing` (an MO's routing = its WO rows, or the fixture `workOrders` count) and `material_short` (BoM-explosion shortage not covered by free stock or an open PO blocks release). Open-PO coverage = outstanding qty on `sent\|acknowledged\|partial` PO lines — **draft POs do NOT count** (open question 6, TODO in code). |
| B — build G5 | done | `evaluateGateReceiving(goodsReceipt)`: `po_mismatch` (GR line not on an open PO line; PO cancelled/closed) + `qty_out_of_tolerance`. Tolerance = module constant `RECEIVING_QTY_TOLERANCE = 0.05` with TODO re open question 5 (global vs per-product vs per-PO-line). Under-receipt is a normal partial receipt and never blocks (matches the `partial` PO status + gr-002 fixture); only over-receipt beyond +5% blocks. Exported + added to `__test`. |
| C — MO release UI | done | `MakeManufacturingOrderDetail` gains a "Release to floor" header action for draft/confirmed MOs → `workflowService.releaseManufacturingOrder(moId)` (runs G2 on the MO's Job, throws `GateFailure`; on pass MO → `in_progress`, draft/planned Job follows). Failures render `GateBanner` above the tab panels. Status badges now read the live mock MO (the page's `MO_BY_ID` is a module-load snapshot). Fixture demo: mo-003 / mo-005 release cleanly. |
| D — dispatch gating | done | `ShipOrders`: local `Order` rows gain `salesOrderId` (SH-001 → so-001 fails G3 on incomplete WOs; SH-003 → so-002 passes; SH-009 → so-005 = stock-sale-only, no Job, skips G3 per D2). Advancing into Ship runs `evaluateMakeToShip`; failures → `GateBanner` in the detail sheet + blocked advance. The kanban drag-into-Ship path is gated identically. Sheet shows linked SO + gate path ("G3 Make → Ship" vs "Skipped — stock sale (pick list)"). |
| E — receiving gate UI | done | `BuyReceipts`: PO cards + line rows now derive from the live PO fixtures' new `lines` (all open POs listed, not 2 hard-coded ones). Accept → `workflowService.receiveGoods({ poId, lines })` which runs G5 then creates the GoodsReceipt + a `'gr'` StockMovement per line into `loc-raw`, bumps inventory + PO-line `receivedQty`, and flips the PO `partial`/`received`. `GateBanner` on failure. Photo + barcode affordances kept. |
| F — tests + checks | done | 14 new tests: G2 routing/material (incl. covering-PO pass + draft-PO exclusion), `releaseManufacturingOrder` (pass / `GateFailure` / invalid status), G5 evaluator (pass incl. tolerance boundary + under-receipt, `po_mismatch` ×2, `qty_out_of_tolerance`), `receiveGoods` (block-books-nothing / accept side-effects / close-out + closed-PO rejection). `npm run typecheck`, `lint`, `test` all green in `apps/web`. |

**Files touched**

- `apps/web/src/types/entities.ts` — `PurchaseOrder.lines?` + new `PurchaseOrderLine`
- `apps/web/src/services/mock/data.ts` — PO fixtures gain `lines` (po-002/po-003 lines mirror the existing GR fixtures)
- `apps/web/src/services/workflowService.ts` — G2 strengthened, `evaluateGateReceiving`, `RECEIVING_QTY_TOLERANCE`, `releaseManufacturingOrder`, `receiveGoods`, `__test` updated; rework-cap message now says "Escalate to a lead" (role vocab)
- `apps/web/src/components/make/MakeManufacturingOrderDetail.tsx` — Release action + GateBanner + live status
- `apps/web/src/components/ship/ShipOrders.tsx` — G3 dispatch gating (button + kanban) + GateBanner + SO linkage
- `apps/web/src/components/buy/BuyReceipts.tsx` — line-level receive flow through G5
- `apps/web/src/test/unit/workflowService.test.ts` — new gate/mutation coverage

**For the next workers**

- `PurchaseOrder.lines` is OPTIONAL — legacy/quick POs without lines are
  invisible to G2 coverage and unreceivable through G5 (`po_mismatch`).
  Anything creating POs that should pass receiving must seed `lines`
  (the subcontract PO from `releaseSubcontract` currently has none —
  whoever picks up D10 subcontract returns through G5 must add a line
  for the returned op/part).
- `receiveGoods` books into `loc-raw` only; FG put-away stays the
  separate `putAway` flow (audit P1 item 15).
- G3's `qc_not_final` / `rework_open` codes from the content pack are
  NOT built — `evaluateMakeToShip` is unchanged (only mounted in Ship).
  They belong to whoever takes the QC/D9 cluster.
- The Claude-Preview MCP launches the dev server from the MAIN repo, so
  in-browser verification of this worktree wasn't possible with it; I
  verified by serving the worktree with vite directly (modules compile
  + contain the changes) plus the unit suite. Worker 6: browser-check
  /make/manufacturing-orders/mo-005 (release pass), SH-001 in
  /ship/orders (blocked dispatch), and /buy/receipts (PO-2026-0089
  over-receipt → G5 banner) before the PR.

---

## Worker 3 — milestone invoicing (audit P0 items 7–8; decision D5, gate G4)

**Status: all scope items done. Typecheck, lint, and unit tests green
(8 files / 87 tests — 11 new).**

| Scope | Status | Notes |
|---|---|---|
| A — PaymentTerm milestones | done | `milestones: PaymentMilestone[]` (`{event, pct}`, events `order_confirmed\|dispatch\|delivery\|completion`, must sum to 100) + `days` kept as net terms per invoice; `depositPct` kept but `@deprecated`. Migration helper `milestonesForTerm(term)`: explicit → legacy deposit → default `[{dispatch, 100}]`. Fixtures add "Net 30 on dispatch" (`pt-net30-dispatch`), "50% deposit / 50% on completion" (`pt-50-50-completion`), "On delivery" (`pt-on-delivery`); `pt-50-balance` deliberately left on legacy `depositPct` to demo the convert affordance. cust-002 → 50/50, cust-006 → Net 30 on dispatch for demos. |
| B — ControlPaymentTerms editor | done | Milestone schedule section in the dialog: ordered (event select, pct input) rows, add/remove, live sum indicator (green at 100%, red otherwise), blocking validation on save when ≠ 100; one-click "Convert N% deposit to milestones" shows only for legacy terms (deposit set, no rows). New read-only "Milestone schedule" table column shows the effective schedule, flagging "(legacy deposit)" / "(default)" derivations. Existing fields untouched. |
| C — gate G4 | done | `evaluateInvoiceMilestone(so, milestone, shipmentId?)` REPLACES `evaluateShipToBook` (export deleted; `__test` updated; no other importers existed). Event checks per the content pack; dedup `milestoneInvoiceExists` keyed (SO, event) for order_confirmed/completion, (SO, event, shipmentId) for dispatch/delivery — a second partial shipment under `[{dispatch,100}]` is a NEW invoice. Codes: `milestone_not_reached`, `milestone_already_invoiced`, `no_shipment`, `undelivered` (delivery only). `paymentTermForSalesOrder` resolves customer → term → global default. |
| D — invoice raising | done | `workflowService.raiseInvoiceForMilestone({salesOrderId, event, shipmentId?})` → runs G4, amount = pct × order total pro-rated to the shipment's lines (NEW `Shipment.lineIds?: string[]`; absent = whole order) via exported `milestoneInvoiceAmount`; stamps `SellInvoice.{milestoneEvent, milestonePct, shipmentId?}` (new optional fields); due = issue + `term.days`; SO → `invoiced` once milestone invoices cover the total. Without an explicit shipmentId the service picks the next uninvoiced shipment (delivery prefers PoD'd ones). UI: new `InvoiceMilestonePanel` (components/workflow) shows the schedule with per-milestone state (invoiced / ready / not reached + blocked reason), one row per shipment for dispatch/delivery, Raise button on eligible rows, inline GateBanner on failure — mounted on OrderJourneyPage and SellOrderDetail overview (renders only when the id resolves to a central SO). `SellNewInvoice` opens pre-linked via `?soId=…&milestone=…[&shipmentId=…]` (prefilled customer/PO-ref/due/line; Issue goes through G4); free-form ad-hoc path unchanged. |
| E — invoice displays | done | `SellInvoiceDetail` shows "Payment-term milestone: Event · pct% · SP-ref" and now falls back to the central `sellInvoices` record so runtime-raised invoices are openable. `BookInvoices` rows show "Milestone: …" under the invoice number. (book/InvoiceDetail.tsx is a hard-coded showcase with no id param — left alone.) |
| F — tests + checks | done | 11 new tests: `milestonesForTerm` (explicit / deposit migration / default), every G4 event type incl. undelivered-scoped-to-delivery, per-SO vs per-shipment dedup, `raiseInvoiceForMilestone` pro-rating (½-order shipment → ½ amount), dueDate = issue + days, once-per-SO deposit, completion close-out, missing-event rejection. `npm run typecheck`, `lint`, `test` all green in `apps/web`. |

**Files touched**

- `apps/web/src/types/entities.ts` — `PaymentMilestoneEvent`, `PaymentMilestone`, `PaymentTerm.milestones`, `SellInvoice.{milestoneEvent,milestonePct,shipmentId}`, `Shipment.lineIds`
- `apps/web/src/services/workflowService.ts` — G4 rework + `MILESTONE_EVENT_LABELS`, `milestonesForTerm`, `paymentTermForSalesOrder`, `milestoneInvoiceExists`, `milestoneInvoiceAmount`, `raiseInvoiceForMilestone`
- `apps/web/src/services/mock/data.ts` — payment-term fixtures, cust-002/cust-006 term wiring
- `apps/web/src/components/control/ControlPaymentTerms.tsx` — milestone editor (additive)
- `apps/web/src/components/workflow/InvoiceMilestonePanel.tsx` — NEW
- `apps/web/src/components/workflow/OrderJourneyPage.tsx`, `sell/SellOrderDetail.tsx` — panel mounts
- `apps/web/src/components/sell/SellNewInvoice.tsx`, `sell/SellInvoiceDetail.tsx`, `book/BookInvoices.tsx` — pre-link + milestone display
- `apps/web/src/test/unit/workflowService.test.ts` — G4 suites + fixture factories

**For the next workers**

- `evaluateShipToBook` is GONE. Anything touching Ship → Book must go
  through `evaluateInvoiceMilestone(so, milestone, shipmentId?)` /
  `raiseInvoiceForMilestone`.
- D8 (VO money cluster): decision doc says approved VO `costDelta`
  adjusts the **remaining uninvoiced** milestones — NOT built here.
  Hook point: `raiseInvoiceForMilestone` computes from `so.total` at
  raise time, so amending `so.total` on VO approval is sufficient for
  un-raised milestones; already-raised invoices are immutable.
- `Shipment.lineIds` is optional; fixtures don't set it (legacy
  shipments cover the whole order). Whoever builds real dispatch
  (G3/ShipOrders) should stamp `lineIds` on partial shipments so
  pro-rating engages.
- Invoice lists (`SellInvoices`, `BookInvoices`) map central fixtures at
  module load, so invoices raised at runtime appear only after a
  remount; `SellInvoiceDetail` resolves them by id regardless.
- Browser verification not possible from this worktree (Claude-Preview
  serves the MAIN repo — see worker 2's note). Worker 6: check
  /sell/orders/so-004/journey (dispatch milestone ready → raise),
  /sell/orders/so-002/journey (50/50 schedule, deposit ready),
  Control ▸ Payment terms (sum validation + convert button on
  "50% deposit, balance on delivery"), and /book/invoices for the
  milestone line after raising.
