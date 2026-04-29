# Developer notes — control/maintenance.md

## Components Used
- `@/components/shared/forms/EntityFormDialog`
- `@/components/control/MaintenanceFormDialog` *(new 2026-04-29)*
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/ui/badge`
- `@/components/ui/card`
- `@/components/ui/tabs`

## Logic / Behaviour

### Page (`ControlMaintenance.tsx`)
- Local state holds the search/filter inputs, the tab (`schedule` / `history`), and the currently-edited record.
- *Schedule maintenance* sets `editing = null` and opens `MaintenanceFormDialog`.
- A row click on the schedule table sets `editing = record` and opens the same dialog in edit mode.

### Dialog (`MaintenanceFormDialog.tsx`)
Defined in [`apps/web/src/components/control/MaintenanceFormDialog.tsx`](apps/web/src/components/control/MaintenanceFormDialog.tsx).

```ts
interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRecord?: MaintenanceRecord | null;   // null → create mode
  onSave: (record: Omit<MaintenanceRecord, 'id'> & { id?: string }) => void;
}
```

- Wraps [`EntityFormDialog`](../../shared/EntityFormDialog.md).
- Resets all field state when `open` flips to true with a different `initialRecord` — prevents stale state between create and edit calls.
- Validation: machine + scheduled date required.
- New records are minted with `status: 'scheduled'`. Status transitions live on the row.
- The machine list is currently a hard-coded `MACHINES_LIST` (8 entries) that is also exported for `ToolingFormDialog` to share. Replace with a `controlService.listMachines()` call when wiring the backend.

## Dependencies
- `@/types/entities` → `MaintenanceRecord` shape.
- No store binding; the parent page persists the record after `onSave`.

## Known Gaps / Questions
- `MACHINES_LIST` is duplicated logic — both `MaintenanceFormDialog` and `ToolingFormDialog` import it. Lift into a shared service module before backend wiring.
- No conflict detection across overlapping maintenance windows on the same machine.
- Cost is captured at schedule time; no field for *actual* cost on completion (a `completedCost` column on the history table would be useful).

## Related Files
- `apps/web/src/components/control/ControlMaintenance.tsx`
- `apps/web/src/components/control/MaintenanceFormDialog.tsx`
- `apps/web/src/components/shared/forms/EntityFormDialog.tsx`
- `apps/web/src/types/entities.ts` (`MaintenanceRecord`)
