# Sidebar Audit & Page Catalog

A reference document covering every navigable page in MirrorWorks, why it exists, and how the sidebar will be reorganised. Use this as a single source of truth when adding or moving pages.

> Source of truth for navigation: `src/components/Sidebar.tsx` (`menuConfig` array, ~lines 88–262).
> Routes: `src/routes.tsx`.

---

## 1. Overview

| Module | Items today | Items after reorg | Grouping | Notes |
|---|---|---|---|---|
| Dashboard (root) | 1 | 1 | flat | Welcome screen, no submenu |
| Sell | 10 | 10 | flat | Within target density |
| Buy | 15 | 15 (4 groups) | grouped | Add sub-headings |
| Plan | 16 | 13 (5 groups) | grouped + merges | 3 pages merged into tab wrappers |
| Make | 11 | 11 | flat | Within target density |
| Ship | 11 | 11 | flat | Within target density |
| Book | 11 | 11 | flat | Within target density |
| Control | 18 (5 groups) | 18 (5 groups) | grouped | Already grouped |

**Total leaf items:** 93 → 90 (post-merge).

---

## 2. Module page catalogs

For each page: route · short description · category. Categories are:
- **Dash** — module dashboard
- **Txn** — transactional list / detail
- **Master** — master data / catalog
- **Tool** — interactive workspace
- **Insight** — analytics / reports
- **Config** — settings / admin

### 2.1 Sell — Customer-facing commercial flow

| Page | Route | Description | Category |
|---|---|---|---|
| Dashboard | `/sell` | Commercial KPIs, pipeline funnel, revenue trends | Dash |
| CRM | `/sell/crm` | Customer & contact directory with lead scoring | Master |
| Opportunities | `/sell/opportunities` | Sales pipeline kanban (Prospect → Won) | Txn |
| Orders | `/sell/orders` | Sales orders with status, customer, value | Txn |
| Quotes | `/sell/quotes` | Quote list with expiry & win/loss tracking | Txn |
| Customer portal | `/sell/portal` | Self-service portal for customers | Tool |
| Activities | `/sell/activities` | Sales activities (calls, emails, meetings) | Txn |
| Invoices | `/sell/invoices` | Sent invoice list with payment status | Txn |
| Products | `/sell/products` | Product catalog (sales view: price + stock) | Master |
| Settings | `/sell/settings` | Permissions, quoting rules, integrations | Config |

### 2.2 Buy — Procurement & supply

| Page | Route | Description | Category |
|---|---|---|---|
| Dashboard | `/buy` | Spend KPIs, supplier performance, approvals | Dash |
| Orders | `/buy/orders` | Purchase orders | Txn |
| Requisitions | `/buy/requisitions` | Internal purchase requisitions | Txn |
| Receipts | `/buy/receipts` | Goods receipt notes & inspection | Txn |
| Bills | `/buy/bills` | Vendor invoices (AP) with matching | Txn |
| Suppliers | `/buy/suppliers` | Supplier master with performance metrics | Master |
| RFQs | `/buy/rfqs` | Request for quote management | Txn |
| Agreements | `/buy/agreements` | Framework agreements & contracts | Master |
| Vendor comparison | `/buy/vendor-comparison` | Side-by-side RFQ response comparison | Tool |
| MRP suggestions | `/buy/mrp-suggestions` | AI-suggested POs from demand forecast | Tool |
| Planning grid | `/buy/planning-grid` | Demand/supply alignment grid | Tool |
| Reorder rules | `/buy/reorder-rules` | Reorder points & safety stock per item | Config |
| Products | `/buy/products` | Product catalog (procurement view) | Master |
| Reports | `/buy/reports` | Spend analytics, lead time, quality | Insight |
| Settings | `/buy/settings` | Permissions, approval workflows | Config |

### 2.3 Plan — Production planning & engineering

