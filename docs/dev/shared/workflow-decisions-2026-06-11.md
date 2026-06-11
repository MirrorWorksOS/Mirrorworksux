# Workflow consensus decisions — 2026-06-11

Source: grill-me review of the MirrorWorks Workflows FigJam board
(`https://www.figma.com/board/sbb1GwGMG89qx88298UJiD/MirrorWorks---Workflows`)
against the frontend codebase. These 13 decisions are the agreed model; the
FigJam board, [workflow.md](workflow.md), [ADR-006](../../audits/adr/ADR-006-workflow-archetype-service.md),
and the code are all to be brought into line with this document.

## The 13 decisions

### 1. Spine shape

The spine is the document handoff chain, 7 stages:

**Quote → Sales Order → Job → Manufacturing Order → Work Orders → Shipment → Invoice**

- Buy (Requisition → Approval → Purchase Order → Goods Receipt) is a **parallel
  branch hanging off MRP under Job**, rejoining as a "material available"
  precondition on Work Order start. It is NOT a spine stage. Goods Receipt is
  removed from the spine.
- BoM / MRP / Schedule remain **spokes under Job**, not spine stages.
- `JourneyStepper` in code must be updated to match (today it renders
  quote → sales_order → job → bom → mrp → schedule → manufacturing → dispatch → invoice).

### 2. Job granularity

**One Job per Sales Order**, covering only its manufactured lines.

- Each manufactured line gets a **Manufacturing Order under the Job**; the MO
  carries `salesOrderLineId`, `productId`, `qty`, dates, and is the scheduling unit.
- ETO lines spawn **engineering Jobs as children** via `parentJobId`, rejoining
  the parent at MRP.
- Pure stock-sale orders get **no Job at all**.
- `confirmSalesOrder` requires rework: today it creates one Job per line and the
  line→Job link is never persisted (only returned transiently in `perLine`).

### 3. Archetype taxonomy: 3 + 1 + 3

- **Order routes** (decided per SO line at confirm): **MTO, Stock Sale, ETO**.
  `ProductRoute` slims to `'mto' | 'stock_sale' | 'eto'`
  (today: `'mto' | 'eto' | 'catalogue_sale' | 'make_to_stock'`).
  `catalogue_sale` is renamed `stock_sale`. `make_to_stock` stops being a line
  route — stocked products resolve to `stock_sale` at order time.
- **Background trigger**: MTS replenishment — reorder monitor cron, no customer
  order. Replenishment Jobs use the **`Stock` pseudo-customer**, never
  "no customer". *(Amended at assembly: engineering and variation Jobs keep the
  REAL customer — they spawn from a real customer's order; matches code.
  ADR-006's "all three use the pseudo-customer" wording is stale and should be
  corrected.)*
- **In-flight deviations** (events that can attach to any in-flight order, not
  routes): Variation Order, Rework, Subcontract.

### 4. Five named validation gates; triggers are crons, not gates

| # | Gate | Fires on | Checks |
|---|------|----------|--------|
| G1 | SO → Job | SO confirm | SO confirmed; all line products exist + active; BoM exists for MTO lines |
| G2 | Plan → Make | MO release | start/due dates set; ≥1 MO; **every MO has a routing; material status OK (shortage without a covering PO blocks)** — the bolded checks are missing in code today and must be added |
| G3 | Make → Ship | dispatch | all WOs complete; all QC decisions final; no open rework chains |
| G4 | Ship → Book | invoice raise | **milestone-aware**: the relevant payment-term milestone event has occurred (see decision 5). Replaces today's hard-coded "PoD recorded" check |
| G5 | Receiving | GR accept | PO line match; qty within tolerance. Promised in docs/ADR-006 but **does not exist in code — must be built** |

- The "Reorder Trigger" is **not a gate** — it is a cron. The board gets a
  separate **Background crons** panel: reorder monitor, overdue-invoice flagger,
  schedule re-fire after VO approval, Xero payment-status pull.

### 5. Invoicing is policy-driven per customer (milestone schedule)

