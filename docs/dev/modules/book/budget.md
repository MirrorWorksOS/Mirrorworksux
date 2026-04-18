# Budget Overview — dev stub

User doc: [`docs/user/modules/book/budget.md`](../../../user/modules/book/budget.md)

- **Route:** `/book/budget`
- **Component:** `apps/web/src/components/book/BudgetOverview.tsx`
- **Services used:** none (local `mockBudgets`, `monthlyData`, `typeData`, `categoryData`, `utilisationData`)
- **Types:** local `Budget`, `BudgetHealthStatus`, `BudgetType`, `BudgetStatus` interfaces (not in `entities.ts`)
- **Spec reference:** file header says `Matches BOOK 04 specification from Confluence` — spec doc is NOT in the repo. See audit P0.
- **TODO:** extract `Budget` type to `entities.ts`; add `bookService.getBudgets()`; wire React Query; add tier gate (likely Produce+).

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/ProgressBar`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/book/BudgetOverview.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/animated-icons.tsx`
