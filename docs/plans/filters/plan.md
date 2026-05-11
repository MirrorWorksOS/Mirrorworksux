# Plan Module — Filter, Search & View Migration

**Status:** Plan · **Date:** 2026-05-11 · **Owner:** Matt
**Source audit:** `docs/audits/dev/AUDIT-filters-plan.md`
**Pilot reference:** Sell module (commit `d4f0c565`) — `SellOpportunities.tsx`, `SellInvoices.tsx`, `SellOrders.tsx`
**Cross-module design:** `docs/plans/FILTERS-REDESIGN.md`

Applies the schema-driven `ModuleFilterBar` to every list/board screen in
`apps/web/src/components/plan/`. Plan is the most view-mode-rich module —
gantt, BOM tree, MRP weekly grid and a nesting layout all need first-class
entries in `viewModes`. Most screens mount a stub `ToolbarFilterButton` that
opens nothing; date-driven screens are hard-coded to a fixed `MONTH_BASE`.

## 0. Shared conventions

- Module ids: `plan.<screen>`.
- Lucide icons only on system presets. `iconTone` ∈ `yellow | info | success | warning | error | neutral`. Yellow tile = dark icon.
- Heights C: chips/search/view-toggle 40px, primary CTA 48px.
- Date quick-range default: `[today, thisWeek, thisMonth, thisQuarter, thisYear]`; per-screen overrides noted inline.
- Three-role vocab: admin / lead / team. Lead can share to group; admin pins org-wide.

---

## 1. PlanJobs — `apps/web/src/components/plan/PlanJobs.tsx`

**Current.** Search at `PlanJobs.tsx:199` is **not applied** to render. Stub filter
button at `:201`. Kanban/List/Card toggle at `:202-210` (Card duplicates Kanban).
Summary stack at `:455-463`.

```ts
const jobsFilterSchema: FilterSchema = {
  module: 'plan.jobs',
  label: 'Jobs',
  facets: [
    { id: 'stage', label: 'Stage', kind: 'multi', icon: Workflow, pinned: true, options: [
      { value: 'draft', label: 'Draft' }, { value: 'planning', label: 'Planning' },
      { value: 'scheduled', label: 'Scheduled' }, { value: 'in-progress', label: 'In progress' },
      { value: 'on-hold', label: 'On hold' }, { value: 'complete', label: 'Complete' },
    ]},
    { id: 'priority', label: 'Priority', kind: 'multi', icon: Flag, pinned: true, options: [
      { value: 'urgent', label: 'Urgent' }, { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
    ]},
    { id: 'owner', label: 'Planner', kind: 'user', icon: User },
    { id: 'customer', label: 'Customer', kind: 'select', icon: Building2 },
    { id: 'materialReadiness', label: 'Material', kind: 'multi', icon: Package, options: [
      { value: 'ready', label: 'Ready', color: 'var(--mw-success)' },
      { value: 'short', label: 'Short', color: 'var(--mw-warning)' },
      { value: 'awaiting-po', label: 'Awaiting PO', color: 'var(--mw-info)' },
      { value: 'no-bom', label: 'No BOM', color: 'var(--mw-error)' },
    ]},
    { id: 'routeStatus', label: 'Routing', kind: 'multi', icon: Route, options: [
      { value: 'routed', label: 'Routed' }, { value: 'partial', label: 'Partial' }, { value: 'missing', label: 'Missing' },
    ]},
    { id: 'promiseRisk', label: 'Promise', kind: 'multi', icon: AlertTriangle, options: [
      { value: 'on-track', label: 'On track', color: 'var(--mw-success)' },
      { value: 'at-risk', label: 'At risk', color: 'var(--mw-warning)' },
      { value: 'will-miss', label: 'Will miss', color: 'var(--mw-error)' },
    ]},
    { id: 'value', label: 'Job value', kind: 'range', icon: DollarSign },
    { id: 'dueDate', label: 'Due', kind: 'date', icon: Calendar,
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'thisQuarter'] },
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: Columns3, groupBy: 'stage' },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'gantt', label: 'Gantt', icon: GanttChart },          // NEW — drop the decorative Card view
  ],
  defaultView: 'kanban',
  dateFacetId: 'dueDate',
};
```

