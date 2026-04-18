# Job Detail — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/job-detail.md -->

Developer-focused sections to extract:

- Components Used
- Logic / Behaviour
- Dependencies (stores/services/hooks)
- States
- Route params (`:id`)

## Components Used
- `@/components/shared/data/ProgressBar`
- `@/components/shared/layout/JobWorkspaceLayout`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/plan/PlanOverviewTab.tsx`
- `apps/web/src/components/plan/PlanProductionTab.tsx`
- `apps/web/src/components/plan/PlanScheduleTab.tsx`
- `apps/web/src/components/plan/PlanIntelligenceHubTab.tsx`
- `apps/web/src/components/plan/PlanBudgetTab.tsx`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Dynamic route exists but robust data loading/error recovery is not obvious in this component.

## Related Files
- `apps/web/src/components/plan/PlanJobDetail.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/plan/PlanOverviewTab.tsx`
- `apps/web/src/components/plan/PlanProductionTab.tsx`
- `apps/web/src/components/plan/PlanScheduleTab.tsx`
- `apps/web/src/components/plan/PlanIntelligenceHubTab.tsx`
- `apps/web/src/components/plan/PlanBudgetTab.tsx`
