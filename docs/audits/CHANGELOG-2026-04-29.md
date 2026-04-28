# Changelog — 2026-04-29

Daily documentation review. Run by the `documentation` scheduled task.

## Summary

**Substantive shipping day after a five-day quiet period.** Six commits landed on `main` in the past 24 hours — the first new code on the branch since `3c4dc957` (2026-04-23). The headline work is the **pricing-tier rewrite** (PR #29) which renames tiers to Trial / Make / Run / Operate / Enterprise, introduces AI credits, and wires real upgrade flows. A separate **dead-end-flow sweep** closes the remaining "coming soon" toast holes across Plan / Make / Buy / Ship and turns CI green for the first time. A third commit corrects per-tier user caps that shouldn't have been gated.

In parallel, today's UX completeness audit (`docs/audits/dev/UX-COMPLETENESS-AUDIT-2026-04-29.md`, authored 02:13 against the live app) reports **dramatic improvement** vs the 2026-04-28 baseline: all P0 empty-page issues resolved, 26 "coming soon" toast actions removed, 7 sparse pages filled, plus the new Billing page live at `/control/billing`.

The working tree also carries an in-progress **tabs primitive refactor** ([apps/web/src/components/ui/tabs.tsx](apps/web/src/components/ui/tabs.tsx) + the underlying animate-ui primitive) that fixes a setState ping-pong against the controlled Radix primitive, plus the same dead-import cleanups carried over from yesterday.

## Verification

| Check | Result |
|---|---|
| `git log -1` | `5ef7430e` (2026-04-28 21:05 +1000) — *fix(billing): remove per-tier user caps from pricing surfaces* |
| `git log --since="24 hours ago"` | 6 commits (see below) |
| Working tree | dirty: 11 modified files (tabs primitive refactor + carried-over dead-import cleanups + className whitespace tidy), 6 untracked docs |
| Stash | `stash@{0}: buy-new-order-wip — pre-main-pull stash 2026-04-22` (still unchanged, carried 7 days) |
| CI | Green for the first time per `a1b53d43` commit body (typecheck was 17 errors red on `main` immediately prior) |

## Shipped in the past 24 hours

### 1. Pricing tier rewrite + AI credits — `f6aa4aa4` (PR #29)

Source of truth: `docs/SAL 02 — Pricing Tiers and Strategy.xlsx` (committed alongside as `6261b2ac`).

**Tier model** — replaces Pilot / Produce / Expand / Excel (4 tiers, AUD flat-monthly) with **Trial / Make / Run / Operate / Enterprise** (5 tiers, USD per user/month). New per-tier prices, AI credit quotas, and module limits (CRM / Opportunities / Quotes / Jobs / Manufacturing Orders) wired through [apps/web/src/lib/subscription.ts](apps/web/src/lib/subscription.ts). Org-wide complexity caps (sites, integrations, machines, workflows, API rate, storage) added as a new `MODULE_LIMITS["Org"]` bucket.

`TierConfig` now models `priceMonthly` / `priceAnnual` as nullable (Trial = free, Enterprise = quoted). `priceAnnualEffectiveMonthly` exposes the per-user/yr rate alongside the equivalent /mo figure. `SubscriptionTier` in `@mirrorworks/contracts` and [apps/web/src/types/entities.ts](apps/web/src/types/entities.ts) retyped to the new lowercase variants.

**AI credits (new)** — `AI_CREDIT_PACKS` (5k/$225, 10k/$400, 25k/$875), `AI_OVERAGE_RATE_USD` ($0.05), `VOLUME_DISCOUNT_BANDS` (10 % at 10–24, 15 % at 25–49, contact-sales 50+). New [AICreditsCard](apps/web/src/components/control/AICreditsCard.tsx) component with included-quota meter, packs-owned tile, total-available tile, three buy-pack cards, and confirm dialog. Mounted in Control → Billing & subscription.

**Upgrade flows** — `PlanUsageCard` "Upgrade plan" button now navigates to `/control/billing` instead of dead-ending. ControlBilling per-tier Upgrade / Downgrade buttons replaced toast with a real confirmation Dialog (source/target tier, prorated billing copy, upgrade-vs-downgrade aware confirm). `// TODO(backend)` is the only remaining hookup.

Touches: 15 files, +783 / −188 lines. Verification per commit body: typecheck / lint (max-warnings 0) / test (6/6 smoke) / build all green.

### 2. Per-tier user caps removed — `5ef7430e`

Pricing tiers don't gate user count — only AI credits, sites, and feature access. Drops `maxUsers` from `TierConfig` and strips "Up to N users" copy from `AdminTenants`, `AdminTiers`, `ControlBilling`, and the tier catalog. 4 files, +7 / −26 lines.

### 3. Dead-end flow closure (Phase 2) + green CI — `a1b53d43`

The second pass of the missing-screens audit. All five CI jobs now pass for the first time (typecheck was 17 errors red on `main` immediately prior).

- **Plan / Make** — `PlanJobs` "Create Job" and `MakeManufacturingOrders` "New MO" buttons route to dedicated `/new` create forms; `PlanJobDetail` no longer hardcodes `JOB-2026-0015`, so deep links resolve to the requested id. "Create manufacturing order" from a job now carries `?jobId=` so the new MO prefills with the originating job + customer.
- **Make Work Orders** — new [MakeWorkOrders](apps/web/src/components/make/MakeWorkOrders.tsx) list + [MakeWorkOrderDetail](apps/web/src/components/make/MakeWorkOrderDetail.tsx) (was unreachable — WO references inside MO bodies dead-ended). Office-side only; floor execution still routes via `/floor`.
- **Buy** — Agreements *New* + card click route to a new [BuyAgreementDetail](apps/web/src/components/buy/BuyAgreementDetail.tsx) (Overview / Spend / Linked POs / Documents tabs). Vendor Comparison selections persist via `localStorage`.
- **Ship Orders** — drawer is now URL-driven (`/ship/orders/:id`) so deep links and refresh restore the open shipment. New "Create shipment" CTA opens an inline create sheet at `/ship/orders/new`. *Advance stage* mutates state; *Flag issue* opens a dialog and appends to a per-shipment issue list.
- **CI fixes** — installs `@types/three`, drops `ts-expect-error` in `ShapeBlur`, types GLTFLoader callbacks in `DrawingViewer` / `GlbViewer`, refactors `routesLibraryService.resolve` to `flatMap` so the predicate narrows correctly.

Touches: 17 files, +1448 / −58 lines.

### 4. Sell + Buy create flow closure (Phase 1) — `fb992c26`

Just inside the 24-hour window (2026-04-27 23:31 UTC). Most "New X" buttons in Sell and Buy were either silently inert or fired "…coming soon" toasts. This wires them to `/new` routes that reuse the existing detail components in **create-mode** (`id === "new"` triggers a `createBlank<Entity>()` factory and a "New <Entity>" header). `// TODO(backend)` markers name the future mutation. Quick Create + Command Palette now route to `/new` instead of list pages. Context flows via search params (opportunity → New quote / Convert to Sales Order, supplier → New PO, etc).

Touches: 26 files, +925 / −180 lines.

### 5. Pricing strategy spreadsheet — `6261b2ac`

Adds `docs/SAL 02 — Pricing Tiers and Strategy.xlsx` as the source-of-truth for the tier rewrite. Binary; not rendered in the dev/user docs.

### 6. PR merge — `ad7e6337`

Merge of PR #29 (`claude/repricing-tiers` → `main`).

## Working-tree changes (uncommitted)

11 modified files, none committed.

### Tabs primitive refactor (substantive)

`apps/web/src/components/ui/tabs.tsx` (+34 / −22) and `apps/web/src/components/animate-ui/primitives/radix/tabs.tsx` (+6 / −10):

- Removes the `AnimatePresence mode="wait"` wrapper around `TabsContent` — `motion.div` now animates inline. Avoids unmount/remount churn on every tab swap.
- Removes the local `current` `useState` from the wrapper `Tabs` — that state was duplicating the controlled value already managed by the underlying Radix primitive, and was causing a setState ping-pong with the `onValueChange` controller.
- Introduces `SmoothTabsBridge` which reads the single source of truth via the new exported `useTabs()` hook from the animate-ui primitive and exposes it through `SmoothTabsContext` so `TabsTrigger` can still animate its pill via `layoutId`.

The author's comment in the file explicitly documents the *why* ("No local state — prevents setState ping-pong with the controlled primitive beneath"). This is a real bug-fix-grade change, not cleanup. Not yet committed.

### Dead-import + className cleanups (carry-over)

The same import-pruning batch flagged in `CHANGELOG-2026-04-28.md` plus a few trailing-whitespace tidies inside Tailwind classNames. Pure dead-code; no runtime impact.

| File | Removed import / change |
|---|---|
| [apps/web/src/components/bridge/steps/StepTeamSetup.tsx](apps/web/src/components/bridge/steps/StepTeamSetup.tsx) | `Users` (lucide-react) |
| [apps/web/src/components/control/ControlDocuments.tsx](apps/web/src/components/control/ControlDocuments.tsx) | `Clock` (lucide-react) |
| [apps/web/src/components/control/ControlPurchase.tsx](apps/web/src/components/control/ControlPurchase.tsx) | `ShoppingBag`, `staggerItem` + className whitespace |
| [apps/web/src/components/control/ControlWorkflowDesigner.tsx](apps/web/src/components/control/ControlWorkflowDesigner.tsx) | `IconWell` + extracts `configPct` to dedupe inline expression |
| [apps/web/src/components/plan/BomGenerator.tsx](apps/web/src/components/plan/BomGenerator.tsx) | `useEffect`, `RotateCw` |
| [apps/web/src/components/plan/PlanActivities.tsx](apps/web/src/components/plan/PlanActivities.tsx) | default `React`, `Badge` |
| [apps/web/src/components/plan/PlanScheduleEngine.tsx](apps/web/src/components/plan/PlanScheduleEngine.tsx) | `Badge` |
| [apps/web/src/components/plan/PlanShiftCalendar.tsx](apps/web/src/components/plan/PlanShiftCalendar.tsx) | `Badge` |
| [apps/web/src/components/sell/SellSettings.tsx](apps/web/src/components/sell/SellSettings.tsx) | `Separator` + className whitespace |

The `ControlBilling.tsx` change previously listed in `CHANGELOG-2026-04-28.md` was absorbed into commit `f6aa4aa4` (which rewrites the file substantially) and `5ef7430e` (which removes the `Progress` usage entirely with the `maxUsers` removal), so it's no longer pending in the working tree.

### Untracked docs (this run + prior runs)

- `docs/audits/CHANGELOG-2026-04-26.md`, `-04-27.md`, `-04-28.md` — three prior daily runs, never committed.
- `docs/audits/PERFORMANCE-AUDIT-2026-04-28.md` — performance audit authored 2026-04-28; not linked from any index.
- `docs/audits/dev/UX-COMPLETENESS-AUDIT-2026-04-28.md`, `-04-29.md` — two UX completeness audits; latest one is today's substantive deliverable.
- `docs/audits/CHANGELOG-2026-04-29.md` — this file.

## Today's UX audit headline (full report linked below)

`docs/audits/dev/UX-COMPLETENESS-AUDIT-2026-04-29.md` (19 KB, 326 lines) was authored 02:13 today against the live app at `app.mirrorworks.ai`. Key deltas vs the 2026-04-28 baseline:

| Metric | Apr-28 | Apr-29 | Delta |
|---|---|---|---|
| Fully functional pages | ~68 | ~78 | **+10** |
| Pages with "coming soon" toast actions | ~28 | ~24 | **−4** |
| Sparse pages (summary only, no detail) | 7 | 1 | **−6** |
| Empty content areas | 2 | 0 | **−2** |
| Total "coming soon" toast instances in code | 78 | 52 | **−26** |
| New pages since last audit | 0 | 1 | +1 (Billing) |

**P0 issues all resolved** — Customer Portal (`/sell/portal`) now renders hero, KPIs, shipping status chart, quote cards, orders / invoices tables. Shift Manager (`/control/shifts`) now renders the weekly grid (8 employees × 6 departments × 7 days). Six previously-sparse pages (`/buy/mrp-suggestions`, `/buy/reorder-rules`, `/book/wip`, `/book/cost-variance`, `/make/scrap-analysis`, `/control/maintenance`) now render full tables / charts / heat maps.

**Remaining P1 pressure** — 14 Control-module create / edit buttons (BOMs, Machines, Inventory, Shifts, Routes, Products, Locations, Operations) still fire "coming soon" toasts. The next dead-end-flow sweep should target these.

## Documentation gaps surfaced by today's shipping

The four commits ship code that is **not yet documented** in `docs/dev/` or `docs/user/`. None are blocking; flagged here as carry-over for an interactive writing session.

### Control → Billing & subscription (NEW page, no dev or user doc)

Neither `docs/dev/modules/control/` nor `docs/user/modules/control/` contain a `billing.md`. The page is fully wired, lives at `/control/billing`, and is the headline UI for the pricing rewrite. Source files:
- [apps/web/src/components/control/ControlBilling.tsx](apps/web/src/components/control/ControlBilling.tsx) — page shell, usage card, AICreditsCard mount, tier comparison grid, upgrade/downgrade dialog.
- [apps/web/src/components/control/AICreditsCard.tsx](apps/web/src/components/control/AICreditsCard.tsx) — included-quota meter, pack purchase flow.
- [apps/web/src/lib/subscription.ts](apps/web/src/lib/subscription.ts) — tier catalog, AI credit packs, volume discount bands, module limits, `Org` complexity caps. The user-facing dev doc should live next to `purchase.md`.
- [apps/web/src/services/subscriptionService.ts](apps/web/src/services/subscriptionService.ts) — backend service surface (was already on the 2026-04-26 carry-over list, now larger after the rewrite).

### Make → Work Orders (NEW page, no dev or user doc)

`a1b53d43` adds [MakeWorkOrders](apps/web/src/components/make/MakeWorkOrders.tsx) + [MakeWorkOrderDetail](apps/web/src/components/make/MakeWorkOrderDetail.tsx). Neither `docs/dev/modules/make/` nor `docs/user/modules/make/` reference them. (Floor execution remains documented under `docs/dev/modules/shop-floor/`; the office-side WO surface is what's missing.)

### Buy → Agreement Detail (NEW page, no dev or user doc)

`a1b53d43` also adds [BuyAgreementDetail](apps/web/src/components/buy/BuyAgreementDetail.tsx) (Overview / Spend / Linked POs / Documents tabs). The list page `BuyAgreements` already has docs; the detail does not.

### `/new` create flows (NEW pattern, undocumented)

The "reuse detail screens with `isNew`" pattern from `fb992c26` is now the convention across Sell, Buy, Plan, Make. Worth adding a short architecture note (the `docs/dev/architecture/` shelf flagged in `AUDIT-SUMMARY-DEV.md` §1 is the natural home) describing:
- `id === "new"` toggles create mode in detail components
- `createBlank<Entity>()` factories supply the initial state
- Search params carry context (`?jobId=`, `?opportunityId=`, etc) for prefill
- `// TODO(backend)` comments mark every save handler that needs wiring

### Carry-overs from prior changelogs (still open)

All gaps catalogued in `CHANGELOG-2026-04-26.md` / `-04-27.md` / `-04-28.md` remain open:

- `docs/dev/modules/control/operations.md` and `routes.md` — still missing for the 2026-04-23 routes.
- `docs/dev/modules/sell/customer-portal.md` — `PortalContactsPanel`, `PortalProfileDrawer`, `PortalSubscriptionSection`, `portalPreferences` still unmentioned (and `PortalSubscriptionSection` was substantially rewritten in `f6aa4aa4` to be USD- and null-price-aware, so the doc when written should reflect the post-rewrite shape).
- `docs/dev/shared/` — still missing `PartThumbnail` and `AuthContext` entries.
- `CHANGELOG-2026-04-22.md` §"Not covered by this run" carry-overs (shop-floor leaderboard screenshot, Bridge review-step screenshot, batch traceability screenshot, Plan Production user doc) — still open after seven days.

## Suggested follow-ups for an interactive session

In rough priority order:

1. **Author `docs/dev/modules/control/billing.md` + `docs/user/modules/control/billing.md`** — highest-impact gap; the headline new feature is undocumented. Mirror the structure of `purchase.md` / `people.md`.
2. **Commit the working-tree tabs primitive refactor as its own commit** — it is a real bug fix (setState ping-pong) and should not be bundled with the carry-over import cleanups. The author's in-file comment can seed the commit body.
3. **Commit the dead-import + className whitespace cleanups** as a separate `chore:` commit modelled on `868b7c3c`.
4. **Link the three audit deliverables from the audit indexes** — `UX-COMPLETENESS-AUDIT-2026-04-28.md`, `-04-29.md`, and `PERFORMANCE-AUDIT-2026-04-28.md` are not referenced from `AUDIT-SUMMARY-DEV.md`. The 2026-04-23 audit was also unlinked, so this is now a four-file index update.
5. **Author `docs/dev/modules/make/work-orders.md` + user doc**, and add a *Detail* section to the existing Buy `agreements.md` (or split into a `agreement-detail.md`).
6. **Capture screenshots** for the three new surfaces (Billing, Make Work Orders, Buy Agreement Detail) and drop into `docs/audits/screenshots/control/`, `…/make/`, `…/buy/`.
7. **Author the `docs/dev/architecture/` `/new`-pattern note** so the convention is discoverable to a future contributor.
8. **Triage / clear the stash** — `stash@{0}: buy-new-order-wip — pre-main-pull stash 2026-04-22` is now obsolete after `fb992c26` shipped Buy create flows.

## Output

This file. The substantive UX deliverable for today (`UX-COMPLETENESS-AUDIT-2026-04-29.md`) was already authored before this scheduled run executed; the changelog summarises both that and the four code commits, and catalogues the dev/user-doc gaps the new code creates. Authoring those gap-fill docs is a scoped writing task deferred to an interactive session, per the same reasoning given on 2026-04-26 / 2026-04-27 / 2026-04-28.