**System presets** — `Mine this week` (UserCheck, yellow; `owner=me, dueDate=thisWeek`) ·
`Hot-list` (Flame, error; `priority=[urgent,high], promiseRisk=[at-risk,will-miss]`) ·
`Awaiting material` (Package, warning; `materialReadiness=[short,awaiting-po,no-bom]`) ·
`Routing TODO` (Route, info; `routeStatus=[partial,missing]`) ·
`Planning standup` (Users, yellow; group-shared; `dueDate=thisWeek, promiseRisk=[at-risk,will-miss]`).

**Required data work.** Wire `searchQuery` into the rendered set (dead at
`PlanJobs.tsx:199`). Derive `materialReadiness` per job from BOM × on-hand ×
open POs. Derive `promiseRisk` from current schedule slot vs `dueDate`.
Standardise `assignedToInitials` to match Sell's owner facet shape.

**Smart-filter ideas.** *Likely to miss promise* (WC loading × route × material × supplier OTD) · *Ready to release* (material ready + routed + capacity) · *Sequence by margin* (smart sort: value × on-time probability) · *Blocked > 5d on PO* · *Customer concentration this month*.

**Out of scope.** Editing kanban columns from the bar; drag-to-Gantt rescheduling.

---

## 2. PlanJobDetail — `apps/web/src/components/plan/PlanJobDetail.tsx`

Detail view; no `ModuleFilterBar` at top level. **Do** hoist a single job-scoped
date range into a parent context so Schedule and Travellers tabs inherit it
(today each tab keeps its own local state). Sub-component schemas below.

---

## 3. PlanProducts — `apps/web/src/components/plan/PlanProducts.tsx`

**Current.** Local `<Input>` at `PlanProducts.tsx:142-144` (not `ToolbarSearch`).
No filters. Table only.

```ts
const productsFilterSchema: FilterSchema = {
  module: 'plan.products',
  label: 'Products',
  facets: [
    { id: 'bomStatus', label: 'BOM', kind: 'multi', icon: ListTree, pinned: true, options: [
      { value: 'present', label: 'Present', color: 'var(--mw-success)' },
      { value: 'stale', label: 'Stale', color: 'var(--mw-warning)' },
      { value: 'missing', label: 'Missing', color: 'var(--mw-error)' },
    ]},
    { id: 'leadTimeBand', label: 'Lead time', kind: 'multi', icon: Clock, pinned: true, options: [
      { value: '0-5', label: '≤ 5d' }, { value: '6-14', label: '6–14d' },
      { value: '15-30', label: '15–30d' }, { value: '30+', label: '> 30d' },
    ]},
    { id: 'cycleHoursBand', label: 'Cycle hrs', kind: 'multi', icon: Timer, options: [
      { value: 'lt1', label: '< 1h' }, { value: '1-4', label: '1–4h' },
      { value: '4-16', label: '4–16h' }, { value: 'gt16', label: '> 16h' },
    ]},
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Cog },
    { id: 'family', label: 'Family', kind: 'multi', icon: Folder },
    { id: 'lastProduced', label: 'Last produced', kind: 'date', icon: History,
      quickRanges: ['thisMonth', 'thisQuarter', 'ytd', 'lastYear'] },
    { id: 'hasStudio', label: 'Studio record', kind: 'boolean', icon: Sparkles },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'card', label: 'Cards', icon: Grid3x3 },              // thumbnail + BOM health pill
    { id: 'tree', label: 'BOM tree', icon: ListTree },          // group by parent assembly
  ],
  defaultView: 'list',
  dateFacetId: 'lastProduced',
};
```

**System presets** — `Missing BOM` (ListTree, error) · `Long lead-time` (Clock, warning; `leadTimeBand=[15-30,30+]`) · `Not produced in 90d` (History, info; `lastProduced.to=today-90d`) · `Touches bottleneck WC` (Cog, yellow; admin-pinned).

**Required data work.** Expose lead-time/cycle-hour band derivers. `hasStudio` is already implied by `studioProductIdForCatalogId` — surface as boolean. BOM-tree view needs a `parentAssemblyId` link on product mocks (audit notes "no way to see assemblies vs leaf parts" today).

**Smart-filter ideas.** *Recurring nesting waste > 10%* · *BOMs missing items vs latest engineering revision* · *Cost drift > 15%* (BOM vs latest quote) · *Retirement candidates* (no production 12m + no open demand).

