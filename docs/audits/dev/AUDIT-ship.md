# Ship — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding. A markdown extract lives at `apps/web/src/guidelines/specs/Ship-04-Screen-by-Screen.md`, which references a `MirrorWorksModuleSpec.pdf` that is itself absent from the repo and is not a `.docx` canonical.
  - Code: `apps/web/src/components/ship/`
  - Routes: `apps/web/src/routes.tsx` — `/ship/*` (lines 105–116, 361–376)
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` (Ship at §4.6; permission keys in `ShipSettings.tsx`)
  - Services: `apps/web/src/services/shipService.ts` + `apps/web/src/services/mock/data.ts`
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-ship.md`

## Completeness findings

- The 11 dev stubs at `docs/dev/modules/ship/*.md` are empty placeholders. No dev-specific content (component hierarchy, state shape, events, query keys, permission gates) has been migrated across.
- `docs/user/modules/ship/README.md` lists 11 sub-pages but its "Core Entities Used" and "Data Dependencies" sections are generic placeholders ("Entity shapes are defined by routed pages…") with no concrete type names.
- No docs describe `ShipBillOfLading.tsx` even though it is consumed by `ShipOrders.tsx` (opened from the order detail sheet, lines 231–246). It has its own `shipService.getBillOfLading()` call and `BillOfLading` contract — currently undocumented.
- `docs/user/modules/ship/dashboard.md` lists `AIFeed` but does not mention `ModuleDashboard`, `ModuleQuickNav`, `Recharts BarChart`, or the six KPI fields sourced from `shipKpis` (`activeShipments`, `pendingOrders`, `onTimeRate`, `avgTransit`, `exceptions`, `returns`).
- `docs/user/modules/ship/orders.md` omits the Kanban/list toggle state, the `KANBAN_ITEM_TYPE = 'ship-order'` drag type, the `STAGES` enum (`Pick | Pack | Ship | Transit | Delivered`), and the `ShipBillOfLading` dialog integration.
- `docs/user/modules/ship/packaging.md` does not describe the `ScanInput` ref flash API (`scanRef.current?.flash('ok' | 'err')`), the static `ITEMS` and `PACKAGES` arrays, or the "Pack Station 1" / "Matt Quigley" hard-coded operator metadata visible in the header.
- `docs/user/modules/ship/shipping.md` does not document the three tabs (`carriers | rates | manifests`), the `SHIP_COUNTS` fixed-length array that maps positionally to `centralCarriers`, or the "Agent pick" AI highlight on the StarTrack Premium rate.
- `docs/user/modules/ship/tracking.md` does not mention the `statusConfig` record keyed by `shipped | transit | delivering | delivered | exception`, the `TimelineView` integration, or the "Exceptions only" filter toggle (`exceptionsOnly` state).
- `docs/user/modules/ship/warehouse.md` does not call out the three tabs (`map | inventory | count`), the hard-coded `ZONES` SVG layout data, the four inventory statuses (`ok | low | empty | reserved`), or the `CYCLE` variance logic.
- `docs/user/modules/ship/returns.md` does not describe the six-stage `RStatus` lifecycle (`pending → approved → in_transit → received → refunded → closed`) used for the timeline or the conditional "Approve return" / "Process refund" CTA logic tied to status.
- `docs/user/modules/ship/scan-to-ship.md` is stale relative to commit `bc6495fc` (barcode scanning). It does not document the `EXPECTED_ITEMS` fixture, the `scannedItems` state machine, the "already scanned" de-duplication toast, or the `allMatched` → "Generate Packing List" gating.
- `docs/user/modules/ship/carrier-rates.md` does not describe the `shipService.getCarrierRates()` call, the `CarrierRate` entity shape, or the `sortField: 'priceAud' | 'estimatedDays'` sort state.
- `docs/user/modules/ship/reports.md` does not list the six chart datasets (`shipVolume`, `onTime`, `carrierCost`, `statusDist`, `destData`, `returnRate`), the `ReferenceLine y={95}` SLA marker, or the "This Week" / "Export" toolbar actions.
- `docs/user/modules/ship/settings.md` does not document the `shipPermissionKeys` array (7 keys) nor the `shipDefaultGroups` fixture (`Warehouse`, `Shipping`, `Customer Service`) — both central to the ARCH 00 §4.6 integration that the file itself references in code comments.

## Accuracy findings

