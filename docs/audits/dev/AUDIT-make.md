# Make — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding below (no `.docx` spec for Make)
  - Code: `apps/web/src/components/make/`
  - Shop-floor sub-components: `apps/web/src/components/make/shop-floor/`
  - Cross-module shop-floor views: `apps/web/src/components/shop-floor/` (`QualityTab`, `WorkOrderFullScreen`)
  - Routes: `apps/web/src/routes.tsx` — lines 79–99, 336–359 (`/make/*`)
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` (§4.5 Make permission keys)
  - Stores: `apps/web/src/store/{travellerStore,floorExecutionStore,shopFloorEntryStore}.ts`
  - Services: `apps/web/src/services/{makeService.ts,mock/data.ts}` (no `src/lib/services/` — see P1)
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-make.md`
- **Screenshots:** `docs/audits/screenshots/make/*.png` (11 routes captured at 1440×900)

## Completeness findings

1. `docs/dev/modules/make/README.md` lists 12 routes but omits the runtime redirects `/make/time-clock → /floor` and `/make/scan → /floor` wired in `apps/web/src/routes.tsx:347` and `:351`. Dev readers should know these URLs exist as bookmarks. (`docs/dev/modules/make/README.md`)
2. README "Important Components" omits `MakeShopFloorKanban.tsx`, `BatchTraceability.tsx`, `MaterialConsumption.tsx`, `OperatorChat.tsx`, `OfflineIndicator.tsx`, `WorkOrderSequencing.tsx`, `MakeScanStation.tsx`, and `MakeTimeClock.tsx` — each lives under `apps/web/src/components/make/` but is invisible in docs. (`apps/web/src/components/make/`)
3. README "Data Dependencies" claims stores/services live "mainly under `apps/web/src/store` and `apps/web/src/services`". True, but no specific Make-relevant store is named. The Make module depends on `travellerStore`, `floorExecutionStore`, `shopFloorEntryStore`. (`apps/web/src/store/travellerStore.ts`, `shopFloorEntryStore.ts`, `floorExecutionStore.ts`)
4. `docs/dev/modules/make/shop-floor.md` says "No explicit store/service/hook dependency imported in this component" — wrong. `ShopFloorPage.tsx` imports three Zustand stores and one helper (`useShopFloorEntryStore`, `useFloorExecutionStore`, `useTravellerStore`, `getMachineDetailWorkOrder`). (`apps/web/src/components/make/shop-floor/ShopFloorPage.tsx:4-12`)
5. `docs/dev/modules/make/manufacturing-order-detail.md` says "No explicit store/service/hook dependency imported". Wrong — `MakeManufacturingOrderDetail.tsx:29,32` imports `manufacturingOrders` from `@/services` and `useTravellerStore` from `@/store/travellerStore`. (`apps/web/src/components/make/MakeManufacturingOrderDetail.tsx:29,32`)
6. `docs/dev/modules/make/manufacturing-order-detail.md` does not mention the 5-tab structure (`Overview`, `Work`, `Issues`, `Intelligence Hub`, `Documents`) declared in `DEFAULT_TABS` at `MakeManufacturingOrderDetail.tsx:95-101`. Doc still says "Manufacturing Order Detail screen" with no tab taxonomy. (`apps/web/src/components/make/MakeManufacturingOrderDetail.tsx:95-101`)
7. `docs/dev/modules/make/capa.md` under-specifies the kanban. Code defines six fixed columns — `identified`, `root_cause`, `containment`, `corrective_action`, `verification`, `closed` — and four severity tiers — `low`, `medium`, `high`, `critical` (`MakeCapa.tsx:35-42, 48-63`). Doc says only "Complete capa work". (`apps/web/src/components/make/MakeCapa.tsx:35-63`)
8. `docs/dev/modules/make/scrap-analysis.md` does not name the `GroupBy` dimension (`equipment | operator | week`) or the inverted colour scale (`getChartScaleColour` — higher scrap rate → higher colour intensity) documented in the code comment. (`apps/web/src/components/make/MakeScrapAnalysis.tsx:3-7, 32`)
9. `docs/dev/modules/make/settings.md` lists "General, Quality, Reports, Access & Permissions" implicitly, but fails to enumerate the **nine `makePermissionKeys`** defined in `MakeSettings.tsx:25-35` (`documents.scope`, `workorders.scope`, `timers.scope`, `qc.record`, `scrap.report`, `andon.manage`, `maintenance.manage`, `settings.access`, `reports.access`) and the four default groups (`Production`, `Quality`, `Maintenance`, `Office`). (`apps/web/src/components/make/MakeSettings.tsx:25-90`)
10. `docs/dev/modules/make/job-traveler.md` misses the `BarcodeDisplay` component's role: the barcode encodes the MO number and is "printed on the paper traveler" (`MakeJobTraveler.tsx:204-206`). The barcode workflow is recent (commit `bc6495fc`) and docs lag.
11. `docs/dev/modules/make/dashboard.md` lists nine components but omits the work-order cards, machine andon grid, and Gantt strip with hover tooltips that dominate the screen (see `MakeDashboard.tsx:1-78`, 685 lines total — the largest Make component). No dashboard section named "Machine andon" or "Work order cards" exists in the doc.
12. `docs/dev/modules/make/products.md` misses the "Make" CTA behaviour — each product card has a prominent "Make" CTA to start a manufacturing order (`MakeProducts.tsx:2-5`). Doc describes only generic "Create or add records".
13. No doc mentions the shop-floor traveller hold side-effect (`ShopFloorPage.tsx:98-101` — calling `holdTraveller(id)` plus a toast to planning). This is a state-mutating UX that a dev reader needs to know about.
14. No event flows documented anywhere. Release → in_progress → hold → released queue displayed on `/make/shop-floor` is a cross-store flow (`travellerStore` ↔ `shopFloorEntryStore` ↔ `floorExecutionStore`) that is undocumented.
15. `docs/dev/modules/make/schedule.md` does not say the schedule uses a hard-coded `DEMO_TODAY = 2026-03-20` today-marker (`MakeSchedule.tsx:65`) — useful context for anyone investigating timezone/today-marker regressions.
16. `docs/dev/modules/make/product-detail.md` does not mention that the route body is a 9-line wrapper passing `module="make"` into the shared `ProductDetail` component (`MakeProductDetail.tsx:1-10`). Dev readers following the doc think `MakeProductDetail.tsx` contains the logic.
17. `docs/dev/modules/make/quality.md` does not say `MakeQuality` is a 20-line route-wrapper over `@/components/shop-floor/QualityTab` (`MakeQuality.tsx:1-20`). The actual Quality UI lives outside `components/make/` — critical for anyone trying to edit it.
18. Permissions coverage for Make is present in `AccessRightsAndPermissions.md` §4.5, but no per-page doc in `docs/dev/modules/make/` calls out which permission key gates which action (for example `qc.record` on `/make/quality`, `scrap.report` on `/make/scrap-analysis`, `settings.access` on `/make/settings`).
19. No migration TODO list. Tasks that obviously need to land: replace `manufacturingOrders`/`workOrders` mock facade with Convex queries; wire `toast('…coming soon')` CTAs to mutations; persist the CAPA kanban status changes. None is enumerated in docs.
20. No testing notes in any Make dev doc — no Vitest/Playwright test file paths cited, no coverage expectations, no manual test steps for the traveller lifecycle.

