# Make module — filter / search / view migration plan

**Status:** Plan · **Date:** 2026-05-11 · **Owner:** Matt
**Pilot landed:** Sell module (`d4f0c565`) — this plan follows that shape.
**Audit:** `docs/audits/dev/AUDIT-filters-make.md` · **System spec:** `docs/plans/FILTERS-REDESIGN.md`

Make is the most view-mode-rich module in the suite. Almost every screen needs more than `list`: kanban-by-status, machine swimlanes, gantt, calendar, or tree+timeline. The audit identifies eleven list/board screens still mounting the broken `ToolbarFilterButton`; this plan converts each.

Per-screen sections follow the Sell pilot conventions:

- Module id `make.<screen>`. Three-role vocab only (admin / lead / team).
- Lucide icons on system presets — no emoji. Yellow tile = dark icon/text.
- Heights C (40 px chips, 48 px CTA) come built-in via `ModuleFilterBar` / `ToolbarPrimaryButton`.
- Quick-range default `[today, thisWeek, thisMonth, thisQuarter, thisYear]` unless noted.
- Option lists (`operatorOptions`, `machineOptions`, etc.) are derived from `@/services` at module load.

---

## 1. MakeManufacturingOrders

**File:** `apps/web/src/components/make/MakeManufacturingOrders.tsx`
**Current:** Generic `ToolbarFilterButton` (`:93`) with hard-coded `Active/Draft/Completed` that doesn't match the real `draft | confirmed | in_progress | done` enum. List-only.

### Filter schema

```ts
const MODULE_ID = 'make.manufacturingOrders';

const moFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Manufacturing Orders',
  facets: [
    { id: 'status', label: 'Status', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'draft', label: 'Draft', color: 'var(--neutral-300)' },
      { value: 'confirmed', label: 'Confirmed', color: 'var(--mw-yellow-400)' },
      { value: 'in_progress', label: 'In progress', color: 'var(--mw-yellow-600)' },
      { value: 'done', label: 'Done', color: 'var(--mw-mirage)' },
    ]},
    { id: 'priority', label: 'Priority', kind: 'multi', icon: Flag, pinned: true, options: priorityOptions },
    { id: 'owner', label: 'Operator', kind: 'select', icon: User, options: operatorOptions },
    { id: 'customer', label: 'Customer', kind: 'select', icon: Building2, options: customerOptions },
    { id: 'job', label: 'Job', kind: 'select', icon: Briefcase, options: jobOptions },
    { id: 'productFamily', label: 'Product family', kind: 'multi', icon: Package, options: familyOptions },
    { id: 'progressBand', label: 'Progress', kind: 'select', icon: Activity, options: [
      { value: '0', label: 'Not started (0%)' }, { value: '1-50', label: '1–50%' },
      { value: '51-99', label: '51–99%' }, { value: '100', label: 'Complete' },
    ]},
    { id: 'releasedWOs', label: 'WOs released', kind: 'boolean', icon: Send },
    { id: 'materialShortage', label: 'Material shortage', kind: 'boolean', icon: PackageX },
    { id: 'qualityHold', label: 'Quality hold', kind: 'boolean', icon: ShieldAlert },
    { id: 'dueDate', label: 'Due', kind: 'date', icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban by status', icon: Columns3, groupBy: 'status' },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'calendar', label: 'Calendar by due', icon: Calendar },
    { id: 'gantt', label: 'Gantt', icon: BarChartHorizontal },
    { id: 'board', label: 'Board by customer', icon: LayoutGrid, groupBy: 'customer' },
  ],
  defaultView: 'kanban',
  dateFacetId: 'dueDate',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'My MOs this week', icon: User, iconTone: 'yellow',
    state: { values: { owner: '__me__', dueDate: thisWeekRange() }, search: '', view: 'list' } },
  { name: 'Overdue & in-progress', icon: AlertTriangle, iconTone: 'error',
    state: { values: { status: ['in_progress'], dueDate: { to: today() } }, search: '', view: 'kanban' } },
  { name: 'Released — not started', icon: Send, iconTone: 'info',
    state: { values: { status: ['confirmed'], releasedWOs: true, progressBand: '0' }, search: '', view: 'list' } },
  { name: 'Due this week', icon: Calendar, iconTone: 'warning',
    state: { values: { dueDate: thisWeekRange(), status: ['confirmed', 'in_progress'] }, search: '', view: 'kanban' } },
  { name: 'Held for QA', icon: ShieldAlert, iconTone: 'warning',
    state: { values: { qualityHold: true }, search: '', view: 'list' } },
]);
```

### Required data work

- MO records need: `priority`, `jobId`, `productFamily`, `releasedWoCount`, `materialShortage`, `qualityHold`. Today only `moNumber/product/customer/status/progressPercent` are surfaced.
- Derive `progressBand` in `getFacetValue`.
- Extend search to `jobNumber`, `operatorName`, `notes`.

### Smart-filter ideas

