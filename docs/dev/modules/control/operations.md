# Developer notes — control/operations.md

## Components Used
- `@/components/shared/forms/EntityFormDialog`
- `@/components/shared/forms/MwFormField`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageToolbar`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/select.tsx`

## Logic / Behaviour

### Page (`ControlOperations.tsx`)
- Local state holds the search/filter inputs and the currently-edited operation.
- *New operation* sets `editing = undefined` and opens `OperationFormDialog`.
- A row click on the operations table sets `editing = operation` and opens the same dialog — the dialog reads `isEdit = Boolean(operation)` to flip its title and submit label.

### Dialog (`OperationFormDialog.tsx`)
Defined in [`apps/web/src/components/control/OperationFormDialog.tsx`](apps/web/src/components/control/OperationFormDialog.tsx).

```ts
interface OperationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation?: StandardOperation;          // undefined → create mode
  onSave?: (op: StandardOperation) => void;
}
```

- Wraps [`EntityFormDialog`](../../shared/EntityFormDialog.md) for chrome (header, Save/Cancel footer).
- `useEffect` on `open` resets all field state when the dialog (re-)opens with a new target — prevents stale state leaking between create and edit invocations.
- Validation: name + work centre non-empty; default minutes a finite positive number. `submitDisabled` is bound to the same predicate, so the Save button greys out until the form is valid.
- On submit, the dialog mints an id (`std-op-${Date.now()}` for create, preserved for edit), fires `onSave?(op)`, surfaces a success toast, and closes itself via `onOpenChange(false)`.
- The category dropdown is sourced from `operationsLibraryService.categories()` so the catalogue is the single source of truth.

## Dependencies
- `@/services` → `operationsLibraryService` (categories list + the mock data backing `ControlOperations`).
- No direct store binding; the parent page is responsible for persisting the saved operation.

## Known Gaps / Questions
- Backend wiring is mocked. `onSave` currently produces a toast and updates parent state in memory; production needs a `POST /operations` / `PATCH /operations/:id` endpoint and contract.
- No client-side de-dup on operation name — two operations with the same name are allowed.
- `id` is generated client-side. If the backend assigns its own ids, this generator becomes a soft optimistic value that the response replaces.

## Related Files
- `apps/web/src/components/control/ControlOperations.tsx`
- `apps/web/src/components/control/OperationFormDialog.tsx`
- `apps/web/src/components/shared/forms/EntityFormDialog.tsx`
- `apps/web/src/services/operationsLibraryService.ts` *(or wherever `operationsLibraryService` is declared in the `@/services` barrel)*
- `apps/web/src/lib/operation-category-colors.ts` *(consumed by route step chips, not the dialog itself)*
