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
7. **Saved views** — personal + group-shared (Lead/Admin can share) + system + org scopes. Backed by a dedicated `saved_views` Postgres table (not localStorage, not JSONB on the user row). Group sharing is scoped to `ControlGroups`; see the RLS policy in the "Resolved decisions" section below.

## Module plans

| Module | Plan | Screens | Headline data-prereq |
|---|---|---|---|
| **Buy** | [buy.md](./buy.md) | 8 (PO, Suppliers, RFQs, Requisitions, Receipts, Bills, Agreements, MRP Suggestions) | Convert display-formatted date strings ("Mar 25", "Jan 2026") to ISO on `RFQ.dueDate`, `Bill.invoiceDate/dueDate`, `BuyAgreement.startDate/endDate` |
| **Make** | [make.md](./make.md) | 11 (MO, MO route-steps, WO, Products, Schedule, ShopFloor, ShopFloorKanban, Quality, CAPA, Scrap, Batch) | Add `workCentreId`, `machineId`, `shift`, `operatorId`, `priority`, `jobId` + boolean signals (`awaitingMaterial`, `qualityHold`, `atRisk`, `lateRiskScore`) to MO/WO models |
| **Plan** | [plan.md](./plan.md) | 18 (Jobs, Schedule, ScheduleEngine, MRP, Purchase, Nesting, NCConnect, Libraries, Activities, QC, Routing, CTP, BOM, etc.) | Replace `MONTH_BASE` hard-code in `PlanSchedule.tsx:36` with a `horizon` date facet — blocks Schedule, ScheduleEngine, ScheduleTab, MRP, Activities, CapableToPromise |
| **Ship** | [ship.md](./ship.md) | 7 (Orders, Shipping, Tracking, Carrier Rates, Returns, Warehouse, Reports) | Type `due` / `eta` / `updated` as ISO dates; add destination, driverId, vehicleId, routeId, hazmat / oversize / COD flags, weight/dims — unlocks ~80% of recommended facets + map/calendar/route views |
| **Book** | [book.md](./book.md) | 11 (Invoices, POs, CostVariance, WipValuation, StockValuation, JobProfitability, JobCostDetail, ExpenseKanban, Budget, Reports, XeroMapping) | Wire actual "As at" snapshot date on StockValuation (`StockValuation.tsx:88` is a non-functional stub) and BookWipValuation; period selectors on JobProfitability + BudgetOverview; multi-currency facet on AR/AP/valuation/profitability screens (confirmed in scope) |
| **Control** | [control.md](./control.md) | 14 (People-Users, People-Groups, Machines, Locations, Operations, Products, BOMs, Inventory, Tooling, Maintenance, Routes, Documents, Audit, Shift Manager, Gamification) | Cheap win: extend `ToolbarSummaryBar` in `PageToolbar.tsx:171` with `onSegmentClick`/`activeKey` so summary segments become free filters on BOMs / Inventory / People |
| **Shop-Floor** | [shop-floor.md](./shop-floor.md) | 6 operator surfaces (FloorScanJob, FloorStationPicker, IsometricFloorView, OverviewTab, WorkTab, QualityTab) + FloorModeLayout chrome | Operator collapse: same `FilterSchema` type, 1–3 pinned chips at 56px touch height, `ScanInput` replaces search, Lead-curated `SavedView{scope:"group", isDefault:true}` pushed as shift defaults |

## Suggested rollout order

The audits and these plans together suggest a 7-phase sequencing. Each phase ships independently and validates a different aspect of the foundation:

| # | Module | Why next | Estimate |
|---|---|---|---|
| 1 | **Sell** ✅ | Pilot — already shipped at `d4f0c565`. | landed |
| 2 | **Buy** | Same data shapes (orders, bills, dates), high reuse from Sell. Validates the foundation against procurement workflows. | M (1–2 wks) |
| 3 | **Book** | Aging-bucket board view was proven in Sell.Invoices — Book uses it everywhere. Fiscal-period selector is its own carve-out but design is settled. Multi-currency is confirmed in scope (see Resolved decisions §4). | M (1–2 wks) |
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

