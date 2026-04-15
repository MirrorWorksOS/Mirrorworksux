# Prototype route map

Authoritative routing is defined in [`src/routes.tsx`](../../routes.tsx). This document lists **path → React component** for the UX prototype so §4 specs can be reconciled with the codebase.

**Last updated:** 1 April 2026

---

## App shell

| Route | Component | Notes |
| --- | --- | --- |
| `/` | `WelcomeDashboard` | Index route under `Layout` |
| `/dashboard` | `WelcomeDashboard` | Same as `/` |

---

## Sell

Base path: `/sell`

| Route | Component | Notes |
| --- | --- | --- |
| `/sell` | `SellDashboard` | Index (4 sub-tabs: Overview, Analysis, Reports, Forecasts) |
| `/sell/crm` | `SellCRM` | Card/List toggle |
| `/sell/crm/:id` | `SellCustomerDetail` | Dynamic `id` |
| `/sell/opportunities` | `SellOpportunities` | Kanban board |
| `/sell/opportunities/:id` | `SellOpportunityPage` | 4-tab JobWorkspaceLayout (Overview, Quotes, Activities, Intelligence Hub) |
| `/sell/orders` | `SellOrders` | |
| `/sell/orders/:id` | `SellOrderDetail` | 4-tab JobWorkspaceLayout (Overview, Line Items, Fulfilment, Documents) |
| `/sell/activities` | `SellActivities` | List + calendar (month / week / day) + New Activity dialog |
| `/sell/invoices` | `SellInvoices` | |
| `/sell/invoices/new` | `SellNewInvoice` | New invoice wizard (draft → detail id 8, issue → id 9) |
| `/sell/invoices/:id` | `SellInvoiceDetail` | Invoice workspace |
| `/sell/products` | `SellProducts` | |
| `/sell/products/:id` | `SellProductDetail` | 5-tab detail (Overview, Manufacturing, Inventory, Accounting, Documents) |
| `/sell/quotes` | `SellQuotes` | Quotes list |
| `/sell/quotes/new` | `SellNewQuote` | Quote builder |
| `/sell/settings` | `SellSettings` | 8 panels |

There is **no** `/sell/pipeline` route; pipeline-style work is covered by **Opportunities** and **CRM** in the prototype.

---

## Plan

Base path: `/plan`

| Route | Component | Notes |
| --- | --- | --- |
| `/plan` | `PlanDashboard` | Index |
| `/plan/jobs` | `PlanJobs` | Kanban/List/Card toggle |
| `/plan/jobs/:id` | `PlanJobDetail` | 5-tab JobWorkspaceLayout (Overview, Production, Schedule, Intelligence Hub, Budget) |
| `/plan/activities` | `PlanActivities` | |
| `/plan/schedule` | `PlanSchedule` | Cross-job schedule (Gantt/Calendar/List) |
| `/plan/nc-connect` | `PlanNCConnect` | NC file management, G-code viewer, machine status |
| `/plan/purchase` | `PlanPurchase` | |
| `/plan/qc-planning` | `PlanQCPlanning` | Sidebar label: "Quality" |
| `/plan/products` | `PlanProducts` | |
| `/plan/settings` | `PlanSettings` | |

---

## Make

Base path: `/make`

| Route | Component | Notes |
| --- | --- | --- |
| `/make` | `MakeDashboard` | Andon dashboard (5 KPIs, machine grid, quality alerts, schedule strip, quick actions) |
| `/make/schedule` | `MakeSchedule` | Gantt/Calendar/List views |
| `/make/shop-floor` | `MakeShopFloor` | 3 tabs (Overview with Floor Mode, Kanban, Work Orders) |
| `/make/manufacturing-orders` | `MakeManufacturingOrders` | MO list table |
| `/make/manufacturing-orders/:id` | `MakeManufacturingOrderDetail` | 5-tab JobWorkspaceLayout (Overview, Work, Issues, Intelligence Hub, Documents) |
| `/make/time-clock` | `MakeTimeClock` | Time tracking |
| `/make/quality` | `MakeQuality` | Quality checks |
| `/make/products` | `MakeProducts` | Product list |
| `/make/settings` | `MakeSettings` | |

