# Buy — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** as `.docx` — see P0 finding. A PDF exists at `apps/web/src/guidelines/MirrorWorksModuleSpec.pdf` but is referenced from `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` with a broken relative link (`./MirrorWorksModuleSpec.pdf` resolves nowhere because the markdown lives one directory deeper). Treat the spec as not parseable by this worker.
  - Code: `apps/web/src/components/buy/` (19 components, 4,727 LOC)
  - Service facade: `apps/web/src/services/buyService.ts` (107 LOC, 16 methods, mock-backed)
  - Types: `apps/web/src/types/entities.ts` — `Supplier`, `PurchaseOrder`, `Requisition`, `Bill`, `GoodsReceipt`, `MrpSuggestion`, `ReorderRule`, `VendorComparisonData`, `RequisitionItem`, `GoodsReceiptItem`
  - Mock shapes: `apps/web/src/services/mock/data.ts` lines 196 (`suppliers`), 361 (`purchaseOrders`), 369 (`requisitions`), 375 (`bills`), 381 (`goodsReceipts`), 747 (`mrpSuggestions`), 756 (`reorderRules`), 764 (`vendorComparisonData`)
  - Routes: `apps/web/src/routes.tsx` — `/buy/*` defined at lines 269-293 (20 route entries, 19 unique destinations; `/buy/requisitions/:id` + listing = 2 routes for requisitions, etc.)
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` — Buy permission keys at line 43, component reference at line 31
  - Permission source in code: `apps/web/src/components/buy/BuySettings.tsx` lines 25-34 (`buyPermissionKeys`) and lines 37-77 (`buyDefaultGroups`)
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-buy.md`

## Completeness findings