- `docs/user/modules/ship/README.md` lists `apps/web/src/components/ship/ShipScanToShip.tsx` and the other 10 components but omits `ShipBillOfLading.tsx`, which is imported and mounted by `ShipOrders.tsx`.
- `docs/user/modules/ship/README.md` "Data Dependencies" says "Stores/services used by this module live mainly under `apps/web/src/store` and `apps/web/src/services`." No Ship store exists under `apps/web/src/store/` (verified by `ls` of the store directory — there is no `shipStore.ts` or similar); the claim is misleading.
- `docs/user/modules/ship/dashboard.md` claims "No explicit store/service/hook dependency imported in this component." Inaccurate — `ShipDashboard.tsx` line 27 imports `shipKpis, shipPipeline, carriers, shippingExceptions` from `@/services`.
- `docs/user/modules/ship/carrier-rates.md` claims "No explicit store/service/hook dependency imported in this component." Inaccurate — `ShipCarrierRates.tsx` line 9 imports `shipService` from `@/services` and calls `shipService.getCarrierRates()` on mount.
- `docs/user/modules/ship/scan-to-ship.md` Components Used section lists `@/components/shared/barcode/ScanInput` but does not note it is shared with `ShipPackaging.tsx`.
- `docs/user/modules/ship/shipping.md` says "Shipment/fulfilment lifecycle data including carrier and return states" under Data Shown. The code shows carrier performance, rate comparison, and manifests — there is no return state on this page (returns live at `/ship/returns`).
- `docs/user/modules/ship/orders.md` "Data Shown" says "Order headers, statuses, due dates, quantities, and values." The code exposes `customer, items, weight, carrier, due, stage, progress, urgent` — no "values" field is rendered. Progress percentage and urgent flag are omitted from the doc.
- `docs/user/modules/ship/settings.md` does not mention the three-panel layout (`General`, `Carriers`, `Reports`) nor the fourth implicit "Access & Permissions" tab supplied by `ModuleSettingsLayout`. The header comment in `ShipSettings.tsx` claims four panels but the `settingsPanels` array in the same file defines only three.
- `ShipTracking.tsx` imports `useMemo` (line 5) but never uses it — not a doc bug, but a dead import to flag in the stub.
- Route slug `/ship/scan-to-ship` in spec, doc, and code uses hyphens; `/ship/carrier-rates` likewise. No drift, but worth recording in dev stubs because other modules mix kebab and camel.

## Consistency findings

- Docs style across the 11 files is inconsistent with the Sell module audit template: they include a generic `## States` list (`default | error | success | blocked | populated`) that bears no relation to states any component actually exposes. The sidebar audit for Sell dropped this pattern; Ship docs still carry it.
- `docs/user/modules/ship/README.md` Related Modules lists "Sell, Make, Book" but not Buy — yet `ShipOrders.tsx` treats orders produced upstream of Make and the `ShipSettings.tsx` Carriers panel configures carriers that Buy-side PO receipts use. Relationship set should be explicit.
- Mock data is duplicated between `apps/web/src/services/mock/data.ts` (used by dashboard) and inline constants in `ShipOrders`, `ShipPackaging`, `ShipShipping`, `ShipTracking`, `ShipReturns`, `ShipWarehouse`, `ShipScanToShip`. Dev stubs must record both sources or readers will assume `shipService` is the only path.
- `ShipShipping.tsx` derives its CARRIERS list by stringly mapping `centralCarriers` names (`'Aus Post' → 'Australia Post'`, `'Toll' → 'Toll/IPEC'`, etc., lines 20–29) and appends a hard-coded `Aramex` row. This inconsistency (central contract vs. page-local naming and extension) is undocumented.
- `ShipSettings.tsx` header comment (line 3) lists four panels ("General, Carriers, Reports, Access & Permissions") but the `settingsPanels` array (lines 279–283) defines three. `ModuleSettingsLayout` injects the fourth — dev docs must say so.
- Permission keys in `ShipSettings.tsx` use `scope` and `boolean` types but `permissions` on groups store booleans as the literal strings `'true'` / `'false'`. Dev stubs should capture this string-backed-boolean convention.

## Style findings

- Not applicable to dev audit (see user audit for UK English, Oxford comma, and marketing-verb checks). All Ship dev docs currently contain no marketing-verb violations because the content is formulaic stubs. Confirmed no banned terms (Supabase, Convex, WorkOS, Resend, React, Zustand, Con-form Group) in dev stubs after migration — but the company name "Con-form Group" appears in mock data (`ShipOrders.tsx` line 38, `ShipReturns.tsx` line 50, `ShipPackaging.tsx` line 79). That's code-level and out of this audit's scope.

## Visual findings

- Screenshots captured at 1440×900 and saved to `docs/audits/screenshots/ship/`:
  - `ship.png` (/ship)
  - `orders.png`
  - `packaging.png`
  - `shipping.png`
  - `tracking.png`
  - `returns.png`
  - `warehouse.png`
  - `reports.png`
  - `carrier-rates.png`
  - `scan-to-ship.png`
  - `settings.png`
