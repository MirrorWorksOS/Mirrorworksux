<!-- TODO: Dev stub pending content migration from docs/user/modules/buy/orders.md.
     The source file is Mixed (user + developer content). A human editor needs
     to split the dev-facing sections out to this file. Do not hand-copy blindly
     — the audit at docs/audits/dev/AUDIT-buy.md lists accuracy issues (e.g. the
     "No explicit store/service/hook dependency" line is factually wrong for
     nearly every Buy screen). Correct as you split. -->

# orders (dev)

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

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/ToolbarFilterButton`
- `@/components/shared/layout/ToolbarPrimaryButton`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/button.tsx`
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
- `apps/web/src/components/buy/BuyOrders.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/animated-icons.tsx`