**Out of scope.** Inline BOM editing from the tree.

---

## 4. PlanSchedule — `apps/web/src/components/plan/PlanSchedule.tsx`

**Current.** Status pills at `PlanSchedule.tsx:107-116`. Gantt + Calendar at `:119-126`.
**`MONTH_BASE` hard-coded at `:36`** and consumed at `:64, :76-77, :89-90, :96-97` —
no user date control.

```ts
const scheduleFilterSchema: FilterSchema = {
  module: 'plan.schedule',
  label: 'Schedule',
  facets: [
    { id: 'horizon', label: 'Horizon', kind: 'date', icon: Calendar, placeholder: 'This month',
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'thisQuarter'] },
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Cog, pinned: true },
    { id: 'customer', label: 'Customer', kind: 'select', icon: Building2 },
    { id: 'promiseRisk', label: 'Risk', kind: 'multi', icon: AlertTriangle, pinned: true, options: [
      { value: 'on-track', label: 'On track', color: 'var(--mw-success)' },
      { value: 'at-risk', label: 'At risk', color: 'var(--mw-warning)' },
      { value: 'late', label: 'Late', color: 'var(--mw-error)' },
    ]},
    { id: 'owner', label: 'Planner', kind: 'user', icon: User },
    { id: 'jobTag', label: 'Tag', kind: 'tag', icon: Tag },
    { id: 'showClosed', label: 'Show closed', kind: 'boolean', icon: CheckCircle2 },
  ],
  viewModes: [
    { id: 'gantt', label: 'Gantt (by job)', icon: GanttChart },
    { id: 'board', label: 'Swimlanes (by WC)', icon: Rows3, groupBy: 'workCentre' }, // NEW
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'list', label: 'List', icon: ListIcon },
  ],
  defaultView: 'gantt',
  dateFacetId: 'horizon',
};
```

**System presets** — `This week's load` (CalendarRange, yellow; `horizon=thisWeek`) ·
`Bottleneck centre` (Cog, warning; admin-pinned) ·
`At-risk jobs` (AlertTriangle, error; `promiseRisk=[at-risk,late]`) ·
`Rush queue` (Zap, error; `jobTag=[rush]`) ·
`Monday production huddle` (Users, yellow; group-shared).

**Required data work — biggest in the module.**
Replace `MONTH_BASE` (`PlanSchedule.tsx:36`) with `state.values.horizon` driving
`calendarMonth` (`:64`), the `addDays(MONTH_BASE, …)` block builders (`:76-77, :89-90`),
and gantt window (`:96-97`). Keep `startDay` offsets but resolve them relative to
`horizon.from`. Surface a `workCentre` ref-data source to the schema option list.
Swimlanes view needs `block.workCentreId` (Schedule Engine already produces it —
port the projection).

**Smart-filter ideas.** *Re-sequence candidates* (slot vs due > N days; pre-fills Engine scope) · *Operator-gap weeks* (WC × routing × roster) · *Slip clusters* (3+ jobs sliding into same week) · *Hot subcontract dates* (same supplier crowded).

**Out of scope.** In-Gantt drag-to-reschedule; capacity heat-map overlay.

---

## 5. PlanScheduleEngine — `apps/web/src/components/plan/PlanScheduleEngine.tsx`

**Current.** No filter/search bar; engine treats all blocks equally — no way to
constrain "fix this week only".

```ts
const engineFilterSchema: FilterSchema = {
  module: 'plan.scheduleEngine',
  label: 'Schedule Engine',
  facets: [
    { id: 'scopeWindow', label: 'Window', kind: 'date', icon: Calendar,
      quickRanges: ['thisWeek', 'next7days', 'thisMonth', 'thisQuarter'] },
    { id: 'workCentre', label: 'Centres in scope', kind: 'multi', icon: Cog, pinned: true },
    { id: 'lockedJobs', label: 'Locked jobs', kind: 'multi', icon: Lock, pinned: true },
    { id: 'jobTag', label: 'Tag', kind: 'tag', icon: Tag },
    { id: 'allowSubcontractMoves', label: 'Allow subcontract moves', kind: 'boolean', icon: Truck },
  ],
  viewModes: [
    { id: 'board', label: 'Proposal swimlanes', icon: Rows3, groupBy: 'workCentre' },
    { id: 'list', label: 'Move list', icon: ListIcon },
  ],
  defaultView: 'board',
  dateFacetId: 'scopeWindow',
};
```

