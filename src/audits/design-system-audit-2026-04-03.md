# MirrorWorks Design System Audit — 2026-04-03

**Source of truth:** `src/guidelines/DesignSystem.md` (v2.0, March 2026)
**Visual language reference:** `src/guidelines/VisualLanguage.md` (verified consistent with v2.0)
**Token sources:** `src/styles/globals.css` (CSS variables), `src/lib/design-system.ts` (TS constants)

---

## Summary

| Severity | Count |
|---|---|
| CRITICAL | 6 |
| HIGH | ~380 |
| MEDIUM | ~350 |
| LOW | ~50 |
| **Total** | **~786** |

### Top 10 Most-Violated Rules
1. **font-semibold (weight 600)** — 176 occurrences (not in Roboto weight set)
2. **Tailwind colour utilities** (blue/green/red/purple/orange/amber) — 87 occurrences
3. **Touch targets below minimum** — ~55 violations in make/ship/shop-floor
4. **Raw `<table>` elements** — 50 tables (38 MwDataTable, 12 FinancialTable)
5. **Hardcoded non-token hex values** — ~170 occurrences across 11 files
6. **Chart compliance** (missing ChartCard, animation, tooltip styles) — 48 HIGH violations
7. **Undersized buttons** (below h-10 or h-14 for shop floor) — ~40 violations
8. **Arbitrary border radius** (`rounded-[8px]`, `rounded-[4px]`) — ~70 occurrences
9. **Card padding not p-6** — ~35 violations (p-4 or p-5)
10. **Missing shared component usage** (PageShell, StatusBadge, ProgressBar, IconWell, FilterBar) — ~30 files

### Top 10 Files by Violation Count
1. `src/components/shop-floor/MaterialsModal.tsx` — ~170 (SVG hex, rounded-[8px])
2. `src/components/shop-floor/QualityTab.tsx` — ~60 (colours, touch targets, shadows, font-semibold)
3. `src/components/shop-floor/IssuesTab.tsx` — ~35 (hex, touch targets, shadows, colours)
4. `src/components/shop-floor/IntelligenceHubTab.tsx` — ~35 (hex, rounded-[8px])
5. `src/components/shop-floor/OverviewTab.tsx` — ~30 (touch targets, font-semibold, rounded-[8px])
6. `src/components/shop-floor/WorkOrderFullScreen.tsx` — ~25 (touch targets, spacing, overlay)
7. `src/components/sell/SellCustomerDetail.tsx` — ~25 (raw tables, spacing, status badges)
8. `src/components/shop-floor/TimeClockTab.tsx` — ~20 (Tailwind colours, touch targets)
9. `src/components/make/MakeManufacturingOrderDetail.tsx` — ~20 (touch targets, buttons, spacing)
10. `src/components/sell/SellProductDetail.tsx` — ~18 (raw tables, charts, KpiStatCard)

---

## Findings

### 1. Shared Component Usage

#### CRITICAL
No critical shared component violations.

#### HIGH — Raw `<table>` → MwDataTable/FinancialTable (50 tables)

**Financial tables (should use FinancialTable) — 12 instances:**
- `src/components/book/JobCostDetail.tsx:100,207,229` — Three tables (Budgeted/Actual/Variance). Should use: `FinancialTable`.
- `src/components/book/JobProfitability.tsx:148,179` — Two tables with margin data. Should use: `FinancialTable`.
- `src/components/book/InvoiceDetail.tsx:80` — Invoice line items (Unit Price/Disc/Total). Should use: `FinancialTable`.
- `src/components/book/StockValuation.tsx:165` — Raw materials valuation (Qty/Unit Cost/Total). Should use: `FinancialTable`.
- `src/components/plan/PlanBudgetTab.tsx:305` — Budget breakdown (Budget/Actual/Variance). Should use: `FinancialTable`.
- `src/components/sell/SellProductDetail.tsx:182` — BOM table with totals row. Should use: `FinancialTable`.
- `src/components/sell/SellNewQuote.tsx:234` — Quote line items (Cost/Margin/Price/Total). Should use: `FinancialTable`.
- `src/components/sell/SellCustomerDetail.tsx:623` — Customer invoices with Amount column. Should use: `FinancialTable`.

