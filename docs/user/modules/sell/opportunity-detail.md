# Opportunity Detail

## Summary
Opportunity Detail screen. This is a dynamic detail route. Current implementation includes mock/seed data paths.

## Route
`/sell/opportunities/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- Primary table/list region for records.
- Charts and trend cards.
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Opportunity pipeline status, value, probability, and tasks.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- error
- success
- populated

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

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/sell/SellOpportunityPage.tsx`
- `apps/web/src/components/sell/sell-opportunity-types.tsx`
