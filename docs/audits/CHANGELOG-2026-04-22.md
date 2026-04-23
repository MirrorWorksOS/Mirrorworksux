# Changelog — 2026-04-22

Day summary of changes shipped to `main` on 2026-04-22.

## Commits

| Commit | Type | Title | PR |
|---|---|---|---|
| `03733e06` | feature | Buy new-order page + audit timeline integration | — |
| `4eeef1fb` | feature | Shop-floor leaderboard widget mock data | [#23](https://github.com/matthewjquigley/Mirrorworksux/pull/23) |
| `4589e219` | feature | Bridge review-step sandbox preview polish | [#25](https://github.com/matthewjquigley/Mirrorworksux/pull/25) |
| `ee559d34` | feature | Heat number + cert link on batch traceability | [#22](https://github.com/matthewjquigley/Mirrorworksux/pull/22) |
| `252091f5` | chore+feature | Page styling, nav bar refinements, PillNav component | [#27](https://github.com/matthewjquigley/Mirrorworksux/pull/27) |

## New user-visible surfaces

- **`/buy/orders/new`** — Full purchase-order builder page (header, inline line items, right-hand totals, AI supplier-recommendation + price-anomaly hooks). See [dev doc](../dev/modules/buy/new-order.md), [user doc](../user/modules/buy/new-order.md).
- **Buy → Order detail → Activity tab + history drawer** — Real append-only audit timeline replaces previous mock activity feed. See [AuditTimeline dev doc](../dev/shared/audit-timeline.md).
- **Plan → Job detail → Production tab** — Rebuilt around a single integrated BOM+routing tree (the old three-tab layout collapsed). See [BomRoutingTree dev doc](../dev/modules/plan/bom-routing-tree.md).
- **Make → Manufacturing Order detail** — Now renders the same BomRoutingTree in read-only `mode="make"`.
- **Make → Dashboard → Shop floor leaderboard** — Ranked-list widget with trophy on #1 and yellow-card treatment.
- **Make → Batch traceability** — Raw-material lot rows now show heat number + external cert link (AS/NZS + ISO metal traceability).
- **Bridge → Review step → Preview in context** — Restyled sandbox preview using `variant="flat"` cards and `--mw-warning` tokens. Pre-existing section from PR #15.

## New shared components / services

| Component | Path | Purpose |
|---|---|---|
| `AuditTimeline` | [audit/AuditTimeline.tsx](../../apps/web/src/components/shared/audit/AuditTimeline.tsx) | Document-history feed (mini + full variants). |
| `AuditTimelineSheet` | [audit/AuditTimelineSheet.tsx](../../apps/web/src/components/shared/audit/AuditTimelineSheet.tsx) | Side-drawer wrapper with filter pills. |
| `auditService` | [services/auditService.ts](../../apps/web/src/services/auditService.ts) | Mock-backed append-only event log. |
| `PillNav` | [navigation/PillNav.tsx](../../apps/web/src/components/shared/navigation/PillNav.tsx) | Canonical pill-shaped tab strip with optional dock-style magnify. |
| `DrawingViewer` | [3d/DrawingViewer.tsx](../../apps/web/src/components/shared/3d/DrawingViewer.tsx) | Three.js edge-only 2D-style drawing viewer. |
| `GlbViewer` | [3d/GlbViewer.tsx](../../apps/web/src/components/shared/3d/GlbViewer.tsx) | Three.js PBR GLB viewer with orbit controls. |
| `BomOverlay` | [product/BomOverlay.tsx](../../apps/web/src/components/shared/product/BomOverlay.tsx) | Right-side BOM sheet. |

## Infrastructure

- `apps/web/src/components/ui/tabs.tsx` — `TabsList` and `TabsTrigger` converted to `React.forwardRef` so `PillNav` can bind a `MotionValue` to `style.scale`. Behaviour unchanged.
- `apps/web/src/styles/globals.css` — New `.ai-card-glow` utility (plus `--animating` variant + `prefers-reduced-motion` guard). Shape-agnostic teal halo for MirrorWorks Agent surfaces.
- `apps/web/public/models/diff.glb` — 1.17 MB sample GLB, used by the Plan Production tab's MirrorView.

## Data model

- `BatchLot` gained optional `heatNumber: string` and `certUrl: string`. Raw-material seed lots now populate both ([data.ts](../../apps/web/src/services/mock/data.ts)).
- New `AuditEntityType` / `AuditAction` / `AuditEvent` / `FieldChange` types in `auditService.ts`. Mock `STORE` seeded for `po-001`, `po-002`, `req-001`.
- New `shopFloorLeaderboardItems` export in `mock/data.ts`.
- `manufacturingOrders[0]` / `workOrders[0..3]` re-themed around a "Differential Assembly" story (ring gear, gear hobbing) to match the new BomRoutingTree demo assembly. `initialTravellers[0]` retuned to the same story.

## Screenshots

Captured 2026-04-23 via headless Chrome (puppeteer-core driving the installed Google Chrome at 1280×900). One shot per new surface:

| File | Surface |
|---|---|
| [`buy/new-order.png`](./screenshots/buy/new-order.png) | `/buy/orders/new` — full PO builder (supplier, line items, totals, Send to supplier). |
| [`buy/order-detail-overview.png`](./screenshots/buy/order-detail-overview.png) | `/buy/orders/po-001` Overview tab — mini AuditTimeline in right-rail Status timeline card. |
| [`buy/order-detail-activity.png`](./screenshots/buy/order-detail-activity.png) | `/buy/orders/po-001` Activity tab — full AuditTimeline with create / amend / approve / send / system events. |
| [`buy/orders-list.png`](./screenshots/buy/orders-list.png) | `/buy/orders` — list with the new "Create PO" button that routes to new-order. |
| [`plan/job-detail-overview.png`](./screenshots/plan/job-detail-overview.png) | `/plan/jobs/job-001` Overview — context for the Differential Assembly story used by the new tree. |
| [`plan/job-detail-production.png`](./screenshots/plan/job-detail-production.png) | `/plan/jobs/job-001` Production — rebuilt tab showing `<BomRoutingTree mode="plan">` with the full operations rail (Prepare BOM → Case hardening → Finish grind OD). |
| [`make/dashboard.png`](./screenshots/make/dashboard.png) | `/make` — module dashboard (full page). Note: the new `shop-floor-leaderboard` widget is **registered but not shipped in the default layout** — see gap #1. |
| [`make/mo-detail-bomroutingtree.png`](./screenshots/make/mo-detail-bomroutingtree.png) | `/make/manufacturing-orders/mo-001` (full page) — Overview tab includes the read-only `<BomRoutingTree mode="make">` ("Routing & inputs" card). |
| [`bridge/wizard.png`](./screenshots/bridge/wizard.png) | `/control/mirrorworks-bridge` — BridgeWizard step 1 (Source). Review-step restyle from PR #25 is behind several forward clicks; not captured this pass. |

## Not covered by this run

1. **Shop-floor leaderboard widget screenshot.** The widget is registered in `WidgetRegistry.ts` with `modules: ['make']`, but `MakeDashboard` does not pass `showWidgetGrid={true}` to `ModuleDashboard`, and no shipped dashboard sets that prop anywhere in the codebase. As a result the widget is unreachable via the default UI — an operator has to call `DashboardWidgetGrid` themselves or the feature has to be wired into `MakeDashboard` before a faithful screenshot is possible. Flag: the dev-doc claim of "rendered on Make dashboard" is aspirational.
2. **Bridge Review-step sandbox preview screenshot.** The restyle landed in PR #25 but the review step sits behind 4–5 forward clicks plus a file upload on the "Map" step. Driving that through puppeteer is out of scope for today's audit; a simple state-seed via URL param would make this reproducible.
3. **Batch traceability heat number + cert link screenshot.** `<BatchTraceability>` is not wired to any route (confirmed — no match in `routes.tsx`). Component is ready; needs a host page.
4. **Plan Production tab user doc.** Still not authored — existing `docs/user/modules/plan/job-detail.md` remains correct at the feature level ("inspect a job deeply") but the BOM-tree flow deserves a dedicated walkthrough once the page stabilises.
