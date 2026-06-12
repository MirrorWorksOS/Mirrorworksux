# PASTE BLOCKS — "Workflow archetypes — quick reference" frame (full replacement)

---

## PASTE BLOCK 1 — Frame title

0d. Workflow archetypes — quick reference

---

## PASTE BLOCK 2 — Frame intro (text panel, top of frame, 3 lines)

Nine flows in four groups: 3 order ROUTES + 1 background TRIGGER + 3 in-flight DEVIATIONS + 2 stock-truth flows added for MVP.
Routes (MTO / Stock Sale / ETO) are an enum chosen per Sales Order line at confirm: route = 'mto' | 'stock_sale' | 'eto'.
Deviations (Variation Order / Rework / Subcontract) are EVENTS that can strike any in-flight order — they are not routes and never appear in the route enum.

---

## PASTE BLOCK 3 — Glossary (small text panel, frame edge)

JARGON DECODER (plain English)
SO — Sales Order: the customer's confirmed order
MO — Manufacturing Order: the instruction to make a quantity of ONE product (the scheduling unit)
WO — Work Order: one step of shop-floor work (cut, fold, weld, paint)
BoM — Bill of Materials: the parts list / recipe for a product
MRP — Material Requirements Planning: the calc comparing what's needed vs on hand; suggests buys or makes
Routing — the ordered list of WO steps a product goes through
GR — Goods Receipt: recording that purchased goods physically arrived
FG — Finished Goods: completed products sitting in stock
PO — Purchase Order: our order to a supplier
QC — Quality Check: an inspection with a recorded result
NCR — Non-Conformance Report: legacy quality paperwork; this system has NO NCR entity — the decision is recorded on the QC check instead
VO — Variation Order: a customer-driven change to an in-flight order
RMA — Return Merchandise Authorisation: the paperwork for a customer return
SKU — a standard stocked product code
free-issue — we send OUR material to a subcontractor; it stays on our books, parked at their site
concession — recorded approval (named approver) to accept something off-spec or short
backorder — the unfilled remainder of an order line, queued to ship later
reservation — a hold linking specific stock to a specific order line
WIP — Work In Progress: cost tied up in partly-built jobs
COGS — Cost of Goods Sold: cost recognised only when the sale happens
AP — Accounts Payable: bills we owe suppliers
P&L — profit and loss
Xero — the external accounting system of record (the general ledger lives there)
Credit Note — a negative invoice that reduces what a customer owes
MVP — minimum viable product: the first shippable version
Stock pseudo-customer — an internal "customer" record used by replenishment Jobs (no real customer exists for them), so every Job stays customer-scoped; engineering and variation Jobs keep the real customer they spawned from
cron — a scheduled background task, not a user action

---

## PASTE BLOCK 4 — Group A header (sticky)

GROUP A — ORDER ROUTES
Decided per SO line at confirm. The line's route enum: mto | stock_sale | eto.

---

## PASTE BLOCK 5 — Archetype card 1 · MTO

Styling note (do NOT paste this line): line 2 (the scenario sentence) = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

