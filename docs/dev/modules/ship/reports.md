# reports (dev stub)

<!-- TODO: split dev-facing content out of the user-facing copy now at docs/user/modules/ship/reports.md. -->

## Components used

## Logic / behaviour

## Dependencies

## Mock data shapes

## Known gaps / migration TODOs

## Components Used
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`

## Logic / Behaviour
- Page is primarily presentational in current implementation.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Notes — Date range button wired (2026-05-08)

Per `206b09cc`, the **This Week / Date range** pill in the page header now toasts: `toast('Date range picker — coming soon')`. The Export button next to it was already wired in a prior pass. Replace with the real picker when added.

## Related Files
- `apps/web/src/components/ship/ShipReports.tsx`
