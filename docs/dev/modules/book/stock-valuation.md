# Stock Valuation — dev stub

User doc: [`docs/user/modules/book/stock-valuation.md`](../../../user/modules/book/stock-valuation.md)

- **Route:** `/book/stock-valuation`
- **Component:** `apps/web/src/components/book/StockValuation.tsx`
- **Services used:** none (local `trendData`, `donutData`, `rawMaterials`)
- **Overlap:** Inventory/materials shape overlaps with Plan/Buy stock views. Book lens is valuation (cost × qty × age).
- **TODO:** add `bookService.getStockValuation()`; share `Material`/`StockItem` type with Plan; tier gate (Produce+ or Expand+).

## Costing methods
The `costingMethod` select offers five options (see PR #14 for naming alignment with Global Shop):

| Value | Label | Notes |
|---|---|---|
| `fifo` | FIFO | First-in, first-out |
| `lifo` | LIFO | Last-in, first-out |
| `weighted_average` | **Weighted Average (AVCO)** | Renamed from "Weighted average" to match industry naming |
| `standard` | Standard Cost | Uses product-level standard cost |
| `actual` | **Actual Cost** | NEW — uses real consumed cost buckets from `JobCostDetail` rather than a formula |

Product-level tiles on `ProductDetail.tsx` mirror these options and display per-method unit cost in the cost-breakdown grid.

## Components Used
- `@/components/shared/cards/DarkAccentCard`
- `@/components/shared/cards/KpiStatCard`
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/data/FinancialTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/book/StockValuation.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`
