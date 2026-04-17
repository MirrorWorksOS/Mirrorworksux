# Book — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — `apps/web/src/guidelines/specs/` contains Buy, Control, Plan, Ship 04 screen-by-screen docs, but no `Book-04-Screen-by-Screen.md`. See P0 finding.
  - Code: `apps/web/src/components/book/` (16 files)
  - Routes: `apps/web/src/routes.tsx` — `/book/*` (lines 442-460)
  - Service facade: `apps/web/src/services/bookService.ts`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` (§4.7 group model)
  - Confluence PLAT: referenced by `BudgetOverview.tsx` comment "Matches BOOK 04 specification from Confluence", not fetched.
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-book.md`

## Completeness findings

1. No `docs/dev/modules/book/README.md` existed before this pass. The former `docs/modules/book/README.md` was user-slanted and did not list the service facade, entity types, Zustand stores, or React Query keys — now supplied via new dev stubs.
2. `apps/web/src/components/book/Book.tsx` is not documented anywhere and is not referenced by `routes.tsx`. It is an orphan component.
3. `apps/web/src/components/book/InvoiceList.tsx` is similarly orphan — `routes.tsx` binds `/book/invoices` to `BookInvoices.tsx`, not `InvoiceList.tsx`. Old doc listed only `BookInvoices.tsx` and never explained `InvoiceList.tsx` exists.
4. `apps/web/src/components/book/NewExpense.tsx` is used as a sheet from `ExpenseKanban.tsx` but was never listed as a standalone component doc. Dev stub for expenses now names it.
5. No documentation covered the `bookService` facade (`getInvoices`, `getExpenses`, `getBills`, `getJobCosts`, `getJobCostById`, `getJobCostByJobId`, `getKpis`, `getApprovalQueue`, `getOverdueItems`, `getWipValuations`, `getCostVariance`). All 11 service methods are now listed in `docs/dev/modules/book/README.md`.
6. Entity types relevant to Book (`SellInvoice`, `Expense`, `Bill`, `JobCost`, `WipValuation`, `CostVarianceRecord`, `KpiMetric`, `ApprovalItem`, `OverdueItem`) live in `apps/web/src/types/entities.ts`. Former docs only hinted via "shared mocks/services/stores" — exact contract shape was undocumented.
7. No React Query keys exist for Book (every wired page uses `useEffect` + `useState` — see `BookWipValuation.tsx` L39 and `BookCostVariance.tsx`). Docs must flag this as a known architectural gap.
8. No Zustand stores exist for Book; former README implied otherwise ("Stores/services used by this module live mainly under `apps/web/src/store`"). This was misleading.
9. Tier gating: `routes.tsx` does NOT gate any `/book/*` route by tier. Sidebar entries at `apps/web/src/components/Sidebar.tsx` L309-340 also do not set a tier prop on Book items. WIP, Cost Variance, and Stock Valuation should be Expand+ per the rubric; Reports P&L should be Produce+.
10. `invoice-detail.md` and `job-cost-detail.md` user docs both describe dynamic routes, but the components do **not** read `useParams().id`. `InvoiceDetail.tsx` L46 hard-codes `INV-2026-0045`; `JobCostDetail.tsx` uses static `costBreakdown` with JOB-2026-0012 scoped data. This was not flagged in old docs.
11. No migration TODOs file exists for Book — specifically the Supabase→Convex move for `bookService` is unflagged.
12. Testing coverage: no Book test files exist under `apps/web/src/components/book/` or a parallel `__tests__`. Former docs did not name this gap.
13. Permission model (ARCH 00 §4.7) was implemented in `BookSettings.tsx` L29-85 but the docs never listed the 7 permission keys or 3 default groups.

## Accuracy findings

