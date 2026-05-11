# Ship — Filters, Search & Views Migration Plan

**Status:** Plan · **Date:** 2026-05-11 · **Owner:** Matt
**Pilot reference:** Sell module landed at commit `d4f0c565` — same shape applies here.
**Audit source:** `docs/audits/dev/AUDIT-filters-ship.md`
**Cross-module spec:** `docs/plans/FILTERS-REDESIGN.md`

The Ship module is the most schema-blocked of the suite. Most filter/view recommendations require typed dates and a handful of missing model fields (destination region, driver, vehicle, route, hazmat, COD). This plan sequences the data prerequisites first, then migrates each list/board screen onto the schema-driven `ModuleFilterBar` already proven in Sell.

Design rules confirmed by the pilot (applied here without restatement):

- Schema-driven `FilterSchema` per screen.
- Lucide icons only on system presets, with `iconTone`: `yellow | info | success | warning | error | neutral`. Yellow tile = dark icon.
- Heights C built into bar/chips.
- Date quick-range set: `today / yesterday / thisWeek / next7days / thisMonth / lastMonth / thisQuarter / thisYear / ytd / lastYear`. Defaults: `[today, thisWeek, thisMonth, thisQuarter, thisYear]`.
- Three-role vocab only: admin / lead / team.
- System presets seeded once via `registerSystemPresets(MODULE_ID, [...])`.

In-scope screens: `ShipOrders`, `ShipShipping` (Carriers / Rates / Manifests), `ShipTracking`, `ShipCarrierRates`, `ShipReturns`, `ShipWarehouse`, `ShipReports`.
Out-of-scope: `ShipDashboard`, `ShipPackaging`, `ShipBillOfLading`, `ShipScanToShip`, `ShipSettings` (single-record / settings surfaces — no list chrome).

---

## 0. Required data work (ordered prerequisites)

These blockers come straight from the audit's "Schema gaps" section (`AUDIT-filters-ship.md:184`). Roughly 80% of the per-screen recommendations below need at least one of them. Land them before the screen migrations.

| # | Field | On model | Why it blocks filters |
|---|---|---|---|
| 1 | `due: string` → `dueAt: ISODate` | `Order` (`ShipOrders.tsx:39`) | Today's "2d" / "Today" strings can't power a date facet, Calendar view, or "Overdue" bucket. |
| 2 | `eta: string` → `etaAt: ISODate` | `Shipment` (`ShipTracking.tsx:32`) | Same — blocks ETA window facet, Calendar by ETA, "Delivering today" preset. |
| 3 | `updated: string` → `lastEventAt: ISODate` | `Shipment` (`ShipTracking.tsx:30`) | Required for "Silent > 24h" smart filter. |
| 4 | `destination: { line1; suburb; state; postcode; country; lat?; lng? }` | `Order`, `Shipment` (`ShipOrders.tsx:37`) | Unlocks region facet, Map view, route grouping. |
| 5 | `driverId`, `vehicleId`, `routeId` | `Shipment` | Unlocks route/load planning view, driver swimlanes, "Loads underfilled" smart filter. |
| 6 | `hazmat: boolean`, `oversize: boolean`, `cod: { amount, currency } \| null` | `Order`, `Shipment` | Common shipping filter dimensions; service-type matching on Rates. |
| 7 | `weightKg: number`, `lengthCm`, `widthCm`, `heightCm` (already partial on `Order`) | `Order` | Weight band facet; dim/weight persistence on `ShipCarrierRates`. |

Suggested PR order:

1. **PR-S0a — typed dates.** `dueAt`, `etaAt`, `lastEventAt`. Update mock generators in `apps/web/src/services/` to ISO. Leave the string fields as deprecated aliases for one PR window.
2. **PR-S0b — destination + dims.** Add `destination` block + `weightKg`/dims to mocks. Lat/lng optional (mock Australia centroids OK; needed for Map).
3. **PR-S0c — fleet + flags.** `driverId`, `vehicleId`, `routeId`, `hazmat`, `oversize`, `cod`. Seed 4–6 drivers / 6–8 vehicles / 3–5 routes in `services/`.

