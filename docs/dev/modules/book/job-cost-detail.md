# Job Cost Detail — dev stub

User doc: [`docs/user/modules/book/job-cost-detail.md`](../../../user/modules/book/job-cost-detail.md)

- **Route:** `/book/job-costs/:id`
- **Component:** `apps/web/src/components/book/JobCostDetail.tsx`
- **Services used:** none — static `costBreakdown`, `costOverTime`, `materialsData`, `labourData`
- **Embedded:** `AIInsightCard` from `@/components/shared/ai`
- **Known bugs:** does not read `:id` param; values are JOB-2026-0012 hard-coded.
- **TODO:** read `useParams().id`; call `bookService.getJobCostById`; tier gate.

## Components Used
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/FinancialTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/shared/ai/AIInsightCard.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Dynamic route exists but robust data loading/error recovery is not obvious in this component.

## Related Files
- `apps/web/src/components/book/JobCostDetail.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/shared/ai/AIInsightCard.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`
