<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/customer-detail.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

## Components Used
- `@/components/shared/ai/AIFeed`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/data/FinancialTable`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/tabs.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Notes — `/sell/crm/new` create flow

`createBlankCustomer()` in `SellCustomerDetail.tsx` **must include `documents: []`** in the seeded record. The Documents tab badge reads `customer.documents.length` directly; before `f622b52a` (2026-05-08) the field was missing and `/sell/crm/new` threw into the React Router error boundary on first render.

If new collection-shaped fields (invoices, activity, recentOrders, documents, …) are added to the customer entity, every read site must also be added to `createBlankCustomer()`'s seed object.

## Related Files
- `apps/web/src/components/sell/SellCustomerDetail.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/dropdown-menu.tsx`
- `apps/web/src/components/ui/alert-dialog.tsx`
