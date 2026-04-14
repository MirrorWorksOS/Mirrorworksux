# Returns

## Summary
Returns screen. Behavior is documented from current component implementation.

## Route
`/ship/returns`

## User Intent
Complete returns work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Shipment/fulfilment lifecycle data including carrier and return states.

## States
- default
- success
- populated

## Components Used
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/FilterBar`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Related Files
- `apps/web/src/components/ship/ShipReturns.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/utils.tsx`