After PR-S0c lands, screens can be migrated in any order. Tracking + Orders give the most visible win and should go first.

---

## 1. ShipOrders — `apps/web/src/components/ship/ShipOrders.tsx`

**Current state.** Kanban + list, free-text search, "Create shipment" CTA (`ShipOrders.tsx:130-245`). Stage column is `Pick | Pack | Ship | Transit | Delivered`. Stat cards at `ShipOrders.tsx:216-229` look like filter chips but are decorative.

**Module id:** `ship.orders`
**Default view:** `kanban` (preserve today's default).
**Date facet:** `dueAt` (dispatch date) — persistent chip.

### Filter schema

```ts
const MODULE_ID = 'ship.orders';

const ordersFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Ship orders',
  facets: [
    {
      id: 'stage',
      label: 'Stage',
      kind: 'multi',
      icon: Columns3,
      pinned: true,
      options: [
        { value: 'pick',      label: 'Pick',      color: 'var(--neutral-400)' },
        { value: 'pack',      label: 'Pack',      color: 'var(--mw-yellow-300)' },
        { value: 'ship',      label: 'Ship',      color: 'var(--mw-yellow-500)' },
        { value: 'transit',   label: 'Transit',   color: 'var(--mw-mirage)' },
        { value: 'delivered', label: 'Delivered', color: 'var(--mw-success)' },
      ],
    },
    {
      id: 'carrier',
      label: 'Carrier',
      kind: 'multi',
      icon: Truck,
      pinned: true,
      options: [
        { value: 'startrack', label: 'StarTrack' },
        { value: 'toll',      label: 'Toll' },
        { value: 'auspost',   label: 'Aus Post' },
        { value: 'tnt',       label: 'TNT' },
        { value: 'dhl',       label: 'DHL' },
        { value: 'sendle',    label: 'Sendle' },
      ],
    },
    { id: 'urgent',     label: 'Urgent',      kind: 'boolean', icon: Zap },
    { id: 'hasIssue',   label: 'Has issue',   kind: 'boolean', icon: AlertTriangle },
    { id: 'hazmat',     label: 'Hazmat',      kind: 'boolean', icon: Flame },
    { id: 'cod',        label: 'COD',         kind: 'boolean', icon: DollarSign },
    {
      id: 'weightBand',
      label: 'Weight',
      kind: 'multi',
      icon: Weight,
      options: [
        { value: 'lt5',    label: '≤ 5 kg' },
        { value: '5to25',  label: '5–25 kg' },
        { value: '25to100',label: '25–100 kg' },
        { value: 'pallet', label: 'Pallet' },
      ],
    },
    {
      id: 'region',
      label: 'Destination',
      kind: 'multi',
      icon: MapPin,
      options: [
        { value: 'NSW', label: 'NSW' }, { value: 'VIC', label: 'VIC' },
        { value: 'QLD', label: 'QLD' }, { value: 'WA',  label: 'WA' },
        { value: 'SA',  label: 'SA'  }, { value: 'TAS', label: 'TAS' },
        { value: 'ACT', label: 'ACT' }, { value: 'NT',  label: 'NT' },
      ],
    },
    { id: 'customer',   label: 'Customer',    kind: 'select', icon: User /* customerOptions */ },
    { id: 'owner',      label: 'Owner',       kind: 'user',   icon: UserCircle /* employees */ },
    {
      id: 'dueAt',
      label: 'Dispatch',
      kind: 'date',
      icon: Calendar,
      placeholder: 'Any date',
      // defaults to DEFAULT_QUICK_RANGES — explicit override only if needed.
    },
  ],
  viewModes: [
    { id: 'kanban',   label: 'Kanban',   icon: Columns3,  groupBy: 'stage' },
    { id: 'list',     label: 'List',     icon: ListIcon },
    { id: 'calendar', label: 'Calendar', icon: Calendar,  groupBy: 'dueAt' },
    { id: 'map',      label: 'Map',      icon: MapPin },
  ],
  defaultView: 'kanban',
  dateFacetId: 'dueAt',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Today's dispatch board | `Truck` | `yellow` | `stage: ['ship']`, `dueAt: quickRange('today')`, view `kanban` |
| Overdue picks | `AlertTriangle` | `error` | `stage: ['pick']`, `dueAt: { to: today-1 }`, view `list` |
| Urgent — any stage | `Zap` | `warning` | `urgent: true`, view `kanban` |
| Pallet freight only | `Package` | `info` | `weightBand: ['pallet']`, view `list` |
| At-risk — picking too slow | `Activity` | `error` | smart-filter (see §1 smart ideas), view `kanban` |

### Smart-filter ideas

- "Orders unlikely to ship on time at current picking pace" (combines stage age, carrier cut-off, urgent flag).
- "Loads to consolidate" — same carrier + same day + same region, below pallet threshold.
- "Risky destinations" — destinations with rising exceptions in last 7 days (cross-screen with Tracking).
- "Carrier mismatch" — orders flagged hazmat going to a non-hazmat-capable carrier.

### Behavioural rewires

- Stat cards at `ShipOrders.tsx:216-229` become **filter shortcuts** — click "To Pick" → applies `stage: ['pick']` on the live `filters` state. (Pattern: `SellOpportunities.tsx` `ToolbarSummaryBar` setup.)

### Out of scope (this screen)

- Operator-collapse rendering (handled in the Shop-floor migration plan).
- Real route planning UI (Map view shows pins only; route lines wait until `routeId` is wired into a routing service).

---

## 2. ShipShipping — `apps/web/src/components/ship/ShipShipping.tsx`

**Current state.** Segmented control Carriers / Rates / Manifests (`ShipShipping.tsx:87-139`). No filter chrome on Carriers. Rates tab uses fresh-every-visit hard-coded inputs (`:177-186`). Manifests has neither search nor filter (`:248-263`).

This screen is three datasets under one route. Each gets its own `FilterSchema`; the tab control is preserved.

### 2a. Carriers tab

**Module id:** `ship.carriers`
**Default view:** `card` (current is a card grid).
**Date facet:** none.

```ts
const carriersFilterSchema: FilterSchema = {
  module: 'ship.carriers',
  label: 'Carriers',
  facets: [
    {
      id: 'active', label: 'Active', kind: 'boolean', icon: CheckCircle, pinned: true,
    },
    {
      id: 'performance',
      label: 'On-time band',
      kind: 'multi',
      icon: Activity,
      pinned: true,
      options: [
        { value: 'ge95', label: '≥ 95%' },
        { value: '90to94', label: '90–94%' },
        { value: 'lt90', label: '< 90%' },
      ],
    },
    {
      id: 'serviceType',
      label: 'Service',
      kind: 'multi',
      icon: Truck,
      options: [
        { value: 'express', label: 'Express' },
        { value: 'road',    label: 'Road' },
        { value: 'parcel',  label: 'Parcel' },
        { value: 'pallet',  label: 'Pallet' },
      ],
    },
    { id: 'hazmatCapable', label: 'Hazmat capable', kind: 'boolean', icon: Flame },
  ],
  viewModes: [
    { id: 'card', label: 'Cards', icon: Grid3x3 },
    { id: 'list', label: 'List',  icon: ListIcon },
  ],
  defaultView: 'card',
};
```

**Presets**

| Name | Icon | Tone |
|---|---|---|
| Sub-90% carriers | `AlertTriangle` | `error` |
| Active hazmat-capable | `Flame` | `warning` |
| Express only | `Zap` | `yellow` |

### 2b. Rates tab

**Module id:** `ship.rates`
**Default view:** `list`.
**Date facet:** none (lane parameters drive this screen).

```ts
const ratesFilterSchema: FilterSchema = {
  module: 'ship.rates',
  label: 'Rates',
  facets: [
    { id: 'carrier',     label: 'Carrier',    kind: 'multi',  icon: Truck, pinned: true /* carrierOptions */ },
    { id: 'serviceType', label: 'Service',    kind: 'multi',  icon: Layers, pinned: true /* sameAsCarriers */ },
    { id: 'pickupAvailable', label: 'Pickup available', kind: 'boolean', icon: Hand, pinned: true },
    { id: 'hazmatCapable',   label: 'Hazmat capable',   kind: 'boolean', icon: Flame },
    { id: 'maxTransitDays',  label: 'Max transit days', kind: 'range',   icon: Clock },
    { id: 'maxCost',         label: 'Max cost',         kind: 'range',   icon: DollarSign },
    // Lane (from / to / weight / dims) lives in a sibling lane-input bar — not a facet.
    // The schema participates in URL state so a saved preset can persist the lane.
    { id: 'fromPostcode', label: 'From',       kind: 'select', icon: MapPin, persistent: true },
    { id: 'toPostcode',   label: 'To',         kind: 'select', icon: MapPin, persistent: true },
    { id: 'weightKg',     label: 'Weight (kg)', kind: 'range', icon: Weight, persistent: true },
  ],
  viewModes: [
    { id: 'list', label: 'List',    icon: ListIcon },
    { id: 'card', label: 'Compare', icon: Grid3x3 },
  ],
  defaultView: 'list',
};
```

**Presets**

| Name | Icon | Tone |
|---|---|---|
| Cheapest pickup-available | `Hand` | `success` |
| Under 2-day transit | `Zap` | `yellow` |
| Hazmat-capable lanes | `Flame` | `error` |

### 2c. Manifests tab

**Module id:** `ship.manifests`
**Default view:** `list`. Add `calendar` keyed on manifest date.
**Date facet:** `manifestDate` (default: `thisWeek`).

```ts
const manifestsFilterSchema: FilterSchema = {
  module: 'ship.manifests',
  label: 'Manifests',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'open',   label: 'Open',   color: 'var(--mw-yellow-400)' },
        { value: 'closed', label: 'Closed', color: 'var(--neutral-400)' },
      ],
    },
    { id: 'carrier', label: 'Carrier', kind: 'multi', icon: Truck, pinned: true /* carrierOptions */ },
    { id: 'hasUndocumented', label: 'Has undocumented items', kind: 'boolean', icon: AlertTriangle },
    { id: 'manifestDate', label: 'Date', kind: 'date', icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'list',     label: 'List',     icon: ListIcon },
    { id: 'calendar', label: 'Calendar', icon: Calendar, groupBy: 'manifestDate' },
  ],
  defaultView: 'list',
  dateFacetId: 'manifestDate',
};
```

**Presets**

| Name | Icon | Tone |
|---|---|---|
| Open — close before 4pm cut-off | `Clock` | `warning` |
| Closed this week | `CheckCircle` | `success` |
| Has undocumented items | `AlertTriangle` | `error` |

### Smart-filter ideas (Shipping tab cluster)

- "Cheapest viable route for this parcel" — promote the agent pick already prototyped at `ShipShipping.tsx:34` into a `ship.rates` smart suggestion.
- "Underfilled loads to consolidate" (Manifests).
- "Carrier dropping below SLA" — performance band trending down week over week (Carriers).

### Out of scope

- Replacing the Carriers / Rates / Manifests tab control with three top-level routes (deferred).
- Live carrier-API rate quoting (mock-data only).

---

## 3. ShipTracking — `apps/web/src/components/ship/ShipTracking.tsx`

**Current state.** `exceptionsOnly` toggle (`ShipTracking.tsx:97`) and a **dead** search input with no handler (`:171-174`). Filtering happens only at `:98`.

**Module id:** `ship.tracking`
**Default view:** `list`.
**Date facet:** `etaAt` (always-visible chip; default `next7days` once typed).

### Filter schema

```ts
const trackingFilterSchema: FilterSchema = {
  module: 'ship.tracking',
  label: 'Tracking',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'shipped',    label: 'Shipped',    color: 'var(--neutral-400)' },
        { value: 'transit',    label: 'In transit', color: 'var(--mw-mirage)' },
        { value: 'delivering', label: 'Delivering', color: 'var(--mw-yellow-500)' },
        { value: 'delivered',  label: 'Delivered',  color: 'var(--mw-success)' },
        { value: 'exception',  label: 'Exception',  color: 'var(--mw-error)' },
      ],
    },
    { id: 'carrier',  label: 'Carrier',  kind: 'multi',  icon: Truck,  pinned: true /* carrierOptions */ },
    { id: 'region',   label: 'Destination', kind: 'multi', icon: MapPin /* state options as in Orders */ },
    { id: 'customer', label: 'Customer', kind: 'select', icon: User /* customerOptions */ },
    {
      id: 'valueBand',
      label: 'Value',
      kind: 'multi',
      icon: DollarSign,
      options: [
        { value: 'lt1k',   label: '< $1k' },
        { value: '1to10k', label: '$1k–$10k' },
        { value: 'gt10k',  label: '> $10k' },
      ],
    },
    { id: 'silentOver24h', label: 'Silent > 24h', kind: 'boolean', icon: Clock },
    {
      id: 'etaAt',
      label: 'ETA',
      kind: 'date',
      icon: Calendar,
      quickRanges: ['today', 'next7days', 'thisWeek', 'thisMonth'],
      placeholder: 'Any date',
    },
  ],
  viewModes: [
    { id: 'list',     label: 'List',     icon: ListIcon },
    { id: 'map',      label: 'Map',      icon: MapPin },
    { id: 'calendar', label: 'Calendar', icon: Calendar, groupBy: 'etaAt' },
  ],
  defaultView: 'list',
  dateFacetId: 'etaAt',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Exceptions board | `AlertTriangle` | `error` | `status: ['exception']`, view `list` (replaces toggle) |
