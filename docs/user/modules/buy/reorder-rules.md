# Reorder Rules

## Summary
Reorder Rules screen. Behavior is documented from current component implementation.

## Route
`/buy/reorder-rules`

## User Intent
Complete reorder rules work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Primary table/list region for records.

## Data Shown
- Order headers, statuses, due dates, quantities, and values.

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
