# Packaging

## Summary
Packaging screen. Behavior is documented from current component implementation.

## Route
`/ship/packaging`

## User Intent
Complete packaging work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Form controls for editing/creation.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- success
- blocked
- populated

## Components Used
- `@/components/shared/barcode/ScanInput`
- `@/components/shared/checklist/Checklist`
- `@/components/shared/checklist/ChecklistItem`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
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
- `apps/web/src/components/ship/ShipPackaging.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/utils.tsx`
