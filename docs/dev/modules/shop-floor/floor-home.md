# Floor Home — dev stub

Canonical content lives at `docs/user/modules/shop-floor/floor-home.md`.

This stub exists so developers browsing `docs/dev/modules/shop-floor/` can find the `/floor` entry point. The source-of-truth behaviour (kiosk state-machine, session/execution stores, URL `?station=` hydration) is documented alongside the user-facing content. See the related audit at `docs/audits/dev/AUDIT-shop-floor.md`.

## Quick dev references

- Route: `/floor` (see `apps/web/src/routes.tsx` ~line 206)
- Component: `apps/web/src/components/floor/FloorHome.tsx`
- Layout (no sidebar, no AgentFAB): `apps/web/src/components/floor/FloorModeLayout.tsx`
- Stores: `apps/web/src/store/floorSessionStore.ts`, `apps/web/src/store/floorExecutionStore.ts`
- Service entry: `makeService.getMachineById`, `makeService.getWorkOrderById` (see `apps/web/src/services/makeService.ts`)
