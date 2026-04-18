# Book Invoices — dev stub

User doc: [`docs/user/modules/book/invoices.md`](../../../user/modules/book/invoices.md)

- **Route:** `/book/invoices`
- **Component:** `apps/web/src/components/book/BookInvoices.tsx`
- **Services used:** `sellInvoices`, `salesOrders`, `jobs` from `@/services`
- **Types:** local `Invoice`/`InvoiceStatus`; shadows `SellInvoice` in `entities.ts`
- **Overlap:** Same underlying `sellInvoices` pool as `/sell/invoices` (`SellInvoices.tsx`). Book view is the "finance lens" per `bookService.getInvoices` comment. See audit.
- **TODO:** consolidate invoice types; call `bookService.getInvoices()`; extract shared invoice list to a shared component; tier gate (Pilot+).

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/feedback/EmptyState`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/animated-icons.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/book/BookInvoices.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/animated-icons.tsx`