14. Former `docs/modules/book/README.md` line 30 said "Entity shapes are defined by routed pages and shared mocks/services/stores" — this is vague and partially wrong. Actual contract types are centralised in `apps/web/src/types/entities.ts`; mocks live in `apps/web/src/services/mock/data.ts`.
15. Former README line 48 claimed "Local React state and shared UI components are primary dependencies" — inaccurate for WIP and Cost Variance pages which do call `bookService`. Wired vs unwired status should be listed per-page.
16. Former README "Open Issues" entry for `/book/reports` mentioned "action feedback often toast-driven" — accurate but incomplete. All 6 report action buttons in `ReportsGallery.tsx` are toast-only with no backend call.
17. Former README listed `ExpenseKanban.tsx` but the route path uses `/book/expenses`; the user-facing module name "Expenses" comes from the component title, not the file name. Doc did not clarify.
18. Former `budget.md` listed "Form controls for editing/creation" — not true; `BudgetOverview.tsx` is read-only today (filter toolbar only, no create modal).
19. Former `invoices.md` listed filenames `BookInvoices.tsx` correctly but did not note the derivation path: rows come from `sellInvoices.map(...)` + 2 hard-coded extras (`BookInvoices.tsx` L38-74).
20. Former `invoice-detail.md` was titled from the hard-coded string `INV-2026-0045` — which is documented as a "dynamic detail route" but the component proves otherwise (no `useParams`).
21. Former `settings.md` said "Configuration settings, rules, and system behavior controls" — missed that this page implements ARCH 00 §4.7 group-permission UI explicitly (5 panels: General, Invoicing, Xero Integration, Reports, Access & Permissions).
22. Former `reports.md` listed dependencies correctly but did not mention the static `xeroReports` / `mwReports` / `scheduled` arrays in `ReportsGallery.tsx` L13-35 — no backend CRUD exists.

## Consistency findings

23. `BookInvoices.tsx` and `SellInvoices.tsx` both render the `sellInvoices` pool with similar columns. Old Book docs did not mention this duplication; Sell docs at `docs/user/modules/sell/invoices.md` are a near-verbatim structural copy of the Book equivalent. Consolidation recommendation needed.
24. `PurchaseOrders.tsx` (Book) overlaps conceptually with Buy module PO surfaces (not audited here). `POStatus` type differs between Book local definition (`Draft | Sent | Acknowledged | Partial | Received | Cancelled`) and whatever Buy uses — risk of divergence.
25. Book sidebar groups at `Sidebar.tsx` L309-340 use categories "Transactions", "Costing", "Insights" (inferred from order) but these groupings are not documented anywhere.
26. Route helper names `appRoutes.bookInvoices()` and `appRoutes.bookJobCosts()` (referenced `routes.tsx` L181, L190) are not listed in user or dev docs.
27. The mock dataset naming is inconsistent: `bookKpis` vs `bookApprovalQueue` vs `bookOverdueItems` in `services/index.ts` — `book` prefix is applied ad-hoc; other modules use namespaced objects.

## Style findings

28. Former `docs/modules/book/*.md` files all use American spelling in places (e.g. "Behavior", "utilization", "color" in the code comments) while the UK English + Oxford-comma rubric requires "behaviour", "utilisation", "colour". `BudgetOverview.tsx` source does already use `utilisation`/`colour` (L55, L84-90) — docs should match.
29. Several former doc sections used the boilerplate "Review current records and execute available CTA actions" — not imperative, not useful. Replace with concrete verbs.
30. No marketing verbs from the flag list (leverage/seamless/streamline/empower/unlock/unleash/game-changer) were found in Book docs or source — positive.
31. No emojis found in the former docs or source — positive.
32. No mentions of Supabase/Convex/WorkOS/Resend/Zustand/React in the user-visible doc text — positive. `bookService.ts` header does say "Replace the mock implementation with a remote adapter when Convex is ready" — internal only, acceptable.

## Visual findings

Screenshots: `docs/audits/screenshots/book/` (14 PNGs, 102-176 KB each at 1440×900).

