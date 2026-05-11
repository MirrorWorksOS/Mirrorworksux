# Filter, Search & View Redesign — Cross-Module Plan

**Status:** Proposal · **Date:** 2026-05-11 · **Owner:** Matt
**Audit inputs:** see `docs/audits/dev/AUDIT-filters-*.md` (one per module) and `AUDIT-filters-OVERVIEW.md`

This document defines the unified filter / search / view-mode architecture that replaces the current generic toolbar across every module. Module-specific facets, presets, smart filters, and date strategies are recommended in the per-module audits — this doc covers the shared system that makes them possible.

---

## 1. Why this exists

Every module audit converged on the same root cause:

`apps/web/src/components/shared/layout/ToolbarFilterButton.tsx:18` hard-codes the status list as `["All", "Active", "Draft", "Completed"]`, has zero facet customisation, keeps all state internal, and its `handleApply` is `toast.success("Filters applied")` — it never filters anything. That same component is dropped onto Customers, Suppliers, Opportunities, POs, Work Orders, Jobs, Schedule, Invoices, Expenses, BOMs, Inventory, Maintenance, and more, which is why a CRM customer list shows "Draft / Completed" and a procurement RFQ list shows the same.

The fix is not a status-list swap. The fix is a **schema-driven filter system** with first-class view-mode switching, persistent date fields where the data demands it, and saved-view presets (personal + team-shared by Leads) — the pattern Odoo proves at scale.

## 2. Design principles

1. **Filters describe the data, not the chrome.** Each list view declares a `FilterSchema` describing its facets; the bar renders from that schema. No more shared button with one hard-coded vocabulary.
2. **Status is just one facet.** It must not be privileged over Owner, Due-date, Priority, Region, etc.
3. **Date is structural, not optional.** On date-driven screens (Activities, Schedule, MRP, Invoices, Maintenance, Dispatch) the date range is a persistent chip in the bar — never buried in a popover.
4. **View mode is part of the workspace, not a one-off toggle.** Each module declares the set of view modes valid for that data (`list | card | kanban | calendar | gantt | tree | map | board`) and the user picks. Saved presets remember the choice.
5. **Saved views travel with the user and the team.** Personal presets are private; Lead-shared presets are scoped to a role/group. No re-inventing "My open opportunities this week" in five places.
6. **Operator surfaces collapse, they don't disappear.** Floor / shop-floor screens render the same schema with 1–3 chip-sized facets, scan-first inputs, and shift/station defaulting — not a smaller version of the desktop popover.
7. **Smart filters are first-class, not a sidecar.** Natural-language filter input ("show me POs likely to be late") and AI-suggested chips ("3 customers you haven't touched in 30 days") sit alongside the facet chips.

## 3. The Filter Bar — anatomy

Layout, left to right, on every list screen:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [Search ▾]  [Preset ▾]  [📅 Date range]  [Status]  [Owner]  [+ Filter]  …  │
│                                                            [⊞ List ⊟ Card] │
│                                                            [⌗ Kanban ▦ Cal]│
└────────────────────────────────────────────────────────────────────────────┘
  ↑ active chips below, dismissible:  [● Status: Open ×]  [● Owner: Me ×]
```

**Persistent zone (always visible):**
- Search input (full text + scan input on operator views)
- Preset selector (dropdown; combobox of personal + team-shared + system defaults)
- Date range chip — **only on date-critical screens** (declared by schema)
- Top 2–3 most-used facets for that screen, pinned

**Overflow zone:**
- `+ Add Filter` — picker over the rest of the schema (Odoo pattern). Adds a chip.

**View-mode switcher (right side):**
- Renders the icons declared by the screen's `viewModes` array.
- Current view is yellow-filled (matches existing CRM grid/list toggle).

**Active-filter row (below bar):**
- Each applied filter is a dismissible chip.
- A `Save as preset…` action appears after the user diverges from a loaded preset.

**Group By** is a separate control (also Odoo-style). On board/kanban views it picks the column dimension; on list views it groups rows.

## 4. Schema model

```ts
// apps/web/src/components/shared/filters/schema.ts
export type FacetKind =
  | "select"       // single value
  | "multi"        // multi value
  | "boolean"      // toggle
  | "range"        // numeric / currency / date
  | "search"       // freeform text
  | "user"         // owner / assignee picker
  | "tag"          // free-form tag selector
  | "smart";       // model-backed (see §8)

