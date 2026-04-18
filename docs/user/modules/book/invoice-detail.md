# Invoice Detail

## Summary
INV-2026-0045 screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/book/invoices/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.

## Data Shown
- Invoice amounts, payment status, and aging details.

## States
- default
- error
- blocked
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