- "Likely to miss promise" — progress vs cycle-time history + queue ahead.
- "Runnable now" — `confirmed && !materialShortage && !qualityHold`.
- "Stuck in confirmed > 5 d" — age-in-stage.
- "Cluster: same customer due same week" — consolidation hint.
- "Has at-risk WOs" — joins WO-level lateness flag.

### Out of scope

Customer board view gated behind tier flag (service-shop only). Calendar drag-to-reschedule writes — read-only v1.

---

## 2. MakeManufacturingOrderDetail — embedded route-step table

**File:** `apps/web/src/components/make/MakeManufacturingOrderDetail.tsx`
**Current:** Embedded WO / route-step table with no filtering.

### Filter schema

```ts
const MODULE_ID = 'make.mo.routeSteps';

const routeStepFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Route steps',
  facets: [
    { id: 'status', label: 'Status', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In progress', color: 'var(--mw-yellow-400)' },
      { value: 'completed', label: 'Completed', color: 'var(--mw-mirage)' },
    ]},
    { id: 'machine', label: 'Machine', kind: 'select', icon: Cpu, options: machineOptions },
    { id: 'operator', label: 'Operator', kind: 'select', icon: User, options: operatorOptions },
    { id: 'readyToStart', label: 'Ready to start', kind: 'boolean', icon: PlayCircle, pinned: true },
  ],
  viewModes: [
    { id: 'list', label: 'Steps', icon: ListOrdered },
    { id: 'gantt', label: 'Route gantt', icon: BarChartHorizontal },
  ],
  defaultView: 'list',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'Ready to start', icon: PlayCircle, iconTone: 'success',
    state: { values: { readyToStart: true, status: ['pending'] }, search: '', view: 'list' } },
  { name: 'Active steps', icon: Activity, iconTone: 'info',
    state: { values: { status: ['in_progress'] }, search: '', view: 'gantt' } },
  { name: 'My steps', icon: User, iconTone: 'yellow',
    state: { values: { operator: '__me__' }, search: '', view: 'list' } },
]);
```

### Required data work

- Steps need `predecessorIds: string[]` (or a derived `readyToStart`), `machineId`, `operatorId`.

### Smart-filter ideas

- "Will be blocked when current step finishes" — single-hop lookahead.
- "Mine, ready to start" — operator landing.
- "Setup-heavy steps batched for same machine" — operator dispatch hint.

### Out of scope

Dependency editing UI — read-only v1.

---

## 3. MakeWorkOrders

**File:** `apps/web/src/components/make/MakeWorkOrders.tsx`
**Current:** Generic filter (`:61`), list only, search limited to `woNumber/operation/machineName` (`:26-31`). Real enum: `pending | in_progress | completed`.

### Filter schema

```ts
const MODULE_ID = 'make.workOrders';

const woFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Work Orders',
  facets: [
    { id: 'status', label: 'Status', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'pending', label: 'Released', color: 'var(--neutral-300)' },
      { value: 'in_progress', label: 'In progress', color: 'var(--mw-yellow-400)' },
      { value: 'on_hold', label: 'On hold', color: 'var(--mw-yellow-600)' },
      { value: 'completed', label: 'Done', color: 'var(--mw-mirage)' },
    ]},
    { id: 'machine', label: 'Machine', kind: 'multi', icon: Cpu, pinned: true, options: machineOptions },
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Factory, options: workCentreOptions },
    { id: 'operator', label: 'Operator', kind: 'select', icon: User, options: operatorOptions },
    { id: 'shift', label: 'Shift', kind: 'select', icon: Sun, options: shiftOptions },
    { id: 'parentMo', label: 'Parent MO', kind: 'select', icon: Boxes, options: moOptions },
    { id: 'job', label: 'Job', kind: 'select', icon: Briefcase, options: jobOptions },
    { id: 'priority', label: 'Priority', kind: 'multi', icon: Flag, options: priorityOptions },
    { id: 'variance', label: 'Variance > 20%', kind: 'boolean', icon: TrendingUp },
    { id: 'atRisk', label: 'At risk', kind: 'boolean', icon: AlertTriangle, pinned: true },
    { id: 'awaitingMaterial', label: 'Awaiting material', kind: 'boolean', icon: PackageX },
    { id: 'hasScrap', label: 'Has scrap', kind: 'boolean', icon: Trash2 },
    { id: 'qualityHold', label: 'Quality hold', kind: 'boolean', icon: ShieldAlert },
    { id: 'promised', label: 'Promised', kind: 'date', icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban by status', icon: Columns3, groupBy: 'status' },
    { id: 'board', label: 'Machine swimlanes', icon: LayoutGrid, groupBy: 'machine' },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'gantt', label: 'Route gantt', icon: BarChartHorizontal },
    { id: 'calendar', label: 'Shift calendar', icon: Calendar },
  ],
  defaultView: 'kanban',
  dateFacetId: 'promised',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'My queue today', icon: User, iconTone: 'yellow',
    state: { values: { operator: '__me__', promised: todayRange() }, search: '', view: 'list' } },
  { name: 'CNC cell — open WOs', icon: Cpu, iconTone: 'info',
    state: { values: { workCentre: ['cnc'], status: ['pending', 'in_progress'] }, search: '', view: 'board' } },
  { name: 'On hold > 4 h', icon: PauseCircle, iconTone: 'warning',
    state: { values: { status: ['on_hold'] }, search: '', view: 'kanban' } },
  { name: 'Variance > 20%', icon: TrendingUp, iconTone: 'error',
    state: { values: { variance: true, status: ['in_progress', 'completed'] }, search: '', view: 'list' } },
  { name: 'Awaiting material', icon: PackageX, iconTone: 'warning',
    state: { values: { awaitingMaterial: true }, search: '', view: 'kanban' } },
]);
```

