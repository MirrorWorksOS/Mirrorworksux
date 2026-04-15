# Spec vs Codebase Analysis — Module Outline Compliance Audit

**Date:** 1 April 2026
**Scope:** All modules (Sell, Plan, Make, Book, Ship, Buy, Control) — spec §4 screen-by-screen vs actual codebase
**Sources:** `*-04-Screen-by-Screen.md` specs, `PrototypeRouteMap.md`, `routes.tsx`, Sidebar.tsx, all component files
**Focus areas:** Information flow, disconnected/island features, missing pages, settings isolation

---

## 1. Information Flow Audit

### 1.1 End-to-End Flow: Sell → Plan → Make → Book

The spec describes a connected lifecycle:
```
Sell: Opportunity → Quote → Order (§4.3→§4.4→§4.5)
  ↓ "Confirmed orders with valid BoM generate Jobs in the Plan module" (§4.5)
Plan: Job → Schedule → Production (§4.2→§4.7→§4.6)
  ↓ "Handed off to Make module" (§4.2 In Production stage)
Make: MO → WO → Operator Execution (§4.3→§4.4→§4.5)
  ↓ Production complete
Book: Invoice → Payment (§4.3→§4.4)
```

| Flow step | Spec says | Code does | Status |
|-----------|-----------|-----------|--------|
| Opportunity → Quote | §4.3.3: "New Quote from Opportunity, pre-populates customer" | SellOpportunityPage has "New quote" button → navigates to `/sell/quotes/new` | **Partial** — navigates but doesn't pre-populate |
| Opportunity → Order | §4.5: "Orders created from confirmed quotes" | "Convert to Order" button added → navigates to `/sell/orders` | **Partial** — navigates but no data carried |
| Order → Job | §4.5: "Confirmed orders with valid BoM generate Jobs" | SellOrderDetail Fulfilment tab has "Create Job" button → `/plan/jobs` | **Partial** — navigates but no auto-generation |
| Job → MO | §4.2: "In Production = Handed off to Make module" | PlanJobDetail has "Create MO" button → `/make/manufacturing-orders` | **Partial** — navigates but no auto-creation |
| MO → Invoice | Book invoicing | MO detail overview includes **Create Invoice** → `/book/invoices` | **Partial** — navigates only; no payload |
| MO cross-link to Job | §4.3.2: "Job #1210, superscript link to Plan" | MO detail header has clickable job number badge → `/plan/jobs/:id` | **Done** |
| Job cross-link to Order | §4.5.1: "Sales Order linked entity" | Plan overview links to `/sell/orders/1` (mock-aligned) | **Done** |
| Job → Quote (Sell) | Quote reference on job | `PlanJobDetail` quote badge links to `/sell/quotes` | **Done** (list, not quote detail) |

**Key finding:** All cross-module connections are navigation-only (button → redirect). None carry data. The spec envisions record creation: "Orders generate Jobs", "Jobs generate MOs". The code treats each module as an island with manual re-entry.

### 1.2 Shared Entity Disconnections

| Entity | Lives in | Referenced by | Connected? |
|--------|----------|---------------|------------|
| **Customer** | Sell CRM | Plan (Job.customer), Make (MO.customer), Book (Invoice.customer) | **No** — each module has its own mock data, different customer names/IDs |
| **Product** | Sell Products (5 tabs), Control Products, Plan Products, Make Products, Buy Products | All modules | **No** — 5 separate product components with different mock data, none share a product catalogue |
| **Quote** | Sell Quotes + SellNewQuote | Plan (Job.quoteId reference) | **Partial** — quote ID on `PlanJobDetail` links to `/sell/quotes`; no deep link to a single quote record |
| **Machine** | Control Machines | Make (MO.workstation), Plan (Schedule.workCentre) | **No** — Make has hardcoded workstation strings, Control has separate machine list |
| **User/Operator** | Control People | Make (MO.operator), Sell (assignedTo) | **No** — each module uses own avatar/name data |
| **Inventory** | Control Inventory | Sell Products (inventory tab), Buy Receipts, Ship Warehouse | **No** — all mock independently |