**Data tables (should use MwDataTable) — 38 instances:**
- `src/components/control/ControlBOMs.tsx:131,184` — BOM listing. Should use: `MwDataTable`.
- `src/components/control/ControlProducts.tsx:92` — Product master. Should use: `MwDataTable`.
- `src/components/control/ControlMachines.tsx:74` — Machine listing. Should use: `MwDataTable`.
- `src/components/control/ControlInventory.tsx:81` — Inventory. Should use: `MwDataTable`.
- `src/components/control/people/UsersTab.tsx:116` — Users. Should use: `MwDataTable`.
- `src/components/control/ControlGamification.tsx:150` — Targets. Should use: `MwDataTable`.
- `src/components/buy/BuyBills.tsx:113` — Bills. Should use: `MwDataTable`.
- `src/components/buy/BuyRFQs.tsx:178` — RFQs. Should use: `MwDataTable`.
- `src/components/buy/BuyProducts.tsx:26` — Buy products. Should use: `MwDataTable`.
- `src/components/buy/BuyRequisitions.tsx:87` — Requisitions. Should use: `MwDataTable`.
- `src/components/buy/BuyOrders.tsx:128` — Purchase orders. Should use: `MwDataTable`.
- `src/components/make/MakeProducts.tsx:71` — Products. Should use: `MwDataTable`.
- `src/components/make/MakeSchedule.tsx:103` — Schedule. Should use: `MwDataTable`.
- `src/components/make/MakeManufacturingOrders.tsx:78` — MO listing. Should use: `MwDataTable`.
- `src/components/ship/ShipTracking.tsx:76` — Shipment tracking. Should use: `MwDataTable`.
- `src/components/ship/ShipOrders.tsx:141` — Ship orders. Should use: `MwDataTable`.
- `src/components/ship/ShipReturns.tsx:68` — Returns/RMA. Should use: `MwDataTable`.
- `src/components/ship/ShipShipping.tsx:150` — Shipping manifests. Should use: `MwDataTable`.
- `src/components/ship/ShipWarehouse.tsx:109,160` — Two warehouse tables. Should use: `MwDataTable`.
- `src/components/sell/SellProductDetail.tsx:154,236,346` — Routing, Stock Movements, Documents. Should use: `MwDataTable`.
- `src/components/sell/SellCustomerDetail.tsx:520,549,576,657,704` — Opportunities, Quotes, Orders, Contacts, Documents. Should use: `MwDataTable`.
- `src/components/sell/SellActivities.tsx:410` — Activities list. Should use: `MwDataTable`.
- `src/components/sell/SellInvoices.tsx:124` — Invoices list. Should use: `MwDataTable`.
- `src/components/sell/SellOrders.tsx:87` — Orders list. Should use: `MwDataTable`.
- `src/components/sell/SellQuotes.tsx:176` — Quotes list. Should use: `MwDataTable`.
- `src/components/sell/SellProducts.tsx:136` — Products list. Should use: `MwDataTable`.
- `src/components/book/BookInvoices.tsx:204` — Invoices. Should use: `MwDataTable`.
- `src/components/book/PurchaseOrders.tsx:85` — POs. Should use: `MwDataTable`.
- `src/components/book/ReportsGallery.tsx:97` — Scheduled reports. Should use: `MwDataTable`.
- `src/components/book/InvoiceList.tsx:106` — Invoice list. Should use: `MwDataTable`.
- `src/components/plan/PlanProducts.tsx:53` — Plan products. Should use: `MwDataTable`.
- `src/components/plan/PlanPurchase.tsx:84` — Plan purchase. Should use: `MwDataTable`.
- `src/components/plan/PlanJobs.tsx:276` — Jobs. Should use: `MwDataTable`.
- `src/components/bridge/steps/StepManualEntry.tsx:287` — Manual entry preview. Should use: `MwDataTable`.
- `src/components/bridge/steps/StepReviewConfirm.tsx:100` — Review preview. Should use: `MwDataTable`.
- `src/components/WelcomeDashboard.tsx:312` — Recent jobs. Should use: `MwDataTable`.

#### HIGH — Missing PageShell/PageHeader (15 files)
- `src/components/sell/SellProductDetail.tsx:405` — Bare `<div className="p-8 space-y-8">`. Should use: `PageShell` + `PageHeader`.
- `src/components/sell/SellCustomerDetail.tsx:175` — Hand-rolled `<h1>`. Should use: `PageShell` + `PageHeader`.
- `src/components/buy/BuyBills.tsx` — Missing PageShell/PageHeader.
- `src/components/buy/BuyRFQs.tsx` — Missing PageShell/PageHeader.
- `src/components/buy/BuyProducts.tsx` — Missing PageShell/PageHeader.
- `src/components/buy/BuyRequisitions.tsx` — Missing PageShell/PageHeader.
- `src/components/buy/BuyAgreements.tsx` — Missing PageShell/PageHeader.
- `src/components/ship/ShipTracking.tsx` — Missing PageShell/PageHeader.
- `src/components/ship/ShipReturns.tsx` — Missing PageShell/PageHeader.
- `src/components/ship/ShipShipping.tsx` — Missing PageShell/PageHeader.
- `src/components/ship/ShipWarehouse.tsx` — Missing PageShell/PageHeader.
- `src/components/book/JobCostDetail.tsx` — Missing PageShell/PageHeader.
- `src/components/book/InvoiceDetail.tsx` — Missing PageShell/PageHeader.
- `src/components/book/NewExpense.tsx` — Missing PageShell/PageHeader.
- `src/components/control/ControlLocations.tsx` — Missing PageShell/PageHeader.

