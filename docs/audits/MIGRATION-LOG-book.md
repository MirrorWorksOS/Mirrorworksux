# Book — migration log

- **Date:** 2026-04-17
- **Branch:** `docs/audit-book`
- **Auditor:** Claude Code (batch worker)

## Classification rationale

All 14 files in `docs/modules/book/` were read. They are **Mixed**: each contains a short user-intent blurb ("User Intent", "Primary Actions", "Key UI Sections") alongside developer-oriented data (component imports, dependency lists, `Related Files` with repo paths).

Because the user-facing content is thin and incomplete while the dev content dominates, the dev shell was re-authored from scratch and the legacy docs were moved to `docs/user/modules/book/` verbatim (to preserve the UI section descriptions until the user audit rewrite lands).

## Moves (`git mv`)

| Source                                  | Destination                                    |
| --------------------------------------- | ---------------------------------------------- |
| `docs/modules/book/README.md`           | `docs/user/modules/book/README.md`             |
| `docs/modules/book/dashboard.md`        | `docs/user/modules/book/dashboard.md`          |
| `docs/modules/book/budget.md`           | `docs/user/modules/book/budget.md`             |
| `docs/modules/book/invoices.md`         | `docs/user/modules/book/invoices.md`           |
| `docs/modules/book/invoice-detail.md`   | `docs/user/modules/book/invoice-detail.md`     |
| `docs/modules/book/expenses.md`         | `docs/user/modules/book/expenses.md`           |
| `docs/modules/book/purchases.md`        | `docs/user/modules/book/purchases.md`          |
| `docs/modules/book/job-costs.md`        | `docs/user/modules/book/job-costs.md`          |
| `docs/modules/book/job-cost-detail.md`  | `docs/user/modules/book/job-cost-detail.md`    |
| `docs/modules/book/wip.md`              | `docs/user/modules/book/wip.md`                |
| `docs/modules/book/cost-variance.md`    | `docs/user/modules/book/cost-variance.md`      |
| `docs/modules/book/stock-valuation.md`  | `docs/user/modules/book/stock-valuation.md`    |
| `docs/modules/book/reports.md`          | `docs/user/modules/book/reports.md`            |
| `docs/modules/book/settings.md`         | `docs/user/modules/book/settings.md`           |

Source directory `docs/modules/book/` was removed (empty after `git mv`).

## New dev stubs (14)

- `docs/dev/modules/book/README.md`
- `docs/dev/modules/book/dashboard.md`
- `docs/dev/modules/book/budget.md`
- `docs/dev/modules/book/invoices.md`
- `docs/dev/modules/book/invoice-detail.md`
- `docs/dev/modules/book/expenses.md`
- `docs/dev/modules/book/purchases.md`
- `docs/dev/modules/book/job-costs.md`
- `docs/dev/modules/book/job-cost-detail.md`
- `docs/dev/modules/book/wip.md`
- `docs/dev/modules/book/cost-variance.md`
- `docs/dev/modules/book/stock-valuation.md`
- `docs/dev/modules/book/reports.md`
- `docs/dev/modules/book/settings.md`

Each dev stub links to the user doc, names the route and component, lists entity types and services, and flags known gaps (no React Query, missing tier gates, hard-coded detail pages).

## Audits

- `docs/audits/dev/AUDIT-book.md`
- `docs/audits/user/AUDIT-book.md`
- Screenshots: `docs/audits/screenshots/book/*.png` (12 routes)
