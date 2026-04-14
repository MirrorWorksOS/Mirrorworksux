# Shipping

## Summary
Shipping screen. Behavior is documented from current component implementation.

## Route
`/ship/shipping`

## User Intent
Complete shipping work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Primary table/list region for records.
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Shipment/fulfilment lifecycle data including carrier and return states.

## States
- default
- loading
- success
- populated

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/data/StatusBadge`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/TextSegmentedControl`
- `@/components/shared/surfaces/SpotlightCard`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/ship/ShipShipping.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/utils.tsx`