- `PaymentTerm` gains an ordered **milestone schedule**: `{ event, pct }` rows
  that must sum to 100. Events: `order_confirmed | dispatch | delivery | completion`.
  `days` (net terms) applies to each invoice raised.
- Examples: "Net 30 on dispatch" = `[{dispatch, 100}]`;
  "50/50" = `[{order_confirmed, 50}, {completion, 50}]`;
  "on delivery" = `[{delivery, 100}]`.
- Dispatch/delivery milestones generate **one invoice per shipment**, pro-rated
  to the shipped lines; `completion` fires once when all lines have shipped.
- Approved VO cost deltas adjust the **remaining uninvoiced** milestones.
- Gate G4 becomes `evaluateInvoiceMilestone(so, milestone)`.

### 6. Stock-sale allocation and backorders

- **Partial shipment allowed by default**; `allowPartialFulfilment` flag on the
  SO, defaulted from the customer.
- Unfilled remainder = **backorder qty on the line**. The product's
  `shortageBehaviour` decides the fill: manufactured → replenishment Job
  earmarked to the SO line via reservation; purchased → MRP suggestion /
  auto-PO; `wait` → visible backorder queue for a human.
- Arrival (GR or put-away to FG) **auto-fires the second pick list** via
  reservation conversion.

### 7. ETO customer drawing approval gates BoM publish

- Engineering Job state machine:
  `in_design → submitted_for_approval → approved | revision_requested`.
- Submission publishes drawings/model to the **customer portal** (MirrorView 3D
  markups as the review surface).
- **BoM publish — and therefore MO creation — is gated on `approved`**, with an
  internal waiver path (who/why recorded): `evaluateBomPublish(engineeringJob)`.
- Publishing the approved BoM creates **MOs under the parent Job** (the
  separate "production Job" of the old two-Job pattern is gone).

### 8. VO amends in place; Credit Note is a new entity

- VO stores an **immutable baseline snapshot** (Job/MO/cost state at raise time)
  for variance reporting.
- Approval amends the live Job's BoM/MOs; completed WOs preserved; MRP +
  schedule re-fired for changed MOs; `costDelta` adjusts uninvoiced milestones.
- Descope beyond the uninvoiced remainder raises a **Credit Note** (new entity,
  Xero-synced like an invoice).
- The `deltaJob` path in `approveVariation` is **removed**.

### 9. QC owns disposition; no NCR entity

- No NCR entity. `QualityCheck` gains: `disposition`
  (`rework | scrap | use_as_is | return_to_vendor`), `qty`, `costImpact`, and
  links (`reworkWorkOrderId?` / `concessionId?` / `supplierReturnId?`).
  The dangling `ncrId` field is dropped.
