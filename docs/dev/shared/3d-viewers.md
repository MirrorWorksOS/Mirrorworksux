# 3D / Product Viewers (shared)

Added 2026-04-22 (commit `03733e06`) alongside the Plan Production-tab rebuild.

## Files

| Path | Export | Role |
|---|---|---|
| `apps/web/src/components/shared/3d/GlbViewer.tsx` | `<GlbViewer>` | PBR GLB model viewer with orbit controls. |
| `apps/web/src/components/shared/3d/DrawingViewer.tsx` | `<DrawingViewer>` | Edge-only "2D drawing" viewer that derives front/top/side/iso views from the same GLB. |
| `apps/web/src/components/shared/product/BomOverlay.tsx` | `<BomOverlay>` | Right-side `Sheet` that lists a part's BOM lines (item, partNumber, description, qty, uom, unitCost, source). |

All three are `"use client"`-safe (no SSR branches) and own their own `useEffect` mount/unmount lifecycle.

## Sample asset

`apps/web/public/models/diff.glb` (1.17 MB) — sample differential-assembly model used by the Plan Production tab's MirrorView and the Make MO detail's read-only view.

## GlbViewer

```ts
interface GlbViewerProps {
  src: string;
  className?: string;
}
```

Setup:
- Perspective camera at `(150, 120, 200)`, FOV 45°.
- PBR environment via `PMREMGenerator` + `RoomEnvironment` (so metals/plastics look right).
- Hemisphere + key + fill directional lights on top of the env map for crispness.
- ACES filmic tone mapping, sRGB output, pixel-ratio aware.
- Orbit controls with damping enabled.

## DrawingViewer

```ts
interface DrawingViewerProps {
  src: string;
  className?: string;
}

type ViewKey = 'front' | 'top' | 'side' | 'iso';
```

Pipeline:
1. Loads the GLB via `GLTFLoader`.
2. Traverses meshes, derives an `EdgesGeometry` per mesh (threshold angle 20°), and builds a `LineSegments` group with a flat `0x111827` material.
3. Renders the edge model from four fixed camera directions (see `VIEW_DIRECTIONS`) into separate canvas mounts labelled Front / Top / Side / Isometric.

Rendered output is a flat line-art approximation — not a CAD-true orthographic projection, but close enough for a shop-floor-ready "print-out feel".

## BomOverlay

```ts
interface BomLine {
  item: number;
  partNumber: string;
  description: string;
  qty: number;
  uom: string;
  unitCost: number;
  source: 'Make' | 'Buy' | 'Subcontract';
}

interface BomOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partName: string;
  partNumber: string;
  lines: BomLine[];
}
```

- Uses shadcn `Sheet` on the right, `sm:max-w-2xl`.
- Source column colour-coded: Make → yellow tint, Buy → blue, Subcontract → neutral.
- Footer total = Σ `qty * unitCost` (USD via `en-US` formatter — flag if the rest of the app is AUD).

## Consumers

| File | Uses |
|---|---|
| `apps/web/src/components/plan/PlanProductionTab.tsx` | `GlbViewer`, `DrawingViewer`, and (indirectly via `BomRoutingTree`) `BomOverlay`. |
| `apps/web/src/components/make/MakeManufacturingOrderDetail.tsx` | Reads `BomRoutingTree` in `mode="make"` which transitively uses `BomOverlay`. |

## Known gaps

- `BomOverlay` formats currency as `en-US` / USD but the rest of MirrorWorks uses `en-AU` / AUD. Align before shipping to customers.
- No loading/error state on either viewer — a failed fetch leaves a black canvas.
- `DrawingViewer` uses a fixed edge-threshold angle (20°). A slider or per-model override would help on curvy parts.
- Neither viewer exposes a camera-reset action, and `DrawingViewer`'s four panes are non-interactive (no rotate/pan).
