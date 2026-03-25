# Prototype route map

Authoritative routing is defined in [`src/routes.tsx`](../../routes.tsx). This document lists **path → React component** for the UX prototype so §4 specs can be reconciled with the codebase.

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
| `/sell` | `SellDashboard` | Index |
| `/sell/crm` | `SellCRM` | |
| `/sell/crm/:id` | `SellCustomerDetail` | Dynamic `id` |
| `/sell/opportunities` | `SellOpportunities` | |
| `/sell/orders` | `SellOrders` | |
| `/sell/invoices` | `SellInvoices` | |
| `/sell/products` | `SellProducts` | |
| `/sell/products/:id` | `SellProductDetail` | Dynamic `id` |
| `/sell/quotes/new` | `SellNewQuote` | |
| `/sell/settings` | `SellSettings` | |

There is **no** `/sell/pipeline` route; pipeline-style work is covered by **Opportunities** and **CRM** in the prototype.

---

## Plan

Base path: `/plan`

| Route | Component | Notes |
| --- | --- | --- |
| `/plan` | `PlanDashboard` | Index |
| `/plan/jobs` | `PlanJobs` | |
| `/plan/activities` | `PlanActivities` | |
| `/plan/purchase` | `PlanPurchase` | |
| `/plan/qc-planning` | `PlanQCPlanning` | |
| `/plan/products` | `PlanProducts` | |
| `/plan/settings` | `PlanSettings` | |

---

## Make

Base path: `/make`

| Route | Component | Notes |
| --- | --- | --- |
| `/make` | `MakeDashboard` | Index (Andon / dashboard) |
| `/make/schedule` | `MakeSchedule` | |
| `/make/shop-floor` | `MakeShopFloor` | |
| `/make/work` | `MakeWork` | |
| `/make/issues` | `MakeIssues` | |
| `/make/settings` | `MakeSettings` | |

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
| `/book/expenses` | `ExpenseKanban` | |
| `/book/purchases` | `PurchaseOrders` | |
| `/book/job-costs` | `JobProfitability` | |
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
| `/control/mirrorworks-bridge` | `MirrorWorksBridge` | Data import wizard (PLAT 01) |
| `/control/factory-layout` | `ControlFactoryDesigner` | |
| `/control/process-builder` | `ControlProcessBuilder` | |
| `/control/locations` | `ControlLocations` | |
| `/control/machines` | `ControlMachines` | |
| `/control/inventory` | `ControlInventory` | |
| `/control/purchase` | `ControlPurchase` | |
| `/control/people` | `ControlPeople` | Groups, permissions (ARCH 00) |
| `/control/products` | `ControlProducts` | |
| `/control/boms` | `ControlBOMs` | |
| `/control/role-designer` | `ControlRoleDesigner` | |
| `/control/workflow-designer` | `ControlWorkflowDesigner` | |

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
