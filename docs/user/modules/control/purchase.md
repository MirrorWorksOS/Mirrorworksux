# Purchase Control

## Summary
Purchase Control screen. Behavior is documented from current component implementation.

## Route
`/control/purchase`

## User Intent
Complete purchase control work and move records to the next stage.

## Primary Actions
- Create or add records/items.

## Key UI Sections
- Form controls for editing/creation.

## Data Shown
- Procurement transactions, supplier records, and sourcing comparisons.

## States
- default
- success
- populated

## Components Used
- `@/components/shared/motion/motion-variants`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/separator.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
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
- `apps/web/src/components/control/ControlPurchase.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/separator.tsx`
- `apps/web/src/components/ui/utils.tsx`