export interface FacetSchema {
  id: string;                // e.g. "status", "owner", "dueDate"
  label: string;
  kind: FacetKind;
  options?: { value: string; label: string; color?: string }[]; // for select/multi
  default?: unknown;
  pinned?: boolean;          // always visible in bar
  persistent?: boolean;      // never hidden, never cleared by "Clear all"
}

export interface ViewModeSchema {
  id: "list" | "card" | "kanban" | "calendar" | "gantt" | "tree" | "map" | "board";
  groupBy?: string;          // facet id that controls columns/swimlanes
  label?: string;
}

export interface FilterSchema {
  module: string;            // "sell.opportunities"
  facets: FacetSchema[];
  viewModes: ViewModeSchema[];
  defaultView: ViewModeSchema["id"];
  dateFacetId?: string;      // if set, that facet becomes the persistent date chip
  smart?: SmartFilterConfig; // see §8
}
```

Every list/board screen exports its `FilterSchema`. The toolbar component is a single generic that consumes it. A new module simply declares its schema — there is no shared status list to "fix" again.

## 5. The Search / Filter Bar component

```ts
<ModuleFilterBar
  schema={opportunitiesFilterSchema}
  value={state}            // controlled — parent owns query state
  onChange={setState}
  presets={presetsForUser}
  onSavePreset={…}
  onShareWithGroup={…}
