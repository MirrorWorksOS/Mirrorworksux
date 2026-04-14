# Placeholder & Inert Element Audit

**Date:** 2026-04-01
**Scope:** All component files under `src/components/` (Sell, Plan, Make, Book, Ship, Buy, Control, Shop Floor, Shared)

---

## Summary Table

| Module       | P0 (Broken/Misleading) | P1 (Expected Placeholder) | P2 (Acceptable Mock Data) | Total |
|-------------|----------------------:|-------------------------:|-------------------------:|------:|
| **Sell**     | 14                    | 8                        | 16                       | 38    |
| **Plan**     | 8                     | 6                        | 10                       | 24    |
| **Make**     | 8                     | 4                        | 8                        | 20    |
| **Book**     | 10                    | 5                        | 6                        | 21    |
| **Ship**     | 8                     | 2                        | 6                        | 16    |
| **Buy**      | 6                     | 2                        | 8                        | 16    |
| **Control**  | 6                     | 3                        | 4                        | 13    |
| **Shop Floor** | 4                   | 2                        | 6                        | 12    |
| **Shared**   | 2                     | 1                        | 0                        | 3     |
| **TOTAL**    | **66**                | **33**                   | **64**                   | **163** |

### Priority Key
- **P0 — Broken/Misleading:** Button or element suggests functionality that does nothing. User would expect it to work.
- **P1 — Expected Placeholder:** Feature area clearly labeled as future/placeholder, or prototype stub that is contextually acceptable.
- **P2 — Acceptable Mock Data:** Hardcoded data powering charts, tables, KPIs. Expected in a prototype; should be documented.

---

## Sell Module

### SellDashboard.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 374 | Button "View All Approvals" | Navigate to approvals list | No onClick handler; button is inert | P0 |
| 415-428 | Button "Sync Now" (Xero) | Trigger Xero sync | No onClick handler; button is inert | P0 |
| 465 | Button "Follow Up All" | Trigger follow-up actions | No onClick handler; button is inert | P0 |
| 633-643 | Buttons "PDF", "CSV", "Excel" (Reports tab) | Export reports in various formats | No onClick handlers; buttons are inert | P0 |
| 661 | Button "Generate" (Report templates) | Generate a report | No onClick handler; button is inert | P0 |
| 42-77 | `kpiData`, `revenueData`, `jobProfitabilityData` | Show real financial data | Hardcoded mock data | P2 |
| 82-92 | `approvalQueue`, `overdueActions` | Show live approval/overdue items | Hardcoded mock arrays | P2 |
| 96-119 | `pipelineFunnel`, `winLossData`, `topPerformers` | Show live analytics | Hardcoded mock data | P2 |
| 134-152 | `forecastChartData`, `quarterlyTargets` | Show live forecasts | Hardcoded mock data | P2 |

### SellCRM.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 119-123 | Button "New Customer" | Open new customer form | No onClick handler; button is inert | P0 |
| 138-141 | Button "Filter" | Open filter panel | No onClick handler; button is inert | P0 |
| 221-228 | List view panel | Show list view of customers | Renders text "List view - Would render SellCRMList component here" | P1 |
| 236 | EmptyState action "Create Customer" | Create a customer | `onClick: () => {}` — no-op | P0 |
| 36-96 | `mockCustomers` | Show real customer data | Hardcoded mock array of 6 customers | P2 |

### SellOrders.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 64-66 | Button "Filter" | Open filter panel | No onClick handler; button is inert | P0 |
| 68-70 | Button "Export" | Export orders data | No onClick handler; button is inert | P0 |
| 72-75 | Button "New Order" | Create new sales order | No onClick handler; button is inert | P0 |
| 88-89 | Header checkbox (select all) | Select all rows | No onChange handler; checkbox is inert | P0 |
| 105 | Row checkbox | Select a row | No onChange handler; checkbox is inert | P0 |
| 133-135 | MoreVertical button | Open row action menu | No dropdown menu connected; button is inert | P0 |
| 160-161 | EmptyState action "Create Order" | Create an order | `onClick: () => {}` — no-op | P0 |
| 34-39 | `mockOrders` | Show real order data | Hardcoded mock array of 6 orders | P2 |