### Required data work

- WO records need: `workCentreId`, `shift`, `operatorId`, `parentMoId`, `jobId`, `priority`, `estimatedMinutes`, `actualMinutes`, `awaitingMaterial`, `qualityHold`, `hasScrap`, `onHoldSince`.
- Derive `variance = (actual - estimated) / estimated > 0.2`.
- Derive `atRisk` or carry an explicit flag.
- Extend search to `operatorName`, `parentMoNumber`, `jobNumber`.

### Smart-filter ideas

- "WOs likely to miss promise" — progress + machine cycle-time history + queue-ahead.
- "Runnable now" — released, materials ready, no hold, machine available.
- "Bottleneck cell of the day" — auto-detect tightest queue vs takt.
- "Setup-heavy near identical parts" — batching candidates.
- "Recurring on-hold reason" — same reason >N times last 7 d.

### Out of scope

Drag-to-resequence and drag-to-reassign on board/calendar — read-only v1.

---

## 4. MakeProducts

**File:** `apps/web/src/components/make/MakeProducts.tsx`
**Current:** Card/list toggle (`:165, :243-250`), search on `sku/name/category` (`:168-173`). Generic filter doesn't reflect `bomStatus: complete | draft | missing`.

### Filter schema

```ts
const MODULE_ID = 'make.products';

const productsFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Products',
  facets: [
    { id: 'bomStatus', label: 'BOM status', kind: 'multi', icon: FileCheck, pinned: true, options: [
      { value: 'complete', label: 'Complete', color: 'var(--mw-mirage)' },
      { value: 'draft', label: 'Draft', color: 'var(--mw-yellow-400)' },
      { value: 'missing', label: 'Missing', color: 'var(--mw-coral)' },
    ]},
    { id: 'family', label: 'Family', kind: 'multi', icon: Package, pinned: true, options: familyOptions },
    { id: 'category', label: 'Category', kind: 'select', icon: Tag, options: categoryOptions },
    { id: 'workCentre', label: 'Default work centre', kind: 'select', icon: Factory, options: workCentreOptions },
    { id: 'hasDrawing', label: 'Approved drawing', kind: 'boolean', icon: FileImage },
    { id: 'leadTimeBand', label: 'Lead time', kind: 'select', icon: Clock, options: [
      { value: 'lt1w', label: '< 1 week' }, { value: '1-2w', label: '1–2 weeks' },
      { value: '2-4w', label: '2–4 weeks' }, { value: 'gt4w', label: '> 4 weeks' },
    ]},
    { id: 'unitCost', label: 'Unit cost', kind: 'range', icon: DollarSign },
    { id: 'recentlyUsed', label: 'Used last 30 d', kind: 'boolean', icon: Activity },
    { id: 'discontinued', label: 'Discontinued', kind: 'boolean', icon: Ban },
  ],
  viewModes: [
    { id: 'card', label: 'Cards', icon: Grid3x3 },
    { id: 'board', label: 'Grouped by family', icon: LayoutGrid, groupBy: 'family' },
    { id: 'list', label: 'List', icon: ListIcon },
  ],
  defaultView: 'card',
  // No dateFacetId — catalog screen, not date-driven.
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'Missing BOMs', icon: FileX, iconTone: 'error',
    state: { values: { bomStatus: ['missing'] }, search: '', view: 'list' } },
  { name: 'Made this month', icon: Activity, iconTone: 'info',
    state: { values: { recentlyUsed: true }, search: '', view: 'card' } },
  { name: 'High runners', icon: TrendingUp, iconTone: 'yellow',
    state: { values: { recentlyUsed: true }, search: '', view: 'board' } },
  { name: 'My responsibility', icon: User, iconTone: 'yellow',
    state: { values: { owner: '__me__' }, search: '', view: 'list' } },
]);
```

### Required data work

- Products need: `familyId`, `defaultWorkCentreId`, `hasApprovedDrawing`, `leadTimeDays`, `unitCost`, `lastUsedAt`, `discontinued`, `volumeRank`, `ownerId`.
- Extend search to supplier/material and BOM revision when those fields land.

### Smart-filter ideas

- "BOMs missing items vs latest revision".
- "Cost drift vs spec > 5%".
- "Slow movers (no demand 90 d)".
- "Recurring nesting waste > 10%".

### Out of scope

Tree view of family hierarchy — `board` grouping covers v1.

---

## 5. MakeSchedule

