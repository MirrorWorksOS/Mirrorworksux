# Book — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **User-doc style:** UK English, Oxford comma, 2nd person, present tense, imperative mood.
- **Source docs:** `docs/user/modules/book/` (14 files, migrated from `docs/modules/book/`).
- **Screenshots:** `docs/audits/screenshots/book/*.png` (14 PNGs at 1440×900).
- **Companion dev audit:** `docs/audits/dev/AUDIT-book.md`
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-book.md`

## Completeness findings

1. No "Before you start" section anywhere in Book docs — users do not know which tier they need (Pilot/Produce/Expand/Excel) or which permission group grants access.
2. No imperative task topic exists for common Book flows. Missing titles: "Record an expense", "Approve a purchase order", "Match a bill to a PO", "Close a month", "Export a BAS report", "Reconcile a Xero payment".
3. No cross-references to Sell or Buy for overlapping screens. Users opening `/book/invoices` and `/sell/invoices` see similar UIs — docs never explain the difference ("Book is the finance lens, Sell is the sales lens").
4. No "Roles and permissions" table per page. `BookSettings.tsx` ships three default groups (Accounts Receivable, Accounts Payable, Expenses) — users have no written mapping of which group can do what.
5. No pricing/tier notes. WIP Valuation, Cost Variance, Stock Valuation are likely Expand+ only but no badge appears in docs or UI.
6. No worked examples. For a job-costing module, realistic numbers would teach shape faster than the current boilerplate "Review current records and execute available CTA actions".
7. No error-state guidance (e.g. "If Xero sync fails, check…"). The Xero Integration panel in `BookSettings.tsx` exists but is not explained.
8. No "Next steps" chaining between pages (e.g. expense → approval → payment → invoice → Xero).
9. No glossary. Finance terms like "WIP", "cost variance", "aged receivables", "BAS", "match status" are used without definition for non-accountant users.
10. No mobile/responsive callouts — relevant for shop-floor expense capture scenario.

## Accuracy findings

11. `docs/user/modules/book/README.md` lists 13 route entries. Actual routes are 13 operational pages plus the dashboard (14 screens total). Accurate count, but "Primary Users" description ("Finance users, operations finance leads, and business owners") violates the role vocabulary (admin/lead/team). Rewrite with allowed roles.
12. `docs/user/modules/book/dashboard.md` line 10 says "Get a fast Book status snapshot and drill into exceptions." — accurate in intent but no mention that KPIs come from `bookKpis` mock data and will show frozen numbers.
13. `docs/user/modules/book/invoice-detail.md` title says "INV-2026-0045 screen" — this is literal in the code but misleading to users. Any invoice ID passed in the URL currently shows the same page (see dev audit P0).
14. `docs/user/modules/book/job-cost-detail.md` behaves the same — docs imply dynamic behaviour the code does not deliver.
15. `docs/user/modules/book/expenses.md` says "Primary Actions: Create or add records/items" but `NewExpense.tsx` is a sheet triggered by a button not documented here; no walkthrough of the fields (vendor search, category, job link, receipt upload).
16. `docs/user/modules/book/purchases.md` mentions "match: green/yellow/grey" via the code but doc does not explain what "match" means (3-way PO/receipt/bill match).
17. `docs/user/modules/book/reports.md` lists "Aggregated reporting views and exportable analysis slices" but none of the export buttons actually work — doc should caveat.
18. `docs/user/modules/book/settings.md` lists panels loosely; the real 5 panels are: General, Invoicing, Xero Integration, Reports, Access & Permissions. Doc should name them and explain each.
19. `docs/user/modules/book/stock-valuation.md` "Data Shown: Product/material/BOM and inventory planning records" — BOM is a stretch; page shows raw materials + WIP + finished goods donut plus a raw materials table only.
20. `docs/user/modules/book/wip.md` "Complete wip valuation work and move records to the next stage" — there is no stage progression on this page; it is a read-only report.

## Consistency findings

21. `docs/user/modules/book/invoices.md` and `docs/user/modules/sell/invoices.md` are near-identical in structure. Because both read from the same `sellInvoices` pool, users will see overlapping data. Add a "What's different in Book" section and link both ways.
22. Tone varies: some pages use "Complete <module> work and move records to the next stage" (passive stub), others write actual user-value sentences. Unify to 1-sentence imperative intent per page.
23. Heading casing is inconsistent — "WIP Valuation" vs "Wip Valuation" vs "WIP valuation" appear in sidebar, doc title, and page header respectively. Agree on "WIP Valuation".
24. Status vocab varies across pages: invoices use `draft/sent/viewed/partiallyPaid/paid/overdue/cancelled`, POs use `Draft/Sent/Acknowledged/Partial/Received/Cancelled`, expenses use `draft/submitted/approved/paid`. Docs do not surface the per-entity status vocabulary.
25. Currency rendering mixes `$` and `AUD` — `BookWipValuation.tsx` uses `en-AU` / AUD; `BookInvoices` and `ReportsGallery` use `$` with `toLocaleString('en-US')`. Docs should not present conflicting formats.

## Style findings

26. American spelling in doc sections: "Behavior", "color" — swap to "Behaviour", "colour".
27. Boilerplate "User Intent: Complete <x> work and move records to the next stage" is not imperative user-facing guidance. Rewrite as imperative headings: "Record an expense", "Investigate a variance", "Close a month".
28. No marketing verbs from the flag list were found — positive.
29. No emojis found — positive.
30. No mentions of Supabase/Convex/WorkOS/Resend/React/Zustand — positive.
31. "Con-form Group" appears in mock data (`JobProfitability.tsx` L42, L55) — a former customer reference; scrub before publishing public screenshots.
32. 3D is never used as a differentiator — positive.
33. Job numbers (`JOB-2026-0012`) and invoice numbers (`INV-2026-0045`) come from mocks — fine in user docs as examples but should be marked as samples.

## Visual findings (cross-ref `docs/audits/screenshots/book/`)

34. `book-dashboard.png`: ModuleQuickNav tiles and KPI row read well; yellow KPI tile for Monthly Revenue has correct dark text.
35. `book-budget.png`: 3 donut charts + monthly bar + budget table — good density. Doc missing worked example like "A $74k/month department budget trending +12% over".
36. `book-invoices.png`: derived invoice list with customer avatars. Doc should call out the Sell-vs-Book difference.
37. `book-invoice-detail.png`: static `INV-2026-0045` with line items. Doc must either say "Sample invoice" or the detail bug must be fixed before user docs describe dynamic behaviour.
38. `book-expenses.png`: Kanban with 4 columns, totals summed per column. Doc should walk through creating an expense via the `NewExpense` sheet (fields visible in `NewExpense.tsx` L43-126).
39. `book-purchases.png`: match icons for 3-way match are shown but not explained in doc.
40. `book-job-costs.png`: margin bar chart and a bubble scatter — doc does not describe axes or bubble meaning (x = job value, y = margin %, size = unknown).
41. `book-job-cost-detail.png`: materials/labour tables with "Auto-captured" labels — doc doesn't explain that labour rows come from shop-floor scans.
42. `book-wip.png`: nearly empty at first paint (service fetch not yet resolved). User docs need a loading-state note or the code needs a skeleton.
43. `book-cost-variance.png`: same empty-at-first-paint issue.
44. `book-stock-valuation.png`: donut + table readable; age categories (Fresh/Active/Slow/Stale) not defined in doc.
45. `book-reports.png`: 6 Xero + 6 MW report cards; none wired. Docs should mark each as "Coming soon" until backend exists.
46. `book-settings.png`: tabs are General / Invoicing / Xero / Reports / Access. Doc does not match this structure.

## Gaps and recommendations

### P0 (blocking)

- Rewrite `docs/user/modules/book/README.md` with: (a) tier ladder per page, (b) role/group mapping, (c) glossary of finance terms, (d) cross-ref to Sell invoices.
- Rewrite `docs/user/modules/book/invoice-detail.md` and `job-cost-detail.md` so they do not mislead users about dynamic routing (caveat clearly until the code fix lands — see dev audit P0).
- Write missing task topics: "Record an expense", "Approve a purchase order", "Match a bill to a PO", "Close a period", "Reconcile a Xero invoice", "Investigate a cost variance", "Export a BAS report".

### P1 (should fix before launch)

- Replace every "Complete <x> work and move records to the next stage" with a concrete imperative intent sentence per page.
- Add realistic worked example to every page (e.g. "JOB-2026-0012 Con-form Custom Handrail — quoted $18.5k, actual $14.23k, margin 23.1%").
- Add "Who can do this" table per page mapping the three default groups (AR / AP / Expenses) to actions.
- Add tier badges to every page header.
- Document the PO match status (green/yellow/grey) and the 3-way match concept in `purchases.md`.
- Document the expense kanban stages (Draft/Submitted/Approved/Paid) and what triggers each transition.
- Document the age categories on Stock Valuation (Fresh/Active/Slow/Stale) and what counts as each.
- Document the 5 Book Settings panels individually.
- Add a "What's next" chaining block to every page (e.g. expenses → approvals → payments).
- Add error-state guidance for Xero sync failures.

### P2 (nice to have)

- Mobile/responsive tips for expense capture on the shop floor.
- Sample PDF of a completed invoice for copy-paste of layout/wording.
- Short GIFs or a screen-flow diagram per workflow (expense → PO → bill → invoice → report).
- Glossary page (`docs/user/modules/book/glossary.md`) for WIP, cost variance, BAS, aged receivables/payables, 3-way match, accruals.
- "Frequently asked" callouts (e.g. "Why do my Book and Sell invoice totals differ?" — they shouldn't, but see dedupe task in dev audit).
