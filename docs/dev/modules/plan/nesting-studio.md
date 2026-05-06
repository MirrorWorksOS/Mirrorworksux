# Nesting Studio v2 — Dev

The multi-part nesting workspace and its three companion screens. Replaces the legacy single-part Sheet Calculator (commit `6d0b485c`, 2026-05-05). The previous `/plan/nesting` and `/plan/sheet-calculator` paths now redirect into the studio.

User doc: [`docs/user/modules/plan/nesting-studio.md`](../../../user/modules/plan/nesting-studio.md)

## Routes

| Path | Component | Behaviour |
|---|---|---|
| `/plan/nesting-studio` | `PlanNestingStudio` | Multi-part packing workspace. Pick machine + sheet stock, add parts (queue / library / DXF / manual), preview multi-sheet packing, save draft or confirm to schedule. |
| `/plan/nesting-queue` | `PlanNestingQueue` | "Ready to Nest" — pending cut demand grouped by material + thickness. |
| `/plan/nests` | `PlanNestsList` | Lifecycle tabs: Drafts / Ready to schedule / Scheduled / Cutting / Done. Per-row CTAs drive the state machine. |
| `/plan/nests/:id` | `PlanNestDetail` | Read-only deep-dive: full sheet preview, placements table, cost rollup, DXF + pick-list export. |
| `/plan/nesting` | `<Navigate to="/plan/nesting-studio" replace />` | Legacy redirect |
| `/plan/sheet-calculator` | `<Navigate to="/plan/nesting-studio" replace />` | Legacy redirect |
| `/plan/sheet-calculator-legacy` | `PlanSheetCalculator` | Original single-part calc, kept for the rare lookup |

Wired in [`apps/web/src/routes.tsx`](../../../../apps/web/src/routes.tsx) — see lines 82–85 (lazy imports) and 364–371 (route block).

## Component tree

```
apps/web/src/components/plan/nesting-studio/
├── PlanNestingStudio.tsx        ← /plan/nesting-studio
├── PlanNestingQueue.tsx         ← /plan/nesting-queue
├── PlanNestsList.tsx            ← /plan/nests
├── PlanNestDetail.tsx           ← /plan/nests/:id
├── NestSheetPreview.tsx         ← shared SVG renderer + colourForPart()
├── UploadDxfDialog.tsx          ← drag-drop / browse → parseDxf → createDxfAsset
├── usePackedNest.ts             ← sync packer hook (StudioPartRow type lives here)
└── useAsyncPackedNest.ts        ← worker wrapper, exposes NestStrategy union
```

`PlanNestingStudio` orchestrates four panes (KPI strip, Setup card, Parts table, Sheet preview) inside an `xl:grid-cols-5` layout (Setup spans 2, Preview spans 3). The hand-off into the rest of the system happens through `planService.saveNest` plus, when the source was the queue, `planService.markQueueItemsPlaced`.

## State machine — Nest lifecycle

```
   ┌──── Studio "Save draft" ────┐
   │                             ▼
 (none) ──▶ draft ──▶ ready_to_schedule ──▶ scheduled ──▶ cutting ──▶ done
                          ▲                    │
                          │                    ▼
                          └──── unscheduleNest ─┘
                                                       
              (any non-terminal) ──▶ cancelled
```

Transitions are owned by `planService`:

| Trigger | Method | Side effects |
|---|---|---|
| Studio → Save draft | `saveNest({...nest, status: 'draft'})` | Stamp `placedOnNestId` on linked WOs (only the cut step) |
| Studio → Confirm nest | `saveNest({...nest, status: 'ready_to_schedule'})` + `markQueueItemsPlaced(ids, nestId)` | Same WO stamp; queue items flip to `placed` |
| Nests list → Schedule | `scheduleNest(id)` | `reserveSheetStock(stockId, qty)` per sheet; status → `scheduled` |
| Nests list → Start cut | `setNestStatus(id, 'cutting')` | None — pure state move |
| Nests list → Mark done | `setNestStatus(id, 'done')` | Stock movement: `available → consumed` (TODO in mock; consumed-side rollup lives in `getNestCostContributionForMo`) |
| (anywhere) → Cancel | `unscheduleNest(id)` followed by `setNestStatus(id, 'cancelled')` | `releaseSheetStock(stockId, qty)` per sheet; queue items re-released via `releaseQueueItems` |