- All 11 PNGs exceeded 10 KB, confirming pages rendered meaningful content rather than an empty shell.
- None of the existing docs reference screenshots. Dev stubs must embed or link to the captured images.

## Gaps and recommendations

### P0 (blocking)

1. **No canonical `.docx` spec for Ship in the repo.** `apps/web/src/guidelines/specs/Ship-04-Screen-by-Screen.md` is a PDF-extract markdown file that itself references `MirrorWorksModuleSpec.pdf` which is absent. Dev docs cannot be certified against a canonical source until the `.docx` (or PDF) is checked in or a path of record is defined.
2. **Dev stubs are empty.** All 11 files at `docs/dev/modules/ship/*.md` only contain `TODO` comments — there is no commit-ready developer documentation for the Ship module.
3. **`ShipBillOfLading.tsx` is completely undocumented** in both user and dev trees and is a user-facing document generator wired into the Order detail flow.

### P1 (should fix before launch)

4. **No `src/lib/services/` layer exists** — `apps/web/src/services/` is the actual services directory. Dev docs should standardise on this path (flag: ship docs currently say "services" generically with no path).
5. **Tier badges absent.** None of the 11 user docs flag which Ship features belong to Pilot / Produce / Expand / Excel. Ship is the largest feature set in the product; tier gating must be surfaced.
6. **Role copy in ship docs does not use the admin / lead / team vocabulary.** Permission groups in code use domain names (`Warehouse`, `Shipping`, `Customer Service`) which are fine for groups, but no doc shows the mapping from these groups back to the three roles.
7. **ARCH 00 §4.6 permission gates are not enforced in route loaders.** `routes.tsx` mounts every `/ship/*` page without checking `permissionKeys`. Dev docs should record this as a migration TODO.
8. **Mock/seed data lives inline in 7 of 11 Ship components** (orders, packaging, shipping, tracking, returns, warehouse, scan-to-ship). Dev stubs must document this and point at the mock-to-service migration target.
9. **Dashboard uses `Date.now()` for "h ago" / "d ago"** (`ShipDashboard.tsx` lines 48–50). Tests will go non-deterministic. Document as migration TODO.
10. **`useMemo` imported but unused** in `ShipTracking.tsx`. Minor, but record in dev stub.
11. **`ShipScanToShip` out of sync** with commit `bc6495fc` intent. Docs describe the page as mock-seeded only; the code now has a full match/unmatch/generate-packing-list flow that should be the primary documented behaviour.
12. **No React Query keys.** Ship calls `shipService.*().then(setState)` in `useEffect` without any caching layer. Dev docs must record this as a migration TODO toward React Query.
13. **No store layer.** No Zustand store exists for Ship; all state is component-local `useState`. This is a deliberate migration point for Convex — document it.
14. **Testing gap.** No tests referenced for any Ship component. Dev docs should list a minimal harness target (Kanban drag reducer in `ShipOrders`, scan match logic in `ShipPackaging` / `ShipScanToShip`, sort logic in `ShipCarrierRates`).

### P2 (nice to have)

15. **Carrier brand swatch colours** in `ShipSettings.tsx` lines 159–163 are marketing-coloured (info, error, amber, yellow, neutral). Document the intent: these are brand-logo approximations, not design-system semantic tokens.
16. **Duplicate `Aramex` row** appended in `ShipShipping.tsx` line 28. Flag as data-source hygiene.
17. **`ShipOrders.tsx` BOL dialog uses inline `bolOpen` state** rather than driving from the sheet. Dev doc could suggest hoisting.
18. **Pie chart colours** in `ShipReports.tsx` derive from `MW_CHART_COLOURS` — docs should note that the ordering is data-index driven and not stable if `statusDist` ordering changes.
19. **Warehouse map uses inline SVG with hard-coded zone coordinates.** Document as a known limitation (no editor, no persistence).
20. **Shipping manifest "Generate manifest" CTA** resolves to `toast.success('Shipping manifest generated')` only; no persistence path. Document as incomplete.
21. **Dev stubs should cross-reference the captured screenshots** under `docs/audits/screenshots/ship/` so a reviewer can sanity-check the copy against the rendered page.
22. **Stack note missing.** None of the ship dev stubs record that the stack is React 18 + TS 5.7 + Vite 6.3 + Tailwind v4 + ShadCN + Framer Motion v12 + Zustand + Recharts (Convex/WorkOS/Resend target, Supabase current). A single module-level header pulled into each stub would solve this.
23. **`Con-form Group` string** appears in at least three mock data sets (`ShipOrders`, `ShipReturns`, `ShipPackaging`). Dev docs should flag the banned-brand occurrence for fixture cleanup.