#### HIGH — Charts not wrapped in ChartCard (~18 charts in 11 files)
- `src/components/sell/SellDashboard.tsx` — 4 charts in plain `<Card>`.
- `src/components/sell/SellProductDetail.tsx` — 1 chart.
- `src/components/buy/BuyDashboard.tsx` — 2 charts.
- `src/components/buy/BuyReports.tsx` — 2 charts.
- `src/components/ship/ShipDashboard.tsx` — 1 chart.
- `src/components/book/JobCostDetail.tsx` — 2 charts.
- `src/components/book/JobProfitability.tsx` — 2 charts.
- `src/components/book/StockValuation.tsx` — 2 charts.
- `src/components/plan/PlanDashboard.tsx` — 1 chart.
- `src/components/plan/PlanBudgetTab.tsx` — 1 chart.
- `src/components/shared/dashboard/DashboardWidgetGrid.tsx` — 5 chart widgets.

#### MEDIUM — Hand-rolled components that should use shared
- `src/components/sell/SellProductDetail.tsx:88-103` — Hand-rolled KPI cards → `KpiStatCard`.
- `src/components/book/JobProfitability.tsx:98-111` — Hand-rolled KPI cards → `KpiStatCard`.
- `src/components/book/StockValuation.tsx:88-107` — Hand-rolled KPI cards → `KpiStatCard`.
- `src/components/sell/SellCustomerDetail.tsx:604-614` — Hand-rolled KPI cards → `KpiStatCard`.
- `src/components/book/StockValuation.tsx:103` — Hand-rolled dark card → `DarkAccentCard`.
- `src/components/sell/SellDashboard.tsx:259,772` — Hand-rolled progress bars → `ProgressBar`.
- `src/components/plan/PlanBudgetTab.tsx:347-358` — Hand-rolled progress bars → `ProgressBar`.
- `src/components/book/BudgetOverview.tsx:357,471` — Hand-rolled progress bars → `ProgressBar`.
- `src/components/sell/SellCustomerDetail.tsx:104-133` — Hand-rolled status logic → `StatusBadge`.
- `src/components/book/BookInvoices.tsx:96-100` — Hand-rolled status config → `StatusBadge`.
- `src/components/ship/ShipOrders.tsx:45` — Hand-rolled status badge → `StatusBadge`.
- `src/components/ship/ShipReturns.tsx:17-23` — Hand-rolled status config → `StatusBadge`.
- `src/components/plan/PlanBudgetTab.tsx:362-375` — Hand-rolled status badges → `StatusBadge`.
- `src/components/control/ControlBOMs.tsx:120-128` — Hand-rolled search → `FilterBar`.
- `src/components/control/ControlProducts.tsx:67-88` — Hand-rolled filters → `FilterBar`.
- `src/components/control/ControlMachines.tsx:63-70` — Hand-rolled search → `FilterBar`.
- `src/components/ship/ShipReturns.tsx:60-63` — Hand-rolled search → `FilterBar`.
- `src/components/ship/ShipWarehouse.tsx:100-106` — Hand-rolled search → `FilterBar`.
- `src/components/plan/PlanBudgetTab.tsx:162,185,242,262` — Hand-rolled icon containers → `IconWell`.
- `src/components/plan/PlanNCConnect.tsx:177` — Hand-rolled icon container → `IconWell`.
- `src/components/control/ControlWorkflowDesigner.tsx:507` — Hand-rolled icon container → `IconWell`.
- `src/components/control/ControlLocations.tsx:120` — Hand-rolled icon container → `IconWell`.
- `src/components/make/MakeManufacturingOrderDetail.tsx:564` — Hand-rolled icon container → `IconWell`.
- `src/components/sell/SellDashboard.tsx:657` — Hand-rolled icon container → `IconWell`.
- `src/components/shared/ai/IntelligenceHub.tsx:57` — Hand-rolled icon container → `IconWell`.

---

### 2. Colour Violations

#### 2a. Deprecated Colours
**No occurrences found.** All 13 deprecated hex values have been removed from the codebase.

#### 2b. Tailwind Colour Utilities — 87 occurrences (HIGH)

**blue- classes (26 occurrences):**
- `src/components/control/WorkflowCanvas.tsx:315` — `bg-blue-500`, `border-l-blue-500`.
- `src/components/control/ControlWorkflowDesigner.tsx:54` — `bg-blue-500`.
- `src/components/shop-floor/TimeClockTab.tsx:242` — `bg-blue-50 text-blue-700 border-2 border-blue-200`.
- `src/components/bridge/steps/StepTeamSetup.tsx:30` — `text-blue-600`.
- `src/components/bridge/steps/StepFileUpload.tsx:75,77,79,80` — `border-blue-200 bg-blue-50`, `text-blue-600/900/700`.
- `src/components/bridge/steps/StepScopeQuestions.tsx:171-175` — `border-blue-200 bg-blue-50`, `text-blue-600/900/700`.
- `src/components/shop-floor/issues/IssueModals.tsx:109-113` — `bg-blue-50`, `text-blue-800/700`.
- `src/components/sell/SellActivities.tsx:151,182` — `bg-blue-100 text-blue-800`, `bg-blue-50 text-blue-700`.
- `src/components/shared/calendar/EventDetailSheet.tsx:56,65` — `border-t-blue-500`, `bg-blue-50`, `text-blue-700`.

