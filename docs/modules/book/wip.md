# WIP Valuation

## Summary
WIP Valuation screen. Behavior is documented from current component implementation.

## Route
`/book/wip`

## User Intent
Complete wip valuation work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Primary table/list region for records.
- Charts and trend cards.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- success
- populated

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/card`
- `@/components/ui/table`
- `@/components/ui/utils`

## Logic / Behaviour
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
- `apps/web/src/components/book/BookWipValuation.tsx`
