# Plan Dashboard — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/dashboard.md -->

Developer-focused sections to extract:

- Components Used
- Logic / Behaviour
- Dependencies (stores/services/hooks)
- States

## Components Used
- `@/components/plan/BomGenerator`
- `@/components/plan/PlanCapableToPromise`
- `@/components/plan/PlanOperationRouting`
- `@/components/plan/PlanShiftCalendar`
- `@/components/plan/PlanSubcontracting`
- `@/components/shared/ai/AIFeed`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/motion/motion-variants`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/plan/PlanDashboard.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/button.tsx`
