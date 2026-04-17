# Product Detail

## Summary
Product Detail screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/make/products/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Single content surface with route-specific controls.

## Data Shown
- Product/material/BOM and inventory planning records.

## States
- default
- populated

## Components Used
- `@/components/shared/product/ProductDetail`

## Logic / Behaviour
- Page is primarily presentational in current implementation.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Dynamic route exists but robust data loading/error recovery is not obvious in this component.

## Related Files
- `apps/web/src/components/make/MakeProductDetail.tsx`
