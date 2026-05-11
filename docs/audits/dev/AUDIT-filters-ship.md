# Ship Module — Filters, Search & Views Audit

Research-only review of the Ship (logistics / dispatch) module. Goal: surface where the current generic search-only chrome falls short of dispatch reality, and recommend module-specific filters, views, persistent date fields, presets and smart filters. Inspired by Odoo's group-by + filter-chip + favourite-search pattern.

## Snapshot

| Screen | Toolbar today | Views today | Module-specific filters? |
|---|---|---|---|
| ShipDashboard | none (AI feed + KPIs) | KPI grid + pipeline + charts | n/a |
| ShipOrders | `ToolbarSearch` + `IconViewToggle` | kanban / list | None — search-only |
| ShipShipping | `TextSegmentedControl` (Carriers / Rates / Manifests) | cards / rate-list / table | Hard-coded lane inputs only |
| ShipTracking | bare `Input` + Exceptions toggle | table + detail sheet | One toggle (`exceptionsOnly`) |
| ShipCarrierRates | none — sort headers only | table | None |
| ShipPackaging | n/a (pack-station single-order UI) | split panel | n/a |
| ShipBillOfLading | n/a (document preview) | document | n/a |
| ShipReturns | `FilterBar` (search only) | table + sidebar stats | None |
| ShipScanToShip | n/a (single-order scan UI) | scan + carton summary | n/a |
| ShipWarehouse | `TextSegmentedControl` + `FilterBar` (inventory tab) | map / table / cycle-count | None |
| ShipReports | "This Week" button (cosmetic) | chart grid | None |
| ShipSettings | n/a (settings panels) | forms | n/a |

The dominant pattern is `ToolbarSearch` + tabs. **No screen carries a date range, status multi-select, carrier filter, region filter, weight band, priority, or saved view.** The data is shipping-shaped but the toolbar is generic-shaped.

---

## Per-screen findings

### ShipOrders.tsx — `apps/web/src/components/ship/ShipOrders.tsx`

**Current (lines 130–245):** kanban/list view toggle, free-text search, "Create shipment" CTA. Stages `Pick | Pack | Ship | Transit | Delivered` are only expressed as kanban columns. Stat cards (To Pick / To Pack / To Ship / Urgent) are static — **not clickable as filters** (`:216–229`).

**Irrelevant / weak:**
- Search alone — fine, but no chip-state to combine with carrier, due-date, urgency.
- Stat cards mimic filter chips visually but do nothing.

**Recommended filters:**
- **Stage** (multi: Pick, Pack, Ship, Transit, Delivered) — already a data field (`:35`).
- **Carrier** (multi: StarTrack, Toll, Aus Post, TNT, DHL, Sendle).
- **Urgent / priority** (boolean — model has `urgent` flag at `:41`).
- **Due window** ("Today", "≤1d", "≤2d", "Overdue") — `due` is a string today; needs typed date.
- **Weight band** (≤5 kg / 5–25 kg / 25–100 kg / Pallet).
- **Customer** (typeahead).
- **Has issue** (boolean — `issues` state at `:141`).

**Recommended views:**
- Keep kanban + list.
- **Add Calendar** keyed on dispatch/ETA (lots of "due" data, no calendar surface).
- **Add Map** by destination (no destination geo on `Order` today — schema gap, see notes).

**Persistent date fields:** A **due-date / dispatch-date** picker belongs always-visible in the toolbar (current `due` field is a free-text string like "2d" / "Today" — should be a real date and a default "Today + next 2 days" range).

**Preset opportunities:**
- Personal: "My pack queue today", "My urgent shipments".
- Shared: "Today's dispatch board" (Ship stage, dispatching today), "At-risk — picking too slow", "Overdue picks", "Pallet freight only".

### ShipShipping.tsx — `apps/web/src/components/ship/ShipShipping.tsx`

**Current (lines 87–139):** segmented control Carriers / Rates / Manifests. No filter chrome anywhere on Carriers tab. Manifests table has no filter/search at all (`:248–263`). Rates tab uses hard-coded inputs (From / To / Weight / Dims) at `:177–186`.

