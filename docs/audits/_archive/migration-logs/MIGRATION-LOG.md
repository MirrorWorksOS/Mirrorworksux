# MirrorWorks documentation migration log

Consolidated across 9 planned module audits on 2026-04-18. Per-module logs live on each module's PR branch under `docs/audits/MIGRATION-LOG-{module}.md`.

## Coverage gap

**7 of 9 sibling branches were available on `origin` at consolidation time.** The two missing modules are flagged below; every downstream summary (`AUDIT-SUMMARY-DEV.md`, `AUDIT-SUMMARY-USER.md`) carries the same caveat.

| Module | Branch present on origin? | Notes |
|--------|---------------------------|-------|
| Sell | **No** | Branch `docs/audit-sell` did not appear on origin within the 60-minute wait window. An earlier commit on `docs/audit-ship` carried sell artefacts but the canonical sell branch was never published. |
| Plan | Yes (`docs/audit-plan`) | 20 files migrated. |
| Make | Yes (`docs/audit-make-worker`) | 13 files migrated. Branch named `audit-make-worker` rather than `audit-make`. |
| Ship | Yes (`docs/audit-ship`) | 12 files migrated. |
| Book | Yes (`docs/audit-book`) | 14 files migrated. |
| Buy | Yes (`docs/audit-buy`) | 20 files migrated. |
| Control | **No** | Branch `docs/audit-control` did not appear on origin within the 60-minute wait window. |
| Bridge | Yes (`docs/audit-bridge`) | 1 file migrated (from `docs/modules/platform/`). |
| Shop Floor | Yes (`docs/audit-shop-floor`) | 2 files migrated (from `docs/modules/platform/`). |

Until the Sell and Control sibling PRs land, treat their cross-module findings below as carried forward from code-read assumptions rather than a first-party audit.

## Status by module

| Module | Branch | Files migrated | Dev stubs created | Log |
|--------|--------|----------------|-------------------|-----|
| Sell | docs/audit-sell *(missing)* | 19 (per earlier commit on `docs/audit-ship`) | unverified | [MIGRATION-LOG-sell.md](./MIGRATION-LOG-sell.md) *(not consolidated here)* |
| Plan | docs/audit-plan | 20 | 20 | [MIGRATION-LOG-plan.md](./MIGRATION-LOG-plan.md) |
| Make | docs/audit-make-worker | 13 | 13 (moved, not stubbed) | [MIGRATION-LOG-make.md](./MIGRATION-LOG-make.md) |
| Ship | docs/audit-ship | 12 | 11 stubs + 1 README | [MIGRATION-LOG-ship.md](./MIGRATION-LOG-ship.md) |
| Book | docs/audit-book | 14 | 14 (authored, not stubbed) | [MIGRATION-LOG-book.md](./MIGRATION-LOG-book.md) |
| Buy | docs/audit-buy | 20 | 19 stubs + 1 user README | [MIGRATION-LOG-buy.md](./MIGRATION-LOG-buy.md) |
| Control | docs/audit-control *(missing)* | — | — | [MIGRATION-LOG-control.md](./MIGRATION-LOG-control.md) *(not consolidated here)* |
| Bridge | docs/audit-bridge | 1 | 1 | [MIGRATION-LOG-bridge.md](./MIGRATION-LOG-bridge.md) |
| Shop Floor | docs/audit-shop-floor | 2 | 2 stubs | [MIGRATION-LOG-shop-floor.md](./MIGRATION-LOG-shop-floor.md) |

## Consolidated migration table

This concatenates the per-module tables with a leading **Module** column. Source rows come from each sibling branch's `MIGRATION-LOG-{module}.md`.

