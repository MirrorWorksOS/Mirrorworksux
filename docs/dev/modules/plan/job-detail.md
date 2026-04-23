# Job Detail — developer stub

<!-- TODO: extract dev sections from docs/user/modules/plan/job-detail.md -->

Developer-focused sections to extract:

- Components Used
- Logic / Behaviour
- Dependencies (stores/services/hooks)
- States
- Route params (`:id`)

## Production tab rebuild (2026-04-22)

`PlanProductionTab` was collapsed from three nested tab bars + a modal BOM into a single view built around the shared `<BomRoutingTree mode="plan" />`. The 3D `GlbViewer` and 2D `DrawingViewer` sit below the tree as visual aids (sample asset at `public/models/diff.glb`).

See [BomRoutingTree dev doc](./bom-routing-tree.md) and [3D viewers dev doc](../../shared/3d-viewers.md).

![Production tab — BomRoutingTree + operations rail](../../../audits/screenshots/plan/job-detail-production.png)

## Components Used
- `@/components/plan/BomRoutingTree` *(added 2026-04-22 to PlanProductionTab)*
- `@/components/shared/3d/GlbViewer` *(new 2026-04-22)*
- `@/components/shared/3d/DrawingViewer` *(new 2026-04-22)*
- `@/components/shared/product/BomOverlay` *(new 2026-04-22)*
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
