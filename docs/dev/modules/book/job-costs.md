# Job Profitability — dev stub

User doc: [`docs/user/modules/book/job-costs.md`](../../../user/modules/book/job-costs.md)

- **Route:** `/book/job-costs`
- **Component:** `apps/web/src/components/book/JobProfitability.tsx`
- **Services used:** none (local `JOBS`, `marginData`, `scatterData`)
- **Types:** local `JobRow`; shadows `JobCost` in `entities.ts`
- **TODO:** call `bookService.getJobCosts()`; wire row click to `/book/job-costs/:id`; tier gate (likely Produce+).
