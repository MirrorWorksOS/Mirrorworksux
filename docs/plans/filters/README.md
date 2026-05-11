# Filter Migration Plans — Module Index

**Status:** ready to implement · **Updated:** 2026-05-11
**Pilot delivered:** Sell module at commit `d4f0c565` ("feat(filters): schema-driven ModuleFilterBar + Sell module pilot")
**Design proposal:** [docs/plans/FILTERS-REDESIGN.md](../FILTERS-REDESIGN.md)
**Audits:** [docs/audits/dev/AUDIT-filters-OVERVIEW.md](../../audits/dev/AUDIT-filters-OVERVIEW.md) and per-module audits

---

## What this folder is

Each file is a paste-ready migration plan for one module's filter / search / view redesign. The Sell pilot proved out the shared foundation (`apps/web/src/components/shared/filters/`); these docs apply the same pattern to the remaining 7 modules, with concrete `FilterSchema` TypeScript per screen, lucide-icon system presets, view-mode assignments, required data work, and smart-filter ideas.

A plan is "ready to implement" when an engineer can open it, follow the schema TS into the screen, and ship — no further design decisions needed.

## Design rules (locked by the Sell pilot)

1. **Schema-driven** — each list/board screen declares a `FilterSchema` consumed by `ModuleFilterBar`.
2. **Lucide icons only on system presets** — `iconTone: yellow | info | success | warning | error | neutral`. No emoji on system. Yellow tile = dark icon (project convention).
3. **Heights C** — chips and view-toggle at 40px (`IconViewToggle size="sm"`), primary CTA at 48px (`ToolbarPrimaryButton`).
4. **Date quick-ranges** — full set: `today / yesterday / thisWeek / next7days / thisMonth / lastMonth / thisQuarter / thisYear / ytd / lastYear`. Default chip strip = `[today, thisWeek, thisMonth, thisQuarter, thisYear]`. Schemas can override per facet via `quickRanges`.
5. **Three-role vocab** — admin / lead / team. Never Manager/Supervisor/Operator.
6. **URL state** — `useFilterState` writes facets, view, preset id to search params. Views are linkable, refresh-safe.
7. **Saved views** — personal + group-shared (Lead/Admin can share) + system + org scopes. Backed by localStorage today; shape is server-ready.

## Module plans

| Module | Plan | Screens | Headline data-prereq |
|---|---|---|---|
| **Buy** | [buy.md](./buy.md) | 8 (PO, Suppliers, RFQs, Requisitions, Receipts, Bills, Agreements, MRP Suggestions) | Convert display-formatted date strings ("Mar 25", "Jan 2026") to ISO on `RFQ.dueDate`, `Bill.invoiceDate/dueDate`, `BuyAgreement.startDate/endDate` |
| **Make** | [make.md](./make.md) | 11 (MO, MO route-steps, WO, Products, Schedule, ShopFloor, ShopFloorKanban, Quality, CAPA, Scrap, Batch) | Add `workCentreId`, `machineId`, `shift`, `operatorId`, `priority`, `jobId` + boolean signals (`awaitingMaterial`, `qualityHold`, `atRisk`, `lateRiskScore`) to MO/WO models |
| **Plan** | [plan.md](./plan.md) | 18 (Jobs, Schedule, ScheduleEngine, MRP, Purchase, Nesting, NCConnect, Libraries, Activities, QC, Routing, CTP, BOM, etc.) | Replace `MONTH_BASE` hard-code in `PlanSchedule.tsx:36` with a `horizon` date facet — blocks Schedule, ScheduleEngine, ScheduleTab, MRP, Activities, CapableToPromise |
| **Ship** | [ship.md](./ship.md) | 7 (Orders, Shipping, Tracking, Carrier Rates, Returns, Warehouse, Reports) | Type `due` / `eta` / `updated` as ISO dates; add destination, driverId, vehicleId, routeId, hazmat / oversize / COD flags, weight/dims — unlocks ~80% of recommended facets + map/calendar/route views |
| **Book** | [book.md](./book.md) | 11 (Invoices, POs, CostVariance, WipValuation, StockValuation, JobProfitability, JobCostDetail, ExpenseKanban, Budget, Reports, XeroMapping) | Wire actual "As at" snapshot date on StockValuation (`StockValuation.tsx:88` is a non-functional stub) and BookWipValuation; period selectors on JobProfitability + BudgetOverview |
| **Control** | [control.md](./control.md) | 14 (People-Users, People-Groups, Machines, Locations, Operations, Products, BOMs, Inventory, Tooling, Maintenance, Routes, Documents, Audit, Shift Manager, Gamification) | Cheap win: extend `ToolbarSummaryBar` in `PageToolbar.tsx:171` with `onSegmentClick`/`activeKey` so summary segments become free filters on BOMs / Inventory / People |
| **Shop-Floor** | [shop-floor.md](./shop-floor.md) | 6 operator surfaces (FloorScanJob, FloorStationPicker, IsometricFloorView, OverviewTab, WorkTab, QualityTab) + FloorModeLayout chrome | Operator collapse: same `FilterSchema` type, 1–3 pinned chips at 56px touch height, `ScanInput` replaces search, Lead-curated `SavedView{scope:"group", isDefault:true}` pushed as shift defaults |

