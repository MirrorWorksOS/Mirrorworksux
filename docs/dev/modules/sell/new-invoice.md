<!-- TODO: extract dev-oriented sections from docs/user/modules/sell/new-invoice.md -->

Sections to move from the user doc into this dev doc:

- Components Used
- Logic / Behaviour
- Dependencies
- States
- Known Gaps / Questions
- Related Files

## Components Used
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/select`
- `@/components/ui/table`
- `@/components/ui/textarea`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.

## Notes — unique line-row ids

`SellNewInvoice` initialises with `useState(() => [newRow(), newRow()])`. Both `newRow()` calls fire in the same millisecond, so an id derived from `Date.now()` alone produces duplicate React keys. Since `d5b9e766` (2026-05-08) the file uses a module-level counter:

```ts
let lineRowSeq = 0;
function newRow(): LineRow {
  lineRowSeq += 1;
  return { id: `li-${Date.now()}-${lineRowSeq}`, … };
}
```

Keep the counter when extracting `newRow` into a hook, or replace with `crypto.randomUUID()` once the surrounding tests / fixture stability allow.

## Related Files
- `apps/web/src/components/sell/SellNewInvoice.tsx`
