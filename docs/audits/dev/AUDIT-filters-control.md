# AUDIT — Control module filters, search & view UX

Scope: master-data and configuration screens under `apps/web/src/components/control/`. Read-only audit. Reference style: Odoo search/filter UX.

Role vocabulary in this audit is restricted to **admin / lead / team**. References to "manager/operator/supervisor" anywhere in the codebase are non-conformant and out of scope here.

---

## 1. Current filters & views per screen

| Screen | File:line | Search | Filter pills / dropdowns | View modes |
|---|---|---|---|---|
| People — Users | `apps/web/src/components/control/people/UsersTab.tsx:62-108` | Name + email | Module (multi), Role (lead/team), Status (active/pending/inactive) | Table only |
| People — Groups | `apps/web/src/components/control/ControlGroups.tsx:88-120` | Name + description | Module (single), Type (default/custom) | Table only |
| Machines | `apps/web/src/components/control/ControlMachines.tsx:827-865` | Name/manufacturer/type | Status pills (Active/Maintenance/Idle/Offline), Type pill | Grid / List toggle (`IconViewToggle`) |
| Locations | `apps/web/src/components/control/ControlLocations.tsx:124-136` | Name + address | none | Card grid only |
| Operations | `apps/web/src/components/control/ControlOperations.tsx:130-151` | Op name + work-centre | Category pills | Table only |
| Products | `apps/web/src/components/control/ControlProducts.tsx:218-247` (via `FilterBar`) | Name + SKU | Category, Type | Table only |
| BOMs | `apps/web/src/components/control/ControlBOMs.tsx:432-440` | Product + SKU | **none** (status segments are display-only) | Table + expandable rows |
| Inventory | `apps/web/src/components/control/ControlInventory.tsx:683-710` | Name + SKU | Category pills only | Table only (transfers/adjust as separate tabs) |
| Tooling | `apps/web/src/components/control/ControlTooling.tsx` | none surfaced | none | Table only |
| Maintenance | `apps/web/src/components/control/ControlMaintenance.tsx:258-296` | none | Tabs: Schedule / History | Table only |
| Routes | `apps/web/src/components/control/ControlRoutes.tsx:119-148` | Route name/code | none | Card list |
| Audit | `apps/web/src/components/control/ControlAudit.tsx:139-167` | Actor/target/message | Category (single Select) | Table only |
| Documents | `apps/web/src/components/control/ControlDocuments.tsx:44-135` | **none** | **none** | Table with expandable revisions |
| Billing | `apps/web/src/components/control/ControlBilling.tsx` | n/a | tier toggle | Card |
| Shift Manager | `apps/web/src/components/control/ControlShiftManager.tsx:367-383` | Name/role/department | Department Select | Calendar grid |
| Gamification | `apps/web/src/components/control/ControlGamification.tsx:247` | none | Status (Active/Draft) | Card list |
| Process Builder, Workflow Designer, Factory Designer | various | n/a — canvas/designer surfaces | n/a | Canvas |

---

## 2. Irrelevant / generic filters to remove or rename

- **Users** `UsersTab.tsx:104` — status `pending` labelled "Invited" is fine, but `inactive`/"Deactivated" is the only lifecycle state — no offboarding/leave/contractor distinctions. Generic for master-data.
- **BOMs** `ControlBOMs.tsx:432` — only a search box; no status/family/revision filters even though `status: active|draft|obsolete` exists in the data model (`ControlBOMs.tsx:50`). The summary bar advertises the segments but they aren't clickable.
- **Inventory** `ControlInventory.tsx:686` — only Category. No location, on-hand band, reorder-flag, lot/batch — all of which are core to inventory master data.
- **Locations** — no filters at all. Sites/zones/bin types are not distinguishable; status is shown but not filterable.
- **Audit** — single-select Category only. Cannot filter by actor, target module, or **date range** (a baseline expectation for an audit log).
- **Documents** — neither search nor filter. `type`, `owner`, `status`, `lastUpdated` are all columns but none are filterable.
- **Tooling** — no toolbar surfaced at all despite life-percent and calibration date data.
- **Maintenance** — tabs only; no machine/type/window filter, no date range, no overdue toggle.
- **Operations** — Category pills only; no filter for subcontract, capability, or work-centre even though the data carries them.
- **Groups** — `Type=default/custom` is a sensible engineering filter but reads as jargon to admins. Rename "System / Custom".

---

## 3. Recommended filters per data type

| Screen | Recommended filters (replace/extend) |
|---|---|
| **People — Users** | Role (**admin/lead/team** — no other vocab), Module, Group/Department, Location, Status (active/invited/deactivated), Last seen (range), Has expiring competency cert |
| **People — Groups** | Module, System vs Custom, Member-count band, Has admin access |
| **Machines** | Type, Work-centre, Location, Status (running/idle/down/maintenance), Capability tag, Connection state (online/offline/error), Has predictive risk flag |
| **Locations** | Type (site/warehouse/bay/bin), Parent site, Capacity band, Current occupancy %, Active status |
| **Operations** | Category, Work-centre, Subcontract Y/N, Setup-time band, Active |
| **Products** | Family, Type (manufactured/purchased), Category, Has BOM, Active, Revision range |
| **BOMs** | Status (active/draft/obsolete) — make summary segments clickable, Family/Product, Revision, Has issues (missing components / cost drift), Last updated range |
| **Inventory** | Category, Location (incl. parent), On-hand band (out / low / ok / overstock), Below-reorder, Stale stock (no movement >N days), Lot/batch, Cost band |
| **Tooling** | Type, Status (available/in-use/calibration/retired), Calibration-due window, Life-remaining band, Owner |
| **Maintenance** | Date window (always visible), Machine, Type (preventive/corrective/predictive), Status (scheduled/in-progress/overdue/completed), Assignee, Overdue toggle |
| **Routes** | Product/family, Status, Operation contained, Owner |
| **Documents** | Type, Owner, Status (draft/approved), Last-updated range, Expiring within N days, Linked to (machine/operation/product) |
| **Audit** | Date range (always visible), Category (multi, not single), Actor, Target module, Severity |
| **Shift Manager** | Department (already), Role (admin/lead/team), Location, Shift pattern, Date range |
| **Gamification** | Status, Group, Metric, Time range |