## Suggested rollout order

The audits and these plans together suggest a 7-phase sequencing. Each phase ships independently and validates a different aspect of the foundation:

| # | Module | Why next | Estimate |
|---|---|---|---|
| 1 | **Sell** ✅ | Pilot — already shipped at `d4f0c565`. | landed |
| 2 | **Buy** | Same data shapes (orders, bills, dates), high reuse from Sell. Validates the foundation against procurement workflows. | M (1–2 wks) |
| 3 | **Book** | Aging-bucket board view was proven in Sell.Invoices — Book uses it everywhere. Fiscal-period selector is its own carve-out but design is settled. | M (1–2 wks) |
| 4 | **Control** | Cheap-win heavy: clickable `ToolbarSummaryBar` segments + simple schemas. Good momentum builder; few view-mode unlocks needed. | M (1–2 wks) |
| 5 | **Make** | Big view-mode wins (kanban-by-status, machine swimlanes). Needs the MO/WO data prereq first. | L (2–4 wks, incl. data work) |
| 6 | **Plan** | Highest view-mode unlock surface (gantt, MRP weekly grid, BOM tree, nesting layout). Blocked by `MONTH_BASE` removal. | L (2–4 wks) |
| 7 | **Ship** | Blocked by largest data prereq (typed dates + destination/driver/vehicle/route + hazmat/COD). Map view is the headline unlock. | L+ (3–5 wks incl. data work) |
| 8 | **Shop-Floor** | Different rendering paradigm; safest to ship after the desktop pattern is fully bedded in. | M (1–2 wks) |

**Critical-path data work** (do these in early-phase PRs so later modules aren't blocked):
- Buy: ISO dates on RFQ/Bill/Agreement.
- Plan: `MONTH_BASE` → `horizon` facet.
- Book: snapshot dates on Stock/WIP.
- Ship: typed `due`/`eta`, destination/driver/vehicle/route columns, freight flags.
- Make: MO/WO enrichment (`workCentreId`, `machineId`, `shift`, signal booleans).

## How to use one of these plans

Per the Sell pilot's worked example ([apps/web/src/components/sell/SellOpportunities.tsx](../../../apps/web/src/components/sell/SellOpportunities.tsx)):

1. Open the plan for your module.
2. Pick a screen. Copy its `FilterSchema` into the component.
3. Wire `useModuleFilters(schema)` + `<ModuleFilterBar schema={...} filters={...} />` + `applyFilters({...})` into the existing render flow.
4. Copy the system-preset registration block. Adjust if you've extended a facet.
5. Replace the screen's hand-rolled filter state with state derived from `filters.state`.
6. Add any view modes the plan calls for (list/card/kanban/calendar/etc).
7. Tackle the "Required data work" items the plan flags before you can apply certain facets.
8. Don't add emoji to system presets. Don't introduce new heights — chips 40, CTA 48.

## What's NOT in these plans (deferred)

- **Smart-filter v1** (NL filter input + AI-suggested chips + smart-rank sort). Plans list per-module ideas, but the implementation is deferred to a single follow-up after the foundation is across more modules. See [FILTERS-REDESIGN.md §8](../FILTERS-REDESIGN.md#8-smart--ai-assisted-filters).
- **Comparison mode** for finance (this-month vs last-month side-by-side pivots). Carved out for the Book follow-up.
- **Pinned-preset chip strip** (Odoo-style favourites row above the bar). Pattern is in the design doc; first implementation likely on Sell.Opportunities once user behaviour shows the most-loaded presets.
- **Server-backed saved views** — current implementation is localStorage. The `SavedView` shape is server-ready; the server-side migration is its own piece of work tracked elsewhere.
- **Operator AI hero cards** (Shop-floor "next best job"). The shop-floor plan calls them out but the model wiring is its own initiative.

## Open questions still pending

These are from the original design doc and still need product input before phase 5+ (Make/Plan/Ship):

1. Storage for saved views — server table vs JSONB on user/group? Needs RLS story consistent with `reference_arch00_spec.md`.
2. Smart-filter model wiring — re-use existing AI surfaces or stand up a dedicated suggestion endpoint?
3. Group identity for shared presets — is the sharing scope `ControlGroups`, or something narrower?
4. Multi-currency on Book screens — deferred but will need a decision before Book ships if any customer requires it.
