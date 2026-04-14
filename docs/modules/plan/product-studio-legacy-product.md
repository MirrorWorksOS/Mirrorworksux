# Product Studio Legacy (Product)

## Summary
Product Studio Legacy (Product) screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/plan/product-studio/legacy/:productId`

## User Intent
Complete product studio legacy (product) work and move records to the next stage.

## Primary Actions
- Open related pages and record detail views.

## Key UI Sections
- Form controls for editing/creation.

## Data Shown
- Product/material/BOM and inventory planning records.

## States
- default
- loading
- error
- populated

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

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

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