**System presets** — `Fix this week` (Wand2, yellow) · `Bottleneck reflow` (Cog, warning) · `Rush-only` (Zap, error; `jobTag=[rush]`).

**Required data work.** Each gantt block needs `workCentreId`, `lockedByPlannerId?`, `tags?`. Engine call accepts the schema's `state.values` as scope.

**Smart-filter ideas.** *Minimum-disruption reflow* (preset) · *Promise-first reflow* (preset) · *Material-aware reflow* (feeds readiness into constraints).

**Out of scope.** The solver itself.

---

## 6. PlanScheduleTab — `apps/web/src/components/plan/PlanScheduleTab.tsx`

**Current.** `all / done / pending` pills + Gantt/Calendar toggle, per-job scope.

```ts
const scheduleTabFilterSchema: FilterSchema = {
  module: 'plan.jobSchedule',
  label: 'Job schedule',
  facets: [
    { id: 'opStatus', label: 'Status', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'done', label: 'Done', color: 'var(--mw-success)' },
      { value: 'in-progress', label: 'In progress', color: 'var(--mw-info)' },
      { value: 'pending', label: 'Pending' },
    ]},
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Cog, pinned: true },
    { id: 'subcontract', label: 'Subcontract only', kind: 'boolean', icon: Truck },
  ],
  viewModes: [
    { id: 'gantt', label: 'Gantt', icon: GanttChart },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'list', label: 'List', icon: ListIcon },
  ],
  defaultView: 'gantt',
};
```

**Required data work.** Each op needs `subcontract: boolean` (audit: long-lead subcontract drives most slip). Inherit `dateFacetId` from parent job-detail context (§2).

---

## 7. PlanMrp — `apps/web/src/components/plan/PlanMrp.tsx`

**Current.** **No search/filter** — pure cascade tree. Canonical MRP weekly grid missing entirely.

```ts
const mrpFilterSchema: FilterSchema = {
  module: 'plan.mrp',
  label: 'MRP',
  facets: [
    { id: 'horizon', label: 'Horizon', kind: 'date', icon: Calendar, placeholder: 'Next 8 weeks',
      quickRanges: ['thisWeek', 'next7days', 'thisMonth', 'thisQuarter', 'thisYear'] },
    { id: 'nodeType', label: 'Type', kind: 'multi', icon: Network, pinned: true, options: [
      { value: 'sales-order', label: 'Sales order' }, { value: 'job', label: 'Job' },
      { value: 'mo', label: 'MO' }, { value: 'po', label: 'PO' },
    ]},
    { id: 'status', label: 'Status', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'fulfilled', label: 'Fulfilled', color: 'var(--mw-success)' },
      { value: 'partial', label: 'Partial', color: 'var(--mw-info)' },
      { value: 'pending', label: 'Pending', color: 'var(--neutral-400)' },
      { value: 'shortage', label: 'Shortage', color: 'var(--mw-error)' },
    ]},
    { id: 'demandSource', label: 'Demand', kind: 'multi', icon: Target, options: [
      { value: 'customer-order', label: 'Customer order' },
      { value: 'forecast', label: 'Forecast' },
      { value: 'safety-stock', label: 'Safety stock' },
    ]},
    { id: 'shortagesOnly', label: 'Shortages only', kind: 'boolean', icon: AlertTriangle },
    { id: 'item', label: 'Item / SKU', kind: 'select', icon: Package },
  ],
  viewModes: [
    { id: 'tree', label: 'Cascade tree', icon: ListTree },
    { id: 'board', label: 'Weekly buckets', icon: LayoutGrid, groupBy: 'horizon' },   // NEW canonical MRP grid
    { id: 'list', label: 'Flat list', icon: ListIcon },
  ],
  defaultView: 'tree',
  dateFacetId: 'horizon',
};
```

**System presets** — `Shortages this week` (AlertTriangle, error; `shortagesOnly=true, horizon=thisWeek`) · `Long-lead POs unplaced` (Clock, warning; `nodeType=[po], status=[pending], horizon=thisQuarter`) · `Forecast vs firm` (Target, info; `demandSource=[forecast,customer-order]`) · `Customer X demand` (Building2, yellow; admin-pinned per major customer).

