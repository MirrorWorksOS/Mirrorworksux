# Invoice Detail — dev stub

User doc: [`docs/user/modules/book/invoice-detail.md`](../../../user/modules/book/invoice-detail.md)

- **Route:** `/book/invoices/:id`
- **Component:** `apps/web/src/components/book/InvoiceDetail.tsx`
- **Services used:** none — static `lineItems` and header literal `INV-2026-0045`
- **Types:** local `LineItem`
- **Known bugs:**
  - Title is hard-coded; does not use `:id` route param.
  - `Record Payment` button shows toast only (`Payment recording form coming soon`).
- **TODO:** read `useParams().id`; call `bookService.getInvoiceById`; wire payment modal; tier gate.

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
