# Factory Layout

## Summary
Factory Layout screen. Current implementation includes mock/seed data paths.

## Route
`/control/factory-layout`

## User Intent
Complete factory layout work and move records to the next stage.

## Primary Actions
- Open related pages and record detail views.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Form controls for editing/creation.

## Data Shown
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- loading
- error
- success
- blocked
- populated

## Components Used
- `@/components/animate-ui/icons/cog`
- `@/components/animate-ui/primitives/animate/tooltip`
- `@/components/animate-ui/primitives/radix/sheet`
- `@/components/ui/button`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/resizable`
- `@/components/ui/select`
- `@/components/ui/slider`
- `@/components/ui/switch`
- `@/components/ui/toggle-group`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Client-side sorting/grouping appears in list preparation.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/lib/platform/storage`

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.

## Related Files
- `apps/web/src/components/control/ControlFactoryDesigner.tsx`
