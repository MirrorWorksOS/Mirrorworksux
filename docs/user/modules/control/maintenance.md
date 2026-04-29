# Maintenance

## Summary
Maintenance schedule + history page. Shows scheduled, in-progress, and completed maintenance for every machine in the factory.

## Route
`/control/maintenance`

## User Intent
Schedule preventive and corrective maintenance against machines, track progress, and review history.

## Primary Actions
- *Schedule maintenance* — opens [`MaintenanceFormDialog`](apps/web/src/components/control/MaintenanceFormDialog.tsx) in create mode (landed 2026-04-29).
- Click any row in the schedule table to open the same dialog in edit mode.
- Tab between *Schedule* and *History* views.
- Filter / search across machine, type, technician.

### Create / edit form fields
- **Machine** *(required)* — choose from the machines registered in Control → Machines (mock list of 8 in current build).
- **Type** — *Preventive* (planned) or *Corrective* (reactive).
- **Description** — free text describing the work.
- **Scheduled date** *(required)*.
- **Estimated cost** — optional numeric value.
- **Assigned to** — technician name.

## Key UI Sections
- Page header with *Schedule maintenance* CTA.
- KPI/summary card strip (open jobs, due-this-week, overdue).
- Tabbed schedule + history tables, both backed by the shared `MwDataTable`.

## Data Shown
- Schedule: machine, type, description, scheduled date, technician, status, est. cost.
- History: completion date, downtime, actual cost.

## States
- default
- empty
- success (after schedule/edit)
- populated

## Design / UX Notes
- The dialog wraps the shared [`EntityFormDialog`](../../../dev/shared/EntityFormDialog.md) and closes on submit success.
- New records are created with `status = 'scheduled'`; status transitions are made elsewhere in the page (start / complete buttons on the row).
- Backend wiring is mocked — `onSave` updates parent state and fires a toast; production will hand the payload to `controlService.upsertMaintenance`.
