# Performance Audit - 2026-04-28

## Method

- Built the app with `npm run build`.
- Reviewed generated asset sizes from `apps/web/build/assets`.
- Traced large startup and route-level imports back to source files.

## Current measurements

Largest build artifacts observed:

- `apps/web/build/assets/index-q6nHVglf.js`: 460,551 bytes
- `apps/web/build/assets/vendor-ui-i2_SHPW2.js`: 650,381 bytes
- `apps/web/build/assets/vendor-radix-DRt91ATD.js`: 256,927 bytes
- `apps/web/build/assets/index-DtTQr8wL.css`: 256,927 bytes
- `apps/web/build/assets/ProductStudioV2-CUKFwOOC.js`: 896,639 bytes
- `apps/web/build/assets/GlbViewer-BRMkNL73.js`: 618,476 bytes
- `apps/web/build/assets/vendor-barcode-iT2nM7KU.js`: 930,934 bytes
- `apps/web/build/assets/vendor-camera-CiHcbPVb.js`: 334,577 bytes
- `apps/web/build/assets/f55352753708d5a1c04a6b5e7921ba6a691ec0b2-Nxm5pqPs.png`: 2.5 MB

## Findings

### 1. Dashboard is still on the critical path

Evidence:

- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/routes.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/routes.tsx:8) statically imports both `Layout` and `WelcomeDashboard`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/routes.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/routes.tsx:236) mounts `WelcomeDashboard` directly for `/` and `/dashboard`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/WelcomeDashboard.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/WelcomeDashboard.tsx:35) imports `motion/react`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/WelcomeDashboard.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/WelcomeDashboard.tsx:50) imports `WelcomeDashboardActivityChart`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/charts/WelcomeDashboardActivityChart.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/charts/WelcomeDashboardActivityChart.tsx:6) imports `recharts`.

Impact:

- The initial office shell pays for dashboard charts and motion before the user navigates anywhere else.
- This aligns with the large startup JS footprint: `index` 460 KB raw plus `vendor-ui` 650 KB raw.

Highest-leverage fix:

- Convert `WelcomeDashboard` to a lazy route like the other module pages.
- Inside the dashboard, lazy-load `WelcomeDashboardActivityChart` and any non-essential animated panels below the fold.

### 2. App shell eagerly includes rarely used overlays

Evidence:

- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/Layout.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/Layout.tsx:14) statically imports `AgentFAB`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/agent/AgentFAB.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/agent/AgentFAB.tsx:11) imports `motion/react`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/agent/AgentFAB.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/agent/AgentFAB.tsx:14) imports `AgentPanel`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/Sidebar.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/Sidebar.tsx:26) statically imports `CommandPalette`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/command/CommandPalette.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/command/CommandPalette.tsx:17) imports `@radix-ui/react-dialog`.

Impact:

- Every in-app route carries agent panel, command palette, and dialog code even when unopened.
- This likely contributes to the `vendor-radix` chunk at 257 KB raw and a larger app-shell `index` chunk.

Highest-leverage fix:

- Lazy-load `AgentPanel`, `CommandPalette`, and `QuickCreatePanel` on first open.
- Keep only the small trigger buttons and keyboard listeners in the base shell.

### 3. A single floor-mode image is materially oversized

Evidence:

- Build output contains a 2.5 MB PNG: `f55352753708d5a1c04a6b5e7921ba6a691ec0b2-Nxm5pqPs.png`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/floor/execution/snapshot.ts`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/floor/execution/snapshot.ts:1) imports that source image directly.

Impact:

- Floor execution is already route-split, but this one asset dominates transfer cost once the route loads.

Highest-leverage fix:

- Replace the PNG with a compressed WebP/AVIF or a resized PNG matched to actual display bounds.
- Audit the other Figma-exported assets in `apps/web/src/assets`; several are still hundreds of KB to multi-MB.

### 4. Some specialized route chunks are still very heavy after splitting

Evidence:

- `ProductStudioV2-CUKFwOOC.js`: 896,639 bytes raw
- `GlbViewer-BRMkNL73.js`: 618,476 bytes raw
- `vendor-barcode-iT2nM7KU.js`: 930,934 bytes raw
- `vendor-camera-CiHcbPVb.js`: 334,577 bytes raw

Source hotspots:

- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/3d/GlbViewer.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/3d/GlbViewer.tsx:1) pulls `three` and example loaders.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/product/ProductDetail.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/product/ProductDetail.tsx:36) pulls `motion/react`.
- [`/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/product/ProductDetail.tsx`](/Users/mattquigley/Documents/GitHub/Mirrorworksux/apps/web/src/components/shared/product/ProductDetail.tsx:39) also pulls `recharts`.

Impact:

- Route splitting is working, but a few destination pages remain expensive enough to feel sluggish on first entry.

Highest-leverage fix:

- For 3D pages, defer the viewer mount until the tab is visible and consider a static preview image first.
- For Product Studio V2, measure parse/execute cost in DevTools and split editor-only subsystems further if first-open latency is noticeable.
- For barcode/camera flows, keep the current route split, but avoid any accidental imports from shared components into non-scanner routes.

## Recommended order

1. Lazy-load `WelcomeDashboard` and defer its chart/animation subtrees.
2. Lazy-load `CommandPalette`, `QuickCreatePanel`, and `AgentPanel` from the shell.
3. Compress or replace the floor execution PNGs.
4. Re-measure startup JS and first-route navigation after 1-3.
5. Only then spend time on Product Studio V2 or 3D viewer micro-splitting.

## What to measure next

- Chrome Performance trace for cold-load of `/`.
- Network waterfall for `/` and `/floor/run/:id`.
- Coverage tab for unused JS on first paint.
- Bundle diff after the dashboard and shell overlays are lazily loaded.

## Uncertainty

- I have build artifact evidence, but no browser trace from this run. The bundle findings are strong; the exact user-perceived delay should be confirmed with a cold-load Performance trace.
