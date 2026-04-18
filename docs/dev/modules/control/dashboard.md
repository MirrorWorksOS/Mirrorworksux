# Developer stub — control/dashboard.md

<!-- TODO: migrate developer-only content from docs/user/modules/control/dashboard.md here. -->

This file is a placeholder created during the 2026-04-18 Control module migration. The
source document at `docs/user/modules/control/dashboard.md` is a Mixed-classification doc (user
intent + component/dependency references in one file). It has not been split yet.

## Sections to migrate

- Components Used (component import list)
- Logic / Behaviour (state model, derivations)
- Dependencies (stores, services, hooks)
- Design / UX Notes (dev-relevant caveats only)
- Known Gaps / Questions (dev-facing)
- Related Files

User-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown,
States) remain in `docs/user/modules/control/dashboard.md` until a human editor does the split.

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/layout/ModuleInfoCallout`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/badge.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/control/ControlDashboard.tsx`
- `apps/web/src/components/ui/badge.tsx`
