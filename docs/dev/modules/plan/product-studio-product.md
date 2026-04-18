# Product Studio v2 (Product) — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/product-studio-product.md -->

Developer-focused sections to extract:

- Components Used (Blockly-v2 tree)
- Logic / Behaviour
- Route params (`:productId`)
- Mock/seed data paths
- Dependencies (`productBuilderStore`)

## Components Used
- `@/components/shared/icons/IconWell`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/dialog`
- `@/components/ui/dropdown-menu`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/select`
- `@/components/ui/slider`
- `@/components/ui/switch`
- `@/components/ui/tabs`
- `@/components/ui/utils`
- `apps/web/src/components/plan/product-studio/blockly-v2/blocks.tsx`
- `apps/web/src/components/plan/product-studio/blockly-v2/toolbox.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Routing links and back navigation are handled in-component.
- Page logic relies on Zustand stores for shared state or mutations.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- `@/store/finishLibraryStore`
- `@/store/materialLibraryStore`
- `@/store/productBuilderStore`

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/plan/product-studio/blockly-v2/ProductStudioV2.tsx`
- `apps/web/src/components/plan/product-studio/blockly-v2/blocks.tsx`
- `apps/web/src/components/plan/product-studio/blockly-v2/toolbox.tsx`
- `apps/web/src/components/plan/product-studio/blockly-v2/generator.tsx`
- `apps/web/src/components/plan/product-studio/blockly-v2/evaluator.tsx`
- `apps/web/src/store/finishLibraryStore`
- `apps/web/src/store/materialLibraryStore`
- `apps/web/src/store/productBuilderStore`
