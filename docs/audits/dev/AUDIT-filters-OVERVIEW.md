# Filters, Search & Views — Cross-Module Audit Overview

**Date:** 2026-05-11
**Scope:** 8 modules — Sell, Buy, Make, Plan, Ship, Book, Control, Shop-Floor
**Method:** one parallel research worker per module; each produced a peer audit at `AUDIT-filters-{module}.md` in this folder.
**Companion design doc:** `docs/plans/FILTERS-REDESIGN.md`

---

## TL;DR

1. **One file is the root cause.** `apps/web/src/components/shared/layout/ToolbarFilterButton.tsx:18` hard-codes the status list as `["All", "Active", "Draft", "Completed"]`, keeps all state internal, and its `handleApply` is `toast.success("Filters applied")` — it never filters. Every list screen across all 8 modules drops in this same component, which is why the CRM customer list shows "Draft / Completed" and a procurement RFQ shows the same.
2. **The fix isn't a status-list swap.** It's a schema-driven `ModuleFilterBar` that each list view configures with its own facets, view modes, and persistent date strategy. Detailed in `docs/plans/FILTERS-REDESIGN.md`.
3. **View modes are systematically under-served.** Opportunities is kanban-only with no list/card. POs have no kanban. Make.Schedule has no persistent date control. Plan.MRP has no weekly-bucket grid. Ship has no map. Book has no aging-bucket pivot. Control has no org chart / floorplan / BOM tree / maintenance calendar.
4. **Date fields belong in the bar, not buried in a popover.** ~18 screens are date-critical and currently hide their date range. Listed in §9 of the design doc.
5. **Saved views (personal + Lead-shared) are missing entirely.** This is the single biggest UX upgrade — most "filters" users want are actually "presets" they want to re-load weekly.
6. **Schema gaps in Ship** block 80% of recommended filters: `due` and `eta` are free-text strings (`ShipOrders.tsx:37`, `ShipTracking.tsx:30`); orders carry no destination region, driver, vehicle, route id, hazmat or COD flag.
7. **Operator surfaces (shop-floor) are over-decorated, not under-decorated.** Desktop text-search + dropdown filters sit on tablet views (`OverviewTab.tsx:294`, `WorkTab.tsx:121`, `QualityTab.tsx:474`) where gloved hands need scan-first inputs and 1–3 chip filters.

---

## Module-by-module findings