**Recommended filters:**
- **Carriers tab:** active status, performance band (≥95% on-time / 90–94 / <90), service type (express / road / parcel).
- **Rates tab:** carrier multi-select, max transit days, max cost, pickup-available, service type, hazmat-capable.
- **Manifests tab:** carrier, status (Open / Closed), date range, has-undocumented-items flag.

**Recommended views:**
- Manifests: add **Calendar by manifest date** (dispatch calendar) and **Group-by carrier**.

**Persistent date fields:** Manifest **date range** should sit in the toolbar (default: last 7 days). The "From / To" lane on Rates tab should be a saved-preference, not a fresh entry each visit.

**Presets:**
- "Open manifests — close before 4pm cut-off"
- "Sub-90% carriers" (carriers tab)
- "Cheapest pickup-available rates for this lane"

### ShipTracking.tsx — `apps/web/src/components/ship/ShipTracking.tsx`

**Current (lines 137–184):** single boolean toggle (`exceptionsOnly` `:97`) and a non-functional standalone search input (`:171–174` — not wired to filter state, only `exceptionsOnly` filters the table at `:98`).

**Irrelevant / broken:** the search box has no handler — dead UI.

**Recommended filters:**
- **Status** (multi: shipped / transit / delivering / delivered / exception — already typed at `:20`).
- **Carrier** (multi).
- **ETA window** (Today / Tomorrow / This week / Overdue).
- **Customer** typeahead.
- **Destination region/state** (NSW/VIC/QLD/…) — currently missing from data; address only on detail panel `:217`.
- **Value band** (`amount` exists at `:35`) — high-value shipments deserve priority surfacing.
- **Time since last update** ("> 24h silent") — `updated` is a relative string; should be typed.

**Recommended views:**
- **Add Map** by destination — biggest gap on this screen. ETA + last-known-location is the natural map use.
- **Add Calendar** by ETA — shows on-the-day delivery load.
- Keep list as default.

**Persistent date fields:** ETA range (Today + next 7 days default) always visible.

**Presets:**
- "Exceptions board" (replace the toggle)
- "Delivering today" (operations stand-up view)
- "Silent > 24h" (escalation queue)
- "High-value in transit" (>$10k)
- Personal: "My customer shipments" for account managers.

### ShipCarrierRates.tsx — `apps/web/src/components/ship/ShipCarrierRates.tsx`

**Current (lines 21–138):** sortable table only. No filters, no search, no view toggle. Page is read-only price comparison.

**Recommended filters:** carrier multi-select, max price, max days, pickup-available, service tier. Even a simple `ToolbarFilterPills` on service (Express / Standard / Economy) would help.

**Views:** OK as table; could add **Card comparison view** (already exists as `CarrierComparisonCard.tsx` — reuse).

**Persistent fields:** lane (From / To) + parcel weight should be the persistent header — this is the *one* page where dim/weight inputs are the whole purpose.

**Presets:** "Cheapest next-day", "Pickup-available only", "Under 2 days transit".

### ShipReturns.tsx — `apps/web/src/components/ship/ShipReturns.tsx`

**Current (lines 88–162):** `FilterBar` with search only (`:114–118`). Status, reason, age are all visible in the table but not filterable.

**Recommended filters:**
- **Status** (multi: pending / approved / in_transit / received / refunded / closed).
- **Reason** (Defective / Damaged / Wrong Item / Change of Mind / Other — data at `:54–58`).
- **Age band** (>14 days = ageing).
- **Refund amount band**.
- **Customer** typeahead.
- **Carrier** (for inbound returns).

**Views:** Add **Kanban by RMA status** — RMA lifecycle is a natural board. Currently only list.

**Persistent date fields:** "Created in last 30 days" default range.

**Presets:**
- "Pending approval — needs review"
- "Received but not refunded"
- "Returns under investigation" (Defective / Damaged)
- "Ageing > 14 days"

