# Book Dashboard — dev stub

User doc: [`docs/user/modules/book/dashboard.md`](../../../user/modules/book/dashboard.md)

- **Route:** `/book`
- **Component:** `apps/web/src/components/book/BookDashboard.tsx`
- **Services used:** `bookKpis`, `bookApprovalQueue`, `bookOverdueItems` from `apps/web/src/services`
- **Types:** `KpiMetric`, `ApprovalItem`, `OverdueItem` in `apps/web/src/types/entities.ts`
- **Shared layout:** `ModuleDashboard`, `ModuleQuickNav`, `KpiStatCard`
- **State:** local `useState` for active tab only
- **TODO:** wire to `bookService.getKpis/getApprovalQueue/getOverdueItems`; add React Query keys; add tier gate (ARCH 00 — Pilot tier baseline).

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Related Files
- `apps/web/src/components/book/BookDashboard.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
