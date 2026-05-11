# Book module — filter / search / view UX audit

Scope: `apps/web/src/components/book/**`. Research only, no code changes.
Reference: Odoo search UX — https://www.odoo.com/documentation/19.0/applications/essentials/search.html

## Cross-cutting findings

- The generic shared filter pop-over `ToolbarFilterButton.tsx:18` hard-codes statuses `All / Active / Draft / Completed` and a single date range. It is reused unmodified by `InvoiceList`, `ExpenseKanban`, and (via the bare `Filter` icon button) `BookInvoices`, `PurchaseOrders`, `JobProfitability`. None of those status values is meaningful for finance data (AR/AP, approval, reconciliation states).
- No screen exposes a **fiscal period selector** in the toolbar despite being a finance module. `BudgetOverview` only shows `period` as a column; `BookCostVariance`, `BookWipValuation`, `JobProfitability`, `StockValuation` have no visible period control (Stock has an "As at" button at `StockValuation.tsx:88` but no actual picker).
- No screen supports saved filter sets / personal presets / shared views. Tabs are hard-coded arrays (`BookInvoices.tsx:333`, `InvoiceList.tsx:47`, `PurchaseOrders.tsx:41`).
- Currency is single-implied-AUD everywhere — no multi-currency filter even though Xero mapping (`XeroMappingPage.tsx:422`) surfaces `BaseCurrency`.
- View-mode toggles only exist on `ExpenseKanban.tsx:178` (kanban / list, list mode is a no-op stub).

## Per-screen audit

### 1. BookInvoices.tsx / InvoiceList.tsx — AR list

**Current** (`BookInvoices.tsx:280-348`, `InvoiceList.tsx:138-176`)
- Search: invoice # + customer name (`BookInvoices.tsx:113`).
- Status pills: `All / Draft / Sent / Viewed / Paid / Overdue` (`BookInvoices.tsx:333`). `InvoiceList` adds `Cancelled` (`InvoiceList.tsx:47`).
- `Filter` button is a stub toast (`BookInvoices.tsx:300`) or generic popover with All/Active/Draft/Completed (`InvoiceList.tsx:162`).
- Summary bar: paid / pending / overdue (`BookInvoices.tsx:358`).
- View mode: list only.

**Irrelevant filters**
- Generic Active/Completed (AR uses draft/sent/viewed/paid/overdue, not "Active").
- "Viewed" is technically email-tracking, not a finance state — keep but separate.

**Recommended filters**
| Filter | Notes |
|---|---|
| Issue/Due-date range, fiscal period (MTD/QTD/YTD/last-30) | persistent in bar |
| Aging bucket | `0–30 / 31–60 / 61–90 / 90+` for unpaid balances |
| Customer | combobox; group "top 10 by balance" |
| Amount range | min/max + balance-due range |
| Currency | once multi-ccy lands |
| Reminder cadence | `Never reminded / 1× / 2× / 3+` |
| Job/SO reference | already a column — make it filterable |
| Salesperson / account owner | for follow-up triage |
| Xero sync state | `Synced / Pending / Error` |
| Has dispute / credit note | boolean |

**View modes (missing)**
- Aging-bucket pivot (customer × bucket).
- Calendar by due date for cash-flow forecast.
- Kanban by status for collections workflow (very natural here).
- Customer roll-up grouped view.

**Persistent date field** — yes, fiscal period selector + "as at" date.

**Presets** (3–5)
- Personal: *My customers — sent & unpaid*; *Drafts I need to send*.
- Shared: *Aged debtors > 60 days*; *Month-end close — unposted invoices*; *Top 20 by balance due*.

---

### 2. PurchaseOrders.tsx — AP / commitment list

**Current** (`PurchaseOrders.tsx:137-170`)
- Search box (no logic wired).
- Filter button — toast stub `PurchaseOrders.tsx:148`.
- Status pills: `All / Draft / Sent / Partial / Received / Cancelled` (`PurchaseOrders.tsx:41`).
- 3-way match column `match: green/yellow/grey` (`PurchaseOrders.tsx:46`) but not filterable.
- Summary bar by status.
- View: list only.

**Irrelevant filters** — generic `Active/Completed` from the shared popover.

**Recommended filters**
- 3-way match state: `Matched / Price variance / Qty variance / Unmatched` (data already exists).
- Supplier, supplier category, preferred-supplier flag.
- Order date + expected-delivery-date ranges; "overdue receipt" flag.
- Linked Job / cost centre / GL account.
- Approval status: `Pending / Approved / Rejected / Auto-approved` (PO threshold).
- Receipt status: `Not received / Partial / Fully received`.
- Bill-matched (has supplier invoice) yes/no.
- Currency, amount range, tax code.