**green- classes (7 occurrences):**
- `src/components/sell/SellActivities.tsx:155` — `bg-green-100 text-green-800`.
- `src/components/shared/calendar/EventDetailSheet.tsx:57` — `border-t-green-500`, `bg-green-50`, `text-green-700`.
- `src/components/shop-floor/QualityTab.tsx:162,164` — `bg-green-100 text-green-700`, `bg-green-600`.
- `src/components/shop-floor/TimeClockTab.tsx:118,200,201` — `text-green-700`, `bg-green-50`, `bg-green-500`.

**red- classes (25 occurrences):**
- `src/components/control/WorkflowCanvas.tsx:320,449` — `bg-red-500`, `text-red-400`.
- `src/components/control/ControlWorkflowDesigner.tsx:58` — `bg-red-500`.
- `src/components/shop-floor/IssuesTab.tsx:183` — `text-red-100`.
- `src/components/shop-floor/issues/IssueModals.tsx:28,86,210` — `bg-red-100`, `text-red-700`, `bg-red-600`.
- `src/components/shop-floor/TimeClockTab.tsx:229` — `border-red-100 text-red-600`.
- `src/components/shop-floor/QualityTab.tsx:162,164,172,347,529` — Multiple red- classes.
- `src/components/sell/SellActivities.tsx:186` — `bg-red-50 text-red-700`.
- `src/components/shared/calendar/EventDetailSheet.tsx:67,73,269` — red- badges/hover.
- `src/components/bridge/FieldMappingRow.tsx:27` — `bg-red-50 border-red-200`.
- `src/components/bridge/steps/StepManualEntry.tsx:314` — `hover:text-red-600`.

**purple-/violet- classes (8 occurrences):**
- `src/components/bridge/steps/StepTeamSetup.tsx:31` — `text-purple-600`.
- `src/components/sell/SellActivities.tsx:159` — `bg-purple-100 text-purple-800`.
- `src/components/shared/calendar/EventDetailSheet.tsx:58` — purple- classes.
- `src/components/shop-floor/issues/IssueModals.tsx:271-284` — `bg-purple-50/600/700`.

**orange-/amber- classes (21 occurrences):**
- `src/components/control/WorkflowCanvas.tsx:317,318` — `bg-orange-500`, `bg-amber-500`.
- `src/components/control/ControlWorkflowDesigner.tsx:56,61` — `bg-orange-500`, `bg-amber-500`.
- `src/components/sell/SellActivities.tsx:163,190` — amber- classes.
- `src/components/bridge/steps/StepTeamSetup.tsx:32` — `text-orange-600`.
- `src/components/shop-floor/QualityTab.tsx:173,174,530` — amber/orange- classes.
- `src/components/bridge/steps/StepReviewConfirm.tsx:78,126` — `text-amber-600`.
- `src/components/shop-floor/issues/IssueModals.tsx:196-200` — orange- classes.
- `src/components/shop-floor/TimeClockTab.tsx:117,206,207` — orange- classes.
- `src/components/shared/calendar/EventDetailSheet.tsx:59,60,72` — amber/orange- classes.

#### 2c. Hardcoded Non-Token Hex — ~170 occurrences (MEDIUM)

**Worst offender:** `src/components/shop-floor/MaterialsModal.tsx` — 128 non-token SVG hex values (Figma export: `#0F172B`, `#314158`, `#CAD5E2`, `#90A1B9`, `#62748E`, `#45556C`).

**Other notable files:**
- `src/components/shop-floor/IntelligenceHubTab.tsx` — ~20 non-token hex (`#1E3A8A`, `#FCA5A5`, `#991B1B`, `#333`, `#444`).
- `src/components/shop-floor/IssuesTab.tsx` — ~10 (`#FFD66B`, `#F4C542`, `#FFFBEB`, `#F3F4F6`, `#166534`, `#5B21B6`).
- `src/components/shop-floor/QualityTab.tsx` — ~12 (`#E5E4E0`, `#9CA3AF`, `#E5E7EB`).
- `src/components/sell/SellSettings.tsx` — 12 third-party brand hex (Stripe, PayPal, Xero, HubSpot, Google, Slack) — **acceptable with comments**.
- `src/components/sell/SellActivities.tsx:169-171` — `#3b82f6`, `#22c55e`, `#eab308` → should use `var(--mw-info/success/warning)`.
- `src/components/book/ReportsGallery.tsx:73,77` — `#13B5EA` (Xero brand).

#### 2d. Inline Style Colours — ~45 occurrences (MEDIUM)
Spread across 25+ files using `style={{ color: }}`, `backgroundColor`, etc. Most use CSS variables (acceptable pattern). Dynamic data-driven colours in charts/status are acceptable.

#### 2e. dark: Classes — 1 genuine occurrence (LOW)
- `src/components/bridge/FieldMappingRow.tsx:27` — `dark:bg-red-950/10`. Dead code — remove.

---

### 3. Typography Violations