**File:** `apps/web/src/components/make/MakeSchedule.tsx`
**Current:** Strongest screen — gantt/calendar/list toggle (`:285-293`), generic filter (`:283`), no search, implicit date horizon. Status enum `in_progress | scheduled | overdue | completed` (`:270`) mismatched.

### Filter schema

```ts
const MODULE_ID = 'make.schedule';

const scheduleFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Schedule',
  facets: [
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Factory, pinned: true, options: workCentreOptions },
    { id: 'machine', label: 'Machine', kind: 'multi', icon: Cpu, options: machineOptions },
    { id: 'shift', label: 'Shift', kind: 'select', icon: Sun, options: shiftOptions },
    { id: 'planner', label: 'Planner', kind: 'select', icon: User, options: plannerOptions },
    { id: 'status', label: 'Status', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In progress', color: 'var(--mw-yellow-400)' },
      { value: 'overdue', label: 'Overdue', color: 'var(--mw-coral)' },
      { value: 'completed', label: 'Completed', color: 'var(--mw-mirage)' },
    ]},
    { id: 'priority', label: 'Priority', kind: 'multi', icon: Flag, options: priorityOptions },
    { id: 'customer', label: 'Customer', kind: 'select', icon: Building2, options: customerOptions },
    { id: 'lateRisk', label: 'Late risk', kind: 'boolean', icon: AlertTriangle, pinned: true },
    { id: 'materialReady', label: 'Material ready', kind: 'boolean', icon: PackageCheck },
    { id: 'horizon', label: 'Horizon', kind: 'date', icon: Calendar, placeholder: 'This week',
      quickRanges: ['today', 'thisWeek', 'next7days', 'thisMonth', 'thisQuarter', 'thisYear'] },
  ],
  viewModes: [
    { id: 'gantt', label: 'Gantt', icon: BarChartHorizontal },
    { id: 'board', label: 'Machine swimlanes', icon: LayoutGrid, groupBy: 'machine' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'list', label: 'List', icon: ListIcon },
  ],
  defaultView: 'gantt',
  dateFacetId: 'horizon',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'Day-shift production board', icon: Sun, iconTone: 'yellow',
    state: { values: { shift: 'day', horizon: todayRange() }, search: '', view: 'board' } },
  { name: 'This week — at-risk WOs', icon: AlertTriangle, iconTone: 'error',
    state: { values: { lateRisk: true, horizon: thisWeekRange() }, search: '', view: 'gantt' } },
  { name: 'CNC cell schedule', icon: Cpu, iconTone: 'info',
    state: { values: { workCentre: ['cnc'], horizon: thisWeekRange() }, search: '', view: 'board' } },
  { name: 'Welding bay — next 10 days', icon: Flame, iconTone: 'warning',
    state: { values: { workCentre: ['weld'], horizon: next7DaysRange() }, search: '', view: 'gantt' } },
  { name: 'My planner queue', icon: User, iconTone: 'yellow',
    state: { values: { planner: '__me__' }, search: '', view: 'list' } },
]);
```

### Required data work

- Schedule rows need: `workCentreId`, `machineId`, `shift`, `plannerId`, `priority`, `customerId`, `materialReady`, `lateRiskScore`.
- Remove implicit `MONTH_BASE` horizon — `dateFacetId` becomes the source of truth (per FILTERS-REDESIGN.md §9).
- Extend search across joined MO/job/customer fields.

### Smart-filter ideas

- "At-risk this week" — composite of cycle-time variance + queue-ahead + material readiness.
- "Bottleneck of the day" — tightest work-centre vs takt.
- "Capacity-conflict band" — rows where load > 100% capacity.
- "Free capacity at end of week" — fillable slots.
- "Customer X — full week-by-week load" — for sales conversations.

### Out of scope

Capacity load-chart view (lives in Plan). Drag-to-reschedule writes — read-only v1.

---

## 6. MakeShopFloor / ShopFloorPage

**File:** `apps/web/src/components/make/shop-floor/ShopFloorPage.tsx`
**Current:** No filter or search; slices by traveller status (`:25-31`). Supervisor surface, operator-collapse target.

### Filter schema

```ts
const MODULE_ID = 'make.shopFloor';

const shopFloorFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Shop floor',
  facets: [
    { id: 'workCentre', label: 'Work centre', kind: 'select', icon: Factory, pinned: true, persistent: true, options: workCentreOptions },
    { id: 'machineStatus', label: 'Machine status', kind: 'multi', icon: Cpu, pinned: true, options: [
      { value: 'running', label: 'Running', color: 'var(--mw-mirage)' },
      { value: 'idle', label: 'Idle', color: 'var(--mw-yellow-400)' },
      { value: 'down', label: 'Down', color: 'var(--mw-coral)' },
      { value: 'maintenance', label: 'Maintenance', color: 'var(--neutral-400)' },
    ]},
    { id: 'operator', label: 'Operator on-station', kind: 'select', icon: User, options: operatorOptions },
    { id: 'shift', label: 'Shift', kind: 'select', icon: Sun, options: shiftOptions },
    { id: 'held', label: 'Travellers held', kind: 'boolean', icon: PauseCircle },
    { id: 'overdue', label: 'Travellers overdue', kind: 'boolean', icon: AlertTriangle },
  ],
  viewModes: [
    { id: 'board', label: 'Machine grid', icon: LayoutGrid },
    { id: 'kanban', label: 'Status tiles', icon: Columns3, groupBy: 'machineStatus' },
    { id: 'list', label: 'List', icon: ListIcon },
  ],
  defaultView: 'board',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'My cell now', icon: User, iconTone: 'yellow',
    state: { values: { workCentre: '__myCell__' }, search: '', view: 'board' } },
  { name: 'Machines down', icon: AlertCircle, iconTone: 'error',
    state: { values: { machineStatus: ['down'] }, search: '', view: 'kanban' } },
  { name: 'Travellers on hold', icon: PauseCircle, iconTone: 'warning',
    state: { values: { held: true }, search: '', view: 'list' } },
  { name: 'Idle > 15 min', icon: Clock, iconTone: 'warning',
    state: { values: { machineStatus: ['idle'] }, search: '', view: 'board' } },
]);
```

