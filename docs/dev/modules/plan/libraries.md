# Libraries — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/libraries.md -->

Developer-focused sections to extract:

- Components Used
- Logic / Behaviour
- Tab/query-param handling
- Dependencies

## Components Used
- `@/components/ui/tabs`
- `apps/web/src/components/plan/material-library/MaterialLibrary.tsx`
- `apps/web/src/components/plan/finish-library/FinishLibrary.tsx`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/plan/PlanLibraries.tsx`
- `apps/web/src/components/plan/material-library/MaterialLibrary.tsx`
- `apps/web/src/components/plan/finish-library/FinishLibrary.tsx`