The **Operator Execution View** (`WorkOrderFullScreen`) is a full-screen overlay accessed by clicking a work order row in MO Detail or Shop Floor — it is not a standalone route.

---

## Ship

Base path: `/ship`

| Route | Component | Notes |
| --- | --- | --- |
| `/ship` | `ShipDashboard` | Index |
| `/ship/orders` | `ShipOrders` | |
| `/ship/packaging` | `ShipPackaging` | |
| `/ship/shipping` | `ShipShipping` | |
| `/ship/tracking` | `ShipTracking` | |
| `/ship/returns` | `ShipReturns` | |
| `/ship/warehouse` | `ShipWarehouse` | |
| `/ship/reports` | `ShipReports` | |
| `/ship/settings` | `ShipSettings` | |

---

## Book

Base path: `/book`

| Route | Component | Notes |
| --- | --- | --- |
| `/book` | `BookDashboard` | Index |
| `/book/budget` | `BudgetOverview` | |
| `/book/invoices` | `BookInvoices` | |
| `/book/invoices/:id` | `InvoiceDetail` | Invoice detail view |
| `/book/expenses` | `ExpenseKanban` | |
| `/book/purchases` | `PurchaseOrders` | |
| `/book/job-costs` | `JobProfitability` | |
| `/book/job-costs/:id` | `JobCostDetail` | Job cost detail view |
| `/book/stock-valuation` | `StockValuation` | |
| `/book/reports` | `ReportsGallery` | |
| `/book/settings` | `BookSettings` | |

---

## Buy

Base path: `/buy`

| Route | Component | Notes |
| --- | --- | --- |
| `/buy` | `BuyDashboard` | Index |
| `/buy/orders` | `BuyOrders` | |
| `/buy/requisitions` | `BuyRequisitions` | |
| `/buy/receipts` | `BuyReceipts` | |
| `/buy/suppliers` | `BuySuppliers` | |
| `/buy/rfqs` | `BuyRFQs` | |
| `/buy/bills` | `BuyBills` | |
| `/buy/products` | `BuyProducts` | |
| `/buy/agreements` | `BuyAgreements` | |
| `/buy/reports` | `BuyReports` | |
| `/buy/settings` | `BuySettings` | |

---

## Control

Base path: `/control`

| Route | Component | Notes |
| --- | --- | --- |
| `/control` | `ControlDashboard` | Index |
| `/control/mirrorworks-bridge` | `BridgeWizard` | Data import wizard (PLAT 01) |
| `/control/factory-layout` | `ControlFactoryDesigner` | |
| `/control/process-builder` | `ControlProcessBuilder` | |
| `/control/locations` | `ControlLocations` | |
| `/control/machines` | `ControlMachines` | |
| `/control/inventory` | `ControlInventory` | |
| `/control/purchase` | `ControlPurchase` | |
| `/control/people` | `ControlPeople` | Users, groups, and permissions (ARCH 00) |
| `/control/products` | `ControlProducts` | |
| `/control/boms` | `ControlBOMs` | |
| `/control/workflow-designer` | `ControlWorkflowDesigner` | |

Control is inherently a settings/configuration module — no separate `/control/settings` route needed.

---

## Bridge (standalone)

| Route | Component | Notes |
| --- | --- | --- |
| `/bridge` | `BridgeWizard` | Standalone entry point for onboarding wizard |

---

## Legacy redirects (`/design`)

| Route | Behaviour |
| --- | --- |
| `/design` | Redirects to `/control/factory-layout` |
| `/design/factory-layout` | Redirects to `/control/factory-layout` |
| `/design/process-builder` | Redirects to `/control/process-builder` |
| `/design/initial-data` | Redirects to `/control/mirrorworks-bridge` |

---

## Catch-all

| Route | Notes |
| --- | --- |
| `*` | 404 placeholder (not a screen component) |