| Page | Route | Description | Category |
|---|---|---|---|
| Dashboard | `/plan` | Production KPIs, schedule adherence, capacity | Dash |
| Jobs | `/plan/jobs` | Manufacturing jobs with routings & materials | Txn |
| Schedule | `/plan/schedule` | Cross-job Gantt + Calendar (post-merge) | Tool |
| What-if | `/plan/what-if` | Scenario analysis on schedule | Tool |
| Product Studio | `/plan/product-studio` | Visual product configurator (Blockly) | Tool |
| Machine I/O | `/plan/machine-io` | CAD import + NC Connect (tabbed, post-merge) | Tool |
| Nesting | `/plan/nesting` | Sheet metal nesting optimisation | Tool |
| MRP | `/plan/mrp` | Material requirements planning | Tool |
| Sheet calculator | `/plan/sheet-calculator` | Sheet pricing & size optimisation | Tool |
| Purchase | `/plan/purchase` | Material purchase planning + subcontract quotes | Tool |
| Libraries | `/plan/libraries` | Materials + Finishes (tabbed, post-merge) | Master |
| Products | `/plan/products` | Product catalog (production view) | Master |
| Quality | `/plan/qc-planning` | Inspection plan creation | Tool |
| Settings | `/plan/settings` | Permissions, MRP config, planning params | Config |

**Removed from sidebar (redirects preserved):**
- `Activities` → folded into Schedule (calendar view).
- `Material library`, `Finish library` → `/plan/libraries` (tabbed).
- `CAD import`, `NC Connect` → `/plan/machine-io` (tabbed).

### 2.4 Make — Shop-floor execution

| Page | Route | Description | Category |
|---|---|---|---|
| Dashboard | `/make` | Andon board: machine status, work queue | Dash |
| Schedule | `/make/schedule` | Work-centre Gantt | Tool |
| Shop Floor | `/make/shop-floor` | Operator interface (work, quality, time) | Tool |
| Manufacturing Orders | `/make/manufacturing-orders` | Work orders list | Txn |
| Scan station | `/make/scan` | Barcode scan check-in/out | Tool |
| Time Clock | `/make/time-clock` | Labour tracking | Tool |
| Quality | `/make/quality` | Inspections, holds, NCRs | Tool |
| Scrap analysis | `/make/scrap-analysis` | Scrap tracking & root cause | Insight |
| CAPA | `/make/capa` | Corrective/preventive actions | Tool |
| Products | `/make/products` | Product catalog (manufacturing view) | Master |
| Settings | `/make/settings` | Permissions, machine config | Config |

### 2.5 Ship — Outbound logistics

| Page | Route | Description | Category |
|---|---|---|---|
| Dashboard | `/ship` | Shipping KPIs & on-time performance | Dash |
| Orders | `/ship/orders` | Shippable orders ready for packing | Txn |
| Packaging | `/ship/packaging` | Packaging specs & cartons | Tool |
| Shipping | `/ship/shipping` | Carrier selection, rates, labels | Tool |
| Tracking | `/ship/tracking` | Outbound tracking | Tool |
| Carrier rates | `/ship/carrier-rates` | Rate management & contract pricing | Master |
| Scan to ship | `/ship/scan-to-ship` | Pack verification scanning | Tool |
| Returns | `/ship/returns` | Returns with reason codes & restocking | Txn |
| Warehouse | `/ship/warehouse` | Inventory by location with picking | Tool |
| Reports | `/ship/reports` | Shipping cost & on-time analytics | Insight |
| Settings | `/ship/settings` | Permissions, carrier integrations | Config |

### 2.6 Book — Finance

| Page | Route | Description | Category |
|---|---|---|---|
| Dashboard | `/book` | Financial KPIs & approvals | Dash |
| Budget | `/book/budget` | Annual budget vs actual | Insight |
| Invoices | `/book/invoices` | Invoice ageing & payment status | Txn |
| Expenses | `/book/expenses` | Expense kanban (Submitted → Paid) | Txn |
| Purchase Orders | `/book/purchases` | PO commitments & budget allocation | Txn |
| Job Costs | `/book/job-costs` | Job profitability & margin | Insight |
| WIP valuation | `/book/wip` | Work-in-process inventory valuation | Insight |
| Cost variance | `/book/cost-variance` | Actual vs standard costs | Insight |
| Stock Valuation | `/book/stock-valuation` | Inventory valuation (FIFO/LIFO/WAC) | Insight |
| Reports | `/book/reports` | P&L, balance sheet, cash flow | Insight |
| Settings | `/book/settings` | Permissions, GL mapping | Config |