- **Smart-filter v1** (NL filter input + AI-suggested chips + smart-rank sort). Plans list per-module ideas, but the implementation is deferred to a single follow-up after the foundation is across more modules. Architecture is settled: each module gets a dedicated `/api/smart-filters/{module}` endpoint (no shared AI surface). See [FILTERS-REDESIGN.md §8](../FILTERS-REDESIGN.md#8-smart--ai-assisted-filters) and the "Resolved decisions" section below.
- **Comparison mode** for finance (this-month vs last-month side-by-side pivots). Carved out for the Book follow-up.
- **Pinned-preset chip strip** (Odoo-style favourites row above the bar). Pattern is in the design doc; first implementation likely on Sell.Opportunities once user behaviour shows the most-loaded presets.
- **Operator AI hero cards** (Shop-floor "next best job"). The shop-floor plan calls them out but the model wiring is its own initiative.

## Resolved decisions (carried from design doc)

These were open before the module plans were written; all four are now settled.

### 1. SavedView storage — server table with RLS

Storage model: a dedicated `saved_views` Postgres table, **not** JSONB on the
user/group row. RLS enforces visibility per scope:

```sql
-- saved_views table (abbreviated)
create table saved_views (
  id          uuid primary key default gen_random_uuid(),
  module      text not null,                -- e.g. "buy.orders"
  name        text not null,
  scope       text not null check (scope in ('personal','group','org')),
  owner_id    uuid not null references auth.users,
  group_id    uuid references control_groups,  -- non-null when scope='group'
  filters     jsonb not null default '{}',
  view_mode   text not null,
  group_by    text,
  sort        jsonb,
  is_default  boolean default false,
  pinned      boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- RLS: personal → owner only; group → same control_group; org → all authenticated
alter table saved_views enable row level security;

create policy "personal" on saved_views for all
  using (scope = 'personal' and owner_id = auth.uid());

create policy "group" on saved_views for select
  using (
    scope = 'group'
    and group_id in (
      select group_id from control_group_members where user_id = auth.uid()
    )
  );

create policy "group-write" on saved_views for insert, update, delete
  using (
    scope = 'group'
    and owner_id = auth.uid()
    and exists (
      select 1 from control_group_members
      where group_id = saved_views.group_id
        and user_id = auth.uid()
        and role in ('lead','admin')
    )
  );

create policy "org" on saved_views for select
  using (scope = 'org' and auth.role() = 'authenticated');

create policy "org-write" on saved_views for insert, update, delete
  using (scope = 'org' and auth.jwt() ->> 'app_role' = 'admin');
```

The TypeScript `SavedView` type in `apps/web/src/components/shared/filters/schema.ts`
maps 1-to-1 onto this table. The in-memory/localStorage stub used in the Sell pilot
is a drop-in replacement; swap the read/write calls to fetch from `/api/saved-views`.

### 2. Smart-filter endpoints — dedicated per module

Each module gets its own backend route:

| Module | Endpoint |
|---|---|
| Sell | `POST /api/smart-filters/sell` |
| Buy | `POST /api/smart-filters/buy` |
| Make | `POST /api/smart-filters/make` |
| Plan | `POST /api/smart-filters/plan` |
| Ship | `POST /api/smart-filters/ship` |
| Book | `POST /api/smart-filters/book` |
| Control | `POST /api/smart-filters/control` |
| Shop-Floor | `POST /api/smart-filters/shop-floor` (operator hero card only) |

Request shape (all modules share this envelope):

```ts
interface SmartFilterRequest {
  module: string;       // e.g. "buy.orders"
  screen: string;       // e.g. "purchaseOrders"
  userId: string;
  groupId?: string;
  context: {
    currentFilters: Record<string, unknown>;
    recentPresets: string[];          // preset ids, most-recent-first
    dataHints?: Record<string, unknown>; // module-specific signals (see per-module docs)
  };
  prompt?: string;      // NL input from the "+ Filter (AI)" strip, if present
}
```

Response: `{ suggestions: FilterSuggestion[]; explanation?: string }`.

Each module endpoint is responsible for its own model/heuristics — there is no shared
AI surface re-used. The Sell pilot implementation lives in `apps/api/src/routes/smart-filters/sell.ts`
(or equivalent path once the API is structured); other modules follow the same file shape.

### 3. Group identity — ControlGroups confirmed

`groupId` in `SavedView` maps to `control_groups.id`. The `ControlGroups` feature
(`apps/web/src/components/control/ControlGroups.tsx`) is the authoritative group
registry. No narrower scope. Leads can share presets with any group they belong to
(enforced by the `group-write` RLS policy above).

### 4. Multi-currency on Book — enabled

Book ships with multi-currency. The `currency` facet is in-scope on:
- `book.invoices` (AR)
- `book.purchaseOrders` (AP)
- `book.wipValuation`
- `book.stockValuation`
- `book.jobProfitability`

Exchange-rate data prereq: add `baseCurrency: string` to org settings and
`displayCurrency: string` to the user profile; wire `GET /api/fx-rates?base=AUD&quote=USD,GBP,EUR`
(or Xero FX API if available via `XeroMappingPage.tsx:422`). All monetary facets
(`value`, `amount`, `balance`, `budget`) include a `currencyCode` field and a
`displayAmount` (converted to user's display currency at point-in-time rate).
