# Warehouse

## Summary
Warehouse screen. Behavior is documented from current component implementation.

## Route
`/ship/warehouse`

## User Intent
Complete warehouse work and move records to the next stage.

## Primary Actions
- Create or add records/items.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.

## Data Shown
- Shipment/fulfilment lifecycle data including carrier and return states.

## States
- default
- error
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.
