# Plan Module — Filter, Search & View UX Audit

Scope: `apps/web/src/components/plan/` — the screens where planners build, sequence and protect production work. Today most filtering is either generic (status pills, customer name) or absent. Planners actually filter by **time horizons**, **material readiness**, **route completeness**, **machine commitment**, **demand source** and **planner ownership** — none of these are first-class today.

Shared primitives in use: `FilterBar.tsx`, `PageToolbar.tsx` (`ToolbarSearch`, `ToolbarFilterPills`, `ToolbarSpacer`, `ToolbarSummaryBar`), `ToolbarFilterButton.tsx`, `IconViewToggle`. Most pages mount `ToolbarFilterButton` as a stub — it opens nothing.

---

## 1. Per-screen audit

### PlanJobs — `apps/web/src/components/plan/PlanJobs.tsx`

| Aspect | Current |
|---|---|
| Search | Free-text only (`PlanJobs.tsx:199`); doesn't actually filter data — `searchQuery` is unused in render |
| Filters | Stub `ToolbarFilterButton` (`PlanJobs.tsx:201`) — no panel wired |
| Views | Kanban / List / Card (`PlanJobs.tsx:202-210`) |
| Summary | Stacked summary bar by stage (`PlanJobs.tsx:455-463`) |

**Irrelevant / weak**
- Generic "filter" pill button leads nowhere.
- Card view is decorative — duplicates Kanban without grouping value.
- Search box exists but is not applied to the rendered set.

**Recommended filters**
- Stage (multi-select, replacing pure Kanban columns when in List view).
- Priority (urgent / high / medium / low).
- Customer (multi).
- Planner / assigned-to (multi, "Me" toggle).
- Due-date window: Overdue · This week · Next 14 days · Next month · Custom.
- Material readiness: Ready · Short · Awaiting PO · No BOM.
- Route status: Routed · Missing routing · Partial.
- Promise risk: On track · At risk · Will miss.
- Value band (slider) — useful for sequencing decisions.

**Views to add**
- **Gantt** across all jobs (today only on `/plan/schedule`). Jobs page should toggle into a horizontal timeline so a planner can see slip without leaving.
- **Drop "Card" view** unless reskinned as a tactile "ready-to-release" lane.

**Persistent date bar**: yes — a small "due between … and …" chip should live on the toolbar; presets feed into it.

**Presets**
- *Mine, this week* (assigned = me, due ≤ +7d).
- *Hot-list* (priority ≥ high OR promise = at-risk).
- *Awaiting material* (readiness ≠ ready).
- *Routing TODO* (route status ≠ routed).
- *Shared — Planning standup* (this week + at-risk + backlog count).

---

### PlanJobDetail — `apps/web/src/components/plan/PlanJobDetail.tsx`

Detail view; filters mostly N/A. The embedded `BomRoutingTree` carries its own kind/search filter (see below). The Schedule and Travellers tabs should inherit the parent job's date window — currently each tab maintains its own local state.

---

### PlanProducts — `apps/web/src/components/plan/PlanProducts.tsx`

| Aspect | Current |
|---|---|
| Search | Local input over name/SKU (`PlanProducts.tsx:142-144`) — uses an older `Input` pattern, not `ToolbarSearch` |
| Filters | None |
| Views | Table only |

**Recommended filters**
- BOM status (Yes · Missing · Stale vs revision).
- Lead-time band (≤5d · 6–14d · 15–30d · >30d).
- Cycle hours band.
- Work-centre touched (multi).
- Product family / category.
- Last produced (window).
- Has Studio configurator record (yes/no — already implied by `studioProductIdForCatalogId`).

**View modes**
- **Card view** with thumbnail + BOM health pill — useful for showroom-style review.
- **BOM-depth tree view** (group by parent assembly) — currently no way to see assemblies vs leaf parts.

**Presets**: *Missing BOM*, *Long lead-time (>14d)*, *Not produced in 90 days*, *Touches bottleneck work-centre*.

---

### PlanSchedule — `apps/web/src/components/plan/PlanSchedule.tsx`

| Aspect | Current |
|---|---|
| Filters | Status pills: All / Active / Scheduled / Completed (`PlanSchedule.tsx:107-116`) — and stub filter button |
| Views | Gantt + Calendar (`PlanSchedule.tsx:119-126`) |
| Date | Calendar has a month state but Gantt is hard-coded `MONTH_BASE` (`PlanSchedule.tsx:36`, `:96-97`) — **no user date control** |

**Irrelevant filters**
- "Completed" is rarely useful on the live schedule — should be off by default behind a "show closed" toggle.