| Module      | Top finding (one sentence)                                                                                                                                  | Audit file |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| Sell        | `ToolbarFilterButton` leaks bad statuses to every Sell screen; Opportunities is kanban-only with no list/card/calendar; date-critical fields are in popovers. | [AUDIT-filters-sell.md](./AUDIT-filters-sell.md) |
| Buy         | Every Buy screen reuses the same broken button; Suppliers/RFQs/Bills filter buttons are purely decorative; no kanban for POs, RFQs, or requisitions.        | [AUDIT-filters-buy.md](./AUDIT-filters-buy.md) |
| Make        | Status options never match the real enums (`draft\|confirmed\|in_progress\|done` etc); WOs need kanban + machine swimlanes; Schedule lacks persistent date.   | [AUDIT-filters-make.md](./AUDIT-filters-make.md) |
| Plan        | Filter buttons are stubs (search box on Jobs doesn't even apply to the rendered set); Schedule hard-codes `MONTH_BASE`; MRP has no weekly-bucket grid.       | [AUDIT-filters-plan.md](./AUDIT-filters-plan.md) |
| Ship        | Toolbar is generic-shaped while data is shipping-shaped; map + calendar entirely absent; schema gaps (`due`/`eta` strings) block recommended filters.        | [AUDIT-filters-ship.md](./AUDIT-filters-ship.md) |
| Book        | No fiscal-period selector on any screen despite finance being period-driven; Cost Variance / WIP / Job Profitability have no filter at all.                  | [AUDIT-filters-book.md](./AUDIT-filters-book.md) |
| Control     | Wildly inconsistent — Machines has rich filters, Documents/Tooling/Maintenance have none; BOMs has a click-shaped status bar that doesn't filter.            | [AUDIT-filters-control.md](./AUDIT-filters-control.md) |
| Shop-Floor  | Office-embedded tabs drag desktop filter chrome onto tablets; IsometricFloorView fires a toast where it should be a station picker.                          | [AUDIT-filters-shop-floor.md](./AUDIT-filters-shop-floor.md) |

---

## Recurring patterns

These showed up in 6+ audits and are addressed centrally in the design doc:

- **Status pills overweighted, every other facet missing.** Owner, due-window, value bands, priority, region, tags — all live in the data, none in the bar.
- **Search inputs that aren't wired.** Tracking's input (`ShipTracking.tsx:171`), Plan.Jobs search (`PlanJobs.tsx:199`), and others render but don't filter.
- **Status summary bars that *look* clickable but aren't.** BOMs, Inventory, People's `ToolbarSummaryBar` segments — a cheap, high-visibility win to make them filter-on-click.
- **Date pickers buried in popovers on date-critical screens.** Activities, Schedule, MRP, Invoices, Maintenance, Dispatch — all need the persistent chip pattern.
- **No saved views.** No personal "My open POs", no shared "Day-shift CNC board".
- **No real view-mode framework.** Where multiple modes exist (Schedule's gantt/calendar/list), they're bespoke per screen instead of a shared toggle.

---

## Recommendation priority

Ranked by impact × effort:

| # | Recommendation                                                                              | Effort | Impact | Where |
|---|---------------------------------------------------------------------------------------------|--------|--------|-------|
| 1 | Replace `ToolbarFilterButton` with schema-driven `ModuleFilterBar` (foundation PR)          | M      | XL     | shared |
| 2 | Migrate Sell module first (Opportunities, then CRM) as the pilot                            | M      | L      | sell   |
| 3 | Add saved-views model — personal + Lead-shared, with URL state                              | M      | XL     | shared |
| 4 | Make every existing `ToolbarSummaryBar` segment clickable as a filter (cheap win)           | S      | M      | shared, BOMs/Inventory/People |
| 5 | Persistent date-chip on the ~18 date-critical screens                                       | M      | L      | shared + per-screen |
| 6 | View-mode additions: Opportunities list/card, POs kanban, WOs kanban + swimlanes            | L      | L      | sell, buy, make |
| 7 | MRP weekly-bucket grid + Plan.Schedule date control                                         | L      | L      | plan |
| 8 | Schema fix in Ship (`due`/`eta` as timestamps, destination/driver/vehicle/route fields)     | M      | L      | ship — blocks everything else |
| 9 | Book fiscal-period selector + aging-bucket pivot                                            | M      | L      | book |
| 10 | Operator collapse: shop-floor tablet rendering of the bar, scan-first inputs                | M      | M      | shop-floor |
| 11 | View-mode additions: Control org-chart / floorplan / BOM tree / Maintenance calendar       | L      | M      | control |
| 12 | Smart-filter v1 (NL input + 2–3 suggested chips per module, behind flag)                   | L      | M      | shared, post-foundation |

Effort: S=days · M=1–2 weeks · L=2–4 weeks. Impact: M=helpful · L=substantial · XL=transformational.

---

## What's covered in the design doc vs the per-module audits

- **Design doc (`docs/plans/FILTERS-REDESIGN.md`)** — the shared system: filter bar anatomy, schema model, view-mode framework, preset architecture (personal + Lead-shared), smart-filter integration points, operator-mode collapse, rollout phases, open questions.
- **Per-module audits** — current-state inventory (file:line), irrelevant filters to remove, recommended facets specific to each screen's data, recommended view modes, persistent-date flags, 3–5 concrete preset examples per screen, 3–6 module-specific smart-filter ideas.

The design doc is the *how*. The audits are the *what*.

---

## Open questions for review

Echoed from the design doc's §12 — these need product input before foundation work starts:

1. **Storage for saved views** — server table vs JSONB on user/group? Needs RLS story consistent with `reference_arch00_spec.md`.
2. **Smart filter model** — re-use existing AI surfaces (quote heuristics, ControlOperations) or stand up a dedicated suggestion endpoint?
3. **Migration tax** — many screens currently mount the broken button with no handler. Cleanup pass before foundation, or gate them as we migrate?
4. **Group identity for shared presets** — is the sharing scope `ControlGroups`, or something narrower?
