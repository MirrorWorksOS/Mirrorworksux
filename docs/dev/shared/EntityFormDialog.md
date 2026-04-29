# EntityFormDialog (shared)

Generic create/edit modal substrate. Introduced 2026-04-29 (commit `e8a4461a`) as the chrome for every Control-screen create flow that landed in batches 1–6.

## Files

| Path | Export | Role |
|---|---|---|
| `apps/web/src/components/shared/forms/EntityFormDialog.tsx` | `<EntityFormDialog>`, `EntityFormDialogProps` | Wrapped `Dialog` with `DialogHeader` / `DialogTitle` / `DialogDescription`, a `<form>` body that takes children, and a fixed footer (Save + Cancel). |

## Props

```ts
interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;          // defaults to "Save"
  submitDisabled?: boolean;      // defaults to false
  onSubmit: () => void;          // void — async work is the caller's responsibility
  children: React.ReactNode;     // form fields (no <form> needed inside)
  widthClass?: string;           // defaults to "max-w-lg"
  className?: string;            // appended to DialogContent
}
```

## Behaviour notes

- The dialog **does not auto-close on submit**. Callers that want to close after a successful save must call `onOpenChange(false)` themselves at the end of their `onSubmit`. (This was the API mismatch fixed by commit `f2a5b646` for the Batch 1+2 dialogs.)
- `onSubmit` is fired from a wrapping `<form onSubmit>` so the Save button can be `type="submit"`. `e.preventDefault()` is handled internally — callers do not see the event.
- Save button uses the MW-yellow primary token (`bg-[var(--mw-yellow-400)]` / `hover:bg-[var(--mw-yellow-500)]`); Cancel is a ghost full-width button beneath it. The vertical-stack footer (rather than the more common right-aligned dialog footer) is intentional and matches the rest of the Control dialogs.
- `widthClass` defaults to `max-w-lg` (≈32 rem). Pass `max-w-xl` / `max-w-2xl` for wider forms; if you need a side-sheet (drag-reorderable lists, multi-pane editors), reach for [`Sheet`](../../../apps/web/src/components/ui/sheet.tsx) instead — see `RouteEditorSheet` / `BomEditorSheet` for examples.
- `bg-white/95 dark:bg-card/95 backdrop-blur-xl` — the chrome respects the dark-mode-light-mode discipline (light untouched, dark uses `--card`).

## Validation pattern

The convention adopted across the Control dialogs is:

```tsx
const valid = name.trim().length > 0 && minutes > 0;

const handleSubmit = () => {
  if (!valid) {
    toast.error('Fill in name and a positive minutes value.');
    return;
  }
  onSave?.(buildEntity());
  toast.success(isEdit ? 'Saved' : 'Created');
  onOpenChange(false);
};

<EntityFormDialog
  /* ... */
  submitDisabled={!valid}
  onSubmit={handleSubmit}
>
```

`submitDisabled` greys out the button proactively; the `if (!valid)` guard inside `handleSubmit` belt-and-braces against keyboard submission.

## Current consumers

All in `apps/web/src/components/control/`:

- `OperationFormDialog.tsx`
- `MachineFormDialog.tsx`
- `LocationFormDialog.tsx`
- `MaintenanceFormDialog.tsx`
- `ToolingFormDialog.tsx`
- `ShiftFormDialog.tsx`
- `TargetFormDialog.tsx`
- `BadgeFormDialog.tsx`
- `people/GroupFormDialog.tsx`

Sheet-style consumers (do **not** wrap `EntityFormDialog`):

- `RouteEditorSheet.tsx`
- `BomEditorSheet.tsx`

## Known gaps

- No built-in async-submit spinner state. Callers that fire a real network call from `onSubmit` will need to manage their own `isSubmitting` flag and bind it to `submitDisabled`.
- No focus-trap escape hatch beyond the underlying `Dialog` primitive's defaults.

## See also

- [Control → Operations](../modules/control/operations.md), [Control → Machines](../modules/control/machines.md), [Control → Locations](../modules/control/locations.md) — concrete callers.