- All 19 unique routes under `/buy/*` defined in `apps/web/src/routes.tsx` lines 271-292 have a corresponding doc file in `docs/user/modules/buy/`. Route-to-doc coverage is 100%. Count: 19 docs + 1 README = 20 files in `docs/user/modules/buy/`, matching the scope of this audit.
- Every built component under `apps/web/src/components/buy/` is documented. There are no orphan components in Buy — unlike Sell, which had 13 components with no doc.
- `BuyProductDetail.tsx` is a 9-line wrapper around `@/components/shared/product/ProductDetail` with `module="buy"`. The shared component is not documented in Buy; doc `product-detail.md` should either link to the shared-component's owning module's doc or declare this explicitly. Today it describes Product Detail as if it lives in Buy.
- The doc template has no `## Service layer` section. `apps/web/src/services/buyService.ts` exposes 16 async methods (`getPurchaseOrders`, `getPurchaseOrderById`, `getRequisitions`, `getBills`, `getGoodsReceipts`, `getSuppliers`, `getSupplierById`, `getKpis`, `getSpendByCategory`, `getSupplierPerformance`, `getApprovalQueue`, `getMrpSuggestions`, `getReorderRules`, `getVendorComparison`, `getPurchasePlanningGrid`). None are referenced by any migrated Buy doc.
- `@/types/entities` types consumed by Buy screens are not listed in any doc. Expected in a `## Types` section: `Supplier`, `PurchaseOrder`, `Requisition`, `RequisitionItem`, `Bill`, `GoodsReceipt`, `GoodsReceiptItem`, `MrpSuggestion`, `ReorderRule`, `VendorComparisonData`, `KpiMetric`, `ApprovalItem`, `ChartDataPoint`.
- `apps/web/src/services/mock/data.ts` is the canonical source for every Buy screen's data. No doc names it. Buy-specific mock exports documented nowhere: `purchaseOrders`, `requisitions`, `bills`, `goodsReceipts`, `suppliers`, `buyKpis`, `spendByCategory`, `supplierPerformance`, `buyApprovalQueue`, `mrpSuggestions`, `reorderRules`, `vendorComparisonData`, `purchasePlanningGrid`.
- Zustand stores: grep across `apps/web/src/components/buy/` for `useQuery`, `useMutation`, `zustand`, `@tanstack`, `createStore` returns zero matches. Buy screens are entirely local-state. Dev docs should make this explicit; the current docs are silent, which makes it unclear whether "no store listed" means "not investigated" or "not used".
- React Query keys: no Buy screen uses TanStack Query. Unlike Sell (which at least declares "service facade present, no query layer"), Buy also silently imports the service directly with raw `useEffect(() => buyService.X().then(...), [])` pattern. See `BuyMrpSuggestions.tsx:47-52`, `BuyReorderRules.tsx` (same pattern), `BuyPlanningGrid.tsx` (same pattern). Dev docs should flag this as deliberate prototype-stage wiring vs. accidental.
- Event flows / mutations: 16 `toast(...)` calls across 10 screens (`BuyBills.tsx` ×2, `BuyOrderDetail.tsx` ×3, `BuyOrders.tsx` ×1, `BuyRFQs.tsx` ×1, `BuyReceipts.tsx` ×2, `BuyRequisitionDetail.tsx` ×2, `BuyRequisitions.tsx` ×2, `BuySettings.tsx` ×1, `BuySupplierDetail.tsx` ×2, `BuyMrpSuggestions.tsx` has its own toast import but fires via `handleCreatePo`). All mutations resolve to a toast today. No doc surfaces the "coming soon" strings (`New purchase order coming soon`, `Barcode scanner coming soon`, `Camera capture coming soon`, `New RFQ coming soon`, `Requisition actions coming soon`, `Edit mode coming soon`, etc.) which are effectively a migration TODO backlog.
- Migration context: `buyService.ts` line 3 reads `"Replace the mock implementation with a remote adapter when Convex is ready."` No migrated doc surfaces the Convex target. The `## Migration status` section is entirely missing from the template.
- Permissions touchpoints (ARCH 00 §4.8): the permission keys declared in `BuySettings.tsx` lines 25-34 are `documents.scope`, `requisitions.scope`, `po.create`, `po.approve`, `vendors.manage`, `goods_receipts.access`, `settings.access`, `reports.access`. None of the per-screen docs cross-reference which permission gates their actions — e.g. `orders.md` does not state that `po.create` guards the "New purchase order" CTA, and `receipts.md` does not mention `goods_receipts.access`.
- Tier gating (Pilot / Produce / Expand / Excel): no Buy doc declares a tier. Based on the code and module grouping in `Sidebar.tsx` (not audited here), the advanced routes `/buy/mrp-suggestions`, `/buy/planning-grid`, `/buy/vendor-comparison`, `/buy/reorder-rules` are likely Expand+ (they reference MRP, what-if, and auto-reorder logic), and `/buy/reports` is likely Produce+. The template has no `## Tier gate` section; flagged here as a completeness gap.
- Testing notes: no migrated Buy doc has a `## Testing` or `## QA` section. Template omission.
- Dynamic route coverage: `/buy/orders/:id`, `/buy/requisitions/:id`, `/buy/suppliers/:id`, `/buy/products/:id` all documented. Their param-loading strategy is described with the same boiler-plate copy seen in Sell ("Routing links and back navigation are handled in-component", "Dependencies: No explicit store/service/hook dependency imported in this component"). For Buy this is factually wrong — see Accuracy below.

## Accuracy findings

- **False "no dependency" claim in 16 of 19 docs.** Every screen doc says `Dependencies: No explicit store/service/hook dependency imported in this component`. This is wrong for:
  - `BuyDashboard.tsx` lines 12-18 — imports `buyKpis`, `spendByCategory`, `supplierPerformance`, `buyApprovalQueue` etc. from `@/services`.
  - `BuyOrders.tsx` line 14 — `import { purchaseOrders } from '@/services';`
  - `BuyOrderDetail.tsx` line 23 — `import { purchaseOrders } from "@/services";`
  - `BuyRequisitions.tsx` line 18 — `import { requisitions as centralReqs, employees } from '@/services';`
  - `BuyRequisitionDetail.tsx` line 13 — `import { requisitions, employees, purchaseOrders } from '@/services';`
  - `BuyReceipts.tsx` line 14 — `import { purchaseOrders } from '@/services';`
  - `BuyProducts.tsx` line 6 — `import { products as centralProducts, suppliers } from '@/services';`
  - `BuyMrpSuggestions.tsx` line 36 + `import { buyService } from "@/services";` and `import type { MrpSuggestion } from "@/types/entities";`
  - `BuyReorderRules.tsx` — same pattern, `buyService` + `ReorderRule` type.
  - `BuyPlanningGrid.tsx` — `buyService.getPurchasePlanningGrid()`.
  - `BuyVendorComparison.tsx`, `BuyBills.tsx`, `BuyAgreements.tsx`, `BuySuppliers.tsx`, `BuySupplierDetail.tsx` all pull seed/mock data from `@/services` or inline mock fixtures.
  - Only `BuyProductDetail.tsx` (9-line wrapper) and `BuySettings.tsx` (inline demo seed, but still imports shared `ModuleSettingsLayout`) arguably have "no external store/service dep".