**View modes (missing)**
- Kanban by approval state.
- Calendar by expected-delivery (procurement scheduling).
- Pivot: supplier × month spend.

**Persistent date field** — order-date period + due-date range.

**Presets**
- Personal: *POs I approved this week*.
- Shared: *3-way mismatches*; *Overdue receipts*; *POs above $10k pending approval*; *Bills not yet matched to PO*.

---

### 3. BookCostVariance.tsx

**Current** (`BookCostVariance.tsx:96-298`)
- No filter, no search, no period control, no view toggle.
- KPI row + grouped bar chart + expandable per-job table by category.

**Irrelevant filters** — n/a (none exist).

**Recommended filters**
- Period: month / quarter / FY / custom.
- Job status (active / complete / on-hold).
- Cost category (materials, labour, overhead, subcontract).
- Customer / department / cost centre.
- **Variance threshold**: `> 5% / > 10% / > 20%` and direction (over/under).
- Variance type: $ vs %.

**View modes (missing)**
- Pivot: category × job, category × month.
- Heatmap (job rows × category cols, variance %).
- Waterfall: budget → actual decomposition.
- Trend chart per category over time.

**Persistent date field** — yes, fiscal period.

**Presets**
- *Jobs over budget > 10%*; *Material variance only*; *This-quarter close*; *My department*; *Loss-makers*.

---

### 4. BookWipValuation.tsx

**Current** (`BookWipValuation.tsx:106-138`)
- No filter, no search, no period, no view toggle.
- Single KPI + flat table of jobs with % complete and WIP balance.

**Recommended filters**
- "As at" date (snapshot for balance sheet).
- Job status, customer, % complete band (0–25 / 25–50 / 50–75 / 75–100).
- WIP age (days since first cost posted) — over-aged WIP is an audit flag.
- Department / cost centre, project manager.
- Threshold: WIP balance > $X.

**View modes (missing)**
- Aging buckets (WIP > 30/60/90 days).
- Group by customer or department.
- Trend chart (WIP balance over time).

**Persistent date field** — "as at" date is mandatory for WIP (balance sheet item).

**Presets** — *Over-aged WIP (>90 days)*; *Top 10 WIP balances*; *WIP for closed jobs (audit risk)*.

---

### 5. StockValuation.tsx

**Current** (`StockValuation.tsx:75-186`)
- Costing-method `Select`: FIFO / LIFO / AVCO / Actual (`StockValuation.tsx:77`).
- "As at" button — no picker wired (`StockValuation.tsx:88`).
- Tabs: `Raw Materials / WIP / Finished Goods / Adjustments` (`StockValuation.tsx:66`).
- No search, no filter on the table; columns include `age` (Fresh/Active/Slow/Stale) but not filterable.

**Recommended filters**
- "As at" date (must be live).
- Age bucket: Fresh / Active / Slow / Stale (data already classified).
- Location / bay / store.
- Unit-cost or total-value range; quantity > 0.
- SKU prefix or material class (MS / SS / AL / consumables).
- Last-movement date range; "no movement in N days".
- Reorder status: `Below min / At min / Above max`.

**View modes (missing)**
- Pivot: location × material class.
- Slow-moving / dead-stock dashboard view.

**Persistent date field** — "As at" must be the live, visible control.

**Presets** — *Dead stock (>180 days)*; *Below reorder point*; *High-value rows (top 20)*.

---

### 6. JobProfitability.tsx

**Current** (`JobProfitability.tsx:101-114`)
- Three action buttons: Date range (stub), Export, Filter (icon, no popover).
- KPIs, two charts (margin bars, customer scatter), flat table.

**Recommended filters**
- Period / fiscal month / quarter.
- Margin band: `< 0% / 0–10% / 10–20% / 20–30% / 30%+` (data already classifies `marginToScalePercent`, `chart-theme.ts`).
- Job status (Complete / In Production / On Hold).
- Customer, product line, account manager.
- Revenue band; cost-overrun > $X.
- Job size (revenue brackets).

**View modes (missing)**
- Customer roll-up (aggregate margin per customer).
- Pivot: product × period.
- Top/bottom 10 toggle.

**Persistent date field** — yes, period selector (date-range button is currently a stub).

**Presets** — *Loss-makers this quarter*; *Top 10 margin*; *Jobs > $20k revenue*; *My customers*.

---

### 7. JobCostDetail.tsx

**Current** (`JobCostDetail.tsx:171, 277-308`)
- Tabs: `Materials / Labour / Overhead / Subcontract`.
- No search, no filter on transaction lines.

**Recommended filters** (per line tab)
- Date range within the job, supplier (materials), operator (labour), operation type, PO reference, status (`Auto-captured / Manual / Approved`), amount range.
- Variance vs budget line.

