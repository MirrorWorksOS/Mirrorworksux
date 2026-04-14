# Shift Manager

## Summary
Shift Manager screen. Behavior is documented from current component implementation.

## Route
`/control/shifts`

## User Intent
Complete shift manager work and move records to the next stage.

## Primary Actions
- Create or add records/items.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- Charts and trend cards.
- Form controls for editing/creation.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- success
- populated

## Components Used
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`
- `@/components/ui/badge`
- `@/components/ui/card`
- `@/components/ui/utils`

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
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/control/ControlShiftManager.tsx`
