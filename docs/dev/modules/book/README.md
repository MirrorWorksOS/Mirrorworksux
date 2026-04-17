# Book — Developer stub

User-facing documentation lives at [`docs/user/modules/book/`](../../../user/modules/book/).

## Code locations

- Components: `apps/web/src/components/book/`
- Routes: `apps/web/src/routes.tsx` (path `book` — see `// Book Module Routes` block, approx. L442)
- Route helpers: `apps/web/src/lib/route-helpers.ts` (`appRoutes.bookInvoices`, `appRoutes.bookJobCosts`)
- Service facade: `apps/web/src/services/bookService.ts`
- Mock data: `apps/web/src/services/mock/data.ts`
- Entity types: `apps/web/src/types/entities.ts` (`SellInvoice`, `Expense`, `Bill`, `JobCost`, `WipValuation`, `CostVarianceRecord`, `KpiMetric`, `ApprovalItem`, `OverdueItem`)
- Permissions: `apps/web/src/components/book/BookSettings.tsx` — `bookPermissionKeys` and `bookDefaultGroups` (ARCH 00 §4.7)
- Access guideline: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`

## Pages

| Route                        | Component file                                          | Dev notes                                      |
| ---------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| `/book`                      | `BookDashboard.tsx`                                     | Uses `ModuleDashboard`, `ModuleQuickNav`, `bookKpis` from services. |
| `/book/budget`               | `BudgetOverview.tsx`                                    | Local mock data; header comment references "BOOK 04 specification from Confluence" (spec not in repo). |
| `/book/invoices`             | `BookInvoices.tsx`                                      | Derives rows from `sellInvoices` + `salesOrders` + `jobs`. Overlaps with Sell invoices — see audit. |
| `/book/invoices/:id`         | `InvoiceDetail.tsx`                                     | Static title `INV-2026-0045`; does not read `:id` from route. |
| `/book/expenses`             | `ExpenseKanban.tsx`                                     | Kanban with static starter columns; uses `NewExpense.tsx` sheet. |
| `/book/purchases`            | `PurchaseOrders.tsx`                                    | Local mock POS; no service wire-up. Overlaps with Buy purchase orders. |
| `/book/job-costs`            | `JobProfitability.tsx`                                  | Local mock `JOBS`; no service call. |
| `/book/job-costs/:id`        | `JobCostDetail.tsx`                                     | Static JOB-2026-0012; AI insight card embedded. |
| `/book/wip`                  | `BookWipValuation.tsx`                                  | Calls `bookService.getWipValuations()`. |
| `/book/cost-variance`        | `BookCostVariance.tsx`                                  | Calls `bookService.getCostVariance()`. |
| `/book/stock-valuation`      | `StockValuation.tsx`                                    | Local mock data; no service. Overlaps with Plan stock concepts. |
| `/book/reports`              | `ReportsGallery.tsx`                                    | Static Xero + MW report cards; toast-only actions. |
| `/book/settings`             | `BookSettings.tsx`                                      | Implements ARCH 00 §4.7 group-permission model (5 panels). |

## Unused components

- `apps/web/src/components/book/Book.tsx` — not referenced by routes; orphan candidate.
- `apps/web/src/components/book/InvoiceList.tsx` — not imported by any book route (routes use `BookInvoices.tsx`); orphan candidate.

## Stores

No book-specific Zustand stores. Candidates: `invoiceFiltersStore`, `expensesBoardStore`.

## React Query keys

Not wired up. `bookService` returns promises but components use `useEffect`+`useState` (see `BookWipValuation.tsx` L39).

## Permissions model

See ARCH 00 §4.7. Groups: `Accounts Receivable`, `Accounts Payable`, `Expenses` (defaults in `BookSettings.tsx`). Permission keys: `documents.scope`, `invoices.create`, `expenses.scope`, `po.approve`, `xero.access`, `settings.access`, `reports.access`.