## Accuracy findings

21. `docs/dev/modules/make/manufacturing-order-detail.md:66-68` "Related Files" references `apps/web/src/components/shop-floor/WorkOrderFullScreen.tsx` — correct path, but the import in source is `'../shop-floor/WorkOrderFullScreen'` (relative — `apps/web/src/components/shop-floor/WorkOrderFullScreen.tsx`). Cite the absolute path for searchability. (`apps/web/src/components/make/MakeManufacturingOrderDetail.tsx:15`)
22. `docs/dev/modules/make/README.md:48` says services are under `apps/web/src/services`. Correct, but wording implies `src/lib/services/` is also a location — there is no `apps/web/src/lib/services/` directory (see P1). Clarify.
23. `docs/dev/modules/make/manufacturing-orders.md` says "Work-order/job execution data, machine context, and production statuses" are shown. Inaccurate — `MakeManufacturingOrders.tsx:108-122` columns are MO number, product, job, customer, status, priority, due, progress, WOs-count, actions. No machine column, no workstation column, no operator column.
24. `docs/dev/modules/make/job-traveler.md` states "Behavior is largely client-side React state and memoized derivations" — true — but misses that the status config mirrors MO statuses from `manufacturingOrders` mock data (`MakeJobTraveler.tsx:34, 88-93`). A change to the MO status vocabulary silently breaks traveller status badges.
25. `docs/dev/modules/make/settings.md` says Primary Actions = "Create or add records/items". Misleading — settings page is permission/group editing and config toggles; there is no "create record" action.
26. `docs/dev/modules/make/schedule.md:50` claims "No explicit store/service/hook dependency imported in this component" — technically correct but obscures that `MakeSchedule.tsx:38-53` hard-codes a 12-item `MOs` array. Should flag the inline mock.
27. `docs/dev/modules/make/README.md:17` cites `/make/shop-floor` — this route is confusingly also the app's in-office view while the kiosk path is `/floor`. README does not disambiguate. Accurate routing, but a reader assumes both are the same screen.

