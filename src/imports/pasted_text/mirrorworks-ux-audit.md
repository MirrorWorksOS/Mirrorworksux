# MirrorWorks UX Codebase Audit
**Date:** 20 Mar 2026
**Repo:** github.com/MirrorWorksOS/Mirrorworksux
**Figma:** MW-UX (fileKey: mYbNU57fvXaYpgUZ5yoAnX) -- Sell page only confirmed

---

## 1. Module Maturity Scorecard

| Module | Dashboard | List Views | Detail Views | Settings | Total LOC | Maturity |
|--------|-----------|------------|--------------|----------|-----------|----------|
| **Book** | 350 (full) | 173+376 | 195+255 | 435 (9 panels, real forms) | 3,599 | HIGH |
| **Sell** | 427 (full) | 284+126 | 166 (opps stub) | 131 (8 panels, stub content) | 1,742 | MEDIUM |
| **Plan** | 112 (lite) | 397 | 133+560+554 | 75 (stub) | 3,545 | MEDIUM (deep tabs, weak settings) |
| **Ship** | 110 (lite) | 186 | -- | 207 (4 panels, real forms) | 1,485 | MEDIUM (different visual language) |
| **Buy** | 214 (charts) | 178+185+150 | -- | 139 (6 panels, stubs) | 1,396 | LOW-MEDIUM |
| **Make** | 156 (andon) | -- | -- | -- (no settings) | 577 + 5,273 shop-floor | SPLIT (shop-floor is deep, make/ is hollow) |
| **Control** | 89 (stub) | -- | -- | -- (no settings) | 465 | STUB |
| **Design** | -- (no dash) | -- | -- | -- | 254 | STUB |

**Key finding:** Book and shop-floor are the two most complete modules. Everything else has significant gaps. The Make module is split across two directories (`make/` with 6 shallow files and `shop-floor/` with 13 deep files) with no clear relationship in the routing.

---

## 2. Consistency Issues (Cross-Module)

### 2.1 Three Distinct Visual Languages

The codebase has three competing design vocabularies, likely from different AI generation sessions:

**Style A -- "Book/Sell" (the standard)**
- Border: `#E5E5E5`, card bg: white, page bg: `#FAFAFA`
- Text primary: `#0A0A0A`, secondary: `#737373`
- KPI label: `Geist Medium 13px`, KPI value: `Roboto Mono 24px`
- Uses `motion/react` + `designSystem` import
- Uses `<Card>` from ShadCN

**Style B -- "Ship" (minimalist, different tokens)**
- Border: `#F0F0F0`, text primary: `#141414`, secondary: `#8A8A8A`
- Inline fontFamily (`style={{ fontFamily: 'Roboto Mono' }}`) instead of Tailwind classes
- KPI grid: `grid-cols-6` (6-across vs 3-across elsewhere)
- Uppercase tracking-widest section labels
- Uses `const Y = '#FFCF4B'` and `const D = '#141414'` local aliases
- No motion animations, no designSystem import

**Style C -- "Control/Design" (placeholder)**
- Under 90 lines per component
- Generic card + title + text pattern
- No data, no interactions, no charts

### 2.2 Colour Token Chaos

The same semantic meaning uses different hex values:

| Semantic | Book/Sell/Plan | Ship | Buy | Control |
|----------|---------------|------|-----|---------|
| **Border** | `#E5E5E5` (421 uses) | `#F0F0F0` (39) | `#E5E5E5` | `#E5E5E5` |
| **Page bg** | `#FAFAFA` (118) | -- (white) | `#FAFAFA` | `#FAFAFA` |
| **Text primary** | `#0A0A0A` (325) | `#141414` (63) | `#1A2732` (168) | `#0A0A0A` |
| **Text secondary** | `#737373` (552) | `#8A8A8A` (57) | `#737373` | `#6B6B6B` (121) |
| **CTA text** | `#1A2732` | `#141414` | `#1A2732` | `#2C2C2C` |

**Decision needed:** Pick one set. Recommendation: Book/Sell tokens are the most used (80%+ of codebase). Ship module needs a pass to align.

### 2.3 Typography Inconsistencies

- KPI labels: Some use `font-['Geist:Medium',sans-serif] text-[13px]`, others use plain `text-[13px] text-[#737373]` without the font declaration (Plan, Control)
- Financial values: Most use `font-['Roboto_Mono',monospace]`, Ship uses inline `style={{ fontFamily: 'Roboto Mono, monospace' }}`
- Page titles: Mix of `text-[32px] tracking-tight text-[#1A2732]` (Sell, Buy) and `text-[32px] tracking-tight text-[#0A0A0A]` (Plan)

