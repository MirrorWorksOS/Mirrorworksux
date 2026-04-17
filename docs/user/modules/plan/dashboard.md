# Plan Dashboard

## Summary
Plan Dashboard screen. Behavior is documented from current component implementation.

## Route
`/plan`

## User Intent
Get a fast Plan status snapshot and drill into exceptions.

## Primary Actions
- Create or add records/items.
- Open related pages and record detail views.

## Key UI Sections
- KPI/summary card strip.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- error
- populated

## Components Used
- `@/components/plan/BomGenerator`
- `@/components/plan/PlanCapableToPromise`
- `@/components/plan/PlanOperationRouting`
- `@/components/plan/PlanShiftCalendar`
- `@/components/plan/PlanSubcontracting`
- `@/components/shared/ai/AIFeed`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/motion/motion-variants`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/plan/PlanDashboard.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/button.tsx`