`NestStatus` is defined in [`apps/web/src/types/common.ts:121`](../../../../apps/web/src/types/common.ts).

## Entity types — [`apps/web/src/types/entities.ts`](../../../../apps/web/src/types/entities.ts)

```ts
DxfAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  parsedAt: string;
  bboxMm: { widthMm: number; heightMm: number };
  perimeterMm: number;
  innerCutMm: number;
  holeCount: number;
  layers: string[];
  source: 'nest_upload' | 'product_studio' | 'quote';
}

SheetStock {
  id: string;
  material: string;
  thicknessMm: number;
  grade: string;
  widthMm: number;
  heightMm: number;
  qtyOnHand: number;
  costPerSheetAud: number;
  isRemnant?: boolean;
  parentSheetStockId?: string;        // when isRemnant
  status: 'available' | 'reserved' | 'consumed' | 'on_order';
}

MachineNestingConfig {
  machineId: string;
  material: string;
  thicknessMm: number;
  kerfMm: number;
  pierceTimeSec: number;
  cutSpeedMmPerMin: number;
  partGapMm: number;        // default — Studio overrides per-session
  edgeGapMm: number;
  allowRotation: boolean;
}

NestingQueueItem {
  id: string;
  workOrderId: string;
  woNumber: string;
  manufacturingOrderId: string;
  jobNumber: string;
  productId?: string;
  partNumber: string;
  description: string;
  material: string;
  thicknessMm: number;
  bboxMm: { widthMm: number; heightMm: number };
  qtyRequired: number;
  dxfAssetId?: string;
  dueDate: string;
  enteredQueueAt: string;
  status: 'pending' | 'placed' | 'cancelled';
  placedOnNestId?: string;
}

NestPlacement {
  id: string;
  productId?: string;
  partNumber: string;
  dxfAssetId?: string;
  qtyOnSheet: number;
  sources: { workOrderId: string; woNumber: string; qty: number }[];
  xMm: number; yMm: number;
  rotationDeg: 0 | 90;
  bboxMm: { widthMm: number; heightMm: number };
}

NestSheet {
  id: string;
  sheetStockId: string;
  sheetIndex: number;          // 1-based for display
  placements: NestPlacement[];
  yieldPercent: number;
  scrapAreaMm2: number;
  estimatedRuntimeMin: number;
}

NestCostRollup {
  materialCostAud: number;
  machineCostAud: number;
  labourCostAud: number;
  totalCostAud: number;
}

Nest {
  id: string;
  nestNumber: string;          // e.g. "NST-DRAFT-123456"
  status: NestStatus;
  machineId: string;
  machineName: string;
  material: string;
  grade: string;
  thicknessMm: number;
  sheets: NestSheet[];
  cost: NestCostRollup;
  totalYieldPercent: number;
  totalRuntimeMin: number;
  createdBy: string;
  createdAt: string;
  sourceWorkOrderIds: string[];
  sourceManufacturingOrderIds: string[];
}
```

`Machine` was extended with a `capabilities?: MachineCapabilities` block (kerf, max sheet W/H, hourly rate, control system, supported materials). `WorkOrder` gained `placedOnNestId?: string` so the cut step's "I'm waiting on this nest" pointer is queryable.

## Service surface — [`apps/web/src/services/planService.ts`](../../../../apps/web/src/services/planService.ts)

