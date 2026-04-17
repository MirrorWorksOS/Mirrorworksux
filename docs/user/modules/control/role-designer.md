# Role Designer

## Summary

This feature has been retired from the prototype navigation. Access is now managed through Control → People (users and groups) and each module’s Settings → Access & Permissions.

## Previous Route
`/control/role-designer`

## Status
Deprecated and removed from active navigation and routing.

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