| Delivering today | `Truck` | `yellow` | `status: ['delivering']`, `etaAt: quickRange('today')`, view `map` |
| Silent > 24h | `Clock` | `warning` | `silentOver24h: true`, view `list` |
| High-value in transit | `DollarSign` | `info` | `status: ['transit']`, `valueBand: ['gt10k']`, view `list` |

### Smart-filter ideas

- "Destinations with rising exceptions" (last 7d vs prior 7d delta by state/postcode).
- "Predicted late" — carrier history + traffic-aware ETA delta > X hours.
- "Customer impact stack" — concentrate exceptions by customer for account-manager triage.

### Behavioural rewires

- Remove the dead search input (`ShipTracking.tsx:171-174`); the new bar's search owns it.
- Stat cards (`ShipTracking.tsx:156`) become filter shortcuts that set `status` / `silentOver24h`.

### Out of scope

- Real geolocation / carrier-webhook ingestion. Map shows static destination pins; the route polyline waits on `routeId`.

---

## 4. ShipCarrierRates — `apps/web/src/components/ship/ShipCarrierRates.tsx`

**Current state.** Sortable table only, no filters, no search, no view toggle (`ShipCarrierRates.tsx:21-138`). `CarrierComparisonCard.tsx` already exists and is unused.

**Module id:** `ship.carrierRates`
**Default view:** `list`. Add `card` (re-use `CarrierComparisonCard`).
**Date facet:** none. Lane parameters are persistent facets on the schema (so saved presets remember them).

