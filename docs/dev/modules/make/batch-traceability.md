# Batch Traceability (dev)

Lot-tracking tree view for raw material → WIP → finished goods. Component file lives in the Make module; not currently wired to a route (standalone card/panel for future embed).

## File

`apps/web/src/components/make/BatchTraceability.tsx` — exported as `<BatchTraceability />`.

## Data

`makeService.getBatchLots()` returns `BatchLot[]`. Each lot has children for the next traceability step:

```ts
interface BatchLot {
  id: string;
  type: 'raw_material' | 'wip' | 'finished_goods';
  lotNumber: string;            // font-mono display
  heatNumber?: string;          // added 2026-04-22
  certUrl?: string;             // added 2026-04-22
  material: string;
  qty: number;
  date: string;
  status: 'active' | 'quarantine' | 'released' | 'consumed';
  supplierName?: string;
  children?: BatchLot[];
}
```

## Heat number + cert link (2026-04-22)

Commit `ee559d34` (PR [#22](https://github.com/matthewjquigley/Mirrorworksux/pull/22)) added optional `heatNumber` and `certUrl` to the `BatchLot` type, and seeded raw-material lots with both.

Rendered inline in the lot header row:

- `Heat: {heatNumber}` — small tabular-num label next to the lot number.
- `<a href={certUrl} target="_blank">` wrapping an `ExternalLink` icon — opens the PDF/URL in a new tab. `rel="noopener noreferrer"` is set. `aria-label="Open material certificate"` for screen readers.

Driven by the AS/NZS + ISO metal-traceability requirement: raw-material lots need a pointer to the mill test certificate, and heat numbers are the primary cross-reference.

## Status tokens

| Status | Token |
|---|---|
| `active` | `--chart-scale-mid` tint |
| `quarantine` | `--mw-red` tint |
| `released` | `--chart-scale-high` tint |
| `consumed` | `--neutral-300` / `--neutral-600` |

## Animation

Uses `staggerContainer` + `staggerItem` from `@/components/shared/motion/motion-variants` on the root card and each lot node.

## Known gaps

- Not wired to a route — component is a standalone card awaiting a host page (candidates: Make → Quality, Make → MO detail, Control → Products).
- `certUrl` is free text; no validation that the URL resolves or that the document actually covers the heat number displayed.
- Expand state (`expanded` per `LotNode`) is local — no sticky open/close.
- Tree is rendered client-side; deep lots (>200) may want virtualisation.
