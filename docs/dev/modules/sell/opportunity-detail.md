<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/opportunity-detail.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

## Components Used
- `@/components/sell/SellOpportunityRecommendedActions`
- `@/components/sell/sell-opportunity-agent-feed`
- `@/components/shared/ai/AIFeed`
- `@/components/shared/ai/AIInsightCard`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/layout/JobWorkspaceLayout`
- `@/components/shared/schedule/TimelineView`
- `@/components/ui/avatar`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/table`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/sell/SellOpportunityPage.tsx`
- `apps/web/src/components/sell/sell-opportunity-types.tsx`