**Required data work.** Weekly-bucket grid is net-new: rows = item, cols = weeks within `horizon`, cells = net req. Needs `mrpItemWeeklyNetReq(item, weekStart, weekEnd)` derivation. `nodeType`, `status`, `demandSource` must become explicit fields (today they are rendered colours only). `shortagesOnly` requires `node.shortageQty > 0` exposed.

**Smart-filter ideas.** *Material at short-supply risk* (on-hand + on-order + demand; rank by days-of-cover) · *PO suggestion now* (MRP says reorder, no PO exists) · *Demand spikes* (weekly req > 2× rolling-4-week avg) · *Substitutable shortages* (alternate SKU has stock).

**Out of scope.** Pegging editor; forecast input UI.

---

## 8. PlanPurchase — `apps/web/src/components/plan/PlanPurchase.tsx`

**Current.** Status pills at `PlanPurchase.tsx:289-298`, hand-rolled job pill row
at `:301-316`, stub filter button at `:317`, search at `:288`.

```ts
const purchaseFilterSchema: FilterSchema = {
  module: 'plan.purchase',
  label: 'Purchase',
  facets: [
    { id: 'requiredBy', label: 'Required by', kind: 'date', icon: Calendar,
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'thisQuarter'] },
    { id: 'stockLevel', label: 'Stock', kind: 'multi', icon: Package, pinned: true, options: [
      { value: 'out', label: 'Out', color: 'var(--mw-error)' },
      { value: 'low', label: 'Low', color: 'var(--mw-warning)' },
      { value: 'in', label: 'In stock', color: 'var(--mw-success)' },
    ]},
    { id: 'supplier', label: 'Supplier', kind: 'multi', icon: Truck, pinned: true },
    { id: 'job', label: 'Job', kind: 'multi', icon: Briefcase },
    { id: 'leadTimeBand', label: 'Lead time', kind: 'multi', icon: Clock, options: [
      { value: '0-5', label: '≤ 5d' }, { value: '6-14', label: '6–14d' },
      { value: '15-30', label: '15–30d' }, { value: '30+', label: '> 30d' },
    ]},
    { id: 'shortfallValue', label: 'Shortfall $', kind: 'range', icon: DollarSign },
    { id: 'alternateSupplier', label: 'Alt supplier', kind: 'boolean', icon: GitBranch },
    { id: 'onOrder', label: 'Already on order', kind: 'boolean', icon: ShoppingCart },
  ],
  viewModes: [
    { id: 'list', label: 'Table', icon: ListIcon },
    { id: 'card', label: 'Suggested POs', icon: Grid3x3 },
    { id: 'kanban', label: 'Buyer board', icon: Columns3, groupBy: 'supplier' },
  ],
  defaultView: 'list',
  dateFacetId: 'requiredBy',
};
```

**System presets** — `Place today` (ShoppingCart, yellow) · `Shortages > $5k` (DollarSign, error; `shortfallValue.from=5000, stockLevel=[out,low]`) · `Long-lead items` (Clock, warning) · `Single-source risk` (GitBranch, warning; `alternateSupplier=false`) · `Buyer's morning list` (Coffee, yellow; group-shared).

**Required data work.** Replace the hand-rolled job pill row (`PlanPurchase.tsx:301-316`) with the schema's `job` multi facet (today: single). `alternateSupplier` needs `hasAlternates: boolean` per material. `shortfallValue` derived from `shortfallQty × unitCost`.

**Smart-filter ideas.** *Supplier OTD declining* · *Consolidation candidates* (same supplier + `requiredBy` within 5 days) · *Currency risk* · *Reorder now or pay later* (1-week delay pushes a downstream job late).

**Out of scope.** PO creation flow.

---

## 9. PlanNesting — `apps/web/src/components/plan/PlanNesting.tsx`

**Current.** **No filters.** Card grid of SVG nest previews.