1 · MTO — MAKE-TO-ORDER (the default)
Alliance Metal orders 40 custom balustrade panels — we fabricate to their spec, then ship.
Quote → SO confirm (gate G1) → ONE Job for the whole SO → one MO per manufactured line (MO carries salesOrderLineId) → BoM → MRP (Buy branch covers shortages) → schedule → MOs released (gate G2) → WOs to the floor → fabricate + QC → dispatch (gate G3) → invoice per terms milestone (gate G4)
One Job per SO — never one per line; each manufactured line gets its own MO under that Job. Gate G2 fires on MO release, NOT on WO release; material availability is separately a precondition on WO start (that's where the Buy branch rejoins). The tail is "invoice per terms milestone": the customer's payment-term milestone schedule decides when and how much (e.g. 50% on order confirm, 50% on completion) — never assume a single invoice at dispatch.
Rule of thumb (typical fab shop; not a verified stat): ~60–70% of revenue. When in doubt, a line is MTO.

---

## PASTE BLOCK 6 — Archetype card 2 · Stock Sale

Styling note (do NOT paste this line): line 2 = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

2 · STOCK SALE (was "Catalogue sale" — enum value stock_sale)
Customer orders standard brackets we already hold on the shelf — nothing to fabricate.
SO confirm → reserve stock → allocate: full → pick · partial OK → ship available + backorder remainder · partial not OK → hold → pick → pack → dispatch → invoice per terms milestone
No Job at all for a pure stock-sale order. Partial shipment is allowed by default (allowPartialFulfilment on the SO, defaulted from the customer); the unfilled remainder becomes backorder qty on the line, and the product's shortageBehaviour decides the fill — manufactured → replenishment Job earmarked to the SO line via a reservation; purchased → MRP suggestion / auto-PO; wait → visible backorder queue for a human. When the goods arrive (GR, or put-away to FG), the reservation auto-fires the second pick list.
Rule of thumb (typical fab shop; not a verified stat): ~15–20% of revenue. High frequency, low value per order.

---

## PASTE BLOCK 7 — Archetype card 3 · ETO

Styling note (do NOT paste this line): line 2 = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

3 · ETO — ENGINEER-TO-ORDER
Customer wants something never built before — engineering designs it, the customer signs off the drawings, then we make it.
SO confirm (gate G1) → engineering Job (child via parentJobId) → design → drawings to customer portal (MirrorView 3D markups) → approved | revision_requested (loop back) → BoM publish (gated on approval, or recorded waiver) → MOs created under the PARENT Job → rejoins the MTO flow at MRP
Engineering Job state machine: in_design → submitted_for_approval → approved | revision_requested. The engineering Job keeps the REAL customer — it spawned from their order (the Stock pseudo-customer is for replenishment Jobs only). BoM publish — and therefore MO creation — is blocked until the customer approves, with an internal waiver path (who + why recorded). There is NO separate production Job: publishing the approved BoM creates MOs directly under the parent Job (the old two-Job pattern is gone).
Rule of thumb (typical fab shop; not a verified stat): ~10–20% of revenue but the biggest jobs by value. Low frequency, long lead, highest margin risk.

---

## PASTE BLOCK 8 — Group B header (sticky)

GROUP B — BACKGROUND TRIGGER
No customer order starts this. The trigger is a cron — not a gate, not a route.

---

## PASTE BLOCK 9 — Archetype card 4 · MTS Replenishment

Styling note (do NOT paste this line): line 2 = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

4 · MTS REPLENISHMENT (make-to-stock)
Nobody ordered anything — a standard SKU dipped below its reorder point, so the system makes more.
reorder monitor (cron) trips reorder point → replenishment Job (customer = Stock pseudo-customer) → BoM → MRP → schedule → produce (MO → WOs) → put away to FG — NOT dispatched
The Job's customer is the Stock pseudo-customer — never "no customer" — so it appears in every customer-scoped list under "Stock". The flow ends in the warehouse, not at a dock door. Money note: cost accrues to WIP/stock on completion; COGS is recognised only when the stock later sells via a Stock Sale.
Rule of thumb (typical fab shop; not a verified stat): a weekly rhythm at most shops. Earns zero revenue directly — it exists so route 2 can say yes.

---

## PASTE BLOCK 10 — Group C header (sticky)

GROUP C — IN-FLIGHT DEVIATIONS
Events that can strike ANY in-flight order, whatever its route. Never values in the route enum.

---

## PASTE BLOCK 11 — Archetype card 5 · Variation Order

Styling note (do NOT paste this line): line 2 = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

5 · VARIATION ORDER (VO)
Mid-job, the customer changes the spec — 40 panels become 48 and the powder coat goes from grey to black.
VO raised on in-flight order → immutable baseline snapshot (Job / MO / cost state at raise) → approval → amend the LIVE Job in place (BoM + MOs updated, completed WOs preserved) → MRP + schedule re-fired for changed MOs → costDelta adjusts remaining uninvoiced milestones
Amend in place — there is no separate "delta Job". The baseline snapshot is what makes before/after variance reporting possible. If a descope cuts more than the uninvoiced remainder, raise a Credit Note (new entity, Xero-synced like an invoice).
Rule of thumb (typical fab shop; not a verified stat): strikes roughly 1 in 4 custom jobs — the #1 source of margin leakage when untracked.

---

## PASTE BLOCK 12 — Archetype card 6 · Rework

Styling note (do NOT paste this line): line 2 = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

6 · REWORK (QC FAIL)
An inspection fails — a weld is out of spec on 6 of 40 panels, and someone must decide what happens to the bad parts.
WO inspection fails → disposition recorded on the QualityCheck → rework path: child WO (parentWorkOrderId) → re-inspect → rejoin flow
Four exits, all recorded as the disposition ON the QC check — there is NO NCR entity (see glossary):
• rework → child WO linked via parentWorkOrderId; depth cap 2 — a third failure escalates to a lead for a concession-or-scrap call
• scrap → cost STAYS on the Job (never leaves its P&L); batch flipped to consumed/quarantine; forced remake-or-ship-short prompt → shortfall MO (re-fires MRP) or ship short via concession
• use-as-is → concession with a named, recorded approver
• return-to-vendor → supplier return linked to the original GR + debit against the supplier's Bill
Rule of thumb (typical fab shop; not a verified stat): a few % of WOs at a healthy shop. Cheap caught at the WO; brutal caught at dispatch.

---

## PASTE BLOCK 13 — Archetype card 7 · Subcontract

Styling note (do NOT paste this line): line 2 = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

7 · SUBCONTRACT / OUTWORK
One routing step is done by an outside specialist — panels go out for galvanising and come back.
routing op flagged isSubcontracted → PO always raised → branch: free_issue (outbound dispatch; our stock parked at supplier via sub_out / sub_in movements) | sub_supplied (PO only — supplier provides material, no outbound leg) | hybrid (mix of both — some material free-issued, some supplier-provided) → supplier processes → return = GR against that PO through Receiving gate G5 + QC on return → WO chain resumes → subcontract cost rolls up to the Job
The PO is the anchor — the AP bill and the Receiving gate both hang off it, even when material is free-issue. materialModel has exactly 3 values: free_issue | sub_supplied | hybrid. Lifecycle is exactly 4 states: released → at_supplier → received → closed (subcontract_in_transit / returning are dropped).
Rule of thumb (typical fab shop; not a verified stat): most shops outsource finishing (galvanising, powder coat, anodising) — touches roughly 1 in 3 jobs.

---

## PASTE BLOCK 14 — Group D header (sticky)

GROUP D — STOCK-TRUTH FLOWS (added for MVP — decision 13)
Neither routes nor deviations: they keep the stock numbers and the returns path honest.

---

## PASTE BLOCK 15 — Archetype card 8 · Stocktake

Styling note (do NOT paste this line): line 2 = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

8 · STOCKTAKE / STOCK ADJUSTMENT
The system says 120 brackets; the shelf says 114 — fix the book and record why.
count sheet generated → physical count → counted vs system compared → adjustment StockMovement (reason: adjust + who + note)
Every other flow trusts the book quantity — reservations, MRP, and reorder points all read it — so the correction must be an auditable StockMovement, never a silent edit.
Rule of thumb (typical fab shop; not a verified stat): cycle counts monthly/quarterly plus an annual full count. Small flow — mandatory MVP scope (decision 13).

---

## PASTE BLOCK 16 — Archetype card 9 · Minimal RMA

Styling note (do NOT paste this line): line 2 = bold; line 3 (the arrow flow string) = green flow style; everything else = default dark text.

9 · MINIMAL RMA (CUSTOMER RETURN)
A customer sends goods back — damaged in transit, wrong item, or out of spec.
return receipt → QC check → disposition: restock | rework Job | scrap → credit note when owed
Deliberately minimal: it reuses the QC disposition machinery from card 6 instead of inventing a parallel returns model. The existing ShipReturns page gets this real flow.
Rule of thumb (typical fab shop; not a verified stat): ~1–2% of shipments — rare but non-negotiable for credibility. MVP scope (decision 13).

---

## PASTE BLOCK 17 — Layout notes (board note for whoever pastes — not customer-facing)

• Green "flow string" convention: each card block above carries a styling note (which is NOT pasted) — the scenario sentence is set bold, the arrow flow string is set in the green flow style, and the rest of the card is default dark text. The paste text itself contains no styling markers.
• Suggested header colours: Group A sticky = Sell blue, Group B = Inventory teal, Group C = Cross-cutting gray outline (deviations span modules; Rework may carry a Quality red/pink dot, Subcontract a Buy green dot), Group D = Inventory teal.
• Any card, chip, or label placed on or overlapping the amber/yellow Job-spine band must use dark text — never white (hard rule).
• Gate badges: G1–G4 appear inline in the MTO string; G1 also appears on the ETO string (an ETO line's SO confirm fires G1 too); G5 in Subcontract. Gates apply per their definitions on EVERY route — badges are placed sparingly to avoid duplication. The full gate definitions live in the separate gates panel — don't duplicate them here.
• Trigger-point reminder for the backend reader: G2 hangs on MO release (evaluatePlanToMake), not WO release.

---

## Change log vs old board (archetypes text frame)

Numbering: "old N" = the archetype's position in the OLD board's archetypes frame; "card N" = its position in this NEW frame. The two differ for MTS and ETO.

• old 1 (MTO) → card 1 — kept (Group A). Flow string updated: one Job per SO (not per line), one MO per manufactured line carrying salesOrderLineId, G2 badge placed on MO release (not WO release), tail changed to "invoice per terms milestone".
• old 2 (Catalogue sale) → card 2 — renamed Stock Sale (enum stock_sale). Flow rewritten: reserve → allocate (full / partial-OK / hold) → backorder via shortageBehaviour → arrival auto-fires second pick list via reservation. "No Job" rule kept.
• old 3 (MTS Replenishment) → card 4 — moved from the flat route list to Group B (background trigger, cron-driven). Old "no customer" wording removed — Jobs use the Stock pseudo-customer. Tail corrected to put-away-to-FG, not dispatch.
• old 4 (ETO) → card 3 — kept (Group A). Separate production Job removed — approved-BoM publish creates MOs under the parent Job. Customer drawing-approval gate (portal / MirrorView markups, approved | revision_requested loop, waiver path) added. Engineering Job keeps the real customer (pseudo-customer is replenishment-only, resolved 2026-06-11). G1 badge added at SO confirm.
• old 5 (Variation order) → card 5 — moved to Group C (deviation event, not a route). Delta-Job removed; baseline snapshot, milestone costDelta adjustment, and Credit Note added.
• old 6 (Rework) → card 6 — moved to Group C. NCR language removed (disposition lives on the QC check); expanded from one exit to four dispositions with consequences and the depth-2 cap.
• old 7 (Subcontract) → card 7 — moved to Group C. PO-always anchor and G5 Receiving-gate return added. All three materialModel branches kept: free_issue / sub_supplied / hybrid. Lifecycle slimmed from 6 states to 4 (subcontract_in_transit, returning dropped).
• make_to_stock as a line route — removed (stocked products resolve to stock_sale at order time; MTS survives only as the Group B trigger).
• variation / rework / subcontract as ProductRoute enum values (per stale workflow.md) — removed from the route enum; they are events, not routes.
• card 8 (Stocktake / stock adjustment) — added, new in this frame (decision 13).
• card 9 (Minimal RMA) — added, new in this frame (decision 13; reuses QC disposition machinery).