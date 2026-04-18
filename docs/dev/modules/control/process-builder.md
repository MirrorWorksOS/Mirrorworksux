# Developer stub — control/process-builder.md

<!-- TODO: migrate developer-only content from docs/user/modules/control/process-builder.md here. -->

This file is a placeholder created during the 2026-04-18 Control module migration. The
source document at `docs/user/modules/control/process-builder.md` is a Mixed-classification doc (user
intent + component/dependency references in one file). It has not been split yet.

## Sections to migrate

- Components Used (component import list)
- Logic / Behaviour (state model, derivations)
- Dependencies (stores, services, hooks)
- Design / UX Notes (dev-relevant caveats only)
- Known Gaps / Questions (dev-facing)
- Related Files

User-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown,
States) remain in `docs/user/modules/control/process-builder.md` until a human editor does the split.

## Components Used
- `@/components/animate-ui/icons/blocks`
- `@/components/animate-ui/primitives/radix/sheet`
- `@/components/shared/ai/MirrorWorksAgentCard`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/toggle-group.tsx`
- `apps/web/src/components/ui/resizable.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/lib/platform/storage`

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/control/ControlProcessBuilder.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/toggle-group.tsx`
- `apps/web/src/components/ui/resizable.tsx`
- `apps/web/src/components/ui/utils.tsx`
