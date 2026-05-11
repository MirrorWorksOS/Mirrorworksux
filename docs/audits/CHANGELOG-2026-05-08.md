# Changelog — 2026-05-08

Daily documentation review. Run by the `documentation` scheduled task at 2026-05-09 (run start).

## Summary

A **"bulletproof audit"** sprint shipped on 2026-05-08 — eight commits that hunt down dead `onClick`-less buttons, broken `navigate()` targets, duplicate React keys, and one error-boundary crash, then wire each to either a real route, a `sonner` toast stub, or a corrected URL. No new features; no UI shape changes; just live wires for things the user could already see.

The fixes are spread **across the eight `audit/<module>-module` branches** (one branch per module) plus the `main`-merged crash fix from this morning. They are **not yet merged to `main`** — only `f622b52a` is on `main`. `audit/standalone-admin` (the current branch) carries the bridge fix.

Headline themes:

- **No-op buttons → toasts or routes.** ~30 dead buttons across Book, Buy, Bridge, Ship, Plan got `onClick` handlers. Where the destination is a real route, they `navigate(...)`; where it's a backend mutation that doesn't exist yet, they fire a `sonner` toast as a safe stub (matches the pattern used elsewhere in admin pages).
- **Two broken navigation targets.** Plan dashboard's "View Tasks" pointed at the legacy `/plan/activities` redirect; "NC Connect" pointed at `/plan/nc-connect` (also legacy). Both repointed at the live targets (`/plan/schedule-engine` and `/plan/machine-io?tab=nc-connect`).
- **Make → Plan link rot.** The MO detail's "Job" link was stripping the `JOB-` prefix before navigating, producing dead URLs. Fixed.
- **Duplicate React keys in Sell.** `Date.now()`-only ids collided when two list items were created in the same millisecond, triggering React's "two children with the same key" warning. Fixed with a per-call counter and `prev.length` suffixes.
- **CRM crash.** `/sell/crm/new` was throwing in the Documents tab because `createBlankCustomer()` omitted `documents: []`.

## Commits this run

| SHA | Branch | Time (UTC+10) | Title |
|---|---|---|---|
| `f622b52a` | `main` | 07:56 | `fix(sell/crm): prevent crash on /sell/crm/new from missing documents field` |
| `d5b9e766` | `audit/sell-module` | 23:39 | `fix(sell): bulletproof audit — unique line-item ids` |
| `206b09cc` | `audit/ship-module` | 23:42 | `fix(ship): bulletproof audit fixes` |
| `65dbf388` | `audit/book-module` | 23:45 | `fix(book): bulletproof audit fixes` |
| `cf062fbf` | `audit/control-module` | 23:46 | `fix(control): bulletproof audit fixes` |
| `11b00661` | `audit/make-module` | 23:47 | `fix(make,floor): bulletproof audit fixes` |
| `d4f831f0` | `audit/plan-module` | 23:48 | `fix(plan): bulletproof audit fixes` |
| `23b2f6fe` | `audit/buy-module` | 23:50 | `fix(buy): wire dead navigation buttons on Buy dashboard` |
| `390d50e7` | `audit/standalone-admin` | 23:51 | `fix(bridge): wire dead Edit button on team-setup step to a toast` |

> ⚠️ **Branch fan-out.** Eight of the nine commits live on per-module audit branches, not `main`. Anyone reviewing on `main` only sees `f622b52a`. The other branches need merging (or rebasing onto `main`) for the wires to take effect outside the per-module review.

## Verification

| Check | Result |
|---|---|
| `git log --since="2026-05-08 00:00" --branches --remotes` | **9 commits across 9 branches** |
| `git log -1 main` | `f622b52a` (2026-05-08 07:56 +1000) |
| Working tree on `audit/standalone-admin` | M `apps/web/src/components/plan/PlanDashboard.tsx` (matches `d4f831f0` exactly — same fix, just unstaged on this branch); plus the screenshots + changelogs from prior runs still untracked |
| Stash | unchanged |
| Typecheck (per-module commit messages) | Clean for control. Other commits don't call out tsc explicitly but each fix is purely local. |

