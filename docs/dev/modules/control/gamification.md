# Developer notes — control/gamification.md

## Components Used
- `@/components/shared/forms/EntityFormDialog`
- `@/components/control/TargetFormDialog` *(new 2026-04-29)*
- `@/components/control/BadgeFormDialog` *(new 2026-04-29)*
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/switch`

## Logic / Behaviour

### Page (`ControlGamification.tsx`)
- Local state holds:
  - the active tab (*Targets* / *Badges*),
  - filter / search text,
  - the currently-edited target (`editingTarget`) and badge (`editingBadge`),
  - dialog open flags.
- `targetColumns` is **declared at component scope, not module scope**, so it can close over `setEditingTarget`. (A 2026-04-30 fix recovered this — earlier code declared the columns at module scope and the row-edit handler was undefined at render. See [`554a651c`](https://github.com/anthropics/Mirrorworksux/commit/554a651c).)

### Target dialog (`TargetFormDialog.tsx`)
[`apps/web/src/components/control/TargetFormDialog.tsx`](apps/web/src/components/control/TargetFormDialog.tsx)

```ts
interface TargetFormData {
  id?: string;
  target: string;
  metric: string;
  period: string;
  value: string;
  status: 'Active' | 'Draft';
  enabled: boolean;
}
```

- Wraps `EntityFormDialog`. Resets state on `open` and `initialData` changes.
- Validation: target name + metric + value all non-empty.
- The `Active` switch determines the saved status (`Active` ↔ `Draft`).

### Badge dialog (`BadgeFormDialog.tsx`)
[`apps/web/src/components/control/BadgeFormDialog.tsx`](apps/web/src/components/control/BadgeFormDialog.tsx)

```ts
interface BadgeFormData {
  id?: string;
  name: string;
  description: string;
  iconKey: string;        // one of 14 keys: 'trophy' | 'bolt' | 'crosshair' | …
  criteria: string;
}
```

- 14-icon palette pulled from `@iconscout/react-unicons`. Each option is `{ value, label, Icon: ComponentType }` so the live preview can render the picked icon directly.
- Note: the `'flag'` key maps to `UilBookmark` (not `UilFlag`) because the upstream `uil-flag` icon was missing — see [`61d81589`](https://github.com/anthropics/Mirrorworksux/commit/61d81589). Cosmetic substitution.
- Validation: badge name required; everything else optional.
- Preview tile uses the gold token `#ffcf4b` on a 20%-opacity wash. Hard-coded; not user-customisable.

## Dependencies
- `@iconscout/react-unicons` for the badge icon palette.
- No store binding — the parent page persists targets / badges after the dialog calls `onSave`.

## Known Gaps / Questions
- Status field on the target dialog is a 2-way toggle (`Active` / `Draft`); there's no archive state. Historical targets currently can't be hidden without deletion.
- Badge `criteria` is free text — no machine-readable rule, so badges can only be granted manually.
- The two icons that don't have a 1:1 Unicons match (`flag`, possibly others) are cosmetic substitutions and can drift on Unicons version bumps.

## Related Files
- `apps/web/src/components/control/ControlGamification.tsx`
- `apps/web/src/components/control/TargetFormDialog.tsx`
- `apps/web/src/components/control/BadgeFormDialog.tsx`
