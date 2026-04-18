# dashboard (dev stub)

<!-- TODO: split dev-facing content out of the user-facing copy now at docs/user/modules/ship/dashboard.md. -->

## Components used

## Logic / behaviour

## Dependencies

## Mock data shapes

## Known gaps / migration TODOs

## Components Used
- `@/components/shared/ai/AIFeed`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/card.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/ship/ShipDashboard.tsx`
- `apps/web/src/components/ui/card.tsx`
