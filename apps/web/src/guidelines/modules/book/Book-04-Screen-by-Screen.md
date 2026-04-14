# Book — §4 Screen-by-Screen Specification

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) — combined MirrorWorks module specification. **Book** module, **Section 4** (screen-by-screen). Text below was extracted from the PDF and structured per project guidelines.

| Reference | Path |
| --- | --- |
| Module spec (PDF) | [`../MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) |
| All §4 extracts (index) | [`README.md`](./README.md) |
| Prototype routes | [`PrototypeRouteMap.md#book`](./PrototypeRouteMap.md#book) · [`src/routes.tsx`](../../routes.tsx) |

**Status:** §4 content extracted from PDF into Purpose / Data / Actions / States. The PDF remains authoritative if wording diverges.

## Prototype mapping

Full route ↔ component list: **[`PrototypeRouteMap.md` — Book](PrototypeRouteMap.md#book)**.

---

## §4 Screens

## 4.1 Dashboard (/book/dashboard)
### Purpose
4.1.1 Overview (Bento Grid)
The dashboard overview uses a bento grid layout (DashboardPage component with
bentoVariant="bentoDashboard") with stat cards and chart components.
Layout: Bento grid, 3-column desktop, single column mobile. Identical pattern to Sell and Plan
dashboards.
KPI Stat Cards (top row):
Monthly Revenue: T otal invoiced amount for current month. Change vs previous month.
DollarSign icon.
Outstanding Invoices: Count of unpaid invoices. T otal value in subtitle. Receipt icon.
Profit Margin: Average job profit margin for current month. TrendingUp icon.
Cash Flow: Net invoiced minus expenses for current month. BarChart3 icon.
Overdue Invoices: Count and total value of overdue invoices. AlertTriangle icon. Error colour
(#DE350B) when > 0.
Expenses This Month: T otal approved expenses. Comparison to budget if set. CreditCard
icon.
Charts (middle row):
Revenue vs Expenses: Recharts area chart, 12-month view. MW Yellow for revenue, MW Earth
for expenses. Dual Y-axis.
Job Profitability: Recharts bar chart showing top 10 jobs by margin. Green for profitable (>
15%), yellow for marginal (5--15%), red for loss-making (< 5%).
Action Cards (bottom row):
Approval Queue: Count of expenses and POs awaiting approval. Click navigates to approval
view.
Xero Sync Status: Last sync timestamp, sync health indicator (green/yellow/red), quick sync
button.
MW-Book-Figma-
Prompts.md

Overdue Actions: Combined list of overdue invoices and unpaid vendor bills requiring
attention.
Data Sources: Aggregated from invoices, expenses, job_costs, and Xero API (P&L). Materialised
views refreshed every 5 minutes.

### Data
- See extract: data sources and entities described in body.
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.1.1 Overview (Bento Grid)
The dashboard overview uses a bento grid layout (DashboardPage component with
bentoVariant="bentoDashboard") with stat cards and chart components.
Layout: Bento grid, 3-column desktop, single column mobile. Identical pattern to Sell and Plan
dashboards.
KPI Stat Cards (top row):
Monthly Revenue: T otal invoiced amount for current month. Change vs previous month.
DollarSign icon.
Outstanding Invoices: Count of unpaid invoices. T otal value in subtitle. Receipt icon.
Profit Margin: Average job profit margin for current month. TrendingUp icon.
Cash Flow: Net invoiced minus expenses for current month. BarChart3 icon.
Overdue Invoices: Count and total value of overdue invoices. AlertTriangle icon. Error colour
(#DE350B) when > 0.
Expenses This Month: T otal approved expenses. Comparison to budget if set. CreditCard
icon.
Charts (middle row):
Revenue vs Expenses: Recharts area chart, 12-month view. MW Yellow for revenue, MW Earth
for expenses. Dual Y-axis.
Job Profitability: Recharts bar chart showing top 10 jobs by margin. Green for profitable (>
15%), yellow for marginal (5--15%), red for loss-making (< 5%).
Action Cards (bottom row):
Approval Queue: Count of expenses and POs awaiting approval. Click navigates to approval
view.
Xero Sync Status: Last sync timestamp, sync health indicator (green/yellow/red), quick sync
button.
MW-Book-Figma-
Prompts.md

Overdue Actions: Combined list of overdue invoices and unpaid vendor bills requiring
attention.
Data Sources: Aggregated from invoices, expenses, job_costs, and Xero API (P&L). Materialised
views refreshed every 5 minutes.
```

</details>

## 4.2 Invoices (/book/invoices)
### Purpose
4.2.1 Invoice List View
DataTable with tabs for All, Draft, Sent, Paid, Overdue, Cancelled. Standard toolbar with search,
filter, and "New Invoice" button (MW Yellow CTA).
Columns: Invoice #, Customer, Issue Date, Due Date, Status (Badge), T otal, Balance Due,
Actions (dropdown: View, Send, Download PDF, Record Payment, Void)
Status badges: Draft (grey), Sent (blue), Viewed (info), Partially Paid (warning), Paid (success),
Overdue (error), Cancelled (muted)
Filters: Status, Date range, Customer, Amount range, Payment terms, Job reference, Overdue
flag
Bulk actions: Send selected, Download PDFs, Export to Xero
4.2.2 Invoice Detail View
Full invoice preview with PDF-style layout. Header shows invoice number, status badge, and
action buttons (Send, Download, Record Payment, Void). Two-column layout: invoice preview on
left (60%), payment history and activity on right (40%).
Invoice preview panel:
Organisation logo and details (from organisation settings)
Customer billing and shipping addresses
Invoice metadata: number, issue date, due date, PO reference, job reference
Line items table: Product, Description, Qty, Unit Price, Discount, Tax, Line T otal
T otals: Subtotal, Tax, Shipping, T otal, Amount Paid, Balance Due
Notes and terms
Right panel:
Payment history: List of recorded payments with date, amount, method, reference
Email history: Sent/opened/clicked tracking
Activity log: Status changes, edits, Xero sync events

Xero link: Direct link to this invoice in Xero (opens in new tab)
4.2.3 New Invoice / Edit Invoice
Form view with customer selection (autocomplete), date pickers, line items table with inline
editing, and totals calculation. Pre-populates from sales order when created via Sell module
handoff.
Line item table: Same pattern as Sell quote builder. Product combobox, description, qty, unit
price, discount %, tax rate, line total. Add row button at bottom.
Tax handling: Jurisdiction-based defaults. Australia: GST 10%. Tax-inclusive or tax-exclusive
toggle per invoice. Line-item-level tax rate override.
Xero account code: Each line item maps to a Xero account code via the product's default
account or manual selection. Required for Xero sync.
4.2.4 Invoice States & Workflow
Invoice status transitions follow strict rules enforced at the database level:
Draft → Sent (user action: Send)
Sent → Viewed (automatic: email open tracking)
Sent/Viewed → Partially Paid (payment recorded, balance > 0)
Sent/Viewed/Partially Paid → Paid (payment recorded, balance …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including edit (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.2.1 Invoice List View
DataTable with tabs for All, Draft, Sent, Paid, Overdue, Cancelled. Standard toolbar with search,
filter, and "New Invoice" button (MW Yellow CTA).
Columns: Invoice #, Customer, Issue Date, Due Date, Status (Badge), T otal, Balance Due,
Actions (dropdown: View, Send, Download PDF, Record Payment, Void)
Status badges: Draft (grey), Sent (blue), Viewed (info), Partially Paid (warning), Paid (success),
Overdue (error), Cancelled (muted)
Filters: Status, Date range, Customer, Amount range, Payment terms, Job reference, Overdue
flag
Bulk actions: Send selected, Download PDFs, Export to Xero
4.2.2 Invoice Detail View
Full invoice preview with PDF-style layout. Header shows invoice number, status badge, and
action buttons (Send, Download, Record Payment, Void). Two-column layout: invoice preview on
left (60%), payment history and activity on right (40%).
Invoice preview panel:
Organisation logo and details (from organisation settings)
Customer billing and shipping addresses
Invoice metadata: number, issue date, due date, PO reference, job reference
Line items table: Product, Description, Qty, Unit Price, Discount, Tax, Line T otal
T otals: Subtotal, Tax, Shipping, T otal, Amount Paid, Balance Due
Notes and terms
Right panel:
Payment history: List of recorded payments with date, amount, method, reference
Email history: Sent/opened/clicked tracking
Activity log: Status changes, edits, Xero sync events

Xero link: Direct link to this invoice in Xero (opens in new tab)
4.2.3 New Invoice / Edit Invoice
Form view with customer selection (autocomplete), date pickers, line items table with inline
editing, and totals calculation. Pre-populates from sales order when created via Sell module
handoff.
Line item table: Same pattern as Sell quote builder. Product combobox, description, qty, unit
price, discount %, tax rate, line total. Add row button at bottom.
Tax handling: Jurisdiction-based defaults. Australia: GST 10%. Tax-inclusive or tax-exclusive
toggle per invoice. Line-item-level tax rate override.
Xero account code: Each line item maps to a Xero account code via the product's default
account or manual selection. Required for Xero sync.
4.2.4 Invoice States & Workflow
Invoice status transitions follow strict rules enforced at the database level:
Draft → Sent (user action: Send)
Sent → Viewed (automatic: email open tracking)
Sent/Viewed → Partially Paid (payment recorded, balance > 0)
Sent/Viewed/Partially Paid → Paid (payment recorded, balance = 0)
Sent/Viewed → Overdue (automatic: due_date < today, balance > 0)
Any state → Cancelled (user action: Void)
A Supabase Edge Function runs daily at 9:00 AM to update overdue status and trigger reminder
emails at 7, 14, and 30 days.
```

</details>

## 4.3 Expenses (/book/expenses)
### Purpose
4.3.1 Expense List / Kanban
Default view is Kanban by approval status: Draft → Submitted → Approved → Paid. T oggle to list
view available. Standard toolbar with search, filter, and "New Expense" button.
Expense card (Kanban): Vendor name, amount, category badge, date, receipt thumbnail (if
uploaded), job reference (if linked)

List columns: Expense #, Vendor, Date, Category, Amount, Payment Method, Approval Status,
Job, Actions
Filters: Date range, Category (multi-select), Payment method, Approval status, Employee (for
reimbursements), Job, Amount range
4.3.2 New Expense / Receipt Upload
Split-screen layout: form on left, receipt preview on right. Optimised for mobile (receipt photo
capture) and desktop (drag-drop upload).
Form fields:
Vendor/Supplier: Autocomplete from suppliers database
Expense date: Date picker, defaults to today
Amount: Number input with currency prefix. Tax auto-calculation.
Category: Dropdown with hierarchical categories (pre-populated for manufacturing)
Payment method: Cash, Credit Card, Bank Transfer, Petty Cash
Description: Optional text area
Job linkage: Optional combobox to link expense to a specific job
Reimbursable: T oggle. If yes, shows employee selector.
Receipt OCR: Upload triggers OCR processing (AWS T extract or Google Vision API). Extracted
fields auto-populate form: vendor name, date, total amount, tax amount. Confidence score
shown. Low-confidence fields highlighted for review. Duplicate detection (vendor + date +
amount hash).
T ouch target: Upload area minimum 200px height. 56px buttons. High contrast for industrial
lighting.
4.3.3 Approval Workflow
Configurable approval thresholds per organisation:
Under $100: Auto-approve
$100--$500: Manager approval
$500--$2,000: Senior manager approval
$2,000+: Director approval
Email notifications at each stage. Approval history audit trail. Reject requires reason (comments
required). Delegate authority when on leave.

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- Interactions including filter (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.3.1 Expense List / Kanban
Default view is Kanban by approval status: Draft → Submitted → Approved → Paid. T oggle to list
view available. Standard toolbar with search, filter, and "New Expense" button.
Expense card (Kanban): Vendor name, amount, category badge, date, receipt thumbnail (if
uploaded), job reference (if linked)

List columns: Expense #, Vendor, Date, Category, Amount, Payment Method, Approval Status,
Job, Actions
Filters: Date range, Category (multi-select), Payment method, Approval status, Employee (for
reimbursements), Job, Amount range
4.3.2 New Expense / Receipt Upload
Split-screen layout: form on left, receipt preview on right. Optimised for mobile (receipt photo
capture) and desktop (drag-drop upload).
Form fields:
Vendor/Supplier: Autocomplete from suppliers database
Expense date: Date picker, defaults to today
Amount: Number input with currency prefix. Tax auto-calculation.
Category: Dropdown with hierarchical categories (pre-populated for manufacturing)
Payment method: Cash, Credit Card, Bank Transfer, Petty Cash
Description: Optional text area
Job linkage: Optional combobox to link expense to a specific job
Reimbursable: T oggle. If yes, shows employee selector.
Receipt OCR: Upload triggers OCR processing (AWS T extract or Google Vision API). Extracted
fields auto-populate form: vendor name, date, total amount, tax amount. Confidence score
shown. Low-confidence fields highlighted for review. Duplicate detection (vendor + date +
amount hash).
T ouch target: Upload area minimum 200px height. 56px buttons. High contrast for industrial
lighting.
4.3.3 Approval Workflow
Configurable approval thresholds per organisation:
Under $100: Auto-approve
$100--$500: Manager approval
$500--$2,000: Senior manager approval
$2,000+: Director approval
Email notifications at each stage. Approval history audit trail. Reject requires reason (comments
required). Delegate authority when on leave.
```

</details>

## 4.4 Purchases (/book/purchases)
### Purpose
4.4.1 Purchase Order List
DataTable with tabs for All, Draft, Sent, Partial, Received, Cancelled. Standard toolbar.
Columns: PO #, Vendor, Order Date, Expected Delivery, Status (Badge), T otal, Actions
Create PO: Form with vendor selection, line items (product, qty ordered, unit price), expected
delivery date, payment terms, notes. Job linkage optional.
4.4.2 Vendor Bills
Vendor bill inbox with matching to POs. Three-way matching: PO → Goods Receipt → Vendor
Bill. Approval routing based on amount thresholds (same as expenses).
4.4.3 Three-Way Matching
Visual indicator showing match status: PO line → Received quantity → Billed quantity.
Discrepancies flagged (quantity mismatch, price variance > 5%). Manager approval required for
mismatched items.

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including create (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.4.1 Purchase Order List
DataTable with tabs for All, Draft, Sent, Partial, Received, Cancelled. Standard toolbar.
Columns: PO #, Vendor, Order Date, Expected Delivery, Status (Badge), T otal, Actions
Create PO: Form with vendor selection, line items (product, qty ordered, unit price), expected
delivery date, payment terms, notes. Job linkage optional.
4.4.2 Vendor Bills
Vendor bill inbox with matching to POs. Three-way matching: PO → Goods Receipt → Vendor
Bill. Approval routing based on amount thresholds (same as expenses).
4.4.3 Three-Way Matching
Visual indicator showing match status: PO line → Received quantity → Billed quantity.
Discrepancies flagged (quantity mismatch, price variance > 5%). Manager approval required for
mismatched items.
```

</details>

## 4.5 Job Costs (/book/job-costs)
### Purpose
4.5.1 Job Profitability List
The primary differentiating screen in Book. Shows all jobs with profitability metrics. Sortable by
margin, filterable by date range, customer, and status.
Columns: Job #, Customer, Product, Quoted Amount, Actual Cost, Margin %, Margin $, Status
Colour coding: Margin > 15%: success green. Margin 5--15%: warning yellow. Margin < 5%:
error red.
Charts above table:
T op 10 most profitable jobs (bar chart)
T op 10 loss-making jobs (bar chart, inverted)
Customer profitability: Revenue vs cost by customer (scatter plot)
4.5.2 Job Cost Detail
Drill-down from job profitability list. Shows cost breakdown for a single job:
Cost breakdown table:
Cost TypeQuoted Actual Variance % of T otal

Data sources:
Materials: From Make module material consumption records + purchase order costs
Labour: From Make module time tracking (hours x operator rate)
Overhead: Allocated from machine hours x overhead rate (configured in Settings)
Subcontract: From purchase orders marked as subcontract

### Data
- See extract: data sources and entities described in body.
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.5.1 Job Profitability List
The primary differentiating screen in Book. Shows all jobs with profitability metrics. Sortable by
margin, filterable by date range, customer, and status.
Columns: Job #, Customer, Product, Quoted Amount, Actual Cost, Margin %, Margin $, Status
Colour coding: Margin > 15%: success green. Margin 5--15%: warning yellow. Margin < 5%:
error red.
Charts above table:
T op 10 most profitable jobs (bar chart)
T op 10 loss-making jobs (bar chart, inverted)
Customer profitability: Revenue vs cost by customer (scatter plot)
4.5.2 Job Cost Detail
Drill-down from job profitability list. Shows cost breakdown for a single job:
Cost breakdown table:
Cost TypeQuoted Actual Variance % of T otal

Data sources:
Materials: From Make module material consumption records + purchase order costs
Labour: From Make module time tracking (hours x operator rate)
Overhead: Allocated from machine hours x overhead rate (configured in Settings)
Subcontract: From purchase orders marked as subcontract
```

</details>

## 4.6 Budgets (/book/budgets)
### Purpose
Budget management for jobs and departments. Job budgets are inherited from Plan module job
creation (quoted amount becomes the budget baseline). Department and annual budgets are
created directly in Book.
Budget types: Job (inherited from Plan), Department, Annual, Quarterly, Monthly
Dashboard view: Budget overview with burn rate charts. Donut charts showing budget
utilisation per category. Traffic-light indicators for at-risk budgets.
Budget detail: Line items with budgeted vs actual. Variance column with colour coding. Revision
history with reason tracking.

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Budget management for jobs and departments. Job budgets are inherited from Plan module job
creation (quoted amount becomes the budget baseline). Department and annual budgets are
created directly in Book.
Budget types: Job (inherited from Plan), Department, Annual, Quarterly, Monthly
Dashboard view: Budget overview with burn rate charts. Donut charts showing budget
utilisation per category. Traffic-light indicators for at-risk budgets.
Budget detail: Line items with budgeted vs actual. Variance column with colour coding. Revision
history with reason tracking.
```

</details>

## 4.7 Stock Valuation (/book/stock-valuation)
### Purpose
Inventory valuation for financial reporting. Three categories: Raw Materials, Work-in-Progress
(WIP), and Finished Goods.
Valuation methods: FIFO (default), LIFO, Weighted Average Cost. Configurable per
organisation.
WIP calculation: For each in-progress job: (materials consumed x material cost) + (labour hours
x hourly rate) + (machine hours x overhead rate). This is the most valuable calculation in Book
Materials $X,XXX $X,XXX +/- $XXX XX%
Labour $X,XXX $X,XXX +/- $XXX XX%
Overhead$X,XXX $X,XXX +/- $XXX XX%
Subcontract$X,XXX $X,XXX +/- $XXX XX%
Other $X,XXX $X,XXX +/- $XXX XX%
TOTAL $XX,XXX $XX,XXX +/- $X,XXX 100%

for manufacturers. WIP is pushed to Xero as a ManualJournal entry crediting the WIP account
and debiting COGS on job completion.
Views:
Summary: T otal valuation by category (raw, WIP, finished). Trend chart over time.
Detail: Item-level breakdown with quantity, unit cost, total value, location, lot number.
Aging: Stock aging analysis identifying slow-moving and obsolete inventory.
Adjustments: Record and approve inventory adjustments (damage, theft, counting errors).

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Inventory valuation for financial reporting. Three categories: Raw Materials, Work-in-Progress
(WIP), and Finished Goods.
Valuation methods: FIFO (default), LIFO, Weighted Average Cost. Configurable per
organisation.
WIP calculation: For each in-progress job: (materials consumed x material cost) + (labour hours
x hourly rate) + (machine hours x overhead rate). This is the most valuable calculation in Book
Materials $X,XXX $X,XXX +/- $XXX XX%
Labour $X,XXX $X,XXX +/- $XXX XX%
Overhead$X,XXX $X,XXX +/- $XXX XX%
Subcontract$X,XXX $X,XXX +/- $XXX XX%
Other $X,XXX $X,XXX +/- $XXX XX%
TOTAL $XX,XXX $XX,XXX +/- $X,XXX 100%

for manufacturers. WIP is pushed to Xero as a ManualJournal entry crediting the WIP account
and debiting COGS on job completion.
Views:
Summary: T otal valuation by category (raw, WIP, finished). Trend chart over time.
Detail: Item-level breakdown with quantity, unit cost, total value, location, lot number.
Aging: Stock aging analysis identifying slow-moving and obsolete inventory.
Adjustments: Record and approve inventory adjustments (damage, theft, counting errors).
```

</details>

## 4.8 Reports (/book/reports)
### Purpose
Report gallery with pre-configured and custom report options. Financial reports are pulled from
Xero via the Reports API and displayed in MW with manufacturing context.
Xero-sourced reports (read-only, pulled via API):
Profit & Loss: GET /Reports/ProfitAndLoss with fromDate, toDate, periods,
trackingCategoryID parameters. Displayed in MW with job-level drill-down via
TrackingCategories.
Balance Sheet: GET /Reports/BalanceSheet. Snapshot at any date.
BAS Report: GET /Reports/BASReport. For Australian organisations.
Trial Balance: GET /Reports/TrialBalance.
Aged Receivables: GET /Reports/AgedReceivablesByContact.
Aged Payables: GET /Reports/AgedPayablesByContact.
MW-native reports:
Job Profitability Report: Revenue, costs, margins by job with drill-down to cost types
Customer Profitability: Aggregated profitability by customer over time
Cost Analysis: Material, labour, overhead trends over time
Budget vs Actual: Variance analysis by job, department, or period
WIP Report: Current WIP valuation with aging
Expense Report: By category, employee, job, or period
Export: All reports export to CSV, Excel, and PDF. Scheduled email delivery
(daily/weekly/monthly) configurable per report.

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- Interactions including export (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Report gallery with pre-configured and custom report options. Financial reports are pulled from
Xero via the Reports API and displayed in MW with manufacturing context.
Xero-sourced reports (read-only, pulled via API):
Profit & Loss: GET /Reports/ProfitAndLoss with fromDate, toDate, periods,
trackingCategoryID parameters. Displayed in MW with job-level drill-down via
TrackingCategories.
Balance Sheet: GET /Reports/BalanceSheet. Snapshot at any date.
BAS Report: GET /Reports/BASReport. For Australian organisations.
Trial Balance: GET /Reports/TrialBalance.
Aged Receivables: GET /Reports/AgedReceivablesByContact.
Aged Payables: GET /Reports/AgedPayablesByContact.
MW-native reports:
Job Profitability Report: Revenue, costs, margins by job with drill-down to cost types
Customer Profitability: Aggregated profitability by customer over time
Cost Analysis: Material, labour, overhead trends over time
Budget vs Actual: Variance analysis by job, department, or period
WIP Report: Current WIP valuation with aging
Expense Report: By category, employee, job, or period
Export: All reports export to CSV, Excel, and PDF. Scheduled email delivery
(daily/weekly/monthly) configurable per report.
```

</details>

## 4.9 Settings (/book/settings)
### Purpose
The Settings page follows the established MW pattern from the Sell module: left-hand settings
navigation with icon-labelled panels, right-hand content area showing the active panel. The
settings nav uses the same vertical tab pattern as Sell > Settings. Plan Usage card appears at
the bottom of the left nav panel showing current tier limits.
Cog General Organisation defaults,
currency, fiscal year,
numbering, lock dates,
dashboard card
selection
Form inputs,
dropdowns, date
picker, checkbox list
File T ext Invoicing Invoice defaults,
payment terms, send
method, reminders,
footer text, bank
details
Dropdowns, textarea,
toggle rows, number
inputs
Link Accounting
Integration
Connect external
accounting (Xero /
MYOB / QuickBooks).
Sync config, status,
logs.
OAuth button, sync
toggle table, log
viewer, error banner
GitMerge Account MappingMap MW categories to
external account
codes.
TrackingCategory
config. Journal
accounts for WIP.
Two-column mapping
table with dropdowns
filtered by type
Percent Tax Tax rates per
jurisdiction, rounding
method, exemptions,
external tax code
mapping
Editable table with
jurisdiction, rate, code
columns
Icon Panel Purpose Key Components

### Data
- UI components and widgets named in specification body.
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including edit (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Settings page follows the established MW pattern from the Sell module: left-hand settings
navigation with icon-labelled panels, right-hand content area showing the active panel. The
settings nav uses the same vertical tab pattern as Sell > Settings. Plan Usage card appears at
the bottom of the left nav panel showing current tier limits.
Cog General Organisation defaults,
currency, fiscal year,
numbering, lock dates,
dashboard card
selection
Form inputs,
dropdowns, date
picker, checkbox list
File T ext Invoicing Invoice defaults,
payment terms, send
method, reminders,
footer text, bank
details
Dropdowns, textarea,
toggle rows, number
inputs
Link Accounting
Integration
Connect external
accounting (Xero /
MYOB / QuickBooks).
Sync config, status,
logs.
OAuth button, sync
toggle table, log
viewer, error banner
GitMerge Account MappingMap MW categories to
external account
codes.
TrackingCategory
config. Journal
accounts for WIP.
Two-column mapping
table with dropdowns
filtered by type
Percent Tax Tax rates per
jurisdiction, rounding
method, exemptions,
external tax code
mapping
Editable table with
jurisdiction, rate, code
columns
Icon Panel Purpose Key Components

4.9.1 General Panel
Organisation Defaults:
Organisation name (read-only, inherited from org settings). Default currency dropdown (AUD,
NZD, SGD, MYR, VND, USD) --- drives Intl.NumberFormat. Fiscal year end: Month + Day picker,
default June 30 for Australian FY. Affects reporting period boundaries and budget rollover.
Document Numbering:
Configurable prefix and sequence for each document type. Invoice prefix (default "INV-"),
Expense prefix ("EXP-"), PO prefix ("PO-"), Credit note prefix ("CN-"). Each shows a live
preview (e.g., "INV-2026-0047") and a read-only next-number display.
Lock Date:
Date picker. Transactions with dates before the lock date cannot be created or edited.
Checkboxes for which entity types are locked: Invoices, Expenses, Purchase Orders, Journals.
ShieldCheckApprovals Expense and PO
approval thresholds
per role. Delegation
authority.
Threshold table with
role and amount
columns, delegation
date range
Scan OCR & AutomationReceipt OCR provider
selection, auto-
categorisation,
duplicate detection
sensitivity
Provider selector,
toggle switches,
confidence slider
CalculatorCost Rates Overhead rates per
work centre, default
labour rate, WIP
calculation frequency
Per-machine rate
table, frequency
dropdown, auto-push
toggle
Download Export Configure export
formats (CSV, Excel,
PDF). Scheduled
exports. Email
recipients.
Format toggles,
schedule dropdown,
email recipient list

Warning text: "Transactions dated before [date] are locked and cannot be modified. Contact
your administrator to change this."
Dashboard Card Selection:
Checkbox list allowing users to choose which KPI cards appear on the Book dashboard.
Options: T otal revenue, Outstanding invoices, Profit margin, Cash flow, Overdue invoices, WIP
valuation, Expenses this month, Budget utilisation. Matches the Sell module dashboard
customisation pattern.
4.9.2 Invoicing Panel
Default payment terms dropdown (COD, Net 7, Net 14, Net 30, Net 60, Custom). When Custom
is selected, a number input appears for custom days. Optional early payment discount toggle
with percentage and days fields.
Default send method radio group: Email only, Email + Print, Print only. Tax display radio: Tax
Excluded (default for AU B2B), Tax Included. Email tracking toggle for open/click tracking.
Automatic overdue reminders toggle with configurable intervals (default: Day 7, Day 14, Day 30).
Add/remove intervals. Reminder email template link.
Invoice footer textarea for T erms & Conditions and payment instructions. Structured bank
details fields for Australian format: BSB, Account Number, Account Name.
4.9.3 Accounting Integration Panel
Connection card showing status. If disconnected: provider selector (Xero, MYOB, QuickBooks)
with brand logos and "Connect" button. If connected: green status dot, provider logo,
organisation name, connected-since date, "Disconnect" danger button. Provider-specific OAuth
flow triggered on connect.
Sync configuration table with toggles per entity type (Invoices push/pull, Expenses push,
Purchase Orders push, Manual Journals push, Chart of Accounts pull, Contacts pull, Reports
pull). Each row shows last sync timestamp, status dot, and error count badge. Sync frequency
dropdown: Real-time, Every 15 min, Hourly, Daily, Manual only.
Manual actions: "Sync Now" button for incremental sync, "Full Re-sync" outline button for
complete data pull. Expandable sync log table with Timestamp, Entity Type, Direction badge,
Record ID (Roboto Mono), Status badge, and expandable error details with full
request/response payloads.

Note: Table names in the database are provider-agnostic (external_accounts_cache,
accounting_sync_log) with a provider column to support future integrations beyond Xero. The UI
labels remain Xero-specific when connected to Xero but adapt when other providers are
supported.
4.9.4 Account Mapping Panel
Two-column mapping interface: MW category on the left, external account code dropdown on
the right. Dropdowns are filtered by account type (revenue accounts only show REVENUE type
from external_accounts_cache). Grouped into sections: Revenue Accounts, COGS Accounts,
Operating Expense Categories, Balance Sheet Accounts. TrackingCategories section for
mapping Job and Department dimensions.
Journal Account Mapping section (new): WIP Asset Account, Production Costs Account, COGS
Account, Inventory Adjustment Account. These are required for ManualJournal entries (WIP
recognition, WIP release, inventory adjustments).
4.9.5 Tax Panel
Editable table of tax rates per jurisdiction. Columns: Jurisdiction (AU, SG, MY, VN), Tax Name
(GST, SST Sales, etc.), Rate (percentage), External Tax Code (mapped to provider tax type),
Default for Sales (radio), Default for Purchases (radio), Active toggle.
Tax rounding method: radio buttons for Round per line item (default) vs Round globally. Default
tax type dropdowns for new invoices and new expenses, populated from the tax rate table.
4.9.6 Approvals Panel
Expense approval threshold table with columns: Threshold level, M in Amount, Max Amount,
Approver Role (dropdown), Auto-approve toggle. Default thresholds: $0--$100 auto-approve,
$101--$500 Manager, $501--$2,000 Senior Manager, $2,001+ Director. "Add threshold" button.
Separate table for PO approval thresholds following the same pattern.
Delegation section: "Set delegate" button per role for when the usual approver is unavailable.
Delegation date range picker (from/to).
4.9.7 OCR & Automation Panel
OCR provider dropdown: AWS T extract (default), Google Vision API, Disabled. Auto-populate
form toggle (default on) --- extracted data fills expense form fields. Confidence threshold slider
(default 70%) --- fields below this confidence are highlighted for manual review.

Smart categorisation: auto-categorise expenses toggle (suggest category from vendor history),
learn from corrections toggle (improve suggestions when user overrides). Duplicate detection:
toggle (default on) with sensitivity radio --- Strict (exact vendor + date + amount), Moderate
(vendor + amount within 7 days), Off.
4.9.8 Cost Rates Panel
Default hourly labour rate number input (used when operator-specific rate not set). "Use per-
operator rates" toggle linking to team management for individual rates.
Overhead rates table per work centre: columns Work Centre, Machine, Rate/Hour (editable),
Last Updated. Rates are used for overhead allocation to jobs. "Edit rates" opens inline editing.
WIP calculation frequency dropdown: Monthly (default), Fortnightly, Weekly, Manual only. Auto-
push to accounting toggle --- automatically create ManualJournal entries on calculation. Read-
only explainer text describing the calculation method.
4.9.9 Export Panel
Default format toggles: CSV (default on), Excel .xlsx (on), PDF (on). Scheduled reports table:
Report name, Schedule (daily/weekly/monthly), Recipients (email chips), Format, Last sent,
T oggle on/off. "Add scheduled report" button.
```

</details>
