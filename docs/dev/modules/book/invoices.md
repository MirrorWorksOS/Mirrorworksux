# Book Invoices — dev stub

User doc: [`docs/user/modules/book/invoices.md`](../../../user/modules/book/invoices.md)

- **Route:** `/book/invoices`
- **Component:** `apps/web/src/components/book/BookInvoices.tsx`
- **Services used:** `sellInvoices`, `salesOrders`, `jobs` from `@/services`
- **Types:** local `Invoice`/`InvoiceStatus`; shadows `SellInvoice` in `entities.ts`
- **Overlap:** Same underlying `sellInvoices` pool as `/sell/invoices` (`SellInvoices.tsx`). Book view is the "finance lens" per `bookService.getInvoices` comment. See audit.
- **TODO:** consolidate invoice types; call `bookService.getInvoices()`; extract shared invoice list to a shared component; tier gate (Pilot+).