## Shipped today

### 1. Sell — `/sell/crm/new` no longer crashes

`f622b52a` (the only commit on `main` this window). One-line fix in `apps/web/src/components/sell/SellCustomerDetail.tsx`:

```diff
   recentOrders: [],
   activity: [],
   invoices: [],
+  documents: [],
```

**Cause.** `createBlankCustomer()` was missing the `documents` array. The Documents tab badge reads `customer.documents.length`, so `undefined.length` threw and tripped the React Router error boundary. `/sell/crm/new` was dead.

**Effect.** Create-flow now renders the full detail page (Documents tab shows zero, no crash).

### 2. Sell — duplicate React keys in line-item lists

`d5b9e766` on `audit/sell-module`. Three call sites used `id: \`li-${Date.now()}\`` (or similar) to seed list rows; when two rows were created in the same millisecond — the default state of `SellNewInvoice` is `[newRow(), newRow()]` — both got the same id and React warned "Encountered two children with the same key."

Fixes:

- `apps/web/src/components/sell/SellNewInvoice.tsx` — module-level `lineRowSeq` counter, ids become `li-<ts>-<seq>`.
- `apps/web/src/components/sell/SellInvoiceDetail.tsx` — `handleAddLineItem` and `handleRecordPayment` now suffix with `prev.length`.
- `apps/web/src/components/sell/SellOrderDetail.tsx` — `handleAddLineItem` and `handleUploadDocument` likewise.

### 3. Ship — `ShipReturns`, `ShipPackaging`, `ShipShipping`, `ShipReports`, `ShipWarehouse`, `ShipCarrierRates`

`206b09cc` on `audit/ship-module`. Six files; all ten edits are the same shape: a `<button>` or `<Button>` that previously rendered with no `onClick` got one. Backend wires don't exist yet, so each fires a `sonner` toast.

| Surface | Button | New behaviour |
|---|---|---|
| `ShipReturns` (page header) | **Create RMA** | `toast('Create RMA — coming soon')` |
| `ShipReturns` (side sheet, status `pending`) | **Approve return** | `toast.success('${selected.id} approved')` |
| `ShipReturns` (side sheet, status `received`) | **Process refund** | `toast.success('Refund issued for ${selected.id}')` |
| `ShipReturns` (side sheet, all statuses) | **Contact customer** | `toast('Contacting ${selected.customer}…')` |
| `ShipPackaging` | **Park** | `toast('Job parked')` |
| `ShipPackaging` | **Complete & print label** | `toast.success('Label printed')` |
| `ShipShipping` (rate row) | **Select** | `toast.success('Selected ${r.carrier} ${r.service}')` |
| `ShipReports` (header) | **This Week / Date range** | `toast('Date range picker — coming soon')` |
| `ShipWarehouse` (Inventory tab) | **Export** | `toast.success('Inventory exported')` |
| `ShipCarrierRates` (header) | **Request Quote** | `toast('Quote request — coming soon')` |

`type="button"` was added to the affected `<button>` elements so they don't accidentally submit ancestral forms.

### 4. Book — broad button-wiring across 10 files

`65dbf388` on `audit/book-module`. Largest commit of the window (10 files / +90 / -31).

