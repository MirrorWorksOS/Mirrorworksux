# Buy Dashboard

## Summary
Buy Dashboard screen. Behavior is documented from current component implementation.

## Route
`/buy`

## User Intent
Get a fast Buy status snapshot and drill into exceptions.

## Primary Actions
- Review current records and execute available CTA actions.
- **Approval Queue → View All Approvals** opens the Requisitions list (`/buy/requisitions`).
- **Goods Awaiting Receipt → Go to Receipts** opens the Receipts list (`/buy/receipts`).
- **Bills Needing Matching → Go to Bills** opens the Bills list (`/buy/bills`).

> *2026-05-08 fix:* the three "Go to …" buttons above were silently dead before this date; clicking them did nothing. They now navigate as documented.

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
