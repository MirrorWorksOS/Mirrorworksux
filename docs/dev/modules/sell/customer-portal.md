<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/customer-portal.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

## Components Used
- `@/components/sell/PortalQuoteDetail`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/table`
- `@/components/ui/tabs`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/sell/SellCustomerPortal.tsx`
