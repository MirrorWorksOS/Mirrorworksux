# Developer notes — control/people.md

## Components Used
- `@/components/shared/forms/EntityFormDialog`
- `@/components/control/people/GroupFormDialog` *(new 2026-04-29)*
- `@/components/control/people/GroupsTab`
- `@/components/control/people/GroupDetailSheet`
- `@/components/control/people/InviteUserDialog`
- `@/components/control/people/UsersTab`
- `@/components/control/people/UserDetailSheet`
- `@/components/control/people/people-data`
- `@/components/shared/cards/DarkAccentCard`
- `@/components/ui/button`
- `@/components/ui/tabs`

## Logic / Behaviour

### Page (`ControlPeople.tsx`)
- Tabs: `users` / `groups`. Tab is the only meaningful local state on the parent — the row sheets and dialogs manage their own state.
- The Groups list is also surfaced standalone at `/control/groups` (`ControlGroups.tsx`) and reuses the same `GroupsTab` underneath.

### Group dialog (`GroupFormDialog.tsx`)
[`apps/web/src/components/control/people/GroupFormDialog.tsx`](apps/web/src/components/control/people/GroupFormDialog.tsx)

```ts
interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

- Currently fires-and-forgets — the dialog does not yet take an `onSave` prop. On submit it toasts and closes; the parent has no way to materialise the group into state. **Bug-grade gap**: wire `onSave` and a parent `onSave` handler before backend work begins.
- Validation: group name required.
- Module options match the canonical 7-module list (`sell`, `plan`, `make`, `ship`, `book`, `buy`, `control`) — no *Bridge* because Bridge isn't a permission scope.

## Roles vocabulary
Per the canonical access-role vocabulary, only three roles exist: **admin**, **lead**, **team**. Off-spec labels (*Supervisor* / *Manager* / *Director* / *Operator*) were normalised in the 2026-04-29 Purchase → Buy Settings merge. New code must not introduce more.

## Dependencies
- `@/components/control/people/types` → `ModuleKey` enum.

## Known Gaps / Questions
- `GroupFormDialog` doesn't accept `onSave` — see above.
- No edit mode on the group dialog.
- Role assignment for users still flows through `UserDetailSheet`, not a dedicated dialog.

## Related Files
- `apps/web/src/components/control/ControlPeople.tsx`
- `apps/web/src/components/control/ControlGroups.tsx`
- `apps/web/src/components/control/people/GroupFormDialog.tsx`
- `apps/web/src/components/control/people/GroupsTab.tsx`
- `apps/web/src/components/control/people/UsersTab.tsx`
- `apps/web/src/components/control/people/InviteUserDialog.tsx`
- `apps/web/src/components/control/people/UserDetailSheet.tsx`
- `apps/web/src/components/control/people/GroupDetailSheet.tsx`
- `apps/web/src/components/control/people/people-data.tsx`
