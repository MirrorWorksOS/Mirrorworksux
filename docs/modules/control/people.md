# People

## Summary
People screen. Behavior is documented from current component implementation.

## Route
`/control/people`

## User Intent
Complete people work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Switch tabs/sub-views within the page.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Tabbed content regions.
- Form controls for editing/creation.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- blocked
- populated

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

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

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