### Required data work

- Machine tiles need: `status`, `operatorOnStationId`, `idleSinceMs`, `currentTravellerId`, `cellId`.
- Travellers need `held: boolean`, `overdue: boolean`.
- Search wires the existing `MakeScanStation` (`:135`) into the bar — scan-first per FILTERS-REDESIGN §10.
- `__myCell__` resolves from current user's assigned cell.

### Smart-filter ideas

- "Machines trending toward breakdown" — utilisation + micro-stops + days since PM.
- "Operators idle but station ready" — staffing mismatch.
- "Cells likely to miss shift target".
- "Best operator for this WO now".

### Out of scope

`IsometricFloorView` navigation (`:280` toast) — addressed in floor audit follow-up.

---

## 7. MakeShopFloorKanban

**File:** `apps/web/src/components/make/MakeShopFloorKanban.tsx`
**Current:** 3-column kanban Overdue / In Progress / Not Started (`:63-67`). No toolbar.

### Filter schema

```ts
const MODULE_ID = 'make.shopFloorKanban';

const shopFloorKanbanSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Shop-floor board',
  facets: [
    { id: 'workCentre', label: 'Work centre', kind: 'multi', icon: Factory, pinned: true, options: workCentreOptions },
    { id: 'operator', label: 'Operator', kind: 'select', icon: User, options: operatorOptions },
    { id: 'priority', label: 'Priority', kind: 'multi', icon: Flag, pinned: true, options: priorityOptions },
    { id: 'customer', label: 'Customer', kind: 'select', icon: Building2, options: customerOptions },
    { id: 'materialShortage', label: 'Material short', kind: 'boolean', icon: PackageX },
    { id: 'shift', label: 'Shift', kind: 'select', icon: Sun, options: shiftOptions },
    { id: 'dueDate', label: 'Due', kind: 'date', icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: Columns3, groupBy: 'status' },
    { id: 'board', label: 'Machine swimlanes', icon: LayoutGrid, groupBy: 'machine' },
  ],
  defaultView: 'kanban',
  dateFacetId: 'dueDate',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'My work centre today', icon: User, iconTone: 'yellow',
    state: { values: { workCentre: ['__myCell__'], dueDate: todayRange() }, search: '', view: 'kanban' } },
  { name: 'Urgent only', icon: Zap, iconTone: 'error',
    state: { values: { priority: ['urgent'] }, search: '', view: 'kanban' } },
  { name: 'Late shift', icon: Moon, iconTone: 'info',
    state: { values: { shift: 'night' }, search: '', view: 'board' } },
]);
```

### Required data work

- Cards need `workCentreId`, `machineId`, `priority`, `customerId`, `materialShortage`, `dueDate`, `shift`.
- Adopt swimlanes (rows × columns) by reusing the existing `KanbanBoard` grid primitive.

### Smart-filter ideas

- "Best next job to dispatch" — score by priority × age × material-ready.
- "Material-blocked but workable elsewhere" — swap suggestion.
- "Hot job — pull forward" — surfaced from sales escalations.

### Out of scope

Swimlane + column matrix can ship as a follow-up if grid math is non-trivial.

---

## 8. MakeQuality (Issues + Inspections)

**File:** `apps/web/src/components/shop-floor/QualityTab.tsx`
**Current:** Tabs (`:44, :285-306`). Active Issues has non-functional Status/Priority buttons (`:472-482`) and unwired search (`:474-475`). Inspections has a hard-coded type pill row (`:559`). Two schemas — one per tab.

### Filter schema — Issues