### Filter schema

```ts
const carrierRatesFilterSchema: FilterSchema = {
  module: 'ship.carrierRates',
  label: 'Carrier rates',
  facets: [
    { id: 'carrier',          label: 'Carrier', kind: 'multi', icon: Truck, pinned: true /* carrierOptions */ },
    {
      id: 'serviceTier',
      label: 'Tier',
      kind: 'multi',
      icon: Layers,
      pinned: true,
      options: [
        { value: 'express',  label: 'Express'  },
        { value: 'standard', label: 'Standard' },
        { value: 'economy',  label: 'Economy'  },
      ],
    },
    { id: 'pickupAvailable', label: 'Pickup available', kind: 'boolean', icon: Hand },
    { id: 'maxPrice',        label: 'Max price',        kind: 'range',   icon: DollarSign },
    { id: 'maxDays',         label: 'Max days',         kind: 'range',   icon: Clock },

    // Lane parameters — persistent so they survive Clear all + reload.
    { id: 'fromPostcode', label: 'From',        kind: 'select', icon: MapPin, persistent: true },
    { id: 'toPostcode',   label: 'To',          kind: 'select', icon: MapPin, persistent: true },
    { id: 'weightKg',     label: 'Weight (kg)', kind: 'range',  icon: Weight, persistent: true },
  ],
  viewModes: [
    { id: 'list', label: 'List',    icon: ListIcon },
    { id: 'card', label: 'Compare', icon: Grid3x3 },
  ],
  defaultView: 'list',
};
```

