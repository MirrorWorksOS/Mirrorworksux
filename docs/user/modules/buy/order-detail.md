# Purchase Order Detail

## Summary
Purchase Order Detail screen. This is a dynamic detail route. Current implementation includes mock/seed data paths.

## Route
`/buy/orders/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Open related pages and record detail views.

## Key UI Sections
- **Overview** — order details, line items summary, notes, recent activity (3 latest events), related documents, order value, status timeline, supplier performance insight.
- **Line Items** — full table with ordered/received/unit price/total/status columns and ordered-vs-value summary.
- **Delivery** — tracking info, receiving progress bar, per-line receiving detail.
- **Activity** — full append-only history timeline, comments placeholder.

A "View full history" button on Overview and a drawer trigger in the header both open a right-side drawer with the full timeline, filter pills (All / Changes / Approvals / Activity), and an Export action.

## Data Shown
- Order headers, statuses, due dates, quantities, and values.
- History: every creation, amendment, approval, send, receipt, and supplier-acknowledge event, with actor, relative timestamp, and before→after field diffs where applicable.
- Current page uses mock/seed data; the history store resets on reload.

## States
- default
- empty
- error
- success
- populated

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.
