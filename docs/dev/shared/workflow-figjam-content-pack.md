# FigJam content pack — MirrorWorks Workflows board

Date: 2026-06-11
Ground truth: [workflow-decisions-2026-06-11.md](workflow-decisions-2026-06-11.md) — the 13 grill-me decisions plus assembly amendments. Where this pack and any older doc disagree, the decisions file wins.
Target board: `https://www.figma.com/board/sbb1GwGMG89qx88298UJiD/MirrorWorks---Workflows`

## How to use this pack

Each section below replaces one frame on the board. Content is organised as
PASTE BLOCKS: the block heading names the FigJam element to create (frame
title, text panel, sticky, node label); the text under it is pasted verbatim.
Styling/layout instructions are marked "do NOT paste". Every section ends with
a change log accounting for every old-board item (kept / moved / renamed /
removed) — nothing was dropped silently.

A generated reference diagram of the corrected spine (7 stages, 5 gates, Buy
branch) has already been inserted into the board canvas — drag it beside frame
0a while rebuilding.

## Frame map

| Frame | Replaces | Contents |
|---|---|---|
| 0a | "0a. Job Lifecycle — Flat (Spine View)" | 7-stage spine, gate diamonds G1–G5, Buy parallel branch, spokes, deviations, money annotations, key |
| 0b | "Validation gates" cards + "Backend fields" chips | 5 gate cards + BoM-publish check, Background crons panel, Backend build sheet (schema-delta chips), code remediation stickies, open questions |
| 0c | (new frame) | Architecture overlay: service × stage matrix, six service cards (Convex / WorkOS / R2 / Resend / Xero / APS), webhooks panel, badge legend |
| 0d | "Workflow archetypes — quick reference" | 9 cards in 4 groups: 3 routes + 1 trigger + 3 deviations + 2 stock-truth flows |

## Decisions still open (need Matt, not Sharjeel)

1. Requisition approval role — decide against the ARCH 00 access spec
   (admin / lead / team) before wiring approval enforcement.
2. `PaymentTerm.depositPct` migration — auto-convert to an `order_confirmed`
   milestone row, or drop and re-enter terms manually?
