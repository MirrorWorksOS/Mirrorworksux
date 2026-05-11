# Changelog — 2026-05-06

Daily documentation review. Run by the `documentation` scheduled task at 2026-05-07 07:48 +1000.

## Summary

Five commits landed in the past 24 hours — one tiny tooling fix, one small Plan dialog fix, two large feature commits across Buy / Ship / Plan / Book / Control, and one prior-day docs commit (`1303f72e`, already covered in `CHANGELOG-2026-05-05.md`).

Headline themes:

- **AI agent surfaces multiply.** `MirrorWorksAgentCard` now appears on **Buy → Supplier Detail (Overview)**, **Buy → Reports**, and **Buy → Vendor Comparison** — each driven by priority-ordered rules over live supplier metrics.
- **Editable line items on requisitions.** `/buy/requisitions/:id` flips to an inline editor when the requisition is `draft` or new — product picker, qty, est. cost, running total.
- **Animated profit donut.** `/book/job-costs/:id` hero donut now sweeps in over 1.4s with a count-up label.
- **Scan-to-Ship dispatch flow.** `/ship/scan-to-ship` now opens a packing-list preview dialog with carton math and a *Confirm dispatch* action that resets the cart.
- **Cleanup.** Machine form drops connection fields (those config concerns belong on Bridge), and demo data renames `Con-form Group → Meridian Fabrication` everywhere.

One **commit / route discrepancy** to flag: `5be42c81`'s message advertises "/plan/schedule overview" and adds `apps/web/src/components/plan/PlanSchedule.tsx`, but `routes.tsx` is unchanged — `/plan/schedule` still redirects to `/plan/schedule-engine`. The new component is sitting unwired in the tree (verified via `grep -rn "PlanSchedule[^E]"`).

## Commits this run

| SHA | Time (UTC+10) | Title |
|---|---|---|
| `b90f7004` | 09:05 | `fix(product-studio): collapse double-nested Actions toolbox category` |
| `027527dc` | 11:17 | `feat(buy,ship): supplier AI agent, expanded reports, scan-to-ship dispatch modal` |
| `2ddf1f7a` | 20:35 | `fix(plan/schedule): make Optimisation priority selectable in auto-schedule dialog` |
| `5be42c81` | 21:42 | `feat(plan,book,buy,ship,control): plan/schedule overview, animated profit donut, requisition line editor, vendor comparison filters & AI agent, ship tracking actions, machine form cleanup` |
| `1303f72e` | 21:44 | `docs: 2026-05-05 audit — Nesting Studio / Ready to Nest / Nests / Nest Detail, Xero account mapping` *(already covered in CHANGELOG-2026-05-05)* |

## Verification

| Check | Result |
|---|---|
| `git log -1` | `1303f72e` (2026-05-06 21:44 +1000) — *docs: 2026-05-05 audit …* |
| Commits in window (since 2026-05-06 00:00) | **5 commits on `main`** |
| Working tree | clean at run start |
| Stash | unchanged |
| Dev server | started on port 5173 (Vite re-optimised deps for ~120s due to lockfile change) |
| Headless screenshot capture | **Run 1 (2026-05-07 07:48): failed** — `#root` stayed empty in the preview tab despite vite returning 200; React bundle did not boot. **Run 2 (2026-05-08 07:36): captured retroactively** — see "Screenshots (Run 2)" below. |

## Shipped today

### 1. Buy supplier detail — MirrorWorks Agent card

`027527dc` adds a `MirrorWorksAgentCard` at the top of the **Overview** tab on `/buy/suppliers/:id`. Tone (`risk` / `opportunity` / `neutral` / `success`) is selected from a single `useMemo` that runs four guards in priority order, plus a default success state:

| Order | Guard | Tone | Headline |
|---|---|---|---|
| 1 | `onTimePercent < 80` OR `rating <= 3` | `risk` | Performance risk — consider a backup supplier |
| 2 | At least one bill in `overdue` | `opportunity` | Pay overdue bills to protect supplier terms |
| 3 | `onTimePercent >= 95` AND `rating >= 4` AND `totalSpend > 10000` | `opportunity` | Negotiate volume discount or extended terms |
| 4 | At least one PO not `received` | `neutral` | N open PO(s) with this supplier |
| (default) | — | `success` | No actions required |