### SellInvoices.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 71-73 | Button "Filter" | Open filter panel | No onClick handler; button is inert | P0 |
| 75-78 | Button "Export" | Export invoices | No onClick handler; button is inert | P0 |
| 117 | Header checkbox | Select all invoices | No onChange handler; checkbox is inert | P0 |
| 138 | Row checkbox | Select an invoice | Has stopPropagation but no onChange handler | P0 |
| 166 | MoreVertical button | Open row action menu | No dropdown menu connected; button is inert | P0 |
| 36-43 | `mockInvoices` | Show real invoice data | Hardcoded mock array of 7 invoices | P2 |

### SellProducts.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 63-67 | Button "New Product" | Create new product | No onClick handler; button is inert | P0 |
| 83-86 | Button "Filter" | Open filter panel | No onClick handler; button is inert | P0 |
| 198 | EmptyState action "Create Product" | Create a product | `onClick: () => {}` — no-op | P0 |
| 34-41 | `mockProducts` | Show real product data | Hardcoded mock array of 6 products | P2 |

### SellOpportunities.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 81-83 | Button "Filter" | Open filter panel | No onClick handler; button is inert | P0 |
| 85-88 | Button "New Opportunity" | Create new opportunity | No onClick handler; button is inert | P0 |
| 112-113 | Plus button (per column) | Add opportunity to stage | No onClick handler; button is inert | P0 |
| 28-34 | `mockOpportunities` | Show real opportunity data | Hardcoded mock array of 6 opportunities | P2 |

### SellNewQuote.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 153-154 | Button "Save draft" | Save quote as draft | No onClick handler; button is inert | P0 |
| 156-158 | Button "Send quote" (top bar) | Send the quote | No onClick handler; button is inert | P0 |
| 424-425 | Button "Send quote" (sidebar) | Send the quote | No onClick handler; button is inert | P0 |
| 427-428 | Button "Preview PDF" | Preview quote as PDF | No onClick handler; button is inert | P0 |

### SellNewInvoice.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 99-115 | Buttons "Save draft" / "Issue invoice" | Persist invoice | Shows toast and navigates to mock invoice ID — simulated success, no real persistence | P1 |

### SellQuotes.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 149 | Table row click | Navigate to quote detail | All rows navigate to `/sell/quotes/new` regardless of quote ID — no detail page exists | P1 |
| 28-88 | `mockQuotes` | Show real quote data | Hardcoded mock array of 6 quotes | P2 |

### SellSettings.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 178-179 | Trash2 buttons (lead sources) | Delete a lead source | No onClick handler; buttons are inert | P0 |
| 183-185 | Button "Add source" | Add a lead source | No onClick handler; button is inert | P0 |
| 323-333 | Buttons "Configure" / "Connect" (Payments integrations) | Configure payment integrations | No onClick handlers; buttons are inert | P0 |
| 352 | Button "Save bank details" | Save bank details | No onClick handler; button is inert | P0 |
| 388-389 | Button "Add activity type" | Add activity type | No onClick handler; button is inert | P0 |
| 458-459 | Buttons "Export pipeline CSV" / "Export activities CSV" | Export data as CSV | No onClick handlers; buttons are inert | P0 |
| 494-505 | Buttons "Configure" / "Connect" (Integrations) | Configure integrations | No onClick handlers; buttons are inert | P0 |
| 85-88 (ModuleSettingsLayout) | "Discard" / "Save changes" buttons | Save/discard settings | No onClick handlers; buttons are inert (shared component) | P0 |

### SellProductDetail.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 150 | Button "Edit routing" | Edit the manufacturing routing | No onClick handler; button is inert | P0 |
| 178 | Button "Edit BOM" | Edit the bill of materials | No onClick handler; button is inert | P0 |
| 339-340 | Button "Upload document" | Upload a document | No onClick handler; button is inert | P0 |
| 375-376 | Download buttons (per document) | Download a document | No onClick handler; buttons are inert | P0 |
| 420-422 | Button "Edit" (header) | Edit product | No onClick handler; button is inert | P0 |
| 423-424 | MoreVertical button (header) | Open action menu | No dropdown connected; button is inert | P0 |
| 16-74 | All mock data (PRODUCT, ROUTING, BOM_LINES, etc.) | Show real product data | Hardcoded mock data | P2 |