```ts
const MODULE_ID_ISSUES = 'make.quality.issues';

const qualityIssuesSchema: FilterSchema = {
  module: MODULE_ID_ISSUES,
  label: 'NCRs',
  facets: [
    { id: 'ncrStatus', label: 'Stage', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'open', label: 'Open' },
      { value: 'under_investigation', label: 'Investigating', color: 'var(--mw-yellow-400)' },
      { value: 'contained', label: 'Contained' },
      { value: 'capa_open', label: 'CAPA open', color: 'var(--mw-yellow-600)' },
      { value: 'closed', label: 'Closed', color: 'var(--mw-mirage)' },
    ]},
    { id: 'severity', label: 'Severity', kind: 'multi', icon: AlertTriangle, pinned: true, options: [
      { value: 'critical', label: 'Critical' }, { value: 'major', label: 'Major' }, { value: 'minor', label: 'Minor' },
    ]},
    { id: 'defectType', label: 'Defect type', kind: 'multi', icon: ScanLine, options: defectOptions },
    { id: 'machine', label: 'Machine', kind: 'select', icon: Cpu, options: machineOptions },
    { id: 'operator', label: 'Operator', kind: 'select', icon: User, options: operatorOptions },
    { id: 'partFamily', label: 'Part family', kind: 'multi', icon: Package, options: familyOptions },
    { id: 'inspector', label: 'Inspector', kind: 'select', icon: ShieldCheck, options: inspectorOptions },
    { id: 'aiFlagged', label: 'AI-flagged', kind: 'boolean', icon: Sparkles },
    { id: 'raised', label: 'Raised', kind: 'date', icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban by stage', icon: Columns3, groupBy: 'ncrStatus' },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ],
  defaultView: 'kanban',
  dateFacetId: 'raised',
};
```

### Filter schema — Inspections

```ts
const MODULE_ID_INSPECTIONS = 'make.quality.inspections';

const inspectionsSchema: FilterSchema = {
  module: MODULE_ID_INSPECTIONS,
  label: 'Inspections',
  facets: [
    { id: 'type', label: 'Type', kind: 'multi', icon: ScanLine, pinned: true, options: [
      { value: 'fai', label: 'FAI' }, { value: 'in_process', label: 'In-process' },
      { value: 'final', label: 'Final' }, { value: 'receiving', label: 'Receiving' },
    ]},
    { id: 'result', label: 'Result', kind: 'multi', icon: CheckCircle2, pinned: true, options: [
      { value: 'pass', label: 'Pass', color: 'var(--mw-mirage)' },
      { value: 'fail', label: 'Fail', color: 'var(--mw-coral)' },
      { value: 'conditional', label: 'Conditional', color: 'var(--mw-yellow-400)' },
    ]},
    { id: 'inspector', label: 'Inspector', kind: 'select', icon: ShieldCheck, options: inspectorOptions },
    { id: 'machine', label: 'Machine', kind: 'select', icon: Cpu, options: machineOptions },
    { id: 'partFamily', label: 'Part family', kind: 'multi', icon: Package, options: familyOptions },
    { id: 'scheduledFor', label: 'Scheduled', kind: 'date', icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'kanban', label: 'By result', icon: Columns3, groupBy: 'result' },
  ],
  defaultView: 'calendar',
  dateFacetId: 'scheduledFor',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID_ISSUES, [
  { name: 'My open NCRs', icon: User, iconTone: 'yellow',
    state: { values: { inspector: '__me__', ncrStatus: ['open', 'under_investigation'] }, search: '', view: 'kanban' } },
  { name: 'Failed FAIs this week', icon: AlertTriangle, iconTone: 'error',
    state: { values: { raised: thisWeekRange() }, search: '', view: 'list' } },
  { name: 'Repeat defects 30 d', icon: Repeat, iconTone: 'warning',
    state: { values: { raised: thisMonthRange() }, search: '', view: 'list' } },
  { name: 'Awaiting disposition', icon: Clock, iconTone: 'warning',
    state: { values: { ncrStatus: ['contained'] }, search: '', view: 'kanban' } },
  { name: 'AI-flagged unresolved', icon: Sparkles, iconTone: 'info',
    state: { values: { aiFlagged: true, ncrStatus: ['open', 'under_investigation', 'contained'] }, search: '', view: 'list' } },
]);

registerSystemPresets(MODULE_ID_INSPECTIONS, [
  { name: 'My inspections today', icon: User, iconTone: 'yellow',
    state: { values: { inspector: '__me__', scheduledFor: todayRange() }, search: '', view: 'list' } },
  { name: 'Failed last 7 days', icon: AlertTriangle, iconTone: 'error',
    state: { values: { result: ['fail'], scheduledFor: last7DaysRange() }, search: '', view: 'list' } },
  { name: 'FAIs this week', icon: ScanLine, iconTone: 'info',
    state: { values: { type: ['fai'], scheduledFor: thisWeekRange() }, search: '', view: 'calendar' } },
]);
```

### Required data work

- NCRs need: `stage`, `severity`, `defectType`, `machineId`, `operatorId`, `partFamilyId`, `inspectorId`, `aiFlagged`, `raisedAt`.
- Inspections need: `type`, `result`, `inspectorId`, `machineId`, `partFamilyId`, `scheduledFor`.
- Replace the hard-coded inspection-type pill row (`:559`) with the `type` facet.

### Smart-filter ideas

- "Repeat defects same part 30 d" — cluster query.
- "Operators with rising scrap on this part family" — 30-d trend vs baseline.
- "Inspections likely to fail" — supplier/part history.
- "FAI overdue" — released MO of a new part with no FAI logged.
- "Pareto by defect type for this work centre".

