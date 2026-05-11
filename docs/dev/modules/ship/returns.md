# returns (dev stub)

<!-- TODO: split dev-facing content out of the user-facing copy now at docs/user/modules/ship/returns.md. -->

## Components used

## Logic / behaviour

## Dependencies

## Mock data shapes

## Known gaps / migration TODOs

## Components Used
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/FilterBar`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Notes — RMA / approve / refund / contact wiring (2026-05-08)

Per `206b09cc`, four buttons that previously had no handler now toast:

| Surface | Button | Toast |
|---|---|---|
| Page header | **Create RMA** | `toast('Create RMA — coming soon')` |
| Side sheet (status `pending`) | **Approve return** | `toast.success('${selected.id} approved')` |
| Side sheet (status `received`) | **Process refund** | `toast.success('Refund issued for ${selected.id}')` |
| Side sheet (any status) | **Contact customer** | `toast('Contacting ${selected.customer}…')` |

Each gets a real call once `shipService.returns.{create,approve,refund,contactCustomer}` exists.

## Related Files
- `apps/web/src/components/ship/ShipReturns.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/utils.tsx`