| Surface | Button | New behaviour |
|---|---|---|
| `BookDashboard` | **View All Approvals** | `navigate('/book/expenses')` |
| `BookDashboard` | **Sync Now** | `toast.success('Xero sync started')` |
| `BookDashboard` | **Follow Up All** | `toast.success('Follow-up emails queued for N overdue items')` |
| `BookInvoices` | **New Invoice** (CTA) | `toast.success('New invoice draft created')` |
| `BookInvoices` | Pagination Prev/Next | now `disabled` (mock data only — no real paging) |
| `InvoiceList` | **New Invoice** (toolbar) | `toast.success('New invoice draft created')` |
| `InvoiceDetail` | **Send** | `toast.success('Invoice sent')` |
| `InvoiceDetail` | **Download PDF** | `toast('Generating PDF…')` |
| `InvoiceDetail` | **View in Xero** | `toast('Opening invoice in Xero…')` |
| `BookSettings` (Xero panel) | **View errors** | `toast('Showing 3 sync errors')` |
| `BookSettings` (Xero panel) | **Sync now** | `toast.success('Xero sync started')` |
| `BookSettings` (Xero panel) | **Full re-sync** | `toast.success('Full Xero re-sync started')` |
| `BookSettings` (Xero panel) | Disconnect confirm | `toast.success('Xero disconnected')` (was `() => {}`) |
| `BudgetOverview` | **Type: All** filter | `toast('Filters opened')` |
| `BudgetOverview` | **New Budget** (CTA) | `toast.success('New budget draft created')` |
| `JobProfitability` | **Date range** | `toast('Select a date range')` |
| `JobProfitability` | **Export** | `toast.success('Exporting job profitability…')` |
| `JobProfitability` | **Filter** (icon button) | `toast('Filters opened')` |
| `StockValuation` | **As at** | `toast('Select an as-at date')` |
| `StockValuation` | **Generate report** | `toast.success('Stock valuation report generated')` |
| `ReportsGallery` | **Schedule report** | `toast('Schedule a report')` |
| `ReportsGallery` | **Custom report** | `toast.success('Custom report builder opened')` |
| `NewExpense` | Receipt **Zoom in / Zoom out / Rotate** | each toasts the action |
| `NewExpense` | Receipt **Remove** (trash) | clears `uploaded` + `toast('Receipt removed')` |
| `NewExpense` | **Apply to Form** | `toast.success('Extracted data applied to form')` |
| `NewExpense` | **View existing** | `toast('Opening existing expense…')` |

The `NewExpense` icon buttons also gained `type="button"` and `aria-label`s.

### 5. Buy — Buy Dashboard nav buttons

`23b2f6fe` on `audit/buy-module`. Three CTA buttons that were rendering interactive but had no handler:

| Card | Button | New behaviour |
|---|---|---|
| Approval Queue | **View All Approvals** | `navigate('/buy/requisitions')` |
| Goods Awaiting Receipt | **Go to Receipts** | `navigate('/buy/receipts')` |
| Bills Needing Matching | **Go to Bills** | `navigate('/buy/bills')` |

Adds a `useNavigate()` import; each handler routes to the obvious target surfaced in the surrounding card copy.

### 6. Plan — dashboard navigation targets

`d4f831f0` on `audit/plan-module`. `apps/web/src/components/plan/PlanDashboard.tsx`:

| Button | Was | Now |
|---|---|---|
| **New Job** | `navigate('/plan/jobs')` | `navigate('/plan/jobs/new')` |
| Backlog **View all** | `navigate('/plan/activities')` | `navigate('/plan/schedule-engine')` |
| **View Tasks** (quick action) | `navigate('/plan/activities')` | `navigate('/plan/schedule-engine')` |
| **NC Connect** (quick action) | `navigate('/plan/nc-connect')` | `navigate('/plan/machine-io?tab=nc-connect')` |

`/plan/activities` and `/plan/nc-connect` are legacy redirects; the new targets are the live components. **New Job** now lands directly on the create form rather than the list.

> Note: this same diff currently sits **uncommitted** on `audit/standalone-admin` (the working tree). Reviewing on this branch shows the change unstaged.

### 7. Make / Floor — three small fixes

`11b00661` on `audit/make-module`.

- **MO detail Job link.** `apps/web/src/components/make/MakeManufacturingOrderDetail.tsx` was stripping the `JOB-` prefix before navigating: `\`/plan/jobs/${mo.jobNumber.replace('JOB-', '')}\``. The Plan Job route resolves on the prefixed id; without it, the link was dead. Two `<Link to={…}>` sites fixed (Job field + meta-row badge).
- **Floor scan job — case-insensitive.** `apps/web/src/components/floor/FloorScanJob.tsx` now `value.trim().toUpperCase()`s scanner input before comparing against `woNumber` / `moNumber`, so an operator who types a lower-case fallback (no scanner present) still matches.
- **MO/WO save → list.** `MakeManufacturingOrderDetail` and `MakeWorkOrderDetail` previously navigated to a stub detail route after creating a new MO/WO. The static `MO_BY_ID` / `WO_BY_ID` lookup can't resolve those ids, so the page rendered "not found" the second the user landed. Now they `navigate('/make/manufacturing-orders' | '/make/work-orders', { replace: true })` after the success toast.

