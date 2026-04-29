# Developer stub — control/inventory.md

> **Page consolidated on 2026-04-29.** `/control/inventory` is now a `<Navigate to="/control/products" replace />` in [`routes.tsx`](apps/web/src/routes.tsx). The Inventory page no longer renders.

## What still lives in `ControlInventory.tsx`
The file at [`apps/web/src/components/control/ControlInventory.tsx`](apps/web/src/components/control/ControlInventory.tsx) was **not** deleted — three wizard components are defined there and re-exported for re-use on Products:

- `StocktakeWizard`
- `NewAdjustmentDialog`
- `NewTransferDialog`

[`ControlProducts.tsx`](apps/web/src/components/control/ControlProducts.tsx) imports the three and surfaces them as toolbar buttons (Stocktake / Adjustment / Transfer) at the top of the Products page.

## Migration notes for new development
- New inventory-related work should land on Products, not here.
- The `ControlInventory.tsx` file should be considered a **wizard module** — keep the wizard components there but do not re-add a default export that mounts the legacy page.
- If the wizards need to grow, consider extracting each into its own file (e.g. `wizards/StocktakeWizard.tsx`) so this file can be retired entirely.

## See also
- [`docs/dev/modules/control/products.md`](./products.md) — replacement page.
- [`docs/dev/modules/control/boms.md`](./boms.md) — multi-tier `BomEditorSheet` landed alongside this consolidation.
