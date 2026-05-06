# Changelog — 2026-05-05

Daily documentation review. Run by the `documentation` scheduled task.

## Summary

**One large feature commit landed in the past 24 hours**, plus a single uncommitted toolbox tweak in the working tree.

`6d0b485c` — **`feat: Xero account mapping, Nesting Studio, dashboard polish`** (Tue 2026-05-05 20:09 +1000) — bundles three independent surfaces into a single push:

1. **Plan → Nesting Studio v2** (`/plan/nesting-studio`, `/plan/nesting-queue`, `/plan/nests`, `/plan/nests/:id`) — replaces the legacy single-part `Sheet Calculator` with a multi-part workspace: DXF upload + parse, two rectangle-pack strategies on a web worker, multi-sheet preview with placement labels, Drafts → Ready-to-schedule → Scheduled → Cutting → Done lifecycle, pick-list and per-sheet DXF export. Old `/plan/nesting` and `/plan/sheet-calculator` redirect to the studio.
2. **Book → Xero Configure Mapping** (`/book/settings/xero/mapping`) — full mapping workspace modelled on the live Xero Accounting API (`Account`, `TaxRate`, `TrackingCategory`, `BrandingTheme`). Six sections (Sales, Purchases, Bank & system, Tax codes, Tracking, Branding), grouped account combobox with inline tax-rate combobox, **Auto-map by name** suggestion dialog, sticky save footer with diff count, status banner, **Pull latest from Xero** action, factory-reset flow.
3. **Dashboard polish** — Book dashboard gains an `AIFeed` strip (was the only main module without one); the Book AIFeed entries are rewritten around invoicing + AR (was generic "margin compression / WIP spike / ageing"); Plan and Ship dashboard titles shortened from "Production Planning" / "Shipments" to "Plan" / "Ship" so the header matches the sidebar; Sidebar Plan section gets three new entries (`Nesting Studio`, `Ready to Nest`, `Nests`) and drops the old `Sheet calculator` link; new breadcrumb labels + sub-item meta entries for the four new nesting routes and the two-level Xero settings path.

Working tree carries one staged-but-uncommitted style change: `apps/web/src/components/plan/product-studio/blockly-v2/toolbox.ts` — `contents: [actionsCategory]` → `contents: actionsCategory.contents` (drops a redundant outer category wrapper around the Actions sub-drawer group). Not yet committed.

## Verification

| Check | Result |
|---|---|
| `git log -1` | `6d0b485c` (2026-05-05 20:09 +1000) — *feat: Xero account mapping, Nesting Studio, dashboard polish* |
| Commits this run (since `2bc727b1`, last commit covered in 05-04 changelog) | **1 commit on `main`** — `6d0b485c` |
| `git log --since="24 hours ago" --all` | 4 commits return, but 3 are pre-2026-05-04 (`4855f14f`, `23a46dfc`, `cb628161` — pnpm/npm lockfile churn from 2026-05-04 already covered in earlier changelogs) |
| Working tree | **dirty** — single hunk in `apps/web/src/components/plan/product-studio/blockly-v2/toolbox.ts` |
| Stash | unchanged |

## Shipped today

### 1. Plan Nesting Studio v2 — `/plan/nesting-*`

The headline change. **34 new files** under `apps/web/src/components/plan/nesting-studio/` and `apps/web/src/lib/nesting/`, plus a fan-out of new entity types and ~15 new `planService` methods.

#### Routes

| Path | Behaviour |
|---|---|
| `/plan/nesting-studio` | Canonical — `PlanNestingStudio`, the multi-part packing workspace |
| `/plan/nesting-queue` | `PlanNestingQueue`, the "Ready to Nest" tray of pending cut demand |
| `/plan/nests` | `PlanNestsList`, lifecycle tabs (Drafts / Ready to schedule / Scheduled / Cutting / Done) |
| `/plan/nests/:id` | `PlanNestDetail`, read-only deep-dive with sheet preview and DXF/CSV export |
| `/plan/nesting` | `<Navigate to="/plan/nesting-studio" replace />` |
| `/plan/sheet-calculator` | `<Navigate to="/plan/nesting-studio" replace />` |
| `/plan/sheet-calculator-legacy` | Kept around for the very-rare single-part lookup |