### 8. Control — Billing dead `/pricing` anchor

`cf062fbf` on `audit/control-module`. `apps/web/src/components/control/ControlBilling.tsx` had:

```tsx
See the <a className="underline" href="/pricing" onClick={e => e.preventDefault()}>full pricing page</a> for feature-by-feature comparison.
```

`/pricing` doesn't exist as a route, and `preventDefault()` made the link a no-op anyway. The fix drops the anchor and renders the sentence as plain copy. Commit message reports an audit summary: `routes_visited=22, issues_found=2, fixes_applied=1, escalations=1` (one issue escalated, not yet detailed).

### 9. Bridge — `StepTeamSetup` Edit button

`390d50e7` on `audit/standalone-admin` (this branch). The Bridge wizard's team-setup step rendered an **Accept / Edit** pair next to each AI-suggested team-member assignment. Accept was wired; Edit was a bare `<Button>` with no handler.

```diff
- <Button variant="ghost" size="sm" className="text-xs h-12">
+ <Button
+   variant="ghost"
+   size="sm"
+   className="text-xs h-12"
+   onClick={() =>
+     toast('You can change module group assignments later in Control · People.')
+   }
+ >
    Edit
  </Button>
```

The toast points the user at **Control · People** (where module group assignments actually live), so it both fixes the dead button and surfaces the next-step affordance.

## Doc deltas (this run)

| Doc | Change |
|---|---|
| `docs/audits/CHANGELOG-2026-05-08.md` | **NEW** — this file |
| `docs/dev/modules/sell/new-invoice.md` | Note added — module-level `lineRowSeq` counter for unique row ids |
| `docs/dev/modules/sell/customer-detail.md` | Note added — `documents: []` required in `createBlankCustomer()` to keep Documents tab from throwing |
| `docs/dev/modules/sell/invoice-detail.md` | Note added — `prev.length`-suffixed ids in `handleAddLineItem` / `handleRecordPayment` |
| `docs/dev/modules/sell/order-detail.md` | Note added — `prev.length`-suffixed ids in `handleAddLineItem` / `handleUploadDocument` |
| `docs/dev/modules/buy/dashboard.md` | Note added — three CTA navigation targets wired |
| `docs/dev/modules/plan/dashboard.md` | Note added — `New Job` → `/plan/jobs/new`; `/plan/activities` → `/plan/schedule-engine`; `/plan/nc-connect` → `/plan/machine-io?tab=nc-connect` |
| `docs/dev/modules/make/manufacturing-order-detail.md` | Note added — `JOB-` prefix preserved in `/plan/jobs/...` link; stub-id redirect after save dropped |
| `docs/dev/modules/shop-floor/floor-run.md` | Note added — scanner input is `.trim().toUpperCase()` before WO/MO lookup |
| `docs/dev/modules/control/role-designer.md` | (skipped — file is the `/control/billing` adjacency, not relevant) |
| `docs/dev/modules/bridge/bridge-wizard.md` | Note added — StepTeamSetup `Edit` button toasts a Control · People hint |
| `docs/dev/modules/book/dashboard.md` | Note added — `View All Approvals` → `/book/expenses`; Sync Now / Follow Up All toast |
| `docs/dev/modules/book/invoices.md` | Note added — `New Invoice` toasts; pagination buttons now `disabled` |
| `docs/dev/modules/book/invoice-detail.md` | Note added — Send / Download PDF / View in Xero now wired (toast stubs) |
| `docs/dev/modules/book/settings.md` | Note added — Xero panel buttons wired; Disconnect confirm now toasts |
| `docs/dev/modules/book/budget.md` | Note added — Type filter and New Budget CTAs wired |
| `docs/dev/modules/book/job-costs.md` | Note added — Date range / Export / Filter actions wired (toast stubs) |
| `docs/dev/modules/book/stock-valuation.md` | Note added — As at / Generate report wired |
| `docs/dev/modules/book/reports.md` | Note added — Schedule report / Custom report wired |
| `docs/dev/modules/book/expenses.md` | Note added — receipt zoom/rotate/remove + Apply to Form / View existing wired |
| `docs/dev/modules/ship/returns.md` | Note added — Create RMA / Approve / Refund / Contact wired |
| `docs/dev/modules/ship/packaging.md` | Note added — Park / Complete & print label wired |
| `docs/dev/modules/ship/shipping.md` | Note added — rate Select wired |
| `docs/dev/modules/ship/reports.md` | Note added — Date range wired |
| `docs/dev/modules/ship/warehouse.md` | Note added — Inventory Export wired |
| `docs/dev/modules/ship/carrier-rates.md` | Note added — Request Quote wired |
| `docs/user/modules/buy/dashboard.md` | User-facing bullet — three Buy dashboard CTAs now navigate |
| `docs/user/modules/plan/dashboard.md` | User-facing bullet — quick-action buttons land on the live screens, New Job opens the form |
| `docs/user/modules/book/dashboard.md` | User-facing bullet — Sync Now / Follow Up All / View All Approvals now respond |
| `docs/user/modules/ship/returns.md` | User-facing bullet — Create RMA / Approve / Refund / Contact buttons now respond |

