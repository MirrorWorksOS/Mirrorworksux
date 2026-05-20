# ModuleFilterBar

Schema-driven filter strip used by every module list page. See [ADR-001](../../audits/adr/ADR-001-module-filter-bar.md) for the rationale.

## Location

`apps/web/src/components/shared/filters/`

```
AddFilterMenu.tsx     Dropdown that lists available facets
DateChip.tsx          Date-range chip
FacetChip.tsx         Enum / multi-select chip
ModuleFilterBar.tsx   The bar itself
PresetMenu.tsx        Preset + saved-view picker
applyFilters.ts       Pure filter function (rows, state) => rows
index.ts              Public re-exports
savedViews.ts         Local-storage persistence for user-saved views
schema.ts             Type definitions for facet schemas
urlState.ts           Read/write filter state to ?query params
useFilterState.ts     Hook that wires URL + saved view + setter
```

## Consumers

Piloted on Sell:

- `SellActivities`
- `SellCRM`
- `SellInvoices`
- `SellOpportunities`
- `SellOrders`
- `SellQuotes`

Then ported to:

- `BookInvoices`
- `BuyBills`
- `BuyOrders`
- `MakeWorkOrders`
- `PlanJobs`
- `ShipOrders`
- `ShipTracking`

## Usage shape

```tsx
import { ModuleFilterBar, useFilterState } from '@/components/shared/filters';
import { schema } from './SellQuotes.filterSchema';

function SellQuotes() {
  const { state, setState, applied } = useFilterState({ schema, storageKey: 'sell.quotes' });
  const rows = applyFilters(quotes, applied);

  return (
    <>
      <ModuleFilterBar schema={schema} state={state} onChange={setState} />
      <QuotesTable rows={rows} />
    </>
  );
}
```

## Adding a new module

1. Author a schema describing the facets and presets for that module.
2. Mount `<ModuleFilterBar>` above the table; pass the schema and the `useFilterState` setter.
3. Apply the resulting state with `applyFilters(rows, state)`.

Do not fork the bar to add a one-off facet — extend the schema type if a genuinely new facet shape is needed.

## Per-module audits

See `docs/audits/dev/AUDIT-filters-*.md` for the per-module migration plans (Book, Buy, Control, Make, Plan, Sell, Ship, Shop-Floor).