---

## 2. Disconnected / Island Features

### 2.1 Orphaned Components (exist but not routed)

| File | Module | Status |
|------|--------|--------|
| `SellCRMList.tsx` | Sell | Optional cleanup — merge or delete if unused |
| `sell-opportunity-types.ts` | Sell | **Active** — shared types (replaces deleted drawer-only file) |
| `PlanBudgetTab.tsx` | Plan | Used by PlanJobDetail |
| `PlanIntelligenceHubTab.tsx` | Plan | Used by PlanJobDetail |
| `PlanOverviewTab.tsx` | Plan | Used by PlanJobDetail |
| `PlanProductionTab.tsx` | Plan | Used by PlanJobDetail |
| `PlanScheduleTab.tsx` | Plan | Used by PlanJobDetail |
| `PlanProduction.tsx` | Plan | Verify repo — delete if file absent |
| `MakeShopFloor.tsx` | Make | **Routed** — `/make/shop-floor` + sidebar |
| `MakeShopFloorKanban.tsx` | Make | Sub-component of MakeShopFloor |
| `MakeWork.tsx` / `MakeIssues.tsx` | Make | Removed from routes; delete files if still present |
| `InvoiceDetail.tsx` | Book | **Routed** — `/book/invoices/:id` |
| `InvoiceList.tsx` | Book | Internal to BookInvoices |
| `JobCostDetail.tsx` | Book | **Routed** — `/book/job-costs/:id` |
| `NewExpense.tsx` | Book | **Wired** — slide-over from `ExpenseKanban` |
| `WorkflowCanvas.tsx` | Control | Internal to ControlWorkflowDesigner |

### 2.2 Settings Disconnected from Modules

| Settings component | Settings panels | Module gaps |
|--------------------|----------------|-------------|
| **SellSettings** | General, Teams, Pipeline, Quoting, Payments, Activities, Analytics, Integrations | **Pipeline** panel manages stages but they're hardcoded in `SellOpportunities.tsx` — setting changes don't propagate. **Payments** shows Stripe/PayPal toggles but no actual payment processing exists. **Activities** settings exist but activity types are hardcoded in `SellActivities.tsx`. |
| **PlanSettings** | General, Products, Reports | **Only 3 panels** — spec §4 implies more configurable items (scheduling rules, budget thresholds, QC planning settings). No Intelligence Hub settings panel despite the feature existing. No NC Connect settings. |
| **MakeSettings** | General, Andon, Reports | **Andon** settings define `andon.manage` permission but there's no standalone Andon management page. Floor Mode toggle in OverviewTab isn't connected to settings. Machine status thresholds (§4.1: "Below 50% triggers yellow") are hardcoded, not configurable via settings. |
| **BookSettings** | General, Tax, Invoicing, Expenses, Integration, Reports, Numbering, Approval, Currency | **Most complete** settings. But tax rates, approval workflows, and numbering sequences are all display-only — no backend to enforce them. |
| **BuySettings** | General, Approvals, Receiving, Matching, Templates, Reorder Rules, Integrations, Price Rules | References "three-way matching" (§4.6.3) but matching tolerance % set here isn't used by `BuyReceipts.tsx` or `BuyBills.tsx` |
| **ShipSettings** | General, Warehouse Zones, Carriers, Packaging, Fulfilment, Notifications, Returns, Integrations | References carrier API keys and zone configuration but `ShipShipping.tsx` uses hardcoded carrier data |
| **Control** | **N/A — by design** | Control is inherently a settings/configuration module (factory layout, process builder, machines, inventory, people, BOMs, workflow designer, and user/group administration). A separate `/control/settings` page is redundant. No action needed. |

### 2.3 Make Module: Shop Floor Route

**Done.** `/make/shop-floor` is registered in `routes.tsx` with `MakeShopFloor` (Overview / Kanban / Work Orders, Floor Mode on overview).

