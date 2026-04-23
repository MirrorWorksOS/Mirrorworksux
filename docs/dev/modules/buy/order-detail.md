<!-- TODO: Dev stub pending content migration from docs/user/modules/buy/order-detail.md.
     The source file is Mixed (user + developer content). A human editor needs
     to split the dev-facing sections out to this file. Do not hand-copy blindly
     — the audit at docs/audits/dev/AUDIT-buy.md lists accuracy issues (e.g. the
     "No explicit store/service/hook dependency" line is factually wrong for
     nearly every Buy screen). Correct as you split. -->

# order-detail (dev)

## Route

## Component entrypoint

## Service layer

## Types

## Mock shape

## Stores / React Query keys

## Event flows

## Permission gate (ARCH 00 §4.8)

## Tier gate (Pilot / Produce / Expand / Excel)

## Migration status

## Testing

## Tabs

`overview | line-items | delivery | activity` — defined by `DEFAULT_TABS` at the top of the file. Tab counts: line-items renders the array length; activity renders `auditService.list('purchase_order', id).length`.

## Audit integration (2026-04-22)

- Overview tab renders `<AuditTimeline variant="mini" limit={3} />` in the "Recent activity" card.
- Activity tab renders `<AuditTimeline variant="full" />`.
- Header has a drawer trigger that opens `<AuditTimelineSheet>` with the PO's full history, filter pills, and an Export stub.

All three surfaces read the same `auditService` store — see [audit-timeline shared dev doc](../../shared/audit-timeline.md).

## Components Used
- `@/components/shared/audit/AuditTimeline` *(added 2026-04-22)*
- `@/components/shared/audit/AuditTimelineSheet` *(added 2026-04-22)*
- `@/components/shared/ai/AIInsightCard`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/layout/JobWorkspaceLayout`
- `@/components/ui/badge` / `button` / `card` / `input` / `label` / `table` / `utils`

## Logic / Behaviour
- Tab state (`activeTab`) and history-drawer state (`historyOpen`) live in the component.
- `auditService.list(...)` is called once per render to derive the Activity tab badge count.
- Routing links and back navigation are handled in-component.

## Dependencies
- `@/services` (`purchaseOrders` seed)
- `@/services/auditService` (list + record)

## Known Gaps / Questions
- Write actions (Edit, Approve, Receive, Print) still resolve to toast stubs — no mutation wiring.
- Comment submit is a toast stub (no persistence).
- Audit store is in-memory; events from one session are lost on reload.

## Related Files
- `apps/web/src/components/buy/BuyOrderDetail.tsx`
- `apps/web/src/components/buy/BuyNewOrder.tsx` — writes audit events that this page reads.
- [AuditTimeline shared dev doc](../../shared/audit-timeline.md)
