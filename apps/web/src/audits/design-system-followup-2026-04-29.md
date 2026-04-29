# Design System Sweep — Follow-up Note (2026-04-29)

Companion to [`design-system-audit-2026-04-29.md`](./design-system-audit-2026-04-29.md). Captures what's still open after the big multi-commit sweep on 2026-04-29.

---

## What landed today

**27 commits** on `main` (between `89577793` and `824629f7`):

- `a38eca83` — chunk-load recovery (`lazyWithRetry` + `RouteErrorBoundary`) + the audit doc.
- `45a64ddb`, `fefd026e` — 9 pages whose root div was overridden with `bg-[var(--neutral-100)]` (darker than the standard `--app-canvas`) restored to canvas.
- `f956bbdd`, `51a3756a` — 15 faux-card `<div>`s converted to `<Card>` (3 simple + 12 deeply-nested).
- `75bf132e` — new `<SettingsRow>` shared component + 11 migrations across the six module Settings pages.
- `f40c9035` (matt), `42916269`, `e6857d36`, `51aa2c4f`, `2dfed4cf`, `7d6ad02c`, `f1506e39`, `82ad1431`, `fe37fa0b`, `4ee7f30a`, `2e52d10e`, `ed4a82c9`, `67804132`, `c8927f23`, `824629f7` — **~30 raw `<Table>`s migrated to `MwDataTable`** across 16 files.
- `d6ef7df9` — `bg-white` → `bg-card` on 9 surfaces missing dark variants.
- `10b13c07`, `cf7ad975` — **74 redundant `<Card>` className overrides** stripped (Pattern 1 + Pattern 2).
- `03ce9e62` — primitive polish: `Alert` radius drift fixed, `Card variant="interactive"` added, `Button` `active:` pressed-state wired in for all variants, `PageHeader` now consumes the `Breadcrumb` primitive.
- `2e5cfd91` — `Card variant="interactive"` adopted on `EntityCard` + 6 list-grid pages.
- `bc10fe01`, `abe26c08` — `AnimatedCount.format` + `KpiStatCard.animatedValue` opt-in API; **20 KPI tiles** across Sell/Buy/Plan/Make/Book wired to spring-animate.

Plus matt's own `f40c9035` migrating the three SellOpportunityPage tables to `MwDataTable`.

---

## What's still open

### A. Raw `<Table>` migrations — 9 files still importing `@/components/ui/table`

#### A1. Deferred by design (4 files) — different blockers, not just effort
- [admin/AdminTenants.tsx](../components/admin/AdminTenants.tsx) — slate-themed dark admin console (`text-slate-400` / `border-slate-800`). `MwDataTable`'s default chrome is the brand-light hover and would clash. Either (a) live with the visual mismatch, (b) add a `dark`/`slate` variant prop to `MwDataTable`, or (c) leave admin console on raw `<Table>` since it's a separate audience anyway.
- [admin/AdminTiers.tsx](../components/admin/AdminTiers.tsx) — same reason.
- [book/BookCostVariance.tsx](../components/book/BookCostVariance.tsx) — has expandable drill-down rows (variance broken down per category beneath each job row). `MwDataTable` takes a flat array; injecting sub-rows breaks the column model. Needs a `getSubRows`/`expandable` prop on `MwDataTable` to migrate cleanly.
- [control/ControlDocuments.tsx](../components/control/ControlDocuments.tsx) — same expandable pattern (revision history per document).

#### A2. Sell detail pages with line items + totals (4 files, ~5 tables each)
- [sell/SellOrderDetail.tsx](../components/sell/SellOrderDetail.tsx)
- [sell/SellInvoiceDetail.tsx](../components/sell/SellInvoiceDetail.tsx)
- [sell/SellNewInvoice.tsx](../components/sell/SellNewInvoice.tsx)
- [sell/SellCustomerPortal.tsx](../components/sell/SellCustomerPortal.tsx) — large complex portal page

These are the highest-value migrations remaining (visible to customers via the portal, financial-grade data) but also the heaviest. Each table renders currency line items with a totals row beneath (subtotal / GST / total). The right primitive is **`FinancialTable`**, not `MwDataTable` — `FinancialTable` already handles right-aligned currency columns + a footer totals row that sums declared columns.

Per-file estimated diff: ~150 lines. Risk: medium — need to preserve the totals math so per-line edits propagate.

#### A3. BuyPlanningGrid (1 file) — different shape
- [buy/BuyPlanningGrid.tsx](../components/buy/BuyPlanningGrid.tsx) — week-by-week demand-vs-supply grid. The "rows" are materials and the "columns" are time buckets, with edits in the cells. Not a flat data list; closer to a spreadsheet. May not be a `MwDataTable` fit at all — keep on raw `<Table>` or build a dedicated `<PlanningGrid>` shared component.