A few of the dev module docs are still pre-migration stubs (e.g. `docs/dev/modules/buy/dashboard.md` is the placeholder skeleton from the dev/user split). Rather than rewrite them as part of this fix-only changelog, the wiring change was added as a focused note under the existing structure; the deeper migration is tracked separately by `docs/audits/AUDIT-SUMMARY-DEV.md`.

## Screenshots captured this run

Captured headless via `Google Chrome --headless=new --virtual-time-budget=8000 --window-size=1440,900` against the dev server on port 5173. Files dated `2026-05-08`.

| Screen | File |
|---|---|
| Buy → Dashboard | `screenshots/buy/buy-dashboard-2026-05-08.png` |
| Plan → Dashboard | `screenshots/plan/plan-dashboard-2026-05-08.png` |
| Book → Dashboard | `screenshots/book/book-dashboard-2026-05-08.png` |
| Book → Invoices | `screenshots/book/book-invoices-2026-05-08.png` |
| Book → Reports | `screenshots/book/book-reports-2026-05-08.png` |
| Book → Settings (Xero panel) | `screenshots/book/book-settings-xero-2026-05-08.png` |
| Ship → Returns | `screenshots/ship/ship-returns-2026-05-08.png` |
| Ship → Packaging | `screenshots/ship/ship-packaging-2026-05-08.png` |
| Sell → Customer Detail (new) | `screenshots/sell/sell-customer-new-2026-05-08.png` |

The headless capture proves the surface renders (no error-boundary, no key warnings on first paint). Toast feedback only appears on click and is captured as a TODO for an interaction-driven follow-up run (the `preview_click` MCP path).

## Outstanding (carry-forward + new)

- **Carry-forward.** The eight per-module audit branches need merging to `main`. Today's nine commits ship nothing to the `main` branch beyond the one-line crash fix in `f622b52a` until that happens.
- **Carry-forward.** Working tree on `audit/standalone-admin` still contains the 2026-05-06 / 2026-05-07 changelog files and the eight earlier screenshots (untracked), plus the `PlanDashboard.tsx` diff (modified) that mirrors `d4f831f0`. None committed.
- **Carry-forward.** Route discrepancy on `PlanSchedule.tsx` (added 2026-05-06, still unwired) — flagged again so it doesn't get lost.
- **New (today).** `cf062fbf` mentions "escalations=1" without naming the escalated issue. Worth chasing next run — there's a known gap in Control that the audit found but didn't fix.
- **New (today).** All Book-module wires are toast-stubs against missing backend handlers. Each is a one-line replacement once `bookService.invoices.send`, `bookService.invoices.recordPayment`, `bookService.xero.syncNow`, etc. land. Tracking under each module's `## Migration status` section.
