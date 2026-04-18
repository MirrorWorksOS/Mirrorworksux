# Cost Variance — dev stub

User doc: [`docs/user/modules/book/cost-variance.md`](../../../user/modules/book/cost-variance.md)

- **Route:** `/book/cost-variance`
- **Component:** `apps/web/src/components/book/BookCostVariance.tsx`
- **Services used:** `bookService.getCostVariance()` (wired)
- **Types:** `CostVarianceRecord` in `apps/web/src/types/entities.ts` (L795)
- **TODO:** React Query key `['book','costVariance']`; error/loading states; tier gate (Expand+).

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/badge`
- `@/components/ui/card`
- `@/components/ui/table`
- `@/components/ui/utils`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/book/BookCostVariance.tsx`