Sixteen methods added in this commit. All mock-backed today; flips to a real adapter when Convex lands. Module-local `_nests` / `_queue` / `_sheetStocks` arrays are cloned from `mock.*` on init so hot-reload doesn't reset session state.

```ts
planService = {
  // Nests
  getNests(): Promise<Nest[]>
  getNestById(id: string): Promise<Nest | undefined>
  saveNest(nest: Nest): Promise<Nest>                          // upsert
  getNestsForManufacturingOrder(moId): Promise<Nest[]>
  getNestCostContributionForMo(moId): Promise<{material, machine, labour, total, nestCount}>

  // Queue
  getNestingQueue(): Promise<NestingQueueItem[]>
  markQueueItemsPlaced(itemIds, nestId): Promise<void>
  releaseQueueItems(itemIds): Promise<void>

  // Stock
  getSheetStocks(): Promise<SheetStock[]>
  reserveSheetStock(sheetStockId, qty): Promise<SheetStock | undefined>
  releaseSheetStock(sheetStockId, qty): Promise<SheetStock | undefined>

  // Machines + configs
  getMachines(): Promise<Machine[]>
  getMachineNestingConfigs(): Promise<MachineNestingConfig[]>

  // Library + DXF
  getProductsWithGeometry(): Promise<Product[]>
  getDxfAssets(): Promise<DxfAsset[]>
  createDxfAsset(input: {fileName, bboxMm, totalCutLengthMm, holeCount, layers}): Promise<DxfAsset>

  // Lifecycle
  scheduleNest(nestId, opts?): Promise<Nest | undefined>       // reserves stock
  unscheduleNest(nestId): Promise<Nest | undefined>            // releases stock
  setNestStatus(id, status): Promise<Nest | undefined>
}
```

## Library code — [`apps/web/src/lib/nesting/`](../../../../apps/web/src/lib/nesting)

Pure modules with no React imports — directly testable.

### `parseDxf.ts`

Minimal in-house R12 ASCII reader. Tokenises into `[code, value]` pairs and walks `LINE` / `LWPOLYLINE` / `POLYLINE` / `ARC` (sampled) / `CIRCLE` (sampled) entities. Skips everything else cleanly. Returns:

```ts
ParsedDxf {
  bboxMm: { widthMm, heightMm, minX, minY }
  totalCutLengthMm: number     // proxy for cut time
  holeCount: number            // count of CIRCLE entities
  layers: string[]
  outerPolygon: [number, number][]   // closed contour proxy for future polygon nesting
}
```

Good enough for fab DXFs to extract the bbox the studio needs. For full polygon support, swap to the `dxf-parser` package (already added as a dep) without touching call sites.

### `rectanglePacker.ts`

Two strategies. Both pure / deterministic:

- `packRectangles(parts, opts)` — **FFDH** (First-Fit Decreasing Height) shelf packer. Sort parts by height desc; place each into the leftmost shelf that fits, opening a new shelf when needed. Runs in milliseconds. Used for the Studio's `Fast` strategy.
- `packTight(parts, opts)` — runs FFDH × BFDH (Best-Fit Decreasing Height) under multiple sort orders (`height-desc`, `width-desc`, `area-desc`, `perimeter-desc`) and returns the result with the fewest sheets / highest yield. Slower, used for the Studio's `Tight` strategy.

Both emit `PackResult { sheets: PackedSheet[], unplaced: PackPart[] }` where `PackedSheet { sheetIndex, placements: PackPlacement[], usedAreaMm2, yieldPercent }`.

### `nestingWorker.ts`

Web-worker entry. Vite picks it up via the `?worker` import suffix in `useAsyncPackedNest`. Strategies:

- `'fast'` → `packRectangles`
- `'tight'` → `packTight`
- `'polygon'` → falls back to `packTight` and reports `fellBackTo: 'tight'` in the response. Real NFP solver plugs in here when ready; call sites stay stable.

### `exportPickList.ts`