---

## 3. Missing Pages (Spec vs Routes)

### 3.1 Sell Module

| Spec §4 section | Spec describes | Route exists? | Component exists? |
|-----------------|---------------|---------------|-------------------|
| §4.1.1 Overview | Dashboard overview (bento grid) | `/sell` ✅ | `SellDashboard` ✅ |
| §4.1.2 Analytics | Pipeline funnel, revenue trends, win/loss, leaderboard | `/sell` (tab) ✅ | **Done** — charts, funnel, leaderboard in `SellDashboard` |
| §4.1.3 Reports | Report builder with templates, PDF/CSV export | `/sell` (tab) ✅ | **Done** — template cards + export affordances (mock) |
| §4.2 CRM | Card/List views, customer detail | `/sell/crm`, `/sell/crm/:id` ✅ | ✅ |
| §4.3.1 Kanban | Drag-drop opportunity kanban | `/sell/opportunities` ✅ | ✅ |
| §4.3.2 Opportunity Detail | Tabbed detail with stage progress | `/sell/opportunities/:id` ✅ | ✅ |
| §4.3.3 New Quote | Pre-populated from opportunity | `/sell/quotes/new` ✅ | ✅ but no pre-population |
| §4.3.4 Activities | List + **Calendar** + New Activity popup | `/sell/activities` ✅ | **Done** — list; calendar **Month / Week / Day**; New Activity dialog |
| §4.3.5 Intelligence Hub | Win probability, recommended actions, competitor intel | Tab on opportunity ✅ | ✅ (enhanced with full content) |
| §4.4 Quotes | Line item table with inline editing | `/sell/quotes/new` ✅ | ✅ |
| §4.5 Orders | List + **detail** + "Handoff to Plan" | `/sell/orders` ✅, `/sell/orders/:id` ✅ | ✅ |
| §4.6 Invoices | List with tabs + **detail** + **New Invoice** flow | `/sell/invoices`, `/sell/invoices/:id`, `/sell/invoices/new` ✅ | **Done** — `SellInvoiceDetail`, `SellNewInvoice` |
| §4.7 Products | 5-tab detail | `/sell/products`, `/sell/products/:id` ✅ | ✅ |
| §4.8 Settings | 8 panels | `/sell/settings` ✅ | ✅ |
| — Forecasts | §4.1 implies forecasting tab | `/sell` (tab) ✅ | **Done** — forecast vs actual chart + quarterly targets in `SellDashboard` |

**Remaining gaps (Sell):**
- Quote / order / opportunity **context carry-over** on navigation (still manual re-entry)
- New Activity dialog: no checklist / attachments (core fields present)
- Kanban drag-and-drop without persisted stage sync (if any)

### 3.2 Plan Module

| Spec §4 section | Spec describes | Route exists? | Component exists? |
|-----------------|---------------|---------------|-------------------|
| §4.1 Dashboard | KPI cards, action cards, schedule chart | `/plan` ✅ | ✅ |
| §4.2 Jobs Kanban | 6 columns, drag-drop | `/plan/jobs` ✅ | ✅ but no drag-drop |
| §4.3 Jobs Card | 3-column grid | `/plan/jobs` (toggle) ✅ | ✅ |
| §4.4 Jobs List | Sortable table | `/plan/jobs` (toggle) ✅ | ✅ |
| §4.5 Job Detail Overview | 65/35 split, metadata, products, budget | `/plan/jobs/:id` ✅ | ✅ |
| §4.6 Production Tab | Extended products table + MirrorView + Instructions + 2D viewer | Tab ✅ | **Prototype done** — placeholder 3D viewport, spec instructions table, drawing panel; **not** real APS SDK |
| §4.7 Schedule Gantt | Operations on timeline with colour coding | Tab ✅ | ✅ |
| §4.8 Schedule Calendar | Month/Week/Day with job events | Tab ✅ | Month exists, **Week/Day views missing** |
| §4.9 Activities Calendar | Month/Week/Day with drag-to-create | `/plan/activities` ✅ | ✅ |
| §4.10 Intelligence Hub | Timeline, budget tracker, files, **chatter** | Tab ✅ | **Done** — Chatter block with threaded-style messages, attachments, input bar (voice = icon affordance only) |
| — NC Connect | File management, G-code viewer, machine integration | `/plan/nc-connect` ✅ | ✅ |
| — Schedule overview | Cross-job schedule | `/plan/schedule` ✅ | ✅ |

