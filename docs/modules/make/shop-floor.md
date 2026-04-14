# Shop Floor

## Summary
Shop Floor screen. Behavior is documented from current component implementation.

## Route
`/make/shop-floor`

## User Intent
Complete shop floor work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Single content surface with route-specific controls.

## Data Shown
- Work-order/job execution data, machine context, and production statuses.

## States
- default
- populated

## Components Used
- `apps/web/src/components/make/shop-floor/ShopFloorPage.tsx`

## Logic / Behaviour
- Page is primarily presentational in current implementation.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/make/MakeShopFloor.tsx`
- `apps/web/src/components/make/shop-floor/ShopFloorPage.tsx`