### Presets

| Name | Icon | Tone |
|---|---|---|
| Cheapest next-day | `Zap` | `yellow` |
| Pickup-available only | `Hand` | `success` |
| Under 2 days transit | `Clock` | `info` |

### Smart-filter ideas

- "Best for this parcel" — model pick using shape/weight/destination (shares the agent already at `ShipShipping.tsx:34`).
- "Carrier you usually pick for this lane" — personal history-based.

### Out of scope

- Multi-carrier rate-shopping API integration.

---

## 5. ShipReturns — `apps/web/src/components/ship/ShipReturns.tsx`

**Current state.** `FilterBar` with search only (`ShipReturns.tsx:114-118`). Status, reason, age all visible in the table but un-filterable.

**Module id:** `ship.returns`
**Default view:** `list`. Add `kanban` by RMA status.
**Date facet:** `createdAt` (default `thisMonth`).

### Filter schema

```ts
const returnsFilterSchema: FilterSchema = {
  module: 'ship.returns',
  label: 'Returns',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'pending',    label: 'Pending',    color: 'var(--neutral-400)' },
        { value: 'approved',   label: 'Approved',   color: 'var(--mw-yellow-400)' },
        { value: 'in_transit', label: 'In transit', color: 'var(--mw-mirage)' },
        { value: 'received',   label: 'Received',   color: 'var(--mw-yellow-500)' },
        { value: 'refunded',   label: 'Refunded',   color: 'var(--mw-success)' },
        { value: 'closed',     label: 'Closed',     color: 'var(--neutral-300)' },
      ],
    },
    {
      id: 'reason',
      label: 'Reason',
      kind: 'multi',
      icon: AlertCircle,
      pinned: true,
      options: [
        { value: 'defective',     label: 'Defective' },
        { value: 'damaged',       label: 'Damaged' },
        { value: 'wrong_item',    label: 'Wrong item' },
        { value: 'change_of_mind',label: 'Change of mind' },
        { value: 'other',         label: 'Other' },
      ],
    },
    {
      id: 'ageBand',
      label: 'Age',
      kind: 'multi',
      icon: Clock,
      options: [
        { value: 'lt7',   label: '< 7 days' },
        { value: '7to14', label: '7–14 days' },
        { value: 'gt14',  label: '> 14 days (ageing)' },
      ],
    },
    { id: 'refundAmount', label: 'Refund amount', kind: 'range',  icon: DollarSign },
    { id: 'customer',     label: 'Customer',      kind: 'select', icon: User /* customerOptions */ },
    { id: 'carrier',      label: 'Carrier',       kind: 'multi',  icon: Truck /* carrierOptions */ },
    { id: 'createdAt',    label: 'Created',       kind: 'date',   icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'list',   label: 'List',   icon: ListIcon },
    { id: 'kanban', label: 'Kanban', icon: Columns3, groupBy: 'status' },
  ],
  defaultView: 'list',
  dateFacetId: 'createdAt',
};
```

