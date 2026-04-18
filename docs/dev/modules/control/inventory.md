# Developer stub — control/inventory.md

<!-- TODO: migrate developer-only content from docs/user/modules/control/inventory.md here. -->

This file is a placeholder created during the 2026-04-18 Control module migration. The
source document at `docs/user/modules/control/inventory.md` is a Mixed-classification doc (user
intent + component/dependency references in one file). It has not been split yet.

## Sections to migrate

- Components Used (component import list)
- Logic / Behaviour (state model, derivations)
- Dependencies (stores, services, hooks)
- Design / UX Notes (dev-relevant caveats only)
- Known Gaps / Questions (dev-facing)
- Related Files

User-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown,
States) remain in `docs/user/modules/control/inventory.md` until a human editor does the split.

## Components Used
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/feedback/EmptyState`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/ToolbarPrimaryButton`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/utils`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/dialog.tsx`
- `apps/web/src/components/ui/input.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/control/ControlInventory.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/dialog.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/textarea.tsx`