### Out of scope

Pareto chart-first analytics — covered in Scrap (§10). Reports tab unchanged.

---

## 9. MakeCapa

**File:** `apps/web/src/components/make/MakeCapa.tsx`
**Current:** 6-column kanban Identified → Closed (`:36-41`). No filter, search, or toggle.

### Filter schema

```ts
const MODULE_ID = 'make.capa';

const capaFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'CAPA',
  facets: [
    { id: 'owner', label: 'Owner', kind: 'select', icon: User, pinned: true, options: ownerOptions },
    { id: 'severity', label: 'Severity', kind: 'multi', icon: AlertTriangle, pinned: true, options: severityOptions },
    { id: 'sourceNcr', label: 'Source NCR', kind: 'select', icon: ClipboardList, options: ncrOptions },
    { id: 'machine', label: 'Linked machine', kind: 'select', icon: Cpu, options: machineOptions },
    { id: 'partFamily', label: 'Linked part family', kind: 'multi', icon: Package, options: familyOptions },
    { id: 'daysInStageBand', label: 'Days in stage', kind: 'select', icon: Clock, options: [
      { value: 'lt7', label: '< 7 d' }, { value: '7-14', label: '7–14 d' },
      { value: '14-30', label: '14–30 d' }, { value: 'gt30', label: '> 30 d' },
    ]},
    { id: 'overdue', label: 'Overdue', kind: 'boolean', icon: AlertCircle },
    { id: 'dueDate', label: 'Due', kind: 'date', icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'kanban', label: 'Kanban', icon: Columns3, groupBy: 'stage' },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'calendar', label: 'Calendar by due', icon: Calendar },
  ],
  defaultView: 'kanban',
  dateFacetId: 'dueDate',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'My open CAPAs', icon: User, iconTone: 'yellow',
    state: { values: { owner: '__me__' }, search: '', view: 'kanban' } },
  { name: 'Overdue actions', icon: AlertCircle, iconTone: 'error',
    state: { values: { overdue: true }, search: '', view: 'list' } },
  { name: 'Stuck in containment > 14 d', icon: Clock, iconTone: 'warning',
    state: { values: { daysInStageBand: '14-30' }, search: '', view: 'kanban' } },
  { name: 'Closing this week', icon: CheckCircle2, iconTone: 'success',
    state: { values: { dueDate: thisWeekRange() }, search: '', view: 'list' } },
]);
```

### Required data work

- CAPA records need: `ownerId`, `severity`, `sourceNcrId`, `machineId`, `partFamilyId`, `stageEnteredAt`, `dueDate`, `overdue`.
- Derive `daysInStageBand` in `getFacetValue`.

### Smart-filter ideas

- "Stale CAPAs" — no activity > N days vs typical for severity.
- "CAPAs without verification step despite stage = closed".
- "CAPAs tied to recurring defect families".

### Out of scope

Advanced list-export tooling.

---

## 10. MakeScrapAnalysis

**File:** `apps/web/src/components/make/MakeScrapAnalysis.tsx`
**Current:** Chart-first analytics screen with no slice controls.

### Filter schema

```ts
const MODULE_ID = 'make.scrap';

const scrapFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Scrap analysis',
  facets: [
    { id: 'machine', label: 'Machine', kind: 'multi', icon: Cpu, pinned: true, options: machineOptions },
    { id: 'operator', label: 'Operator', kind: 'select', icon: User, options: operatorOptions },
    { id: 'partFamily', label: 'Part family', kind: 'multi', icon: Package, pinned: true, options: familyOptions },
    { id: 'defectReason', label: 'Defect reason', kind: 'multi', icon: ScanLine, options: defectOptions },
    { id: 'shift', label: 'Shift', kind: 'select', icon: Sun, options: shiftOptions },
    { id: 'occurred', label: 'Period', kind: 'date', icon: Calendar, placeholder: 'This month' },
  ],
  viewModes: [
    // Chart-first screen — view-mode slots map to chart containers, not literal renderers.
    { id: 'list', label: 'Trend', icon: TrendingUp },
    { id: 'kanban', label: 'Pareto', icon: BarChart3, groupBy: 'defectReason' },
    { id: 'board', label: 'By machine', icon: Cpu, groupBy: 'machine' },
    { id: 'card', label: 'By operator', icon: Users, groupBy: 'operator' },
  ],
  defaultView: 'list',
  dateFacetId: 'occurred',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'This month — top defects', icon: BarChart3, iconTone: 'yellow',
    state: { values: { occurred: thisMonthRange() }, search: '', view: 'kanban' } },
  { name: 'Rising defects 30 d', icon: TrendingUp, iconTone: 'warning',
    state: { values: { occurred: last30DaysRange() }, search: '', view: 'list' } },
  { name: 'High-cost scrap (top 20%)', icon: DollarSign, iconTone: 'error',
    state: { values: { occurred: thisQuarterRange() }, search: '', view: 'kanban' } },
  { name: 'By machine — last week', icon: Cpu, iconTone: 'info',
    state: { values: { occurred: lastWeekRange() }, search: '', view: 'board' } },
]);
```