- **`docs/user/modules/buy/README.md` line 7 declares "Primary Users: Purchasing officers, planners, and procurement managers."** — none of these are canon roles per `feedback: Access role vocabulary` (only `admin`, `lead`, `team` are allowed; the distinct persona titles "Purchasing officer" / "procurement manager" / "planner" need to be reframed as groups or use-cases, not roles).
- **`dashboard.md` claims `Data Shown: Page-specific records and controls shown in current UI implementation.`** — `BuyDashboard.tsx` in fact renders KPI cards, bar + pie Recharts, an AI feed, and a quick-nav panel driven by named seed arrays. The doc is vague to the point of being wrong.
- **`mrp-suggestions.md` "Components Used" lists the bare template entry but misses `KpiStatCard` (actually imported), `Card`, `Badge`, `Button`, and the `Table*` family from `@/components/ui/table`.** More importantly, the doc does not distinguish this page from `/plan/mrp` (demand cascade tree, `PlanMrp.tsx`). See Consistency.
- **`settings.md` "Related Files" omits the key artefact — the `buyPermissionKeys` declaration (ARCH 00 §4.8) at lines 25-34.** The doc should call out that this file is the source of truth for Buy permissions, not a generic settings surface.
- **`receipts.md` "Data Shown: Current page includes mock/seed data sources (inferred from code)".** The component opens with a fixed hand-built record `{ poNumber: 'PO-2035', supplier: 'ABC Steel Supplies', ... }` — it is not reading from `@/services` via the facade, even though `purchaseOrders` is imported. Doc obscures this mismatch.
- **`order-detail.md` states "Current implementation includes mock/seed data paths".** True, but it understates scope: `BuyOrderDetail.tsx` is 848 lines — by far the largest Buy component — and contains hard-coded mock objects for `receipts`, `qcChecks`, `aiInsights`, `activity`, and a receiving-progress panel. None of this extra mock state is surfaced.
- **`reorder-rules.md`, `planning-grid.md`, `vendor-comparison.md` all claim "Behavior is documented from current component implementation".** The template phrase is inaccurate — the docs do not describe what the page actually does. `planning-grid.md` does not explain time-buckets, `vendor-comparison.md` does not describe the scoring axes, `reorder-rules.md` does not mention the on/off toggle behaviour driving `buyService` updates.
- **`products.md` Components Used list does not mention `suppliers` (imported alongside `products as centralProducts`)** used to join supplier names to the materials table.
- **`rfqs.md` Components Used lists `apps/web/src/components/ui/animated-icons.tsx`** — the actual import is `AnimatedPlus` from `../ui/animated-icons` (same file, but the convention in the same doc oscillates between `@/`-alias and absolute `apps/web/src/` paths; see Consistency).
- **`suppliers.md` "Data Shown: sourcing comparisons"** is misleading — this page shows supplier directory cards, not comparisons. Vendor comparisons live on `/buy/vendor-comparison`.
- **`README.md` "Core Entities Used" says "Entity shapes are defined by routed pages and shared mocks/services/stores in this module."** False — entity shapes are defined in `apps/web/src/types/entities.ts`. The indirection erases the canonical location.
- **`README.md` line 48 "Data Dependencies: Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`".** Buy does not touch `apps/web/src/store` at all (grep confirms zero matches). The statement should name `@/services/buyService.ts` and the mock fixtures specifically.
- **`README.md` "Open Issues" is auto-generated and surfaces only six screens** (orders, order-detail, requisitions, requisitions/:id, receipts) — it misses 13 other screens with identical issues. The list should be re-generated from the current state or removed.
- **`order-detail.md` lists `apps/web/src/components/buy/BuyOrderDetail.tsx` in "Related Files"** but does not name the shared components it depends on: `AIInsightCard`, `StatusBadge`, the `Table*` family.

## Consistency findings

