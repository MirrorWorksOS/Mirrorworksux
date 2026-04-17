# BOMs

## Summary
BOMs screen. Behavior is documented from current component implementation.

## Route
`/control/boms`

## User Intent
Complete boms work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.

## Key UI Sections
- Primary table/list region for records.

## Data Shown
- Product/material/BOM and inventory planning records.

## States
- default
- empty
- error
- success
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/FilterBar`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/control/ControlBOMs.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/utils.tsx`