### 2.4 Animation Coverage

| Module | Files with motion | Files without | % animated |
|--------|-------------------|---------------|------------|
| Sell | 8/8 | 0 | 100% |
| Buy | 10/11 | 1 | 91% |
| Book | 3/14 | 11 | 21% |
| Plan | 3/14 | 11 | 21% |
| Ship | 0/9 | 9 | 0% |
| Make | 1/6 | 5 | 17% |
| Control | 1/8 | 7 | 13% |
| Design | 0/4 | 4 | 0% |

**Decision needed:** Either add motion to all modules (consistent) or remove it from Sell/Buy (faster). For demo purposes, motion is a nice-to-have.

### 2.5 Settings Page Architecture

Three different patterns exist:

**Pattern A (Sell, Buy):** Left nav `<Card>` + `useState<SettingsPanel>`, renders stub `<Card>` per panel. 131-139 lines. Content is placeholder.

**Pattern B (Book):** Left nav + split-out panel components (`GeneralPanel`, `InvoicingPanel`), real form controls (Select, Switch, Input, Checkbox). 435 lines. Production-quality.

**Pattern C (Ship):** Left nav array + real `GeneralPanel()` sub-components with full forms. 207 lines. Different visual style (minimalist, no Card wrapper on nav).

**Pattern D (Plan):** Skeleton only. 75 lines. Only General panel has a form; all others show placeholder text.

**Make, Control, Design:** No settings page at all. Sidebar links to `/make/settings` etc. do not exist in routes.

---

## 3. Stub Components (Need Building)

23 components under 80 lines. These are essentially empty shells:

**Critical stubs (core module pages, users will click these):**
- `MakeIssues.tsx` (11 lines) -- just returns `<div>Issues</div>`
- `MakeWork.tsx` (25 lines) -- same
- `ControlPurchase.tsx` (39 lines)
- `ControlInventory.tsx` (43 lines)
- `ControlLocations.tsx` (45 lines)
- `ControlBOMs.tsx` (52 lines)
- `ControlMachines.tsx` (57 lines)
- `ControlProducts.tsx` (56 lines)

**Medium stubs (visible but less critical):**
- `BuyAgreements.tsx` (54 lines)
- `BuyReports.tsx` (62 lines)
- `BuyProducts.tsx` (65 lines)
- `BuyRFQs.tsx` (73 lines)
- `BuyBills.tsx` (72 lines)
- `PlanProducts.tsx` (58 lines)
- `PlanQCPlanning.tsx` (60 lines)
- `PlanPurchase.tsx` (70 lines)
- `PlanSettings.tsx` (75 lines)

**Design module (all stubs):**
- `DesignFactoryLayout.tsx` (47 lines)
- `DesignProcessBuilder.tsx` (47 lines)
- `DesignRoleDesigner.tsx` (57 lines)

---

## 4. Make Module Split

The Make module has a structural problem: two separate directories serve overlapping purposes.

**`src/components/make/` (6 files, 577 lines total)**
- MakeDashboard.tsx -- Andon board with machine status grid (156 lines)
- MakeShopFloor.tsx -- Thin wrapper that renders shop-floor tabs (129 lines)
- MakeShopFloorKanban.tsx -- Work order kanban (177 lines)
- MakeSchedule.tsx -- Stub (79 lines)
- MakeWork.tsx -- Stub (25 lines)
- MakeIssues.tsx -- Stub (11 lines)

**`src/components/shop-floor/` (13 files, 5,273 lines total)**
- OverviewTab.tsx (562) -- full production overview with KPIs
- WorkTab.tsx (281) -- work order list with filters
- IssuesTab.tsx (356) -- NCR tracking with full forms
- QualityTab.tsx (593) -- inspection checklists, defect tracking
- IntelligenceHubTab.tsx (475) -- AI insights panel
- TimeClockTab.tsx (288) -- operator time tracking
- WorkOrderFullScreen.tsx (511) -- detailed work order view
- MaterialsModal.tsx (1,754) -- enormous materials management modal
- VoiceInterfaceMobile.tsx (206) -- voice command interface
- CadFileModal.tsx (156) -- CAD file viewer
- DefectReportModal.tsx (91) -- defect reporting form

**Route connection:** `MakeShopFloor.tsx` renders the shop-floor tabs. The route `/make/shop-floor` loads it. But the shop-floor components are the real Make module -- the `make/` files are mostly wrappers or stubs.