---

## 4. Recommended view modes — what's missing

| Screen | Today | Add |
|---|---|---|
| People — Users | Table | **Org chart** (lead → team), Card directory, By-module matrix |
| People — Groups | Table | **Module matrix** (group × module), Permission heat-grid |
| Machines | Grid + List | **Factory floorplan / map** (link to FactoryDesigner), Kanban by status, Calendar of maintenance |
| Locations | Cards | **Tree** (site → bay → bin), **Floorplan map**, Heatmap of occupancy |
| BOMs | Table + expand | **Tree** (multi-level explosion), Where-used graph |
| Products | Table | Card with image, Family tree |
| Inventory | Table | **Bin grid** (visual rack map), Kanban by stock band, Map overlay |
| Maintenance | Table (tabbed) | **Calendar**, Gantt of windows, Per-machine timeline |
| Routes | Card list | **Flow diagram** (operation chain) |
| Documents | Table | Folder/tree, Cards with thumbnails |
| Audit | Table | **Timeline**, Actor-grouped view |
| Tooling | Table | **Calibration calendar**, Card grid with life bars |

---

## 5. Persistent date fields — flag as always-visible

These screens should default to a date range selector pinned in the toolbar, not buried in a filter pill:

- **Maintenance** — schedule window (default: next 30 days; history default: last 90 days). `ControlMaintenance.tsx:258`.
- **Audit** — last 30 days default, with quick chips (7d / 30d / 90d / custom). Currently no date input. `ControlAudit.tsx:139`.
- **Documents** — "expiring within" window and "updated since". Currently absent. `ControlDocuments.tsx`.
- **Inventory** — last-movement window for stale stock and stocktake age.
- **People** — "last seen" window for inactive-user cleanup.

---

## 6. Preset opportunities (Odoo-style saved searches)

Personal vs shared. 3–5 per screen. None of these exist today.

**People — Users**
- "My team" (rows where lead = current user) — personal
- "Active admins" — shared
- "Pending invites > 7 days" — shared
- "Deactivated last 90 days" — shared
- "Leads without a module assignment" — shared

**Machines**
- "Down or in maintenance right now" — shared
- "Day-shift active machines" — shared
- "Offline > 24h" — shared
- "Predictive risk: high" — shared
- "My work-centre" (current user's department) — personal

**Locations**
- "Over-capacity bins" — shared
- "Empty bays" — shared
- "My site" — personal

**Inventory**
- "Below reorder point" — shared
- "Out of stock — critical" — shared
- "Stale stock (no movement 90 days)" — shared
- "My bay's stock" — personal
- "Expiring lots" — shared

**BOMs / Products**
- "Active BOMs revised this month" — shared
- "Drafts awaiting review" — shared
- "BOMs with cost drift vs target" — shared
- "Discontinued products still on open orders" — shared

**Maintenance**
- "Overdue" — shared
- "Due this week" — shared
- "My machines" (assigned to current user) — personal
- "Predictive — open" — shared

**Documents**
- "Expiring within 30 days" — shared
- "Drafts owned by me" — personal
- "Certificates only" — shared

**Audit**
- "Permission changes last 7 days" — shared
- "Failed sign-ins" — shared
- "My actions" — personal

---

## 7. Smart / AI filter ideas

High-value queries that combine signals beyond a single column:

1. **Machines trending toward unplanned downtime** — combine uptime trend, predictive-maintenance risk score, error log frequency. Surfaces on `ControlMachines.tsx` next to status pills. Hooks into the existing `PredictiveMaintenanceCard`.
2. **People with expiring competency / certification** — joins user → competency records → document expiry within N days. Lives on People and Documents.
3. **BOMs with cost drift vs spec** — flags BOMs whose rolled-up `costPrice` has shifted >X% from a baseline revision. Inventory cost × line qty.
4. **Locations underutilised vs sensor data** — joins capacity with shop-floor occupancy/IoT signals to find bays with low utilisation.
5. **Stale master data** — products/BOMs/operations not edited in >12 months with zero recent transaction usage. Useful for housekeeping.
6. **Permission anomalies** — users with admin in one module but team in adjacent modules where their peers have lead; surfaces in Audit + People.

---

## Notes & references

- Shared toolbar primitives: `apps/web/src/components/shared/layout/PageToolbar.tsx` (`ToolbarSearch`, `ToolbarFilterPills`, `ToolbarSummaryBar`).
- Shared filter bar: `apps/web/src/components/shared/layout/FilterBar.tsx` (used by Products, BOMs).
- Toolbar summary segments are currently informational only; making them clickable as filters is a low-cost win (BOMs, Inventory, People — multiple screens).
- The People Users `FilterPill` component (`UsersTab.tsx:227`) and the toolbar `ToolbarFilterPills` (single-value) are two separate filter idioms — consider unifying for consistent multi-select UX across Control.
- Inspiration: Odoo's "Filters / Group By / Favourites" three-bucket model would map cleanly onto MirrorWorks: pills today already do Filters; Group By is missing entirely; Favourites = the preset opportunities in §6.