33. `book-dashboard.png` shows KPI row using MW Yellow tile for `Monthly Revenue` — correct, dark text on yellow per memory rule.
34. `book-invoices.png` shows the derived invoice list with 2 extra hard-coded rows (INV-2026-0237 Climate Systems, INV-2026-0238 Construction Pro). Dev doc now mentions.
35. `book-invoice-detail.png` shows the static `INV-2026-0045` page — confirms the param-ignorance bug.
36. `book-expenses.png` shows the Kanban board with 4 columns (Draft/Submitted/Approved/Paid); column totals compute correctly.
37. `book-purchases.png` shows the PO table with match-status icons (green/yellow/grey) — good visualisation, not documented.
38. `book-job-costs.png` shows profitability charts — the scatter plot uses a bubble size field (`z`) that is nowhere documented.
39. `book-job-cost-detail.png` includes an `AIInsightCard` that was only barely mentioned in old doc — surface more prominently.
40. `book-wip.png` and `book-cost-variance.png` both render empty/minimal because `bookService` mock data arrives after mount and no loading state is shown — flag UX issue.
41. `book-reports.png` shows 6 Xero + 6 MW report cards plus scheduled table — none of these actions are wired to backend.
42. `book-settings.png` shows the permissions tab with default groups — the UI matches ARCH 00 §4.7 group model.

## Gaps and recommendations

### P0 (blocking)

- **Missing Book spec doc.** `apps/web/src/guidelines/specs/` has Buy/Control/Plan/Ship but NO `Book-04-Screen-by-Screen.md`. `BudgetOverview.tsx` L3 asserts compliance with a spec that is not in the repo. Fetch from Confluence and commit, or write from code as a source-of-truth placeholder. (rubric: "No `.docx` spec → P0")
- **Detail routes do not read `:id`.** `/book/invoices/:id` and `/book/job-costs/:id` both render hard-coded IDs regardless of URL. Any bookmark or deep link is broken. Add `useParams()` and `bookService.getInvoiceById` / `getJobCostById`.

### P1 (should fix before launch)

- No `apps/web/src/lib/services/` tree exists (rubric: "No `src/lib/services/` → P1 in dev"). `bookService.ts` lives at `apps/web/src/services/bookService.ts` only. Decide on canonical location.
- Tier gates are absent on every `/book/*` route. At minimum: WIP, Cost Variance, Stock Valuation gated Expand+; Reports P&L gated Produce+.
- Invoices overlap: deduplicate `BookInvoices.tsx` vs `SellInvoices.tsx` by extracting a shared `InvoiceTable` primitive and switching column sets by module.
- Purchase Orders overlap with Buy — align `POStatus` and service source.
- React Query migration: replace the 2 wired pages (`BookWipValuation`, `BookCostVariance`) with `useQuery(['book','wip'])` / `['book','cost-variance']`, then migrate the other 12 pages off in-component mocks.
- Loading and error states missing on WIP and Cost Variance — renders blank until network settles.
- `ReportsGallery.tsx` has 6+ toast-only buttons — either hide until Xero OAuth is wired or implement stubs returning `501`.
- `NewExpense.tsx` and `ExpenseKanban.tsx` drag transitions are not persisted — no mutation is called on drop.
- `super_admin` role is not handled by `BookSettings.tsx` permission editor. Per memory `arch00_frontend_gaps`, this is a known wider-scope gap.
- No Book test coverage. Add smoke tests for dashboard + at least one wired service path.

### P2 (nice to have)

- Orphan components (`Book.tsx`, `InvoiceList.tsx`) — delete or wire into routes.
- `JobProfitability.tsx` scatter plot bubble size (`z`) needs a legend label.
- Budget list page could use a create modal (currently read-only).
- Document the sidebar grouping labels (Transactions / Costing / Insights / etc.) in a shared doc.
- Standardise mock export naming in `services/index.ts` — consider a single `bookMocks` namespace.
- Add `appRoutes.bookBudget()`, `appRoutes.bookExpenses()`, etc. helpers for parity with invoices/job-costs.
- Move `Budget` interface from `BudgetOverview.tsx` into `apps/web/src/types/entities.ts`.
