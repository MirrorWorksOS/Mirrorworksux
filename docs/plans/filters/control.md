# Filter Redesign — Control module migration plan

**Status:** Proposal · **Date:** 2026-05-11 · **Owner:** Matt
**Pilot precedent:** `d4f0c565` — `feat(filters): schema-driven ModuleFilterBar + Sell module pilot`
**Audit:** `docs/audits/dev/AUDIT-filters-control.md`
**Cross-module spec:** `docs/plans/FILTERS-REDESIGN.md`

Per-screen migration of every list/board surface under `apps/web/src/components/control/` to the `ModuleFilterBar` + `FilterSchema` pattern that landed for Sell. Role vocabulary is restricted to **admin / lead / team** throughout — any other vocab encountered (manager / supervisor / operator) gets corrected in-flight, not propagated.

---

## 0. Shared work for the Control rollout

Before screen-by-screen migration:

1. **`ToolbarSummaryBar` becomes clickable** — biggest cheap win flagged by the audit. Add optional `onSegmentClick(key)` + `activeKey` to `apps/web/src/components/shared/layout/PageToolbar.tsx:171`. When the parent passes a handler, segments render with `cursor-pointer`, a hover ring, and a yellow ring when `activeKey === seg.key`. Default behaviour stays identical (no handler = no click affordance). Wired below on **BOMs**, **Inventory**, **People — Users**, and **Machines** — every Control screen that already mounts a summary bar gets a free status/state toggle filter for the cost of one prop.
2. **Unify `FilterPill` and `ToolbarFilterPills`** — `apps/web/src/components/control/people/UsersTab.tsx:227` defines a bespoke multi-select pill; `ToolbarFilterPills` is single-value. Once `ModuleFilterBar` is in place neither is needed, but during migration the bespoke `FilterPill` should be removed in the People PR.
3. **Drop the dead `ToolbarFilterButton` from Control screens** — many Control screens still import it (Operations, Inventory, Audit). Remove on the screen's migration PR.
4. **Three-role vocab sweep** — touch any Control mock data still referencing manager/supervisor/operator role values (notably `UsersTab.tsx`, `ControlGroups.tsx`, `ControlShiftManager.tsx`) and normalise to `admin | lead | team`. This is on the People + Shift Manager PRs.

---

## 1. Control · People — Users

- **File:** `apps/web/src/components/control/people/UsersTab.tsx:62-108`
- **Current state:** bespoke `FilterPill` multi-select (`UsersTab.tsx:227`), text search, three pills (Module / Role / Status). `ToolbarSummaryBar` at `UsersTab.tsx:110` is informational. Table only.

### Filter schema