- All 19 screen docs use the same 12-heading template (Summary, Route, User Intent, Primary Actions, Key UI Sections, Data Shown, States, Components Used, Logic / Behaviour, Dependencies, Design / UX Notes, Known Gaps / Questions, Related Files). Some docs drop one or two sections silently (e.g. `agreements.md` ends at "Components Used").
- `README.md` does not follow the screen template — it uses Purpose / Primary Users / Key Workflows / Main Routes/Pages / Core Entities Used / Important Components / Data Dependencies / Open Issues / Related Modules. This is appropriate for a landing page but tooling should skip it when parsing per-screen docs.
- "States" vocabulary varies: `orders.md` lists `default, error, success, blocked, populated`; `rfqs.md` lists `default, success, populated`; `reorder-rules.md` lists `default, loading, error, success, blocked, populated`. There is no central enum.
- Filename convention: kebab-case docs (`order-detail.md`, `mrp-suggestions.md`, `planning-grid.md`, `vendor-comparison.md`, `reorder-rules.md`) vs. PascalCase components (`BuyOrderDetail.tsx`, `BuyMrpSuggestions.tsx`, `BuyPlanningGrid.tsx`, `BuyVendorComparison.tsx`, `BuyReorderRules.tsx`). No convention stated.
- "Components Used" lists use mixed import notations in the same file: `@/components/shared/data/MwDataTable` vs `apps/web/src/components/ui/button.tsx` (see `requisitions.md` lines 22-27, `rfqs.md` lines 22-29, `suppliers.md` lines 22-30).
- "Design / UX Notes" contains boilerplate phrases repeated across ≥10 files: `"Mock/seed records are present; edge-case realism may be limited."`, `"Placeholder/legacy text suggests unfinished UX in parts of this page."`, `"Some CTAs provide confirmation toasts without obvious persistence in-file."`, `"Action persistence paths are not fully visible in this component alone."`
- **Buy-specific doc divergence — `/buy/mrp-suggestions` vs. `/plan/mrp` overlap:** `docs/user/modules/buy/mrp-suggestions.md` describes the Buy screen as "Planning calculations, schedule allocations, and what-if outputs". `apps/web/src/components/plan/PlanMrp.tsx` lines 1-7 describes `/plan/mrp` as "MRP demand cascade tree view. Expandable tree: Sales Order -> Job -> Manufacturing Order -> Purchase Order". These are distinct features but the Buy doc leans on terminology ("what-if", "schedule allocations") that sounds like the Plan cascade. And `/plan/purchase` (`PlanPurchase.tsx` line 2: "Project-Aware Purchase Planning — Material requirements by job, suggested POs grouped by supplier") directly overlaps with `/buy/mrp-suggestions` (shortfall → PO recommendations). None of the three docs cross-reference each other. A reader comparing the three pages will struggle to understand which one to use when.
- Breadcrumb label inconsistency: `BuyMrpSuggestions.tsx` line 40 sets the breadcrumb label to `"MRP Suggestions"` (Title Case with acronym). The kebab-case slug `mrp-suggestions` and the doc file name match, but there is no stated policy.
- Group names in `BuySettings.tsx` lines 39/52/65 are `Purchasing`, `Receiving`, `Accounts` — these are permission groups (fine per ARCH 00 §4.8). However `README.md` line 7 uses the same labels as "Primary Users", conflating **groups** with **personas**.

## Style findings

- Non-canon role vocabulary — `README.md` line 7: "Purchasing officers, planners, and procurement managers." Per `feedback: Access role vocabulary`, only `admin`, `lead`, `team` are allowed. Rewrite as: "Anyone in the Purchasing, Receiving, or Accounts group (ARCH 00 §4.8), plus module leads and admins."
- Non-canon role vocabulary inside components (not in docs, but affects doc accuracy) — `BuySettings.tsx` lines 115-116 use `approver: 'Supervisor'` and `approver: 'Manager'` (both flagged). `BuyRequisitions.tsx` line 37 references a `Purchasing` department which is fine as a department label but should not be conflated with a role.
- UK English: mixed. `mrp-suggestions.md` line 19 uses "Behavior"; `rfqs.md` line 43 uses `"memoized"`; `supplier-detail.md` line 47 uses `"memoized"`. Should be `behaviour`, `memoised`. Many doc headings already use `Logic / Behaviour` (UK), creating an intra-file inconsistency.
- Oxford comma: not exercised much by the template but `README.md` line 4 `"supplier management, purchasing transactions, and planning tools"` is correct.
- Direct technical register: acceptable. No marketing verbs detected in Buy dev docs — no `leverage`, `seamless`, `robust`, `empower`, `unlock`, `unleash`, `streamline`.
- Hyphenation: `client-side`, `mock/seed-backed`, `procure-to-pay` — consistent.
- Code fencing: no code blocks in any migrated Buy doc. Dev audiences expect at minimum: route definitions, service method signatures, the `buyPermissionKeys` table. None present.
- Forbidden vendor names: grep across `docs/user/modules/buy/*.md` returns zero hits for Supabase, Convex, WorkOS, Resend, React, Zustand, Con-form. Clean on this dimension. `buyService.ts` line 3 names Convex in a code comment — this is source, not docs, so not a style violation here, but should still be scrubbed from user-facing docs if surfaced.
- No emojis in any Buy doc. Clean.