**View modes (missing)**
- Timeline by week (already partly in chart).
- Group materials by PO or supplier.

**Persistent date field** — job runtime window picker.

**Presets** — *Auto-captured this week*; *Anomalous price (>10% above last PO)*; *Subcontract not yet billed*.

---

### 8. ExpenseKanban.tsx

**Current** (`ExpenseKanban.tsx:170-189`)
- Search (no wiring).
- Generic filter popover (Active/Draft/Completed — wrong for expenses).
- View toggle stub `kanban / list` (list onChange is no-op `ExpenseKanban.tsx:180`).
- Kanban columns by approval state: `Draft / Submitted / Approved / Paid`.

**Recommended filters**
- Category (Materials, Utilities, Maintenance, Consumables, Subcontractor, Travel, Reimbursement).
- Employee / submitter.
- Job/cost-centre reference.
- Amount range; reimbursable yes/no; billable-to-customer yes/no.
- Payment method (Cash / Card / Bank / Petty Cash — values already in `NewExpense.tsx:103`).
- Tax inclusive/exclusive; GST claimable yes/no.
- Has receipt; OCR confidence (green/yellow/red).
- Possible duplicate flag (already detected `NewExpense.tsx:218`).
- Period.

**View modes**
- Kanban (have) + List (stub — implement).
- Pivot category × month; calendar by date.

**Persistent date field** — yes, expense date period.

**Presets** — *My approvals queue* (personal); *Awaiting receipts*; *Duplicates flagged*; *Reimbursables pending*; *Month-end accruals*.

---

### 9. BudgetOverview.tsx

**Current** (`BudgetOverview.tsx:399-429`)
- Pills `active / draft / closed` (`BudgetOverview.tsx:414`).
- "Type: All" button (stub, `BudgetOverview.tsx:400`).
- Sortable columns.
- No date/period selector, no search.

**Recommended filters**
- Type: Job / Department / Annual (already in data — wire the stub).
- Period selector (Q / FY / custom).
- Health: On-track / Monitor / Over budget / Draft (already classified `BudgetOverview.tsx:163`).
- Utilisation band: `< 50 / 50–80 / 80–100 / > 100`.
- Owner / department, variance > $X.

**View modes**
- Pivot: department × period.
- Burn-down chart per budget (small multiples).
- Tree view: Annual → Department → Job.

**Persistent date field** — fiscal period.

**Presets** — *At-risk (>80% utilised)*; *Over budget*; *My department*; *Q1 close review*.

---

### 10. ReportsGallery.tsx

**Current** (`ReportsGallery.tsx:79-141`)
- Two static grids (Xero / MW reports), no filter, no search.
- Scheduled table — no filter, no search.

**Recommended**
- Search by report name; tag filter (Finance / Ops / Tax / Sustainability).
- Scheduled list: filter by schedule cadence, owner, active/inactive, last-run-failed.

**Presets** — *My scheduled reports*; *Failed last run*; *Month-end pack*.

---

### 11. xero-mapping/

**Current** (`XeroMappingPage.tsx:445-518`) — already domain-specific (sections, status, required-unmapped badge, auto-map). Filters not needed at list level; `MappingRow`/`MappingSidebar` already provides progress + required flag.

**Recommended (minor)** — filter rows within a section by `Required only`, `Unmapped only`, `Has variance from default`. Search by source key/label.

---

## Smart / AI filter ideas (module-wide)

1. **"Invoices likely to be paid late"** — score by customer payment history, current aging vs DSO; surfaces on `BookInvoices`.
2. **"Jobs trending over budget"** — burn-rate × remaining work vs remaining budget; surfaces on `JobProfitability`, `BudgetOverview`, `BookCostVariance`.
3. **"Anomalous expenses vs prior period"** — vendor × category × month z-score; surfaces on `ExpenseKanban`.
4. **"POs at risk of late delivery"** — supplier on-time history × current lag; surfaces on `PurchaseOrders`.
5. **"Stock at risk of write-down"** — slow movers × inventory age × forecasted demand; surfaces on `StockValuation`.
6. **"Suspicious 3-way mismatches"** — clusters PO/receipt/bill discrepancies above a threshold for review.

## Quick-win priorities

1. Replace `ToolbarFilterButton` generic body with module-specific configs (status sets per screen).
2. Add a global toolbar `PeriodPicker` (month / quarter / FY / custom) shared by every Book screen.
3. Wire saved-view / preset infrastructure (personal + shared) — Odoo-style favourites.
4. Implement aging-bucket pivot for invoices, WIP, payables.
5. Make existing data filterable: `match` (PO), `age` (Stock), `status` health (Budget), `margin` band (JobProfitability) — all are already computed but not exposed as filter facets.