## Consistency findings

28. File naming inconsistency in `/make/*`: `manufacturing-orders` (hyphenated plural), `scrap-analysis`, `job-traveler` (US spelling), but then `job-traveller` appears in `travellerStore` (UK). Source mixes spellings: `MakeJobTraveler.tsx` (US) vs. `travellerStore.ts` / `travellers.filter` (UK). Doc should flag the divergence. (`apps/web/src/store/travellerStore.ts`, `apps/web/src/components/make/MakeJobTraveler.tsx`)
29. Every per-page dev doc uses the "Known Gaps / Questions" heading but the phrasing is near-identical boilerplate. Nine pages repeat "Code includes explicit placeholder/legacy markers; some interactions are transitional." Generic — rewrite per page with real gaps.
30. Some docs cite imports with `@/` alias (e.g. `@/components/shared/ai/AIFeed`), others with absolute-style `apps/web/src/components/ui/badge.tsx`. Pick one convention. (e.g. `docs/dev/modules/make/dashboard.md:30-39`)
31. Tier badges (Pilot, Produce, Expand, Excel) are **absent from every Make dev doc**. Dev readers cannot tell which pages ship in Pilot vs. gated behind Produce or Excel.
32. Role callouts (admin/lead/team) are absent — only the permission-key vocabulary from ARCH 00 §4.5 is implied in `MakeSettings.tsx`. Dev docs should at least echo the ARCH 00 v7 role model.

## Style findings

33. No marketing verbs detected in the dev-side migrated docs — pass on "leverage / seamless / empower / streamline".
34. `docs/dev/modules/make/dashboard.md` uses "Andon Board with machine status grid" in the component file's JSDoc but docs don't mention Andon at all. Dev vocabulary split.
35. Spelling inconsistency: code uses "optimise" in comments and "Touch-optimized" in `MakeDashboard.tsx:3`. Codebase target is UK English per style rubric — flag.
36. `docs/dev/modules/make/shop-floor.md` subtitle in source is "Operators consume released travellers only" (`ShopFloorPage.tsx:55`) — prescriptive tone, fine. But doc does not surface this design rule anywhere. Flag: design rule lives only in UI string.
37. `/make/job-traveler/:id` description "Inspect one record deeply" is filler-phrasing. Replace with action-oriented dev intent ("Render a printable paper traveller with operations checklist, barcode, attachments, QC points").

## Visual findings

38. Screenshot set `docs/audits/screenshots/make/*.png` (1440×900) captured all 11 listed routes. Every PNG is 50–170 KB — no blank pages.
39. `/make/shop-floor` screenshot (170 KB) confirms machine grid + released-traveller queue card render. Not referenced from `docs/dev/modules/make/shop-floor.md`.
40. `/make/capa` screenshot shows kanban columns render but no severity colouring — worth verifying in `MakeCapa.tsx` whether `critical` severity is actually exercised by the mock dataset (`makeService.getCapaRecords()` → `mock.capaRecords` @ `services/mock/data.ts:883`).
41. `/make/job-traveler` screenshot captured the route without an `:id` — it is the `/:id` dynamic route, so the capture shows the 404 "Manufacturing order not found" state at `MakeJobTraveler.tsx` (fallback). Future audits should target `/make/job-traveler/mo-1`.

