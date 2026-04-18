# Purchase Orders (Book) — dev stub

User doc: [`docs/user/modules/book/purchases.md`](../../../user/modules/book/purchases.md)

- **Route:** `/book/purchases`
- **Component:** `apps/web/src/components/book/PurchaseOrders.tsx`
- **Services used:** none (local `POS` array)
- **Types:** local `PO`, `POStatus` — no entry in `entities.ts`
- **Overlap:** Conceptually overlaps with Buy module PO surface. Book view is finance-focused (match status, totals).
- **TODO:** add `bookService.getBills`/`getPurchaseOrders`; unify `POStatus` across Buy and Book; tier gate.

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/book/PurchaseOrders.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/utils.tsx`
