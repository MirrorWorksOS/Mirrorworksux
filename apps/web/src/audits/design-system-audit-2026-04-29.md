# MirrorWorks Design Review — 2026-04-29

**Source of truth:** `src/guidelines/DesignSystem.md`, `src/styles/globals.css`
**Scope:** Cross-screen design review focused on 8 concerns: button radius, headers/navbars, breadcrumbs, polish (motion / colour / micro-interactions), the broken `/sell/crm/cust-001` page, banner/modal/table radius, page background anomalies, and missed shared-component opportunities.
**Companion audit:** `design-system-audit-2026-04-03.md` (broader violations sweep — this doc complements rather than replaces it).

---

## Summary

| Severity | Count |
|---|---|
| P1 (high impact, low effort) | 7 |
| P2 (high impact, medium effort) | 9 |
| P3 (polish) | 8 |
| **Total** | **24** |

### Top 7 P1 fixes (highest ripple-impact, smallest effort)

1. **`Alert` radius drift** → `rounded-lg` (8px) should be `rounded-[var(--shape-lg)]` (22px). One line. Ripples to every banner/inline alert in the app. — `src/components/ui/alert.tsx:7`
2. **Bare `<Table>` has no card wrapper** → 29 raw-table consumers (vs 53 `MwDataTable`) render edge-to-edge with no radius. Add a `TableContainer` slot or document Card-wrap requirement. — `src/components/ui/table.tsx:7`
3. **Sidebar rail-mode buttons bypass `<Button>`** → `rounded-[var(--shape-md)]` (square-ish) instead of `rounded-full`. Visual disconnect from full-mode. — `src/components/Sidebar.tsx:1107,1122,1141`
4. **Duplicate breadcrumb implementations** → `PageHeader` rolls its own; `breadcrumb.tsx` primitive is unused. Have `PageHeader` consume the primitive. — `src/components/shared/layout/PageHeader.tsx:31-63`
5. **Stale-chunk recovery** ✅ FIXED in companion PR (`lazyWithRetry` + `RouteErrorBoundary`).
6. **Redundant `<Card>` overrides** → `bg-card`, `border`, and `rounded-*` are baked into `Card`'s variants; ad-hoc page-level overrides are redundant and prone to drift. — pattern found at `src/components/sell/SellCRM.tsx:144` and likely elsewhere.
7. **`bg-white` short-circuits dark mode** → 30+ sites use literal `bg-white` instead of `bg-card`. The user has a standing rule: "never modify existing light mode styles when implementing dark mode." Replace with `bg-card` (it's `#FFFFFF` in light, `#1A2732` in dark — preserves light visuals).

### Top 9 P2 fixes

8. Module list pages (e.g. `/sell/crm`, `/buy/orders`, `/plan/jobs`) inconsistently apply breadcrumbs.
9. Module dashboards skip `PageHeader` — pattern is fine but should be a documented `ModuleDashboardHeader`, not silent.
10. `MwDataTable` outer Card needs `overflow-hidden` to clip rows at the rounded corners.
11. `Sheet` / `Drawer` radius parity with `Dialog` — needs a sample-page check (Sheet re-exports from `animate-ui`).
12. `PageToolbar` tooltip popover uses `rounded-lg` (8px) instead of shape token.
13. `Card` lacks an `interactive` variant for clickable cards (no hover lift on list items today).
14. `Button` lacks an `active:` pressed-state layer (`--state-pressed` token defined but unused).
15. `KpiStatCard` doesn't wire `AnimatedCount` for the primary number.
16. `EmptyState` and `ConfirmDialog` exist but adoption is low (14 and 7 sites respectively, vs many more places that hand-roll the equivalent).

### Top 8 P3 polish wins

17. List → detail page transition (shared-axis slide, `motion.div` `layoutId` from row to hero).
18. `StatusBadge` pulse for live/active states.
19. Status colours used as card backgrounds (against `globals.css:78` rule). Need to enumerate sites.
20. Yellow CTA pressed-state (M3 state-layer).
21. `font-semibold` (weight 600) usage — Roboto isn't shipped with weight 600. Per companion audit, 176 occurrences. Should be 500 or 700.
22. PageShell stagger animation isn't applied to dashboards that skip PageShell.
23. Sidebar collapse / expand button has hover styles only — could use the click-spark micro-interaction.
24. `ClickSpark` and `SplitText` shared components exist but adoption is near zero.

---

## Findings

### 1. Button design — large radius preference

**Rule:** Every interactive button should be pill-rounded (`rounded-full`) to match the brand language shown in the reference screenshot (Quick Create + Search bars).

**Confirmed correct:**
- `Button` ([src/components/ui/button.tsx:8](apps/web/src/components/ui/button.tsx:8)) — `rounded-full` baseline; sizes `default/lg/sm/icon` all pill ✓
- Sidebar full-mode Quick Create + Search ([src/components/Sidebar.tsx:1242](apps/web/src/components/Sidebar.tsx:1242), [:1261](apps/web/src/components/Sidebar.tsx:1261)) — `rounded-full` ✓
- `PageToolbar` filter chips + search input ([src/components/shared/layout/PageToolbar.tsx:87](apps/web/src/components/shared/layout/PageToolbar.tsx:87), [:133](apps/web/src/components/shared/layout/PageToolbar.tsx:133)) — `rounded-full` ✓

**P1 outliers:**
- **Sidebar rail-mode (icon-only) buttons** at [src/components/Sidebar.tsx:1107](apps/web/src/components/Sidebar.tsx:1107) (collapse), [:1122](apps/web/src/components/Sidebar.tsx:1122) (Quick Create), [:1141](apps/web/src/components/Sidebar.tsx:1141) (Search) all use `rounded-[var(--shape-md)]` (~14px square-ish) instead of `rounded-full`. They also bypass the shared `<Button>` component, so the styling has to be maintained twice.
  - **Recommendation:** rail icons should be `rounded-full` (44×44 circles match the pill brand language). Replace the ad-hoc `<button>` blocks with `<Button size="icon">` (already `rounded-full size-12`) — eliminates ~30 lines of duplicated tooltip + hover styling.

**P2 outliers:**
- [src/components/shared/layout/PageToolbar.tsx:218](apps/web/src/components/shared/layout/PageToolbar.tsx:218) — tooltip popover uses `rounded-lg` (Tailwind 8px) instead of `rounded-[var(--shape-md)]`. Drift.

---

### 2. Headers, navbars & shared patterns

**Confirmed correct:**
- `PageHeader` ([src/components/shared/layout/PageHeader.tsx](apps/web/src/components/shared/layout/PageHeader.tsx)) — used in **86 page files** ✓
- `PageShell` ([src/components/shared/layout/PageShell.tsx](apps/web/src/components/shared/layout/PageShell.tsx)) wraps content with motion stagger ✓
- Sidebar full mode is brand-on (yellow Quick Create CTA, kbd pills) ✓
- Mobile bottom nav ([src/components/shared/layout/MobileBottomNav.tsx](apps/web/src/components/shared/layout/MobileBottomNav.tsx)) ✓

**P1 — Duplicate breadcrumb implementation.**
[src/components/shared/layout/PageHeader.tsx:31-63](apps/web/src/components/shared/layout/PageHeader.tsx:31) renders breadcrumbs inline using its own `<Link>` + `<ChevronRight>` markup. Meanwhile [src/components/ui/breadcrumb.tsx](apps/web/src/components/ui/breadcrumb.tsx) is a Radix-style primitive that nothing currently consumes (0 imports across the codebase).

**Recommendation:** Refactor `PageHeader.breadcrumbs` to consume the `Breadcrumb` primitive. Keeps ARIA semantics (`aria-current="page"`, `role="link"`) correct in one place; separator can be themed once.

**P2 — Module dashboards skip `PageHeader`.**
All 7 module dashboards (`SellDashboard`, `BuyDashboard`, `PlanDashboard`, `MakeDashboard`, `ShipDashboard`, `BookDashboard`, `ControlDashboard`) build their hero/title from scratch instead of using `PageHeader`. This is likely intentional (dashboards are landing surfaces with custom layouts) but means there's no single shell governing dashboard chrome.

**Recommendation:** Either (a) document that dashboards intentionally bypass `PageHeader` and define a `ModuleDashboardShell` shared component, or (b) extend `PageHeader` with a `variant="dashboard"` that renders a richer hero. Option (a) is lighter-touch.

---

### 3. Breadcrumbs — gap analysis

**Adoption:**
- 86 files import `PageHeader`
- 41 files pass the `breadcrumbs` prop
- Gap = 45 files use `PageHeader` without breadcrumbs

**Buckets within the gap:**
- **Module dashboards (7 files)** — likely intentional. Module is the home; no parent crumb.
- **Settings sub-pages (`<module>/settings`, ~7 files)** — would benefit from `[Module] > Settings`.
- **List views (`/sell/crm`, `/buy/orders`, `/plan/jobs`, etc.)** — inconsistent. Some have crumbs, some skip them.
- **Tools / kanban views (e.g. `ExpenseKanban`, `BudgetOverview`, `MakeShopFloor`, `ShipScanToShip`)** — none have crumbs but each sits two levels deep.

**Recommendation:**
- **List views:** standardise on `[{label: <Module>, href: '/<module>'}, {label: <Resource>}]` everywhere. One-line per file fix.
- **Tool views:** same pattern.
- **Settings:** `[{label: <Module>, href: '/<module>'}, {label: 'Settings'}]`.

A future PR could ship a `<RouteBreadcrumbs>` helper that derives crumbs from React Router matches automatically — eliminates the per-file boilerplate.

---

### 4. Polish opportunities — motion, easing, micro-interactions, colour

**Already in place (don't disturb):**
- M3 easing tokens (`--ease-standard`, `--ease-emphasized`, `--ease-emphasized-decelerate`, etc.) — [src/styles/globals.css:157-163](apps/web/src/styles/globals.css:157)
- M3 duration tokens (`--duration-short1`, `short2`, `medium1`, `medium2`, `long1`, `long2`) — [globals.css:165-171](apps/web/src/styles/globals.css:165)
- Used consistently on `Button`, `Card`, `Input` ✓
- `motion/react` library + variants in [src/components/shared/motion/motion-variants.ts](apps/web/src/components/shared/motion/motion-variants.ts)
- `PageShell` staggers child entrances ✓
- `DockNav` provides macOS-style dock magnification on the rail sidebar ✓
- `AnimatedCount`, `AnimatedList`, `ClickSpark`, `SplitText` available

**P2/P3 wins:**

- **Card `interactive` variant (P2).** Cards used as clickable rows (KPI cards, list cards) currently have shadow-rest only on hover (no lift). Add `variant="interactive"`:
  ```ts
  interactive: "bg-card text-card-foreground border ... shadow-[var(--card-shadow-rest)] hover:shadow-[var(--card-shadow-elevated)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-[var(--duration-short2)] ease-[var(--ease-standard)] cursor-pointer"
  ```
- **Button `active:` pressed-state (P2).** `--state-pressed: 0.10` is defined but unused. Add `active:bg-primary/85` on default; matching variants for destructive/secondary/outline.
- **`AnimatedCount` adoption (P2).** [src/components/shared/cards/KpiStatCard.tsx](apps/web/src/components/shared/cards/KpiStatCard.tsx) renders the headline number as static text. Wire `<AnimatedCount value={n} />` for the primary number — instantly elevates dashboards.
- **List → detail page transition (P3).** `motion.div` with `layoutId` shared between list-row hero and detail-page hero. ~150-200ms shared-axis. Most list pages navigate hard; detail pages mount with the existing PageShell stagger, so the transition is jarring at the join.
- **`StatusBadge` pulse for live states (P3).** [src/components/shared/data/StatusBadge.tsx](apps/web/src/components/shared/data/StatusBadge.tsx) — the dot for `live`/`in-progress`/`running` should pulse subtly. ~10 lines.
- **`ClickSpark` adoption (P3).** [src/components/shared/motion/ClickSpark.tsx](apps/web/src/components/shared/motion/ClickSpark.tsx) — currently zero usage. Consider on primary CTAs (New Quote, Save) for a tactile feel.
- **`SplitText` adoption (P3).** Could be used on dashboard greetings ("Good morning, Alex") — currently static.

**Colour use:**
- `--mw-yellow-400` is the brand primary; the app uses it correctly as the CTA fill colour with dark text ✓ (per the user's "Yellow bg = dark text" memory rule).
- **P3 — Status colours used as card backgrounds.** [src/styles/globals.css:78](apps/web/src/styles/globals.css:78) declares: *"Status Colours — dots and badges only, never card backgrounds."* The audit pass should enumerate violations (e.g. greens/reds used for KPI cards). Companion audit (2026-04-03) likely already covers this.

---

### 5. Broken `/sell/crm/cust-001` — RESOLVED

Stale-chunk error after deploy. Fixed in the companion PR with:
- [src/lib/lazy-with-retry.ts](apps/web/src/lib/lazy-with-retry.ts) — wraps `React.lazy`; reloads once per session on `Failed to fetch dynamically imported module` / `ChunkLoadError`.
- [src/components/RouteErrorBoundary.tsx](apps/web/src/components/RouteErrorBoundary.tsx) — route-level `errorElement` rendering a recoverable card with Reload + Go home buttons.
- [src/routes.tsx](apps/web/src/routes.tsx) — every lazy import switched from `React.lazy` to `lazyWithRetry`; `errorElement` added to the three top-level routes (`/floor`, `/admin`, `/`).

Verified locally — `/sell/crm/cust-001` loads the TechCorp Industries detail view; build succeeds (2m 7s).

**Future hardening (not in this PR):**
- Service-worker / cache-busting headers for a more durable fix.
- Sentry/telemetry on the boundary so we measure how often the recovery fires.

---

### 6. Radius on banners, modals, tables

| Surface | Current radius | Status |
|---|---|---|
| `Card` | `rounded-[var(--shape-lg)]` (22px) | ✅ |
| `Dialog` | `rounded-[var(--shape-xl)]` (30px) | ✅ |
| `Alert` | `rounded-lg` (Tailwind 8px) | **❌ P1 — drift** |
| `Table` | none — bare `<table>` in `overflow-x-auto` | **❌ P1 — no container** |
| `MwDataTable` outer Card | inherits from `Card` | ✅ but **needs `overflow-hidden`** to clip rows at corners — verify |
| `FinancialTable` | inherits | ✅ same caveat |
| `Sheet` / `Drawer` | re-export from `animate-ui` (not inspected) | ⚠️ P2 — verify radius parity |

**P1 — `Alert` radius drift.**
[src/components/ui/alert.tsx:7](apps/web/src/components/ui/alert.tsx:7) — change `rounded-lg` → `rounded-[var(--shape-lg)]`. One token swap. Ripples to every inline alert/banner in the app. The current 8px is jarringly small next to the 22px `Card` it usually sits within.

**P1 — `Table` has no container.**
[src/components/ui/table.tsx:7](apps/web/src/components/ui/table.tsx:7) — the table primitive is a bare `<table>` inside `overflow-x-auto`. Pages that use `<Table>` directly (29 files) get edge-to-edge bleed with no rounding. Pages that use `<MwDataTable>` (53 files) get the Card wrap automatically.

Two paths:
- **(a) Add a `<TableContainer>` slot** in `table.tsx` with `rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card overflow-hidden` and update direct `<Table>` consumers — but each would need a code change.
- **(b) Document the rule** — "always wrap `<Table>` in `<Card>`" — and add an ESLint rule to enforce. Less invasive.

**Recommendation:** (a) — the consumer sites benefit immediately and the rule becomes structural rather than convention-dependent.

**P2 — `MwDataTable` corner-clip.**
[src/components/shared/data/MwDataTable.tsx](apps/web/src/components/shared/data/MwDataTable.tsx) wraps tables in a `<Card>` ✓ but needs verification that the inner table rows clip at the rounded corners. Likely needs `className="overflow-hidden"` on the wrapping Card.

**P2 — `Sheet` parity.**
[src/components/ui/sheet.tsx](apps/web/src/components/ui/sheet.tsx) is a thin re-export of `animate-ui` Radix Sheet. Inspect the underlying `animate-ui/components/radix/sheet` for radius and confirm parity with `Dialog` (30px on the open edge, 0 on the docked edge).

---

### 7. Background anomalies

**Token confirmation:**
- `--app-canvas` light: `#f9fafb`, dark: `#0F1419` — different per mode ✓
- `--card` light: `#FFFFFF`, dark: `#1A2732` (mirage) — different per mode ✓
- `--border` light: `#E5E5E5` (= `--neutral-200`), dark: `#2C3E4F` — different per mode ✓
- `--background` aliases `--app-canvas` ✓

**Layout main canvas:** [src/components/Layout.tsx:97-98](apps/web/src/components/Layout.tsx:97) — `bg-[var(--app-canvas)]`. Most pages put content directly on this canvas without an extra background layer ✓.

**P1 — `bg-white` literals (30+ sites).** `bg-white` short-circuits dark mode (the surface stays #FFFFFF when the rest of the page is `--mw-mirage`). Per the user's standing memory rule ("never modify existing light mode styles when implementing dark mode"), the fix is **`bg-white` → `bg-card`** which is `#FFFFFF` in light (no light-mode change) and `--mw-mirage` in dark.

Notable sites (full list via `grep -rn "bg-white" src/components`):
- [src/components/sell/PortalContactsPanel.tsx:229](apps/web/src/components/sell/PortalContactsPanel.tsx:229)
- [src/components/sell/PortalMarkupViewer.tsx:526](apps/web/src/components/sell/PortalMarkupViewer.tsx:526)
- [src/components/sell/SellCustomerPortal.tsx:226,893](apps/web/src/components/sell/SellCustomerPortal.tsx:226)
- [src/components/sell/SellOpportunityRecommendedActions.tsx:114,152,185](apps/web/src/components/sell/SellOpportunityRecommendedActions.tsx:114)
- [src/components/plan/product-studio/ProductStudio.tsx:263](apps/web/src/components/plan/product-studio/ProductStudio.tsx:263)
- [src/components/plan/product-studio/VisualRuleWorkspace.tsx:242,631,690,733](apps/web/src/components/plan/product-studio/VisualRuleWorkspace.tsx:242)
- [src/components/plan/PlanProductionTab.tsx:111,113](apps/web/src/components/plan/PlanProductionTab.tsx:111)

(Cases with `bg-white/10`, `bg-white/[0.04]` etc. for translucent overlays on dark surfaces are intentional and should be preserved.)

**P1 — Redundant `<Card>` style overrides.**
[src/components/sell/SellCRM.tsx:144](apps/web/src/components/sell/SellCRM.tsx:144) writes `<Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">`. Every class on that line is already the Card default. If `--border` ever drifts from `--neutral-200` (Card's actual default), this card visually de-syncs from its peers.

**Recommendation:** Sweep redundant `bg-card` / `border` / `rounded-*` overrides on `<Card>`. Probable hotspot list (from companion audit): `SellCustomerDetail`, `SellProductDetail`, `MakeManufacturingOrderDetail`. Worth ~1h to clean.

---

### 8. Missed opportunities for shared components

**Adoption counts (greppable):**
| Component | Adoption | Comment |
|---|---|---|
| `PageHeader` | 86 | ✓ widely used |
| `PageShell` | (high) | ✓ via PageHeader/dashboard pages |
| `MwDataTable` | 53 | ✓ |
| `KpiStatCard` / `StatCard` | 29 | ✓ |
| Raw `<Table>` | 29 | ⚠️ 29 files bypass MwDataTable / FinancialTable |
| `EmptyState` | 14 | ⚠️ low for an app with this many list views |
| `ConfirmDialog` | 7 | ⚠️ many `<AlertDialog>` hand-rolls likely exist |
| `ClickSpark` | ~0 | unused |
| `SplitText` | ~0 | unused |

**P2 — Missed `EmptyState`.** Only 14 sites use the shared `EmptyState`. Most list views likely render an inline "No items" message instead. Audit the 70+ list pages and convert.

**P2 — Missed `ConfirmDialog`.** 7 sites. Delete confirmations across the app are likely hand-rolled `<AlertDialog>` instances. Convert to `ConfirmDialog` for consistent copy + button placement.

**P2 — Raw `<Table>` users (29 files).** Each should migrate to `MwDataTable` (general) or `FinancialTable` (currency rows with totals). Companion audit (2026-04-03) lists these in detail.

**P3 — `PageToolbar` adoption.** Many list pages roll their own filter row. Worth a separate audit pass to identify which can adopt the shared toolbar.

**P3 — `IconWell`, `ProgressBar` adoption.** Companion audit already flags these as under-adopted; revisit when polish PRs go out.

---

## Out of scope for this audit

- Mobile-specific design (bottom nav touch targets, mobile menu density) — needs a dedicated session.
- Charts & data viz — `ChartCard` already audited in the 2026-04-03 audit.
- Typography scale — covered separately by `font-semibold` finding in companion audit.
- Accessibility deep dive (ARIA labels, focus traps) — separate axis from this design review.

---

## Appendix — verification of P1 fixes

**Before merging any P1 fix:**

1. **Alert radius** — Toggle the Sell upgrade banner / any dashboard alert and inspect against an adjacent Card. Should be visually flush.
2. **Table container** — Visit `/book/job-costs/[id]` (raw table consumer); confirm the table corners round.
3. **Sidebar rail buttons** — Collapse the sidebar (chevron) and inspect Quick Create + Search. Should be 44×44 circles, not rounded squares.
4. **Breadcrumb dedup** — Visit any detail page (`/sell/crm/[id]`); breadcrumbs should still render with separator chevrons and `aria-current="page"` on the last crumb (use accessibility inspector).
5. **`bg-white` → `bg-card`** — Switch theme to dark and visit each affected page; the affected surfaces should now use mirage instead of staying white. Light mode should be unchanged.
6. **`<Card>` override sweep** — Diff the rendered HTML before/after; visually identical.
