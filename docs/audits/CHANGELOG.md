# Changelog

Rolling log of changes shipped to `main`. Latest at top. Each entry: date — N commits — what shipped — link to detail.

For detail before consolidation (2026-04-22 to 2026-05-05), see `_archive/changelogs/` — those daily files were merged into this index on 2026-05-11 cleanup.

---

## 2026-05-21 — 7 commits — Product↔Template wiring, polymorphic Assignee, cross-module return chip

**Product detail screen, continued.** Activity templates are now first-class on the product (Planning tab): set `productKind`, pin one or more templates, and the templates pre-apply to Plan jobs when the order is confirmed. Each row expands to show the full activity flow and links straight into the template editor.

- `feat(product+plan): link Products to activity templates, add template assignees` — new `Assignee` discriminated union (`user | team | machine`), `AssigneeChip` + `AssigneePicker` (cmdk grouped), `TemplateActivity.defaultAssignee`, `Product.productKind` + `defaultTemplateIds`, KickoffDialog on Sales Orders (Release to Plan → per-line template selection → create Plan jobs), TemplatesPanel "Used by N products" lens.
- `feat(templates): split assignee from machine on TemplateActivity` — Default assignee restricted to user|team; new dedicated Machine picker beside it. Two columns in the activity editor.
- `refactor(product): move Activity templates from Manufacturing to Planning tab` — Manufacturing stays about the physical artefact (BOM, routing, suppliers); Planning gets the Plan-side workflow config.
- `polish(templates): deduped assignee + machine chips on template card` — TemplatesPanel rows surface the template's overall assignment pattern at a glance.
- `feat(product): hover-edit + upload dialog on hero thumbnail` — hover the product image → pen icon top-right → upload Dialog with drag-drop, file picker, and URL paste.
- `feat(product): expand + edit links on Activity templates rows` — chevron reveals the full numbered activity flow with stage/duration/priority/chips; pencil deep-links to Plan Settings with the editor pre-opened.
- `feat(nav): ReturnContextChip — back-to-previous after cross-module deep-links` — shared primitive. Source pages append `?from=&fromLabel=`; destination drops `<ReturnContextChip />` near the title. ModuleSettingsLayout wires it for every module's settings page. First consumer: Product → Template editor.

## 2026-05-20 — 44 commits — Sell + Plan module overhauls, shared filter/Gantt/lineage/chat primitives, dark-mode pass

Two-week run. Five new cross-cutting shared systems landed (ModuleFilterBar, MwGantt, DocumentChainPill, Chatter, EditableCard); Sell and Plan got full module overhauls; dark mode reached visual parity. See ADR-001 through ADR-004 for the pattern-setting decisions.

**Shared primitives**

- **Schema-driven `ModuleFilterBar`** (`apps/web/src/components/shared/filters/`) — single configurable filter strip (`AddFilterMenu`, `FacetChip`, `DateChip`, `PresetMenu`, URL-state sync, saved views). Piloted on Sell list pages, then ported to `BookInvoices`, `BuyBills`, `BuyOrders`, `MakeWorkOrders`, `PlanJobs`, `ShipOrders`, `ShipTracking`. See ADR-001.
- **`MwGantt`** (`apps/web/src/components/shared/gantt/`) — shared Gantt primitive used by Plan job-detail schedule tab and Plan activity timeline. `MwGanttBar`, `MwGanttRow`, `MwGanttToolbar`, `NowLine`, geometry helpers. See ADR-002.
- **`DocumentChainPill`** (`apps/web/src/components/shared/data/DocumentChainPill.tsx`) — surfaces the upstream + downstream document chain (e.g. Quote → Order → MO → Invoice) on detail headers. Wired into `SellOpportunityPage`, `SellOrderDetail`, `SellQuoteDetail`, `MakeManufacturingOrderDetail`. See ADR-003.
- **Chatter** (`apps/web/src/components/shared/chatter/` + `chatterService`, `chatterStore`) — app-wide record-following chat. `ChatterButton`, `ChatterSheet`, `ChatterComposer`, `ChatterChainFilter`, `ChatterSummaryCard`, `useChatterFollow` hook. Available on Sell, Make, Plan detail surfaces. See ADR-004.
- **`EditableCard` + `EditField`** (`apps/web/src/components/shared/forms/`) — inline editable card pattern adopted across Sell detail pages. Pairs with shared `LogActivityModal`, `HistoryPanel`, `EntityPickerModal`.
- **`MwDataTable`** added under `shared/data/` (used by the ported filter bars).
- **`ModuleLeadRow`** + `ModuleAccessCard` — per-ARCH-00 module-lead assignment surfaces (admin → lead → team vocabulary only).
- **`SiteSwitcher`** — tier-gated multi-site switcher in sidebar header (`store/siteStore.ts`).