## Gaps and recommendations

### P0 (blocking)

- **No `.docx` spec** for Make exists in repo (`find . -name '*.docx' -maxdepth 5` returns nothing). Per rubric, this is a P0 blocker — a canonical spec must be authored or imported from Confluence PLAT before further dev doc work is accepted. Recommended location: `docs/specs/make-module.docx` with page-level sections mirroring the 13 routes above.
- **Stale dev docs directly contradict source** (findings 4–6, 9, 23). A single pass to regenerate the `docs/dev/modules/make/*.md` skeletons from current source is required before the next audit cycle.
- **Permission gating not documented per page.** ARCH 00 v7 keys exist (`qc.record`, `scrap.report`, `andon.manage`, `maintenance.manage`, `settings.access`, `reports.access`) but no per-page doc names which UI element each key gates. Blocks any security review. (`apps/web/src/components/make/MakeSettings.tsx:25-35`)

### P1 (should fix before launch)

- **No `apps/web/src/lib/services/` directory exists** — app-wide. The only service module is `apps/web/src/services/makeService.ts`. Rubric requires `src/lib/services/` for production-grade data access abstraction. Either adopt that layout or amend the rubric. For Make specifically, `makeService` is a mock facade (`services/makeService.ts:2-4` — "Replace the mock implementation with a remote adapter when Convex is ready").
- **No React Query integration in `components/make/`.** Ripgrep for `useQuery|useMutation|QueryKey` under `apps/web/src/components/make/` returns zero hits. All data is pulled via `manufacturingOrders`/`capaRecords` imports or `makeService.getX()` promises inside `useEffect`. Spec reference point: document target query-key namespaces (e.g. `['make', 'manufacturingOrders']`) in dev docs before Convex cutover.
- **Mock data mutation never persists.** CAPA drag-drops (`MakeCapa.tsx`), MO creation ("New MO" button → `toast('New manufacturing order form coming soon')` at `MakeManufacturingOrders.tsx:101`), and Quality/Scrap actions emit toasts only. Dev docs should list every TODO CTA.
- **Traveller state model is spread across three stores.** `travellerStore` (travellers), `shopFloorEntryStore` (machines), `floorExecutionStore` (work-order execution state) — their responsibilities overlap and the merge rules aren't documented. Draft an ADR under `docs/dev/modules/make/architecture/` or add a stores section to README.
- **Migration TODO list is missing.** Each page should enumerate what needs to move from mock to Convex and what permission check needs adding.
- **Testing:** no test files referenced. Recommend adding unit tests for `makeService` helpers, Playwright flows for the traveller release → shop-floor → hold path, and snapshot tests for the 4-tab `JobWorkspaceLayout`.

### P2 (nice to have)

- Normalise spelling to `traveller` (UK English) across filenames and symbols; codebase currently mixes `Traveler`/`Traveller`.
- Add inline code snippets to `docs/dev/modules/make/manufacturing-order-detail.md` for the `DEFAULT_TABS` config and `SummaryFilterKey` type.
- Cross-link `docs/dev/modules/make/shop-floor.md` to the `/floor` kiosk module (separate audit) and note the `/make/time-clock → /floor` redirect.
- Add a "Recent code changes" section to each page's dev doc with SHAs — the recent commits `c5e6d45c`, `acab34f9`, `bc6495fc` all touched Make code that still carries stale docs.
- Extract the large `MakeDashboard.tsx` (685 lines) and `MakeManufacturingOrderDetail.tsx` (785 lines) sections into sub-components; doc the current boundaries so a future split is safe.
- Delete the legacy `MakeScanStation.tsx` (279 lines, route is permanently redirected to `/floor`) or move it under `components/make/_legacy/`, and reflect in docs.
- Delete the legacy `MakeTimeClock.tsx` (20 lines, ditto) or mark deprecated in the file header.
