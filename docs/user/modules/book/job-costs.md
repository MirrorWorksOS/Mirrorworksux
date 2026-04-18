# Job Profitability

## Summary
Job profitability screen. Behavior is documented from current component implementation.

## Route
`/book/job-costs`

## User Intent
Complete job profitability work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Work-order/job execution data, machine context, and production statuses.

## States
- default
- success
- blocked
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.