```ts
const nestingFilterSchema: FilterSchema = {
  module: 'plan.nesting',
  label: 'Nesting',
  facets: [
    { id: 'cutDate', label: 'Cut date', kind: 'date', icon: Calendar,
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth'] },
    { id: 'material', label: 'Material', kind: 'multi', icon: Layers, pinned: true },
    { id: 'gauge', label: 'Gauge', kind: 'multi', icon: Ruler, pinned: true },
    { id: 'sheetSize', label: 'Sheet size', kind: 'multi', icon: Square },
    { id: 'yieldBand', label: 'Yield', kind: 'multi', icon: Percent, options: [
      { value: 'lt70', label: '< 70%', color: 'var(--mw-error)' },
      { value: '70-85', label: '70–85%', color: 'var(--mw-warning)' },
      { value: 'gt85', label: '> 85%', color: 'var(--mw-success)' },
    ]},
    { id: 'job', label: 'Job', kind: 'multi', icon: Briefcase },
    { id: 'status', label: 'Status', kind: 'multi', icon: CircleDot, options: [
      { value: 'planned', label: 'Planned' },
      { value: 'ready-to-cut', label: 'Ready to cut' },
      { value: 'cut', label: 'Cut' },
    ]},
    { id: 'machine', label: 'Machine', kind: 'multi', icon: Cog },
  ],
  viewModes: [
    { id: 'card', label: 'Nest previews', icon: Grid3x3 },
    { id: 'list', label: 'Sheet list', icon: ListIcon },             // sortable by yield/parts/due
    { id: 'tree', label: 'By material', icon: Layers },              // collapsible by stock
    { id: 'kanban', label: 'Cut queue', icon: Columns3, groupBy: 'status' },
    { id: 'board', label: 'Sheet layout', icon: Frame },             // NEW — full-size nest layout
  ],
  defaultView: 'card',
  dateFacetId: 'cutDate',
};
```

**System presets** — `Low yield (< 70%)` (Percent, error) · `Today's cut queue` (Scissors, yellow; `cutDate=today, status=[ready-to-cut]`) · `Off-cuts available` (Layers, info) · `Awaiting material` (Package, warning; `status=[planned]`).

**Required data work.** Sheets need `material, gauge, sheetSize, yieldPercent, machineId, cutDate, status`. Yield bands derived from `yieldPercent`. Sheet-layout view reuses the existing SVG geometry at full size.

**Smart-filter ideas.** *Re-nest for yield* (alternate part-mix lifts yield) · *Combine adjacent cut dates* (same material + machine within 2 days) · *Off-cut reusable* (off-cut fits pending small parts).

**Out of scope.** Interactive nest editing.

---

## 10. PlanNCConnect — `apps/web/src/components/plan/PlanNCConnect.tsx`

```ts
const ncConnectFilterSchema: FilterSchema = {
  module: 'plan.ncConnect',
  label: 'NC Connect',
  facets: [
    { id: 'status', label: 'Status', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'online', label: 'Online', color: 'var(--mw-success)' },
      { value: 'offline', label: 'Offline', color: 'var(--neutral-400)' },
      { value: 'error', label: 'Error', color: 'var(--mw-error)' },
    ]},
    { id: 'machineType', label: 'Type', kind: 'multi', icon: Cog, pinned: true },
    { id: 'matchPct', label: 'Match %', kind: 'range', icon: Percent },
    { id: 'postProcessor', label: 'Post-processor', kind: 'multi', icon: FileCode },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'card', label: 'Machine cards', icon: Grid3x3 },
  ],
  defaultView: 'list',
};
```

**System presets** — `Ready to receive` (CheckCircle2, success; `status=[online], matchPct.from=80`) · `Offline machines` (CircleSlash, error).

**Required data work.** `matchPct` per machine × file surfaced as a row field.

---

## 11. PlanLibraries — `apps/web/src/components/plan/PlanLibraries.tsx`

Wrapper. Filtering lives in `material-library/MaterialLibrary` and
`finish-library/FinishLibrary`; each gets its own schema in a follow-up audit pass.

---

## 12. PlanActivities — `apps/web/src/components/plan/PlanActivities.tsx`

**Current.** Calendar/list toggle only.

```ts
const activitiesFilterSchema: FilterSchema = {
  module: 'plan.activities',
  label: 'Activities',
  facets: [
    { id: 'when', label: 'When', kind: 'date', icon: Calendar,
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth'] },
    { id: 'eventType', label: 'Type', kind: 'multi', icon: Tag, pinned: true, options: [
      { value: 'job', label: 'Job' }, { value: 'maintenance', label: 'Maintenance' }, { value: 'qc', label: 'QC' },
    ]},
    { id: 'assignee', label: 'Assignee', kind: 'user', icon: User, pinned: true },
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Cog },
  ],
  viewModes: [
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'gantt', label: 'Gantt', icon: GanttChart },
  ],
  defaultView: 'calendar',
  dateFacetId: 'when',
};
```

