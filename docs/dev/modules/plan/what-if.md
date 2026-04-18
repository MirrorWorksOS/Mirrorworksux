# What-if — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/what-if.md -->

Developer-focused sections to extract:

- Components Used (`RushOrderPanel`)
- Logic / Behaviour
- Dependencies
- Mock/seed data paths
- States

## Components Used
- `@/components/plan/RushOrderPanel`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/select`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/plan/PlanWhatIf.tsx`
