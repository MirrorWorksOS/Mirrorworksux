# Floor Run

## Summary
Floor Run screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/floor/run/:workOrderId`

## User Intent
Run operator workflows quickly in kiosk mode with minimal office complexity.

## Primary Actions
- Open related pages and record detail views.
- Progress kiosk flow from sign-in/station selection to work execution.

## Key UI Sections
- Operator-first kiosk surface with reduced office chrome.

## Data Shown
- Order headers, statuses, due dates, quantities, and values.
- Work-order/job execution data, machine context, and production statuses.

## States
- default
- loading
- error
- success
- mobile/responsive differences
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.