#### CRITICAL — Wrong Font Families (2 occurrences)
- `src/components/plan/PlanNCConnect.tsx:204` — `font-mono` on G-code `<pre>`. Should use: Roboto with `tabular-nums`.
- `src/components/plan/PlanDashboard.tsx:199` — `font-mono` on job ID `<span>`. Should use: Roboto with `tabular-nums`.

#### HIGH — font-semibold (176 occurrences)
`font-semibold` (weight 600) is not in the Roboto weight set. Browser synthesizes or falls back. Every instance should be `font-medium` (500) or `font-bold` (700).

**Files with most occurrences:** QualityTab (21), OverviewTab (7), PlanOverviewTab (7), TimeClockTab (5), PlanProductionTab (4), PlanBudgetTab (4), PlanDashboard (4), MakeManufacturingOrderDetail (5), SellProductDetail (5), SellSettings (4), StepTeamSetup (4), MakeDashboard (5), ShipReturns (3), WorkflowCanvas (4), ControlWorkflowDesigner (4).

**Shared components also affected:** DarkAccentCard, FlatCard, EntityCard, KanbanColumn, EmptyState, ModuleInfoCallout, ModuleSettingsLayout, EventDetailSheet, DashboardWidget, AIInsightCard, IntelligenceHub, FinancialTable, BridgeStepper.

**UI base components:** dialog.tsx, alert-dialog.tsx, drawer.tsx, sheet.tsx (animate-ui).

#### MEDIUM — Non-standard text sizes (~90 occurrences)
- `text-[11px]` — ~10 files (Sidebar, CommandPalette, WidgetDrawer, GanttChart, QuickCreatePanel).
- `text-[10px]` — ~60 occurrences across badges, avatars, labels.
- `text-[9px]` — WorkflowCanvas, MakeDashboard, PlanProductionTab, CommandPalette, QuickCreatePanel.
- `text-[8px]` — PlanProductionTab, BuyBills, ExpenseKanban.
- `text-[17px]` — WelcomeDashboard.
- `text-[15px]` — CommandPalette.
- `text-[20px]` — SellCustomerDetail, CadFileModal, DefectReportModal (should use `text-xl`).
- `text-[36px]` — JobCostDetail, InvoiceDetail (should use `text-4xl`).
- `text-[48px]` — QualityTab, WorkOrderFullScreen.
- `text-[56px]` — WorkOrderFullScreen, TimeClockTab.

#### MEDIUM — Currency values missing tabular-nums (~30 occurrences)
- `src/components/shop-floor/MaterialsModal.tsx` — 12 currency values without `tabular-nums`.
- `src/components/plan/PlanOverviewTab.tsx` — 9 budget cells without `tabular-nums`.
- `src/components/buy/BuyRFQs.tsx:125`, `BuyRequisitions.tsx:123`, `BuyAgreements.tsx:149,153`, `BuyOrders.tsx:166,169` — Financial values without `tabular-nums`.
- `src/components/control/ControlInventory.tsx:109` — Cost price without `tabular-nums`.
- `src/components/shop-floor/QualityTab.tsx:349,373` — Scrap/rework costs without `tabular-nums`.

---

### 4. Border Radius Violations

#### Tailwind Config Status: MAPPED
`rounded-sm`=8px, `rounded-md`=12px, `rounded-lg`=16px, `rounded-xl`=24px via `@theme inline` in globals.css.

#### CRITICAL — button.tsx base radius wrong
- `src/components/ui/button.tsx:8` — Base `buttonVariants` uses `rounded-xl` (24px). Should be: `rounded-md` (12px). **Affects every Button in the app (~300+ instances).**

#### HIGH — Arbitrary rounded-[4px] (not in shape scale)
- `src/components/shop-floor/IssuesTab.tsx:301,305,309,313` — Badges.
- `src/components/shop-floor/WorkTab.tsx:114,120,217` — Badges.
- `src/components/shop-floor/WorkOrderFullScreen.tsx:425` — Overlay.
- `src/components/shop-floor/VoiceInterfaceMobile.tsx:193` — Div.

#### MEDIUM — Arbitrary rounded-[8px] instead of rounded-sm (~70 occurrences)
- `src/components/shop-floor/MaterialsModal.tsx` — ~40 instances.
- `src/components/shop-floor/IntelligenceHubTab.tsx` — 8 instances.
- `src/components/shop-floor/WorkOrderFullScreen.tsx` — 7 instances.
- `src/components/shop-floor/CadFileModal.tsx` — 6 instances.
- `src/components/shop-floor/OverviewTab.tsx` — 11 instances.
- `src/components/shop-floor/IssuesTab.tsx` — 6 instances.
- `src/components/shop-floor/WorkTab.tsx` — 3 instances.

#### MEDIUM — rounded-full on non-pill buttons
- `src/components/control/ControlInventory.tsx:71`, `buy/BuyOrders.tsx:115`, `book/PurchaseOrders.tsx:58,69,70` — Action buttons with `rounded-full` should be `rounded-md`.

---

### 5. Spacing & Layout Violations