All routes wired in [`apps/web/src/routes.tsx`](apps/web/src/routes.tsx) (lines 82–85, 364–371).

#### New entity types — [`apps/web/src/types/entities.ts`](apps/web/src/types/entities.ts)

- `DxfAsset` — parsed-once geometry record. One asset can be referenced by a `Product`, a `Quote`, or a `Nest`.
- `SheetStock` — physical stock line (material × thickness × W×H × grade × cost), with `status: SheetStockStatus` (`available` / `reserved` / `consumed` / `on_order`) and an optional `parentSheetStockId` for remnants.
- `MachineNestingConfig` — per-machine + per-material defaults: kerf, pierce time, lead-in/out, default part gap, edge gap, allow-rotation flag.
- `NestingQueueItem` — demand line generated when a WO operation hits a cut workcentre. Carries source MO + WO + part bbox + due-date pressure. Status = `pending` / `placed` / `cancelled` (`NestingQueueStatus`).
- `NestPlacement` — one rectangle on one sheet, with back-links (`sources: { workOrderId, woNumber, qty }[]`) so cost and traceability roll up.
- `NestSheet` — one stock-sheet's worth of placements with yield + scrap area + estimated runtime.
- `NestCostRollup` — material + machine + labour + total in AUD.
- `Nest` — the top-level job: id, `nestNumber`, `status: NestStatus` (`draft` / `ready_to_schedule` / `scheduled` / `cutting` / `done` / `cancelled`), machine, material/grade/thickness, `sheets: NestSheet[]`, cost, `sourceWorkOrderIds: string[]`, `sourceManufacturingOrderIds: string[]`.
- `Machine` extended with structured `capabilities` (kerf, max sheet W/H, hourly rate, control system, supported materials list) — read by both Nesting Studio and Schedule Engine.
- `WorkOrder` extended with `placedOnNestId?: string` — the cut step's "I'm waiting on this nest" pointer.

Three new union types in [`apps/web/src/types/common.ts`](apps/web/src/types/common.ts) (`NestStatus`, `NestingQueueStatus`, `SheetStockStatus`).

#### Service surface — [`apps/web/src/services/planService.ts`](apps/web/src/services/planService.ts)

Sixteen new methods on the `planService` facade (still mock-backed — flips to a real adapter when Convex is ready). Mock state is cloned into module-local arrays on init so hot-reload doesn't reset everything:

```ts
const _nests: Nest[] = mock.nests.map((n) => ({ ...n }));
const _queue: NestingQueueItem[] = mock.nestingQueueItems.map((q) => ({ ...q }));
const _sheetStocks: SheetStock[] = mock.sheetStocks.map((s) => ({ ...s }));
```

| Method | Purpose |
|---|---|
| `getNests()` | All nests across status |
| `getNestById(id)` | One nest by id |
| `saveNest(nest)` | Insert-or-update, reconciles `sourceWorkOrderIds` onto WO `placedOnNestId` |
| `getNestsForManufacturingOrder(moId)` | MO traceability — used by future MO detail panels |
| `getNestCostContributionForMo(moId)` | Material / machine / labour / total cost rolled across linked nests |
| `getNestingQueue()` | All queue items (consumer filters by status) |
| `markQueueItemsPlaced(itemIds, nestId)` | Studio → queue handoff after `Save draft` |
| `releaseQueueItems(itemIds)` | Reverses the above (queue item back to `pending`) |
| `getSheetStocks()` | All stocks |
| `reserveSheetStock(id, qty)` / `releaseSheetStock(id, qty)` | Stock movement when a nest is scheduled / un-scheduled |
| `getMachines()` | Machines for the studio's machine picker (filters to `capabilities !== undefined`) |
| `getMachineNestingConfigs()` | Defaults table |
| `getProductsWithGeometry()` | Library-add picker source |
| `getDxfAssets()` | Existing parsed DXFs |
| `createDxfAsset({fileName, bboxMm, totalCutLengthMm, holeCount, layers})` | Persists a parsed upload |
| `scheduleNest(nestId)` | Reserves stock, transitions `ready_to_schedule` → `scheduled` |
| `unscheduleNest(nestId)` | Reverse |
| `setNestStatus(id, status)` | Manual transitions used by Nests list buttons (`scheduled` → `cutting` → `done`) |

