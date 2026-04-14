# Maintenance

## Summary
Maintenance screen. Behavior is documented from current component implementation.

## Route
`/control/maintenance`

## User Intent
Complete maintenance work and move records to the next stage.

## Primary Actions
- Switch tabs/sub-views within the page.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Primary table/list region for records.
- Tabbed content regions.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- error
- success
- populated

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/badge`
- `@/components/ui/card`
- `@/components/ui/table`
- `@/components/ui/tabs`
- `@/components/ui/utils`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.
- Mode/tab switching is implemented through local state and/or query params.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/control/ControlMaintenance.tsx`