### 2.7 Control — Master data & system admin

Already grouped; see `Sidebar.tsx:210-260` for the canonical groups.

| Group | Items |
|---|---|
| Factory | Factory Designer, Process Builder, Machines, Locations |
| Inventory & Products | Inventory, Products, Product Studio, BOMs, Purchase |
| People & Roles | People, Role Designer, Shifts, Gamification |
| Operations | Maintenance, Tooling, Documents |
| Configuration | Workflow Designer, MirrorWorks Bridge |

---

## 3. Cross-module pages — verdicts

Pages that look duplicated but are intentional context views.

| Page | Modules | Verdict | Reason |
|---|---|---|---|
| **Dashboard** | All 7 | Keep separate | Different KPIs, different audiences |
| **Settings** | All 7 | Keep separate | Shared `ModuleSettingsLayout` template; module-specific permission keys |
| **Products** | Sell, Buy, Plan, Make, Control | Keep separate | Different columns and CTAs per module; Control is the master |
| **Activities** | Sell, ~~Plan~~ | Plan merged | Plan Activities folds into Plan Schedule (calendar view). Sell stays — different data model. |
| **Quality** | Plan, Make | Keep separate | Plan is *plan inspection*, Make is *execute inspection* |
| **Reports** | Buy, Ship, Book | Keep separate | Different data sources; consolidating would break module ownership |
| **Schedule** | Plan, Make | Keep separate | Plan = cross-job horizon; Make = work-centre sequencing |

---

## 4. Consolidation actions (this iteration)

1. **Plan Activities → Plan Schedule.** PlanSchedule already supports a calendar view (`ViewMode = 'gantt' | 'calendar'`). `/plan/activities` becomes a redirect that lands on `/plan/schedule?view=calendar`.
2. **Material library + Finish library → `/plan/libraries`.** New `PlanLibraries.tsx` is a thin tab wrapper; the existing pages render unchanged inside the tab panels. Old routes redirect.
3. **CAD import + NC Connect → `/plan/machine-io`.** Same pattern via `PlanMachineIO.tsx`. Old routes redirect.

No real pages are deleted. All deep links continue to work via redirects in `src/routes.tsx`.

---

## 5. Sidebar UX improvements

### 5.1 Sub-item icons (heuristic #6 — recognition over recall)
A small Lucide icon is added before every sub-item label. Icons live in `src/lib/sub-item-meta.ts` keyed by route. The icon is muted (`text-[var(--neutral-500)]`) when inactive, white when active.

### 5.2 Sub-item descriptions (tooltip on hover)
A 1-line description per sub-item is co-located with the icon in `sub-item-meta.ts`. Hovering a sub-item in expanded mode shows a tooltip-card to the right with the description. The same data powers the tablet rail tooltips and the dashboard quick-nav (Phase 4).

### 5.3 Sub-heading orientators (Plan & Buy)
Both groups inherit the small uppercase heading style already used by Control (`Sidebar.tsx:1003`).

### 5.4 Sticky active-module header
When a module is expanded and its sub-list overflows the viewport, the module's own button stays pinned to the top of the scroll container so the user always knows where they are. Implemented with `position: sticky` on the active module's header.

---

## 6. Dashboard quick-nav (`ModuleQuickNav`)

A new bento grid sits at the top of every module dashboard. Each card is `icon + label + 1-line description`, links to the sub-item, and uses the existing `SpotlightCard` for hover. The component reads `menuConfig` directly so the sidebar is the single source of truth — no duplication.

This gives users a "mega-menu on the dashboard" pattern (per the Charles Haggas B2B SaaS reference) and reduces reliance on scrolling the sidebar.

**File:** `src/components/shared/dashboard/ModuleQuickNav.tsx`.
