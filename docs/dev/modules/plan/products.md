# Products — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/products.md -->

Developer-focused sections to extract:

- Components Used
- Logic / Behaviour (search/filter)
- Dependencies
- States

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/button.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/lib/product-studio-catalog-map`

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Related Files
- `apps/web/src/components/plan/PlanProducts.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/button.tsx`
