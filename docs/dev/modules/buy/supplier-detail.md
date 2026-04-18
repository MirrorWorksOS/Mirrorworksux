<!-- TODO: Dev stub pending content migration from docs/user/modules/buy/supplier-detail.md.
     The source file is Mixed (user + developer content). A human editor needs
     to split the dev-facing sections out to this file. Do not hand-copy blindly
     — the audit at docs/audits/dev/AUDIT-buy.md lists accuracy issues (e.g. the
     "No explicit store/service/hook dependency" line is factually wrong for
     nearly every Buy screen). Correct as you split. -->

# supplier-detail (dev)

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
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/JobWorkspaceLayout`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/label`
- `@/components/ui/table`
- `@/components/ui/utils`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/buy/BuySupplierDetail.tsx`
