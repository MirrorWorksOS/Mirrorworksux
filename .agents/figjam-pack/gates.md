# Frame 0b — Validation gates + backend build sheet (replacement section)

Replaces the old "Validation gates" cards and the "Backend fields" chip row. This frame is "0b" — frame 0a's gate diamonds and crons footnote point here.
Layout: one wide frame, three stacked panels (Gates / Crons / Fields), remediation stickies pinned bottom-right, Open Questions panel pinned bottom-left.
Colour rule: any card or chip sitting on the amber/yellow Job-spine band (and the Make-yellow G2 card header) MUST use dark text — never white.

---

## PASTE BLOCK 1 — Frame title (top of frame)

```
0b. VALIDATION GATES + BACKEND BUILD SHEET — checkpoints on the spine
A gate is a pure function run at a handoff. It returns a list of failures;
an empty list means PASS and the transition proceeds. Failures are
{ code, message, fixUrl? } — the snake_case code is the stable contract,
the message is what the user sees, fixUrl deep-links to the fix screen.
Tags: [exists] = in workflowService.ts today · [build] = Sharjeel builds it.
```

[Layout note: place this as a text panel directly under the frame title. Cross-cutting gray outline.]

---

## PASTE BLOCK 2 — Glossary text panel (pin top-right of frame, gray)

```
JARGON DECODER (read me first)
SO = Sales Order — the customer's confirmed order
MO = Manufacturing Order — one "make this product, this qty" instruction
WO = Work Order — one step of an MO at one machine/work centre
BoM = Bill of Materials — the parts list for a product
BoM explosion = walking the parts list to compute total material needed
MRP = Material Requirements Planning — compares BoM demand to stock, finds shortages
PO = Purchase Order · GR = Goods Receipt — recording that bought goods arrived
AP bill = the supplier's invoice to us (Accounts Payable)
FG = Finished Goods — completed, sellable stock
pick list = the warehouse instruction to pull specific stock for a job/shipment
VO = Variation Order — an agreed change to a live order
QC = Quality Check · PoD = Proof of Delivery
RMA = customer return (Return Merchandise Authorisation)
free-issue = we send our own material to a subcontractor to work on
concession = a recorded internal approval (named approver) to accept off-spec work or ship short; the customer contact is noted when the customer has agreed
backorder = the unfilled remainder we still owe the customer
Routes: MTO = make-to-order · ETO = engineer-to-order (design first) · stock sale = ship from shelf
```

[Layout note: paste as a TEXT PANEL, not a sticky — ~19 lines auto-shrink unreadably on a sticky. If stickies are mandatory, split after the "pick list" line into two stickies: "Jargon decoder 1/2" and "2/2".]

---

## PASTE BLOCK 3 — Gate card G1 (header tint: Plan purple)

```
G1 · SO → JOB
evaluateSoToJob(salesOrder)
Fires on: Sales Order confirm (inside confirmSalesOrder)

Checks
• SO status is confirmed [exists]
• every line's product exists [exists]
• every line's product is active [exists]
• BoM exists for each MTO line [exists]
  (stock-sale lines skip this; ETO lines skip it — their BoM
   arrives later via the engineering Job)

Failure codes
so_not_confirmed [exists] · product_missing [exists]
product_inactive [exists] · bom_missing [exists]
```

[green flow text] `PASS → one Job created for the SO (manufactured lines only) → MOs per line`

---

## PASTE BLOCK 4 — Gate card G2 (header tint: Make yellow — DARK text on this header)

```
G2 · PLAN → MAKE
evaluatePlanToMake(job)
Fires on: MO release (Job moves from planning to the floor)

Checks
• Job has start + due dates [exists]
• Job has at least one MO [exists]
• every MO has a routing (an operation sequence — the list
  of WO steps) [build]
• material status OK: every shortage from the BoM explosion
  is covered by free stock or an open PO — a shortage with
  no covering PO blocks release [build]

Failure codes
dates_missing [exists] · no_mos [exists]
routing_missing [build] · material_short [build]
```

[green flow text] `PASS → WOs released to the floor, pick lists for material`

---

## PASTE BLOCK 5 — Gate card G3 (header tint: Ship orange)

```
G3 · MAKE → SHIP
evaluateMakeToShip(job)
Fires on: dispatch (creating the shipment)

Checks
• all WOs on all MOs are complete [exists]
• failed QC blocks dispatch [exists]
• a recorded disposition (rework / scrap / use-as-is /
  return-to-vendor) lifts a failed-QC block [build]
• all QC decisions final — no 'hold' results left open [build]
• no open rework chains (rework WOs incomplete) — reads
  WorkOrder.reworkDepth, which already exists; chains cap at
  depth 2, then escalate to a lead (concession or scrap,
  decision 9) [build]

Failure codes
wo_incomplete [exists] · qc_failed [exists]
qc_not_final [build] · rework_open [build]
```