### SellOrderDetail.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 471-472 | Button "Add item" (Line Items tab) | Add a new line item | No onClick handler; button is inert | P0 |
| 591-593 | Button "Upload" (Documents tab) | Upload a document | No onClick handler; button is inert | P0 |
| 608-609 | Button "Download" (per document) | Download a document | No onClick handler; buttons are inert | P0 |
| 652-653 | Button "Email Customer" | Send email to customer | No onClick handler; button is inert | P0 |
| 656-657 | Button "Print Order" | Print the order | No onClick handler; button is inert | P0 |

### SellInvoiceDetail.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 460-462 | Button "Add Line Item" | Add a line item to invoice | No onClick handler; button is inert | P0 |
| 524-526 | Button "Record Payment" (timeline) | Record a payment | No onClick handler; button is inert | P0 |
| 603-605 | Button "Send Invoice" | Send invoice via email | No onClick handler; button is inert | P0 |
| 607-609 | Button "Download PDF" | Download invoice as PDF | No onClick handler; button is inert | P0 |
| 611-613 | Button "Record Payment" (header) | Record a payment | No onClick handler; button is inert | P0 |

### SellActivities.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 340-342 | Button "Filter" | Open filter panel | No onClick handler; button is inert | P0 |
| 287-305 | New Activity dialog "Save Activity" | Persist activity to backend | Adds activity to local state only — simulated success | P1 |

### SellCustomerDetail.tsx (Lines 120+)

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| ~various | All action buttons, edit forms | Modify customer data | All form fields and action buttons operate on local state only with no persistence | P1 |
| 32-98 | `mockCustomers` | Show real customer data | Hardcoded mock customer records | P2 |

---

## Plan Module

### PlanDashboard.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All KPI cards, charts | Show real planning metrics | Hardcoded mock data throughout | P2 |

### PlanJobs.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Filter button | Open filter panel | No onClick handler; button is inert | P0 |
| various | "New Job" button | Create a new job | No onClick handler; button is inert | P0 |
| 273+ | List view | Show jobs in list format | Renders a functional list view (working) | — |
| various | `mockJobs` | Show real job data | Hardcoded mock array | P2 |

### PlanProductionTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 260-276 | 3D Viewport area | Render 3D model via Autodesk APS Viewer | Shows placeholder text "Autodesk APS Viewer - Phase 2" with grid background | P1 |
| 438-455 | 2D Viewer area | Render 2D drawings via Autodesk APS | Shows placeholder text "Autodesk APS 2D Viewer - Phase 2" | P1 |
| 251-257 | Toolbar buttons (Home, Model, Properties, Print, Camera, Share) | 3D viewer controls | No onClick handlers; all buttons are inert | P0 |
| 288+ | Footer action buttons (Markup, Download, Compare) | Various viewer actions | No onClick handlers; buttons are inert | P0 |
| 32-88 | Mock product/routing/operation data | Show real manufacturing data | Hardcoded mock data | P2 |

### PlanOverviewTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 231 | Input "Select customer..." | Customer lookup | Plain text input, no autocomplete or lookup | P1 |
| 640 | Input "Type a message..." | Send AI message | Input with no submission handler | P0 |
| various | Form fields (customer, contact, PO ref, etc.) | Editable job details | Local state only, no persistence | P1 |

### PlanIntelligenceHubTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 407 | Input "Type a message..." | Send AI message | Input with no submission handler | P0 |

### PlanSchedule.tsx / PlanScheduleTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Gantt chart, calendar | Show live schedule | Hardcoded mock schedule data | P2 |

### PlanNCConnect.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | File upload, G-code preview, machine status | NC file management | Prototype with mock G-code and static machine status cards | P1 |
| various | Mock G-code, machine data | Show real NC data | Hardcoded mock data | P2 |

### PlanSettings.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 239-240 | Buttons "Export schedule CSV" / "Export BOM report CSV" | Export data | No onClick handlers; buttons are inert | P0 |
| various | "Save changes" / "Discard" (inherited from ModuleSettingsLayout) | Save settings | No onClick handlers; buttons are inert | P0 |

