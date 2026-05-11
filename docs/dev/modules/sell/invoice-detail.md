<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/invoice-detail.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

## Components Used
- `@/components/shared/layout/JobWorkspaceLayout`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/table`
- `@/components/ui/tooltip`
- `@/components/ui/utils`

## Logic / Behaviour
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Page appears mock/seed-backed; production API integration path is unclear from this file alone.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.
- Dynamic route exists but robust data loading/error recovery is not obvious in this component.

## Notes — list-row id collisions

`handleAddLineItem` and `handleRecordPayment` previously used `id: \`il-${Date.now()}\`` / `\`pe-${Date.now()}\``. Two clicks within the same millisecond produced duplicate React keys ("Encountered two children with the same key"). Since `d5b9e766` (2026-05-08) the ids are suffixed with `prev.length`:

```ts
{ id: `il-${Date.now()}-${prev.length}`, … }
{ id: `pe-${Date.now()}-${prev.length}`, … }
```

Apply the same pattern when adding new push-to-array list editors on this page.

## Related Files
- `apps/web/src/components/sell/SellInvoiceDetail.tsx`