**System presets** — `Maintenance window` (Wrench, warning; `eventType=[maintenance], when=thisWeek`) · `QC checkpoints this week` (ShieldCheck, info) · `Mine this week` (UserCheck, yellow; `assignee=me, when=thisWeek`).

**Required data work.** Rows need `eventType, workCentreId, assigneeInitials`.

---

## 13. PlanQCPlanning — `apps/web/src/components/plan/PlanQCPlanning.tsx`

**Current.** `ToolbarSearch` + stub filter button at `PlanQCPlanning.tsx:24-25`.

```ts
const qcFilterSchema: FilterSchema = {
  module: 'plan.qc',
  label: 'QC',
  facets: [
    { id: 'due', label: 'Due', kind: 'date', icon: Calendar,
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth'] },
    { id: 'inspectionType', label: 'Type', kind: 'multi', icon: ShieldCheck, pinned: true, options: [
      { value: 'visual', label: 'Visual' }, { value: 'dimensional', label: 'Dimensional' },
      { value: 'ndt', label: 'NDT' }, { value: 'functional', label: 'Functional' },
    ]},
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Cog },
    { id: 'inspector', label: 'Inspector', kind: 'user', icon: User },
    { id: 'mandatoryOnly', label: 'Mandatory', kind: 'boolean', icon: AlertTriangle },
    { id: 'passRateBand', label: 'Pass rate', kind: 'multi', icon: Percent, options: [
      { value: 'lt80', label: '< 80%', color: 'var(--mw-error)' },
      { value: '80-95', label: '80–95%', color: 'var(--mw-warning)' },
      { value: 'gt95', label: '> 95%', color: 'var(--mw-success)' },
    ]},
    { id: 'ncrSeverity', label: 'NCR severity', kind: 'multi', icon: Flag },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'kanban', label: 'By status', icon: Columns3, groupBy: 'status' },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ],
  defaultView: 'list',
  dateFacetId: 'due',
};
```

**System presets** — `Open NCRs` (AlertTriangle, error) · `My checklists due` (UserCheck, yellow; `inspector=me, due=thisWeek`) · `Mandatory < 95% pass` (ShieldCheck, warning; `mandatoryOnly=true, passRateBand=[lt80,80-95]`).

**Required data work.** Rows need `inspectionType, workCentreId, inspectorInitials, mandatory: boolean, passRatePercent, ncrSeverity?`.

---

## 14. PlanOperationRouting — `apps/web/src/components/plan/PlanOperationRouting.tsx`

```ts
const routingFilterSchema: FilterSchema = {
  module: 'plan.routing',
  label: 'Routing',
  facets: [
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Cog, pinned: true },
    { id: 'subcontract', label: 'Subcontract only', kind: 'boolean', icon: Truck, pinned: true },
    { id: 'longStep', label: 'Long steps (> 60m)', kind: 'boolean', icon: Clock },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'tree', label: 'By part', icon: ListTree },
  ],
  defaultView: 'list',
};
```

**Required data work.** Step rows need `workCentreId, subcontract, durationMinutes`.

---

## 15. PlanCapableToPromise — `apps/web/src/components/plan/PlanCapableToPromise.tsx`

Result card, not a list. **No `ModuleFilterBar`.** Add a single horizon `DateChip` next to the Calculate CTA so the user can choose the CTP window.

---

## 16. BomRoutingTree — `apps/web/src/components/plan/BomRoutingTree.tsx`

**Current.** Solid baseline filter strip at `BomRoutingTree.tsx:223-281` (kind, search, density).