**Recommended filters**
- Date horizon (the persistent one).
- Work-centre (multi) — most useful when paired with Schedule Engine.
- Customer.
- Promise risk (at-risk / late).
- Owner / planner.
- Job tag (rush, internal, R&D).

**Views to add**
- **Work-centre swimlanes** (rows = work centres, not jobs) — already what `PlanScheduleEngine` produces, but the standalone Schedule page is job-banded only.
- **Day view** for shift planners (today + tomorrow zoom).

**Persistent date bar**: **mandatory.** Gantt + Calendar should share a controlled `[from, to]` range with quick zooms (Day · Week · 4-week · Quarter).

**Presets**: *This week's load*, *Bottleneck centre only*, *At-risk jobs*, *Rush queue*, *Shared — Monday production huddle*.

---

### PlanScheduleEngine — `apps/web/src/components/plan/PlanScheduleEngine.tsx`

AI-driven proposal engine; no filter/search bar today. Filters that would help: which work-centres to include in re-sequencing, which jobs to lock (don't move), date window for the reflow. Currently the engine treats all blocks equally — adding a "scope" filter (centre/job tag/date) would let planners run constrained "only fix this week" proposals.

---

### PlanScheduleTab (per-job tab) — `PlanScheduleTab.tsx`

`all / done / pending` filter pills + Gantt/Calendar toggle. Adequate for one job, but should additionally filter by **work-centre** and **subcontract vs internal** since long-lead subcontract ops drive most slip.

---

### PlanMrp — `apps/web/src/components/plan/PlanMrp.tsx`

| Aspect | Current |
|---|---|
| Search/filter | **None** (`PlanMrp.tsx` — pure tree) |
| View | Cascade tree only |

**Recommended filters**
- Node type (Sales Order / Job / MO / PO).
- Status (Fulfilled / Partial / Pending / Shortage) — colour-coded already; expose as pill row.
- Demand source (customer order / forecast / safety stock).
- Date horizon (weekly buckets across the next 8–12 weeks).
- Material / SKU search.
- Show shortages only (toggle).

**Views to add**
- **Weekly-bucket grid** (rows = item, cols = weeks, cells = net requirement) — this is the canonical MRP grid and is missing entirely.
- **Flat list** view with sort by shortage size.

**Persistent date bar**: **yes** — MRP horizon (default 8 weeks) is the user's primary lever.

**Presets**: *Shortages this week*, *Long-lead POs unplaced*, *Forecast vs firm demand*, *Customer X demand only*.

---

### PlanPurchase — `apps/web/src/components/plan/PlanPurchase.tsx`

| Aspect | Current |
|---|---|
| Filters | Status pills All/Out/Low/In Stock (`PlanPurchase.tsx:289-298`); hand-rolled job pill bar (`PlanPurchase.tsx:301-316`); stub filter button (`PlanPurchase.tsx:317`) |
| Search | Material / SKU / job (`PlanPurchase.tsx:288`) |
| Views | Table + suggested-PO card grid below |

**Irrelevant**: Job filter is bespoke pill row — should reuse `ToolbarFilterPills` or a multiselect.

**Recommended filters**
- Supplier (multi).
- Required-by window (this week / next / overdue).
- Lead-time band.
- Shortfall value band.
- Has alternate supplier (yes/no).
- Already on order (yes/no).
- Job (multi, not just one-at-a-time).

**Persistent date**: required-by horizon.

**Presets**: *Place this week*, *Shortages by value > $5k*, *Long-lead items*, *Single-source items*, *Shared — Buyer's morning list*.

---

### PlanNesting — `apps/web/src/components/plan/PlanNesting.tsx`

| Aspect | Current |
|---|---|
| Filters | **None** |
| Views | Card grid of SVG nest previews |

**Recommended filters**
- Material + gauge (the two primary nesting keys).
- Sheet size.
- Yield band (e.g. <70% = waste-heavy).
- Job (which jobs' parts are on the sheet).
- Status (planned / ready to cut / cut).
- Machine / cutter.

**Views to add**
- **Sheet-list table** (sortable by yield, parts count, due date).
- **Material/grade groups** (collapsible by sheet stock).
- **Cut-queue board** (kanban: planned → on machine → cut).

**Persistent date**: target cut date.

**Presets**: *Low yield (<70%)*, *Today's cut queue*, *Off-cuts available*, *Awaiting material*.

---

### PlanNCConnect — `PlanNCConnect.tsx`

Status filter on machine list is present but informal. Add: machine type, match-% threshold, online/offline, post-processor compatibility. Add a saved view *Machines ready to receive* for shop-floor handoff.

---

### PlanSheetCalculator — `PlanSheetCalculator.tsx`

Pure calculator; filter/view N/A.

---

### PlanLibraries — `PlanLibraries.tsx`

Wrapper; filtering lives inside `material-library/MaterialLibrary` and `finish-library/FinishLibrary`. Confirm those have grade, supplier, stock-level filters in their own audit pass.

---

### PlanActivities — `PlanActivities.tsx`

Filters: none beyond calendar/list toggle. Add: event type (job / maintenance / QC), assignee, work-centre, date range. Presets: *Maintenance window*, *QC checkpoints this week*.

---

### PlanQCPlanning — `PlanQCPlanning.tsx`

Filters: only `ToolbarSearch` + filter-button stub (`PlanQCPlanning.tsx:24-25`). Add: inspection type (visual/dimensional/NDT/etc.), work-centre, inspector, mandatory-only, pass-rate band, checklist status, NCR severity. Presets: *Open NCRs*, *My checklists due*, *Mandatory inspections below 95% pass rate*.

---

### PlanOperationRouting — `PlanOperationRouting.tsx`

Card-level table, no filter. Add: subcontracted-only toggle, work-centre filter, long-step toggle (>X mins).

---

### PlanCapableToPromise — `PlanCapableToPromise.tsx`

Result card; filter N/A but date horizon should be settable.

---

### BomRoutingTree — `apps/web/src/components/plan/BomRoutingTree.tsx`

Has its own filter strip (`BomRoutingTree.tsx:223-281`): kind (all/make/buy), free-text search across part/op/work-centre, density toggle (tree/table). Solid baseline.

**Add**: operation status (done/in-progress/pending), work-centre, subcontract-only, depth (top-level / leaves only), missing-data (no routing, no cost). **Add "BOM depth"** as a filter — for deep assemblies planners want to scope to one level.

**Views**: tree + table already; add **routing-Gantt-per-part** mini view to see step durations.

---

### BomGenerator — `BomGenerator.tsx`

AI-generated lines. Add filter by confidence band (≥90 / 70–89 / <70) and review status (accepted/edited/unresolved/needs_catalog_match) — already exist as states but not exposed as filter pills.

---

## 2. Cross-cutting findings

| Theme | Issue | Fix |
|---|---|---|
| Stub filter button | `ToolbarFilterButton` mounted on Jobs, Schedule, Purchase, QC — opens nothing | Wire each to a module-specific panel from the recommended filters above |
| Missing date bar | Schedule, MRP, Purchase, Activities all rely on a single hard-coded base date | Introduce a `PlanDateRangeBar` primitive shared across these pages, with quick zooms and a "horizon" preset |
| Inconsistent search | Products uses a bespoke `<Input>`; Jobs uses `ToolbarSearch` but doesn't apply the query; QC uses `ToolbarSearch` properly | Standardise on `ToolbarSearch` + actually filter |
| No saved views | Nowhere in Plan can a user name and reuse a filter combo | Add module-level saved-view dropdown next to the date bar |
| Customer / planner / work-centre filters | Recur on almost every screen | Promote to shared `PlanFacetSelect` controls fed by reference data |

---

## 3. Smart / AI filter ideas

1. **"Jobs likely to miss promise"** — combines current loading on each work-centre, route duration, material readiness, and supplier lead-time. Surface on Jobs, Schedule, and the Engine.
2. **"Products with recurring nesting waste > 10%"** — scans historical nests, flags products whose part geometry consistently wastes material; suggests redesign or grouping with siblings.
3. **"BOMs missing items vs latest revision"** — diffs each product's BOM against the most recent revision in Engineering; lists gaps by job using that product.
4. **"Material at risk of short-supply"** — combines on-hand + on-order + open demand across the MRP horizon; ranks by days-of-cover.
5. **"Re-sequence candidates"** — jobs whose due date and current schedule slot disagree by > N days; pre-fills the Schedule Engine scope.
6. **"Operations without a qualified operator on roster this week"** — joins routing × work-centre × shift calendar; flags scheduling blind spots.

---

## 4. Preset starter pack (ship-ready)

| Screen | Personal | Shared |
|---|---|---|
| Jobs | *Mine, this week*, *My hot-list* | *Planning team weekly board*, *At-risk material readiness* |
| Schedule | *My work-centre, this week* | *Monday production huddle*, *Bottleneck focus* |
| MRP | *Shortages I own* | *Buyer review — long-lead*, *Forecast vs firm* |
| Purchase | *Place today* | *Buyer's morning list*, *Single-source risk* |
| Nesting | *My machine, today* | *Low-yield review*, *Off-cut reuse* |
| QC | *My open NCRs* | *Mandatory inspections below SLA* |