### Presets

| Name | Icon | Tone |
|---|---|---|
| Pending approval — needs review | `AlertTriangle` | `warning` |
| Received but not refunded | `DollarSign` | `error` |
| Under investigation | `Search` | `info` |
| Ageing > 14 days | `Clock` | `error` |

### Smart-filter ideas

- "Likely-fraud RMAs" — repeat-return customers, high refund amounts (cross-module with Sell).
- "Proactive returns" — customers with recent damage RMAs shipping same SKU again.

### Out of scope

- RMA approval workflow itself; this plan only addresses the filter/search/view layer.

---

## 6. ShipWarehouse — `apps/web/src/components/ship/ShipWarehouse.tsx`

**Current state.** Segmented control Map / Inventory / Cycle count. Inventory tab uses search-only `FilterBar` (`ShipWarehouse.tsx:189-198`). Cycle count and Map tabs have no filter chrome.

Three schemas; tab control preserved.

### 6a. Inventory tab

**Module id:** `ship.warehouse.inventory`
**Default view:** `list`. Add `tree` by zone → bin row.
**Date facet:** none.

```ts
const warehouseInventoryFilterSchema: FilterSchema = {
  module: 'ship.warehouse.inventory',
  label: 'Inventory',
  facets: [
    {
      id: 'zone',
      label: 'Zone',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'receiving', label: 'Receiving' },
        { value: 'storage',   label: 'Storage'   },
        { value: 'pickFace',  label: 'Pick face' },
        { value: 'pack',      label: 'Pack'      },
        { value: 'dispatch',  label: 'Dispatch'  },
        { value: 'returns',   label: 'Returns'   },
      ],
    },
    {
      id: 'stockStatus',
      label: 'Stock',
      kind: 'multi',
      pinned: true,
      options: [
        { value: 'ok',       label: 'OK',       color: 'var(--mw-success)' },
        { value: 'low',      label: 'Low',      color: 'var(--mw-yellow-400)' },
        { value: 'empty',    label: 'Empty',    color: 'var(--mw-error)' },
        { value: 'reserved', label: 'Reserved', color: 'var(--mw-mirage)' },
      ],
    },
    {
      id: 'binRow',
      label: 'Bin row',
      kind: 'multi',
      icon: Grid3x3,
      options: ['A','B','C','D'].map((v) => ({ value: v, label: `Row ${v}` })),
    },
    {
      id: 'turnoverBand',
      label: 'Turnover',
      kind: 'multi',
      icon: Activity,
      options: [
        { value: 'fast', label: 'Fast (A)'  },
        { value: 'med',  label: 'Medium (B)' },
        { value: 'slow', label: 'Slow (C)'   },
      ],
    },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'tree', label: 'By zone', icon: FolderTree, groupBy: 'zone' },
  ],
  defaultView: 'list',
};
```

