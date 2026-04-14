# Product Studio v2 (Product)

## Summary
Product Studio v2 (Product) screen. This is a dynamic detail route. Current implementation includes mock/seed data paths.

## Route
`/plan/product-studio/:productId`

## User Intent
Complete product studio v2 (product) work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.
- Switch tabs/sub-views within the page.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Tabbed content regions.
- Form controls for editing/creation.

## Data Shown
- Product/material/BOM and inventory planning records.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- loading
- empty
- error
- success
- blocked
- populated

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

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

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
