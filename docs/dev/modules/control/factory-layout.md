# Developer stub — control/factory-layout.md

<!-- TODO: migrate developer-only content from docs/user/modules/control/factory-layout.md here. -->

This file is a placeholder created during the 2026-04-18 Control module migration. The
source document at `docs/user/modules/control/factory-layout.md` is a Mixed-classification doc (user
intent + component/dependency references in one file). It has not been split yet.

## Sections to migrate

- Components Used (component import list)
- Logic / Behaviour (state model, derivations)
- Dependencies (stores, services, hooks)
- Design / UX Notes (dev-relevant caveats only)
- Known Gaps / Questions (dev-facing)
- Related Files

User-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown,
States) remain in `docs/user/modules/control/factory-layout.md` until a human editor does the split.

## Components Used
- `@/components/animate-ui/icons/cog`
- `@/components/animate-ui/primitives/animate/tooltip`
- `@/components/animate-ui/primitives/radix/sheet`
- `@/components/ui/button`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/resizable`
- `@/components/ui/select`
- `@/components/ui/slider`
- `@/components/ui/switch`
- `@/components/ui/toggle-group`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/lib/platform/storage`

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/control/ControlFactoryDesigner.tsx`