**Recommendation:** Consolidate. The shop-floor directory IS the Make module. The `make/` directory should either absorb those files or act as a thin routing layer. Currently it's confusing.

---

## 5. Figma vs Code Gap Analysis (Sell Module)

The Figma Sell page (canvas 0:1) contains ~50 designed blocks. Here's what exists in code vs what's missing:

### Designed in Figma, EXISTS in code:
- Dashboard (Overview, Analytics, Reports tabs) -- `SellDashboard.tsx`
- CRM Cards view -- `SellCRM.tsx`
- CRM List view -- `SellCRMList.tsx`
- Orders List -- `SellOrders.tsx`
- Products List -- `SellProducts.tsx`
- Invoice List (empty + populated) -- `SellInvoices.tsx`
- Settings (General, Teams, Leads, Quoting, Payments, Activities, Analytics, Integrations) -- `SellSettings.tsx` (structure matches but content is stubs)

### Designed in Figma, MISSING from code:
- **Opportunity Kanban** (`Blocks / Opportunity Kanban`, node 204:25921) -- draggable pipeline columns with deal cards. Code has `SellOpportunities.tsx` but it's a simple list, not a kanban.
- **Opportunity Detail / Overview** (`Blocks / Opportunity / Overview`, node 204:26446) -- two-column layout with customer info, stage tracker, timeline. NOT in code.
- **New Quote form** (`Blocks / Opportunity / New Quote`, node 204:26997) -- multi-field form with customer, dates, line items table, totals. NOT in code.
- **Opportunity Activities** (`Blocks / Opportunity / Activities`, node 204:27549) -- activity feed with timeline + new activity form. NOT in code.
- **Activity Calendar** (`Blocks / Opportunity / Activity Calendar`, node 294:177483) -- month/week/day calendar views. NOT in code.
- **Intelligence Hub** (`Blocks / Opportunity / Intelligence Hub`, node 284:170764) -- AI insights panel for opportunities. NOT in code for Sell (exists in shop-floor).
- **New Invoice form** (`Blocks / Opportunity / New Invoice`, node 294:171225) -- invoice creation with line items. NOT in code.
- **Product Detail** (`Blocks / Product / Overview + Manufacturing + Inventory + Accounting + Documents`, nodes 484:251921 through 519:332160) -- five-tab product detail view. NOT in code. This is a major screen with ~15 sections across tabs.
- **Opportunity ID popup** (node 294:176965) -- quick-view card with stage toggles (Invoice/Delivery). NOT in code.

### Designed in Figma, PARTIALLY in code:
- **Settings panels** -- Figma has detailed designs for all 8 panels (General, Teams, Leads, Quoting, Payments, Activities, Analytics, Integrations). Code has the left-nav structure but only stub content in each panel. BookSettings is the reference implementation for what these should look like.
- **CRM** -- Figma shows card view with filter/search toolbar. Code has cards but simpler layout.
- **Invoice List** -- Figma shows row action dropdown, date range filters, status tabs. Code has basic table only.

---

## 6. Missing Features vs Module Specs

Based on project knowledge (Confluence specs and .docx files):

### Sell Module (MW-Sell-Module-Specification)
- Missing: Quote builder with line items and BOM integration
- Missing: Opportunity stage pipeline (kanban) with probability
- Missing: Customer detail/360 view
- Missing: Activities/calendar integration
- Missing: Intelligence Hub (AI deal scoring)
- Missing: Quote PDF generation
- Exists but thin: CRM (no customer detail panels)

### Plan Module (MW-Plan-Module-Specification)
- Exists: Jobs list, job detail (overview, production, schedule, budget, intelligence hub tabs)
- Missing: Gantt chart / schedule visualisation
- Missing: Capacity planning view
- Missing: Resource allocation board
- Missing: Job creation wizard
- Missing: Budget creation workflow (how quoted amount splits into 4 categories)
- Stub: Products, QC Planning, Purchase, Settings

### Make Module (MW-Make-Module-Specification)
- Exists (in shop-floor/): Overview, Work orders, Quality, Time clock, Issues, Intelligence Hub
- Missing: Machine connectivity / live status (dashboard has mock data)
- Missing: Manufacturing order create/edit form
- Missing: Work centre management
- Missing: Settings page
- Stub: Schedule view, Work view, Issues view (in make/ directory)

