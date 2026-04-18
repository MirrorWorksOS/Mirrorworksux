# Quote Detail

## Summary
Quote Detail screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/sell/quotes/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Open related pages and record detail views.

## Key UI Sections
- Primary table/list region for records.
- Embedded AI/assistant insight panels.

## Data Shown
- Quote lines, pricing assumptions, revision/approval signals.

## States
- default
- loading
- error
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
