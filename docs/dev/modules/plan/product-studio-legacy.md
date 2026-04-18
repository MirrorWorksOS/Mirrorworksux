# Product Studio Legacy — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/product-studio-legacy.md -->

Developer-focused sections to extract:

- Deprecation status (legacy path — scheduled for removal)
- Components Used
- Logic / Behaviour
- Dependencies

## Components Used
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/dropdown-menu`
- `@/components/ui/input`
- `@/components/ui/utils`
- `apps/web/src/components/plan/product-studio/ProductCanvas.tsx`
- `apps/web/src/components/plan/product-studio/PropertiesPanel.tsx`
- `apps/web/src/components/plan/product-studio/VisualRuleWorkspace.tsx`
- `apps/web/src/components/plan/product-studio/ConfigPreview.tsx`
- `apps/web/src/components/plan/product-studio/ProductList.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Page logic relies on Zustand stores for shared state or mutations.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/store/productBuilderStore`
- `@/lib/product-studio/validate`

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/plan/product-studio/ProductStudio.tsx`
- `apps/web/src/components/plan/product-studio/ProductCanvas.tsx`
- `apps/web/src/components/plan/product-studio/PropertiesPanel.tsx`
- `apps/web/src/components/plan/product-studio/VisualRuleWorkspace.tsx`
- `apps/web/src/components/plan/product-studio/ConfigPreview.tsx`
- `apps/web/src/components/plan/product-studio/ProductList.tsx`
- `apps/web/src/store/productBuilderStore`
