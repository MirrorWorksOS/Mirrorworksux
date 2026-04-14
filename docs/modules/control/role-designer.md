# Role Designer

## Summary
Role Designer screen. Behavior is documented from current component implementation.

## Route
`/control/role-designer`

## User Intent
Complete role designer work and move records to the next stage.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Charts and trend cards.

## Data Shown
- Configuration settings, rules, and system behavior controls.

## States
- default
- blocked
- populated

## Components Used
- `@/components/shared/layout/ModuleInfoCallout`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/utils`

## Logic / Behaviour
- Page is primarily presentational in current implementation.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/control/ControlRoleDesigner.tsx`
