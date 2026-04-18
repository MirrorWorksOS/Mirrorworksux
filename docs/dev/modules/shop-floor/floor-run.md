# Floor Run — dev stub

Canonical content lives at `docs/user/modules/shop-floor/floor-run.md`.

This stub exists so developers browsing `docs/dev/modules/shop-floor/` can find the `/floor/run/:workOrderId` entry point. See the audit at `docs/audits/dev/AUDIT-shop-floor.md` for the gap list.

## Quick dev references

- Route: `/floor/run/:workOrderId` (see `apps/web/src/routes.tsx` ~line 210)
- Component: `apps/web/src/components/floor/FloorRun.tsx`
- Renders: `apps/web/src/components/shop-floor/WorkOrderFullScreen.tsx` → `apps/web/src/components/floor/execution/FloorExecutionScreen.tsx`
- Snapshot builder: `apps/web/src/components/floor/execution/snapshot.ts`
- Stores: `apps/web/src/store/floorSessionStore.ts`, `apps/web/src/store/floorExecutionStore.ts`

## Components Used
- `@/components/floor/execution/snapshot`
- `@/components/floor/execution/types`
- `@/components/shop-floor/WorkOrderFullScreen`
- `@/components/ui/button`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Page logic relies on Zustand stores for shared state or mutations.
- Behavior is largely client-side React state and memoized derivations.
- Kiosk flow protects operator context and redirects to run steps when prerequisites are met.

## Dependencies
- `@/store/floorExecutionStore`
- `@/store/floorSessionStore`

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/floor/FloorRun.tsx`
- `apps/web/src/store/floorExecutionStore`
- `apps/web/src/store/floorSessionStore`
