# Developer stub — control/people.md

<!-- TODO: migrate developer-only content from docs/user/modules/control/people.md here. -->

This file is a placeholder created during the 2026-04-18 Control module migration. The
source document at `docs/user/modules/control/people.md` is a Mixed-classification doc (user
intent + component/dependency references in one file). It has not been split yet.

## Sections to migrate

- Components Used (component import list)
- Logic / Behaviour (state model, derivations)
- Dependencies (stores, services, hooks)
- Design / UX Notes (dev-relevant caveats only)
- Known Gaps / Questions (dev-facing)
- Related Files

User-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown,
States) remain in `docs/user/modules/control/people.md` until a human editor does the split.

## Components Used
- `@/components/shared/cards/DarkAccentCard`
- `@/components/ui/button`
- `@/components/ui/tabs`
- `apps/web/src/components/control/people/GroupsTab.tsx`
- `apps/web/src/components/control/people/GroupDetailSheet.tsx`
- `apps/web/src/components/control/people/InviteUserDialog.tsx`
- `apps/web/src/components/control/people/UsersTab.tsx`
- `apps/web/src/components/control/people/UserDetailSheet.tsx`
- `apps/web/src/components/control/people/people-data.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/control/ControlPeople.tsx`
- `apps/web/src/components/control/people/GroupsTab.tsx`
- `apps/web/src/components/control/people/GroupDetailSheet.tsx`
- `apps/web/src/components/control/people/InviteUserDialog.tsx`
- `apps/web/src/components/control/people/UsersTab.tsx`
- `apps/web/src/components/control/people/UserDetailSheet.tsx`
- `apps/web/src/components/control/people/people-data.tsx`