#### Library code — [`apps/web/src/lib/nesting/`](apps/web/src/lib/nesting)

Four pure modules with no React imports:

| File | Purpose |
|---|---|
| [`parseDxf.ts`](apps/web/src/lib/nesting/parseDxf.ts) | Minimal in-house R12 ASCII reader — `LINE` / `LWPOLYLINE` / `POLYLINE` / `ARC` (sampled) / `CIRCLE` (sampled) → `{bboxMm, totalCutLengthMm, holeCount, layers, outerPolygon}`. Skips unknown entities cleanly. Returns the bbox the studio needs and a closed-polygon proxy for future polygon nesting. |
| [`rectanglePacker.ts`](apps/web/src/lib/nesting/rectanglePacker.ts) | Two strategies. **`packRectangles`** — FFDH (First-Fit Decreasing Height) shelf packer; deterministic, ~ms. **`packTight`** — best-of FFDH × BFDH × multiple sort orders. Both emit `PackedSheet[]` with placements + yield. |
| [`nestingWorker.ts`](apps/web/src/lib/nesting/nestingWorker.ts) | Web-worker entry. Vite picks it up via the `?worker` import suffix in `useAsyncPackedNest`. Strategy `'polygon'` falls back to `'tight'` and reports the fallback in the response — call sites stay stable when a real NFP solver is plugged in. |
| [`exportPickList.ts`](apps/web/src/lib/nesting/exportPickList.ts) | `buildPickListCsv(nest)` and `buildSheetDxf(nest, sheetIndex)` — placeholder CAM hand-off. Real post-processor pipeline replaces this. |

Two studio-only hooks live alongside the components:

