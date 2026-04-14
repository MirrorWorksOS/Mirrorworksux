# Machine I/O

## Summary
Machine I/O screen. Behavior is documented from current component implementation.

## Route
`/plan/machine-io`

## User Intent
Complete machine i/o work and move records to the next stage.

## Primary Actions
- Open related pages and record detail views.
- Switch tabs/sub-views within the page.

## Key UI Sections
- Tabbed content regions.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- populated

## Components Used
- `@/components/ui/tabs`
- `apps/web/src/components/plan/PlanCADImport.tsx`
- `apps/web/src/components/plan/PlanNCConnect.tsx`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
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
- `apps/web/src/components/plan/PlanMachineIO.tsx`
- `apps/web/src/components/plan/PlanCADImport.tsx`
- `apps/web/src/components/plan/PlanNCConnect.tsx`
