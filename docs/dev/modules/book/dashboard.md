# Book Dashboard — dev stub

User doc: [`docs/user/modules/book/dashboard.md`](../../../user/modules/book/dashboard.md)

- **Route:** `/book`
- **Component:** `apps/web/src/components/book/BookDashboard.tsx`
- **Services used:** `bookKpis`, `bookApprovalQueue`, `bookOverdueItems` from `apps/web/src/services`
- **Types:** `KpiMetric`, `ApprovalItem`, `OverdueItem` in `apps/web/src/types/entities.ts`
- **Shared layout:** `ModuleDashboard`, `ModuleQuickNav`, `KpiStatCard`
- **State:** local `useState` for active tab only
- **TODO:** wire to `bookService.getKpis/getApprovalQueue/getOverdueItems`; add React Query keys; add tier gate (ARCH 00 — Pilot tier baseline).