[green flow text] `PASS → pick · pack · dispatch → shipment in transit`

---

## PASTE BLOCK 6 — Gate card G4 (header tint: Book gray)

```
G4 · SHIP → BOOK (milestone-aware)
evaluateInvoiceMilestone(so, milestone)
Fires on: invoice raise — replaces the old hard-coded
"PoD recorded" check (evaluateShipToBook)

The customer's PaymentTerm carries milestones[] {event, pct}
summing to 100. Events: order_confirmed | dispatch | delivery
| completion. This gate asks: "has THIS milestone's event
actually happened?"

Checks
• the milestone event has occurred [build]
  - order_confirmed: SO confirmed (no shipment needed)
  - dispatch: shipment exists for the lines being invoiced
  - delivery: shipment exists AND PoD recorded
  - completion: every line has shipped
• not already invoiced — scoping depends on the event [build]
  - order_confirmed + completion fire ONCE per SO: block if
    any invoice for this SO already carries the event
  - dispatch + delivery fire once PER SHIPMENT (decision 5:
    one invoice per shipment, pro-rated to its lines): block
    only if an invoice already exists for this event AND this
    shipmentId / these shipped lines. A second partial
    shipment under [{dispatch, 100}] is a NEW invoice, not a
    duplicate — do NOT enforce uniqueness on (SO, event) alone
• shipment exists (dispatch/delivery milestones) [exists]
• PoD recorded (delivery milestones only) [exists]

Failure codes
milestone_not_reached [build]
milestone_already_invoiced [build — dedup key is (SO, event)
for order_confirmed/completion, but (SO, event, shipmentId)
for dispatch/delivery]
no_shipment [exists] · undelivered [exists — now scoped to
delivery milestones only, not a universal block]
```

[green flow text] `PASS → invoice raised pro-rated to shipped lines → pushed to Xero`

---

## PASTE BLOCK 7 — Gate card G5 (header tint: Buy green)

```
G5 · RECEIVING
evaluateGateReceiving(goodsReceipt)
Fires on: GR accept (booking arrived goods into stock)

DOES NOT EXIST IN CODE — promised in docs/ADR-006 but never
built. Entirely [build].

Checks
• every GR line matches an open PO line (right product,
  PO not cancelled/closed) [build]
• received qty within tolerance of PO line qty [build]

Failure codes
po_mismatch [build] · qty_out_of_tolerance [build]

Note: subcontract returns come back THROUGH this gate — the
subcontractor's PO is received here, then a QC check runs on
the returned parts (see Subcontract spoke).
```

[green flow text] `PASS → stock movement 'gr' into raw/FG → covers MRP shortages → auto-fires waiting pick lists via reservation conversion (decision 6 — see SalesOrderLine chips)`

---

## PASTE BLOCK 8 — Half-card, publish-time check (place beside G2, half height, ETO-tagged; Plan purple outline)

```
PUBLISH CHECK · BoM PUBLISH (ETO) — not a spine gate
evaluateBomPublish(engineeringJob)
Fires on: publishing the engineering Job's BoM (which is what
creates the MOs under the parent Job)

Checks
• engineering Job approvalStatus = 'approved' (customer signed
  off the drawings via the portal / MirrorView markups), OR
  an internal waiver is recorded — who + why [build]

Failure code
bom_unapproved [build]

This is a publish-time check on one spoke, not a stage-to-stage
gate. No waiver, no approval → no BoM, no MOs, no production.
```

---

## PASTE BLOCK 9 — Crons panel (separate panel below gates; Cross-cutting gray outline)