## Visual findings

Screenshots captured this pass under `docs/audits/screenshots/buy/` (1440×900, chromium, full viewport):

- `buy.png` (/buy), `buy-orders.png`, `buy-requisitions.png`, `buy-receipts.png`, `buy-suppliers.png`, `buy-rfqs.png`, `buy-bills.png`, `buy-products.png`, `buy-agreements.png`, `buy-mrp-suggestions.png`, `buy-planning-grid.png`, `buy-vendor-comparison.png`, `buy-reorder-rules.png`, `buy-reports.png`, `buy-settings.png`. All 15 files present; all >10 KB (smallest `buy-receipts.png` at ~74 KB).

Coverage vs. routes:

- **Covered:** `/buy`, `/buy/orders`, `/buy/requisitions`, `/buy/receipts`, `/buy/suppliers`, `/buy/rfqs`, `/buy/bills`, `/buy/products`, `/buy/agreements`, `/buy/mrp-suggestions`, `/buy/planning-grid`, `/buy/vendor-comparison`, `/buy/reorder-rules`, `/buy/reports`, `/buy/settings` — 15 list/standalone routes.
- **Missing:** all four dynamic detail routes — `/buy/orders/:id`, `/buy/requisitions/:id`, `/buy/suppliers/:id`, `/buy/products/:id`. These require a specific id to render meaningfully and were out of scope for this screenshot pass.
- No Buy doc embeds any image. Screenshots are reference-only for the audit.
- Spot-check: `buy-mrp-suggestions.png` vs. `mrp-suggestions.md`. Doc says "KPI/summary card strip" and "Primary table/list region". Screenshot shows three KPI cards across the top (shortfall value, suggested POs, estimated AUD) and a table below. Consistent at the shape level; the doc does not describe what each KPI card represents.
- Spot-check: `buy-settings.png` vs. `settings.md`. Doc lists "Form controls for editing/creation" and "Charts and trend cards". Screenshot shows a sidebar-tabbed settings layout (General / Suppliers / Reports / Access & Permissions). No chart is visible on the default panel. "Charts and trend cards" is likely inaccurate for this page.
- Spot-check: `buy.png` (dashboard) vs. `dashboard.md`. Doc mentions `KpiStatCard` and an AI feed. Screenshot confirms KPI strip across the top, a bar chart, a pie chart, and a quick-nav grid. Doc does not describe the pie chart or quick-nav panel.
- Colour spot-check: MW Yellow `#FFCF4B` appears on primary CTAs in every captured page (New PO, New requisition, New RFQ, New bill). No white text on yellow detected in the screenshots (compliant with `feedback: Yellow bg = dark text`).
- Light mode only: screenshots captured without toggling dark mode. No regression risk to existing light-mode styles (`feedback: Preserve light mode`).

## Gaps and recommendations

### P0 (blocking)

- **No `.docx` spec in the repo.** Per the rubric ("No `.docx` spec → P0"). The nearest artefact is `apps/web/src/guidelines/MirrorWorksModuleSpec.pdf`, referenced with a broken relative path from `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`. Either commit the `.docx`, or fix the PDF link and publicly declare the PDF as the canonical spec of record. Without this, no per-module finding in this audit can be traced to a spec line.
- **Dev-doc split is stub-only.** `docs/dev/modules/buy/` now contains 19 stub files with TODO markers (see `docs/audits/MIGRATION-LOG-buy.md`). No dev content has been authored. Either schedule the human split work (est. 1 day per module) or retract the split promise.
- **Every migrated Buy screen doc is Mixed.** User readers get component import lists; dev readers get marketing-adjacent "User Intent" lines. Until the split is real the docs serve neither audience fully.

