# FRAME 0a — REPLACEMENT CONTENT (paste blocks)

All text below is plain text for FigJam. Block headings name the element to create; everything after the heading is the exact paste text. One exception: the final block is a REGENERATION SOURCE (generator input), not board content.

---

## PASTE BLOCK 1 — Frame title

0a. Job Lifecycle — Flat (Spine View)

---

## PASTE BLOCK 2 — Frame caption (text panel, top-left, under the title)

How to read this: the amber spine is the document handoff chain — 7 documents, each one created from the one before it, left to right. Diamonds are validation gates: checks that must pass for work to advance past that point. Each gate fires on a specific event — G1 on SO confirm, G2 on MO release, G3 on dispatch, G4 on invoice raise, G5 on GR accept (full check detail lives in the Gates panel, frame 0b). Everything hanging off the spine on dashed lines is a spoke (a record created alongside that stage, not a stage itself); the green Buy branch below runs in parallel and only fires when material is short.

---

## PASTE BLOCK 3 — Glossary panel (text panel, top-right of frame, gray outline / cross-cutting style)

GLOSSARY — first-time terms on this frame
SO — Sales Order: the customer's confirmed order.
Job — internal folder for one SO's manufactured work.
MO — Manufacturing Order: instruction to make one product line (what, how many, by when).
WO — Work Order: one shop-floor step of an MO (cut, fold, weld, paint…).
BoM — Bill of Materials: the parts list for a product.
MRP — Material Requirements Planning: the calc that compares what a Job needs vs what's in stock or on order.
PO — Purchase Order: formal order sent to a supplier.
GR — Goods Receipt: checking purchased goods in at the door.
QC — Quality Control: inspection of finished work.
VO — Variation Order: customer changes an in-flight order.
PoD — Proof of Delivery: signed evidence the customer received the goods.
WIP — Work in Progress: value of partly-finished work.
AR / AP — Accounts Receivable (money owed to us) / Accounts Payable (money we owe).
GL — General Ledger: the company's official books (lives in Xero, not MirrorWorks).
MTO — Make to Order. ETO — Engineer to Order (design it first). Stock Sale — ship it from the shelf.
Routing — the ordered list of shop-floor steps an MO follows (cut → fold → weld …).
Order route — the per-line fulfilment path picked at SO confirm: MTO, Stock Sale, or ETO. Not the same thing as Routing.
NCR — Non-Conformance Report: defect paperwork in older systems. MirrorWorks has no NCR entity — QC handles disposition directly.
GST — Goods and Services Tax (sales tax). Tax-code authority lives in Xero.
Batch / Lot — a tracked batch of material with its mill certificate (heat number). Quarantine = held aside, unusable, pending a QC decision.
Phantom BoM (isPhantom) — a BoM level that is never stocked as its own part; MRP explodes straight through it to its components.
FG — Finished Goods: completed stock on the shelf, ready to sell.

---

## PASTE BLOCK 4 — Spine node labels (7 nodes, left to right, solid amber spine connectors; node fill = module colour; DARK TEXT on the yellow/amber ones)

Node 1 — QUOTE  [SELL — blue]
Priced offer sent to the customer. Nothing is committed yet.

Node 2 — SALES ORDER  [SELL — blue]
The customer said yes. The confirmed commercial agreement: what, how many, when, at what price.

Node 3 — JOB  [PLAN — purple]
Internal folder for this Sales Order's manufactured work. Planning, costs, and documents all hang off it.
→ Attached callout (amber sticky, DARK text): "PLAN — spine anchor. One Job per Sales Order, covering only its manufactured lines. Pure stock-sale orders get no Job at all."

Node 4 — MANUFACTURING ORDER (MO)  [MAKE — yellow, DARK text]
The instruction to make one product line: this product, this qty, by this date. One MO per manufactured SO line. The scheduling unit.

Node 5 — WORK ORDERS (WO)  [MAKE — yellow, DARK text]
One WO per shop-floor step of an MO (cut, fold, weld, paint). Operators clock time against these.

Node 6 — SHIPMENT  [SHIP — orange]
Goods physically leave: picked, packed, dispatched to the customer.

Node 7 — INVOICE  [BOOK — gray]
The bill. Raised per payment-term milestone event — dispatch/delivery milestones raise ONE invoice PER SHIPMENT, pro-rated to the shipped lines; completion fires once when all lines have shipped. Pushed to Xero.

---

## PASTE BLOCK 4a — ETO cross-reference callout (small purple sticky pinned near the Job node / BoM spoke)

