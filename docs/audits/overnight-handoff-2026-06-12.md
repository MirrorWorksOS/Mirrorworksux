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

---

## Worker 4 — VO amend-in-place + Credit Notes (audit P0 items 9–10; decision D8)

**Status: all scope items done. Typecheck, lint, unit tests (8 files /
93 tests — 6 new) and `vite build` green.**

| Scope | Status | Notes |
|---|---|---|
| A — VO amend-in-place | done | `approveVariation` deltaJob path REMOVED. `createVariation` captures a **deep-frozen** `VariationOrder.baseline` (new `VariationBaseline` type: capturedAt, soTotal, uninvoicedRemainder, job id/number/dates/value/hours, MO list with qtys+status+dueDate). Approval: `so.total` moves by `costDelta` (worker 3 contract — un-raised milestones re-price via pct × order total; raised invoices untouched), live Job `value`/`dueDate` amended, open (≠ done) MOs amended in place — qty scaled to newTotal/prevTotal (mock stand-in for the BoM diff), dueDate shifted, NEW `ManufacturingOrder.needsReschedule` flag set. Done MOs (and all WOs) untouched. Re-approving an approved VO throws. New return shape `{ vo, job?, amendedMos, milestoneAdjustment{previousTotal,newTotal,uninvoicedBefore,uninvoicedAfter}, creditNote? }` — `deltaJob` is GONE. When invoices already cover the amended total, SO flips `invoiced`. |
| B — Credit Note entity | done | `CreditNote` in entities.ts exactly per spec (+ doc comments); `mock.creditNotes` collection (mock/workflow.ts); `raiseCreditNote` (rejects amount ≤ 0; starts `draft` + `xeroSyncStatus: 'pending'`) and `issueCreditNote` (draft → `issued`, stamps `issuedAt`, mock-instant `synced`). `approveVariation` auto-raises a draft CN for `reduction − uninvoicedBefore` when a descope exceeds the uninvoiced remainder, linked to SO + VO. Exported helper `uninvoicedRemainderForSo(so)`. |
| C — Credit Note UI | done | `book/BookCreditNotes.tsx` (follows BookInvoices visual patterns): list = number, customer, amount, status badge, linked SO/VO/return refs, Xero sync badge, row-level Issue action; detail card on `/book/credit-notes/:id` with Issue/Close. Reads `mock.creditNotes` LIVE (version bump on mutate) so runtime-raised CNs appear without remount. Routes registered in routes.tsx; Sidebar (Book ▸ Receivables & Payables), breadcrumbs + sub-item-meta wired. |
| D — VO UI | done | `VOImpactPanel` rebuilt: baseline → amended preview (order total, MO qty diffs with done-MO "preserved" rows, job due-date shift), uninvoiced-milestone adjustment card ("un-raised milestones re-price automatically"), prominent rose warning + projected draft-CN amount when descope > uninvoiced remainder, and post-approval CN summary deep-linking to Book. Approve button reads "Approve & amend Job". `OrderJourneyPage` B5 toasts report the in-place amendment (+ flagged MO count) and any credit note — no "delta Job spawned" copy anywhere. |
| E — tests | done | 6 new: B5 rewritten (no new Job, so.total bump, double-approve rejection) + D8 suite (additive milestone re-price incl. completion = 50% × amended total; descope-with-CN $2,000 case; descope-within-remainder no-CN; baseline immutability incl. `Object.isFrozen` + mutation throw) + CN suite (raise/issue lifecycle, non-positive rejection). `npm run typecheck`, `lint`, `test`, `npx vite build` all green in `apps/web`. |

**Files touched**