```ts
const usersFilterSchema: FilterSchema = {
  module: 'control.people.users',
  label: 'Users',
  facets: [
    {
      id: 'role',
      label: 'Role',
      kind: 'multi',
      icon: ShieldCheck,
      pinned: true,
      options: [
        { value: 'admin', label: 'Admin', color: 'var(--mw-mirage)' },
        { value: 'lead',  label: 'Lead',  color: 'var(--mw-yellow-500)' },
        { value: 'team',  label: 'Team',  color: 'var(--neutral-400)' },
      ],
    },
    {
      id: 'module',
      label: 'Module',
      kind: 'multi',
      icon: LayoutGrid,
      pinned: true,
      options: MODULE_OPTIONS, // sell | buy | make | plan | ship | book | control | shop-floor
    },
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: [
        { value: 'active',      label: 'Active',     color: 'var(--success-500)' },
        { value: 'invited',     label: 'Invited',    color: 'var(--mw-yellow-400)' },
        { value: 'deactivated', label: 'Deactivated',color: 'var(--neutral-300)' },
      ],
    },
    { id: 'group',    label: 'Group',    kind: 'multi', icon: Users,    options: GROUP_OPTIONS },
    { id: 'location', label: 'Location', kind: 'select', icon: MapPin,  options: LOCATION_OPTIONS },
    { id: 'expiringCert', label: 'Expiring cert', kind: 'boolean', icon: AlertTriangle },
    {
      id: 'lastSeen',
      label: 'Last seen',
      kind: 'date',
      icon: Clock,
      placeholder: 'Any time',
      quickRanges: ['today', 'thisWeek', 'thisMonth', 'thisQuarter', 'lastYear'],
    },
  ],
  viewModes: [
    { id: 'list', label: 'List',      icon: ListIcon },
    { id: 'card', label: 'Directory', icon: Grid3x3 },
    { id: 'tree', label: 'Org chart', icon: Network, groupBy: 'lead' },
    { id: 'board',label: 'Module matrix', icon: Columns3, groupBy: 'module' },
  ],
  defaultView: 'list',
  dateFacetId: 'lastSeen',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Active admins | ShieldCheck | yellow | `role:[admin] status:[active]` |
| Pending invites > 7 days | Mail | warning | `status:[invited] lastSeen:{to: today-7d}` |
| Deactivated last 90 days | UserMinus | neutral | `status:[deactivated] lastSeen:{from: today-90d}` |
| Leads without a module | UserX | error | `role:[lead] module:[]` (special smart match — see §smart) |
| Expiring certs | AlertTriangle | warning | `expiringCert:true` |

Personal preset seeded on first load for leads: **My team** (`lead = currentUser.id`).

### Required data work

- Make `ToolbarSummaryBar` at `UsersTab.tsx:110` clickable on the existing Active / Invited / Deactivated segments, wired to set `status` facet. Cheap win.
- Add `lastSeen: string` + `expiringCertCount: number` to the user mock at `apps/web/src/services/employees.ts` (currently absent — needed for two pinned filters).
- Add `lead?: string` user-id reference so the **Org chart** view can build the hierarchy. Without `lead`, the tree falls back to grouping by `module`.
- Normalise role values: replace any `manager / supervisor / operator` with `admin / lead / team`. Project memory constraint.

### Smart-filter ideas

- **People with expiring competency / cert within N days** — joins user → competency → document expiry (`smart:peopleExpiringCert`).
- **Inactive admins** — `role:admin` AND `lastSeen > 30d` — security hygiene.
- **Leads without a module assignment** — flagged in audit §6; useful for onboarding gaps.
- **Permission anomalies** — admin in one module but team in adjacent modules where peers are lead (cross-references Audit log).
- **Users with no group** — admin housekeeping for access reviews.

### Out of scope

- Bulk role-change UX (separate spec).
- Inviting users (already a separate flow).
- The internal `FilterPill` component lives on for the migration PR only, then is removed.

---

## 2. Control · People — Groups

- **File:** `apps/web/src/components/control/ControlGroups.tsx:88-120`
- **Current state:** search + single-select Module + Type (default/custom). Table only.

### Filter schema

```ts
const groupsFilterSchema: FilterSchema = {
  module: 'control.people.groups',
  label: 'Groups',
  facets: [
    { id: 'module', label: 'Module', kind: 'multi', icon: LayoutGrid, pinned: true, options: MODULE_OPTIONS },
    {
      id: 'origin',
      label: 'Origin',
      kind: 'select',
      icon: Sparkles,
      pinned: true,
      options: [
        { value: 'system', label: 'System' },  // rename of "default" — admin-friendly
        { value: 'custom', label: 'Custom' },
      ],
    },
    { id: 'hasAdmin', label: 'Has admin access', kind: 'boolean', icon: ShieldCheck },
    { id: 'memberCount', label: 'Members', kind: 'range', icon: Users },
  ],
  viewModes: [
    { id: 'list',  label: 'List',            icon: ListIcon },
    { id: 'board', label: 'Module matrix',   icon: Columns3, groupBy: 'module' },
    { id: 'kanban',label: 'Permission heat', icon: Grid3x3,  groupBy: 'hasAdmin' },
  ],
  defaultView: 'list',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| System groups | Sparkles | info | `origin:system` |
| Custom groups | Wand2 | yellow | `origin:custom` |
| Admin-capable | ShieldCheck | warning | `hasAdmin:true` |
| Empty groups | UserX | neutral | `memberCount:{to:0}` |

### Required data work

- Rename `type: default | custom` → `origin: system | custom` in the group model (`ControlGroups.tsx:50`-ish). Audit explicitly calls out "default/custom reads as jargon to admins".
- Add `memberCount` and `hasAdmin` derived fields (computable from existing members + perms).

### Smart-filter ideas

- Groups with overlapping members across modules (potential consolidation).
- Groups not used by any saved view / preset / module setting in 12 months (stale).
- Groups whose effective permissions diverge from their stated role label.

### Out of scope

- Group permission editor UI.
- The "Permission heat-grid" view is stubbed as a placeholder for v2.

---

## 3. Control · Machines

- **File:** `apps/web/src/components/control/ControlMachines.tsx:827-865`
- **Current state:** search, Status pills (Active/Maintenance/Idle/Offline), Type pill, Grid/List toggle (`IconViewToggle`).

### Filter schema

```ts
const machinesFilterSchema: FilterSchema = {
  module: 'control.machines',
  label: 'Machines',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: [
        { value: 'running',     label: 'Running',     color: 'var(--success-500)' },
        { value: 'idle',        label: 'Idle',        color: 'var(--neutral-300)' },
        { value: 'maintenance', label: 'Maintenance', color: 'var(--mw-yellow-500)' },
        { value: 'down',        label: 'Down',        color: 'var(--error-500)' },
      ],
    },
    { id: 'type',       label: 'Type',        kind: 'multi',  icon: Cog,        pinned: true, options: MACHINE_TYPE_OPTIONS },
    { id: 'workCentre', label: 'Work centre', kind: 'multi',  icon: Factory,    pinned: true, options: WORKCENTRE_OPTIONS },
    { id: 'location',   label: 'Location',    kind: 'select', icon: MapPin,     options: LOCATION_OPTIONS },
    { id: 'capability', label: 'Capability',  kind: 'tag',    icon: Tag,        options: CAPABILITY_OPTIONS },
    { id: 'connection', label: 'Connection',  kind: 'select', icon: Wifi,       options: [
      { value: 'online',  label: 'Online',  color: 'var(--success-500)' },
      { value: 'offline', label: 'Offline', color: 'var(--neutral-400)' },
      { value: 'error',   label: 'Error',   color: 'var(--error-500)' },
    ] },
    { id: 'predictiveRisk', label: 'Predictive risk', kind: 'boolean', icon: AlertTriangle },
  ],
  viewModes: [
    { id: 'card',     label: 'Card grid',  icon: Grid3x3 },
    { id: 'list',     label: 'List',       icon: ListIcon },
    { id: 'map',      label: 'Floorplan',  icon: Map },        // links to FactoryDesigner output
    { id: 'kanban',   label: 'By status',  icon: Columns3, groupBy: 'status' },
    { id: 'calendar', label: 'Maintenance',icon: CalendarDays },
  ],
  defaultView: 'card',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Down or in maintenance now | AlertOctagon | error | `status:[down,maintenance]` |
| Day-shift active | Sun | yellow | `status:[running] shift:day` (uses `useShiftContext`) |
| Offline > 24h | WifiOff | warning | `connection:offline lastSeen:{to: now-24h}` |
| Predictive risk: high | TrendingDown | error | `predictiveRisk:true` |
| My work-centre | Factory | info | `workCentre:[currentUser.workCentre]` (personal) |

### Required data work

- Add `connection: online | offline | error` + `lastSeen: ISO` to the machine model.
- Add `predictiveRiskScore: number` (already partially present in `PredictiveMaintenanceCard`) → derive boolean `predictiveRisk` for filtering.
- Wire **Floorplan** view to `apps/web/src/components/control/factory-designer/*` output — render machines positioned by `floorplanCoords`. Falls back to card grid when no coords are set.
- Wire **Maintenance calendar** view to the same data source as Maintenance screen (§Maintenance).

### Smart-filter ideas

- **Machines trending toward unplanned downtime** — uptime trend × predictive risk × error-log frequency. Top use case from audit §7.
- Machines with rising scrap rate on a specific part family (cross-reference Make).
- Machines whose calibration window overlaps next 14 days.
- Underutilised machines (running < 30% of shift hours past 30 days).

### Out of scope

- FactoryDesigner authoring inside this screen.
- Heatmap overlay on the floorplan (v2).

---

## 4. Control · Locations

- **File:** `apps/web/src/components/control/ControlLocations.tsx:124-136`
- **Current state:** search only, card grid only, no filters.

### Filter schema

```ts
const locationsFilterSchema: FilterSchema = {
  module: 'control.locations',
  label: 'Locations',
  facets: [
    {
      id: 'type',
      label: 'Type',
      kind: 'multi',
      icon: MapPin,
      pinned: true,
      options: [
        { value: 'site',      label: 'Site' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'bay',       label: 'Bay' },
        { value: 'bin',       label: 'Bin' },
      ],
    },
    { id: 'parent',   label: 'Parent site', kind: 'select', icon: Building2, pinned: true, options: SITE_OPTIONS },
    { id: 'status',   label: 'Status',      kind: 'multi',  icon: CircleDot, options: STATUS_OPTIONS },
    { id: 'capacity', label: 'Capacity',    kind: 'range',  icon: Package },
    { id: 'occupancy',label: 'Occupancy %', kind: 'range',  icon: BarChart3 },
  ],
  viewModes: [
    { id: 'card', label: 'Cards',      icon: Grid3x3 },
    { id: 'list', label: 'List',       icon: ListIcon },
    { id: 'tree', label: 'Hierarchy',  icon: Network },  // site → bay → bin
    { id: 'map',  label: 'Floorplan',  icon: Map },
  ],
  defaultView: 'tree',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Over-capacity bins | AlertTriangle | error | `type:[bin] occupancy:{from:100}` |
| Empty bays | PackageX | neutral | `type:[bay] occupancy:{to:0}` |
| Active sites | Building2 | success | `type:[site] status:[active]` |
| My site | MapPin | info | `parent:[currentUser.site]` (personal) |

### Required data work

- Add `type` (site/warehouse/bay/bin), `parent`, `capacity`, `occupancyPct`, `status` to the location model — most absent today.
- Build the **Tree** view from `parent` references; fallback to flat list if `parent` is unset.
- **Floorplan** view shares the FactoryDesigner asset used by Machines.

### Smart-filter ideas

- Locations underutilised vs IoT/occupancy sensor data (audit §7).
- Bins assigned to obsolete products (housekeeping).
- Bays with mixed-temperature contents (compliance — only if temperature data exists).

### Out of scope

- Bin barcode generation.
- Editing the floorplan from this screen (lives in FactoryDesigner).

---

## 5. Control · Operations

- **File:** `apps/web/src/components/control/ControlOperations.tsx:130-151`
- **Current state:** search + Category pills. Table only.

### Filter schema

```ts
const operationsFilterSchema: FilterSchema = {
  module: 'control.operations',
  label: 'Operations',
  facets: [
    { id: 'category',    label: 'Category',    kind: 'multi',  icon: Tag,     pinned: true, options: CATEGORY_OPTIONS },
    { id: 'workCentre',  label: 'Work centre', kind: 'multi',  icon: Factory, pinned: true, options: WORKCENTRE_OPTIONS },
    { id: 'subcontract', label: 'Subcontract', kind: 'boolean',icon: Truck },
    { id: 'setupBand',   label: 'Setup time',  kind: 'range',  icon: Timer },
    { id: 'active',      label: 'Active',      kind: 'boolean',icon: CircleCheck },
  ],
  viewModes: [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'card', label: 'Card grid', icon: Grid3x3 },
  ],
  defaultView: 'list',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Subcontract ops | Truck | info | `subcontract:true` |
| Long-setup ops | Timer | warning | `setupBand:{from:60}` |
| Inactive ops | CircleSlash | neutral | `active:false` |

### Required data work

- Add `subcontract: boolean` and `setupMinutes: number` to operation model (audit notes these exist in data but aren't surfaced).

### Smart-filter ideas

- Operations contributing most to scheduling slack (cross-reference Plan).
- Operations whose subcontract supplier is on OTD watchlist (cross-reference Buy).
- Operations not used in any active Route (stale master data).

### Out of scope

- Operation cost-rate editor.

---

## 6. Control · Products

- **File:** `apps/web/src/components/control/ControlProducts.tsx:218-247`
- **Current state:** uses shared `FilterBar`, search + Category + Type. Table only.

### Filter schema

```ts
const productsFilterSchema: FilterSchema = {
  module: 'control.products',
  label: 'Products',
  facets: [
    { id: 'family',   label: 'Family',   kind: 'multi',  icon: Tag,    pinned: true, options: FAMILY_OPTIONS },
    {
      id: 'type',
      label: 'Type',
      kind: 'multi',
      icon: Package,
      pinned: true,
      options: [
        { value: 'manufactured', label: 'Manufactured' },
        { value: 'purchased',    label: 'Purchased' },
      ],
    },
    { id: 'category',  label: 'Category', kind: 'multi',  icon: Layers, options: CATEGORY_OPTIONS },
    { id: 'hasBOM',    label: 'Has BOM',  kind: 'boolean',icon: GitBranch },
    { id: 'active',    label: 'Active',   kind: 'boolean',icon: CircleCheck },
    { id: 'revision',  label: 'Revision', kind: 'range',  icon: GitCommit },
  ],
  viewModes: [
    { id: 'list', label: 'List',       icon: ListIcon },
    { id: 'card', label: 'Cards',      icon: Grid3x3 },
    { id: 'tree', label: 'Family tree',icon: Network },
  ],
  defaultView: 'list',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Manufactured · no BOM | AlertTriangle | error | `type:[manufactured] hasBOM:false` |
| Inactive products | CircleSlash | neutral | `active:false` |
| Latest revision drop | GitCommit | info | `revision:{from: maxRev-1}` |
| Active manufactured | Package | success | `type:[manufactured] active:true` |

### Required data work

- Family-tree view requires a `familyParent` ref; build from existing `family` string for v1 (flat grouping).
- `hasBOM` derived from BOMs collection.

### Smart-filter ideas

- Discontinued products still on open Sell orders (audit §6).
- Products with no transactions in 12 months (housekeeping).
- Products whose cost has drifted >X% vs last revision baseline.

### Out of scope

- Product variants editor.

---

## 7. Control · BOMs

- **File:** `apps/web/src/components/control/ControlBOMs.tsx:432-440`
- **Current state:** search only; `ControlBOMs.tsx:50` defines `status: active|draft|obsolete` but the toolbar advertises segments that are **display-only** — the audit explicitly flags this as the prime cheap win.

### Filter schema

```ts
const bomsFilterSchema: FilterSchema = {
  module: 'control.boms',
  label: 'BOMs',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: [
        { value: 'active',   label: 'Active',   color: 'var(--success-500)' },
        { value: 'draft',    label: 'Draft',    color: 'var(--mw-yellow-400)' },
        { value: 'obsolete', label: 'Obsolete', color: 'var(--neutral-300)' },
      ],
    },
    { id: 'family',     label: 'Family',     kind: 'multi',   icon: Tag,        pinned: true, options: FAMILY_OPTIONS },
    { id: 'revision',   label: 'Revision',   kind: 'range',   icon: GitCommit },
    { id: 'hasIssues',  label: 'Has issues', kind: 'boolean', icon: AlertTriangle },
    {
      id: 'updated',
      label: 'Updated',
      kind: 'date',
      icon: Clock,
      placeholder: 'Any time',
      quickRanges: ['thisWeek', 'thisMonth', 'thisQuarter', 'thisYear', 'ytd'],
    },
  ],
  viewModes: [
    { id: 'list', label: 'List',       icon: ListIcon },
    { id: 'tree', label: 'Explosion',  icon: Network },   // multi-level
    { id: 'kanban', label: 'By status', icon: Columns3, groupBy: 'status' },
  ],
  defaultView: 'list',
  dateFacetId: 'updated',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Active BOMs revised this month | GitCommit | yellow | `status:[active] updated:thisMonth` |
| Drafts awaiting review | FileEdit | warning | `status:[draft]` |
| BOMs with cost drift | TrendingUp | error | `hasIssues:true` (smart-backed) |
| Obsolete in use | AlertOctagon | error | `status:[obsolete]` AND smart predicate "linked to active WO" |

### Required data work

- **Cheap win — wire the summary segments at `ControlBOMs.tsx:415-440` to `status` facet via the new `onSegmentClick` on `ToolbarSummaryBar`.** Single PR, no schema gymnastics. Removes the audit's headline grievance.
- Tree view consumes existing nested component data.
- `hasIssues: boolean` derived from missing-component + cost-drift smart checks (see smart).

### Smart-filter ideas

- BOMs with cost drift vs spec baseline (audit §7).
- BOMs missing items vs latest revision (cross-references Plan / MRP).
- BOMs not used by any active Product or WO (stale).
- BOMs with components flagged out-of-stock right now (cross-reference Inventory).

### Out of scope

- BOM editor (separate canvas surface).
- Where-used graph view (v2 — tree only for v1).

---

## 8. Control · Inventory

- **File:** `apps/web/src/components/control/ControlInventory.tsx:683-710`
- **Current state:** search + Category pills. Table only. Already mounts `ToolbarSummaryBar` at `ControlInventory.tsx:709` — segments are display-only.

### Filter schema

```ts
const inventoryFilterSchema: FilterSchema = {
  module: 'control.inventory',
  label: 'Inventory',
  facets: [
    {
      id: 'stockBand',
      label: 'Stock',
      kind: 'multi',
      icon: BarChart3,
      pinned: true,
      options: [
        { value: 'out',       label: 'Out',        color: 'var(--error-500)' },
        { value: 'low',       label: 'Low',        color: 'var(--mw-yellow-500)' },
        { value: 'ok',        label: 'OK',         color: 'var(--success-500)' },
        { value: 'overstock', label: 'Overstock',  color: 'var(--neutral-400)' },
      ],
    },
    { id: 'category', label: 'Category', kind: 'multi',  icon: Tag,    pinned: true, options: CATEGORY_OPTIONS },
    { id: 'location', label: 'Location', kind: 'multi',  icon: MapPin, pinned: true, options: LOCATION_OPTIONS },
    { id: 'belowReorder', label: 'Below reorder', kind: 'boolean', icon: AlertTriangle },
    { id: 'lot',      label: 'Lot / batch', kind: 'tag', icon: Hash, options: LOT_OPTIONS },
    { id: 'costBand', label: 'Cost',     kind: 'range', icon: DollarSign },
    {
      id: 'lastMovement',
      label: 'Last movement',
      kind: 'date',
      icon: Clock,
      placeholder: 'Any time',
      quickRanges: ['thisWeek', 'thisMonth', 'thisQuarter', 'lastYear'],
    },
  ],
  viewModes: [
    { id: 'list',   label: 'List',     icon: ListIcon },
    { id: 'board',  label: 'Bin grid', icon: Grid3x3 },                // visual rack map
    { id: 'kanban', label: 'By stock', icon: Columns3, groupBy: 'stockBand' },
    { id: 'map',    label: 'Floorplan',icon: Map },
  ],
  defaultView: 'list',
  dateFacetId: 'lastMovement',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Below reorder | AlertTriangle | warning | `belowReorder:true` |
| Out — critical | AlertOctagon | error | `stockBand:[out]` |
| Stale (no movement 90d) | Hourglass | neutral | `lastMovement:{to: now-90d}` |
| My bay's stock | MapPin | info | `location:[currentUser.bay]` (personal) |
| Expiring lots | CalendarClock | warning | smart-backed (`lot.expiry within 30d`) |

### Required data work

- **Cheap win — make summary bar segments at `ControlInventory.tsx:709` clickable to set `stockBand`.** Same `onSegmentClick` wiring as BOMs.
- Add `lastMovement: ISO`, `belowReorder: boolean` (or derive from `onHand < reorderPoint`), `binCoords` for the bin-grid view.
- Bin-grid view requires a 2D `{x, y}` per row; defer with a fallback to card grid when coords absent.

### Smart-filter ideas

- Items below reorder with no open PO (cross-reference Buy).
- Stale stock not consumed by any open WO (cross-reference Make).
- Lots expiring within 30 days (compliance).
- Cost-band outliers vs historical baseline (theft / mispricing).

### Out of scope

- Stocktake reconciliation (separate flow).
- Map overlay on the floorplan (v2).

---

## 9. Control · Tooling

- **File:** `apps/web/src/components/control/ControlTooling.tsx`
- **Current state:** no toolbar surfaced despite life-percent and calibration data.

### Filter schema

```ts
const toolingFilterSchema: FilterSchema = {
  module: 'control.tooling',
  label: 'Tooling',
  facets: [
    { id: 'type', label: 'Type', kind: 'multi', icon: Wrench, pinned: true, options: TOOL_TYPE_OPTIONS },
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: [
        { value: 'available',   label: 'Available',   color: 'var(--success-500)' },
        { value: 'in-use',      label: 'In use',      color: 'var(--mw-yellow-400)' },
        { value: 'calibration', label: 'In calibration', color: 'var(--neutral-400)' },
        { value: 'retired',     label: 'Retired',     color: 'var(--neutral-300)' },
      ],
    },
    { id: 'owner',     label: 'Owner',     kind: 'select', icon: User,    options: OWNER_OPTIONS },
    { id: 'lifeBand',  label: 'Life left', kind: 'range',  icon: BatteryLow },
    {
      id: 'calibrationDue',
      label: 'Calibration due',
      kind: 'date',
      icon: ClipboardCheck,
      placeholder: 'Any time',
      quickRanges: ['next7days', 'thisMonth', 'thisQuarter', 'thisYear'],
    },
  ],
  viewModes: [
    { id: 'list',     label: 'List',          icon: ListIcon },
    { id: 'card',     label: 'Cards',         icon: Grid3x3 },     // with life bars
    { id: 'calendar', label: 'Calibration',   icon: CalendarDays },
  ],
  defaultView: 'list',
  dateFacetId: 'calibrationDue',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Calibration due this month | ClipboardCheck | warning | `calibrationDue:thisMonth status:[available,in-use]` |
| Low life | BatteryLow | error | `lifeBand:{to:20}` |
| Available now | CircleCheck | success | `status:[available]` |
| Retired | CircleSlash | neutral | `status:[retired]` |

### Required data work

- Mount `ModuleFilterBar` for the first time on this screen.
- Verify `lifePercent` and `calibrationDue` fields are on the tooling model (audit assumes so).

### Smart-filter ideas

- Tools whose use pattern predicts calibration drift before next scheduled date.
- Tools assigned to inactive operators.
- Tooling not used in any Operation (stale).

### Out of scope

- Tool checkout UX.

---

## 10. Control · Maintenance

- **File:** `apps/web/src/components/control/ControlMaintenance.tsx:258-296`
- **Current state:** tabs only (Schedule / History). No filters, no date range.

### Filter schema

```ts
const maintenanceFilterSchema: FilterSchema = {
  module: 'control.maintenance',
  label: 'Maintenance',
  facets: [
    {
      id: 'window',
      label: 'Window',
      kind: 'date',
      icon: CalendarDays,
      placeholder: 'Next 30 days',
      // Maintenance is forward-looking by default; quick chips reflect that.
      quickRanges: ['today', 'next7days', 'thisMonth', 'thisQuarter'],
    },
    { id: 'machine', label: 'Machine', kind: 'multi', icon: Cog, pinned: true, options: MACHINE_OPTIONS },
    {
      id: 'type',
      label: 'Type',
      kind: 'multi',
      icon: Wrench,
      pinned: true,
      options: [
        { value: 'preventive',  label: 'Preventive' },
        { value: 'corrective',  label: 'Corrective' },
        { value: 'predictive',  label: 'Predictive' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: [
        { value: 'scheduled',  label: 'Scheduled',  color: 'var(--neutral-400)' },
        { value: 'inProgress', label: 'In progress',color: 'var(--mw-yellow-500)' },
        { value: 'overdue',    label: 'Overdue',    color: 'var(--error-500)' },
        { value: 'completed',  label: 'Completed',  color: 'var(--success-500)' },
      ],
    },
    { id: 'assignee', label: 'Assignee', kind: 'select', icon: User, options: USER_OPTIONS },
    { id: 'overdue',  label: 'Overdue',  kind: 'boolean', icon: AlertTriangle },
  ],
  viewModes: [
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'list',     label: 'List',     icon: ListIcon },
    { id: 'gantt',    label: 'Gantt',    icon: GanttChartSquare },
    { id: 'kanban',   label: 'By status',icon: Columns3, groupBy: 'status' },
  ],
  defaultView: 'calendar',
  dateFacetId: 'window',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Overdue | AlertOctagon | error | `overdue:true status:[overdue,inProgress]` |
| Due this week | CalendarClock | warning | `window:next7days status:[scheduled,inProgress]` |
| Predictive — open | TrendingDown | info | `type:[predictive] status:[scheduled,inProgress]` |
| My machines | Wrench | yellow | `assignee:currentUser` (personal) |
| History last 90 days | History | neutral | `status:[completed] window:{from: now-90d, to: today}` |

### Required data work

- Replace the Schedule / History tabs with a single page using the `window` date facet; "history" becomes the preset "History last 90 days".
- Calendar view consumes existing scheduled items; Gantt is a v2 stretch but cheap if calendar is in.
- Add `assignee: userId` and `overdue: boolean` derived field if not present.

### Smart-filter ideas

- Maintenance items whose machine is forecast to fail before the scheduled date (cross-reference predictive risk).
- Recurring maintenance items skipped >2 cycles (audit gap).
- Maintenance load per assignee for the next 7 days (capacity).

### Out of scope

- Work order creation (separate Make flow).

---

## 11. Control · Routes

- **File:** `apps/web/src/components/control/ControlRoutes.tsx:119-148`
- **Current state:** search + name/code, no filters. Card list.

### Filter schema

```ts
const routesFilterSchema: FilterSchema = {
  module: 'control.routes',
  label: 'Routes',
  facets: [
    { id: 'product',   label: 'Product/family', kind: 'multi',  icon: Package, pinned: true, options: FAMILY_OPTIONS },
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: [
        { value: 'active',   label: 'Active' },
        { value: 'draft',    label: 'Draft' },
        { value: 'obsolete', label: 'Obsolete' },
      ],
    },
    { id: 'operation', label: 'Operation', kind: 'multi',  icon: Cog,  options: OPERATION_OPTIONS },
    { id: 'owner',     label: 'Owner',     kind: 'select', icon: User, options: USER_OPTIONS },
  ],
  viewModes: [
    { id: 'card', label: 'Cards',         icon: Grid3x3 },
    { id: 'list', label: 'List',          icon: ListIcon },
    { id: 'tree', label: 'Flow diagram',  icon: Network },  // operation chain
  ],
  defaultView: 'card',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Active routes | CircleCheck | success | `status:[active]` |
| Drafts | FileEdit | warning | `status:[draft]` |
| Owned by me | User | info | `owner:currentUser` (personal) |

### Required data work

- Add `operation: string[]` reference array to the route model for the Operation facet.
- Flow-diagram view leans on existing operation-chain rendering.

### Smart-filter ideas

- Routes referencing obsolete operations.
- Routes with no active product (stale).
- Routes whose total lead-time has drifted vs baseline.

### Out of scope

- Route editor.

---

## 12. Control · Documents

- **File:** `apps/web/src/components/control/ControlDocuments.tsx:44-135`
- **Current state:** **no search, no filters** despite type / owner / status / lastUpdated columns. Table with expandable revisions.

### Filter schema

```ts
const documentsFilterSchema: FilterSchema = {
  module: 'control.documents',
  label: 'Documents',
  facets: [
    { id: 'type',  label: 'Type',  kind: 'multi',  icon: FileType,  pinned: true, options: DOC_TYPE_OPTIONS },
    { id: 'owner', label: 'Owner', kind: 'select', icon: User,      pinned: true, options: USER_OPTIONS },
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: [
        { value: 'draft',    label: 'Draft' },
        { value: 'approved', label: 'Approved' },
      ],
    },
    { id: 'linkedTo', label: 'Linked to', kind: 'select', icon: Link2, options: LINK_TARGET_OPTIONS }, // machine | operation | product
    {
      id: 'expiry',
      label: 'Expiry',
      kind: 'date',
      icon: CalendarClock,
      placeholder: 'Any time',
      quickRanges: ['next7days', 'thisMonth', 'thisQuarter', 'thisYear'],
    },
    {
      id: 'updated',
      label: 'Updated',
      kind: 'date',
      icon: Clock,
      placeholder: 'Any time',
      quickRanges: ['thisWeek', 'thisMonth', 'thisQuarter', 'thisYear'],
    },
  ],
  viewModes: [
    { id: 'list', label: 'List',   icon: ListIcon },
    { id: 'card', label: 'Cards',  icon: Grid3x3 },   // with thumbnails
    { id: 'tree', label: 'Folders',icon: FolderTree },
  ],
  defaultView: 'list',
  dateFacetId: 'expiry',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Expiring within 30 days | CalendarClock | warning | `expiry:{from: today, to: today+30d}` |
| Drafts owned by me | FileEdit | info | `status:[draft] owner:currentUser` (personal) |
| Certificates only | BadgeCheck | yellow | `type:[certificate]` |
| Updated this month | History | neutral | `updated:thisMonth` |

### Required data work

- Mount `ModuleFilterBar` for the first time on this screen.
- Add `expiry: ISO?` and `linkedTo` reference (machine/operation/product id + kind) to the document model.

### Smart-filter ideas

- Documents whose linked machine is offline / retired (broken refs).
- Certificates expiring within the next 30 days where the owner has no replacement queued.
- Documents not opened in 12 months (housekeeping).

### Out of scope

- Document viewer / revision editor.

---

## 13. Control · Audit

- **File:** `apps/web/src/components/control/ControlAudit.tsx:139-167`
- **Current state:** search + single-select Category. No date range despite being an audit log.

### Filter schema

```ts
const auditFilterSchema: FilterSchema = {
  module: 'control.audit',
  label: 'Audit log',
  facets: [
    {
      id: 'window',
      label: 'Event window',
      kind: 'date',
      icon: CalendarDays,
      placeholder: 'Last 30 days',
      quickRanges: ['today', 'thisWeek', 'thisMonth', 'thisQuarter', 'lastMonth'],
    },
    { id: 'category', label: 'Category', kind: 'multi',  icon: Tag,        pinned: true, options: CATEGORY_OPTIONS },
    { id: 'actor',    label: 'Actor',    kind: 'select', icon: User,       pinned: true, options: USER_OPTIONS },
    { id: 'module',   label: 'Module',   kind: 'multi',  icon: LayoutGrid, pinned: true, options: MODULE_OPTIONS },
    {
      id: 'severity',
      label: 'Severity',
      kind: 'multi',
      icon: AlertTriangle,
      options: [
        { value: 'info',    label: 'Info',     color: 'var(--neutral-300)' },
        { value: 'warning', label: 'Warning',  color: 'var(--mw-yellow-500)' },
        { value: 'error',   label: 'Error',    color: 'var(--error-500)' },
        { value: 'critical',label: 'Critical', color: 'var(--mw-mirage)' },
      ],
    },
  ],
  viewModes: [
    { id: 'list',  label: 'List',     icon: ListIcon },
    { id: 'tree',  label: 'Timeline', icon: GitCommit },   // grouped by day
    { id: 'board', label: 'By actor', icon: Columns3, groupBy: 'actor' },
  ],
  defaultView: 'list',
  dateFacetId: 'window',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Permission changes last 7 days | ShieldAlert | error | `category:[permission] window:thisWeek` |
| Failed sign-ins | LogIn | warning | `category:[auth.failure]` |
| Critical events this month | AlertOctagon | error | `severity:[critical] window:thisMonth` |
| My actions | User | info | `actor:currentUser` (personal) |

### Required data work

- Multi-select Category instead of single Select (the current screen uses single Select per `ControlAudit.tsx:139-167`).
- Add `severity` and `module` fields to the audit event model.
- Default state on load is `window:thisMonth` — set via initial preset, not hard-coded.

### Smart-filter ideas

- Permission anomalies (audit §7) — users with mixed role levels across modules vs their peers.
- Bursts of error-severity events from a single actor (intrusion / runaway script).
- Off-hours admin actions.

### Out of scope

- Export/SIEM forwarding.

---

## 14. Control · Shift Manager

- **File:** `apps/web/src/components/control/ControlShiftManager.tsx:367-383`
- **Current state:** search + Department Select. Calendar grid.

### Filter schema

```ts
const shiftManagerFilterSchema: FilterSchema = {
  module: 'control.shift-manager',
  label: 'Shifts',
  facets: [
    { id: 'department', label: 'Department', kind: 'multi', icon: Building2, pinned: true, options: DEPT_OPTIONS },
    {
      id: 'role',
      label: 'Role',
      kind: 'multi',
      icon: ShieldCheck,
      pinned: true,
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'lead',  label: 'Lead' },
        { value: 'team',  label: 'Team' },
      ],
    },
    { id: 'location', label: 'Location', kind: 'select', icon: MapPin, options: LOCATION_OPTIONS },
    { id: 'pattern',  label: 'Shift pattern', kind: 'select', icon: Repeat, options: PATTERN_OPTIONS },
    {
      id: 'window',
      label: 'Window',
      kind: 'date',
      icon: CalendarDays,
      placeholder: 'This week',
      quickRanges: ['thisWeek', 'next7days', 'thisMonth', 'thisQuarter'],
    },
  ],
  viewModes: [
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'list',     label: 'List',     icon: ListIcon },
    { id: 'board',    label: 'By dept',  icon: Columns3, groupBy: 'department' },
  ],
  defaultView: 'calendar',
  dateFacetId: 'window',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Day shift this week | Sun | yellow | `pattern:[day] window:thisWeek` |
| Night shift | Moon | info | `pattern:[night]` |
| Leads only | ShieldCheck | warning | `role:[lead]` |

### Required data work

- Sweep mock data for non-conforming role values (audit constraint) — `Manager / Supervisor / Operator` → `admin / lead / team`.
- Add `pattern` (day/swing/night) to shift records if absent.

### Smart-filter ideas

- Departments under shift-coverage threshold for the next 7 days.
- Operators on consecutive overtime weeks (welfare).

### Out of scope

- Shift assignment editor (separate flow).

---

## 15. Control · Gamification

- **File:** `apps/web/src/components/control/ControlGamification.tsx:247`
- **Current state:** Status pills (Active/Draft). Card list.

### Filter schema

```ts
const gamificationFilterSchema: FilterSchema = {
  module: 'control.gamification',
  label: 'Gamification',
  facets: [
    {
      id: 'status',
      label: 'Status',
      kind: 'multi',
      icon: CircleDot,
      pinned: true,
      options: [
        { value: 'active', label: 'Active', color: 'var(--success-500)' },
        { value: 'draft',  label: 'Draft',  color: 'var(--mw-yellow-400)' },
      ],
    },
    { id: 'group',  label: 'Group',  kind: 'multi',  icon: Users,     options: GROUP_OPTIONS },
    { id: 'metric', label: 'Metric', kind: 'multi',  icon: BarChart3, options: METRIC_OPTIONS },
    {
      id: 'window',
      label: 'Range',
      kind: 'date',
      icon: CalendarDays,
      placeholder: 'This quarter',
    },
  ],
  viewModes: [
    { id: 'card', label: 'Cards', icon: Grid3x3 },
    { id: 'list', label: 'List',  icon: ListIcon },
  ],
  defaultView: 'card',
  dateFacetId: 'window',
};
```

### System presets

| Name | Icon | Tone | State |
|---|---|---|---|
| Active challenges | Trophy | yellow | `status:[active]` |
| Drafts | FileEdit | warning | `status:[draft]` |

### Required data work

- Minimal — add `group: string[]` ref if missing.

### Smart-filter ideas

- Challenges with declining participation week-over-week.

### Out of scope

- Challenge designer UI.

---

## 16. Canvas / designer surfaces — explicitly out of scope

`ProcessBuilder`, `WorkflowDesigner`, `FactoryDesigner`, `ControlRoleDesigner` (latter deprecated — see `project_role_config_deprecated.md`) are canvas tools, not list views. They get no `ModuleFilterBar`. The **Floorplan** view mode used by Machines / Locations / Inventory consumes FactoryDesigner output but does not embed the editor.

---

## 17. Rollout order

Loosely matched to value × cost — clickable summary segments first because they're effectively free:

1. **Foundation PR for Control** — extend `ToolbarSummaryBar` with `onSegmentClick` + `activeKey`. No screen migrations yet. (~30 LoC.)
2. **People — Users** (most-used Control screen; biggest role-vocab cleanup).
3. **BOMs** (audit's headline cheap win — clickable summary segments).
4. **Inventory** (same cheap win + biggest filter expansion).
5. **Machines** (floorplan view-mode work begins here, gated behind FactoryDesigner output).
6. **Maintenance** (collapse tabs, add date facet + calendar view).
7. **Audit** (multi-Category + date window — operationally critical).
8. **Documents** (first-time toolbar mount, fills the biggest UX gap).
9. **Locations / Products / Routes / Operations** — batch (similar shape, minimal data work).
10. **Tooling / Shift Manager / Gamification** — closeout.

## 18. References

- Sell pilot — `apps/web/src/components/sell/{SellOpportunities,SellInvoices,SellOrders}.tsx`
- Shared filter primitives — `apps/web/src/components/shared/filters/{schema,DateChip,ModuleFilterBar,savedViews}.ts(x)`
- Summary bar to extend — `apps/web/src/components/shared/layout/PageToolbar.tsx:171`
- Role vocab constraint — `MEMORY.md` → "Access role vocabulary" (admin / lead / team only)
- Yellow-tile constraint — `MEMORY.md` → "Yellow bg = dark text" (system-preset tiles)
- Light-mode constraint — `MEMORY.md` → "Preserve light mode"
