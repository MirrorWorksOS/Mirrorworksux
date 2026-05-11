# Returns

## Summary
Returns screen. Behavior is documented from current component implementation.

## Route
`/ship/returns`

## User Intent
Complete returns work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Use modal/sheet interactions for edits and quick actions.

### Side-sheet actions (per return)

- **Approve return** — visible while the return is `pending`. Toasts confirmation today; will move the return to *received*.
- **Process refund** — visible while the return is `received`. Toasts a refund-issued confirmation.
- **Contact customer** — visible at every status. Surfaces the customer name in the toast as a stand-in for opening a real reach-out.
- **Create RMA** (page header) — opens the RMA flow (currently a "coming soon" toast).

> *2026-05-08 fix:* all four buttons above were silently dead before this date. They now respond — three with action toasts, one with a placeholder. The actual server-side approve / refund / messaging wiring is the next step.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Shipment/fulfilment lifecycle data including carrier and return states.

## States
- default
- success
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.