**Remaining gaps (Plan):**
- **Autodesk APS** (or live 3D) instead of placeholder viewport
- Schedule tab: **Week/Day** job calendar (if not fully covered elsewhere)
- Drag-and-drop on jobs kanban / calendars with persisted state
- Customer PO / tags on overview still mostly static vs settings-driven

### 3.3 Make Module

| Spec §4 section | Spec describes | Route exists? | Component exists? |
|-----------------|---------------|---------------|-------------------|
| §4.1 Dashboard (Andon) | 5 KPI cards, machine grid, quality, schedule strip, quick actions, OEE / throughput | `/make` ✅ | **Done** in `MakeDashboard` (per prior sprint) |
| §4.2 Shop Floor Kanban | MO cards with Start Job buttons, filter panel | `/make/shop-floor` ✅ | `MakeShopFloor` |
| §4.3 MO Detail Overview | Summary cards, MO table, Communication sidebar | `/make/manufacturing-orders/:id` ✅ | **Done** — shop floor summary cards; **Chat** toggle opens chatter + SOPs sidebar |
| §4.4 MO Detail Work | Parent MO rows, child WO rows, Andon alerts | Tab ✅ | ✅ |
| §4.5 Operator Execution | Full-screen 3-panel, PASS/FAIL/HOLD, Live Cam/CAD | WorkOrderFullScreen ✅ | ✅ (excellent) |
| — MO List | Manufacturing orders table | `/make/manufacturing-orders` ✅ | ✅ |
| — Time Clock | Time tracking | `/make/time-clock` ✅ | ✅ |
| — Quality | Quality checks | `/make/quality` ✅ | ✅ |
| — Products | Product list | `/make/products` ✅ | ✅ |

**Remaining gaps (Make):**
- **Auto-Schedule** / AI engine CTA on dashboard (if desired beyond Intelligence Hub)
- Machine cards **click-through** to current WO (still optional enhancement)

### 3.4 Book Module

| Spec §4 section | Route | Status |
|-----------------|-------|--------|
| Dashboard (6 KPI cards, charts) | `/book` ✅ | ✅ |
| Invoices (list + detail) | `/book/invoices`, `/book/invoices/:id` ✅ | ✅ |
| Expenses (Kanban) | `/book/expenses` ✅ | ✅ + New Expense slide-over |
| Purchases (PO list) | `/book/purchases` ✅ | ✅ |
| Job Costs (profitability) | `/book/job-costs`, `/book/job-costs/:id` ✅ | ✅ |
| Stock Valuation | `/book/stock-valuation` ✅ | ✅ |
| Reports | `/book/reports` ✅ | ✅ |
| Budget | `/book/budget` ✅ | ✅ |
| Settings | `/book/settings` ✅ | ✅ |

**Book:** No critical missing routes in prototype.

### 3.5 Ship Module

All 9 routes present and matching spec. No missing pages identified.

### 3.6 Buy Module

All 11 routes present and matching spec. No missing pages identified.

### 3.7 Control Module

| Route | Status |
|-------|--------|
| Dashboard | ✅ |
| MirrorWorks Bridge | ✅ |
| Factory Designer | ✅ |
| Process Builder | ✅ |
| Locations | ✅ |
| Machines | ✅ |
| Inventory | ✅ |
| Purchase | ✅ |
| People | ✅ |
| Products | ✅ |
| BOMs | ✅ |
| Workflow Designer | ✅ |
| **Settings** | **N/A** — Control is the configuration module; no separate settings route (same as §2.2) |