### Required data work

- Scrap events need: `machineId`, `operatorId`, `partFamilyId`, `defectReason`, `shift`, `occurredAt`, `unitCost`.
- All four views consume the same filtered set; chart integration is a follow-up — schema lays down the framework.

### Smart-filter ideas

- "Operators with rising scrap on this part family".
- "Machine + part-family pairs trending up".
- "Worst shift × machine combo".
- "Scrap correlated with setup change".

### Out of scope

Chart component swap inside view-mode slots — separate PR.

---

## 11. BatchTraceability

**File:** `apps/web/src/components/make/BatchTraceability.tsx`
**Current:** Lot tree, no search or filter (`:2`).

### Filter schema

```ts
const MODULE_ID = 'make.traceability';

const traceabilityFilterSchema: FilterSchema = {
  module: MODULE_ID,
  label: 'Traceability',
  facets: [
    { id: 'lotStatus', label: 'Status', kind: 'multi', icon: CircleDot, pinned: true, options: [
      { value: 'released', label: 'Released', color: 'var(--mw-mirage)' },
      { value: 'quarantined', label: 'Quarantined', color: 'var(--mw-yellow-400)' },
      { value: 'recalled', label: 'Recalled', color: 'var(--mw-coral)' },
    ]},
    { id: 'customer', label: 'Customer', kind: 'select', icon: Building2, options: customerOptions },
    { id: 'supplier', label: 'Supplier', kind: 'select', icon: Truck, options: supplierOptions },
    { id: 'partFamily', label: 'Part family', kind: 'multi', icon: Package, options: familyOptions },
    { id: 'producedAt', label: 'Produced', kind: 'date', icon: Calendar, placeholder: 'Any date' },
  ],
  viewModes: [
    { id: 'tree', label: 'Lot tree', icon: Network },
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'calendar', label: 'Timeline', icon: Calendar },
  ],
  defaultView: 'tree',
  dateFacetId: 'producedAt',
};
```

### System presets

```ts
registerSystemPresets(MODULE_ID, [
  { name: 'Quarantined lots', icon: ShieldAlert, iconTone: 'warning',
    state: { values: { lotStatus: ['quarantined'] }, search: '', view: 'list' } },
  { name: 'Recalls — last 90 d', icon: AlertCircle, iconTone: 'error',
    state: { values: { lotStatus: ['recalled'], producedAt: last90DaysRange() }, search: '', view: 'calendar' } },
  { name: 'Released to customer X', icon: Building2, iconTone: 'info',
    state: { values: { lotStatus: ['released'] }, search: '', view: 'tree' } },
]);
```

### Required data work

- Lot records need: `status`, `customerId`, `supplierId`, `partFamilyId`, `producedAt`, plus forward/backward join data already powering the tree.
- Search must accept lot, serial, and job numbers.

### Smart-filter ideas

- "Lots downstream of a recalled raw material" — forward-trace.
- "Customers affected by lot X" — recall comms.
- "Suppliers correlated with quarantined lots".

### Out of scope

Recall-action workflow remains separate.

---

## 12. Cross-cutting deferrals

- **LiveFloorView cell selector** (`LiveFloorView.tsx:421-448`) — TV display tunables, not a list/board; separate ticket.
- **WorkOrderSequencing, MaterialConsumption, MakeJobTraveler, MakeScanStation** — detail / single-entity views. `MaterialConsumption` would benefit from a small status filter (shortage / over-consumed / on-target); follow-up.
- **Group-By chip** — schema supports it (`viewModes[].groupBy`); a first-class control lands cross-module after Make + Plan.
- **Smart-filter NL input** — same gating as Sell; Make smart presets ship deterministic for v1.

---

## 13. Sequencing inside Make

1. **WorkOrders** — biggest UX delta (kanban + machine swimlanes), highest-traffic supervisor surface.
2. **Schedule** — promote `dateFacetId` to remove implicit horizon; add work-centre/machine facets.
3. **ManufacturingOrders** — kanban + calendar; data prerequisites overlap with WOs.
4. **ShopFloorKanban + ShopFloorPage** — operator-collapse rendering verified once supervisor surfaces are stable.
5. **Quality (Issues + Inspections)** — two schemas in one screen; biggest data work.
6. **CAPA + ScrapAnalysis** — share severity / defect / machine option lists with Quality.
7. **Products + Traceability** — catalog-shape, lighter facet sets; ship together.
8. **MO route-step filter** — depends on MO/WO schema; rides the last MO PR.

---

## 14. Biggest data prerequisite

The MO/WO data model must gain explicit `workCentreId`, `machineId`, `shift`, `operatorId`, `priority`, `jobId`, plus the boolean signal fields (`awaitingMaterial`, `qualityHold`, `hasScrap`, `overdue`, `atRisk`, `lateRiskScore`). Without these, every machine-swimlane, dispatcher-board and at-risk preset across §1, §3, §5, §6, §7 falls back to free-text search and the redesign loses its biggest production wins.
