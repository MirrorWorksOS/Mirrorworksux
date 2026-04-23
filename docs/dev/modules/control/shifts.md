# Shift Manager (Control)

Route: `/control/shifts`
Source: `apps/web/src/components/control/ControlShiftManager.tsx`

## What it is

Weekly staff-scheduling calendar. Rows are **employees grouped by
department**; columns are **Mon–Sun**. Each cell holds zero or more
**shift chips** that show a time range (e.g. `09:00–17:00`) plus the
work centre the employee is assigned to (Cutting, Welding, etc.),
colour-coded by shift type (day / afternoon / night).

Patterned after:
- Odoo Planning — <https://www.odoo.com/documentation/19.0/applications/services/planning.html>
- Fulcrum Pro Work Orders & scheduling — <https://fulcrumpro.com/article/streamline-production-with-work-orders-in-fulcrum>
- "Connect" work-schedule reference (provided by Design as the target pattern)

## Data model

Two related types:

```ts
// Legacy — work-centre-level shift slots. Not used by the grid.
interface ShiftAssignment {
  id, workCentreId, workCentreName,
  dayOfWeek, shift, startTime, endTime
}

// Current — employee-level scheduled shift (grid row).
interface EmployeeShift {
  id,
  employeeId, employeeName, employeeInitials,
  department, role,
  dayOfWeek,          // 0 = Sun … 6 = Sat
  shift,              // 'day' | 'afternoon' | 'night'
  startTime, endTime,
  workCentreId?, workCentreName?   // optional for office roles
}
```

Mock data lives at:
- `employeeShifts` — `apps/web/src/services/mock/data.ts` (41 entries covering all 8 mock employees).
- `controlService.getEmployeeShifts()` — async facade.

The legacy `ShiftAssignment` / `getShiftAssignments` API stays for
back-compat; nothing in the Shift Manager grid reads it.

## Grouping + ordering

Departments render in the order defined by `DEPARTMENT_ORDER`:

1. Sales
2. Planning
3. Purchasing
4. Production
5. QC
6. Logistics

Any department not in the canonical list is appended alphabetically at
the end. Within each department, employees are shown in the order
they first appear in the shift data.

## Filters

Three filters live inline in the summary strip:

- **Search box** — matches employee name, role, or department (case-insensitive).
- **Department dropdown** — filters to a single department; `all` is the default.
- **Week nav** — prev / current / next. Currently display-only (fires a toast) because mock data is week-agnostic.

## Cell interactions

- **Empty cell** — hovering reveals a `+` icon. Clicking adds a default
  day shift (`09:00–17:00`) for that employee × weekday.
- **Filled cell** — clicking removes **all** shifts in that cell
  (toast confirms). A follow-up UX pass should support editing a
  specific shift inline; currently toggle-off-then-add is the path.

## Colour legend

| Shift      | Dot colour                       | Chip background                   |
|------------|----------------------------------|-----------------------------------|
| Day        | `--mw-yellow-500`                | `--mw-yellow-50`                  |
| Afternoon  | `--mw-info`                      | 12% tint of `--mw-info`           |
| Night      | `--mw-mirage`                    | 10% tint of `--mw-mirage`         |

## Header actions

- **Prev / Current week badge / Next** — week navigation placeholder.
- **New shift** — primary action. Currently fires a "coming soon"
  toast until the shift-editor modal lands.

## Summary KPI strip

Three cards above the grid:
1. **Active staff** — distinct employee count in current filter.
2. **Shifts this week** — total shifts regardless of filter.
3. **Search + Department filter** — span-2 card with input + dropdown.

## Why this shape?

The prior implementation was a **work-centre × weekday** grid with
clickable toggle cells for day/arvo/night. That's useful for capacity
planning but misses the staffing question ("who is working Tuesday?").
The redesign flips the axes:

- Rows = who (employee + avatar + role + department)
- Cells = what shift + where (work centre)

This matches the way operations managers think about rostering and
lines up with Odoo's Planning and Fulcrum's scheduler. Work-centre
capacity is still visible because each shift chip carries its work
centre label; if we later need a work-centre view we can add a "Group
by" switch without changing the underlying data model.

## Known gaps

- **No persistence.** Add/remove interactions only mutate local state —
  they don't call a service. When Convex lands, wire
  `controlService.upsertEmployeeShift` and `deleteEmployeeShift`.
- **No shift editor.** Clicking a cell is toggle-only; no modal to set
  exact times / work centre / notes.
- **No week navigation.** All shifts are rendered irrespective of the
  current ISO week label. When real scheduling lands, shifts should
  carry a `date` (or `weekOf`) instead of just `dayOfWeek`.
- **No conflict detection.** Nothing warns if an employee is double-booked across two work centres on the same day.
- **Manager drag-to-copy / bulk-assign.** Common in Odoo/Fulcrum.
  Deferred.

## Related files

- `apps/web/src/components/control/ControlShiftManager.tsx`
- `apps/web/src/services/controlService.ts` — `getEmployeeShifts()`, `getShiftAssignments()`
- `apps/web/src/services/mock/data.ts` — `employeeShifts`, `shiftAssignments`
- `apps/web/src/types/entities.ts` — `EmployeeShift`, `ShiftAssignment`
