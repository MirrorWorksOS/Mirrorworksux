# Floor Run — dev stub

Canonical content lives at `docs/user/modules/shop-floor/floor-run.md`.

This stub exists so developers browsing `docs/dev/modules/shop-floor/` can find the `/floor/run/:workOrderId` entry point. See the audit at `docs/audits/dev/AUDIT-shop-floor.md` for the gap list.

## Quick dev references

- Route: `/floor/run/:workOrderId` (see `apps/web/src/routes.tsx` ~line 210)
- Component: `apps/web/src/components/floor/FloorRun.tsx`
- Renders: `apps/web/src/components/shop-floor/WorkOrderFullScreen.tsx` → `apps/web/src/components/floor/execution/FloorExecutionScreen.tsx`
- Snapshot builder: `apps/web/src/components/floor/execution/snapshot.ts`
- Stores: `apps/web/src/store/floorSessionStore.ts`, `apps/web/src/store/floorExecutionStore.ts`