```
BACKGROUND CRONS — these create work, they don't block it (not gates)
Cadences below are PROPOSED, not decided — see Open Questions panel.

1 · REORDER MONITOR — runReorderMonitor() [exists as mock]
   Schedule (proposed): hourly — today's mock is manually
   invoked; no schedule exists in code
   Fires on: reorder-point breach — free stock (on hand −
   reserved) drops below ProductReorderRule.reorderPoint.
   No customer order involved (decision 3).
   Creates: manufactured product → replenishment Job for
   reorderQty (customer = "Stock" pseudo-customer, never
   blank) [exists as mock] · purchased product → MRP
   suggestion / auto-PO [build — today's mock never reads
   shortageBehaviour and always creates a Job; the
   shortageBehaviour read and the purchased/auto-PO branch
   are new]
   Skips when an open replenishment Job already covers the
   product [build: today's duplicate check matches on Job
   title — replace with a real productId link]
   NOTE: shortageBehaviour 'wait' → visible backorder queue
   belongs to SO-LINE shortfalls at allocation time
   (decision 6), NOT to this cron — see SalesOrderLine chips.

2 · OVERDUE-INVOICE FLAGGER [build]
   Schedule (proposed): nightly
   Reads: invoices status 'sent' where due date has passed
   (due = issue date + PaymentTerm.days)
   Mutates: Invoice.status → 'overdue'; optionally queues a
   reminder email via Resend

3 · SCHEDULE RE-FIRE AFTER VO APPROVAL [build]
   Schedule (proposed): event-driven — enqueued by
   approveVariation, retried every 5 min until done
   Reads: approved VO + the amended MOs on the live Job
   Mutates: re-runs MRP for changed MOs, regenerates schedule
   slots; applies costDelta to the remaining uninvoiced milestones

4 · XERO PAYMENT-STATUS PULL [build]
   Schedule (proposed): hourly
   Reads: Xero payment + credit-note status for synced invoices
   (Xero is the ledger of record; MirrorWorks is operational)
   Mutates: flips Invoice.status → 'paid' / 'overdue'; feeds
   the overdue flagger. NO new entity — decision 11 pulls
   payment STATUS only. (A persisted Payment record is a
   proposed elaboration — see Open Questions panel.)
```

---

## PASTE BLOCK 10 — Backend fields chips (replacement)

[Layout note: paste each bullet line below as its OWN chip/sticky, grouped inside a small labelled section frame per entity (frame label = the entity name, tinted with the module colour shown). Do NOT paste a whole group as one text blob — the per-chip tags and colours stop working. Dark text on every chip in the Job (amber) and ManufacturingOrder (yellow) groups.]

```
BACKEND FIELDS — schema deltas to build
[new] = new field/entity · [changed] = exists but shape changes · [exists] = already there, keep
```

```
PaymentTerm (Book gray)
• milestones[] {event: order_confirmed|dispatch|delivery|completion, pct} — must sum to 100 [new]
• days — net terms, applies to EACH invoice raised [exists]
• depositPct — superseded by milestones[] (deposit = order_confirmed row) [changed — migration path: see Open Questions panel, this frame]
```

```
Invoice (Book gray)
• milestone link {event, pct, shipmentId?} — records WHICH milestone (and, for dispatch/delivery, WHICH shipment) an invoice covers; G4's milestone_already_invoiced dedup reads this [new — exact shape: see Open Questions panel, this frame]
```

```
SalesOrder / Customer (Sell blue)
• SalesOrder.allowPartialFulfilment — default true, seeded from the customer [new]
• Customer default for allowPartialFulfilment [new]
```

```
SalesOrderLine (Sell blue)
• route: 'mto' | 'stock_sale' | 'eto' — decided + PERSISTED at confirm (replaces optional routeOverride-only; catalogue_sale renamed stock_sale) [changed]
• backorderQty — unfilled remainder owed to the customer [new]
• backorder fill is EARMARKED via Reservation: the covering replenishment Job or inbound PO is linked to the SO line through a Reservation; on GR or FG put-away the Reservation converts into the second pick list (decision 6) [build — Reservation entity exists (active|released|consumed); the Job/PO→SO-line earmark and the conversion are new]
```

```
Job (Job spine amber — DARK text)
• ONE Job per SO, covering only its manufactured lines (pure stock-sale orders get NO Job at all) [changed]
• parentJobId — ETO engineering Jobs are children, rejoin parent at MRP [changed — field exists; direction inverts: the engineering Job now points UP to the parent SO-Job; the old sibling production-Job link is gone]
• source: sales_order | replenishment | engineering | variation | manual [exists]
• replenishment Jobs use the "Stock" pseudo-customer — never a blank customer [exists]
• engineering / variation Jobs keep the REAL customer — they spawn from a real customer's order (resolved 2026-06-11; matches code; ADR-006's "all three use the pseudo-customer" wording is stale and gets corrected) [exists]
```

```
ManufacturingOrder (Make yellow — DARK text)
• salesOrderLineId — each manufactured line gets an MO; this is the persisted line→production link [new]
• qty — units to make (MO is the scheduling unit) [new]
• startDate — alongside existing dueDate [new]
```