### Ship Module (MW-Ship-Module-Specification)
- Exists: Dashboard, Orders, Packaging, Shipping, Tracking, Returns, Warehouse, Reports, Settings
- All pages have reasonable content. This module is the most consistently built.
- Missing: Consignment detail view
- Missing: Carrier rate comparison
- Missing: Packing slip / label generation
- Visual language needs alignment with other modules

### Book Module (MW-Book-Module-Specification)
- Most complete module in the codebase
- Exists: Dashboard, Invoices (list + detail), Expenses (kanban + new), Job Profitability, Job Cost Detail, Purchase Orders, Budget Overview, Stock Valuation, Reports Gallery, Settings (9 panels with real forms)
- Missing: Xero sync status panel
- Missing: Bank reconciliation view
- Missing: GST/BAS report generation
- Missing: Budget revision history (UI exists, no DB backing)

### Buy Module (MirrorWorks-Buy-Module-Specification)
- Exists: Dashboard, Orders, Requisitions, Receipts, Suppliers, Settings
- Stub: RFQs, Bills, Products, Agreements, Reports
- Missing: Purchase order detail view
- Missing: Supplier detail / 360 view
- Missing: Three-way matching (PO vs receipt vs invoice)
- Missing: Approval workflows

---

## 7. Immediate Consistency Fixes (Quick Wins)

These are changes that can be done mechanically across all modules:

### 7.1 Unify border colour
Replace `border-[#F0F0F0]` (Ship) and `border-[#E5E4E0]` with `border-[#E5E5E5]`.

### 7.2 Unify text colours
- Primary text: `text-[#0A0A0A]` everywhere (replace `#141414`, `#1A2732` in body text)
- Secondary text: `text-[#737373]` everywhere (replace `#8A8A8A`, `#6B6B6B`, `#A0A0A0`)
- CTA button text: `text-[#1A2732]` on MW Yellow buttons (replace `#2C2C2C`, `#141414`)

### 7.3 Add motion to all dashboards
Every dashboard and list page should import `designSystem` and wrap content in `motion.div` with `animationVariants.stagger`. Currently only Sell and Buy do this consistently.

### 7.4 Standardise settings pages
Use Book Settings as the template. Every module settings page should:
- Left nav with icon + label
- Active state: `bg-[#FFFBF0]` (MW Yellow tint)
- Real form controls (Switch, Select, Input)
- Save/Discard buttons in each panel
- Section headers with uppercase tracking-wider labels

### 7.5 Add missing Settings routes
Routes.tsx is missing settings routes for Make and Control. These need:
- Route definition in routes.tsx
- Sidebar link (already exists for some)
- Actual component file

---

## 8. Priority Action Plan

### Tier 1 -- Must fix for demo (1-2 days)
1. Run token find-and-replace to unify colours (mechanical, 30 min)
2. Build Sell Opportunity Kanban (Figma design exists, key demo screen)
3. Build Sell Opportunity Detail view (Figma design exists)
4. Flesh out Sell Settings panels using Book Settings as template
5. Consolidate Make module directories

### Tier 2 -- Feature completeness (3-5 days)
1. Build Sell New Quote form with line items
2. Build Sell Product Detail (5-tab view from Figma)
3. Build Plan Gantt/schedule view
4. Build Buy PO Detail and Supplier Detail views
5. Add motion animations to all modules
6. Build Control module list views (currently all stubs)

### Tier 3 -- Polish (ongoing)
1. Empty states for all list views (Figma has designs for these)
2. Responsive/mobile layouts
3. Intelligence Hub component shared across Sell, Plan, Make
4. Activity calendar component shared across Sell, Plan
5. Design module (lowest priority, Phase 2)

---

## 9. Figma Settings Screens (for Figma Make Prompts)

The Figma Sell page has detailed settings designs that should be used as reference for all modules:

| Figma Block | Node ID | Description |
|-------------|---------|-------------|
| Sell Settings / General | 223:132262 | Organisation name, currency, timezone, date format |
| Sell Settings / Teams | 224:133772 | Team member table with roles, invite form |
| Settings / Leads | 224:141264 | Lead sources, scoring rules, assignment rules |
| Settings / Quoting | 227:145193 | Quote prefix, expiration, approval workflows, pipeline table |
| Settings / Payments | 227:152107 | Payment processing (PayPal/Stripe integration cards) |
| Settings / Activities | 234:150118 | Activity types, notification preferences, radio groups |
| Settings / Analytics | 234:155820 | Dashboard widgets config, export settings |
| Settings / Integrations | 234:161496 | Connected services, API keys, sync status |

These should be replicated for Plan, Make, Ship, Buy, Book, and Control -- adapted per module but following the same layout pattern.