---

## 4. Route Map vs Actual Routes

Comparing `PrototypeRouteMap.md` (the documented routes) against `routes.tsx` (actual routes):

### Routes in code but NOT in PrototypeRouteMap

| Route | Component | Notes |
|-------|-----------|-------|
| `/sell/opportunities/:id` | SellOpportunityPage | Added later — needs doc update |
| `/sell/orders/:id` | SellOrderDetail | Added today — needs doc update |
| `/sell/activities` | SellActivities | Added today — needs doc update |
| `/sell/quotes` | SellQuotes | Added today — needs doc update |
| `/plan/jobs/:id` | PlanJobDetail | Added today — needs doc update |
| `/plan/schedule` | PlanSchedule | Added previously — needs doc update |
| `/plan/nc-connect` | PlanNCConnect | Added previously — needs doc update |
| `/make/manufacturing-orders` | MakeManufacturingOrders | Added previously — needs doc update |
| `/make/manufacturing-orders/:id` | MakeManufacturingOrderDetail | Added previously — needs doc update |
| `/make/time-clock` | MakeTimeClock | Added previously — needs doc update |
| `/make/quality` | MakeQuality | Added previously — needs doc update |
| `/make/products` | MakeProducts | Added previously — needs doc update |
| `/make/shop-floor` | MakeShopFloor | In `routes.tsx` — ensure `PrototypeRouteMap.md` lists it |
| `/sell/invoices/new` | SellNewInvoice | New invoice wizard |
| `/sell/invoices/:id` | SellInvoiceDetail | Invoice workspace |
| `/bridge` | BridgeWizard | Not documented — standalone bridge route |

### Routes in PrototypeRouteMap but NOT in code

| Route | Documented component | Notes |
|-------|---------------------|-------|
| `/make/work` | MakeWork | **Removed** — replaced by MO detail Work tab |
| `/make/issues` | MakeIssues | **Removed** — replaced by MO detail Issues tab |

### Sidebar vs Routes Mismatch

| Sidebar item | Path | Route exists? |
|-------------|------|---------------|
| Make > Shop Floor | `/make/shop-floor` | ✅ — align `PrototypeRouteMap` if needed |
| Control > Settings | — | **Not needed** — Control is itself a settings module |

---

## 5. Field-Level Disconnections

### 5.1 Spec Fields Missing from Code

**Sell Opportunity (§4.3.2):**
- Expected close: **Done** — `<input type="date">` bound to opportunity state
- Probability: **Done** — editable 0–100% field (Intelligence tab still shows ML narrative)
- Tags: **Done** — multi-select toggles from preset list on overview

**Plan Job Detail (§4.5.1):**
- Progress: **Done** — `ProgressBar` driven by selected stage index
- Stage group: **Done** — clickable stage buttons update progress
- Customer PO: spec says text input → code shows read-only ⚠️
- Tags: spec says "multi-select badges, configurable in settings" → code shows static "Urgent" badge ⚠️

**Plan Production Tab (§4.6.1):**
- Route column (Make/Buy/Subcontract): spec says select dropdown → code shows static text ⚠️
- BOM link, NC Files link: spec says clickable icons → code shows static icons ⚠️
- Operator avatar, Workstation assignment: spec says interactive → code is static ⚠️

**Make Dashboard (§4.1):**
- 5 KPI cards: spec defines Active Orders, Machines Running, Completion Rate, Quality Holds, OEE → code may not have all 5 ⚠️
- Machine Status grid: spec says "clickable — navigates to machine's current WO" → code shows static cards ⚠️
- Today's Schedule Gantt strip: spec describes full-width machine/time grid → **not implemented** ❌

**Make MO Detail (§4.3):**
- Communication sidebar: **Done** — toggle **Chat**; SOPs + chatter + @-mentions in copy + input bar
- Shop floor summary cards: **Done** — Status, Priority, Primary machine, Ship due (selectable highlight)

