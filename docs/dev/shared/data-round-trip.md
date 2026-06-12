# Data round-trip — export → edit → re-import

**Status:** shipped 2026-06-12 · **Owner:** shared/platform
**Code:** `apps/web/src/lib/round-trip/` (pure logic) + `apps/web/src/components/shared/round-trip/DataRoundTrip.tsx` (UI)
**Live integrations:** Control → Products (`productsRoundTripAdapter.ts`), Control → Inventory (`inventoryRoundTripAdapter.ts`)

## What it is

A shared bulk-edit pattern for any tabular page: the user exports the
current dataset to CSV, edits it in a spreadsheet, re-uploads it, and the
component walks them through **column mapping → diff preview → apply**.
Nothing changes until the user has seen exactly what will change.

```
Export CSV ──► edit externally ──► Upload ──► Map columns ──► Review diff ──► Apply
                                              (auto-suggested)  adds / changes /   result
                                                                removals + warnings  summary
```

The same flow is intended for Products, Inventory balances, Quotes,
Invoices — anything with a list view and a service behind it.

## Behaviour you get for free

- **Header mapping with suggestions** — the matcher handles spreadsheet-isms
  ("Part No" → `part_number`, "Std Cost" → `standard_cost`, "Qty On Hand" →
  `qty`) via normalized containment plus a token/alias pass. It is the same
  heuristic the Bridge wizard uses (`bridgeService.generateMappings` delegates
  to `matchHeaderToField`). Unmatched columns default to *Skip*; the user can
  remap anything.
- **Upsert semantics** — unmapped columns and empty cells leave existing
  values untouched; they are never treated as "cleared".
- **Diff preview** — adds (green), changes (amber, per-field before → after),
  and removals (red). Rows can be excluded with a checkbox before applying.
- **Removals are opt-in** — partial uploads are the common case, so rows
  missing from the file are *excluded by default*; the user must tick them.
  Adapters opt into removal handling at all via `removalPolicy: 'apply'`
  and describe the consequence (`removalDescription`), e.g. Products marks
  inactive, Inventory zeroes the balance. Default policy is `'ignore'`.
- **Validation** — required-column checks are automatic; adapter
  `validateRow` adds domain rules (e.g. "Unit cost cannot be negative").
  Rows with warnings are flagged in the preview and **auto-skipped** on apply.
- **Duplicate keys** in the upload: last row wins, the preview says so.
- **Result summary** — applied count + per-row skip reasons.

CSV only for now (no XLSX parser dependency exists in the repo). The parse
layer is isolated in `lib/round-trip/csv.ts`, so adding XLSX later means
swapping one function.

## Adding an adapter (~50 lines)

1. **Flatten your entity** into a `FlatRow` (one CSV-able record — strings,
   numbers, booleans).
2. Implement `DataRoundTripAdapter` (see `lib/round-trip/types.ts`):

```ts
import { controlService } from '@/services';
import type { DataRoundTripAdapter, FlatRow, RowDiff } from '@/lib/round-trip';

interface QuoteRow extends FlatRow { quote_number: string; customer: string; total: number; }

export const quotesRoundTripAdapter: DataRoundTripAdapter<QuoteRow> = {
  entity: 'quotes',
  entityLabel: 'Quotes',
  exportFileName: 'quotes',
  keyColumns: ['quote_number'],               // diff identity (case-insensitive)
  columns: [
    { key: 'quote_number', label: 'Quote number', required: true },
    { key: 'customer', label: 'Customer', required: true },
    { key: 'total', label: 'Total', type: 'number' },   // type drives cell coercion
  ],
  async fetchRows() { /* service → QuoteRow[] */ },
  validateRow(row) { return row.total !== undefined && row.total < 0 ? ['Total cannot be negative'] : []; },
  async applyDiffs(diffs: RowDiff<QuoteRow>[]) {
    // diff.kind: 'add' | 'change' | 'remove'; diff.after is the incoming row.
    // Call your service per diff; return { applied, skipped: [{key, error}] }.
  },
};
```

3. **Mount it** on the page:

```tsx
import { DataRoundTrip, exportAdapterCsv } from '@/components/shared/round-trip/DataRoundTrip';

<Button onClick={() => exportAdapterCsv(quotesRoundTripAdapter)}>Export</Button>
<DataRoundTrip adapter={quotesRoundTripAdapter} onApplied={refresh} />
```

The reference implementation is `apps/web/src/components/control/productsRoundTripAdapter.ts`
(95 lines including the apply plumbing) consumed by `ControlProducts.tsx`.

## Design notes

- **Why flat rows, not domain entities?** CSV is flat; forcing the adapter
  to flatten keeps the shared engine free of per-entity knowledge, and the
  diff/preview/serialize layers stay trivially generic.
- **Why adapter-applied diffs instead of a generic upsert?** Apply semantics
  are domain decisions (Products: removal = deactivate; Inventory: every
  change must land as an auditable stock movement). The adapter owns them.
- **Mock-service constraint** — adapters write through `@/services` facades
  only, matching the repo's mock → remote adapter pattern. No Convex.
- **Relationship to Bridge** — Bridge is day-1 onboarding (multi-entity,
  AI-assisted, session-based). Round-trip is day-N bulk editing of one
  entity. They share the header matcher; they intentionally do not share UI.
