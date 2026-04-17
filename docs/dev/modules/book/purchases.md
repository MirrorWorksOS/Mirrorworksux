# Purchase Orders (Book) — dev stub

User doc: [`docs/user/modules/book/purchases.md`](../../../user/modules/book/purchases.md)

- **Route:** `/book/purchases`
- **Component:** `apps/web/src/components/book/PurchaseOrders.tsx`
- **Services used:** none (local `POS` array)
- **Types:** local `PO`, `POStatus` — no entry in `entities.ts`
- **Overlap:** Conceptually overlaps with Buy module PO surface. Book view is finance-focused (match status, totals).
- **TODO:** add `bookService.getBills`/`getPurchaseOrders`; unify `POStatus` across Buy and Book; tier gate.