3. Invoice ↔ milestone link shape — fields on Invoice `{event, pct, shipmentId?}`
   vs a separate join row (G4's dedup check depends on it).
4. Payment as a persisted entity vs status-only pull from Xero.
5. Cron cadences (all proposed: hourly reorder monitor, nightly overdue
   flagger, 5-min VO re-fire retry, hourly Xero pull).
6. G5 qty tolerance — global, per-product, or per-PO-line?
7. G2 `material_short` — does a covering PO need to be sent/acknowledged, or
   does a draft count?
8. ETO waiver shape — fields on the engineering Job vs a separate record.
9. Xero payment status — webhook vs polling; contacts sync direction.
10. APS translation — keep 5-second polling in production or register a webhook?
11. New `Attachment.kind` names for DXF/CAD and Bill of Lading; extend
    `Attachment.entityType` with `job`.
12. Resend bounce handling; supplier-facing PO emails in/out of MVP.
13. Archetype frequency/revenue context lines are typical-fab estimates —
    eyeball against the old board's numbers before deleting it.

---
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

---

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

---

# Frame 0c — Architecture overlay (NEW — decision 12)

All blocks below are paste-ready plain text for FigJam. Block headings name the FigJam element; everything under the heading is the exact text to paste. This frame is "0c" — frame 0a's service badges point here.

---

## PASTE BLOCK 1 — Frame title

0c. ARCHITECTURE OVERLAY — where every backend service is used

## PASTE BLOCK 2 — Frame caption (text panel directly under the title)

MirrorWorks is the operational system; Xero is the ledger of record — money facts get pushed to Xero, payment status gets pulled back, and no general-ledger journals are written in MVP. Convex is both the database and the function runtime: every entity on this board becomes a Convex table; every gate and mutation becomes a Convex function. Today Convex serves only the MirrorView 3D pipeline (convex/aps.ts, convex/mirrorview.ts) — everything else on this board is a frontend mock awaiting this backend build.

## PASTE BLOCK 3 — Glossary (TEXT PANEL, not a sticky — too long for a sticky to stay readable; gray outline, pin top-right of frame)

JARGON DECODER (this frame)
SO = Sales Order — the customer's confirmed order
MO = Manufacturing Order — instruction to make one product line
WO = Work Order — one shop-floor step of an MO
BoM = Bill of Materials — the parts list / recipe for a product
MRP = Material Requirements Planning — computes what to buy or make, and when
GR = Goods Receipt — recording that supplier goods arrived
FG = Finished Goods — completed stock ready to ship
ETO / MTO = Engineer-to-Order (design first) / Make-to-Order (build on demand)
VO = Variation Order — customer-agreed change to an in-flight order
QC = Quality Check; concession = a recorded internal approval (named approver) to accept off-spec work or ship short — the customer contact is noted when the customer has agreed
free-issue = we send our own material to a subcontractor to work on
PO = Purchase Order — our order to a supplier; requisition = the internal request to buy, awaiting approval
DXF = a 2D CAD drawing file format
GST = Goods and Services Tax — tax-code authority lives in Xero
PoD = Proof of Delivery — signature or photo at handover
BoL = Bill of Lading — the carrier's transport document
RMA = authorised customer return
AR / AP = money owed to us / money we owe; GL = General Ledger (the accounting book of record, lives in Xero)
WIP / COGS = Work in Progress value / Cost of Goods Sold
cron = scheduled background task; webhook = an external service calling us when something happens
signed URL = time-limited private download link

## PASTE BLOCK 4 — [green flow text] "One order, every service" strip (green flow string across the top of the matrix)

Quote PDF to R2 → quote_sent via Resend → customer accepts in portal (WorkOS identity) → confirmSalesOrder in Convex (gate G1) → ETO drawings reviewed in MirrorView (APS) → materials bought, bill pushed to Xero → floor runs on Convex real-time → PoD photo to R2 → order_shipped via Resend → invoice raised at milestone (gate G4), pushed to Xero → payment status pulled from Xero → paid

## PASTE BLOCK 5 — SERVICE × STAGE MATRIX (build as a grid of stickies; "—" = service not involved at that stage)

[Layout instruction — do NOT paste: each "CVX:/WOS:/R2:/RSD:/XRO:/APS:" line below becomes its OWN sticky (one sticky per cell). The header strip becomes SIX SEPARATE header stickies — pipe-separated text pasted as one line will not form columns in FigJam.]

Column headers (six separate stickies, left to right):
STAGE · CONVEX (CVX) · WORKOS (WOS) · R2 · RESEND (RSD) · XERO (XRO) · APS/AUTODESK (APS)

ROW 1 — QUOTE (Sell blue)
CVX: quote record, accept mutation
WOS: portal accept identity
R2: quote PDF, signed quote
RSD: quote_sent, quote_accepted
XRO: —
APS: quote-stage 3D model

ROW 2 — SALES ORDER (Sell blue)
CVX: confirmSalesOrder + gate G1
WOS: —
R2: SO attachments
RSD: order_confirmed (acknowledgement)
XRO: contact exists / synced
APS: —

ROW 3 — JOB (spokes: BoM · MRP · Schedule) (Plan purple, on amber spine — dark text)
CVX: Job, BoM, MRP, schedule functions
WOS: waiver approval — role TBD (ARCH 00)
R2: drawings, DXF/CAD files
RSD: ETO approval request email
XRO: —
APS: drawing translation + markups

ROW 4 — MANUFACTURING ORDER (Make yellow — dark text)
CVX: publishBom creates MOs; gate G2
WOS: —
R2: —
RSD: —
XRO: —
APS: per-MO model views

ROW 5 — WORK ORDERS (Make yellow — dark text)
CVX: WO, QC, rework; real-time floor
WOS: kiosk identity (team role)
R2: markup images
RSD: —
XRO: —
APS: shop-floor step views

ROW 6 — SHIPMENT (Ship orange)
CVX: pick/pack/dispatch; gate G3
WOS: —
R2: delivery note, PoD photo, BoL
RSD: order_shipped
XRO: —
APS: —

ROW 7 — INVOICE (Book gray)
CVX: raiseInvoiceForMilestone; gate G4
WOS: —
R2: invoice PDF
RSD: invoice_issued, statement_sent
XRO: push invoice/credit note; pull payment
APS: —

ROW 8 — BUY BRANCH: Requisition → Approval → PO → GR (Buy green)
CVX: PO mutations, receiveGoods; gate G5
WOS: requisition approval — role TBD (ARCH 00)
R2: PO attachments
RSD: —
XRO: push AP bills
APS: —

ROW 9 — CUSTOMER PORTAL (Cross-cutting gray outline)
CVX: portal queries, approval mutations
WOS: portal identity + invitations
R2: signed-URL document downloads
RSD: invites, ETO + VO approval requests
XRO: —
APS: MirrorView review + markups

ROW 10 — BACKGROUND CRONS (Cross-cutting gray outline)
CVX: all four crons run here
WOS: —
R2: —
RSD: — (statement run is manual in MVP, not a cron)
XRO: payment-status pull (if polling)
APS: translation manifest poller (today)

## PASTE BLOCK 6 — SERVICE CARD: Convex (CVX)

CONVEX — database + function runtime
System of record for EVERY entity on this board (the whole entities.ts surface migrates into convex/schema.ts). All gate evaluators and workflow mutations become Convex functions. Today only MirrorView lives here (aps.ts, mirrorview.ts) — all ERP data is frontend mock (services/mock/data.ts).

MUTATION INVENTORY (from workflowService — names carry over unless noted):
• confirmSalesOrder — REWORK: one Job per SO covering manufactured lines only — none for pure stock-sale orders; ETO lines spawn child engineering Jobs (parentJobId); persist line→MO links (decision 2)
• explodeBom — BoM explosion to material demand
• pickPickList — consume reservations, write stock movements
• runReorderMonitor — cron, not a gate (decision 4)
• putAway — finished goods into FG location; arrival converts reservations → auto-fires the backorder pick list (decision 6)
• publishBom — RENAMED from publishBomToProductionJob; creates MOs under the parent Job, no separate production Job (decision 7)
• createVariation / approveVariation — deltaJob path REMOVED; amends live Job (decision 8)
• recordQualityCheck — gains disposition, qty, costImpact (decision 9)
• createReworkWorkOrder — depth cap 2, then escalate
• recordConcession
• releaseSubcontract / receiveSubcontract — return goes through gate G5 (decision 10)
NEW (no mock equivalent yet):
• receiveGoods — gate G5 receiving; arrival converts reservations → auto-fires the backorder pick list (decision 6)
• raiseInvoiceForMilestone — gate G4, milestone-aware (decision 5)
• raiseCreditNote — new entity, Xero-synced (decision 8)
• createReturn — minimal RMA (decision 13)
• recordStockAdjustment — stocktake correction (decision 13)

GATE EVALUATORS (queries; UI shows failures via GateBanner):
• G1 evaluateSoToJob • G2 evaluatePlanToMake (ADD routing + material checks — missing today) • G3 evaluateMakeToShip • G4 evaluateInvoiceMilestone (REPLACES evaluateShipToBook) • G5 evaluateGateReceiving (BUILD — in docs, not in code) • evaluateBomPublish (ETO drawing approval, decision 7 — a publish-time check, NOT a spine gate)

CRONS (the four from decision 4):
1. Reorder monitor 2. Overdue-invoice flagger 3. Schedule re-fire after VO approval 4. Xero payment-status pull

REAL-TIME SUBSCRIPTIONS: floor/kiosk screens (work queue, current step, exceptions), gate banners, MirrorView markups (already live).

## PASTE BLOCK 7 — SERVICE CARD: WorkOS (WOS)

WORKOS — identity
• Authentication + SSO for all internal users.
• Exactly three roles: admin, lead, team. Role is resolved at login; Convex functions enforce it. Requisition / waiver / concession approvals are role-gated — approval role TBD, decide against the ARCH 00 access spec before building.
• Customer portal identity: portal contacts sign in via WorkOS; the PortalInvitation flow (14-day expiry) provisions them — invite email itself goes out via Resend.
• WorkOS holds WHO you are; Convex holds WHAT you may touch.

## PASTE BLOCK 8 — SERVICE CARD: Cloudflare R2 (R2)

R2 — every binary
• No file bytes in Convex. Every PDF, photo, and CAD file lives in R2, served by signed URLs minted on demand.
• The Attachment entity IS the R2 index: one Convex row per object (entityType, entityId, kind, filename, sizeBytes, customerVisible).
• Suggested key convention: attachments/{entityType}/{entityId}/{kind}-{ts}
  e.g. attachments/invoice/inv-0042/invoice_pdf-1718064000.pdf
• Binary kinds: quote PDFs (quote_pdf) · signed quotes (signed_quote) · invoice PDFs (invoice_pdf) · delivery notes (delivery_note) · PoD photos (proof_of_delivery) · markup images (markup_image) · DXF/CAD files (NEW kind needed) · BoL (NEW kind needed). Extend Attachment.kind for the last two — don't dump them in 'other'.
• ALSO extend Attachment.entityType with job (and mo / work_order if drawings attach there) — today entityType is quote | sales_order | invoice | shipment | markup | purchase_order, with no job member, so Job-stage binaries (drawings, DXF/CAD) currently have nowhere to index.
• Already live: convex/aps.ts archiveToR2 parks MirrorView CAD source files in R2 after translation.

## PASTE BLOCK 9 — SERVICE CARD: Resend (RSD)

RESEND — outbound email
Six NotificationTemplate kinds (each togglable; placeholders {{customer}}, {{ref}}, {{total}}) and the spine event that fires each:
• quote_sent ← quote emailed to customer (Quote)
• quote_accepted ← customer accepts (portal action or internal mark)
• order_confirmed ← SO confirm passes gate G1 — this IS the Order Acknowledgement
• order_shipped ← shipment dispatched after gate G3
• invoice_issued ← invoice raised at a payment-term milestone (gate G4)
• statement_sent ← statement run — manual trigger in MVP; a scheduled statement cron is NOT one of the four decision-4 crons (open question, this frame)
Plus three non-template sends:
• Portal invitations ← PortalInvitation created (WorkOS provisioning)
• ETO approval requests ← engineering Job → submitted_for_approval (decision 7)
• VO approval requests ← Variation Order → awaiting_approval (decision 8)

## PASTE BLOCK 10 — SERVICE CARD: Xero (XRO)

XERO — ledger of record (decision 11)
• PUSH: AR invoices, credit notes, AP bills — with account + tax codes from the Configure Mapping screen.
• PULL: payment status → invoice flips paid / feeds the overdue flagger (webhook or polling cron — see open questions).
• Contacts synced between MirrorWorks customers/suppliers and Xero contacts.
• GST authority = Xero tax codes. MirrorWorks never invents a tax rate.
• EXPLICIT: no GL journals in MVP — WIP → COGS stays internal reporting only (BookWipValuation, JobProfitability).

## PASTE BLOCK 11 — SERVICE CARD: APS / Autodesk (APS)

APS — MirrorView 3D pipeline (the one piece ALREADY LIVE in Convex)
• convex/aps.ts: viewerToken (browser viewing token) · startUpload / finishUpload (CAD → APS object storage) · pollManifest (scheduled action, 5s — tracks translation progress; the manifest is the translation job's status report) · archiveToR2 (source file to R2).
• mirrorviewModels lifecycle: uploading → translating → success / failed; revisions go draft → released.
• Models attach to: product, job, MO, work order, or quote (ownerType).
• Drives ETO drawing approval (decision 7): engineering publishes the model to the customer portal; customer reviews via MirrorView anchored 3D markups (mirrorviewMarkups, real-time); approval unblocks evaluateBomPublish.

## PASTE BLOCK 12 — WEBHOOKS & INBOUND panel (gray outline, below the service cards)

INBOUND TRAFFIC — everything that calls US
1. Xero payment events — source: Xero. Payload: invoice reference, payment amount + date. Mutates: Invoice.status → paid; unpaid-past-due feeds the overdue-invoice flagger cron. Webhook preferred; polling cron is the fallback (see OPEN QUESTIONS sticky, this frame).
2. Resend delivery events — source: Resend webhook. Payload: message id + delivered/bounced/complained. Mutates: send-log on the notification record; a bounce flags the contact's email as bad.
3. APS translation progress — source: today NO webhook — pollManifest polls every 5s. Payload: manifest status + percent. Mutates: mirrorviewModels.progress/status/urn (the urn is the model's viewer ID).
4. Portal customer actions — source: portal UI (WorkOS-authenticated customer). Four actions:
   • Quote accept → signed quote PDF to R2, quote → accepted, quote_accepted email
   • ETO drawing approve / request revision → engineering Job state machine (in_design → submitted_for_approval → approved | revision_requested)
   • Markup create/reply → mirrorviewMarkups insert (real-time to internal viewers)
   • VO approve → VO → approved → live Job amended, schedule re-fire cron, milestones adjusted

## PASTE BLOCK 13 — BADGE LEGEND (small panel, bottom of frame)

SERVICE BADGES — small chips on spokes that are service calls
CVX = Convex · WOS = WorkOS · R2 = Cloudflare R2 · RSD = Resend · XRO = Xero · APS = Autodesk APS
Convention: Convex is implied EVERYWHERE (it is the database) — the CVX badge only marks crons and real-time floor surfaces. Other services badge every touchpoint.

WHICH SPOKES GET WHICH BADGE (mirrors frame 0a layout note 12 — that list is canonical):
• Documents · Drawings → R2
• Xero sync → XRO
• Order Acknowledgement → RSD
• Reorder monitor (Background crons panel, frame 0b) → CVX
• Portal approval (quote / ETO drawing / VO) → WOS + RSD (lives on the ETO/portal frames, not 0a)
• MirrorView review → APS + R2 (lives on the ETO/portal frames, not 0a)
• Customer / Prospect → XRO (contacts sync)
• Vendor → AP → XRO (bills push)
• AR → GL · Cash receipt → XRO (payment pull; GL lives in Xero)
• Delivery + PoD → R2 (PoD photo)
• Pick · Pack · Dispatch → CVX (real-time floor)
• Time Entries / Operator · Machine → CVX + WOS (kiosk identity — team role)
• Subcontract PO → XRO + R2 (PO pushed as a bill; PO attachments in R2)
• Cost roll-up (renamed from "Cost roll-up · WIP → COGS") → no badge — internal only, no GL journal in MVP

OPEN QUESTIONS (frame 0c) — small sticky beside this legend:
1 · Xero payment status: webhook vs polling cron — undecided.
2 · APS translation: keep 5s polling in production, or register a Model Derivative webhook?
3 · New Attachment.kind names for DXF/CAD and BoL (cad_model? dxf? bill_of_lading?).
4 · Resend bounce handling: who is notified, and does a bounce block future sends?
5 · Xero contacts sync direction: one-way push vs two-way reconciliation.
6 · Supplier-facing PO emails via Resend: in or out of MVP scope? (Template kinds are customer-only today.)

## LAYOUT NOTES (instructions for the board author — not pasted)

- Position: full-width frame directly BELOW frame 0a (the spine), so a reader drops straight from a spine node into this overlay. Keep the matrix's stage order identical to 0a's left-to-right order.
- The matrix paste blocks are written rows-as-stages; on the board you may transpose it (stages as columns aligned under the 0a spine nodes, services as rows) — keep the cell text unchanged either way.
- Tint each stage row/column with its module colour (Sell blue, Plan purple, Buy green, Make yellow, Ship orange, Book gray, Inventory teal, Quality red/pink, Cross-cutting gray outline). The Job row sits on the amber/yellow Job-spine colour: ALL text on amber/yellow fills must be dark, never white — this also applies to the Make-yellow rows and to any badge chip placed on a yellow node.
- Badge chips: ~24px rounded rects, 3-letter code, top-right corner of the spoke sticky, max 3 per node. Use a neutral light chip fill with dark text so chips read on every module colour (and satisfy the yellow/amber dark-text rule automatically).
- Service cards (blocks 6–11) sit in one row under the matrix, in column order CVX · WOS · R2 · RSD · XRO · APS so cards line up with matrix columns.
- The green flow strip (block 4) runs across the top of the matrix as a single green flow string — same green as the archetype happy-path strings elsewhere on the board.
- Webhooks panel (block 12) and badge legend (block 13) sit side-by-side at the bottom of the frame.

## Change log vs old board

- Backend fields chips (jobs.source = "replenishment"; BoM.components · isPhantom; MrpSuggestion · qtyShort; WorkCentre.capacityHoursPerD…; MO.workOrders · Operation.isSu…; WorkOrder · Time…) — MOVED to frame 0b's Backend build sheet, NOT to this frame; this frame holds only the function/cron/webhook/bucket/email inventories. The runReorderMonitor() · cron chip moves to frame 0b's Background crons panel.
- "Gate: Reorder Trigger (runReorderMonitor())" — RENAMED + MOVED: not a gate (decision 4); now cron #1 in the Convex card and the Background crons matrix row.
- "Gate: Plan → Make (evaluatePlanToMake(job))" — KEPT: listed as G2 in the Convex card, with the missing routing + material checks flagged for build.
- Xero sync spoke — KEPT: badged XRO; annotated with the push/pull split (decision 11).
- AR → GL · Cash receipt spoke — KEPT: badged XRO; annotated "GL lives in Xero; MirrorWorks pulls payment status".
- WIP cost accrual spoke — KEPT: annotated "internal only — no GL journals in MVP"; deliberately no service badge.
- Cost roll-up · WIP → COGS spoke — RENAMED "Cost roll-up" (matching frame 0a), annotated internal-only; no service badge.
- Pick · Pack · Dispatch spoke — KEPT: badged CVX (real-time floor subscription).
- Time Entries / Operator · Machine spokes — KEPT: badged CVX + WOS (kiosk identity — team role).
- Vendor → AP spoke — KEPT: badged XRO (AP bills push at goods receipt).
- Order Acknowledgement spoke — KEPT: badged RSD; identified as the order_confirmed template.
- Documents · Drawings spoke — KEPT: badged R2.
- Delivery + PoD spoke — KEPT: badged R2 (PoD photo).
- Customer / Prospect spoke — KEPT: badged XRO (contacts sync).
- Goods Receipt (old spine stage) — REMOVED from spine per decision 1; on this frame it appears only inside the Buy branch matrix row (gate G5).
- NEW (no old-board equivalent): Architecture overlay frame itself, service × stage matrix, six service responsibility cards, Webhooks & inbound panel, badge legend, Background crons row.

---

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