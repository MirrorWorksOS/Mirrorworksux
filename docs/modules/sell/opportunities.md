# Opportunities

## Summary
Opportunities screen. Current implementation includes mock/seed data paths.

## Route
`/sell/opportunities`

## User Intent
Complete opportunities work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- Page header with title, subtitle, and action buttons.

## Data Shown
- Opportunity pipeline status, value, probability, and tasks.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- empty
- populated

## Components Used
- `@/components/shared/feedback/EmptyState`
- `@/components/shared/kanban/KanbanBoard`
- `@/components/shared/kanban/KanbanCard`
- `@/components/shared/kanban/KanbanColumn`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/layout/ToolbarFilterButton`
- `@/components/shared/layout/ToolbarPrimaryButton`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/sell/sell-opportunity-types.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/sell/SellOpportunities.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/avatar.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/sell/sell-opportunity-types.tsx`