#### HIGH — p-5 (20px) on cards (~25 instances)
- `src/components/sell/SellDashboard.tsx:742`, `sell/SellSettings.tsx:305,341,480`, `buy/BuyBills.tsx:98`, `buy/BuyAgreements.tsx:90,113`, `control/ControlGamification.tsx:227`, `bridge/steps/StepImportResults.tsx:87,92,97,125`, `shop-floor/IssuesTab.tsx:276,282,323`, `shop-floor/QualityTab.tsx:282`, `shop-floor/WorkTab.tsx:162`, `shop-floor/WorkOrderFullScreen.tsx:149,386,398,475`.

#### MEDIUM — p-4 (16px) on cards (should be p-6) (~15 instances)
- `src/components/book/InvoiceDetail.tsx:125,135,159,184`, `bridge/steps/StepTeamSetup.tsx:210`, `bridge/steps/StepReviewConfirm.tsx:67`, `control/ControlEmptyStates.tsx:170,251`, `plan/PlanOverviewTab.tsx:487,549,587,621`, `make/MakeManufacturingOrderDetail.tsx:188,455`, `plan/PlanNCConnect.tsx:174`.

#### MEDIUM — gap-4 on card grids (should be gap-6) (~8 instances)
- `src/components/control/MirrorWorksBridge.tsx:35`, `control/ControlRoleDesigner.tsx:56`, `control/ControlGamification.tsx:224`, `control/ControlPeople.tsx:56`, `control/ControlLocations.tsx:111`, `ship/ShipReturns.tsx:65`, `book/JobCostDetail.tsx:151`, `sell/SellDashboard.tsx:267`.

---

### 6. Button Violations

#### CRITICAL — button.tsx defaults wrong
- `src/components/ui/button.tsx:24` — Default size `h-9` (36px). Should be: `h-12` (48px).
- `src/components/ui/button.tsx:25` — `sm` size `h-8` (32px). Should be: `h-10` (40px).
- `src/components/ui/button.tsx:26` — `lg` size `h-10` (40px). Should be: `h-14` (56px).
- `src/components/ui/button.tsx:8` — Base radius `rounded-xl` (24px). Should be: `rounded-md` (12px).

#### HIGH — Buttons below minimum (h-8 or h-7) in general modules (~15 instances)
- `src/components/control/ControlBOMs.tsx:173` — `h-8`.
- `src/components/control/ControlWorkflowDesigner.tsx:412,524,528,532,536` — `h-7`/`h-8`.
- `src/components/plan/PlanProductionTab.tsx` — ~15 buttons at `h-8`/`h-7`.
- `src/components/plan/PlanOverviewTab.tsx:186,554,673,683,686` — `h-6`/`h-8`.

#### HIGH — Make/Ship buttons under h-14 (56px) (~25 instances)
- `src/components/make/MakeManufacturingOrderDetail.tsx:388,448,549` — `h-10`.
- `src/components/make/MakeManufacturingOrderDetail.tsx:772,778,782` — `h-12`.
- `src/components/ship/ShipReturns.tsx:55,172,177,181` — `h-10`/`h-11`.
- `src/components/ship/ShipReports.tsx:73,76` — `h-10`.
- `src/components/ship/ShipTracking.tsx:154,157` — `h-11`.
- `src/components/ship/ShipWarehouse.tsx:104,150` — `h-10`.
- `src/components/ship/ShipOrders.tsx:197,200` — `h-12`.
- `src/components/ship/ShipShipping.tsx:145` — `h-12`.

#### HIGH — Non-yellow primary buttons
- `src/components/shop-floor/issues/IssueModals.tsx:123` — `bg-black`. Should be: MW Yellow.
- `src/components/shop-floor/issues/IssueModals.tsx:210` — `bg-red-600`. Should be: destructive with `--mw-error`.
- `src/components/shop-floor/issues/IssueModals.tsx:284` — `bg-purple-600`. Should be: MW Yellow.
- `src/components/shop-floor/issues/IssueModals.tsx:342` — `bg-[var(--neutral-900)]`. Should be: MW Yellow.
- `src/components/shop-floor/IssuesTab.tsx:328` — `bg-[var(--mw-purple)]`. Should be: MW Yellow.

---

### 7. Elevation & Shadow Violations

#### HIGH — Shadows on dark (Mirage) cards
- `src/components/book/StockValuation.tsx:103` — `shadow-xs` on `bg-[var(--mw-mirage)]` Card. Should be: no shadow.
- `src/components/shop-floor/IssuesTab.tsx:207` — `shadow-md` on dark play button. Should be: no shadow.
- `src/components/shop-floor/VoiceInterfaceMobile.tsx:81` — `shadow-lg` on dark icon. Should be: no shadow.

#### MEDIUM — shadow-md on resting cards (should be shadow-xs)
- `src/components/shop-floor/QualityTab.tsx:241,253,265,282,344,369,465,482` — 8 instances of `shadow-md` on resting cards.
- `src/components/shop-floor/IssuesTab.tsx:168,194,328` — 3 instances.
- `src/components/shop-floor/WorkOrderFullScreen.tsx:166` — `shadow-xl` on action button.
- `src/components/shop-floor/IntelligenceHubTab.tsx:459` — `shadow-xl` on mic button.
- `src/components/shop-floor/QualityTab.tsx:503` — `shadow-2xl` on inline panel.

