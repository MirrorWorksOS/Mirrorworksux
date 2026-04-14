# Process Builder

## Summary
Process Builder screen. Current implementation includes mock/seed data paths.

## Route
`/control/process-builder`

## User Intent
Complete process builder work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Configuration settings, rules, and system behavior controls.
- Current page includes mock/seed data sources (inferred from code).

## States
- default
- loading
- empty
- error
- success
- populated

## Components Used
- `@/components/animate-ui/icons/blocks`
- `@/components/animate-ui/primitives/radix/sheet`
- `@/components/shared/ai/MirrorWorksAgentCard`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/toggle-group.tsx`
- `apps/web/src/components/ui/resizable.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/lib/platform/storage`

## Design / UX Notes
- Mock/seed records are present; edge-case realism may be limited.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/control/ControlProcessBuilder.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/toggle-group.tsx`
- `apps/web/src/components/ui/resizable.tsx`
- `apps/web/src/components/ui/utils.tsx`