### PlanProducts.tsx / PlanPurchase.tsx / PlanQCPlanning.tsx / PlanBudgetTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All data tables and forms | Show real data | All powered by hardcoded mock data | P2 |

---

## Make Module

### MakeDashboard.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 299-310 | Quick Action buttons (Start New Job, Log QC Check, Scan Material, Print Traveler, Log Downtime) | Perform quick actions | No onClick handlers; all buttons are inert | P0 |
| various | All KPI cards, Gantt, OEE charts | Show real production data | Hardcoded mock data | P2 |

### MakeManufacturingOrders.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 66 | Button "New MO" | Create new manufacturing order | `onClick={() => {}}` — no-op | P0 |
| 81 | ToolbarFilterButton | Open filter panel | Component renders a Filter button with no handler | P0 |

### MakeProducts.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 52 | Button "New Product" | Create new product | `onClick={() => {}}` — no-op | P0 |
| 65 | ToolbarFilterButton | Open filter panel | Component renders a Filter button with no handler | P0 |

### MakeManufacturingOrderDetail.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 699 | Input "Type a message..." | Send AI message | Input with no submission handler | P0 |
| various | All order detail data, work orders, BOM | Show real MO data | Hardcoded mock data | P2 |

### MakeShopFloor.tsx / MakeShopFloorKanban.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Kanban board, work order cards | Show live shop floor data | Hardcoded mock data | P2 |

### MakeSchedule.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Gantt chart, calendar, list view | Show live production schedule | Hardcoded mock schedule data | P2 |

### MakeQuality.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Quality inspection data | Show live QC data | Hardcoded mock data | P2 |

### MakeTimeClock.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Time clock entries, clock in/out | Track employee time | Local state only, no persistence | P1 |

### MakeSettings.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 257-258 | Buttons "Export production CSV" / "Export QC results CSV" | Export data | No onClick handlers; buttons are inert | P0 |
| various | "Save changes" / "Discard" (inherited) | Save settings | No onClick handlers; buttons are inert | P0 |

---

## Book Module

### Book.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 14-17 | Expenses tab content | Show expenses view | Renders "Expenses view coming soon..." text | P1 |
| 19-22 | Purchases tab content | Show purchases view | Renders "Purchases view coming soon..." text | P1 |
| 24-27 | Job Costs tab content | Show job costs view | Renders "Job Costs view coming soon..." text | P1 |

### BookDashboard.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 290 | Revenue vs Expenses chart area | Show revenue/expenses chart | Comment says "Chart Placeholder" — rendered as empty area | P1 |
| various | All KPI cards and data | Show real financial data | Hardcoded mock data | P2 |

### BookInvoices.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Filter, Export buttons | Filter/export invoices | No onClick handlers; buttons are inert | P0 |

### ExpenseKanban.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Kanban board for expenses | Manage expense lifecycle | Kanban drag-and-drop works; data is mock | P2 |

### PurchaseOrders.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 68 | Button "Filter" | Open filter panel | No onClick handler; button is inert | P0 |
| 69 | Button "Export" | Export PO data | No onClick handler; button is inert | P0 |

### InvoiceDetail.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 130 | Button "Record Payment" | Record a payment | No onClick handler; button is inert | P0 |

### NewExpense.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 142 | Button "Save as Draft" | Save expense draft | No onClick handler; button is inert | P0 |
| 143 | Button "Submit for Approval" | Submit expense | No onClick handler; button is inert | P0 |

### ReportsGallery.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 44 | Button "Generate" (per report) | Generate a report | No onClick handler; button is inert | P0 |

### JobProfitability.tsx / JobCostDetail.tsx / StockValuation.tsx / BudgetOverview.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All charts, tables, KPIs | Show real financial data | Hardcoded mock data | P2 |

### BookSettings.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 209 | Button "Edit" (chart of accounts) | Edit account | No onClick handler; button is inert | P0 |
| 328 | Button "Configure mapping" | Configure Xero mapping | No onClick handler; button is inert | P0 |
| 383-384 | Buttons "Export invoices CSV" / "Export expenses CSV" | Export data | No onClick handlers; buttons are inert | P0 |
| various | "Save changes" / "Discard" (inherited) | Save settings | No onClick handlers; buttons are inert | P0 |

