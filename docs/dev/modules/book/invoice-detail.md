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