**Plan**

- **New `/plan/activities` page** — log job activity, run timers (`GlobalTimerPill`, `TimerPill`, `TimeEntryDialog`), activity templates. Job-detail gains a `JobActivitiesTab` + `JobActivityTimeSummary`. Settings gain an `ActivityTypesPanel`.
- **Plan module overhaul** — editable schedule on `PlanScheduleTab`, new `PlanMirrorViewTab`, `PlanProductionTab`, `PlanTravellersTab` with sign-off; `PlanMachineIO` and `PlanMrp` consolidated. Wires up previously dead buttons (Schedule / File / Share dialogs on job detail).
- **Plan Nesting Studio polish** — polygon-aware nester, true DXF shapes rendered, canvas context menu, redirect from `/plan/nesting`, `/plan/nesting-studio` into the machine-io tabbed surface.
- **Plan CAD Import** — real 3D preview sheet for STEP/IGES uploads.
- **Plan Schedule** — Optimisation priority selectable in auto-schedule dialog.

**Sell**

- **Sell module overhaul** — editable cards on customer / opportunity / order / quote detail; quote state machine; quote/order lineage; consolidated `LogActivityModal`; `numbering.ts` service for document numbering.
- **Sell Products** — button alignment, SKU rename, machine assignment, MirrorView tab, pricing intel; tab badges derived from real counts.
- **Sell CRM** — editable new-customer form; crash-on-`/sell/crm/new` fix (missing `documents` field).
- **Sell Quote Assistant** — history-recall surface with source-quote badges.
- **Sell ownership filters** — "My quotes", "My orders", "My accounts", "My pipeline" presets.
- **Quote totals** — show total margin; fulfilment address split.

**Make**

- **Dashboard** — OEE composition donut and cycle-time-vs-standard charts.
- **Quality** — AI-flagged NCR rows with detail sheet.
- **Live Floor** — 3D isometric shop-floor view toggle.

**Buy / Ship / Book**

- **Buy** — "Chase late POs" AI agent scenario with email drafts; supplier AI agent; expanded reports; `BuyRequisitionDetail` line editor; vendor-comparison filters + AI agent.
- **Ship** — intelligent carrier-selection comparison card; scan-to-ship dispatch modal; tracking actions.
- **Ship → Book** — auto-draft invoice when shipment marked delivered.

**Control**

- **Pricing page** at `/control/pricing` (read-only marketing view) + settings deep-link from coming-soon toast replacement.
- **Billing** — AI usage radial meter; AICreditsCard wiring.
- **Control + Make** — predictive maintenance card with ML-style signals.
- **Machine form cleanup** in `ControlMachines`.

**Cross-cutting**

- **Dark mode contrast pass** — sweep across Sidebar, WelcomeDashboard, every Buy/Plan/Make/Control surface, agent / AI / notification / settings shared components.
- **Border-radius normalisation** — Tailwind utilities standardised to short form (`rounded-lg`, `rounded-md`, etc.) repo-wide; design-system doc updated with correct radius scale + dark-mode section.
- **Bridge** — MYOB added as a selectable migration source.
- **Roles** — Supervisor / Operator UI labels renamed to **Lead / Team** (admin / lead / team is the only sanctioned vocabulary).
- **animate-ui** — forwardRef on icon wrappers to silence Radix Slot warnings.

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