ETO lines: each spawns a child engineering Job under this Job (linked via parentJobId), rejoining the parent at MRP. BoM publish — and therefore MO creation — is gated on customer drawing approval (internal waiver path, who/why recorded). Full detail: ETO frame.

---

## PASTE BLOCK 5 — Gate diamonds (5 diamonds; gray-outline cross-cutting style, dark text; G1–G4 sit ON the spine between nodes, G5 sits on the Buy branch; each diamond gets a small "fires on" subtitle)

G1 — SO → Job  (between Sales Order and Job)
Fires on: SO confirm.
SO confirmed · all line products exist and are active · BoM exists for MTO lines.

G2 — Plan → Make  (between Job and Manufacturing Order)
Fires on: MO release — when MOs are released to the floor (the MOs already exist by then).
Start/due dates set · at least one MO · every MO has a routing · material status OK (shortage without a covering PO blocks).

G3 — Make → Ship  (between Work Orders and Shipment)
Fires on: dispatch — the Shipment record already exists through pick/pack.
All WOs complete · all QC decisions final · no open rework chains.

G4 — Ship → Book  (between Shipment and Invoice)
Fires on: invoice raise.
Milestone-aware: the customer's payment-term milestone event has occurred (order confirmed / dispatch / delivery / completion). The customer's milestone schedule sums to 100%.

G5 — Receiving  (ON the Goods Receipt node, inside the Buy branch — NOT on the spine)
Fires on: GR accept.
GR matches the PO line · qty within tolerance.

Small footnote sticky next to G5: "Full gate detail, fail behaviour, and function names live in the Gates panel (frame 0b). Reorder Trigger is NOT a gate — it's a cron; see the Background crons panel."

---

## PASTE BLOCK 6 — Green flow string (happy path overlay along the spine)

[green flow text] Quote → Sales Order → (G1) → Job → (G2) → Manufacturing Order → Work Orders → (G3) → Shipment → (G4) → Invoice

---

## PASTE BLOCK 7 — Buy parallel branch (green nodes, hangs off the MRP spoke under Job, runs left→right below the below-band, rejoins with a dashed arrow into Work Orders)

Branch banner (green, bold):
BUY BRANCH — runs in parallel, only when material is short

Branch entry label (on the solid green connector dropping from the purple MRP spoke):
shortage fires the Buy branch

Branch node B1 — PURCHASE REQUISITION  [BUY — green]
Internal "we need to buy X" request.

Branch node B2 — APPROVAL  [BUY — green]
The spend is signed off before a PO is raised.

Branch node B3 — PURCHASE ORDER (PO)  [BUY — green]
The formal order sent to the supplier.

Branch node B4 — GOODS RECEIPT (GR)  ◇ G5  [BUY — green]
Goods arrive and are checked in at the door. Gate G5 verifies them against the PO when the GR is accepted.

Branch exit label (on the dashed rejoin arrow into Work Orders):
material available → precondition for Work Order start

Money annotation sticky on B3/B4 (see Block 11):
Vendor → AP — bill pushed to Xero, paid in Xero.

---

## PASTE BLOCK 8 — Above-band spokes (cross-cutting / accounting; dashed connectors up from each spine node)

Above QUOTE:
• Customer / Prospect  [Cross-cutting — gray outline] — who we're selling to (CRM record).
• Customer enquiry  [Sell — blue] — the inbound request that triggered the quote.

Above SALES ORDER:
• Order Acknowledgement  [Sell — blue] — confirmation document emailed back to the customer.

Above JOB:
• Job events / audit  [Cross-cutting — gray outline] — timestamped log of everything that happens to the Job.

Above MANUFACTURING ORDER + WORK ORDERS (single spoke spanning both):
• WIP cost accrual  [Book — gray] — value of partly-finished work building up as labour + material are logged.
  Annotation: internal report only — no GL posting. Stays in MirrorWorks.

Above WORK ORDERS:
• QC  [Quality — red/pink] — inspection on completed work; a fail routes to disposition (rework / scrap / use-as-is / return-to-vendor).
  (Band is named "QC" — there is no NCR (non-conformance report) entity.)

Above SHIPMENT:
• Delivery + PoD  [Ship — orange] — delivery confirmation and Proof of Delivery capture.

Above INVOICE:
• AR → GL · Cash receipt  [Book — gray]
  Annotation: Invoice + credit notes — pushed to Xero. Cash receipt — Xero, pulled (payment status flows back as paid / overdue). Xero is the ledger of record.

---

## PASTE BLOCK 9 — Below-band spokes (operational; dashed connectors down from each spine node)

