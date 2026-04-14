# Book

## Purpose
Finance and costing workflows including invoices, expenses, purchasing impact, job costing, and reporting.

## Primary Users
Finance users, operations finance leads, and business owners.

## Key Workflows
- Enter Book from sidebar/main nav and review status indicators.
- Move between list pages and detail pages to progress work.
- Execute module-specific configuration/setup from settings or control pages.

## Main Routes/Pages
- [Book Dashboard](./dashboard.md) — `/book`
- [Budget Overview](./budget.md) — `/book/budget`
- [Invoices](./invoices.md) — `/book/invoices`
- [Invoice Detail](./invoice-detail.md) — `/book/invoices/:id`
- [Expenses](./expenses.md) — `/book/expenses`
- [Purchase Orders](./purchases.md) — `/book/purchases`
- [Job Profitability](./job-costs.md) — `/book/job-costs`
- [Job Cost Detail](./job-cost-detail.md) — `/book/job-costs/:id`
- [WIP Valuation](./wip.md) — `/book/wip`
- [Cost Variance](./cost-variance.md) — `/book/cost-variance`
- [Stock Valuation](./stock-valuation.md) — `/book/stock-valuation`
- [Reports Gallery](./reports.md) — `/book/reports`
- [Book Settings](./settings.md) — `/book/settings`

## Core Entities Used
- Entity shapes are defined by routed pages and shared mocks/services/stores in this module.
- Several pages still use seed/mock datasets; treat production contract details as inferred unless verified in services/contracts.

## Important Components
- `apps/web/src/components/book/BookDashboard.tsx`
- `apps/web/src/components/book/BudgetOverview.tsx`
- `apps/web/src/components/book/BookInvoices.tsx`
- `apps/web/src/components/book/InvoiceDetail.tsx`
- `apps/web/src/components/book/ExpenseKanban.tsx`
- `apps/web/src/components/book/PurchaseOrders.tsx`
- `apps/web/src/components/book/JobProfitability.tsx`
- `apps/web/src/components/book/JobCostDetail.tsx`
- `apps/web/src/components/book/BookWipValuation.tsx`
- `apps/web/src/components/book/BookCostVariance.tsx`
- `apps/web/src/components/book/StockValuation.tsx`
- `apps/web/src/components/book/ReportsGallery.tsx`

## Data Dependencies
- Local React state and shared UI components are primary dependencies across pages.
- Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`.
- Contract alignment reference: `packages/contracts`.

## Open Issues / UX Debt / Technical Debt Observed
- /book: placeholder/legacy language present.
- /book/budget: mock/seed data usage visible in component.
- /book/invoices: placeholder/legacy language present.
- /book/invoices: mock/seed data usage visible in component.
- /book/invoices: action feedback often toast-driven.
- /book/invoices/:id: placeholder/legacy language present.
- /book/invoices/:id: action feedback often toast-driven.
- /book/expenses: placeholder/legacy language present.
- /book/purchases: placeholder/legacy language present.
- /book/purchases: action feedback often toast-driven.
- /book/reports: action feedback often toast-driven.
- /book/settings: placeholder/legacy language present.

## Related Modules
- Sell
- Buy
- Make
- Plan
