# Tracking

## Summary
Tracking screen. Behavior is documented from current component implementation.

## Route
`/ship/tracking`

## User Intent
Complete tracking work and move records to the next stage.

## Primary Actions
- Search and filter records.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.

## Data Shown
- Shipment/fulfilment lifecycle data including carrier and return states.

## States
- default
- error
- success
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/schedule/TimelineView`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
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
- `apps/web/src/components/ship/ShipTracking.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/sheet.tsx`
- `apps/web/src/components/ui/utils.tsx`