---

### 8. Icon Violations

All icons use Lucide React (compliant). No non-Lucide imports found.

#### HIGH — Missing strokeWidth={1.5}
- `src/components/sell/SellDashboard.tsx:609` — `<Trophy strokeWidth={2} />`. Should be: `strokeWidth={1.5}`.

#### HIGH — Hand-rolled icon containers → IconWell (11 instances)
- `src/components/plan/PlanBudgetTab.tsx:162,185,242,262` — 4 hand-rolled icon wells.
- `src/components/control/ControlWorkflowDesigner.tsx:507` — Hand-rolled icon well.
- `src/components/control/ControlLocations.tsx:120` — Hand-rolled icon well.
- `src/components/plan/PlanNCConnect.tsx:177` — Hand-rolled icon well.
- `src/components/plan/PlanIntelligenceHubTab.tsx:385` — Hand-rolled icon well.
- `src/components/make/MakeManufacturingOrderDetail.tsx:564` — Hand-rolled icon well.
- `src/components/sell/SellDashboard.tsx:657` — Hand-rolled icon well.
- `src/components/shared/ai/IntelligenceHub.tsx:57` — Hand-rolled icon well.

---

### 9. Motion & Interaction Violations

#### MEDIUM — opacity-50 disabled states (should use M3 split)
- `src/components/bridge/BridgeSegmentedActions.tsx:90` — `opacity-50 pointer-events-none`.
- `src/components/bridge/FileUploadZone.tsx:53` — `opacity-50 cursor-not-allowed`.
- `src/components/shop-floor/WorkOrderFullScreen.tsx:386` — `opacity-50`.
- `src/components/shop-floor/TimeClockTab.tsx:244` — `opacity-50 cursor-not-allowed`.
- `src/components/shop-floor/MaterialsModal.tsx:1654` — `opacity-50` on button.

#### MEDIUM — Sidebar hardcoded motion values
- `src/components/Sidebar.tsx:182-183` — `600ms` duration exceeds `--duration-long2` (550ms). Non-M3 easing curve.
- `src/components/Sidebar.tsx` — 9 transitions use `duration-300` and non-standard easing.

#### LOW — Hidden scrollbars in shop-floor
- `src/components/shop-floor/IssuesTab.tsx:240,282,291`, `WorkOrderFullScreen.tsx:145,384`, `IntelligenceHubTab.tsx:355,363`, `OverviewTab.tsx:563,617`, `WorkTab.tsx:157`.

---

### 10. Chart & Data Visualisation Violations

#### HIGH — Missing contentStyle={MW_TOOLTIP_STYLE} on <Tooltip> (~25 instances)
- `src/components/buy/BuyDashboard.tsx:195,223`, `buy/BuyReports.tsx:76,90`
- `src/components/ship/ShipReturns.tsx:110`, `ship/ShipDashboard.tsx:140`, `ship/ShipReports.tsx` (6 tooltips)
- `src/components/book/JobCostDetail.tsx:160,182`, `book/StockValuation.tsx:118,133`, `book/JobProfitability.tsx:123,138`
- `src/components/sell/SellProductDetail.tsx:282`, `sell/SellDashboard.tsx` (4 tooltips)
- `src/components/plan/PlanDashboard.tsx:280`, `plan/PlanBudgetTab.tsx:464`
- `src/components/shared/dashboard/DashboardWidgetGrid.tsx` (5 tooltips)
- `src/components/book/BudgetOverview.tsx:609`

#### HIGH — Missing {…MW_RECHARTS_ANIMATION} spread (~15 instances)
- `src/components/shared/dashboard/DashboardWidgetGrid.tsx` — 5 chart elements.
- `src/components/book/JobCostDetail.tsx:157,183-184` — Pie + Area elements.
- `src/components/sell/SellProductDetail.tsx:283` — Area element.
- `src/components/book/StockValuation.tsx:119-121,130` — Area + Pie elements.
- `src/components/plan/PlanBudgetTab.tsx:471-488` — Area elements.
- `src/components/ship/ShipReports.tsx:92,107,183` — Line elements.

---

### 11. Table Violations
See Section 1 (Shared Component Usage) for the complete list of 50 raw `<table>` elements.

---

### 12. Touch Target Violations

#### HIGH — Shop-floor modules (make/ship/shop-floor) below 56px (~55 instances)
See detailed listings in Section 6 (Button Violations) and the full touch target audit. Key areas:
- `src/components/shop-floor/QualityTab.tsx` — 13 undersized elements.
- `src/components/shop-floor/OverviewTab.tsx` — 8 undersized elements.
- `src/components/ship/ShipShipping.tsx` — 4 undersized elements.
- `src/components/make/MakeManufacturingOrderDetail.tsx` — 9 undersized elements.

#### MEDIUM — General modules below 40px (~18 instances)
- ControlBOMs, ControlWorkflowDesigner, PlanProductionTab, PlanOverviewTab, PlanDashboard, SellProductDetail, SellSettings, SellNewInvoice, ControlGamification.

