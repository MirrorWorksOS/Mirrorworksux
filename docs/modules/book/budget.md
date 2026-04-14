# Budget Overview

## Summary
Budgets screen. Current implementation includes mock/seed data paths.

## Route
`/book/budget`

## User Intent
Complete budget overview work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Primary table/list region for records.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- error
- success
- populated

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/ProgressBar`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/book/BudgetOverview.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/ui/animated-icons.tsx`
