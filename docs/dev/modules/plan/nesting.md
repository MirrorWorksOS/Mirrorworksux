# Nesting — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/nesting.md -->

Developer-focused sections to extract:

- Components Used (SVG nest renderer)
- Logic / Behaviour
- Dependencies (`planService`, `NestingSheet`/`NestingPart` types)
- States

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/badge`
- `@/components/ui/card`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/plan/PlanNesting.tsx`