**Presets:** "Low + empty (all zones)" (`AlertTriangle`, `error`); "Dispatch zone today" (`Truck`, `yellow`); "Slow movers in pick face" (`Snail`, `neutral`).

### 6b. Cycle count tab

**Module id:** `ship.warehouse.cycleCount`
**Default view:** `list`.
**Date facet:** `scheduledAt` (default `thisWeek`).

Facets: `assignedTo` (user), `zone` (multi, same options as Inventory), `varianceState` (multi: `counted_ok | variance | uncounted`), `scheduledAt` (date).

View modes: `list`, `kanban` by `varianceState`, `calendar` by `scheduledAt`.

**Presets:** "My zone today" (`User`, `yellow`); "Variances to investigate" (`AlertTriangle`, `error`); "Uncounted this week" (`Clock`, `warning`).

### 6c. Map tab

**Module id:** `ship.warehouse.map`
**Default view:** `map`.
**Date facet:** none.

Facets: `utilisationBand` (multi: `lt50 | 50to80 | gt80`), `zone` (multi), `hazmatPresent` (boolean).
Map legend tiles wire to these facets so clicking a band filters live (`AUDIT-filters-ship.md:147`).

**Presets:** "Hot zones (>80% util)" (`Flame`, `error`); "Empty pockets" (`Square`, `info`); "Hazmat locations" (`Flame`, `warning`).

### Out of scope

- True 3D / isometric warehouse view (separate Shop-floor plan).
- Cycle-count assignment workflow.

---

## 7. ShipReports — `apps/web/src/components/ship/ShipReports.tsx`

**Current state.** Cosmetic "This Week" button (`ShipReports.tsx:75-87`) — not a real range picker. Export button. No carrier or region filtering propagates to charts.

**Module id:** `ship.reports`
**Default view:** `card` (chart grid). No tabular view.
**Date facet:** `period` — persistent. Default `thisMonth`. Override quick-ranges to a finance-friendly set.