/>
```

Implementation notes:
- Replaces `ToolbarFilterButton` entirely. Old component gets a deprecated re-export that mounts the new bar with a *minimal* schema (just search) so nothing visually breaks during migration.
- State lives in URL search params (e.g. `?owner=me&status=open&view=kanban&preset=lead.daily`) so views are linkable / refresh-safe.
- Bar height matches existing 48 px Yellow-tile design (`ToolbarFilterButton.tsx:67` baseline).
- Dark-mode safe (project convention — never modify light mode styles).

## 6. View modes — per-data-shape defaults

| Data shape                | Default modes                                  |
|---------------------------|------------------------------------------------|
| Pipeline / workflow       | `kanban` (default), `list`, `card`             |
| Time-bound work           | `calendar` (default), `list`, `gantt`          |
| Hierarchical (BOM, locations) | `tree` (default), `list`                   |
| Spatial (machines, floor) | `map`/`floorplan` (default), `list`            |
| Records (customers, products) | `card` (default), `list`                   |
| Financial periods         | `pivot` / aging buckets (default), `list`      |

Examples carried over from the audits:
- **Sell.Opportunities** — currently kanban-only; add `list` + `card` + `calendar` (by expected close). (`SellOpportunities.tsx`)
- **Buy.PurchaseOrders** — add `kanban` by status, `calendar` by promised date.
- **Make.WorkOrders** — add `kanban` by status, `swimlanes` by machine.
- **Plan.MRP** — add `weekly-bucket grid` (the canonical MRP view) alongside the cascade tree.
- **Ship.Orders** — add `map` (destinations), `calendar` (dispatch date).
- **Book.Invoices** — add `aging-bucket pivot` (0-30 / 31-60 / 61-90 / 90+).
- **Control.People** — add `org chart`; **Locations** — `floorplan`; **Maintenance** — `calendar`.

## 7. Presets — personal and shared

### Personal presets (every user)
- Saved by any user, scoped to their account.
- Include facet values, view mode, group-by, sort.
- One can be marked "Default for this screen".

### Team-shared presets (Lead-created)
- Three-role model in this app is **admin / lead / team** (per project convention — never use Manager/Supervisor/Operator vocab).
- Leads can create presets and share them with their group/team. Shared presets appear in every group member's preset list under a `Team` section.
- Lead can mark a shared preset as the team default — new team members land on that preset on first open.
- Admins can pin org-wide presets ("System" section).

### Storage model

```ts
interface SavedView {
  id: string;
  module: string;            // matches FilterSchema.module
  name: string;
  scope: "personal" | "group" | "org";
  ownerId: string;
  groupId?: string;          // when scope=group
  filters: Record<string, unknown>;
  viewMode: ViewModeSchema["id"];
  groupBy?: string;
  sort?: { field: string; dir: "asc" | "desc" };
  isDefault?: boolean;
  pinned?: boolean;          // shown as a chip-strip above the bar
  emoji?: string;
}
```

### Preset chip strip (optional, opt-in)
For high-traffic boards (Opportunities, WOs, POs, Activities), a row of pinned preset chips sits above the bar — one tap to switch. This is the Odoo "Favorites" pattern but tablet-friendly. Per audits, examples worth pinning:

- Sell.Opportunities: `My Pipeline · Closing This Week · At-Risk · Won YTD`
- Buy.POs: `My Approvals · Overdue · Awaiting Receipt · This Week`
- Make.WOs: `My Cell Today · At-Risk · On Hold · NCR Open`
- Book.AR: `Aged >60 · Disputed · This Month`

## 8. Smart / AI-assisted filters

Smart filters are a `kind: "smart"` facet plus a NL input strip. They produce a filter set the user can refine and save like any other preset.

### 8.1 Three integration points

1. **NL filter input** — a free-text box at the top of the `+ Add Filter` panel. Typing "POs likely to be late" returns a candidate filter chip-set: e.g. `{supplier.otd_lt: 70%, due_within: 14d, status: in [confirmed, partial]}`. User accepts → chips applied. User saves → becomes a preset (the model-backed criteria are stored, not the prompt, so the preset is auditable).
2. **Suggested chips** — when the bar is idle on a screen, surface 1–3 model-suggested chips: "5 customers you haven't touched in 30 days · 3 WOs trending late · 2 BOMs with cost drift". Tapping applies the underlying filter.
3. **Smart sort / rank** — for some screens (Opportunities, WOs) a `Sort: Smart` option ranks rows by an outcome model (probability × value × recency) rather than a single field.

### 8.2 Module-specific smart filter ideas (consolidated from audits)

Each audit lists 3–6 ideas; the highest-value ones across the suite:

- **Sell** — "quotes likely to close this month", "customers I haven't touched in 30 days", "opportunities with deteriorating engagement signals".
- **Buy** — "POs likely to ship late given supplier history", "items where MRP says reorder but no PO exists", "suppliers with worsening OTD trend".
- **Make** — "WOs likely to miss promise based on current loading", "machines trending toward unplanned downtime", "operators with rising scrap on this part family".
- **Plan** — "jobs with material readiness gap before promise date", "products with recurring nesting waste >10%", "BOMs missing items vs latest revision".
- **Ship** — "orders unlikely to ship on time at current picking pace", "destinations with rising delivery exceptions", "underfilled loads — opportunity to consolidate".
- **Book** — "jobs likely to overrun budget at current burn", "invoices likely paid late given customer history", "expenses anomalous vs prior period".
- **Control** — "machines trending toward breakdown", "people with expiring certifications", "BOMs with cost drift vs spec".
- **Shop-Floor** — "what's my next best job right now given my station / skills / queue" (operator-side hero, not chip).

### 8.3 Safety / explainability rules
- Every smart chip is **inspectable** — clicking it shows the underlying facet expression. Users see what's being filtered, not magic.
- Smart suggestions are model-versioned and tagged so a saved preset can refresh against new data, but the criteria stay deterministic.
- No smart filter ever silently changes a user's saved preset; refresh prompts confirm before re-applying.

## 9. Persistent-date strategy

Per audit, these screens need date range visible in the bar always (not in popover):

| Module / screen           | Date facet                       |
|---------------------------|----------------------------------|
| Sell.Activities           | Due / scheduled date             |
| Sell.Quotes               | Valid-until                      |
| Sell.Invoices             | Due / overdue bucket             |
| Sell.Opportunities        | Expected close                   |
| Buy.POs                   | Required-by / promised           |
| Buy.RFQs                  | Response deadline                |
| Buy.Bills                 | Due date / aging                 |
| Make.Schedule             | Schedule horizon (Day/Week/4w/Qtr) |
| Make.WOs                  | Promised ship                    |
| Plan.Schedule             | Horizon (currently hard-coded `MONTH_BASE` — must become a control) |
| Plan.MRP                  | Horizon                          |
| Plan.Activities           | Due date                         |
| Ship.Orders               | Dispatch date                    |
| Ship.Tracking             | ETA                              |
| Book — every screen       | Fiscal period selector (month / quarter / YTD) |
| Control.Maintenance       | Due window                       |
| Control.Audit             | Event window                     |
| Control.Documents         | Expiry window                    |

The bar pattern for these is a single chip with quick-zooms `Today · Week · Month · Quarter · Custom` (Odoo's pattern), and a "comparison" toggle for finance screens (this month vs last).

## 10. Operator-mode collapse (Floor + Shop-floor)

Same schema, different rendering, per the shop-floor audit:

- Bar collapses to **1–3 chip facets** declared `pinned: true` and `persistent: true` (typically `My Station`, `Shift`, `Ready vs Blocked`).
- Search → `ScanInput` (pattern already in `floor/FloorScanJob.tsx:129`).
- No `+ Add Filter` overflow on floor screens.
- AI surface is a **hero card** ("Your next best job: WO-1234") not a chip strip.
- Lead-shared presets become *shift defaults* — when "Day-shift CNC cell" is set as the group default, every operator on that group lands on it.

Also from the shop-floor audit: wire `IsometricFloorView` as a navigable station picker (currently only fires a toast at `IsometricFloorView.tsx:280`), and replace text search across the office-embedded shop-floor tabs (`OverviewTab.tsx:294`, `WorkTab.tsx:121`, `QualityTab.tsx:474`) with scan-first inputs.

## 11. Rollout sequencing

The audits show ~40 list/board screens touching the broken component. Rolling out screen-by-screen risks regressions; rolling all at once is too big.

**Phased plan:**

1. **Foundation (1 PR)** — ship `ModuleFilterBar`, `FilterSchema`, URL-state hook, and the `SavedView` storage stubs (in-memory or local first). Old `ToolbarFilterButton` keeps working in parallel.
2. **Sell module pilot (1 PR per screen, ~6 PRs)** — migrate Opportunities first (highest visible pain — kanban-only), then CRM (the screenshot example), then Quotes / Orders / Invoices / Activities. Validate preset + view-mode UX with real data.
3. **Buy + Book in parallel (2 streams)** — finance period selector is its own sub-deliverable, worth carving out.
4. **Make + Plan** — these unlock the biggest view-mode wins (gantt, MRP weekly grid, machine swimlanes). Need schema work on `due` and similar date fields where they're currently strings (per Ship audit, same applies in places here).
5. **Ship** — depends on schema fix: typing `due`/`eta` as timestamps and adding destination region / driver / vehicle / route id fields to the order/shipment models (per `ShipOrders.tsx:37`, `ShipTracking.tsx:30`). Filter work then unlocks 80% of recommended views.
6. **Control + Shop-floor** — Control wins are mostly view-mode (org chart, floorplan, tree, maintenance calendar) plus making `ToolbarSummaryBar` segments clickable. Shop-floor is the operator-collapse rendering plus IsometricFloorView navigation.
7. **Smart filter v1** — ship after foundation, behind a flag, with 2–3 modules' suggested-chip implementations to validate cost/latency before broad rollout.

## 12. Open questions

- **Storage for `SavedView`** — server-backed table vs Postgres JSONB on user/group? Group-scoped presets need an RLS story consistent with the access model in `reference_arch00_spec.md`.
- **Smart filter model wiring** — re-use the existing AI service surface (`ControlOperations` / quote heuristics) or stand up a dedicated filter-suggestion endpoint?
- **Migration tax on stub filter buttons** — many screens (Buy.Suppliers, Buy.RFQs, Buy.Bills, Plan.Jobs, etc.) currently mount the button with no real handler. We can either ship them gated until migrated, or remove the orphan button per screen in a cleanup pass before the foundation PR.
- **Group/team identity** — confirm whether group ≡ Control.Groups (matches `ControlGroups.tsx`) or something narrower for preset-sharing scope.

## 13. References

- Per-module audits — `docs/audits/dev/AUDIT-filters-{sell,buy,make,plan,ship,book,control,shop-floor}.md`
- Top-level summary — `docs/audits/dev/AUDIT-filters-OVERVIEW.md`
- Odoo search docs — https://www.odoo.com/documentation/19.0/applications/essentials/search.html
- Access vocab constraint — `MEMORY.md` → "Access role vocabulary" (admin / lead / team only)
- Dark-mode constraint — `MEMORY.md` → "Preserve light mode"
