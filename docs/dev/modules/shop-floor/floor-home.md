# Floor Home — dev stub

Canonical content lives at `docs/user/modules/shop-floor/floor-home.md`.

This stub exists so developers browsing `docs/dev/modules/shop-floor/` can find the `/floor` entry point. The source-of-truth behaviour (kiosk state-machine, session/execution stores, URL `?station=` hydration) is documented alongside the user-facing content. See the related audit at `docs/audits/dev/AUDIT-shop-floor.md`.

## Quick dev references

- Route: `/floor` (see `apps/web/src/routes.tsx` ~line 206)
- Component: `apps/web/src/components/floor/FloorHome.tsx`
- Layout (no sidebar, no AgentFAB): `apps/web/src/components/floor/FloorModeLayout.tsx`
- Stores: `apps/web/src/store/floorSessionStore.ts`, `apps/web/src/store/floorExecutionStore.ts`
- Service entry: `makeService.getMachineById`, `makeService.getWorkOrderById` (see `apps/web/src/services/makeService.ts`)

## Components Used
- `apps/web/src/components/floor/FloorClockIn.tsx`
- `apps/web/src/components/floor/FloorStationPicker.tsx`
- `apps/web/src/components/floor/FloorScanJob.tsx`

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

## Notes — `FloorScanJob` barcode normalisation (2026-05-08)

`FloorScanJob.handleScan(value)` now `value.trim().toUpperCase()`s the input before comparing against `woNumber` / `moNumber` (commit `11b00661`). Operators who type a lower-case fallback when a scanner isn't to hand now match. Real scanners feed already-upper-cased text, so production behaviour is unchanged.

## Related Files
- `apps/web/src/components/floor/FloorHome.tsx`
- `apps/web/src/components/floor/FloorClockIn.tsx`
- `apps/web/src/components/floor/FloorStationPicker.tsx`
- `apps/web/src/components/floor/FloorScanJob.tsx`
- `apps/web/src/store/floorExecutionStore`
- `apps/web/src/store/floorSessionStore`