- [`usePackedNest.ts`](apps/web/src/components/plan/nesting-studio/usePackedNest.ts) — sync packer hook (used by sub-components that don't need worker offloading).
- [`useAsyncPackedNest.ts`](apps/web/src/components/plan/nesting-studio/useAsyncPackedNest.ts) — async wrapper around `nestingWorker` with `pending` / `lastDurationMs` / `fellBackTo` flags.

#### Component tree — `PlanNestingStudio`

```
PlanNestingStudio                       (multi-pane workspace, xl:grid-cols-5)
├── PageHeader                          (Save draft / Confirm nest CTAs)
├── KPI grid (4 tiles)
│   ├── Sheets        (count + "X of Y placed")
│   ├── Avg yield     (% + unplaced count)
│   ├── Runtime       (HH MMm + machine name)
│   └── Cost          (AUD total + material breakdown)
├── Setup pane (xl:col-span-2)
│   ├── Machine + Material + Thickness + Sheet stock selects
│   ├── Pack settings (part gap, edge gap, allow-rotation switch)
│   ├── Strategy segmented control (Fast / Tight / Polygon)
│   └── Parts table
│       ├── AddFromQueueDialog          (pending NestingQueueItems)
│       ├── AddFromLibraryDialog        (Products with geometry)
│       ├── UploadDxfDialog             (drag-drop or browse → parseDxf → createDxfAsset)
│       └── Manual button               (typed-in W×H part)
└── Preview pane (xl:col-span-3)
    └── NestSheetPreview                (SVG, colour-by-part)
```

`useAsyncPackedNest` re-runs whenever `parts`, `sheetStock`, `config`, or `strategy` changes. Selecting a queue item via `?queueItem=…` URL param auto-snaps the machine + material + thickness selectors to the item's spec (so a planner who clicks "Open in Studio" from the queue lands on a pre-filled session).

#### `PlanNestingQueue` (`/plan/nesting-queue`)

The **Ready to Nest** tray. KPIs (`Pending` / `Placed` / `Overdue` / `Due ≤ 3 days`), grouped by `material + thickness`. Each row links to `/plan/nesting-studio?queueItem=<id>`. The studio's `markQueueItemsPlaced` call on Save Draft is what moves an item out of this list into `placed` state.

#### `PlanNestsList` (`/plan/nests`)

Five lifecycle tabs driven by the `NestStatus` union — counts in tab labels, a default tab of `ready_to_schedule` (the planner's tray). Per-status row CTAs:

- `ready_to_schedule` → `Schedule` button → `planService.scheduleNest(id)` (reserves stock, stamps schedule block).
- `scheduled` → `Start cut` → `setNestStatus(id, 'cutting')`.
- `cutting` → `Mark done` → `setNestStatus(id, 'done')` (consumes stock).

`refresh()` after every mutation re-spreads the array reference so React picks up the in-memory mock changes.

#### `PlanNestDetail` (`/plan/nests/:id`)

Read-only operator view. Sheet picker, full SVG preview via `NestSheetPreview`, placements table with WO sources, cost rollup card, and two download buttons (`Download sheet DXF` + `Download pick-list CSV`) wired to `exportPickList.ts`. Status-conditional CTA in the header (Schedule / Start cut / Mark done) shadows the list-page buttons so an operator never has to bounce back.

#### Dependency add — `dxf-parser`

[`apps/web/package.json`](apps/web/package.json) gains `"dxf-parser": "^1.1.2"`. Today it's a future-proofing import — `parseDxf.ts` is hand-rolled and doesn't reach for it yet, but is wired to fall back to `dxf-parser` when an entity outside the in-house reader's scope appears.

### 2. Xero Configure Mapping — `/book/settings/xero/mapping`

Full settings workspace under Book → Settings → Xero Integration → Configure mapping. **18 new files** across `apps/web/src/components/book/xero-mapping/` plus `apps/web/src/types/xero.ts`, `apps/web/src/services/xeroService.ts`, `apps/web/src/services/mock/xero.ts`.

#### Route

`/book/settings/xero/mapping` → `XeroMappingPage`. Reached via the `Configure mapping` button on the **Xero Integration** panel of `/book/settings` (the button used to fire a placeholder toast — now navigates).

#### Type surface — [`apps/web/src/types/xero.ts`](apps/web/src/types/xero.ts)

Mirrors the Xero Accounting API directly so a backend adapter is a thin pass-through. Field casing matches Xero (PascalCase for read entities, camelCase for our own mapping config):

| Type | Notes |
|---|---|
| `XeroAccount` | `AccountID` / `Code` / `Name` / `Type` / `TaxType` / `Class` / `Status` (+ optional `Description` / `EnablePaymentsToAccount` / `ShowInExpenseClaims` / `SystemAccount` / `ReportingCode` / `CurrencyCode`) |
| `XeroAccountType` | 23-member union covering all Xero account types (`BANK`, `CURRENT`, `EXPENSE`, `REVENUE`, …) |
| `XeroSystemAccount` | 13-member union of Xero-managed system accounts (`DEBTORS`, `CREDITORS`, `GST`, `RETAINEDEARNINGS`, …) |
| `XeroTaxRate` | `Name` / `TaxType` / `Status` / `EffectiveRate` (+ apply-to flags) |
| `XeroTrackingCategory` | `TrackingCategoryID` / `Name` / `Status` / `Options[]` |
| `XeroBrandingTheme` | `BrandingThemeID` / `Name` / `SortOrder` / `LogoUrl` |
| `XeroOrganisation` | Header context (`OrganisationID` / `Name` / `BaseCurrency` / `CountryCode` / …) |
| `MappingEntry` | One MW source-key → Xero account pair: `sourceKey` / `sourceLabel` / `xeroAccountCode` / `xeroTaxType?` / `system?` / `required` |
| `TrackingMappingEntry` | One MW source → Xero TrackingCategory pair, with `autoCreateMissingOptions` flag |
| `BrandingDefaults` | `invoiceBrandingThemeId` / `creditNoteBrandingThemeId` / `defaultInvoiceStatus` / `defaultDueDateOffsetDays` / `referenceTemplate` |
| `XeroMappingConfig` | The whole saved doc — `entries[]`, `tracking[]`, `branding`, `updatedAt` |
| `MappingSectionId` | `sales` / `purchases` / `bank-system` / `taxes` / `tracking` / `branding` |
| `SectionStatus` | `total` / `mapped` / `required` / `requiredUnmapped` (drives sidebar dots + footer banner) |

#### Service surface — [`apps/web/src/services/xeroService.ts`](apps/web/src/services/xeroService.ts)

Eleven exports, all mock-backed:

| Function | Purpose |
|---|---|
| `getOrganisation()` | Header context |
| `getAccounts()` / `getTaxRates()` / `getTrackingCategories()` / `getBrandingThemes()` | Combobox option sources |
| `getSyncEntities()` | Status banner on Settings → Xero panel |
| `getMappingConfig()` / `saveMappingConfig(cfg)` | The mapping doc round-trip |
| `pullLatest()` | Refreshes accounts / tax rates / tracking / themes from the (mock) Xero source. Returns counts. |
| `suggestAccountMappings(unmapped, accounts)` → `AutoMapSuggestion[]` | Name-matching auto-map; consumer is `AutoMapDialog` |

Mock seed in [`apps/web/src/services/mock/xero.ts`](apps/web/src/services/mock/xero.ts): a complete plausible chart of accounts + 8 tax rates + 2 tracking categories + 2 branding themes + a partially-mapped `mockXeroMappingConfig` so the page has realistic state on first paint.

#### Component tree — `XeroMappingPage`

```
XeroMappingPage                         (page-level container)
├── PageHeader                          (org name + currency badge + "Pull latest from Xero")
├── Status banner Card                  (Progress bar + mapped/total + "Auto-map by name" + "Reset all" + …)
├── Two-column layout (256px sidebar + content)
│   ├── MappingSidebar                  (six section nav items, status dot per section)
│   └── Section content (one of):
│       ├── SalesSection                (sales.* entries → MappingRow with AccountCombobox + TaxRateCombobox)
│       ├── PurchasesSection            (purchases.* entries)
│       ├── BankSystemSection           (bank.* + system.* entries)
│       ├── TaxesSection                (tax.* entries — TaxRateCombobox only)
│       ├── TrackingSection             (TrackingMappingEntry rows + auto-create-missing-options switch)
│       └── BrandingSection             (5 default fields: invoice theme, credit-note theme, default status, due-date offset, reference template)
├── AutoMapDialog                       (review + accept name-matched suggestions)
└── MappingFooter                       (sticky — diff count + Discard / Save)
```

`MappingRow` is the workhorse — one row per `MappingEntry`, with a grouped `AccountCombobox` (groups by Xero account `Class`: ASSET / LIABILITY / EQUITY / REVENUE / EXPENSE), an inline `TaxRateCombobox`, and a "system" badge for Xero-managed accounts (`DEBTORS`, `CREDITORS`, `GST`, …) which are read-only.

The `diffCount` derivation re-computes on every keystroke from `savedConfig` vs `draftConfig` and drives both the sticky footer's "Save changes (N)" CTA and the section-status colours in the sidebar. **Discard** snaps `draftConfig` back to `savedConfig` (in-memory only — survives until reload). **Reset all** snaps `draftConfig` to the original mock factory defaults.

#### Disconnected fallback

The page checks for an `organisation` value after load — if missing, it renders a centred **"Xero is not connected"** card with a yellow "Back to Xero Integration" CTA pointing at `/book/settings`. In this mock build, presence of `mockXeroOrganisation` makes that fallback unreachable; a real backend would surface a `connected: boolean` flag here.

### 3. Dashboard polish

Five small but visible changes:

- **Book dashboard** ([`apps/web/src/components/book/BookDashboard.tsx`](apps/web/src/components/book/BookDashboard.tsx)) — adds an `AIFeed module="book"` strip above the quick-nav bento. Book was the only main module without one.
- **Book AIFeed entries** ([`apps/web/src/components/shared/ai/AIFeed.tsx`](apps/web/src/components/shared/ai/AIFeed.tsx) lines ~213–260) — three entries rewritten around invoicing + AR (`3 invoices ready to send` / `$18.5K across 3 overdue invoices` / a third entry on Xero sync). Old entries were generic "margin compression / WIP spike / ageing" copy that didn't suggest action. The yellow MW tag is preserved on `Invoicing`; AR risk uses the error-toned tag. Lucide icon `Receipt` added to the imports.
- **Plan dashboard** title `Production Planning` → `Plan` (matches sidebar).
- **Ship dashboard** title `Shipments` → `Ship` (same reason).
- **Sidebar Plan section** ([`apps/web/src/components/Sidebar.tsx`](apps/web/src/components/Sidebar.tsx) lines 203–215) — adds `Nesting Studio`, `Ready to Nest`, `Nests` under the *Engineering* heading; removes `Sheet calculator` from *Planning tools*. The legacy `Nesting` link is replaced by `Nesting Studio`; nothing is orphaned because both `/plan/nesting` and `/plan/sheet-calculator` redirect.
- **Breadcrumb labels** ([`apps/web/src/lib/navigation/breadcrumbs.ts`](apps/web/src/lib/navigation/breadcrumbs.ts)) — three new `/plan/nesting-*` entries plus a two-level `/book/settings/xero` + `/book/settings/xero/mapping` pair.
- **Sub-item meta** ([`apps/web/src/lib/sub-item-meta.ts`](apps/web/src/lib/sub-item-meta.ts)) — three new `/plan/nesting-*` icons + descriptions; `Sheet calculator` description re-tagged as *legacy*.
- **Book Settings → Xero panel** ([`apps/web/src/components/book/BookSettings.tsx`](apps/web/src/components/book/BookSettings.tsx)) — `Configure mapping` button stops firing a toast and now `navigate('/book/settings/xero/mapping')`.

## Working-tree state

`apps/web/src/components/plan/product-studio/blockly-v2/toolbox.ts` carries one un-committed hunk:

```diff
-        contents: [actionsCategory],
+        contents: actionsCategory.contents,
```

Drops the redundant outer category wrapper around the Actions sub-drawer group inside `buildStudioV2Toolbox`. Probably a Blockly toolbox-rendering tidy-up that didn't make it into the commit. **Flagged but not auto-fixed** — leaving for the author.

## Doc deltas (this run)

| Doc | Change |
|---|---|
| `docs/audits/CHANGELOG-2026-05-05.md` | **NEW** — this file |
| `docs/dev/modules/plan/nesting-studio.md` | **NEW** — comprehensive dev doc covering all 4 routes |
| `docs/user/modules/plan/nesting-studio.md` | **NEW** — user guide for the studio |
| `docs/dev/modules/plan/nesting.md` | Updated to point at the new docs + document the `/plan/nesting` redirect |
| `docs/user/modules/plan/nesting.md` | Same — now a redirect note pointing at `nesting-studio.md` |
| `docs/dev/modules/book/xero-mapping.md` | **NEW** — dev doc for the configure-mapping page |
| `docs/user/modules/book/xero-mapping.md` | **NEW** — user guide |
| `docs/dev/modules/plan/README.md` | Index updated — adds Nesting Studio / Ready to Nest / Nests / Nest Detail |
| `docs/user/modules/plan/README.md` | Same |
| `docs/dev/modules/book/README.md` | Adds `/book/settings/xero/mapping` row + xero-mapping.md link |
| `docs/user/modules/book/README.md` | Adds Configure Mapping route |
| `docs/README.md` | Indexes the four new pages |
| `docs/audits/screenshots/plan/plan-nesting-studio-2026-05-05.png` | **NEW** — Studio in empty state (1440×1100) |
| `docs/audits/screenshots/plan/plan-nesting-studio-populated-2026-05-05.png` | **NEW** — Studio loaded via `?queueItem=nq-001` (KPIs populated, sheet preview rendering) |
| `docs/audits/screenshots/plan/plan-nesting-queue-2026-05-05.png` | **NEW** — Ready-to-Nest queue with 5 pending items grouped by material |
| `docs/audits/screenshots/plan/plan-nests-2026-05-05.png` | **NEW** — Nests list with 5-tab lifecycle |
| `docs/audits/screenshots/book/book-xero-mapping-2026-05-05.png` | **NEW** — Configure Mapping, Sales section |

Screenshots captured against the running dev server (port 5173) on 2026-05-05 via headless Chrome (`--virtual-time-budget=8000`).