`buildPickListCsv(nest)` and `buildSheetDxf(nest, sheetIndex)`. Placeholder CAM hand-off — a real post-processor pipeline replaces this. `downloadStringAsFile(content, filename, mime)` is the helper used by both `PlanNestDetail` download buttons.

## Hooks

| Hook | File | Purpose |
|---|---|---|
| `usePackedNest` | [`usePackedNest.ts`](../../../../apps/web/src/components/plan/nesting-studio/usePackedNest.ts) | Sync packer wrapper. Defines `StudioPartRow` (parts × `sourceKind: 'queue' \| 'library' \| 'manual'`). |
| `useAsyncPackedNest` | [`useAsyncPackedNest.ts`](../../../../apps/web/src/components/plan/nesting-studio/useAsyncPackedNest.ts) | Worker-backed wrapper. Returns `{pack, totalSheets, totalParts, totalPlaced, totalUnplaced, avgYieldPercent, totalRuntimeMin, cost, pending, lastDurationMs, fellBackTo}`. Re-runs whenever any of `parts / sheetStock / machine / config / strategy` changes. |

## URL params + handoffs

- `/plan/nesting-studio?queueItem=<id>` — auto-adds the queue item to the parts table and snaps the machine + material + thickness selectors to the item's spec. The "Open in Studio" link from `PlanNestingQueue` rows uses this.
- `/plan/nesting-studio?nest=<id>` — *future*; not yet wired. Will rehydrate a draft nest into the studio.
- The `Confirm nest` CTA only enables when `packed.totalSheets > 0 && packed.totalUnplaced === 0`. `Save draft` enables as soon as there's a sheet.

## Cost model

`useAsyncPackedNest` rolls cost from three signals:

```ts
materialCostAud = totalSheets * sheetStock.costPerSheetAud
machineCostAud  = (totalRuntimeMin / 60) * machine.capabilities.hourlyRateAud
labourCostAud   = (totalRuntimeMin / 60) * LABOUR_RATE_AUD            // const in the hook
totalCostAud    = materialCostAud + machineCostAud + labourCostAud
```

Runtime per sheet derives from the `MachineNestingConfig` (`pierceTimeSec * holeCount + cutLengthMm / cutSpeedMmPerMin`). The pure packer doesn't know about runtime — the hook computes it after placement.

## Things still mock / TODO

- **DXF rendering on preview** — `NestSheetPreview` draws bounding-box rectangles labelled by part number, coloured via `colourForPart(idx)`. Real polygon outlines from `DxfAsset.outerPolygon` are not yet rendered.
- **Polygon nesting strategy** — falls back to `tight` (see `nestingWorker.ts`).
- **`PlanNestDetail` schedule action** — uses the same `scheduleNest` flow but doesn't yet show the schedule block on the timeline (Schedule Engine integration is a follow-up).
- **Stock consumption on Done** — `setNestStatus(id, 'done')` doesn't yet flip `qtyOnHand` on the underlying `SheetStock`. Cost rollup via `getNestCostContributionForMo` reads from the linked Nest, not from stock movement.
- **Backend** — everything routes through `planService` mocks. No real persistence, no real Xero / Convex wires.
- **Permissions** — the studio is open to anyone with Plan access. ARCH 00 group/permission gating (`plan.nest.create`, `plan.nest.schedule`) is not yet wired.

## Related files

- `apps/web/src/components/plan/PlanSheetCalculator.tsx` — legacy single-part calculator, retained at `/plan/sheet-calculator-legacy`.
- `apps/web/src/components/plan/PlanNesting.tsx` — original `/plan/nesting` placeholder, no longer routed (the path redirects).
- `apps/web/src/services/mock/data.ts` — seeds `nests`, `nestingQueueItems`, `sheetStocks`, `machineNestingConfigs`.
- `package.json` — adds `dxf-parser ^1.1.2` as a future-proofing dep (current parser is hand-rolled).