```ts
const bomRoutingFilterSchema: FilterSchema = {
  module: 'plan.bomRouting',
  label: 'BOM / Routing',
  facets: [
    { id: 'kind', label: 'Kind', kind: 'multi', icon: Layers, pinned: true, options: [
      { value: 'make', label: 'Make' }, { value: 'buy', label: 'Buy' },
    ]},
    { id: 'opStatus', label: 'Op status', kind: 'multi', icon: CircleDot, options: [
      { value: 'done', label: 'Done', color: 'var(--mw-success)' },
      { value: 'in-progress', label: 'In progress' },
      { value: 'pending', label: 'Pending' },
    ]},
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Cog },
    { id: 'subcontract', label: 'Subcontract only', kind: 'boolean', icon: Truck },
    { id: 'depth', label: 'Depth', kind: 'select', icon: ListTree, options: [
      { value: 'top', label: 'Top level only' },
      { value: 'leaves', label: 'Leaves only' },
      { value: 'all', label: 'All depths' },
    ]},
    { id: 'missingData', label: 'Missing data', kind: 'multi', icon: AlertTriangle, options: [
      { value: 'no-routing', label: 'No routing' },
      { value: 'no-cost', label: 'No cost' },
    ]},
  ],
  viewModes: [
    { id: 'tree', label: 'Tree', icon: ListTree },
    { id: 'list', label: 'Table', icon: ListIcon },
    { id: 'gantt', label: 'Routing gantt', icon: GanttChart },        // NEW — per-part step durations
  ],
  defaultView: 'tree',
};
```

**Required data work.** Op rows need `status, workCentreId, subcontract, durationMinutes, unitCost` for `missingData` checks.

---

## 17. BomGenerator — `apps/web/src/components/plan/BomGenerator.tsx`

```ts
const bomGenFilterSchema: FilterSchema = {
  module: 'plan.bomGenerator',
  label: 'BOM Generator',
  facets: [
    { id: 'confidence', label: 'Confidence', kind: 'multi', icon: Sparkles, pinned: true, options: [
      { value: 'high', label: '≥ 90%', color: 'var(--mw-success)' },
      { value: 'med', label: '70–89%', color: 'var(--mw-warning)' },
      { value: 'low', label: '< 70%', color: 'var(--mw-error)' },
    ]},
    { id: 'reviewStatus', label: 'Review', kind: 'multi', icon: CheckCircle2, pinned: true, options: [
      { value: 'accepted', label: 'Accepted' }, { value: 'edited', label: 'Edited' },
      { value: 'unresolved', label: 'Unresolved' }, { value: 'needs-catalog-match', label: 'Needs catalog match' },
    ]},
  ],
  viewModes: [{ id: 'list', label: 'Lines', icon: ListIcon }],
  defaultView: 'list',
};
```

**Required data work.** Each generated line needs `confidence: number, reviewStatus: enum` exposed as filter pills (states exist internally; not currently surfaced).

---

## 18. PlanSheetCalculator

Pure calculator — filter/view N/A.

---

## Cross-cutting prerequisites

1. **Replace `MONTH_BASE`** (`PlanSchedule.tsx:36`) with a `horizon` facet value — biggest single data prerequisite; every gantt/calendar/MRP screen depends on it.
2. **`workCentreId` everywhere it is implied** — Schedule blocks, Routing steps, Activities, QC, Nesting sheets.
3. **`materialReadiness` + `promiseRisk` derivers on Jobs** — used by Jobs, Schedule, Engine, MRP.
4. **Assignee shape standardisation** — Jobs / Activities / QC adopt the same `initials` shape Sell uses for `ownerOptions`.
5. **Group-scoped preset sharing** — Plan leans on this more than Sell did (production huddle, buyer's list); confirm `groupId` matches `ControlGroups.tsx` (open question in `FILTERS-REDESIGN.md` §12).

## Rollout order

1. **PlanJobs** — highest visibility; fixes dead search; validates gantt-as-list-mode.
2. **PlanSchedule** — kills `MONTH_BASE`; unlocks the date chip pattern for the rest of the module.
3. **PlanMrp** — new weekly-bucket grid is the biggest UX win.
4. **PlanPurchase** — replaces hand-rolled pill rows; high daily traffic.
5. **PlanProducts** — adds BOM tree view.
6. **PlanNesting** — new yield/material/machine facets + sheet-layout view.
7. **Remaining screens** — PlanScheduleTab, ScheduleEngine, Activities, QCPlanning, OperationRouting, NCConnect, BomRoutingTree, BomGenerator.

## Out of scope (module-wide)

- Server-backed `SavedView` storage (still localStorage per pilot).
- Smart-filter v1 wiring (foundation in place; per-screen suggestions land flag-gated in a follow-up).
- Plan.Libraries sub-schemas (own audit pass).
