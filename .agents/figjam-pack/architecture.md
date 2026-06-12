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