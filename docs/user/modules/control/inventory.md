# Inventory

> **Folded into Products on 2026-04-29.** `/control/inventory` is now a redirect to `/control/products`. The Stocktake / Adjustment / Transfer wizards still exist and are surfaced as toolbar buttons on the Products page.

## Route
`/control/inventory` → redirects to `/control/products`

## What replaced it
- **List + detail of inventory records** — now part of [Products](./products.md) (`/control/products`).
- **Stocktake / Adjustment / Transfer wizards** — surfaced as toolbar buttons at the top of the Products page. The wizard components (`StocktakeWizard`, `NewAdjustmentDialog`, `NewTransferDialog`) remain defined in `ControlInventory.tsx` and are imported by `ControlProducts.tsx`.

## Why it changed
Inventory and Products were two views of the same underlying data. Folding them removes the empty-shell page the audit flagged on 2026-04-28 and consolidates the toolbar actions where users actually look for them.

## Migrating links / bookmarks
Anything that linked to `/control/inventory` will redirect transparently — no action required.

## See also
- [Products](./products.md) — replacement page.
- [BOMs](./boms.md) — multi-tier editor landed alongside this consolidation.
