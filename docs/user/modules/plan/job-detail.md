# Job Detail

## Summary
Job Detail screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/plan/jobs/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- Single content surface with route-specific controls.

## Data Shown
- Work-order/job execution data, machine context, and production statuses.

## States
- default
- blocked
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.