- **Scrap**: charges the Job (cost never leaves the job's P&L), flips any
  `BatchLot` to consumed/quarantine, and forces an explicit
  **remake-or-ship-short prompt**: shortfall MO (re-fires MRP) or ship short via
  the concession path.
- **Return-to-vendor**: supplier return linked to the original GR + debit
  against the Bill.
- Rework **depth cap 2** → escalation to a lead (concession or scrap).
- The board band "QC / NCRs" is relabelled **"QC"**.

### 10. Subcontract: PO-anchored, 4 states, Receiving-gate return

- A **PO is always created** (the AP bill and Receiving gate hang off it).
- Return = **Goods Receipt against that PO through gate G5** + QC check on return.
- `materialModel` branches documented: `free_issue` (outbound dispatch; stock
  parked at supplier via `sub_out` / `sub_in` movements) vs `sub_supplied`
  (PO only, no outbound leg) vs `hybrid`.
- Lifecycle slimmed to **`released → at_supplier → received → closed`**
  (drop `subcontract_in_transit`, `returning`).

### 11. Xero boundary: operational / ledger-of-record split

- MirrorWorks is the operational system; **Xero is the GL of record**.
- **Push**: AR invoices, credit notes, AP bills — with mapped account + tax
  codes (GST authority = Xero tax codes).
- **Pull**: payment status → invoice `paid` / `overdue`. Contacts synced.
- **WIP → COGS stays internal reporting only** (`BookWipValuation`,
  `JobProfitability`); **no GL journals in MVP**.
- Board money spokes annotated with the owning system.

### 12. Services documentation: overlay frame + node badges

- A dedicated **Architecture overlay frame**: services × spine-stage matrix with
  responsibilities, plus the cron, webhook, R2 bucket, and email-kind
  inventories — the entire backend surface enumerable from one frame.
- **Small service badges** on the specific spokes that are service calls.
- Services: **Convex** (DB, all mutations/gates as functions, crons, real-time
  subscriptions), **WorkOS** (authn, roles admin/lead/team, portal identity),
  **R2** (all binaries via signed URLs; `Attachment` is the R2 index),
  **Resend** (`NotificationTemplate` kinds + portal invites + approval
  requests), **Xero** (per decision 11), **APS/Autodesk** (MirrorView
  translation, already live in `convex/aps.ts`).

### 13. MVP scope additions

- **Stocktake / stock adjustment**: counted-vs-system correction — adjustment
  `StockMovement` with reason/who/note + simple count-sheet UI.
- **Minimal RMA**: return receipt → QC → disposition
  (restock / rework Job / scrap) + credit note when owed. Reuses the QC
  disposition machinery. The existing `ShipReturns` page gets a real flow.
- **Supplier RFQ deferred** post-MVP; `BuyRFQs` page badged "post-MVP".

## Verified code facts (as of 2026-06-11)

- `ProductRoute = 'mto' | 'eto' | 'catalogue_sale' | 'make_to_stock'`
  (`apps/web/src/types/entities.ts:192`).
- Gates in code (`apps/web/src/services/workflowService.ts`): `evaluateSoToJob`,
  `evaluatePlanToMake` (dates + ≥1 MO only), `evaluateMakeToShip` (WOs complete,
  no QC fail), `evaluateShipToBook` (shipment exists + `actualDelivery` set).
  There is **no** `evaluateGateReceiving` despite docs/ADR claiming it.
- `confirmSalesOrder` is per-line: `mto` → Job per line; `catalogue_sale` →
  reserve + PickList; `eto` → engineering Job; `make_to_stock` → treat as MTO if
  BoM exists. Line→Job link not persisted.
- `PaymentTerm = { label, days, depositPct?, isDefault? }` — gains `milestones[]`.
- `QualityCheck = { workOrderId, result: 'pass'|'fail'|'hold', inspectorId, inspectionPointId?, ncrId? }`.
- `SubcontractDispatch` states today:
  `released | subcontract_in_transit | at_supplier | returning | received | closed`;
  `materialModel: 'sub_supplied' | 'free_issue' | 'hybrid'`.
- `VariationOrder`: `parentSalesOrderId`, `variationChainId`, `costDelta`,
  `scheduleDeltaDays`, status `draft | awaiting_approval | approved | rejected`;
  `approveVariation` returns a `deltaJob` (to be removed).
- `WorkOrder`: `parentWorkOrderId?`, `reworkDepth?` (cap 2), `isSubcontracted?`, `nestId?`.
- `StockMovement.reason`: `gr | pick | consume | putaway | sub_out | sub_in | scrap | adjust`;
  `refType`: `so_line | work_order | mo | po | rma`.
- `Attachment.kind`: `quote_pdf | signed_quote | invoice_pdf | delivery_note | proof_of_delivery | markup_image | other`;
  `entityType`: `quote | sales_order | invoice | shipment | markup | purchase_order`.
- `NotificationTemplate.kind`: `quote_sent | quote_accepted | order_confirmed | order_shipped | invoice_issued | statement_sent`.
- Status unions: SO `draft|confirmed|in_production|shipped|invoiced|cancelled`;
  Job `draft|planned|in_progress|on_hold|completed|cancelled`;
  MO `draft|confirmed|in_progress|done`; WO `pending|in_progress|completed|blocked`;
  PO `draft|sent|acknowledged|partial|received|cancelled`;
  Invoice `draft|sent|paid|overdue|void`; Shipment `pick|pack|ship|transit|delivered`;
  PickList `pending|in_progress|picked|cancelled`; Reservation `active|released|consumed`.
- `ProductReorderRule.shortageBehaviour: 'backorder' | 'auto_po' | 'wait'`.
- Convex today serves **only MirrorView** (`convex/aps.ts`, `convex/mirrorview.ts`);
  all ERP entities are mock (`services/mock/data.ts`).

## Old-board inventory (everything must be kept, moved, renamed, or explicitly removed)

- **0a spine**: Quote (Sell) → Sales Order (Sell) → Job (PLAN, spine anchor) →
  Goods Receipt (Buy) → Manufacturing Order (Make) → Work Orders (Make) →
  Shipment (Ship) → Invoice (Book).
- **Spokes above the band**: Customer / Prospect; Order Acknowledgement;
  Job events / audit; Vendor → AP; WIP cost accrual; QC / NCRs; Delivery + PoD;
  AR → GL · Cash receipt.
- **Spokes below**: Customer enquiry; Per-line routing decision
  (MTO · Stock · ETO · VO); BoM; Routing; Schedule snapshot; Reservations;
  Documents · Drawings; Purchase Requisition; Approval; Purchase Order;
  MRP shortage trigger; Material Consumption; Subcontract PO (if outsourced);
  Time Entries (labour); Operator · Machine; Rework chain (parent…);
  Pick · Pack · Dispatch; Cost roll-up · WIP → COGS; Xero sync.
- **Key/legend**: Sell, Plan, Buy, Make, Ship, Book, Inventory, Quality,
  Cross-cutting, Job spine.
- **Archetypes text frame**: 7 numbered archetypes with green flow strings.
- **Backend fields chips**: `runReorderMonitor() · cron`; `jobs.source = "replenishment"`;
  `BoM.components · isPhantom`; `MrpSuggestion · qtyShort · prefe…`;
  `WorkCentre.capacityHoursPerD…`; `MO.workOrders · Operation.isSu…`;
  `WorkOrder · Time…`. **Validation gates shown**: "Gate: Reorder Trigger
  (runReorderMonitor())"; "Gate: Plan → Make (evaluatePlanToMake(job))"; more off-frame.

## Amendments resolved during pack assembly (2026-06-11, same session)

- **Frame numbering**: 0a spine · 0b validation gates + backend build sheet
  (field chips and crons live here) · 0c architecture overlay (function / cron /
  webhook / bucket / email inventories — no field chips) · 0d archetypes quick
  reference.
- **Stock pseudo-customer scope**: replenishment Jobs only; engineering and
  variation Jobs keep the real customer (matches code; ADR-006 stale on this).
- **Concession definition** (canonical): a recorded internal approval (named
  approver) to accept off-spec work or ship short; the customer contact is
  noted when the customer has agreed. Matches `recordConcession` in code.
- **Requisition approver**: undecided — "role TBD, decide against the ARCH 00
  access spec". Never assign a role on the board until decided.
- **Statement run**: manual trigger in MVP; it is NOT one of the four decision-4
  crons. A scheduled statement cron is an open question.
- **Canonical badge list** (frame 0a layout note 12 is the single source;
  frame 0c's legend mirrors it): XRO on Xero sync / AR → GL · Cash receipt /
  Vendor → AP / Customer · Prospect (contacts); XRO + R2 on Subcontract PO;
  R2 on Documents · Drawings / Delivery + PoD; RSD on Order Acknowledgement;
  CVX on Pick · Pack · Dispatch; CVX + WOS on Time Entries / Operator · Machine
  (kiosk identity — team role).
- **publishBomToProductionJob** is renamed `publishBom` and gated on
  `evaluateBomPublish` (a publish-time check, not a spine gate).

## Vocabulary constraints (hard rules)

- Never write "Con-form Group" anywhere; never associate MirrorWorks with it.
- Access roles are exactly: **admin, lead, team** — no Manager/Supervisor/Operator role names.
- On brand-yellow backgrounds, foreground text/icons must be dark, never white.
- "Alliance Metal" is approved demo fixture data.
