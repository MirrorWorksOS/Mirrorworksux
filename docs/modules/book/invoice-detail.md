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

## Components Used
- `@/components/shared/data/FinancialTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/separator.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.
- Dynamic route exists but robust data loading/error recovery is not obvious in this component.

## Related Files
- `apps/web/src/components/book/InvoiceDetail.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/separator.tsx`
- `apps/web/src/components/ui/utils.tsx`
