# Job Cost Detail

## Summary
JOB-2026-0012 screen. This is a dynamic detail route. Behavior is documented from current component implementation.

## Route
`/book/job-costs/:id`

## User Intent
Inspect one record deeply and complete context-specific follow-up actions.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Charts and trend cards.
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Work-order/job execution data, machine context, and production statuses.

## States
- default
- blocked
- populated

## Components Used
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/FinancialTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/shared/ai/AIInsightCard.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
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
- `apps/web/src/components/book/JobCostDetail.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/shared/ai/AIInsightCard.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`
