# Stock Valuation — dev stub

User doc: [`docs/user/modules/book/stock-valuation.md`](../../../user/modules/book/stock-valuation.md)

- **Route:** `/book/stock-valuation`
- **Component:** `apps/web/src/components/book/StockValuation.tsx`
- **Services used:** none (local `trendData`, `donutData`, `rawMaterials`)
- **Overlap:** Inventory/materials shape overlaps with Plan/Buy stock views. Book lens is valuation (cost × qty × age).
- **TODO:** add `bookService.getStockValuation()`; share `Material`/`StockItem` type with Plan; tier gate (Produce+ or Expand+).
