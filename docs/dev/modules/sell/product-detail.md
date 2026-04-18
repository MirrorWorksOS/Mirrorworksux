<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/product-detail.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

## Components Used
- `@/components/shared/product/ProductDetail`

## Logic / Behaviour
- Page is primarily presentational in current implementation.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Dynamic route exists but robust data loading/error recovery is not obvious in this component.

## Related Files
- `apps/web/src/components/sell/SellProductDetail.tsx`
