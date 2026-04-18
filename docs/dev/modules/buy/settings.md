<!-- TODO: Dev stub pending content migration from docs/user/modules/buy/settings.md.
     The source file is Mixed (user + developer content). A human editor needs
     to split the dev-facing sections out to this file. Do not hand-copy blindly
     — the audit at docs/audits/dev/AUDIT-buy.md lists accuracy issues (e.g. the
     "No explicit store/service/hook dependency" line is factually wrong for
     nearly every Buy screen). Correct as you split. -->

# settings (dev)

## Route

## Component entrypoint

## Service layer

## Types

## Mock shape

## Stores / React Query keys

## Event flows

## Permission gate (ARCH 00 §4.8)

## Tier gate (Pilot / Produce / Expand / Excel)

## Migration status

## Testing

## Components Used
- `@/components/shared/settings/ModuleSettingsLayout`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/select.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/buy/BuySettings.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/select.tsx`
