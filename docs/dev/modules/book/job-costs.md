# Job Profitability — dev stub

User doc: [`docs/user/modules/book/job-costs.md`](../../../user/modules/book/job-costs.md)

- **Route:** `/book/job-costs`
- **Component:** `apps/web/src/components/book/JobProfitability.tsx`
- **Services used:** none (local `JOBS`, `marginData`, `scatterData`)
- **Types:** local `JobRow`; shadows `JobCost` in `entities.ts`
- **TODO:** call `bookService.getJobCosts()`; wire row click to `/book/job-costs/:id`; tier gate (likely Produce+).

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/FinancialTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Page is primarily presentational in current implementation.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/book/JobProfitability.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/utils.tsx`
