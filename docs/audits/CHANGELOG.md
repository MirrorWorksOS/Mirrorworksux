# Changelog

Rolling log of changes shipped to `main`. Latest at top. Each entry: date — N commits — what shipped — link to detail.

For detail before consolidation (2026-04-22 to 2026-05-05), see `_archive/changelogs/` — those daily files were merged into this index on 2026-05-11 cleanup.

---

## 2026-05-05 — 1 commit — Xero account mapping, Nesting Studio v2, dashboard polish

`6d0b485c` (feat) bundles three surfaces:

- **Plan → Nesting Studio v2** at `/plan/nesting-studio`, `/plan/nesting-queue`, `/plan/nests`, `/plan/nests/:id`. Replaces the legacy single-part Sheet Calculator with a multi-part workspace: DXF upload + parse, two rectangle-pack strategies on a web worker, multi-sheet preview with placement labels, lifecycle (Drafts → Ready → Scheduled → Cutting → Done), pick-list + per-sheet DXF export. Old `/plan/nesting` and `/plan/sheet-calculator` redirect to the studio. 34 new files under `apps/web/src/components/plan/nesting-studio/` + `apps/web/src/lib/nesting/`.
- **Book → Xero Configure Mapping** at `/book/settings/xero/mapping`. Full mapping workspace modelled on live Xero API (`Account`, `TaxRate`, `TrackingCategory`, `BrandingTheme`). Six sections (Sales, Purchases, Bank & system, Tax codes, Tracking, Branding), grouped combobox, auto-map suggestions, sticky save footer with diff count, factory-reset.
- **Dashboard polish** — Book gains an `AIFeed` strip; titles trimmed (Plan/Ship); sidebar gains three nesting entries, drops Sheet Calculator.

## 2026-05-04 — 4 commits — Floor Execution refactor, AI Schedule Engine

- **Floor Execution refactor** (`942a13f4`, 34 files, +3636/−2415) — splits the 1463-line `FloorExecutionScreen` into ten Andon-style cards + six dialogs (Hold / NCR / Scrap / Print Label / Close WO / Barcode). Deletes the pre-refactor sheets. New canonical AI surface treatment documented in `DesignSystem.md`.
- **AI Schedule Engine** (`07d6a040`) — `/plan/schedule-engine` with 5-card KPI row (Avg Utilisation · Active Jobs · Schedule Health · Bottleneck · Late Risk), work-centre Gantt with capacity heatmap, Auto-Schedule confirmation flow via `ProposalBanner` / `IssuesSheet` / `JobDetailSheet`. `/plan/schedule` and `/plan/activities` redirect into the engine.
- **AgentCard double-stroke fix** (`55c94659`) — drops inner border so `BorderGlow` is the only edge; glow intensity +15% to match AI search bars.
- **Global Shop gap-fix docs** (`2bc727b1`) — Live Floor user + dev docs, Make Dashboard rewrite, costing-method on Stock Valuation, Bridge `StepReviewConfirm` sandbox.

## 2026-04-30 — 9 commits — Control wiring sweep, canvas retone

- **Control dialog sweep** (Batches 0–8, 35 files, +3534/−594) — wires real dialogs/sheets to Operations, Machines, Routes, Locations, BOMs, Groups, Shifts, Targets, Badges, Maintenance, Tooling. Inventory folded into Products; Purchase folded into Buy Settings.
- **Batch 0 primitives** (`e8a4461a`) — new `EntityFormDialog` shared component + `operation-category-colors.ts` 7-key palette (Planning / Cutting / Forming / Machining / Joining / Finishing / Quality).
- **Process Builder + Factory Designer retone** — repaint to MW yellow + mirage, drops legacy blue/purple node fills.
- **Dark-mode P1+P2 follow-up** — orthographic viewport panels and audit-category badges flip correctly.

## 2026-04-29 — 6 commits — Pricing tier rewrite, CI green

- **Pricing tier rewrite** (`f6aa4aa4`, PR #29, 15 files, +783/−188) — replaces Pilot/Produce/Expand/Excel (AUD flat) with **Trial / Make / Run / Operate / Enterprise** (USD per user/month). Adds AI credits (`AI_CREDIT_PACKS`, `AI_OVERAGE_RATE_USD`, `VOLUME_DISCOUNT_BANDS`). New `AICreditsCard` in Control → Billing. Real upgrade/downgrade confirmation dialogs replace coming-soon toasts.
- **Per-tier user caps removed** (`5ef7430e`).
- **Dead-end-flow sweep** — closes most coming-soon toast holes across Plan / Make / Buy / Ship. CI green for the first time (typecheck was 17 errors red immediately prior).
- **New Billing page** at `/control/billing`.

## 2026-04-26 to 2026-04-28 — quiet window

No code shipped. Daily runs were no-ops. UX Completeness Audit 2026-04-28 produced (archived).

## 2026-04-22 — 5 commits — Buy new-order, Audit Timeline, PillNav

- **Buy** `/buy/orders/new` — full purchase-order builder with AI supplier-recommendation hooks.
- **AuditTimeline** + `AuditTimelineSheet` shared components — replace mock activity feeds with append-only event log via `auditService`.
- **BomRoutingTree** — single integrated BOM+routing tree replaces 3-tab layout on Plan job detail; Make MO detail renders the same tree read-only.
- **PillNav** canonical pill-shaped tab strip (with dock-style magnify) + 3D viewers (`DrawingViewer`, `GlbViewer`) + `BomOverlay`.
- **`.ai-card-glow` utility** in `globals.css` — shape-agnostic teal halo for MirrorWorks Agent surfaces.
