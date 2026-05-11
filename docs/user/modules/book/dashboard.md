# Book Dashboard

## Summary
Book Dashboard screen. Behavior is documented from current component implementation.

## Route
`/book`

## User Intent
Get a fast Book status snapshot and drill into exceptions.

## Primary Actions
- Review current records and execute available CTA actions.
- **View All Approvals** (Approvals card) opens the Expenses kanban (`/book/expenses`).
- **Sync Now** (Xero card) starts a Xero sync in the background; you'll see a confirmation toast.
- **Follow Up All** (Overdue card) queues follow-up emails to every overdue customer in the list.

> *2026-05-08 fix:* the three CTA buttons above used to look interactive but didn't respond to clicks. They now respond as described. Sync Now / Follow Up All toast for now while the backend wires land — the actual sync / email queue is the next step.

## Key UI Sections
- KPI/summary card strip.
- Charts and trend cards.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- error
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.
