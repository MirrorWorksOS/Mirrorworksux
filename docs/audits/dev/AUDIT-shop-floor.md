# Shop-Floor — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding
  - Code: `apps/web/src/components/shop-floor/`, `apps/web/src/components/floor/`
  - Routes: `apps/web/src/routes.tsx` — `/floor/*` and `/make/shop-floor`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-shop-floor.md`

Shop-Floor is the one tenant module whose canonical surface renders outside the office chrome. `/floor/*` is a top-level sibling of `/` (`apps/web/src/routes.tsx:206-212`) that uses `FloorModeLayout` rather than `Layout` — no sidebar, no AgentFAB, no command palette, no Sell upgrade banner. The user is on a tablet at a workstation, not at a desk. That context must shape every doc in this module.

## Completeness findings

1. **Spec `.docx` is absent.** No `SHOP-FLOOR-*.docx` or equivalent `Shop-Floor-*-Screen-by-Screen.md` under `apps/web/src/guidelines/specs/`. The two docs we have (`floor-home.md`, `floor-run.md`) are one-page summaries auto-generated from component scans. (**P0** — rubric: "No `.docx` spec → P0".)
2. **No "shop-floor" or "floor" module doc index.** `docs/modules/` has no `shop-floor/` folder; the two files lived under `docs/modules/platform/` alongside unrelated surfaces (bridge-wizard, notifications). Now migrated to `docs/user/modules/shop-floor/` and stubbed at `docs/dev/modules/shop-floor/` (see migration log).
3. **Second component tree undocumented.** `apps/web/src/components/shop-floor/` exists alongside `apps/web/src/components/floor/` and contains `WorkOrderFullScreen.tsx`, `OverviewTab.tsx`, `WorkTab.tsx`, `QualityTab.tsx`, `IssuesTab.tsx`, `TimeClockTab.tsx`, `DefectReportModal.tsx`, `MaterialsModal.tsx`, `CadFileModal.tsx`, `IntelligenceHubTab.tsx`, `VoiceInterfaceMobile.tsx`, `imports/`, `issues/`. Neither migrated doc references any of these — only `WorkOrderFullScreen` is mentioned (in `floor-run.md`). (**P1**.)
4. **`FloorExecutionScreen` and its sub-components are unmentioned.** `apps/web/src/components/floor/execution/` contains `ActionConsole.tsx`, `CurrentStepCard.tsx`, `ExceptionSheet.tsx`, `ExecutionHeader.tsx`, `HandoverSheet.tsx`, `InspectionSheet.tsx`, `ReferenceWorkspace.tsx` plus `snapshot.ts` and `types.ts`. `floor-run.md` lists `@/components/floor/execution/snapshot` and `@/components/floor/execution/types` without context. (**P1**.)
5. **Third store missed.** `floor-home.md` lists `floorExecutionStore` and `floorSessionStore` but not `apps/web/src/store/shopFloorEntryStore.ts`, which backs the `/make/shop-floor` machine grid. Any dev reading the migrated doc will not know this store exists. (**P1**.)
6. **`/make/shop-floor` is not documented at all.** The existing doc pair only covers `/floor` and `/floor/run/:workOrderId`. `/make/shop-floor` (the in-tenant operator view with the machine grid and in-place overlay) has no user or dev doc. (**P0** — full surface missing.)
7. **`MakeShopFloor → ShopFloorPage` chain undocumented.** `apps/web/src/components/make/MakeShopFloor.tsx` is a single-line wrapper around `apps/web/src/components/make/shop-floor/ShopFloorPage.tsx` (which imports `MachineGrid`, `WorkOrderFullScreen`, `useShopFloorEntryStore`, `useFloorExecutionStore`, `useTravellerStore`). None of this is reflected in either doc. (**P1**.)
8. **Barcode scanning integration is lost.** Shared scanner components live at `apps/web/src/components/shared/barcode/ScanInput.tsx` and `apps/web/src/components/shared/barcode/BarcodeScanner.tsx` with a hook at `apps/web/src/hooks/useBarcodeScan.ts`. `FloorScanJob.tsx` uses `ScanInput` directly, `CommandPalette` also registers it globally, and a recent commit (`bc6495fc feat: integrate barcode scanning functionality`) hasn't made it into either doc. (**P0** — rubric: "Barcode scanning was recently integrated. Flag doc lag.")
9. **Services path in rubric points to nowhere.** The rubric says "No `src/lib/services/` → P1 in dev". That directory does not exist — Shop-Floor calls `makeService` from `apps/web/src/services/` (`apps/web/src/services/makeService.ts`) and a mock under `apps/web/src/services/mock/data.ts`. The existing docs do not reference either. (**P1**.)
10. **No mock-shape documentation.** Both docs say "No explicit mock marker in this file" as a canned line. In reality Shop-Floor is entirely mock-driven — `apps/web/src/services/mock/data.ts` defines `workOrders`, `manufacturingOrders`, and machines with IDs `wo-002`/`WO-2026-0002` etc. which the scan screen references as demo hints. Mock shapes, seed IDs, and the "tenant IDs are `wo-NNN` but display uses `WO-YYYY-NNNN`" dual-identity gotcha should all be dev-doc material. (**P1**.)
11. **React Query keys unmentioned.** No mention of query keys, staleTime, or refetch behaviour. Most loads in `FloorHome`, `FloorRun`, and `FloorScanJob` use raw `useEffect` + `makeService.get*` promises; that ad-hoc pattern is load-bearing for offline-tolerance discussions and should be called out. (**P2**.)
12. **Event flows missing.** No sequence for clock-in → station → scan → run → switch-operator → resume. `floorSessionStore.ts` has clear JSDoc for this lifecycle but it is not reflected in docs. (**P1**.)
13. **Permissions (ARCH 00 v7) not addressed.** `packages/contracts/src/access.ts` has no `shop_floor` / `floor.*` scope keys, and `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` does not list `/floor` at all. Shop-Floor is implicitly "anyone on the tablet" which contradicts the ARCH 00 three-role model (admin, lead, team). (**P1**.)
14. **No migration TODOs / Supabase → Convex plan.** The backend swap is the dominant cross-module concern and Shop-Floor is arguably the most offline-sensitive surface. Docs are silent. (**P1**.)
15. **Testing posture undocumented.** No Vitest / Playwright / manual tablet checklist for either route. Given the tablet + barcode + offline context this is a real omission. (**P1**.)
16. **`FloorModeLayout` (no-chrome sibling) never explained.** Route comment at `apps/web/src/routes.tsx:196-204` spells out why the layout is a sibling; dev docs should restate that for anyone adding a new floor route. (**P2**.)
17. **Legacy redirects unclear in docs.** `/make/time-clock → /floor`, `/make/scan → /floor` (`apps/web/src/routes.tsx:347,351`) are live redirects with in-code commentary about why `MakeTimeClock`/`MakeScanStation` were retired. Dev docs should reference these so no-one re-wires them. (**P2**.)

## Accuracy findings

18. **`floor-run.md` "Components Used" list is partial.** It cites `@/components/floor/execution/snapshot`, `…/types`, `@/components/shop-floor/WorkOrderFullScreen`, `@/components/ui/button`. Actual `FloorRun.tsx` also imports `AlertCircle` / `ArrowLeft` lucide icons and the `FloorExecutionScreen` via `WorkOrderFullScreen`. More importantly it omits `makeService` and both Zustand stores from the same file. (**P1**.)
19. **`floor-home.md` misses the main screen component.** The doc lists `FloorClockIn`, `FloorStationPicker`, `FloorScanJob` as Components Used but forgets the wrapper itself, `FloorHome.tsx`, which owns the state-machine logic described under "Logic / Behaviour". (**P2**.)
20. **"Route" section misses `?station=` URL param.** `FloorHome.tsx:58-87` handles `?station=<machineId>` to pre-hydrate session state for permanently-bolted tablets. Not mentioned in `floor-home.md`. (**P1**.)
21. **"States" list is canned and wrong for `floor-home.md`.** The file lists `default / error / mobile-responsive differences / populated` — the actual states are `hydrating`, `auto-resuming`, `needs-operator`, `needs-station`, `ready-to-scan`. (**P1**.)
22. **Dependencies path typo.** Both docs write `@/store/floorExecutionStore` and `@/store/floorSessionStore` without `.ts` extension and without the actual named exports (`useFloorExecutionStore`, `useFloorSession`). Minor but misleading for grep-driven onboarding. (**P2**.)
23. **Demo IDs outdated.** Doc does not reference `WO-2026-0002` / `MO-2026-0001` seed IDs even though `FloorScanJob.tsx:13` and lines 137-139 promote them as the on-screen demo travellers. Any new dev will not know what to scan. (**P1**.)

## Consistency findings

24. **Two component trees, one module, no naming convention.** `components/floor/*` for route-owned screens, `components/shop-floor/*` for execution-surface components shared between `/floor/run` and `/make/shop-floor`. Docs should either flatten or explicitly state the split convention. (**P2**.)
25. **Docs lived under `platform/` despite being a tenant module.** `/floor` is gated to shop-floor operators, not platform staff — `platform/` already contains `AdminLayout` / `AdminTiers` surfaces which are genuinely MirrorWorks-staff-only. Co-location was wrong. Fixed in this audit by migration. (**P1**, resolved.)
26. **Tier not stated.** Rubric expects Pilot/Produce/Expand/Excel tier badges on every surface. Shop-Floor is almost certainly **Produce+** (operator execution is core to Produce) but neither doc carries a tier. (**P1**.)
27. **Role group not stated.** Shop-Floor operators belong in the `team` group per `project_access_role_vocab` (admin, lead, team — never Manager/Supervisor/Operator). The clock-in screen roster shows roles like "CNC Operator / Machinist", "Welder / Boilermaker", "Quality Inspector" which are job-title metadata, not access roles — docs should disambiguate. (**P1**.)
28. **Colour token usage is inconsistent across code.** `FloorRun.tsx` and `FloorScanJob.tsx` use raw CSS variables (`var(--neutral-100)`, `var(--mw-yellow-400)`) rather than Tailwind tokens — fine, but not documented as the Shop-Floor convention. (**P2**.)

## Style findings

29. **"Behavior" is US spelling.** Both docs use "Behavior" repeatedly; rubric mandates UK English / Oxford comma. (**P2**.)
30. **"Operator-first kiosk surface with reduced office chrome"** is acceptable but "office chrome" reads like dev jargon. Dev doc is fine; user doc needs a rewrite (see user audit). (**P2**.)
31. **Marketing verbs scan clean.** No leverage / seamless / robust / empower / streamline / unlock / unleash in either doc. Keep it that way. (**P2**.)

## Visual findings

Screenshots captured at 1024×768 (tablet) and 1440×900 (desktop) under `docs/audits/screenshots/shop-floor/`.

32. **`/floor` (tablet 1024×768, tablet 1440×900):** Clean "Step 1 of 2 — Who's clocking in?" with three operator tiles (David Lee, James Murray, Anh Nguyen). Layout is roomy and tap-friendly. Nothing to flag. The absence of any nav chrome confirms `FloorModeLayout` working correctly — this should be shown in user docs.
33. **`/floor/run/wo-002` (tablet 1024×768):** Renders `FloorExecutionScreen` with `MO-202…` truncated header, `WO-2026-0002 · Record first-off inspection`, a large "Acknowledge revision" yellow CTA, and the Current Step card showing "3 of 5 · 2 completed". Touch targets look 44px+. Yellow CTA uses MW yellow with **dark text** (compliant with memory: "Yellow bg = dark text"). (**P2** visual: header MO number is clipped to `MO-202…` at 1024×768 — consider a smaller responsive variant or allow wrap.)
34. **`/make/shop-floor` (tablet 1024×768 AND desktop 1440×900):** Renders an **Unhandled Application Error: Maximum update depth exceeded** stack trace from `checkForNestedUpdates` / `scheduleUpdateOnFiber` / `commitHookEffectListMount`. This is a render loop inside `ShopFloorPage` or a component it mounts. Root cause likely an effect whose deps include a reference that is re-created on each render (`moById` / `workOrders` derivation). (**P0 — blocking**: the canonical in-tenant shop-floor page does not render.)
35. **Screenshot metadata missing from docs.** Neither migrated doc embeds or links to captures. User doc in particular needs at least one screenshot per surface. (**P1**.)

## Gaps and recommendations

### P0 (blocking)

- **P0.1** Write or obtain a Shop-Floor spec (`SHOP-FLOOR-Screen-by-Screen.md` under `apps/web/src/guidelines/specs/`). Cover clock-in, station pick, scan, run, switch-operator, handover, exceptions/defects. (finding #1)
- **P0.2** Create `docs/user/modules/shop-floor/make-shop-floor.md` and `docs/dev/modules/shop-floor/make-shop-floor.md` covering `/make/shop-floor` and the `ShopFloorPage` + `MachineGrid` entry flow. (finding #6)
- **P0.3** Fix the `/make/shop-floor` render loop. Screenshot evidence in `docs/audits/screenshots/shop-floor/make-shop-floor-*.png`. Start with `apps/web/src/components/make/shop-floor/ShopFloorPage.tsx` — likely an effect dependency that is re-created every render (the `releasedQueue = useTravellerStore((s) => s.travellers.filter(…))` selector will return a fresh array on every render, which is a common cause). (finding #34)
- **P0.4** Update docs to cover the barcode scanning integration (commit `bc6495fc`). Mention `ScanInput`, `BarcodeScanner`, `useBarcodeScan`, case-insensitive matcher, WO vs MO fallback. (finding #8)

### P1 (should fix before launch)

- **P1.1** Document the second component tree (`components/shop-floor/*`) and the execution sub-components (`components/floor/execution/*`). (findings #3, #4)
- **P1.2** Add `shopFloorEntryStore` to the dependencies list wherever stores are listed. (finding #5)
- **P1.3** Add permissions rows for `floor.clock_in`, `floor.run_work_order`, `floor.switch_operator`, `shop_floor.view` in `packages/contracts/src/access.ts` and `AccessRightsAndPermissions.md`. Map to role `team` by default. (finding #13)
- **P1.4** Tier badge `Produce+` on both Shop-Floor docs. (finding #26)
- **P1.5** Replace canned "States" list with real kiosk state-machine states on `floor-home.md`. (finding #21)
- **P1.6** Document `?station=<machineId>` URL param and its purpose (permanently-bolted tablet). (finding #20)
- **P1.7** Add a mock-data section: seed IDs `wo-002` / `WO-2026-0002`, `mo-001` / `MO-2026-0001`, and the `workOrders` / `manufacturingOrders` / `machines` shapes in `apps/web/src/services/mock/data.ts`. (finding #10)
- **P1.8** Add event-flow diagram or numbered sequence for clock-in → station → scan → run → switch/handover → resume. (finding #12)
- **P1.9** Migration TODO: Supabase → Convex mapping for `makeService` calls used by the floor (`getWorkOrderById`, `getManufacturingOrderById`, `getMachineById`, `getPendingWorkOrdersForStation`). Flag offline-first requirement explicitly. (finding #14)
- **P1.10** Testing section: tablet manual checklist (1024×768 and 1280×800), barcode wedge keyboard, orientation, gloves-on tap target audit. (finding #15)
- **P1.11** Rename/move `docs/modules/platform/{floor-home,floor-run}.md` (done in this audit) and ensure no internal links still point to the old paths. (finding #25)
- **P1.12** Fix `floor-run.md` components list to include stores, services, icons it omits. (finding #18)
- **P1.13** Mention `WO-2026-0002` / `MO-2026-0001` as the canonical demo IDs in user doc. (finding #23)
- **P1.14** Embed tablet screenshots (1024×768) on the user doc; link desktop versions. (finding #35)
- **P1.15** Clarify that job-title metadata ("CNC Operator / Machinist", etc.) is not an access role — the access group is `team`. (finding #27)

### P2 (nice to have)

- **P2.1** Note the two-tree convention (`floor/` routes; `shop-floor/` shared surfaces). (finding #24)
- **P2.2** Fix "Behavior" spelling to "Behaviour". (finding #29)
- **P2.3** Note CSS-variable-first token usage convention. (finding #28)
- **P2.4** Mention `FloorModeLayout` top-level sibling routing rationale. (finding #16)
- **P2.5** Mention `/make/time-clock → /floor` and `/make/scan → /floor` redirects and the dead `MakeTimeClock` / `MakeScanStation` files. (finding #17)
- **P2.6** Allow MO number to wrap (or use smaller type) at 1024×768 in `ExecutionHeader`. (finding #33)
- **P2.7** Add `.ts` extension and named exports to store path citations. (finding #22)

## Notes on tablet readability

Per the Shop-Floor-specific critical flags:

- Kiosk routes (`/floor`, `/floor/run/:workOrderId`) render without sidebar / chrome and use large-tap UI. This must be reflected in the user doc's setup section.
- The tablet 1024×768 captures show acceptable touch targets except for the MO number header clip noted above.
- `/make/shop-floor` currently crashes at both viewports — the in-tenant operator view is unusable on any screen until P0.3 is fixed.