### B. PageHeader breadcrumb adoption — gap analysis still pending

The companion audit (2026-04-29) lists 86 `PageHeader` consumers and 41 with the `breadcrumbs` prop, leaving ~45 pages with no breadcrumb. The audit recommended a per-route checklist — it hasn't been built yet. Worth a follow-up commit that:
1. Adds breadcrumbs to the obvious gaps (list views like `/sell/crm`, `/buy/orders`, `/plan/jobs`).
2. Considers a `<RouteBreadcrumbs>` helper that derives crumbs from React Router matches automatically — would eliminate per-file boilerplate going forward.

### C. PlanBudgetTab + PlanJobDetail Card-class cleanup — held back by an in-flight refactor

Two `<Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] ...">` sites in `plan/PlanBudgetTab.tsx` and `plan/PlanJobDetail.tsx` were skipped from the `10b13c07` Pattern-1 strip because those files have an unrelated half-finished `userRole → canViewBudget` permission rename that landed externally (not from this design sweep). Drop the Card classes when that rename completes.

### D. Smaller polish items the audit flagged but I didn't get to

- **`StatusBadge` pulse for live/in-progress states** — would visibly modernise dashboards. ~10 lines in [shared/data/StatusBadge.tsx](../components/shared/data/StatusBadge.tsx).
- **`ClickSpark` adoption on primary CTAs** — exists but unused. Wire on Save / New Quote / Create.
- **`SplitText` adoption on dashboard greetings** — "Good morning, Alex" is currently static.
- **List → detail page transitions** — `motion.div` `layoutId` shared between list-row hero and detail-page hero. Audit estimated 150–200 ms shared-axis. Bigger than the other polish items; treat as its own task.

### E. Module-dashboard-shell decision

The audit raised the `ModuleDashboardShell` question — module dashboards (`SellDashboard`, `BuyDashboard`, etc.) deliberately bypass `PageHeader` and roll their own hero. Worth a small UX decision: either (a) extend `PageHeader` with a `variant="dashboard"` that renders the richer hero, or (b) document that dashboards intentionally skip `PageHeader` and define a `ModuleDashboardShell` shared wrapper. Both are ~1-day tasks; the audit leaned (b) but didn't commit.

### F. Mobile design pass

Companion audit explicitly flagged this as out of scope. The mobile bottom nav, mobile menu overlay, and per-page mobile layouts haven't been audited yet. Worth a dedicated session.

### G. Shop-floor design pass

The 2026-04-03 audit flagged shop-floor (`/floor/*`, `make/shop-floor/*`) as a hotspot for design-system violations (touch-target sizing, hex literals, ad-hoc shadows). The kiosk module has its own design vocabulary by design — it deserves its own audit + sweep, separate from the office-UI work that landed today.

---

## Backlog ranked by effort vs impact

| # | Item | Effort | Impact | Notes |
|---|---|---|---|---|
| 1 | Sell detail-page tables → `FinancialTable` | Medium-High (~4 files × 5 tables) | High (customer-facing portal) | A2 above |
| 2 | Breadcrumbs on list views (per-file) | Low | Medium | B above; or build `<RouteBreadcrumbs>` instead |
| 3 | `BookCostVariance` + `ControlDocuments` migration after `MwDataTable` gets `expandable` | Medium | Medium | A1 above |
| 4 | PlanBudgetTab + PlanJobDetail Card-class cleanup | Low | Low | C above — wait for permission rename to land |
| 5 | `StatusBadge` pulse + `ClickSpark`/`SplitText` adoption | Low | Low | D above |
| 6 | Mobile design pass | High | Medium | F above |
| 7 | Shop-floor design pass | High | Medium | G above |
| 8 | Module dashboard shell decision | Medium | Low | E above |
| 9 | Admin console table migration (or live with mismatch) | Medium | Low | A1 above |
| 10 | `BuyPlanningGrid` — keep or build `<PlanningGrid>` | Medium | Low | A3 above |

---

## Quick reference — the new shared APIs that landed

```tsx
// SettingsRow — flex row with bg-card + border + p-3 chrome
<SettingsRow interactive>
  <span>Label</span>
  <Switch />
</SettingsRow>

// Card "interactive" variant — adds shadow lift on hover + cursor-pointer
<Card variant="interactive" onClick={...}>...</Card>

// AnimatedCount with formatter
<AnimatedCount value={n} format={(n) => `$${n.toLocaleString()}`} />

// KpiStatCard opt-in animated headline
<KpiStatCard
  label="Monthly Revenue"
  value=""
  animatedValue={287500}
  format={(n) => `$${n.toLocaleString()}`}
/>

// PageHeader now consumes the Breadcrumb primitive — no API change
<PageHeader breadcrumbs={[{label: 'Sell', href: '/sell'}, {label: 'CRM'}]} ... />
```
