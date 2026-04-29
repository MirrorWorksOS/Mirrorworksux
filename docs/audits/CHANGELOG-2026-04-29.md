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

---

# Evening update — 2026-04-29 design-system sweep

> Authored by the second `documentation` scheduled run of the day (22:00 +1000). The morning section above (run at 03:34 UTC) captured the pricing-tier rewrite + dead-end-flow closure; since then **40+ additional commits** landed as a coordinated design-system sweep, plus a new `book/purchase-orders/:id` detail screen.

## Verification (evening run)

| Check | Result |
|---|---|
| `git log -1` | `0e5705e4` (2026-04-29 21:56 +1000) — *docs(audits): mark design-system follow-up backlog with what landed* |
| `git log --since="24 hours ago"` | **47 commits** (vs 6 at the morning run) |
| Total diff over 24 hours | **120 files changed, +6279 / −2403 lines** |
| Working tree | clean |
| Stash | `stash@{0}: buy-new-order-wip — pre-main-pull stash 2026-04-22` (still unchanged, day 8) |

## What changed this afternoon / evening

The sweep was driven by a fresh design audit ([apps/web/src/audits/design-system-audit-2026-04-29.md](apps/web/src/audits/design-system-audit-2026-04-29.md), authored against `src/guidelines/DesignSystem.md`) that catalogued 24 findings: 7 P1 + 9 P2 + 8 P3. The follow-up note ([apps/web/src/audits/design-system-followup-2026-04-29.md](apps/web/src/audits/design-system-followup-2026-04-29.md)) tracks what landed; commit `0e5705e4` updated it again at the end of the day to mark items done.

> **Doc location quirk.** The two audit files live under `apps/web/src/audits/` (alongside the codebase) rather than `docs/audits/`. They appear to be intentionally co-located with the code they describe, but they're **not** discoverable from `docs/audits/AUDIT-SUMMARY-DEV.md`. Worth a follow-up to either move them or cross-link.

### 1. Stale-chunk recovery + new audit doc — `a38eca83`

Adds [`lazyWithRetry`](apps/web/src/lib/lazy-with-retry.ts) wrapper + [`RouteErrorBoundary`](apps/web/src/components/RouteErrorBoundary.tsx) so users on a stale build no longer get blank-screen-on-route-change after a deploy. The boundary catches dynamic-import failures, surfaces a "Refresh to load the latest version" UI, and the wrapper retries once after a 250 ms delay before propagating. Wired into every `lazy(...)` route in `routes.tsx`. The companion audit doc (`design-system-audit-2026-04-29.md`) ships in the same commit.

### 2. Page background standardisation — `45a64ddb`, `fefd026e`, `d6ef7df9`

Two distinct issues, three commits:

- **9 pages** had their root `<div>` overridden with `bg-[var(--neutral-100)]` (darker than `--app-canvas`), breaking the standard canvas. Reverted to canvas.
- **9 surfaces** were using literal `bg-white` instead of `bg-card` — `bg-card` is `#FFFFFF` in light and `#1A2732` in dark, so the dark mode was short-circuiting. Standing rule from memory: *"never modify existing light mode styles when implementing dark mode."* Pure light-mode-preserving swap.

### 3. Faux-card → `<Card>` — `f956bbdd`, `51a3756a`

15 hand-rolled `<div className="bg-white border rounded-lg ...">` blocks converted to the shared `<Card>` primitive: 3 simple cases + 12 deeply-nested ones (e.g. inside dialogs, drawers, settings rows). Wins consistency on radius (`--shape-lg` 22px), shadow (`--card-shadow-rest`), and dark-mode handling.

### 4. SettingsRow shared component — `75bf132e`

New [`SettingsRow`](apps/web/src/components/shared/settings/SettingsRow.tsx) — flex row with `bg-card` + border + `p-3` chrome + optional `interactive` prop. 11 inline `<div>`-with-the-same-classes sites across the six module Settings pages migrated to use it.

```tsx
<SettingsRow interactive>
  <span>Label</span>
  <Switch />
</SettingsRow>
```

### 5. Raw `<Table>` → `MwDataTable` — 16 commits, ~30 tables migrated

The biggest single change of the day. The sweep covered:

| Module | Files migrated | Commits |
|---|---|---|
| Sell | `SellOpportunityPage` (3 tables), `SellOrderDetail`, `SellInvoiceDetail`, `SellNewInvoice`, `SellCustomerPortal` (Orders + Invoices) | `f40c9035`, `32da9781`, `276083a1` |
| Make | in-dialog BOM table | `09a7aacf` |
| Plan | BOM-generator review, operation routing, material-consumption, subcontracting | `4ee7f30a`, `2e52d10e`, `ed4a82c9` |
| Buy | agreement → linked POs, supplier detail PO + bills tabs, order detail line-items + receiving | `67804132`, `c8927f23`, `824629f7` |
| Ship | bill-of-lading items, carrier-rates | `fe37fa0b`, `82ad1431` |
| Book / Make / Buy | WIP / MRP / reorder-rules | `f1506e39` |
| Control | audit log, groups list, maintenance schedule + history, operations library, tooling | `42916269`, `e6857d36`, `51aa2c4f`, `2dfed4cf`, `7d6ad02c` |
| MwDataTable itself | new `expandable` prop + `BookCostVariance` + `ControlDocuments` migrated | `e965a0d2` |

Files still on raw `<Table>` are documented in the follow-up note: `AdminTenants` / `AdminTiers` (slate-themed dark admin console — would clash with `MwDataTable`'s brand-light hover), and `BuyPlanningGrid` (week-by-week demand-vs-supply grid; not a flat list — closer to a spreadsheet). The original `BookCostVariance` + `ControlDocuments` blocker (expandable drill-down rows) was resolved by adding `expandable` to `MwDataTable`.

### 6. Redundant `<Card>` className strip — `10b13c07`, `cf7ad975`

74 redundant Card overrides removed across **two patterns**:

- **Pattern 1** (35 sites, `10b13c07`) — `<Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] ...">`. All four are baked into the variant. Removing them eliminates drift (the card had `--shape-lg` once but a className override could pin a different radius).
- **Pattern 2** (39 sites, `cf7ad975`) — same plus `shadow-xs`, which fights `--card-shadow-rest`.

`PlanBudgetTab` and `PlanJobDetail` were skipped from Pattern 1 because they had an in-flight `userRole → canViewBudget` permission rename — that rename then landed in `5faf32e8` (replaces a legacy `UserRole` union with the canonical `budget.visibility` permission key, evaluated via the same `hasPlanPermission` lookup), so those Card cleanups can now proceed in a follow-up.

### 7. Primitive polish — `03ce9e62`

Four targeted improvements to the shared component layer:

1. **Alert** — `rounded-lg` (Tailwind 8px) → `rounded-[var(--shape-lg)]` (22px). Now matches the Card it usually sits next to. No in-tree consumers today; theoretical ripple.
2. **`Card variant="interactive"`** — same rest chrome as `flat`, lifts to `--card-shadow-elevated` on hover, sets `cursor-pointer`. For clickable list rows / KPI cards / "open this" tiles. Adopted on `EntityCard` + 6 list-grid pages in the same-day follow-up commit `2e5cfd91`.
3. **Button `active:` pressed-state** — wires the previously-defined `--state-pressed` token (10% layer) into every interactive variant (default / destructive / outline / secondary / ghost). Each gains a slight darken on click — primary actions feel tactile.
4. **PageHeader breadcrumb dedup** — `PageHeader` was rolling its own `<nav><Link><ChevronRight></span>` markup; the [`ui/breadcrumb.tsx`](apps/web/src/components/ui/breadcrumb.tsx) primitive existed but was unused. Now `PageHeader` composes `Breadcrumb / BreadcrumbList / BreadcrumbItem / BreadcrumbSeparator`. ARIA semantics (`aria-current="page"`) live in one place.

### 8. KPI tile animation — `bc10fe01`, `abe26c08`

`KpiStatCard` gained an opt-in `animatedValue` + `format` prop — passing a number triggers a `framer-motion` spring animation from 0 to the target. Adopted across **20 KPI tiles** spanning Sell, Buy, Plan, Make, Book dashboards.

```tsx
<KpiStatCard
  label="Monthly Revenue"
  animatedValue={287500}
  format={(n) => `$${n.toLocaleString()}`}
/>
```

### 9. ToolbarPrimaryButton ClickSpark + StatusBadge pulse — `8814c1ca`, `9d4e7197`

- `ClickSpark` (existed but had near-zero adoption) wrapped around every `ToolbarPrimaryButton`. Single change → ripples to every "New Customer / New Quote / New Order / New PO" pill across the app.
- `StatusBadge` now pulses its leading dot for `live` / `in-progress` states. ~10 lines in [shared/data/StatusBadge.tsx](apps/web/src/components/shared/data/StatusBadge.tsx).

### 10. RouteBreadcrumbs helper — `dd29518e`

New [`RouteBreadcrumbs`](apps/web/src/components/shared/layout/RouteBreadcrumbs.tsx) + [`navigation/breadcrumbs.ts`](apps/web/src/lib/navigation/breadcrumbs.ts) lib. `PageHeader` now auto-derives breadcrumbs from React Router matches when the `breadcrumbs` prop is omitted. Eliminates per-file boilerplate going forward — closes the 45-page gap flagged in the audit.

### 11. DarkAccentCard / portal welcome banner rebrand — `b40e2e6a`

Both surfaces previously rendered with a dark mirage background + white text. Rebranded to a light surface — the brand language for "welcome / hero" is now consistent with the rest of the portal. *Pure light-mode change* per the standing memory rule.

### 12. MirrorView CAD-style refresh + portal model feedback — `a38b944b`

- **MirrorView** (Plan → Jobs → MirrorView) — repainted to read like a CAD review viewer: off-white canvas, brushed-steel material with self/contact shadows, Autodesk-APS-style floating toolbar (reset / select / pan / orbit / measure / comment) at the bottom. Pan/orbit/reset are wired through a new imperative API on `GlbViewer`; the rest are illustrative.
- **Portal** — new free-form **Model Feedback** feed under the 3D canvas, distinct from spatial markups + the quote-level chat. Persists via the existing `markupService` using a sentinel `partId` so the spatial markup list filters cleanly.
- New shared component: [`MirrorViewToolbar`](apps/web/src/components/shared/3d/MirrorViewToolbar.tsx).

### 13. Book → Purchase Order detail (NEW page) — `df806915`

[`BookPurchaseOrderDetail`](apps/web/src/components/book/BookPurchaseOrderDetail.tsx) — dual-mode (create + view/edit):
- **Create mode** — supplier picker, dates, inline line items, notes, totals, AI supplier recommendation, price-anomaly banner.
- **View mode** — read-only layout, `StatusBadge`, 3-way match indicator, status-appropriate actions (Edit / Send / Download PDF / Cancel PO).

New routes registered: `/book/purchases/new` and `/book/purchases/:id` (new before `:id` to avoid param collision). The "New PO" button in `PurchaseOrders` and the table row clicks both wired via `useNavigate`. *This was not yet covered by the morning section's documentation gap list — see new gap below.*

### 14. Permission-resolver unit tests — `021a4d03`

New [`permission-resolver.test.ts`](apps/web/src/test/unit/permission-resolver.test.ts) covers `resolveEffectivePermissions` plus an integration shape against the auth-state store. Co-lands with the `5faf32e8` legacy-role-gate fix above.

### 15. Husky + lint-staged pre-commit hook — `5f6f4c19`

New `.husky/pre-commit` runs `lint-staged`. Ensures the typecheck / lint discipline that landed in this morning's `a1b53d43` doesn't regress.

### 16. Tabs single-source-of-truth (carried-over working-tree change) — `46af0e0c`

The tabs primitive refactor flagged in the morning section's "Working-tree changes" list **did land** — `46af0e0c chore: tabs single-source-of-truth + lint sweep`. Ships the `useTabs()` hook + `SmoothTabsBridge` and the bundle of dead-import / className-whitespace cleanups in one commit.

## Headline numbers

| Surface | Count |
|---|---|
| Tables migrated to `MwDataTable` | ~30 across 16 files (+1 expandable variant) |
| Redundant `<Card>` className overrides stripped | 74 |
| Faux-card `<div>`s → `<Card>` | 15 |
| `bg-white` → `bg-card` swaps | 9 |
| Page-bg over-darkenings reverted | 9 |
| `KpiStatCard` tiles wired to spring-animate | 20 |
| `Card variant="interactive"` adopted | 1 EntityCard + 6 list-grids |
| New shared components | `SettingsRow`, `RouteBreadcrumbs`, `MirrorViewToolbar`, `RouteErrorBoundary`, `lazyWithRetry`, `BookPurchaseOrderDetail`, `PortalModelFeedback` |
| New primitive variants / props | `Card variant="interactive"`, `Button active:`, `MwDataTable.expandable`, `KpiStatCard.animatedValue+format`, `StatusBadge` pulse |
| Audit docs landed | 2 (`design-system-audit-2026-04-29.md`, `design-system-followup-2026-04-29.md`) |

## New documentation gaps surfaced this evening

Three gaps are *new this afternoon* and add to the morning section's gap list:

1. **Book → Purchase Order detail (NEW page)** — `df806915` ships [`BookPurchaseOrderDetail`](apps/web/src/components/book/BookPurchaseOrderDetail.tsx) with two modes (create + view/edit) and a non-trivial UX (AI supplier rec, price-anomaly banner, 3-way match indicator). Neither `docs/dev/modules/book/` nor `docs/user/modules/book/` reference the detail page (`purchases.md` exists for the list; no `purchase-order-detail.md`).
2. **MirrorView toolbar + portal model feedback** — `a38b944b` ships [`MirrorViewToolbar`](apps/web/src/components/shared/3d/MirrorViewToolbar.tsx) and [`PortalModelFeedback`](apps/web/src/components/sell/PortalModelFeedback.tsx). The `docs/dev/shared/3d-viewers.md` doc covers viewers but not the new toolbar; the portal markup viewer doc doesn't mention the new feedback feed.
3. **`SettingsRow` + `RouteBreadcrumbs` shared components** — both new, both adopted in 10+ sites, neither has a `docs/dev/shared/` entry. The audit follow-up has good usage snippets that can seed those docs.

## Updates to morning-section "Suggested follow-ups" (items 1–8 above)

| # | Morning ask | Status this evening |
|---|---|---|
| 1 | Author `docs/dev/modules/control/billing.md` + user doc | ⏳ still open |
| 2 | Commit working-tree tabs primitive refactor | ✅ done in `46af0e0c` |
| 3 | Commit dead-import + className whitespace cleanups | ✅ done — same `46af0e0c` |
| 4 | Link audit deliverables from `AUDIT-SUMMARY-DEV.md` | ⏳ still open; **now 4 audits to link**: `UX-COMPLETENESS-AUDIT-2026-04-28`, `-04-29`, `PERFORMANCE-AUDIT-2026-04-28`, plus `design-system-audit-2026-04-29` + `-followup-2026-04-29` (the latter two live under `apps/web/src/audits/` rather than `docs/audits/`) |
| 5 | Author make/work-orders + buy/agreement-detail docs | ⏳ still open |
| 6 | Capture screenshots for the three new surfaces | ⏳ still open; **add Book Purchase Order detail and MirrorView refresh** to the screenshot backlog |
| 7 | Author `/new`-pattern note in `docs/dev/architecture/` | ⏳ still open |
| 8 | Triage / clear the `buy-new-order-wip` stash | ⏳ still open (day 8) |

## Suggested follow-ups (evening additions)

1. **Author `docs/dev/shared/SettingsRow.md` + `docs/dev/shared/RouteBreadcrumbs.md`** — two new primitives with documented APIs in the audit follow-up; copy-paste those snippets into proper shared-component docs.
2. **Author `docs/dev/modules/book/purchase-order-detail.md` + user equivalent** — mirror the structure of `book/invoice-detail.md`. Include the dual-mode (create + view/edit) pattern (now repeated across the codebase since `fb992c26`).
3. **Cross-link the in-repo `apps/web/src/audits/` audits from `docs/audits/AUDIT-SUMMARY-DEV.md`** — both `design-system-audit-2026-04-29.md` and `-followup-2026-04-29.md` are substantive and discoverable only via `find`. Either move them into `docs/audits/` (consistent with the rest of the audit corpus) or add a "co-located audits" section to the summary index.
4. **Drop `BookCostVariance` + `ControlDocuments` from "expandable blocker" list in any future design-system audit** — `e965a0d2` resolved that blocker by adding `expandable` to `MwDataTable`.
5. **Drop `PlanBudgetTab` + `PlanJobDetail` from the "blocked on permission rename" list** — `5faf32e8` shipped the rename, so those Card cleanups can now proceed.

## Output (evening run)

This evening-update section. The substantive shipping artefact for this run is the **40+ commits** that comprise the design-system sweep itself — those are documented inline in the in-repo audit follow-up and don't need duplication. The doc gaps listed above are scoped writing tasks deferred to interactive sessions, in keeping with the precedent set on 2026-04-26 / 2026-04-27 / 2026-04-28 / this morning's run.
