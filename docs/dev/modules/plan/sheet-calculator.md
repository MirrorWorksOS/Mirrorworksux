# Sheet Calculator — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/sheet-calculator.md -->

Developer-focused sections to extract:

- Components Used
- Logic / Behaviour (calculation formulas)
- Dependencies
- States

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/badge`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/label`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/plan/PlanSheetCalculator.tsx`