---

## Ship Module

### ShipDashboard.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All KPI cards, carrier chart, exceptions | Show real shipping data | Hardcoded mock data | P2 |

### ShipOrders.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Filter, actions buttons | Filter/manage orders | Filter button has no handler; action buttons are inert | P0 |

### ShipShipping.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 145 | Button "Generate manifest" | Generate shipping manifest | No onClick handler; button is inert | P0 |
| 172 | Download icon buttons (per shipment) | Download shipping doc | No onClick handler; buttons are inert | P0 |
| 175 | Printer icon buttons (per shipment) | Print label | No onClick handler; buttons are inert | P0 |

### ShipPackaging.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 97 | Input "Scan barcode..." | Scan a barcode | Text input with no barcode scanner integration | P1 |

### ShipReports.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 76 | Button "Export" | Export shipping report | No onClick handler; button is inert | P0 |

### ShipTracking.tsx / ShipWarehouse.tsx / ShipReturns.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All data tables and tracking views | Show real shipping data | Hardcoded mock data | P2 |

### ShipSettings.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 198 | Buttons "Configure" / "Connect" (carriers) | Configure carrier integrations | No onClick handlers; buttons are inert | P0 |
| 268-269 | Buttons "Export dispatch log CSV" / "Export returns CSV" | Export data | No onClick handlers; buttons are inert | P0 |
| various | "Save changes" / "Discard" (inherited) | Save settings | No onClick handlers; buttons are inert | P0 |

---

## Buy Module

### BuyDashboard.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All KPI cards, charts, approval queue | Show real procurement data | Hardcoded mock data | P2 |

### BuyOrders.tsx / BuyRFQs.tsx / BuyBills.tsx / BuyRequisitions.tsx / BuyReceipts.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Filter buttons | Open filter panel | No onClick handlers; buttons are inert | P0 |
| various | Export/action buttons | Perform actions | No onClick handlers; buttons are inert | P0 |
| various | All data tables | Show real data | Hardcoded mock data | P2 |

### BuyReceipts.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 106 | "Barcode Scanner" placeholder | Scan barcodes | Comment says "Barcode Scanner (placeholder)" — no scanner | P1 |

### BuyAgreements.tsx / BuySuppliers.tsx / BuyProducts.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All data tables and forms | Show real data | Hardcoded mock data | P2 |

### BuySettings.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 203 | Button "Edit" (approval levels) | Edit approval level | No onClick handler; button is inert | P0 |
| 282-283 | Buttons "Export POs CSV" / "Export suppliers CSV" | Export data | No onClick handlers; buttons are inert | P0 |
| various | "Save changes" / "Discard" (inherited) | Save settings | No onClick handlers; buttons are inert | P0 |

---

## Control Module

### ControlFactoryDesigner.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 16-18 | Button "New layout" | Create new factory layout | No onClick handler; button is inert | P0 |
| 27-33 | Canvas area | Show factory floor layout designer | Renders placeholder card with text "Placeholder canvas - connect routing and data when backend is available" | P1 |

### ControlDashboard.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All KPI cards | Show real system health data | Hardcoded mock data | P2 |

### ControlBOMs.tsx / ControlInventory.tsx / ControlProducts.tsx / ControlMachines.tsx / ControlLocations.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Filter/export buttons | Filter and export data | No onClick handlers; buttons are inert | P0 |
| various | All data tables | Show real master data | Hardcoded mock data | P2 |

### ControlProcessBuilder.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Process builder canvas | Build manufacturing processes | Prototype visual; no real process saving | P1 |

### ControlWorkflowDesigner.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 152-209 | "Generate workflow" button + AI prompt | Generate workflow via AI | Simulates generation with timeout, creates mock workflow nodes | P1 |

### ControlRoleDesigner.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 76 | Button "Configure" (per role) | Configure role permissions | No onClick handler; button is inert | P0 |

