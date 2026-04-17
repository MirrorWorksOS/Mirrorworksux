# Job Detail

## Summary
Job Detail screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/plan/jobs/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- Single content surface with route-specific controls.

## Data Shown
- Work-order/job execution data, machine context, and production statuses.

## States
- default
- blocked
- populated

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

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

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
