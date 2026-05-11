# Make module — filter / search / view UX audit

- **Audit date:** 2026-05-11
- **Scope:** `apps/web/src/components/make/` and the shared toolbar/kanban/schedule primitives it composes.
- **Lens:** Are filters, search, view modes and presets fit for production users (planners, supervisors, operators, QC, maintenance)?
- **Headline:** every list/grid screen in Make wires up the same **generic** `ToolbarFilterButton` — its options are hardcoded `["All", "Active", "Draft", "Completed"]` plus a search box and a date range. None of those match production data. Search is also limited to free-text on 2–3 string fields. View-mode coverage is uneven: Schedule has gantt/calendar/list, Products has card/list, Shop-floor has kanban — but Work Orders, Quality, CAPA, Scrap and Traceability are stuck in a single view.

---

## 1. The generic filter button — the root cause

`apps/web/src/components/shared/layout/ToolbarFilterButton.tsx:18`

```ts
const STATUS_OPTIONS = ["All", "Active", "Draft", "Completed"] as const;
```

This same hard-coded component is dropped into **every** Make list screen (MakeManufacturingOrders.tsx:93, MakeWorkOrders.tsx:61, MakeProducts.tsx:242, MakeSchedule.tsx:283). It does not accept status options as props, it does not know what entity it filters, and `Apply` only toasts `"Filters applied"` — nothing is actually wired to the list. **Recommendation:** convert it into a polymorphic `FilterPopover` that accepts per-screen `facets`, `presets`, and a selected-filter chip row à la Odoo (https://www.odoo.com/documentation/19.0/applications/essentials/search.html).

---

## 2. Per-screen findings

### MakeManufacturingOrders — `apps/web/src/components/make/MakeManufacturingOrders.tsx`

| Aspect | Today | Issue / opportunity |
|---|---|---|
| Search | `moNumber`, `product`, `customer` only (line 56–61) | Missing `jobNumber`, `operator`, free-text notes |
| Filter | Generic Active/Draft/Completed (line 93) | Statuses in data are `draft \| confirmed \| in_progress \| done` — UI options don't even match enum |
| Views | List only (`MwDataTable`) | No kanban-by-status, no calendar-by-due, no swimlanes by customer/job |

**Recommended filters** (chips + popover): Status (draft/confirmed/in_progress/done), Priority (low/medium/high/urgent), Due-date band (overdue, due-today, this-week, next-week, beyond), Customer, Job, Product family, Owner/Operator, Progress band (0%, 1–50%, 51–99%, 100%), Has work-orders released (boolean), Material-shortage flag, Quality-hold flag.
**Recommended view modes:** add **kanban by status** (already exists for shop floor — reuse), **calendar by due-date**, **gantt** (re-use `MakeSchedule` gantt), **board by customer** for service-shop sites.
**Presets (3–5):** `My MOs this week`, `Overdue & in-progress`, `Released — not started`, `Due this week`, `Held for QA`.

### MakeManufacturingOrderDetail

Detail screen — primary need is the embedded **work-order list / route step table**. Same filter problem: no per-step filter by machine, operator, status, or "ready to start" (predecessors complete).

### MakeWorkOrders — `apps/web/src/components/make/MakeWorkOrders.tsx`

| Aspect | Today | Issue |
|---|---|---|
| Search | `woNumber`, `operation`, `machineName` (line 26–31) | OK — missing `operatorName`, `manufacturingOrderId`, `jobNumber` |
| Filter | Generic | Status enum here is `pending \| in_progress \| completed` |
| Views | List only | **Kanban by status** and **swimlanes by machine** are the obvious wins |

**Recommended filters:** WO status (released/in-progress/on-hold/done), Machine/work-centre, Operator, Shift, Parent MO, Job, Priority, Sequence step #, Estimated-vs-actual variance threshold (>20%), Due/promise date, At-risk flag, On-hold reason, Setup-vs-run, Has scrap, Has quality hold.
**Views:** kanban (released → in-progress → hold → done), **machine swimlanes** (essential for dispatching), gantt by route step, day calendar for shift planning.
**Persistent date field:** yes — shift/day picker should be always-visible at top.
**Presets:** `My queue today`, `CNC cell — open WOs`, `On hold > 4 h`, `Variance > 20%`, `Awaiting material`.

### MakeProducts — `apps/web/src/components/make/MakeProducts.tsx`

| Aspect | Today | Issue |
|---|---|---|
| Search | `sku`, `name`, `category` (line 168–173) | Missing supplier/material, BOM revision |
| Filter | Generic Active/Draft/Completed | Doesn't reflect real states: `bomStatus` is `complete \| draft \| missing` |
| Views | `card \| list` toggle (line 165, 243–250) | Good — but missing a **family / category tree** view |

**Recommended filters:** BOM status (complete/draft/missing), Product family / category, Default work centre, Has approved drawing, Lead-time band, Unit-cost band, Recently used (last MO < 30 d), Discontinued.
**Views:** add **grouped-by-family** card view (Odoo grouping pattern).
**Presets:** `Missing BOMs`, `Made this month`, `High runners (top 20% volume)`, `My responsibility`.

### MakeSchedule — `apps/web/src/components/make/MakeSchedule.tsx`

The strongest screen. Has gantt / calendar / list toggle (line 285–293).

| Aspect | Today | Issue |
|---|---|---|
| Search | None | Should support free-text on MO/job/customer |
| Filter | Generic only (line 283) | No machine/work-centre filter, no shift, no resource |
| Persistent dates | Gantt has implicit range; calendar has a month switcher (line 265). No explicit *visible* range control. | Add a persistent date-range pill (this-week / next-2-weeks / month / custom). |
| Status enum mismatch | Uses `in_progress \| scheduled \| overdue \| completed` (line 270) — generic filter doesn't match |

**Recommended filters:** Work centre / machine, Shift, Owner planner, MO status, Priority, Customer, Late-risk (forecast finish > due), Material-ready (boolean), Capacity-conflict band.
**Views (missing):** **machine/work-centre swimlanes** within the gantt (resource view), **load chart** (capacity per work-centre).
**Persistent date fields:** **YES** — flag this screen first. The date range should always be a visible control (not hidden behind a popover).
**Presets:** `Day-shift production board`, `This week — at-risk WOs`, `CNC cell schedule`, `Welding bay — next 10 days`, `My planner queue`.

### MakeShopFloor / ShopFloorPage — `apps/web/src/components/make/shop-floor/ShopFloorPage.tsx`

Machine grid + released-traveller queue. **No filter / no search at all** (line 25–31 just slices by traveller status).

**Recommended filters:** Work centre, Machine status (running/idle/down/maintenance), Operator on-station, Shift, Travellers held, Travellers overdue.
**Search:** by job/MO/traveller number — there's a separate `MakeScanStation` (line 135), but the floor page itself should let supervisors locate work fast.
**View modes:** today single grid only. Add **status-grouped tiles** (running / idle / down) and a **list fall-back** for low-bandwidth devices.
**Presets:** `My cell now`, `Machines down`, `Travellers on hold`, `Idle > 15 min`.

### MakeShopFloorKanban — `apps/web/src/components/make/MakeShopFloorKanban.tsx`

3-column kanban: Overdue / In Progress / Not Started (line 63–67). No toolbar, no filter, no search.

**Recommended filters:** Work centre, Operator, Priority, Customer, Due-date band, Material shortage flag.
**View additions:** swimlanes-by-machine on the same kanban (rows × columns).
**Presets:** `My work centre today`, `Urgent only`, `Late shift`, `Customer X`.

### MakeSchedule — see above.

### MakeQuality → `apps/web/src/components/shop-floor/QualityTab.tsx`

Tabbed page (Overview / Active Issues / Inspections / Reports) (line 44, 285–306). On Active Issues there's an inline filter row (line 472–482) with two **non-functional** "Status" / "Priority" buttons. On Inspections there's a pill row of types (line 559).

| Aspect | Today | Issue |
|---|---|---|
| Search | Plain input, no filtering wired (line 474–475) | |
| Filter | Two ghost buttons; pills hard-coded to inspection types | |
| Views | Tabs only | No kanban for issues, no calendar for inspections, no chart-first analytics view |

**Recommended filters (Issues):** NCR status (open/under-investigation/contained/CAPA-open/closed), Severity, Defect type, Machine, Operator, Part / part family, Inspector, Date raised, AI-flagged.
**Recommended filters (Inspections):** Type (FAI/in-process/final/receiving), Result (pass/fail/conditional), Inspector, Machine, Date, Part family.
**Persistent date field:** **YES** — quality is inherently date-driven.
**Views:** add **kanban by NCR stage**, **calendar by scheduled inspection**, **pareto chart by defect type**.
**Presets:** `My open NCRs`, `Failed FAIs this week`, `Repeat defects (same part 30 d)`, `Awaiting disposition`, `AI-flagged unresolved`.

### MakeCapa — `apps/web/src/components/make/MakeCapa.tsx`

6-column kanban (Identified → Closed) (line 36–41). **No filter, no search, no view toggle.**

**Recommended filters:** Owner, Severity, Source NCR, Due date, Days-in-stage, Linked machine/part, Overdue flag.
**Views:** add **list view** for export, **calendar by due-date**, **table** showing stage age.
**Presets:** `My open CAPAs`, `Overdue actions`, `Stuck in containment > 14 d`, `Closing this week`.

### MakeScrapAnalysis

No filter/search/view toggle. As a chart-first analytics screen it desperately needs **slice controls**: time range, machine, operator, part family, defect reason, shift. Add tabs for **trend / pareto / by-machine / by-operator** views.

### BatchTraceability — `apps/web/src/components/make/BatchTraceability.tsx`

Tree view of lots, no search or filter (line 2). Add: search by lot/serial/job, filter by status (released, quarantined, recalled), date range, customer, supplier. View: today's tree only — add a **table view** for export and a **timeline** for forensic walk-through.

### LiveFloorView — `apps/web/src/components/make/LiveFloorView.tsx`

TV wall display. Has 2-mode toggle (Andon / 3D) (line 421–448). Filtering is intentionally minimal but should support a **cell / area selector** (e.g. "Cell B only") so each TV shows its own zone — currently the whole shop is hard-coded.

### WorkOrderSequencing, MaterialConsumption, MakeJobTraveler, MakeScanStation

Detail / single-entity views — filtering is less critical, but `MaterialConsumption` would benefit from a filter on **status** (shortage / over-consumed / on-target) and grouping by parent assembly.

---

## 3. Cross-cutting recommendations

1. **Replace `ToolbarFilterButton`** with a config-driven popover: facets, multi-select chips with counts, saved presets, an "Add custom filter" hatch, and persisted selections per user per screen (Odoo-style favorites).
2. **Always-visible filter chips** under the toolbar (selected filters as removable pills) — Odoo's biggest UX win is making active filters legible.
3. **Persistent date range** on Schedule, Work Orders, Quality, Scrap, Traceability — never hidden behind a popover.
4. **View toggle parity** — every list screen should offer at minimum *list* + one *visual* view (kanban, calendar, or gantt). Reuse `KanbanBoard` (shared/kanban) and `GanttChart` / `ScheduleCalendar` (shared/schedule, shared/datetime).
5. **Shared "Group by" control** — Odoo's group-by is far more useful than pure filtering for production work (group WOs by machine, MOs by customer, NCRs by defect type).

---

## 4. Smart / AI filter ideas

1. **"Work orders likely to miss promise date"** — combines current progress, historical cycle-time variance per machine/operator, queue ahead, material-ready signal.
2. **"Operators with rising scrap on this part family"** — 30-day trend vs baseline, surfaced as a Quality / Scrap preset.
3. **"Machines trending toward breakdown"** — utilisation + micro-stop frequency + days since PM + maintenance log signals.
4. **"Bottleneck of the day"** — auto-detect work-centre with longest queue ahead vs takt.
5. **"Stale CAPAs"** — CAPAs with no activity > N days vs typical stage duration for that severity.
6. **"Travellers blocked by material"** — cross-reference WO status `pending` with Buy module shortage list; surface a one-click "show me only what's actually runnable now".

---

## 5. Where to start (priority order)

1. Replace `ToolbarFilterButton` with a polymorphic version + chip strip (`apps/web/src/components/shared/layout/ToolbarFilterButton.tsx:18`).
2. Wire real status enums into MakeManufacturingOrders / MakeWorkOrders filters.
3. Add **kanban by status** to MakeWorkOrders, and **machine swimlanes** view.
4. Promote MakeSchedule date-range to a persistent toolbar control.
5. Build the "runnable now" / "at-risk" presets — they are the single highest-value production query.