#### LOW — Sidebar sub-menu items
- `src/components/Sidebar.tsx:458` — Sub-menu items at 34px. Should be: 48px.

---

### 13. Status Colour Violations

#### HIGH — Default Tailwind colours instead of design tokens (12 instances)
- `src/components/shop-floor/QualityTab.tsx:162,164,172,347,529` — `bg-green-*`/`bg-red-*` → `var(--mw-success/error)`.
- `src/components/shop-floor/TimeClockTab.tsx:200-201,229` — green/red Tailwind → tokens.
- `src/components/sell/SellActivities.tsx:155,186` — green/red Tailwind → tokens.
- `src/components/shared/calendar/EventDetailSheet.tsx:57,67,73` — green/red Tailwind → tokens.

---

### 14. Overlay & Glass Violations

#### HIGH
- `src/components/shop-floor/QualityTab.tsx:502` — `bg-black/50`. Should be: `bg-black/20 backdrop-blur-sm`.

#### MEDIUM — Dialog content missing frosted glass (5 instances)
- `src/components/shop-floor/IssuesTab.tsx:344`, `DefectReportModal.tsx:24`, `CadFileModal.tsx:147`, `MaterialsModal.tsx:1745`, `control/people/InviteUserDialog.tsx:67` — DialogContent uses opaque `bg-white`. Should be: `bg-white/95 backdrop-blur-xl`.

#### MEDIUM — Frosted glass on non-overlay elements (3 instances)
- `src/components/shop-floor/WorkOrderFullScreen.tsx:278,288,321` — Frosted glass applied to inline elements.

---

### 15. Miscellaneous

#### HIGH — Gradients (flat colours only)
- `src/components/sell/SellProducts.tsx:91` — `bg-gradient-to-br`. Should be: flat `bg-[var(--neutral-100)]`.
- `src/components/shared/ai/AISuggestion.tsx:39` — `bg-gradient-to-br` on AI avatar. Should be: flat yellow.
- `src/components/control/WorkflowCanvas.tsx:314` — `bg-gradient-to-br from-purple to-pink`. Should be: flat colour.
- `src/components/shop-floor/VoiceInterfaceMobile.tsx:136` — `bg-gradient-to-t`. Should be: flat colour.

#### MEDIUM — Coloured card backgrounds (6 instances)
- `src/components/shop-floor/IssuesTab.tsx:322` — `bg-[var(--mw-purple-50)]` card bg.
- `src/components/shop-floor/issues/IssueModals.tsx:109,196,271` — `bg-blue-50`, `bg-orange-50`, `bg-purple-50` callouts.
- `src/components/bridge/steps/StepFileUpload.tsx:75` — `bg-blue-50` callout.
- `src/components/bridge/steps/StepScopeQuestions.tsx:171` — `bg-blue-50` callout.

#### LOW — Deprecated tokens still in globals.css
- `--mw-purple` scale (lines 97-101) — same hex as deprecated `--mw-ai-purple`.
- `--mw-green` legacy scale (lines 92-94) — should use `--mw-success`.

---

### Foundation File Audit

#### Token Consistency (globals.css vs design-system.ts)
- **PASS** — MW Yellow, Neutral, Status colours, Shape scale, Easing, Duration all match.
- **MEDIUM** — Elevation mismatch: globals.css has 5 levels (1-5), design-system.ts `shadows` skips level 2.
- **MEDIUM** — `componentClasses` in design-system.ts uses hardcoded hex instead of CSS variables.

#### Tailwind Config
- **PASS** — No `tailwind.config.ts`. Uses Tailwind v4 `@theme inline` in globals.css.
- **PASS** — borderRadius, colours, shadows, motion all correctly remapped to CSS variables.

#### VisualLanguage.md
- **PASS** — Consistent with DesignSystem.md v2.0. No contradictions. No outdated references.

---

## Recommended Fix Priority

### 1. Foundation Fixes (fix once, fix everywhere)
- Fix `button.tsx` defaults: radius `rounded-md`, sizes `h-12`/`h-10`/`h-14` → **resolves ~300+ button violations**
- Global `font-semibold` → `font-medium` replacement → **resolves 176 violations**

### 2. High-Impact Module Fixes
- Migrate 50 raw `<table>` elements to `MwDataTable`/`FinancialTable`
- Replace 87 Tailwind colour utilities with design tokens
- Add `contentStyle={MW_TOOLTIP_STYLE}` to all 25+ chart tooltips
- Wrap 18 charts in `ChartCard`

### 3. Shop-Floor Touch Target Remediation
- Increase all make/ship/shop-floor interactive elements to >= 56px

### 4. Cleanup Passes
- Replace ~70 `rounded-[8px]` with `rounded-sm`
- Replace ~25 `p-5` with `p-6` on cards
- Replace ~170 hardcoded hex with CSS variables
- Add `tabular-nums` to ~30 currency displays
- Remove 4 gradients
- Remove `dark:` dead code