| Module | Old path | New path | Classification |
|--------|----------|----------|----------------|
| Book | docs/modules/book/README.md | docs/user/modules/book/README.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/dashboard.md | docs/user/modules/book/dashboard.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/budget.md | docs/user/modules/book/budget.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/invoices.md | docs/user/modules/book/invoices.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/invoice-detail.md | docs/user/modules/book/invoice-detail.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/expenses.md | docs/user/modules/book/expenses.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/purchases.md | docs/user/modules/book/purchases.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/job-costs.md | docs/user/modules/book/job-costs.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/job-cost-detail.md | docs/user/modules/book/job-cost-detail.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/wip.md | docs/user/modules/book/wip.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/cost-variance.md | docs/user/modules/book/cost-variance.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/stock-valuation.md | docs/user/modules/book/stock-valuation.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/reports.md | docs/user/modules/book/reports.md | Mixed → user + fresh dev stub |
| Book | docs/modules/book/settings.md | docs/user/modules/book/settings.md | Mixed → user + fresh dev stub |
| Bridge | docs/modules/platform/bridge-wizard.md | docs/dev/modules/bridge/bridge-wizard.md | Developer |
| Buy | docs/modules/buy/README.md | docs/user/modules/buy/README.md | User |
| Buy | docs/modules/buy/dashboard.md | docs/user/modules/buy/dashboard.md | Mixed + dev stub |
| Buy | docs/modules/buy/orders.md | docs/user/modules/buy/orders.md | Mixed + dev stub |
| Buy | docs/modules/buy/order-detail.md | docs/user/modules/buy/order-detail.md | Mixed + dev stub |
| Buy | docs/modules/buy/requisitions.md | docs/user/modules/buy/requisitions.md | Mixed + dev stub |
| Buy | docs/modules/buy/requisition-detail.md | docs/user/modules/buy/requisition-detail.md | Mixed + dev stub |
| Buy | docs/modules/buy/receipts.md | docs/user/modules/buy/receipts.md | Mixed + dev stub |
| Buy | docs/modules/buy/suppliers.md | docs/user/modules/buy/suppliers.md | Mixed + dev stub |
| Buy | docs/modules/buy/supplier-detail.md | docs/user/modules/buy/supplier-detail.md | Mixed + dev stub |
| Buy | docs/modules/buy/rfqs.md | docs/user/modules/buy/rfqs.md | Mixed + dev stub |
| Buy | docs/modules/buy/bills.md | docs/user/modules/buy/bills.md | Mixed + dev stub |
| Buy | docs/modules/buy/products.md | docs/user/modules/buy/products.md | Mixed + dev stub |
| Buy | docs/modules/buy/product-detail.md | docs/user/modules/buy/product-detail.md | Mixed + dev stub |
| Buy | docs/modules/buy/agreements.md | docs/user/modules/buy/agreements.md | Mixed + dev stub |
| Buy | docs/modules/buy/mrp-suggestions.md | docs/user/modules/buy/mrp-suggestions.md | Mixed + dev stub |
| Buy | docs/modules/buy/planning-grid.md | docs/user/modules/buy/planning-grid.md | Mixed + dev stub |
| Buy | docs/modules/buy/vendor-comparison.md | docs/user/modules/buy/vendor-comparison.md | Mixed + dev stub |
| Buy | docs/modules/buy/reorder-rules.md | docs/user/modules/buy/reorder-rules.md | Mixed + dev stub |
| Buy | docs/modules/buy/reports.md | docs/user/modules/buy/reports.md | Mixed + dev stub |
| Buy | docs/modules/buy/settings.md | docs/user/modules/buy/settings.md | Mixed + dev stub |
| Make | docs/modules/make/README.md | docs/dev/modules/make/README.md | Developer |
| Make | docs/modules/make/dashboard.md | docs/dev/modules/make/dashboard.md | Developer |
| Make | docs/modules/make/manufacturing-orders.md | docs/dev/modules/make/manufacturing-orders.md | Developer |
| Make | docs/modules/make/manufacturing-order-detail.md | docs/dev/modules/make/manufacturing-order-detail.md | Developer |
| Make | docs/modules/make/job-traveler.md | docs/dev/modules/make/job-traveler.md | Developer |
| Make | docs/modules/make/quality.md | docs/dev/modules/make/quality.md | Developer |
| Make | docs/modules/make/scrap-analysis.md | docs/dev/modules/make/scrap-analysis.md | Developer |
| Make | docs/modules/make/capa.md | docs/dev/modules/make/capa.md | Developer |
| Make | docs/modules/make/schedule.md | docs/dev/modules/make/schedule.md | Developer |
| Make | docs/modules/make/products.md | docs/dev/modules/make/products.md | Developer |
| Make | docs/modules/make/product-detail.md | docs/dev/modules/make/product-detail.md | Developer |
| Make | docs/modules/make/shop-floor.md | docs/dev/modules/make/shop-floor.md | Developer |
| Make | docs/modules/make/settings.md | docs/dev/modules/make/settings.md | Developer |
| Plan | docs/modules/plan/README.md | docs/user/modules/plan/README.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/dashboard.md | docs/user/modules/plan/dashboard.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/jobs.md | docs/user/modules/plan/jobs.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/job-detail.md | docs/user/modules/plan/job-detail.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/schedule.md | docs/user/modules/plan/schedule.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/product-studio.md | docs/user/modules/plan/product-studio.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/product-studio-product.md | docs/user/modules/plan/product-studio-product.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/product-studio-legacy.md | docs/user/modules/plan/product-studio-legacy.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/product-studio-legacy-product.md | docs/user/modules/plan/product-studio-legacy-product.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/libraries.md | docs/user/modules/plan/libraries.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/nesting.md | docs/user/modules/plan/nesting.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/machine-io.md | docs/user/modules/plan/machine-io.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/product-detail.md | docs/user/modules/plan/product-detail.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/products.md | docs/user/modules/plan/products.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/purchase.md | docs/user/modules/plan/purchase.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/qc-planning.md | docs/user/modules/plan/qc-planning.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/what-if.md | docs/user/modules/plan/what-if.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/mrp.md | docs/user/modules/plan/mrp.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/sheet-calculator.md | docs/user/modules/plan/sheet-calculator.md (+ dev stub) | Mixed |
| Plan | docs/modules/plan/settings.md | docs/user/modules/plan/settings.md (+ dev stub) | Mixed |
| Ship | docs/modules/ship/README.md | docs/user/modules/ship/README.md | User |
| Ship | docs/modules/ship/dashboard.md | docs/user/modules/ship/dashboard.md | Mixed + dev stub |
| Ship | docs/modules/ship/orders.md | docs/user/modules/ship/orders.md | Mixed + dev stub |
| Ship | docs/modules/ship/packaging.md | docs/user/modules/ship/packaging.md | Mixed + dev stub |
| Ship | docs/modules/ship/shipping.md | docs/user/modules/ship/shipping.md | Mixed + dev stub |
| Ship | docs/modules/ship/tracking.md | docs/user/modules/ship/tracking.md | Mixed + dev stub |
| Ship | docs/modules/ship/returns.md | docs/user/modules/ship/returns.md | Mixed + dev stub |
| Ship | docs/modules/ship/warehouse.md | docs/user/modules/ship/warehouse.md | Mixed + dev stub |
| Ship | docs/modules/ship/scan-to-ship.md | docs/user/modules/ship/scan-to-ship.md | Mixed + dev stub |
| Ship | docs/modules/ship/carrier-rates.md | docs/user/modules/ship/carrier-rates.md | Mixed + dev stub |
| Ship | docs/modules/ship/reports.md | docs/user/modules/ship/reports.md | Mixed + dev stub |
| Ship | docs/modules/ship/settings.md | docs/user/modules/ship/settings.md | Mixed + dev stub |
| Shop Floor | docs/modules/platform/floor-home.md | docs/user/modules/shop-floor/floor-home.md | Mixed → user + dev stub |
| Shop Floor | docs/modules/platform/floor-run.md | docs/user/modules/shop-floor/floor-run.md | Mixed → user + dev stub |

