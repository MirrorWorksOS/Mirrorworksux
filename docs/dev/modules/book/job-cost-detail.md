# Job Cost Detail — dev stub

User doc: [`docs/user/modules/book/job-cost-detail.md`](../../../user/modules/book/job-cost-detail.md)

- **Route:** `/book/job-costs/:id`
- **Component:** `apps/web/src/components/book/JobCostDetail.tsx`
- **Services used:** none — static `costBreakdown`, `costOverTime`, `materialsData`, `labourData`
- **Embedded:** `AIInsightCard` from `@/components/shared/ai`
- **Known bugs:** does not read `:id` param; values are JOB-2026-0012 hard-coded.
- **TODO:** read `useParams().id`; call `bookService.getJobCostById`; tier gate.
