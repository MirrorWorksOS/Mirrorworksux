# new-order (dev)

Full purchase-order builder. Added 2026-04-22 (commit `03733e06`).

![/buy/orders/new](../../../audits/screenshots/buy/new-order.png)

## Route

`/buy/orders/new` — wired in `apps/web/src/routes.tsx` as a sibling of `/buy/orders` and `/buy/orders/:id`.

`BuyOrders.tsx` routes the toolbar "Create PO" button here via `useNavigate`.

## Component entrypoint

`apps/web/src/components/buy/BuyNewOrder.tsx` — lazy-loaded via `React.lazy` in routes.

Mirrors the structure of `SellNewQuote`: header fields · inline-editable line items · right-hand totals · agent recommendation bar.

## Shape

Top-level `BuyNewOrder()` function component, fully client-side. Local state only:

| State | Initial | Notes |
|---|---|---|
| `poNumber` | `nextPoNumber()` (memoised) | Derives next `PO-2026-NNNN` from `purchaseOrders` seed. |
| `supplierId` | `''` | Select from `suppliers` mock. On change, auto-populates payment terms. |
| `orderDate` | `'2026-04-22'` | Hard-coded "today" sentinel — matches the app-wide current-date convention. |
| `deliveryDate` | `addDays(today, 7)` | |
| `paymentTerms` | `'Net 30'` | Overridden by supplier default when available. |
| `shippingMethod` | `'Road Freight'` | |
| `deliveryAddress`, `jobId`, `supplierNotes`, `internalNotes` | `''` | |
| `lines` | `[newLine()]` | One empty `LineItem` row. |
| `poDraftId` | `po-draft-xxxxxx` (memoised) | Used as the `entityId` for all `auditService` calls. |

### `LineItem`

```ts
interface LineItem {
  id: string;               // random for React key
  productId: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxKey: 'gst' | 'gst_free' | 'export';
}
```

## Services / data

Imported from `@/services`:
- `products` — populates the Product select; on pick, copies description + unitPrice into the line.
- `suppliers` — supplier select + auto payment terms + contact for AI recommendation.
- `jobs` — optional job link.
- `purchaseOrders` — read to derive the next PO number.

Imported from `@/services/auditService`:
- `auditService.record(...)` — called on Save draft and Send to supplier (see Event flows).

## AI hooks

Static affordances — §8.2 / §8.3 of the approved plan. Both render conditionally:

| Hook | Trigger | Behaviour |
|---|---|---|
| Supplier recommendation | `supplierId === ''` and at least one non-empty line | Picks the highest-rated supplier (tie-break: on-time percent). Rendered via `AIInsightCard`. |
| Price anomaly | Any line with `unitPrice > product.unitPrice * 1.10` | Inline badge on the price cell + summary `AIInsightCard`. Threshold `ANOMALY_PCT = 0.10`. |

## Event flows

### Save draft (`saveDraft()`)

- Requires nothing beyond defaults (can save with zero lines).
- Records one audit event:
  ```ts
  auditService.record({
    actorId: 'emp-005',
    actorType: 'user',
    entityType: 'purchase_order',
    entityId: poDraftId,
    action: 'created',
    description: `Created purchase order ${poNumber} (draft)`,
    metadata: { poNumber, supplierId, lineCount, total },
  });
  ```
- Toast + `navigate('/buy/orders')`.

### Send to supplier (`sendToSupplier()`)

- Gated by `canSubmit = supplierId && nonEmptyLines.length > 0`. Shows a toast error if unmet.
- Records **two** audit events back-to-back: `created` and `sent` (with `metadata.recipient: supplier.email`).
- Toast + `navigate('/buy/orders')`.

Neither handler persists the PO itself — the mock `purchaseOrders` list is not mutated. Only `auditService.STORE` receives the events.

## Columns (MwDataTable)

`product (34%) · description (26%) · qty (8%) · unitPrice (12%) · tax · total · trash`

All cells are borderless inputs that surface their border on hover/focus — the "spreadsheet feel" shared with `SellNewQuote`.

## Totals

Right-hand column recomputes on every render:
- `subtotal = Σ qty × unitPrice`
- `tax = Σ qty × unitPrice × taxOption.rate` (per-line tax, not a flat rate)
- `total = subtotal + tax`

## Confirm dialog

Uses `@/components/shared/feedback/ConfirmDialog` wrapping Send — confirms supplier + total before dispatching.

## Permission gate (ARCH 00 §4.8)

Pending — no role gate wired. Follow-up: restrict to `admin` + `lead` in the Buy module via the standard access-role vocabulary (admin / lead / team).

## Tier gate

Pending — expected to be Produce+ when the tier-gate middleware lands.

## Testing

No unit tests yet. Manual flow:
1. Navigate to `/buy/orders` and click "Create PO".
2. Leave supplier empty, add a product line → AI supplier recommendation card appears.
3. Pick a supplier → card disappears, payment terms auto-filled from supplier.
4. Set a line price more than 10% above the product catalogue price → anomaly badge + summary card appear.
5. Send → toast, return to orders list, open the new `po-draft-*` id (not in orders list; only audit log) — or verify via the Order detail Activity tab on an existing PO to confirm the shared Audit surface works.

## Known gaps

- Audit events use `entityId: poDraftId` rather than the real PO id that will be assigned server-side. When Supabase lands the handler needs to `insert` the PO, capture the returned id, and pass it to `auditService.record`.
- Lines don't validate that qty > 0 or unitPrice > 0 on submit.
- No supplier-specific price list yet — MVP uses the catalogue unit price regardless of supplier.
- The delivery-date default is always today+7; no calendar-aware business-day logic.

## Related files

- `apps/web/src/components/buy/BuyNewOrder.tsx`
- `apps/web/src/components/buy/BuyOrders.tsx` — launches this route.
- `apps/web/src/components/buy/BuyOrderDetail.tsx` — reads the same `auditService` store.
- [AuditTimeline shared dev doc](../../shared/audit-timeline.md)