## Leftover files in `docs/modules/platform/`

After Bridge and Shop Floor pulled their content out, the following files remain in `docs/modules/platform/` and are **not yet re-homed**:

| File | Recommended destination | Rationale |
|------|-------------------------|-----------|
| `docs/modules/platform/README.md` | `docs/dev/platform/README.md` (index), optionally mirror a user-facing platform intro | Section landing page. |
| `docs/modules/platform/dashboard-alias.md` | `docs/dev/platform/dashboard-alias.md` | Dev-only routing/alias note. |
| `docs/modules/platform/notifications.md` | Split: user copy to `docs/user/platform/notifications.md`, dev surface (`notificationStore`) to `docs/dev/platform/notifications.md` | Cross-cutting notification stack; mixed. |
| `docs/modules/platform/welcome-dashboard.md` | `docs/user/platform/welcome-dashboard.md` | End-user onboarding landing page. |

**Action:** spawn a follow-up task to audit `docs/modules/platform/` the same way. Bridge and Shop Floor have already claimed their pieces; the residual is small and should not block launch.

## Files NOT migrated by any worker

The consolidation worker could not inspect two sibling branches (Sell and Control did not publish to origin). The following source directories remain unverified:

- `docs/modules/sell/` — **Sell audit branch missing.** An earlier commit on `docs/audit-ship` (since rewritten) suggested 19 files migrated to `docs/user/modules/sell/`, but the canonical sell audit PR never surfaced. Treat as provisional until a sell branch lands.
- `docs/modules/control/` — **Control audit branch missing.** 20 source files in `docs/modules/control/` remain un-audited in this pass. Particularly important because `ControlRoleDesigner` was removed (commit `f6771df1`) and the existing `docs/modules/control/role-designer.md` is a deprecated-pattern candidate that needs explicit retirement.

Spawn a follow-up audit pair for Sell and Control before the next consolidation pass.

## Related

- Cross-module dev summary: [AUDIT-SUMMARY-DEV.md](./AUDIT-SUMMARY-DEV.md)
- Cross-module user summary: [AUDIT-SUMMARY-USER.md](./AUDIT-SUMMARY-USER.md)