```
QualityCheck (Quality red/pink)
• disposition: rework | scrap | use_as_is | return_to_vendor [new]
• qty — how many units the decision covers [new]
• costImpact — scrap charges the Job, cost never leaves its P&L [new]
• links: reworkWorkOrderId? · concessionId? · supplierReturnId? [new]
• ncrId — DROPPED (no NCR entity; QC owns disposition) [changed]
• BEHAVIOUR (decision 9, backend work): scrap disposition also flips the BatchLot to consumed/quarantine AND forces an explicit remake-or-ship-short prompt — shortfall MO (re-fires MRP) or ship short via the concession path [build]
• BEHAVIOUR: rework chains cap at WorkOrder.reworkDepth 2 (field exists), then escalate to a lead — concession or scrap [build — the escalation, not the field]
```

```
New entities (Book gray / Quality pink)
• CreditNote — Xero-synced like an invoice; raised when a VO descopes beyond the uninvoiced remainder, or an RMA credit is owed [new]
• CustomerReturn (RMA) — return receipt → QC → disposition (restock | rework Job | scrap) + credit note when owed; reuses QC disposition machinery [new]
• SupplierReturn — return-to-vendor: linked to the original GR, debit against the Bill (the AP bill — see glossary) [new]
```

```
SubcontractDispatch (Buy green)
• status slims to: released → at_supplier → received → closed (drop subcontract_in_transit, returning) [changed]
• purchaseOrderId — a PO is ALWAYS created (AP bill + gate G5 hang off it) [exists]
• materialModel: sub_supplied | free_issue | hybrid [exists]
```

```
Engineering Job (Plan purple) — Job where source = 'engineering'
• approvalStatus: in_design → submitted_for_approval → approved | revision_requested [new]
• waiver {by, reason} — internal override of customer approval, recorded [new]
```

```
StockMovement (Inventory teal)
• reason 'adjust' — wire the stocktake flow: counted-vs-system correction with reason/who/note [exists field — build flow]
• refType 'rma' — wire the RMA receipt flow [exists field — build flow]
```

```
Product (Sell blue)
• defaultRoute slims to: mto | stock_sale | eto [changed]
• make_to_stock removed as a route — stocked products resolve to stock_sale at order time; replenishment lives in ProductReorderRule [changed]
```

```
Unchanged — keep as-is (gray) — [exists] chips only
• BoM.components · isPhantom [exists]
• MrpSuggestion · shortfall · suggestedSupplierId/Name [exists] (the old board chip's truncated label "qtyShort · prefe…" expanded to field names that do NOT exist on MrpSuggestion — qtyShort lives on MaterialDemand, the explodeBom row, and preferredSupplierId/Name on the legacy ReorderRule)
• WorkCentre.capacityHoursPerDay [exists]
• MO.workOrders · Operation.isSubcontracted [exists]
• WorkOrder · TimeEntry (labour) · reworkDepth (cap 2 — G3's rework_open check reads it) [exists]
```

---

## PASTE BLOCK 11 — Open Questions panel (text panel, pin bottom-left; Cross-cutting gray outline, bold red header)

```
OPEN QUESTIONS — not yet decided. Do NOT build these silently.
1 · PaymentTerm.depositPct migration: auto-convert existing
    depositPct values into an order_confirmed milestone row,
    or drop the field and re-enter terms by hand?
2 · Invoice milestone link — exact shape: fields on Invoice
    {event, pct, shipmentId?} vs a separate join row?
    G4's milestone_already_invoiced dedup depends on this.
3 · Payment as a persisted entity: decision 11 only says
    "pull payment status → invoice paid/overdue". A Payment
    record is a proposed elaboration needing sign-off.
4 · Cron cadences (hourly / nightly / 5-min retry) are
    proposed in the crons panel, not decided.
5 · G5 qty tolerance: global setting, per-product, or
    per-PO-line? The check is decided; where the tolerance
    number lives is not.
6 · G2 material_short: does a "covering PO" need to be
    sent/acknowledged, or does a draft PO count?
7 · ETO waiver shape: fields on the engineering Job vs a
    separate Waiver record (who/why is required either way).
```

---

## PASTE BLOCK 12 — Code remediation stickies (one sticky each; Cross-cutting gray; pin bottom-right)

```
REDRAW JourneyStepper to the 7-stage spine
Quote → SO → Job → MO → WOs → Shipment → Invoice
(today it renders 10 stages incl. bom/mrp/schedule — those are
spokes under Job, not stages)
apps/web/src/components/workflow/JourneyStepper.tsx
+ JourneyStage union in apps/web/src/types/entities.ts
+ stepper page
```

```
REWORK confirmSalesOrder: ONE Job per SO (today: one per line);
manufactured lines become MOs carrying salesOrderLineId;
PERSIST the line links (today perLine is returned transiently
and thrown away)
apps/web/src/services/workflowService.ts
```