- `apps/web/src/types/entities.ts` — `VariationBaseline(+Mo)`, `VariationOrder.baseline`, `CreditNote`, `ManufacturingOrder.needsReschedule`
- `apps/web/src/services/mock/workflow.ts` — `creditNotes` collection
- `apps/web/src/services/workflowService.ts` — `approveVariation` rework, `captureVariationBaseline`, `uninvoicedRemainderForSo`, `raiseCreditNote`, `issueCreditNote`, `shiftIsoDate`/`round2`/`deepFreeze` helpers
- `apps/web/src/components/book/BookCreditNotes.tsx` — NEW
- `apps/web/src/components/workflow/VOImpactPanel.tsx` — rebuilt for D8
- `apps/web/src/components/workflow/OrderJourneyPage.tsx` — B5 toasts
- `apps/web/src/routes.tsx`, `components/Sidebar.tsx`, `lib/navigation/breadcrumbs.ts`, `lib/sub-item-meta.ts` — Credit Notes nav
- `apps/web/src/test/unit/workflowService.test.ts` — B5 rewrite + D8/CN suites (`makeD8Job` factory; reuses worker 3's `makeG4*` factories)

**For the next workers**

- `approveVariation` result: use `r.job` (live Job, amended) /
  `r.amendedMos` / `r.creditNote` — `r.deltaJob` no longer exists and
  no Job is ever created on approval.
- Worker on D13 minimal RMA: `raiseCreditNote({ …, returnId })` is
  ready for the "credit note when owed" leg — pass the return id and
  the CN shows the link in Book ▸ Credit Notes automatically.
- MO qty amendment uses a value-ratio scale (newTotal/prevTotal) on
  open MOs as the mock stand-in for a real BoM/MO diff — whoever
  builds the BoM editor (D7 cluster) should replace that block in
  `approveVariation` with the real diff. `needsReschedule` is the
  Schedule Engine hook (currently set, never cleared — the engine
  worker should clear it on re-plan).
- `uninvoicedRemainderForSo` counts ALL non-void invoices linked to
  the SO (not just milestone-stamped ones).
- Browser verification not possible from this worktree (Claude-Preview
  serves the MAIN repo — see worker 2's note); verified via unit suite
  + `vite build`. Worker 6: raise an additive VO on
  /sell/orders/so-001/journey and approve (toast should say "amended
  in place"), then a −$big descope on an invoiced SO to see the CN
  warning, and check /book/credit-notes for the draft + Issue action.

---

## Worker 5 — ETO approval + publishBom rework + QC dispositions + vocab (audit P0 item 11, P1 item 14, P2 item 25; decisions D7, D9)

**Status: all scope items done. Typecheck, lint, unit tests (8 files /
108 tests — 16 new in workflowService.test.ts, now 61) and `vite build`
green.**

| Scope | Status | Notes |
|---|---|---|
| A — ETO approval state machine | done | `Job.approvalStatus: 'in_design' \| 'submitted_for_approval' \| 'approved' \| 'revision_requested'` (new `EngineeringApprovalStatus` union) + `Job.waiver { by, reason, at }` — engineering Jobs only; `_createEngineeringJob` seeds `in_design`. Mutations: `submitForApproval` (in_design \| revision_requested → submitted; revision loops back through submit), `approveEngineeringJob(id, { decision, by })` (submitted → approved \| revision_requested), `waiveBomApproval(id, { by, reason })` (validates both non-blank). `evaluateBomPublish(engJob)` → `bom_unapproved` unless approved OR waiver; `not_engineering_job` for non-eng Jobs. Exported + in `__test`. |
| B — publishBom under parent Job | done | `publishBomToProductionJob` RENAMED `publishBom`; gated on `evaluateBomPublish` (throws `GateFailure`); the two-Job internals are gone — it now creates ONE draft MO under the PARENT Job (`engJob.parentJobId`, the order's Job) for the published product (qty from the SO line when resolvable by productId, else `engJob.qty ?? 1`; `salesOrderLineId` stamped when found), pushes the BoM, completes the eng Job. Return shape is now `{ bom, parentJob, manufacturingOrders }` — `productionJob` no longer exists. Throws on eng Jobs with no `parentJobId`. Stale JSDoc on `Job.source`/`Job.parentJobId` fixed (and the service header's pseudo-customer comment corrected to replenishment-only per the amendments). Callers updated: EngineeringJobsPage, OrderJourneyPage B4, tests. |
| C — EngineeringJobsPage UI | done | Approval badge per row (+ amber "Waived" badge with who/why in the title tooltip); Submit / Resubmit for approval; Approve + Request revision buttons labelled "(portal demo)" with explanatory tooltips — demo stand-ins for the customer portal action; Waive-approval Dialog capturing who + why → `waiveBomApproval`; Publish BoM disabled with a tooltip until approved/waived, plus a ghost "Force (gate demo)" button that attempts the publish and renders `GateBanner` with `bom_unapproved`; page copy now says publishing creates MOs under the parent Job. Published rows show "BoM published → MOs under JOB-xxxx". |
| D — QC disposition completion | done | `QualityCheck` gains `disposition` (`QcDisposition` union) / `qty` / `costImpact` / `links { reworkWorkOrderId?, concessionId?, supplierReturnId? }`; **`ncrId` dropped** (no NCR entity, D9). New `SupplierReturn` entity (`status 'raised' \| 'debited' \| 'closed'`) + `mock.supplierReturns`. Mutations: `setQcDisposition` (merges links), `createShortfallMo({ qualityCheckId })` (requires scrap disposition + qty; clones the WO's MO → `-SF` number, draft, `needsReschedule`, qty = scrap qty, SAME Job), `createSupplierReturn` (validates qty/reason; stamps the QC when `qualityCheckId` passed). `QcReworkInspector` rebuilt: every disposition stamps the failed QC (id captured at Fail time); scrap opens a two-step modal (record qty + cost impact → explicit "Remake — shortfall MO" / "Ship short — concession" choice); return-to-vendor opens a qty + reason modal that raises the SupplierReturn. Concessions now use the WO's real `jobId` (via its MO) instead of hard-coded `job-001`. |
| E — vocabulary sweep | done | All "supervisor" role copy in `apps/web/src` `.ts`/`.tsx` → "lead": MakeSettings (×2), shop-floor mockMachines, FloorScanJob, FloorStationPicker, FloorClockIn (×2), FloorExecutionScreen (×3), NCRDialog, ControlFactoryDesigner (palette node `'supervisor'`/"Supervisor Station" → `'lead'`/"Lead Station" — the type id only appears at the palette definition), control/people mock-data, entities.ts + QcReworkInspector comments/toasts. Post-sweep grep of `.ts`/`.tsx` is clean. |
| F — tests + checks | done | 16 new tests: `evaluateBomPublish` (blocks ×4 statuses, approved passes, waiver passes, non-eng rejected), submit/approve/waive transitions incl. invalid ones, `publishBom` (gate failure; MOs under parent + NO new Job; end-to-end off the confirmed SO's eto line via waiver; no-parent rejection), scrap-remake shortfall MO, supplier-return creation + validation. `npm run typecheck`, `lint`, `test` (108), `npx vite build` all green in `apps/web`. |

**Files touched**

- `apps/web/src/types/entities.ts` — `EngineeringApprovalStatus`, `Job.approvalStatus`/`waiver`, source/parentJobId JSDoc fix, `QcDisposition`, `QualityCheck` rework (ncrId dropped), `SupplierReturn`
- `apps/web/src/services/mock/workflow.ts` — `supplierReturns` collection
- `apps/web/src/services/workflowService.ts` — `evaluateBomPublish`, D7 mutations, `publishBom` rework, `setQcDisposition`/`createShortfallMo`/`createSupplierReturn`, `__test` updated
- `apps/web/src/components/workflow/EngineeringJobsPage.tsx` — rebuilt for D7
- `apps/web/src/components/workflow/OrderJourneyPage.tsx` — B4 demo walks approval then `publishBom`
- `apps/web/src/components/workflow/QcReworkInspector.tsx` — rebuilt for D9
- Vocab sweep: `make/MakeSettings.tsx`, `make/shop-floor/mockMachines.ts`, `floor/FloorScanJob.tsx`, `floor/FloorStationPicker.tsx`, `floor/FloorClockIn.tsx`, `floor/execution/FloorExecutionScreen.tsx`, `floor/execution/dialogs/NCRDialog.tsx`, `control/ControlFactoryDesigner.tsx`, `control/people/mock-data.ts`
- `apps/web/src/test/unit/workflowService.test.ts` — D7 + D9 suites (`makeD7Jobs`/`makeD9Chain` factories)

**For worker 6**

- `publishBomToProductionJob` is GONE — anything publishing a BoM calls
  `publishBom` and gets `{ bom, parentJob, manufacturingOrders }`. The
  gate is `evaluateBomPublish`; failure code `bom_unapproved`.
- `QualityCheck.ncrId` no longer exists. `FloorExecutionScreen`'s NCR
  demo flow (local `ncrId` strings, NCRDialog) is a kiosk-local mock
  that never touched the QualityCheck entity — left functional, but it
  still SAYS "NCR" on the floor kiosk while D9 says the band is "QC";
  flag if the kiosk copy should follow.
- `src/guidelines/**/*.md` legacy spec docs still contain
  Operator/Supervisor/Manager role dropdowns (e.g.
  `Control-04-Screen-by-Screen.md`, `BudgetFunctionalityReview.md`) —
  archived specs, not runtime copy; left untouched per scope. Decide if
  they need a docs pass.
- `SupplierReturn.status` `'debited'`/`'closed'` transitions and the
  Bill debit (D9 "debit against the Bill") have no service mutation or
  Book surface yet — only `raised` is reachable. Same for surfacing
  `mock.supplierReturns` anywhere outside the QC toast.
- `createShortfallMo` clones the source MO (`MO-xxxx-SF`) — MRP/schedule
  re-fire is represented only by `needsReschedule: true` (same hook the
  Schedule Engine worker should clear on re-plan).
- Browser verification not possible from this worktree (Claude-Preview
  serves the MAIN repo — see worker 2's note); verified via unit suite +
  `vite build`. Worker 6 browser checks: /plan/engineering-jobs after
  confirming SO-2026-0085 (badge walk → submit → approve → publish;
  "Force (gate demo)" shows the bom_unapproved GateBanner; waiver modal
  records who/why), OrderJourneyPage B4 one-click demo, and a QC Fail →
  Scrap on a journey-page WO inspector (remake creates the -SF MO;
  ship-short logs the concession; RTV raises the supplier return).
