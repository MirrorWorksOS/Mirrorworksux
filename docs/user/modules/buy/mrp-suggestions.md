# MRP Suggestions

## Summary
MRP Suggestions screen. Behavior is documented from current component implementation.

## Route
`/buy/mrp-suggestions`

## User Intent
Complete mrp suggestions work and move records to the next stage.

## Primary Actions
- Create or add records/items.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Primary table/list region for records.

## Data Shown
- Planning calculations, schedule allocations, and what-if outputs.

## States
- default
- loading
- error
- success
- blocked
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.