```
REMOVE the deltaJob path in approveVariation — VO amends the
live Job's BoM/MOs in place, keeps completed WOs, stores an
immutable baseline snapshot, re-fires MRP + schedule
apps/web/src/services/workflowService.ts
```

```
STRENGTHEN evaluatePlanToMake — add routing_missing and
material_short checks (see card G2)
apps/web/src/services/workflowService.ts
```

```
REPLACE evaluateShipToBook with evaluateInvoiceMilestone(so,
milestone) — milestone-aware, per card G4 (update __test export)
apps/web/src/services/workflowService.ts
```

```
BUILD evaluateGateReceiving — does not exist despite ADR-006
claiming it does (see card G5)
apps/web/src/services/workflowService.ts (new function)
+ correct docs/audits/adr/ADR-006-workflow-archetype-service.md
```

```
RENAME catalogue_sale → stock_sale; DROP make_to_stock from
ProductRoute (apps/web/src/types/entities.ts:192) + every usage
(confirmSalesOrder route switch, evaluateSoToJob, fixtures)
```

```
DROP QualityCheck.ncrId; ADD disposition + qty + costImpact +
links (see QualityCheck chips)
apps/web/src/types/entities.ts (QualityCheck interface)
```

```
REWORK publishBomToProductionJob — RENAME to publishBom;
gate it on evaluateBomPublish; publishing creates MOs UNDER
THE PARENT JOB (the old sibling "production Job" pattern is gone)
+ FIX stale JSDoc in apps/web/src/types/entities.ts — the
Job.source 'engineering' and Job.parentJobId comments still
describe the old sibling production-Job pattern
apps/web/src/services/workflowService.ts
```

```
RELABEL board band "QC / NCRs" → "QC" (no NCR entity exists —
QC owns disposition). Board edit, not code.
```

```
SCOPE: Supplier RFQ is deferred post-MVP (decision 13) —
badge the BuyRFQs page "post-MVP" on the board and build NO
RFQ backend in MVP. Stocktake + minimal RMA are IN scope
(see StockMovement chips + New entities chips).
apps/web/src/components/buy/BuyRFQs.tsx (badge only)
```

---

## Change log vs old board

- "Gate: Reorder Trigger (runReorderMonitor())" — **moved** to the Background crons panel; it creates work, it doesn't block a transition (decision 4).
- "Gate: Plan → Make (evaluatePlanToMake(job))" — **kept** as card G2, strengthened with routing_missing + material_short.
- Off-frame gate cards (SO→Job, Make→Ship, Ship→Book) — **kept** as G1/G3; Ship→Book **renamed** G4 evaluateInvoiceMilestone (milestone-aware, decision 5; the already-invoiced check is scoped per shipment for dispatch/delivery events).
- G5 Receiving — **added** (promised in ADR-006, never on the board or in code); absorbs the control that Goods Receipt used to imply as a spine stage (GR itself is removed from the spine per decision 1 — handled in the spine section, noted on G5).
- Chip `runReorderMonitor() · cron` — **moved** to the crons panel.
- Chip `jobs.source = "replenishment"` — **kept** (Job chip group, with the Stock pseudo-customer note; pseudo-customer applies to replenishment Jobs only — engineering/variation Jobs keep the real customer, resolved 2026-06-11).
- Supplier RFQ — **added** as an explicit out-of-scope sticky (decision 13): BuyRFQs page badged post-MVP, no RFQ backend in MVP.
- Chip `MrpSuggestion · qtyShort · prefe…` — **kept** in the "Unchanged" group but **renamed/corrected**: the old truncated label expanded to field names that don't exist on MrpSuggestion; the real fields are shortfall + suggestedSupplierId/Name (qtyShort belongs to MaterialDemand; preferredSupplierId/Name to the legacy ReorderRule).
- Chips `BoM.components · isPhantom`, `WorkCentre.capacityHoursPerD…`, `MO.workOrders · Operation.isSu…`, `WorkOrder · Time…` — **kept** in the "Unchanged — keep as-is" group (WorkOrder chip now also names reworkDepth, which was already in code).
- Board band "QC / NCRs" — **renamed** "QC" (decision 9: no NCR entity).
- Old two-Job ETO pattern implied by the gates/fields area (engineering Job → sibling production Job) — **removed**; engineering Jobs are children via parentJobId, BoM publish creates MOs under the parent (decision 7). The parentJobId field is kept but its link direction inverts — flagged [changed], plus a remediation sticky for the stale entities.ts JSDoc.