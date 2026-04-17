# Budget Overview — dev stub

User doc: [`docs/user/modules/book/budget.md`](../../../user/modules/book/budget.md)

- **Route:** `/book/budget`
- **Component:** `apps/web/src/components/book/BudgetOverview.tsx`
- **Services used:** none (local `mockBudgets`, `monthlyData`, `typeData`, `categoryData`, `utilisationData`)
- **Types:** local `Budget`, `BudgetHealthStatus`, `BudgetType`, `BudgetStatus` interfaces (not in `entities.ts`)
- **Spec reference:** file header says `Matches BOOK 04 specification from Confluence` — spec doc is NOT in the repo. See audit P0.
- **TODO:** extract `Budget` type to `entities.ts`; add `bookService.getBudgets()`; wire React Query; add tier gate (likely Produce+).
