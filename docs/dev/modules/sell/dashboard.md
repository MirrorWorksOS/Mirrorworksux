<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/dashboard.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

## Components Used
- `@/components/sell/WinLossAnalysis`
- `@/components/shared/ai/AIFeed`
- `@/components/shared/ai/AISuggestion`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/data/ProgressBar`
- `@/components/shared/icons/IconWell`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/badge.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/sell/SellDashboard.tsx`
- `apps/web/src/components/ui/tabs.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
