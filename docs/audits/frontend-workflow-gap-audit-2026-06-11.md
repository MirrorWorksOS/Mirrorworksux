# Frontend workflow gap audit — 2026-06-11

Scope: every field, page, button, and modal the frontend needs for the agreed
workflows ([workflow-decisions-2026-06-11.md](../dev/shared/workflow-decisions-2026-06-11.md),
FigJam frames 0a–0d v2). Method: decision-by-decision sweep of
`apps/web/src/components` + types + workflowService usage. "D#" = decision number.

Priorities: **P0** = the workflow is wrong or unenforceable without it ·
**P1** = flow incomplete, demo papers over it · **P2** = polish / copy.

## P0 — correctness blockers

| # | Surface | Gap | Decision |
|---|---------|-----|----------|
| 1 | `workflow/RouteOverrideSelect.tsx`, `RouteChip.tsx` | Route enum UI still offers `catalogue_sale` + `make_to_stock`. Slim to `mto · stock_sale · eto`; relabel chips | D3 |
| 2 | `workflow/JourneyStepper.tsx` + `JourneyStage` union | Still renders quote→…→bom→mrp→schedule→… (9+ stages). Redraw to the 7-stage spine; bom/mrp/schedule become Job-stage detail, not stops | D1 |
| 3 | `sell/SellOrderDetail.tsx` + KickoffDialog | Confirm flow displays per-line Jobs (old grain). Must show ONE Job per SO with MOs per line; stock-only orders show "no Job — pick list raised" | D2 |
| 4 | `make/MakeManufacturingOrderDetail.tsx` | Static mock; **no Release button**, and `evaluatePlanToMake` is referenced by zero components — gate G2 is unenforceable anywhere except the demo journey page. Needs Release action + `GateBanner` | D4 G2 |
| 5 | `ship/ShipOrders.tsx` / dispatch action | No G3 mount — `evaluateMakeToShip` only used in OrderJourneyPage. Dispatch button must gate + show failures | D4 G3 |
| 6 | `buy/BuyReceipts.tsx` | Photo upload only. **No receiving gate UI at all**: no PO-line match display, no qty-tolerance validation, no accept action, no GateBanner (G5 doesn't exist in code either) | D4 G5 |
| 7 | Invoice raising (`sell/SellNewInvoice.tsx`, `book/`) | Free-form invoice form; no SO/shipment/milestone linkage anywhere. Needs milestone-aware raise flow: pick SO → next unmet milestone → pro-rated per shipment → G4 banner | D5 |
| 8 | `control/ControlPaymentTerms.tsx` | Editor is label/days/depositPct. Needs the milestone-schedule editor: ordered {event, pct} rows, sum-to-100 validation, depositPct migration affordance | D5 |
| 9 | `workflow/VOImpactPanel.tsx`, `OrderJourneyPage.tsx` | Both render the **deltaJob** result ("delta Job JOB-x spawned"). Replace with amend-in-place preview: baseline snapshot, MO diffs, uninvoiced-milestone delta, credit-note warning when descope > uninvoiced remainder | D8 |
| 10 | Credit Note | No entity, no page, no modal anywhere (only Xero branding config mentions it). Needs list + detail + raise-from-VO/RMA + Xero sync status | D8, D13 |
| 11 | `workflow/EngineeringJobsPage.tsx` | Publish exists but: no approval state machine (in_design → submitted_for_approval → approved/revision_requested badges), no Submit-for-approval button, no waiver modal (who/why), publish not gated, and copy still says "spawns the production Job" (old two-Job pattern) | D7, D2 |

## P1 — flow gaps

| # | Surface | Gap | Decision |
|---|---------|-----|----------|
| 12 | `sell/SellOrderDetail.tsx` | `allowPartialFulfilment` toggle missing (field exists in types, zero UI); per-line `backorderQty` not displayed | D6 |
| 13 | `sell/SellCustomerDetail.tsx` | Customer-level partial-fulfilment default missing; milestone terms not shown on the customer card | D5, D6 |
| 14 | `workflow/QcReworkInspector.tsx` | 4 dispositions present ✓, but **scrap is a toast stub** — needs the remake-or-ship-short modal (shortfall MO vs concession); **RTV is a toast stub** — needs supplier-return record linked to GR + Bill debit; no qty / costImpact inputs on the disposition | D9 |
| 15 | Put-away | No put-away UI anywhere (`putAway` referenced by zero components). MTS tail needs a put-away action on MO completion + PutAwayRecord display | D3 |
| 16 | `ship/` shipment creation | No partial-shipment UI: cannot select lines/qtys per shipment — which per-shipment milestone invoicing depends on | D6→D5 |
| 17 | `ship/ShipReturns.tsx` | Static mock RMA table. Needs the minimal RMA flow: create return from shipment → return receipt → QC disposition (restock / rework Job / scrap) → credit note when owed | D13 |
| 18 | Stocktake | No page at all (only a route comment mentions it). Needs count-sheet UI: generate sheet → enter counts → variance review → post adjustment StockMovements (reason/who/note) | D13 |
| 19 | `workflow/ReorderRulesPage.tsx` | `shortageBehaviour` rendered read-only; no create/edit rule form | D6 |
| 20 | Subcontract release | No release modal exposing `free_issue / sub_supplied / hybrid`; `SubcontractTimeline` still renders the 6-state lifecycle — slim to 4 | D10 |
| 21 | Portal | Quote markup/accept exists; **no ETO drawing-approval surface** (approve / request-revision on the model feeding the engineering Job state machine) and no VO-approval action | D7, D8 |
| 22 | Backorder visibility | Auto-fired second pick lists and the backorder queue (shortageBehaviour `wait`) have no surface | D6 |
| 23 | PoD capture | Verify shipment detail can upload PoD (Attachment kind exists) and set `actualDelivery` — needed for `delivery` milestones only | D5 |
| 24 | `buy/BuyRFQs.tsx` | Badge "post-MVP"; ensure no backend wiring is implied | D13 |

## P2 — polish / copy / vocabulary

| # | Surface | Gap |
|---|---------|-----|
| 25 | `workflow/QcReworkInspector.tsx:79,118` | "Supervisor escalation" / "supervisor must override" → **lead** (role vocabulary: admin/lead/team only). Same sweep: `make/MakeSettings.tsx:80,154`, `make/shop-floor/mockMachines.ts:70`, `floor/FloorStationPicker.tsx:226`, `floor/FloorScanJob.tsx:171` |
| 26 | `workflow/OrderJourneyPage.tsx` | B4 copy "Publish ETO BoM → spawn production Job" → "creates MOs under the parent Job"; `inferStage` updated to the 7-stage spine; add a G2 release demo action and a put-away action |
| 27 | SO confirm | Order-acknowledgement email indicator (Resend `order_confirmed`) on confirm success |
| 28 | `book/` invoices | Show milestone link (event · pct · shipment) and Xero-pull paid/overdue provenance on InvoiceDetail |

## Already in place (no action)

- Per-line route chips on SO detail + journey deep-link (`SellOrderDetail`).
- `QcReworkInspector` disposition picker with depth-cap escalation UX skeleton.
- `ReorderRulesPage` "Run monitor now" → same code path as the future cron.
- `SubcontractTimeline`, `JobGraphMini`, `EntityPeek`, `GateBanner`, `AdvanceButton` component family.
- Customer payment-terms assignment (`paymentTermsId`) and portal quote accept/markups (MirrorView).
- `GoodsReceipt`/`Requisition` approval flow pages exist in Buy (minus the G5 gate logic).

## Sequencing note for Sharjeel

The P0 set falls into three clusters that should land together:
1. **Enum + grain** (items 1–3, 11): route enum rename, JourneyStepper, one-Job-per-SO confirm — all touch `confirmSalesOrder`'s contract.
2. **Gates at action sites** (items 4–6): G2/G3/G5 buttons + banners — depends on `evaluatePlanToMake` strengthening and `evaluateGateReceiving` being built.
3. **Money** (items 7–10): milestone terms editor → milestone invoice raise → credit notes → VO amend-in-place. Order matters: terms editor first, invoicing second, VO/CN last.