### P1 (should fix before launch)

- Add a `## Service layer` section to the screen-doc template and back-fill it for all 19 Buy screens using the 16 `buyService.*` method names. The stub already includes the heading.
- Add a `## Permission gate` section mapping each screen to its `buyPermissionKeys` entry (ARCH 00 §4.8): `/buy/orders` → `po.create`, `po.approve`; `/buy/requisitions` → `requisitions.scope`; `/buy/receipts` → `goods_receipts.access`; `/buy/suppliers` → `vendors.manage`; `/buy/reports` → `reports.access`; `/buy/settings` → `settings.access`.
- Add a `## Tier gate` section. Proposed defaults: Pilot — `/buy`, `/buy/orders`, `/buy/requisitions`, `/buy/receipts`, `/buy/suppliers`, `/buy/bills`, `/buy/products`, `/buy/settings`. Produce — `/buy/rfqs`, `/buy/agreements`, `/buy/reports`. Expand — `/buy/mrp-suggestions`, `/buy/planning-grid`, `/buy/vendor-comparison`, `/buy/reorder-rules`. Excel — reserved. Validate with the spec once the `.docx`/PDF is accessible.
- Fix the false "No explicit store/service/hook dependency imported" claim in every Buy screen doc. 16 of 19 screens import from `@/services`; only `BuyProductDetail.tsx` (9-line shared-component wrapper) genuinely has no dep.
- Replace `README.md` line 7 "Purchasing officers, planners, and procurement managers" with canon role + group language: `admin`, `lead`, `team` roles; groups `Purchasing`, `Receiving`, `Accounts` (per ARCH 00 §4.8).
- Rewrite `README.md` "Core Entities Used" to name `apps/web/src/types/entities.ts` and list the specific types Buy consumes (12 named above).
- Rewrite `README.md` "Data Dependencies" — Buy does not touch `apps/web/src/store`. Name `@/services/buyService.ts` + `apps/web/src/services/mock/data.ts` instead.
- Clarify the **MRP boundary** across `/buy/mrp-suggestions`, `/plan/mrp`, and `/plan/purchase`. Proposed one-liners:
  - `/plan/mrp` — Demand cascade tree (read-only): Sales Order → Job → Manufacturing Order → Purchase Order, with shortage status.
  - `/plan/purchase` — Project-aware material requirements by job, grouped by supplier, with bulk conversion to POs.
  - `/buy/mrp-suggestions` — Single-level shortfall list (item-level) with one-click PO creation per row.
  - Each doc should cross-link to the other two.
- Document the `BuyProductDetail` wrapper pattern explicitly in `product-detail.md` — the page renders the shared `ProductDetail` with `module="buy"`.
- Document the 16 "coming soon" toast backlog as a single consolidated migration TODO list in `docs/dev/modules/buy/` (or the README stub).
- Unify "States" vocabulary across screens; publish the enum in a Buy module preamble (same recommendation as Sell).
- Capture the 4 missing detail-route screenshots (`/buy/orders/:id`, `/buy/requisitions/:id`, `/buy/suppliers/:id`, `/buy/products/:id`) on the next pass with known seed ids.
- Add code fences with route definitions and the `buyPermissionKeys` table to every relevant dev stub.

### P2 (nice to have)

- Normalise UK English across Buy docs (`behaviour`, `memoised`). Currently the heading uses UK spelling and the body uses US spelling — change the body.
- Unify import notation in "Components Used" lists. Pick `@/`-alias throughout; delete the `apps/web/src/` absolute paths.
- Replace the boilerplate Design / UX Notes block with screen-specific notes — currently the same three sentences appear in ≥10 files.
- Surface lazy-loading / code-splitting behaviour (`React.lazy` at `routes.tsx` lines 37-55) in the Buy README under a `## Performance` note.
- Document the breadcrumb convention: title-cased, slug derived from the URL (`mrp-suggestions` → `MRP Suggestions`).
- Document the acronym policy — `RFQ`, `MRP`, `PO` appear in titles but are not expanded on first use in several docs.
- Flag the `BuyOrderDetail.tsx` 848-line component as a refactor candidate in `order-detail.md` under Known Gaps.
- Remove the auto-generated "Open Issues" block from `README.md` (or re-generate from current state — currently covers only six of 19 screens).
