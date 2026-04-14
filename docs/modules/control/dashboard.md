# Control Dashboard

## Summary
Control Dashboard screen. Behavior is documented from current component implementation.

## Route
`/control`

## User Intent
Get a fast Control status snapshot and drill into exceptions.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- KPI/summary card strip.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- error
- blocked
- populated

## Components Used
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/dashboard/ModuleDashboard`
- `@/components/shared/dashboard/ModuleQuickNav`
- `@/components/shared/layout/ModuleInfoCallout`
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/badge.tsx`

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
- `apps/web/src/components/control/ControlDashboard.tsx`
- `apps/web/src/components/ui/badge.tsx`
