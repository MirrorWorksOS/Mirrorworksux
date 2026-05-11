# Plan Dashboard

## Summary
Plan Dashboard screen. Behavior is documented from current component implementation.

## Route
`/plan`

## User Intent
Get a fast Plan status snapshot and drill into exceptions.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

### Quick actions (right column)

- **New Job** opens the Job creation form directly (was: opened the Jobs list).
- **View Tasks** opens the Schedule Engine.
- **NC Connect** opens the Machine I/O page on the *NC Connect* tab.
- **Backlog → View all** opens the Schedule Engine.

> *2026-05-08 fix:* New Job used to dump you on the Jobs list, and View Tasks / NC Connect went via legacy redirect URLs. Each now lands on the live screen directly.

## Key UI Sections
- KPI/summary card strip.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- error
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.