Below SALES ORDER:
• Per-line order route: MTO · Stock Sale · ETO  [Sell — blue]
  One route chosen per SO line at confirm. ("Order route" is not "Routing" — Routing is the shop-floor step sequence, see below Job. VO is not a route either — it's a deviation, see callouts.)

Below JOB (fan of 6 spokes):
• BoM  [Plan — purple] — parts list snapshot for the Job. (ETO: publish gated on customer drawing approval — see callout by the Job node.)
• Routing  [Plan — purple] — the sequence of shop-floor steps each MO will follow.
• Schedule snapshot  [Plan — purple] — planned dates locked in at release.
• Reservations  [Inventory — teal] — stock earmarked to this Job's lines.
• Documents · Drawings  [Cross-cutting — gray outline] — attached files, drawings, 3D models.
• MRP  [Plan — purple] — the shortage calc. ← the Buy branch hangs off THIS spoke.

Below MANUFACTURING ORDER:
• Material Consumption  [Inventory — teal] — stock issued and used up as the MO runs.
• Subcontract PO (if outsourced)  [Buy — green] — see Subcontract deviation callout.

Below WORK ORDERS:
• Time Entries (labour)  [Make — yellow, DARK text] — operator hours clocked per WO.
• Operator · Machine  [Make — yellow, DARK text] — who and what did the work.
• Rework chain  [Quality — red/pink] — child WOs spawned by QC fails (parent → child, depth cap 2).

Below SHIPMENT:
• Pick · Pack · Dispatch  [Ship — orange] — the three warehouse steps inside the Shipment stage.

Below INVOICE:
• Cost roll-up  [Book — gray] — actual job cost totalled from labour + material + subcontract.
  Annotation: internal only — feeds Job profitability reporting, never posted to the GL.
• Xero sync  [Book — gray] — push: AR invoices, credit notes, AP bills. Pull: payment status, contacts.

---

## PASTE BLOCK 10 — Deviation attach points (3 small callouts, red/pink dashed connectors striking the spine; lightning-bolt or flag stickies, NOT spine nodes)

Callout D1 — VARIATION ORDER (VO) — deviation, not a stage
Strikes at: Sales Order / Job.
Customer changes an in-flight order. Amends the live Job in place (snapshot kept for variance); cost delta adjusts remaining uninvoiced milestones.

Callout D2 — REWORK — deviation, not a stage
Strikes at: Work Orders (via a QC fail).
A failed inspection spawns a child WO to redo the work. Depth cap 2, then escalation to a lead.

Callout D3 — SUBCONTRACT — deviation, not a stage
Strikes at: a routing operation (one step of an MO done by an outside supplier).
Always creates a PO; the work comes back as a Goods Receipt through gate G5 + a QC check on return.

---

## PASTE BLOCK 11 — Money-spoke ownership annotations (small gray tag stickies attached to the named spokes; these state which system owns the money event)

• AR invoices · credit notes — MirrorWorks raises, pushed to Xero (with account + tax codes; GST authority = Xero tax codes).
• Cash receipt — Xero, pulled (payment status → invoice paid / overdue).
• Vendor → AP — bill pushed to Xero, paid in Xero.  (attach to Buy branch PO/GR)
• WIP cost accrual — internal report only, no GL posting.
• Cost roll-up — internal only, never posted to the GL.
Rule of thumb: MirrorWorks = operational system. Xero = General Ledger of record. No GL journals in MVP.

---

## PASTE BLOCK 12 — Key / legend (replaces the old key)

KEY
■ Sell — blue
■ Plan — purple
■ Buy — green
■ Make — yellow (dark text always)
■ Ship — orange
■ Book — gray
■ Inventory — teal
■ Quality — red/pink
□ Cross-cutting — gray outline
━ Job spine — amber/yellow band, solid connectors (dark text always)
◇ Validation gate — checks that must pass for work to advance past that point; each fires on a named event (G1 SO confirm · G2 MO release · G3 dispatch · G4 invoice raise · G5 GR accept) — detail in the Gates panel, frame 0b
◉ Service badge — this spoke touches a backend service: CVX Convex · WOS WorkOS · R2 Cloudflare R2 · RSD Resend · XRO Xero · APS Autodesk; full inventory on the Architecture overlay frame (0c)
⚡ Deviation — attaches to an in-flight order; not a stage (VO · Rework · Subcontract)
┄ Dashed line — spoke (record created alongside a stage)
─ Solid amber line — spine handoff
─ Solid green line — Buy branch (parallel, conditional)
[green flow text] — happy path flow string

---

## PASTE BLOCK 13 — LAYOUT NOTES (sticky cluster for the rebuilder — not customer-facing, can sit outside the frame)

1. Spine: 7 nodes in one horizontal row, equal spacing, connected by SOLID amber connectors. The amber band behind them is decorative — every text element on it must be DARK text (brand rule: dark on yellow/amber, never white).
2. Gate diamonds G1–G4 sit ON the spine connectors: G1 between SO and Job, G2 between Job and MO, G3 between WO and Shipment, G4 between Shipment and Invoice. No diamond between Quote→SO or MO→WO. Diamonds are gray-outline with dark text. Each diamond carries its small "fires on" subtitle (G1 SO confirm · G2 MO release · G3 dispatch · G4 invoice raise · G5 GR accept) — the diamond's position marks where the check sits in the chain; the subtitle says when it actually runs.
3. Above band: one row above the spine. Dashed connectors from each spine node up to its spokes. WIP cost accrual spans MO+WO (one sticky, two dashed connectors).
4. Below band: one row below the spine, same dashed convention. The Job fan has 6 spokes — keep MRP rightmost so the Buy branch can drop from it cleanly.
5. Buy branch: a second row BELOW the below-band. Drops from the MRP spoke — solid green connector down, labelled "shortage fires the Buy branch" — then runs left→right (B1 Purchase Requisition → B2 Approval → B3 Purchase Order → B4 Goods Receipt, solid green connectors), then a DASHED green arrow rises from Goods Receipt back up into the Work Orders node, labelled "material available → precondition for Work Order start". The rejoin lands BEFORE Work Order start — visually, arrowhead on the left edge of the WO node. G5 diamond sits on the Goods Receipt node itself (fires on GR accept). There is NO separate "MRP shortage trigger" branch node — the purple MRP spoke + the labelled green drop connector carry that meaning.
6. Deviation callouts: small flag/lightning stickies floating just outside the bands, each with one dashed red/pink connector striking its attach point (D1 → SO/Job boundary, D2 → WO node, D3 → the Routing spoke under Job or the Subcontract PO spoke under MO — either anchor reads correctly; prefer the MO spoke).
7. Green flow string: overlay along the full spine, the board's existing convention for happy paths.
8. Money tags (Block 11): small gray tags pinned to the spokes they describe — not free-floating.
9. Glossary panel top-right; caption top-left under the title; key bottom-left.
10. Connector summary: solid amber = spine; solid green = Buy branch; dashed gray = spokes; dashed green = material-available rejoin; dashed red/pink = deviations.
11. ETO callout (Block 4a): pin the small purple sticky just below the Job node, beside the BoM spoke connector, so a reader tracing ETO from the order-route spoke can't miss it.
12. Service badges (decision 12): pin small ◉ badge chips to these spokes — XRO on "Xero sync", "AR → GL · Cash receipt", the "Vendor → AP" money tag, and "Customer / Prospect" (contacts sync); XRO + R2 on "Subcontract PO" (PO pushed as a bill; PO attachments in R2); R2 on "Documents · Drawings" and "Delivery + PoD" (PoD photo); RSD on "Order Acknowledgement" (emailed to the customer); CVX on "Pick · Pack · Dispatch" (real-time floor subscription); CVX + WOS on "Time Entries / Operator · Machine" (kiosk identity — team role). Badges are pointers only — the full services × spine-stage matrix, cron/webhook/bucket/email inventories live on the Architecture overlay frame (0c). This badge list is the canonical one; frame 0c's badge legend mirrors it exactly.

---

## REGENERATION SOURCE — Mermaid (NOT a FigJam paste block)

Input for a diagram generator only — pasting Mermaid into FigJam renders as inert plain text, not a diagram. Keep it outside the frame with the layout-notes cluster; not customer-facing. Kept consistent with Blocks 5, 7, and layout note 5.

flowchart LR
  Q[Quote] --> SO[Sales Order]
  SO --> G1{G1 SO to Job} --> J[Job]
  J --> G2{G2 Plan to Make} --> MO[Manufacturing Order]
  MO --> WO[Work Orders]
  WO --> G3{G3 Make to Ship} --> SH[Shipment]
  SH --> G4{G4 Ship to Book} --> INV[Invoice]
  J -. shortage fires the Buy branch .-> B1[Purchase Requisition]
  B1 --> B2[Approval] --> B3[Purchase Order] --> B4[Goods Receipt]
  B4 --> G5{G5 Receiving}
  G5 -. material available .-> WO
  %% On the board the branch drops from the MRP spoke under Job; J is the nearest anchor here.
  %% G5 is attached to the Goods Receipt node (fires on GR accept) — it is not a stage between PO and GR.

---

## Change log vs old board

• Quote, Sales Order, Job (spine anchor), Manufacturing Order, Work Orders, Shipment, Invoice — kept (spine, same order). Invoice node reworded to per-shipment milestone invoicing (decision 5).
• Goods Receipt — moved off the spine into the Buy branch, with new gate G5 on it, firing on GR accept (decisions 1, 4).
• Gate diamonds G1–G5 on this frame — new; old board showed gates as text chips elsewhere. Each diamond now carries its firing event (decision 4).
• "Gate: Reorder Trigger (runReorderMonitor())" — removed as a gate; it is a cron and moves to the Background crons panel (decision 4).
• "Gate: Plan → Make (evaluatePlanToMake(job))" text chip — replaced by the G2 diamond; function names move to the Gates panel, frame 0b (decision 4).
• Backend fields chips — split: the "runReorderMonitor() · cron" chip moves to the Background crons panel on frame 0b (decision 4); the six field-level chips (jobs.source = "replenishment"; BoM.components · isPhantom; MrpSuggestion · qtyShort; WorkCentre.capacityHoursPerD…; MO.workOrders · Operation.isSu…; WorkOrder · Time…) are explicitly removed from 0a and moved to frame 0b's Backend build sheet, where field-level schema detail lives. None remain on 0a; frame 0c (Architecture overlay) holds only the function/cron/webhook/bucket inventories, not field chips.
• Customer / Prospect — kept above Quote; gains an XRO badge (contacts sync, decision 12).
• Customer enquiry — moved from below-band to above Quote, grouped with Customer / Prospect.
• Order Acknowledgement — kept above SO; gains a Resend service badge (decision 12).
• Job events / audit — kept above Job.
• Vendor → AP — moved from the above-band to the Buy branch (its PO/GR left the spine), annotated "bill pushed, paid in Xero" + Xero badge (decisions 11, 12).
• WIP cost accrual — kept, new annotation "internal report only, no GL posting" (decision 11).
• QC / NCRs — renamed "QC"; NCR entity is gone, NCR now glossed for non-manufacturing readers (decision 9).
• Delivery + PoD — kept above Shipment; gains an R2 badge (PoD photo stored in R2, decision 12).
• AR → GL · Cash receipt — kept above Invoice, new Xero-ownership annotation + Xero badge (decisions 11, 12).
• Per-line routing decision (MTO · Stock · ETO · VO) — renamed "Per-line order route: MTO · Stock Sale · ETO": "routing decision" → "order route" (decision 3 vocabulary; avoids collision with shop-floor Routing), "Stock" → "Stock Sale" (decision 3), and VO removed from the route list — it is a deviation, now callout D1.
• BoM, Routing, Schedule snapshot, Reservations, Documents · Drawings — kept under Job; Documents · Drawings gains an R2 service badge (decision 12).
• MRP shortage trigger — not kept as a branch node: folded into the MRP spoke under Job (Plan — purple) plus the labelled green drop connector "shortage fires the Buy branch" (decision 1 defines the branch as exactly Requisition → Approval → PO → GR).
• Purchase Requisition, Approval, Purchase Order — moved into the labelled Buy parallel branch as B1–B3 (decision 1). Approval described neutrally — no approver role is decided yet.
• Material Consumption — kept under MO.
• Subcontract PO (if outsourced) — kept under MO; new deviation callout D3 cross-references it (decision 10).
• Time Entries (labour), Operator · Machine — kept under WO; gain CVX + WOS badges (kiosk identity — team role; decision 12).
• Rework chain (parent…) — kept under WO, now explicitly tied to QC-fail via callout D2 with the depth-cap-2 rule and lead escalation (decision 9).
• Pick · Pack · Dispatch — kept under Shipment; gains a CVX badge (real-time floor subscription, decision 12).
• Cost roll-up · WIP → COGS — renamed "Cost roll-up" with internal-only annotation; WIP → COGS is internal reporting only (decision 11).
• Xero sync — kept under Invoice, expanded with push/pull detail + Xero badge (decisions 11, 12).
• Key/legend — kept all 10 module entries; added gate diamond (with firing events), service badge, deviation marker, dashed-vs-solid connector entries, green flow string.
• Deviation callouts VO / Rework / Subcontract — new (decision 3: deviations are not routes or stages).
• ETO cross-reference callout — new (decisions 2, 7): child engineering Job via parentJobId rejoining at MRP; BoM publish gated on customer drawing approval. Detail lives on the ETO frame.
• Service badges on service-call spokes — new (decision 12); the full services × stage matrix stays on the Architecture overlay frame.