# Shipping

## Summary
Shipping screen. Behavior is documented from current component implementation.

## Route
`/ship/shipping`

## User Intent
Complete shipping work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Shipment/fulfilment lifecycle data including carrier and return states.

## States
- default
- loading
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
