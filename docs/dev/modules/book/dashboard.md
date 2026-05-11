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

## Notes — Wired CTAs (2026-05-08)

Per `65dbf388`, three buttons that previously had no handler now respond:

| Button | Behaviour |
|---|---|
| **View All Approvals** | `navigate('/book/expenses')` — uses freshly imported `useNavigate()` |
| **Sync Now** (Xero card) | `toast.success('Xero sync started')` — backend mutation TBC |
| **Follow Up All** (Overdue card) | `toast.success('Follow-up emails queued for ${overdueActions.length} overdue items')` |

All three are toast-stubs for the Xero / overdue follow-up flows; each becomes a real call once the corresponding service method lands.

## Related Files
- `apps/web/src/components/book/BookDashboard.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
