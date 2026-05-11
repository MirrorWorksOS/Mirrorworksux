# packaging (dev stub)

<!-- TODO: split dev-facing content out of the user-facing copy now at docs/user/modules/ship/packaging.md. -->

## Components used

## Logic / behaviour

## Dependencies

## Mock data shapes

## Known gaps / migration TODOs

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

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Notes — pack-station footer buttons wired (2026-05-08)

Per `206b09cc`, the two pack-station footer actions now toast:

| Button | Toast |
|---|---|
| **Park** | `toast('Job parked')` |
| **Complete & print label** (yellow CTA, gated by `allPacked`) | `toast.success('Label printed')` |

Each becomes a real call once `shipService.packaging.{park,complete}` exists.

## Related Files
- `apps/web/src/components/ship/ShipPackaging.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/utils.tsx`