### 5.2 Settings Fields with No Effect

| Setting | In settings? | Used by module? |
|---------|-------------|-----------------|
| Sell > Pipeline stage colours | Yes (editable table) | No — stages hardcoded in SellOpportunities.tsx |
| Sell > Quote validity periods | Yes (number input) | No — SellNewQuote uses hardcoded 30 days |
| Sell > Payment gateway (Stripe/PayPal) | Yes (toggle switches) | No — no payment processing anywhere |
| Plan > Intelligence Hub access | Yes (permission checkbox) | No — no permission check in PlanIntelligenceHubTab |
| Make > Andon thresholds | Yes (if settings exist) | No — thresholds hardcoded in OverviewTab |
| Buy > Matching tolerance % | Yes (number input) | No — BuyBills/BuyReceipts use hardcoded matching |
| Ship > Carrier API keys | Yes (text inputs) | No — ShipShipping uses hardcoded carrier data |
| Book > Tax rates | Yes (configurable) | No — invoice calculations use hardcoded 10% GST |

---

## 6. Priority Recommendations

### P0 — Critical Gaps

1. ~~Create ControlSettings~~ — **Not needed.** Control is inherently a settings/configuration module; a separate settings page is redundant.
2. ~~Route Book detail pages~~ — **Done.** `/book/invoices/:id` and `/book/job-costs/:id` now routed.
3. ~~Re-add Shop Floor route~~ — **Done.** `/make/shop-floor` restored in routes and sidebar.
4. ~~Update PrototypeRouteMap.md~~ — **Done.** Full rewrite with all 80+ current routes.

### P1 — Spec Compliance

5. ~~Make Dashboard completion~~ — **Done.** 5 KPIs, Quality Alerts, Gantt strip, Quick Actions, OEE/Throughput charts all added per §4.1
6. ~~MO Communication sidebar~~ — **Done.** Chat panel on `MakeManufacturingOrderDetail`
7. ~~Plan Intelligence Hub chatter~~ — **Done.** `PlanIntelligenceHubTab` Chatter section
8. ~~Sell Invoice detail + New Invoice~~ — **Done.** `/sell/invoices/:id`, `/sell/invoices/new` (`SellNewInvoice`)
9. ~~Sell Activity Calendar~~ — **Done.** Month / Week / Day in calendar mode + New Activity dialog
10. **Settings → Module wiring** — pipeline stages, quote validity, tax rates should be read from settings state (still open)

### P2 — Enrichment

11. **MirrorView 3D** — Autodesk APS integration for Plan Production tab (Phase 2)
12. ~~Plan Production Instructions table~~ — **Largely done** in prototype (`PlanProductionTab`); refine drag persistence + APS
13. **Cross-module data sharing** — shared customer, product, and user data stores
14. **Drag-and-drop** — Kanban boards (Sell, Plan, Make) and Calendar
15. **Clean up orphaned components** — ~~SellOpportunityDetail~~ removed; types live in `sell-opportunity-types.ts`. Delete MakeWork / MakeIssues / PlanProduction files if they still exist on disk

---

## 7. Appendix: Complete Route Inventory (Current State)

| Module | Routes (approx.) | Detail / special pages | Settings |
|--------|------------------|-------------------------|----------|
| Sell | 15+ | CRM/:id, Opportunities/:id, Orders/:id, Products/:id, **Invoices/:id**, **Invoices/new** | ✅ (8 panels) |
| Buy | 11 | — | ✅ |
| Plan | 10 | Jobs/:id, schedule, nc-connect | ✅ (3 panels) |
| Make | 9 | MO/:id, **shop-floor** | ✅ |
| Ship | 9 | — | ✅ |
| Book | 11+ | **Invoices/:id**, **job-costs/:id** | ✅ |
| Control | 12 | — | N/A (module = config) |
| **Total** | **75+** + `/bridge` + legacy `/design` redirects | | |

*Keep `PrototypeRouteMap.md` in sync with `routes.tsx` after changes.*