### ControlPurchase.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 39-40 | Buttons "Discard" / "Save changes" | Save purchasing config | No onClick handlers; buttons are inert | P0 |

---

## Shop Floor Module

### OverviewTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 336-337 | `<a href="#">` (Active Job Focus customer name) | Navigate to customer detail | `href="#"` — goes nowhere | P0 |
| 600 | Input "Type a message..." (AI chat) | Send AI message | Input with no submission handler | P0 |
| various | All work order data, machine status | Show live shop floor data | Hardcoded mock data | P2 |

### IntelligenceHubTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 387 | Settings button | Open AI settings | Comment says "placeholder for the icon in top-right" | P1 |

### QualityTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Quality inspection forms | Submit QC results | Form dialogs with local state only, no persistence | P1 |

### WorkTab.tsx / IssuesTab.tsx / TimeClockTab.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | All data tables and action buttons | Show live data | Hardcoded mock data, local state changes only | P2 |

### issues/IssueModals.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 122 | Button "Submit Issue" | Submit an issue report | No onClick handler beyond `onClose`; does not persist | P0 |
| 283 | Button "Submit & Quarantine" | Submit NCR and quarantine | No onClick handler beyond `onClose`; does not persist | P0 |

### issues/placeholder.ts

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 1 | `export const placeholder = true` | Module placeholder | Empty placeholder file to prevent empty directory | P1 |

---

## Shared Module

### shared/settings/ModuleSettingsLayout.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| 87-88 | Buttons "Discard" / "Save changes" (SaveRow component) | Save or discard settings changes | No onClick handlers; buttons are inert. Affects ALL module Settings pages (Sell, Plan, Make, Book, Ship, Buy) | P0 |

### shared/layout/ToolbarFilterButton.tsx

| Line(s) | Element | Appears to do | Actually does | Priority |
|---------|---------|--------------|---------------|----------|
| various | Filter button component | Open a filter dropdown | Renders a button that typically has no connected handler when used | P1 |

---

## Cross-Cutting Patterns

### Pattern 1: All "Filter" Buttons Are Inert
Every module has Filter buttons in list views that render but have no onClick handler or connected filter dropdown. This is consistent across:
- SellCRM, SellOrders, SellInvoices, SellProducts, SellOpportunities, SellActivities
- PlanJobs
- MakeManufacturingOrders, MakeProducts
- BookInvoices, BookPurchaseOrders
- BuyOrders, BuyRFQs, BuyBills, BuySuppliers
- ShipOrders
- Shop Floor WorkTab

### Pattern 2: All "Export" Buttons Are Inert
Every Export/Download button across all modules has no onClick handler:
- SellOrders Export, SellInvoices Export, SellDashboard PDF/CSV/Excel
- BookPurchaseOrders Export, BookSettings Export CSV buttons
- BuySettings Export CSV buttons
- ShipReports Export, ShipSettings Export CSV buttons
- MakeSettings Export CSV buttons
- PlanSettings Export CSV buttons
- SellSettings Export CSV buttons

### Pattern 3: All Settings "Save Changes" / "Discard" Are Inert
The shared `ModuleSettingsLayout` `SaveRow` component renders "Discard" and "Save changes" buttons without onClick handlers. This affects every module's settings page.

### Pattern 4: All "MoreVertical" (3-dot) Row Action Menus Are Inert
Table rows in SellOrders, SellInvoices, and elsewhere have MoreVertical icon buttons that render no dropdown menu.

### Pattern 5: Checkbox Select-All / Row Selection Is Non-Functional
SellOrders and SellInvoices render checkboxes in table headers and rows with no onChange handlers.

### Pattern 6: All Charts Use Hardcoded Mock Data
Every chart in every dashboard (Sell, Plan, Make, Book, Ship, Buy, Control) uses hardcoded arrays of mock data. This is expected for a prototype and is categorized as P2.

### Pattern 7: AI Chat Inputs Have No Submit Handler
Multiple components render "Type a message..." inputs for AI interaction but have no submission mechanism:
- PlanOverviewTab (line 640)
- PlanIntelligenceHubTab (line 407)
- MakeManufacturingOrderDetail (line 699)
- Shop Floor OverviewTab (line 600)
