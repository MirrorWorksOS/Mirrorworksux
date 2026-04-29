# People

## Summary
People & Groups screen. Two tabs: *Users* (invite, edit roles, suspend) and *Groups* (permission groups scoped to a module). Group sub-route lives at `/control/groups`.

## Route
`/control/people` (Users + Groups tabs); `/control/groups` (Groups list)

## User Intent
Onboard staff, assign roles, and bundle them into permission groups that downstream modules consume.

## Primary Actions
- *Invite user* — opens `InviteUserDialog` (existing).
- *New group* — opens [`GroupFormDialog`](apps/web/src/components/control/people/GroupFormDialog.tsx) (landed 2026-04-29).
- Click any user / group row to open its detail sheet (existing).

### Group form fields
- **Group name** *(required)* — e.g. *Production leads*.
- **Description** — free text.
- **Module** — one of *Sell* / *Plan* / *Make* / *Ship* / *Book* / *Buy* / *Control*. Determines which module's permission set the group ties to.

## Roles
Per the canonical access-role vocabulary, the only three roles in the system are **admin**, **lead**, **team**. Legacy labels (Manager / Supervisor / Director / Operator) were normalised across the app on 2026-04-29 as part of the Purchase → Buy Settings merge.

## Key UI Sections
- Tabbed page (Users / Groups).
- Users tab: list with avatar, role, last active, status; row click opens detail sheet.
- Groups tab: list with name, module, member count, role; row click opens detail sheet.

## Data Shown
- User profile fields, role, last seen.
- Group metadata + member roster.

## States
- default
- blocked (when the current user lacks `people.manage` permission)
- populated

## Design / UX Notes
- The group dialog is wired to `EntityFormDialog`; backend write currently fires a toast only.
- Group permissions ARE the source of truth for module access — see [ARCH 00 spec](../../../../.claude/projects/-Users-mattquigley-Documents-GitHub-Mirrorworksux/memory/reference_arch00_spec.md) for the 3-layer model (tiers → roles → groups).