### ShipWarehouse.tsx — `apps/web/src/components/ship/ShipWarehouse.tsx`

**Current (lines 115–243):** segmented control Map / Inventory / Cycle count. Inventory tab uses `FilterBar` (search only) at `:189–198`. Cycle count and Map tabs have no filter chrome.

**Recommended filters:**
- **Inventory:** zone (Receiving / Storage / Pick Face / Pack / Dispatch / Returns), stock status (OK / Low / Empty / Reserved), bin row (A / B / C / D), turnover band.
- **Cycle count:** assigned-to, zone, variance state (counted-ok / variance / uncounted).
- **Map:** utilisation band (heatmap legend should be interactive).

**Views:** Map already exists. Add **Group-by zone** to inventory list.

**Presets:** "Low + empty across all zones", "My zone today" (counter view), "Variances to investigate".

### ShipReports.tsx — `apps/web/src/components/ship/ShipReports.tsx`

**Current (lines 75–87):** cosmetic "This Week" button + Export. No filter, no actual range picker.

**Recommended filters:** date range, carrier, destination state, customer segment.

**Persistent fields:** **Real date range picker** in the toolbar (currently faux). Add carrier and region filters that propagate across all charts.

### ShipDashboard / ShipPackaging / ShipBillOfLading / ShipScanToShip / ShipSettings

Detail / single-record / settings surfaces — no list/grid/board/map, no filter need. ShipDashboard could expose **AI feed module filters** (scope by carrier / region) but is otherwise fine.

---

## Cross-cutting recommendations

1. **Adopt `ToolbarFilterPills` + filter-chip popovers** (already in `PageToolbar.tsx:111`) across Orders, Tracking, Returns. Stat cards at the top of each page should be **clickable filter shortcuts**, not static.
2. **Make stat cards filter-active** — Orders' "To Pick / Urgent" tiles (`ShipOrders.tsx:216`) and Tracking's "Exceptions / Delivering" tiles (`ShipTracking.tsx:156`) should set filter state on click.
3. **Typed dates everywhere** — `due` strings like "2d" / "Today" (`ShipOrders.tsx:39`) and `eta` strings like "03 Mar" / "Delayed" (`ShipTracking.tsx:32`) need to be real timestamps so date filters and Calendar view become possible.
4. **Persistent date bar** — Orders (dispatch date), Tracking (ETA), Returns (created), Manifests (date), Reports (range) all benefit from an always-visible date range with "Today / This week / Custom" presets.
5. **Map + Route view** are absent from the entire module despite being the most natural shipping affordance — start with Tracking (destinations) and Orders (dispatch routes).
6. **Saved views** ("favourites" in Odoo terms) — every list should support naming + sharing a filter combo. None do today.

## Smart / AI filter ideas (cross-module)

1. **"Orders unlikely to ship on time"** — combines current picking pace, carrier cut-off time, urgency flag (Orders).
2. **"Destinations with rising exceptions"** — last-7-day delta vs prior 7 by destination state/postcode (Tracking + Reports).
3. **"Loads underfilled — consolidate"** — same-carrier same-day same-region manifests below pallet threshold (Manifests).
4. **"Silent shipments"** — in transit with no carrier event > N hours, weighted by value (Tracking).
5. **"Likely return — investigate proactively"** — customers with recent damage RMAs shipping same SKU again (Returns + Orders).
6. **"Cheapest viable route for this parcel"** — agent pick already prototyped (`ShipShipping.tsx:34`); promote to a saved smart filter on Rates.
7. **"Cycle count drift"** — bins with repeated variance in last 90 days (Warehouse).

## Schema gaps that block module-specific filters

- `Order` has no destination address / region (`ShipOrders.tsx:37`) — blocks map / region filters.
- `Shipment` has no driver, vehicle, route id (`ShipTracking.tsx:30`) — blocks route/load views.
- No hazmat / oversize / COD flag on orders or shipments — common shipping filter dimensions.
- `due` and `eta` are strings, not dates — blocks any temporal filter or calendar.

Fixing the four above unlocks roughly 80% of the recommendations.