`isNew` short-circuits to `null` (the create flow doesn't render a card). Detail blocks (when present) drive `evidenceLevel = 'expandable'`.

### 2. Buy reports — full rebuild

`027527dc` rewrites `/buy/reports` from two charts into a 11-block dashboard:

- 5 KPIs (Total Spend, Active Suppliers, Open PO Value, Avg On-Time, Overdue Bills) — derived live from `purchaseOrders`, `suppliers`, `bills`.
- AI insight card (hard-coded copy today, flagging Hunter Steel concentration in Sheet & Plate).
- Spend by Supplier donut (live; chart-scale colours by spend %).
- Monthly Spend Trend bar.
- Spend by Category horizontal bar.
- Lead Time line with target reference line.
- PO Status pie.
- Supplier Performance scatter (`onTime × rating`, Z-axis spend).
- Payables Ageing bar.
- Top Suppliers ranked card list (top 5 of `spendBySupplier`).

Static seeds remain for category mix, monthly spend, lead-time trend, ageing, and PO-status — these will become live when the rollup endpoint lands. New chart-theme imports: `MW_AXIS_TICK`, `MW_CHART_COLOURS`, `MW_BAR_RADIUS_H`, `getChartScalePattern`.

### 3. Buy vendor comparison — product filter, agent, and Draft RFQ dialog

`5be42c81` adds three things to `/buy/vendor-comparison`:

- **Product / Part dropdown** — six options (`all` plus 5 categories). Selecting any non-`all` value reshapes vendor metrics through `applyProductFilter()`, which uses `seededFactor(vendorId, productId, …)` to deterministically derive lead time, on-time, quality, spend, and price-history points per (vendor × product) pair. Demo shim — replaced by `getVendorComparison({ productId })` server-side.
- **MirrorWorks Agent insight card** — runs only when `selectedVendors.length >= 2`, with priority-ordered guards:
  1. **Concentration risk** when one vendor ≥ 50% of compared spend (`risk` tone, suggests 70/30 split with the best alternate on-time).
  2. **Price gap** when cheapest is ≥ 8% under priciest **and** ≥ 90% on-time **and** ≥ 4/5 quality (`opportunity` tone, with annual savings estimate).
  3. **Reliability gap** when on-time spread ≥ 5pp (`risk` tone).
  4. **Quality leader** (`success`, default).
- **`DraftRfqDialog.tsx`** — new file (250 lines). Line editor (product / qty / supplier, with `'all'` routing to every selected vendor). Reset on open. Send fires a toast — production wires to the backend RFQ creator. Lines are scoped to a hard-coded `PURCHASED_MATERIALS` list (steel/aluminium/stainless/cold-rolled/galvanised/welding-wire/hardware-kit/powder-coat).

### 4. Buy requisitions — editable line items

`5be42c81` makes `/buy/requisitions/:id` line items editable when `isNew || req.status === 'draft'`. The MwDataTable read-only render is preserved for submitted requisitions; editable mode renders a CSS-grid of `<Select>` (product) + `<Input>` (qty) + `<Input>` (est. cost) + computed total + remove (trash). New imports: `Input`, `Select`, `RequisitionItem` type. Save validation now blocks save when `items.length === 0` on a new requisition.

### 5. Book job-cost detail — animated profit donut

`5be42c81` extracts the donut into `<ProfitMarginDonut percent={...} />` and animates two things over a 1.4s `expo-out` curve:

- Stroke `dashOffset` from `CIRCUMFERENCE` → `CIRCUMFERENCE * (1 - target)`.
- Centre label count-up from `0.0%` → `percent` (using `useMotionValue` + `setShown` mirror).

Stroke uses a linear gradient `var(--mw-yellow-400) → var(--mw-yellow-600, var(--chart-scale-high))`. Wrapper `<motion.div>` does a `0.92 → 1.0` scale fade-in on mount.

`percent` is hard-coded `23.1` for now (matches the rest of JOB-2026-0012's hard-coded values).

### 6. Book job profitability — row click → detail

`5be42c81` adds `handleRowClick` on `JobProfitability`:

```tsx
const navigate = useNavigate();
const handleRowClick = (row: JobRow) => {
  if (onSelectJob) { onSelectJob(row.id); return; }
  navigate(`/book/job-costs/${row.id}`);
};
```

`FinancialTable` gains an `onRowClick?: (row, index) => void` prop, passed straight through to `MwDataTable`. The `onSelectJob` prop is the embed-mode override; standalone use navigates.

### 7. Ship scan-to-ship — packing list dispatch dialog

`027527dc` does three things to `/ship/scan-to-ship`:

- Adds `unitWeightKg` to `EXPECTED_ITEMS` and to `ScannedItem`.
- Seeds `DEMO_SCANNED` (3 matched + 1 `MISC-9921` unmatched) so the page lands populated. Pre-existing init was `[]`.
- Replaces the toast-only **Generate Packing List** with a `<Dialog>` that shows shipment header + 3-up carton/weight summary + line items + (when applicable) an unmatched-scan warning row. **Confirm dispatch** runs a 600ms timeout, then resets `scannedItems` to `[]` and toasts the dispatch.

`cartonCount = max(1, ceil(totalUnits / 30))` — the *30 items per carton* rule is the only rule of thumb in the file.

### 8. Ship tracking — action wiring

`5be42c81` wires up the side-sheet **Notify customer** and **Carrier portal** buttons. Both still toast-only:

```tsx
<button onClick={() =>
  toast.success(`Tracking update sent to ${selected.customer}`,
    { description: `${selected.tracking} · ${cfg?.label} · ETA ${selected.eta}` })
}>Notify customer</button>

<button onClick={() => toast(`Opening ${selected.carrier} carrier portal…`)}>
  Carrier portal
</button>
```

`// TODO(backend): shipments.notifyCustomer(...)` marker stays in place.

### 9. Plan / schedule — auto-schedule dialog Optimisation priority is selectable

`2ddf1f7a` is a tiny but breaking-bug fix on `AutoScheduleDialog`. `SelectItem` wraps children in Radix's `ItemText` (a `<span>`), so the existing `<div><p/><p/></div>` body produced invalid HTML. Browsers auto-closed the wrapping span before the div, breaking each option as a click target. The fix replaces nested divs/p with nested spans + flex layout — preserves the label + hint stack and restores selection.

### 10. Plan / schedule — new (unwired) `PlanSchedule.tsx`

`5be42c81` adds [`apps/web/src/components/plan/PlanSchedule.tsx`](../../apps/web/src/components/plan/PlanSchedule.tsx) (~152 lines): a standalone cross-job schedule overview with a Gantt + Calendar wrapper, status filter pills (All Jobs / Active / Scheduled / Completed), and an embedded `<PlanScheduleEngine />` under a "Finite capacity engine" heading at the bottom.

> ⚠️ **Not wired.** `routes.tsx` still resolves `/plan/schedule` → `<Navigate to="/plan/schedule-engine" replace />`. `PlanSchedule` is not imported anywhere. Either the route flip is staged for a follow-up commit or the message is misleading. `docs/dev/modules/plan/schedule.md` flags this.

### 11. Control machines — drop unused connection fields

`5be42c81` removes the **Connection** section from `MachineFormDialog.tsx` — six fields (`connectionProtocol`, `connectionHost`, `connectionPort`, `connectionEndpoint`, `connectionMac`), three helpers (`defaultPortForProtocol`, `endpointHint`, `endpointPlaceholder`), and the exported `MachineConnectionProtocol` / `MachineEditInput` types. Reason: live OEE/telemetry config belongs on the **Mirrorworks Bridge** page, not on the machine record. Existing rows with a `connection: { … }` block keep their data; the form just doesn't read or write that field anymore.

### 12. Demo data — `Con-form Group` → `Meridian Fabrication`

`5be42c81` renames every demo-mode reference to `Con-form Group` to `Meridian Fabrication`:

- `apps/web/src/services/mock/data.ts` (shipping exception customer name)
- `apps/web/src/components/WelcomeDashboard.tsx` (×2 — back insight + exception drawer)
- `apps/web/src/components/book/InvoiceDetail.tsx` (Bill To + email recipient)
- `apps/web/src/components/book/InvoiceList.tsx` (INV-2026-0045 customer)
- `apps/web/src/components/book/JobCostDetail.tsx` (subtitle)
- `apps/web/src/components/book/JobProfitability.tsx` (scatter datum + JOB-2026-0012 row)
- `apps/web/src/components/sell/SellNewQuote.tsx` (CUSTOMERS list)
- `apps/web/src/components/shared/ai/AiCommandBar.tsx` (Ship MOCK_REPLY)
- `apps/web/src/components/ship/ShipOrders.tsx`, `ShipPackaging.tsx`, `ShipReturns.tsx`, `ShipTracking.tsx` (one row each)

Reason isn't called out in the commit message; likely a brand-cleanup decision around demo storytelling. **Real data is unaffected** — Con-form Group remains the user's actual organisation; the rename is in fixture customer data only.

### 13. Product Studio toolbox — `b90f7004`

`b90f7004` (09:05) is a one-line tweak in `apps/web/src/components/plan/product-studio/blockly-v2/toolbox.ts`:

```diff
-        contents: [actionsCategory],
+        contents: actionsCategory.contents,
```

Drops the redundant outer category wrapper around the Actions sub-drawer group inside `buildStudioV2Toolbox`. Visual result: the **Actions** category in the Studio v2 toolbox no longer renders as a double-nested folder. This was the working-tree hunk flagged as un-committed in `CHANGELOG-2026-05-05.md` — now committed.

## Doc deltas (this run)

| Doc | Change |
|---|---|
| `docs/audits/CHANGELOG-2026-05-06.md` | **NEW** — this file |
| `docs/dev/modules/buy/supplier-detail.md` | Replaced stub with substantive dev doc covering agent rule precedence, service deps, migration status |
| `docs/dev/modules/buy/reports.md` | Replaced stub with full layout + chart-theme + service notes |
| `docs/dev/modules/buy/vendor-comparison.md` | Replaced stub — product filter, applyProductFilter shim, agent rules, DraftRfqDialog |
| `docs/dev/modules/buy/requisition-detail.md` | Replaced stub — edit gating, line state, save validation |
| `docs/dev/modules/ship/scan-to-ship.md` | Replaced stub — DEMO_SCANNED, dialog, dispatch flow, carton math |
| `docs/dev/modules/ship/tracking.md` | Replaced stub — side-sheet action wiring |
| `docs/dev/modules/plan/schedule.md` | Updated — flagged unwired `PlanSchedule.tsx` |
| `docs/dev/modules/book/job-cost-detail.md` | Updated — `<ProfitMarginDonut>` extraction + animation timing |
| `docs/dev/modules/book/job-costs.md` | Updated — row click navigation + `FinancialTable.onRowClick` |
| `docs/dev/modules/control/machines.md` | Updated — removed-fields summary on `MachineFormDialog` |
| `docs/user/modules/buy/supplier-detail.md` | Replaced stub — agent card user guide |
| `docs/user/modules/buy/reports.md` | Replaced stub — full surface walkthrough |
| `docs/user/modules/buy/vendor-comparison.md` | Replaced stub — product filter + agent + RFQ |
| `docs/user/modules/buy/requisition-detail.md` | Replaced stub — line editor walkthrough |
| `docs/user/modules/ship/scan-to-ship.md` | Replaced stub — packing-list dialog flow |
| `docs/user/modules/ship/tracking.md` | Replaced stub — side-sheet action notes |
| `docs/user/modules/book/job-cost-detail.md` | Replaced stub — animated donut callout |
| `docs/user/modules/book/job-costs.md` | Replaced stub — row click |
| `docs/user/modules/control/machines.md` | Updated — connection fields moved to Bridge |

## Screenshots (Run 2 — 2026-05-08 07:36)

Captured headless via `Google Chrome --headless=new --virtual-time-budget=8000 --window-size=1440,900` against the same dev server. Files dated `2026-05-06` to match the change date, not the capture date.

| Screen | File | Notes |
|---|---|---|
| Buy → Reports | `screenshots/buy/buy-reports-2026-05-06.png` | Agent card, 5 KPIs, Spend by Supplier donut, Monthly Spend Trend bar |
| Buy → Supplier Detail (Hunter Steel Co) | `screenshots/buy/buy-supplier-detail-2026-05-06.png` | Captured during agent-card fade-in — `MirrorWorksAgentCard` and KPI tiles visible mid-animation |
| Buy → Vendor Comparison | `screenshots/buy/buy-vendor-comparison-2026-05-06.png` | Product/Part dropdown, supplier multi-pill, KPIs, agent card hits **concentration risk** rule (51% Hunter Steel Co), Draft RFQ button |
| Buy → New Requisition | `screenshots/buy/buy-requisition-new-2026-05-06.png` | Overview tab only — Line Items tab not exercised in headless capture; the in-tab editor is a follow-up TODO |
| Ship → Scan to Ship | `screenshots/ship/ship-scan-to-ship-2026-05-06.png` | `DEMO_SCANNED` populated (3 matched + 1 `MISC-9921` unmatched), Generate Packing List button visible |
| Ship → Tracking | `screenshots/ship/ship-tracking-2026-05-06.png` | SP-001 customer reads "Meridian Fabrication" (demo-data rename verified) |
| Book → Job Cost Detail (JOB-2026-0012) | `screenshots/book/book-job-cost-detail-2026-05-06.png` | Profit donut captured mid-animation at 16.1% (target 23.1%); subtitle reads "Meridian Fabrication" |
| Control → Machines | `screenshots/control/control-machines-form-2026-05-06.png` | Form-dialog change not exercised (dialog closed); list view captured for context |