### Filter schema

```ts
const reportsFilterSchema: FilterSchema = {
  module: 'ship.reports',
  label: 'Ship reports',
  facets: [
    {
      id: 'period',
      label: 'Period',
      kind: 'date',
      icon: Calendar,
      quickRanges: ['thisWeek', 'thisMonth', 'lastMonth', 'thisQuarter', 'thisYear', 'ytd', 'lastYear'],
      placeholder: 'This month',
    },
    { id: 'carrier',  label: 'Carrier',  kind: 'multi',  icon: Truck,  pinned: true /* carrierOptions */ },
    { id: 'region',   label: 'Destination', kind: 'multi', icon: MapPin /* state options */ },
    { id: 'customerSegment', label: 'Customer segment', kind: 'multi', icon: Users, options: [
      { value: 'retail',     label: 'Retail'     },
      { value: 'wholesale',  label: 'Wholesale'  },
      { value: 'enterprise', label: 'Enterprise' },
    ] },
    { id: 'compareYoy', label: 'Compare YoY', kind: 'boolean', icon: TrendingUp },
  ],
  viewModes: [
    { id: 'card', label: 'Charts', icon: Grid3x3 },
  ],
  defaultView: 'card',
  dateFacetId: 'period',
};
```

### Presets

| Name | Icon | Tone |
|---|---|---|
| This week (ops standup) | `Calendar` | `yellow` |
| MTD vs LTD | `TrendingUp` | `info` |
| QTD by carrier | `Truck` | `neutral` |

### Smart-filter ideas

- "Carrier mix drift" — week-over-week share change > 10 pts.
- "Region anomaly" — destination state with exception rate 2σ above trend.

### Out of scope

- Drill-through into Tracking / Orders from a chart segment (cross-screen wiring; later PR).

---

## Cross-screen rollout sequence

1. **PR-S0a / b / c** — schema fixes (above).
2. **PR-S1** — `ShipTracking` (highest visible win; broken search today).
3. **PR-S2** — `ShipOrders` (largest user surface).
4. **PR-S3** — `ShipReturns` (small surface, immediate kanban win).
5. **PR-S4** — `ShipShipping` (three sub-schemas; ship behind one PR each if needed).
6. **PR-S5** — `ShipCarrierRates` (depends on `weightKg`/dims fields).
7. **PR-S6** — `ShipWarehouse` (three sub-schemas; can land per tab).
8. **PR-S7** — `ShipReports` (depends on typed dates from S0a).

Each migration PR:

- Mounts `ModuleFilterBar` + `useModuleFilters` (pilot pattern from `SellOpportunities.tsx`).
- Wires `applyFilters` with a `getFacetValue` switch.
- Calls `registerSystemPresets(MODULE_ID, [...])` once at module load.
- Deletes the screen's bespoke `Input` / `ToolbarSearch` / `FilterBar` instance.
- Makes any stat cards above the bar dispatch filter changes (no longer decorative).

## Cross-cutting out-of-scope

- Operator-mode collapse (covered by Shop-floor plan; Ship module retains desktop layout for now).
- `SavedView` server persistence — uses in-memory store via `registerSystemPresets` plus the personal-preset hook from the pilot.
- Real carrier-API integration for rates / tracking events.
- Route polyline rendering on the Tracking and Orders Map views (waits on `routeId` + a routing service).
- Smart-filter implementations — schema slot is reserved (`smart?: SmartFilterConfig`) but model wiring lands behind the global flag in `FILTERS-REDESIGN.md` §11 step 7.

## References

- Audit — `docs/audits/dev/AUDIT-filters-ship.md`
- Cross-module spec — `docs/plans/FILTERS-REDESIGN.md`
- Schema types — `apps/web/src/components/shared/filters/schema.ts`
- Date quick-ranges — `apps/web/src/components/shared/filters/DateChip.tsx`
- Pilot — `apps/web/src/components/sell/SellOpportunities.tsx`, `SellInvoices.tsx`, `SellOrders.tsx`
