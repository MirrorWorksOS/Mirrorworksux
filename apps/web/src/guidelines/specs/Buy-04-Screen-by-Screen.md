# Buy — §4 Screen-by-Screen Specification

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) — combined MirrorWorks module specification. **Buy** module, **Section 4** (screen-by-screen). Text below was extracted from the PDF and structured per project guidelines.

| Reference | Path |
| --- | --- |
| Module spec (PDF) | [`../MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) |
| All §4 extracts (index) | [`README.md`](./README.md) |
| Prototype routes | [`PrototypeRouteMap.md#buy`](./PrototypeRouteMap.md#buy) · [`src/routes.tsx`](../../routes.tsx) |

**Status:** §4 content extracted from PDF into Purpose / Data / Actions / States. The PDF remains authoritative if wording diverges.

## Prototype mapping

Full route ↔ component list: **[`PrototypeRouteMap.md` — Buy](PrototypeRouteMap.md#buy)**.

---

## §4 Screens

## 4.1 Dashboard (/buy/dashboard)
### Purpose
4.1.1 Overview (Bento Grid)
The dashboard overview uses a bento grid layout (DashboardPage component with
bentoVariant="bentoDashboard") with stat cards and chart components.
Layout: Bento grid, 3-column desktop, single column mobile. Identical pattern to Sell, Plan,
Make, and Book dashboards.
KPI Stat Cards (top row):
Open POsShoppingCart24 ($187,450)+3 from last
week
COUNT +
SUM from
purchase_ord
ers WHERE
status IN
('sent',
'acknowledge
d', 'partial')
—
Pending
Receipts
Truck 8 (3 overdue)Overdue
count
COUNT from
purchase_ord
ers WHERE
status IN
('sent',
'acknowledge
d') AND
expected_deli
very < today
Count > 0
overdue: error
colour
Requisitions
Awaiting
ClipboardChe
ck
5 +2 todayCOUNT from
purchase_req
Count > 10:
warning
Card Icon Value
Example
Change
Indicator
Data SourceAlert
Condition

Charts (middle row):
T op Suppliers by Spend: Recharts horizontal bar chart showing top 10 suppliers by total PO
value in current quarter. MW Yellow bars. Click navigates to supplier detail.
PO Status Distribution: Recharts donut chart showing PO count by status. Colour-coded by
status badge colours (grey/blue/amber/green/red).
Action Cards (bottom row):
Overdue Deliveries: Alert list showing POs where expected_delivery < today and status not in
('received', 'closed', 'cancelled'). Each row: PO #, Supplier, Days Overdue, Expected Date.
Click navigates to PO detail. Error colour header when count > 0.
Recent Activity: Timeline feed of last 10 procurement events (PO created, goods received,
bill matched, requisition approved). Timestamp, user avatar, action description.
Approval Queue: Combined count of requisitions, POs, and vendor bills awaiting the current
user's approval. Click navigates to the relevant approval list.
Data Sources: Aggregated from purchase_orders, purchase_requisitions, goods_receipts,
vendor_bills, and supplier_performance_metrics. Materialised views refreshed every 5 minutes.
Approval uisitions
WHERE status
= 'submitted'
Spend This
Month
DollarSign$42,800 /
$60,000
vs budget
(71%)
SUM from
purchase_ord
er_items
WHERE
created_at in
current month
vs budget
90%
budget:
warning,
> 100%:
error
Supplier On-
Time Delivery
Clock 87% -2% vs last
month
AVG from
supplier_perfo
rmance_metri
cs WHERE
metric =
'on_time_deliv
ery'
< 80%:
warning, <
70%: error

### Data
- See extract: data sources and entities described in body.

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
Layout: Bento grid, 3-column desktop, single column mobile. Identical pattern to Sell, Plan,
Make, and Book dashboards.
KPI Stat Cards (top row):
Open POsShoppingCart24 ($187,450)+3 from last
week
COUNT +
SUM from
purchase_ord
ers WHERE
status IN
('sent',
'acknowledge
d', 'partial')
—
Pending
Receipts
Truck 8 (3 overdue)Overdue
count
COUNT from
purchase_ord
ers WHERE
status IN
('sent',
'acknowledge
d') AND
expected_deli
very < today
Count > 0
overdue: error
colour
Requisitions
Awaiting
ClipboardChe
ck
5 +2 todayCOUNT from
purchase_req
Count > 10:
warning
Card Icon Value
Example
Change
Indicator
Data SourceAlert
Condition

Charts (middle row):
T op Suppliers by Spend: Recharts horizontal bar chart showing top 10 suppliers by total PO
value in current quarter. MW Yellow bars. Click navigates to supplier detail.
PO Status Distribution: Recharts donut chart showing PO count by status. Colour-coded by
status badge colours (grey/blue/amber/green/red).
Action Cards (bottom row):
Overdue Deliveries: Alert list showing POs where expected_delivery < today and status not in
('received', 'closed', 'cancelled'). Each row: PO #, Supplier, Days Overdue, Expected Date.
Click navigates to PO detail. Error colour header when count > 0.
Recent Activity: Timeline feed of last 10 procurement events (PO created, goods received,
bill matched, requisition approved). Timestamp, user avatar, action description.
Approval Queue: Combined count of requisitions, POs, and vendor bills awaiting the current
user's approval. Click navigates to the relevant approval list.
Data Sources: Aggregated from purchase_orders, purchase_requisitions, goods_receipts,
vendor_bills, and supplier_performance_metrics. Materialised views refreshed every 5 minutes.
Approval uisitions
WHERE status
= 'submitted'
Spend This
Month
DollarSign$42,800 /
$60,000
vs budget
(71%)
SUM from
purchase_ord
er_items
WHERE
created_at in
current month
vs budget
90%
budget:
warning,
> 100%:
error
Supplier On-
Time Delivery
Clock 87% -2% vs last
month
AVG from
supplier_perfo
rmance_metri
cs WHERE
metric =
'on_time_deliv
ery'
< 80%:
warning, <
70%: error
```

</details>

## 4.2 Purchase Requisitions (/buy/requisitions)
### Purpose
4.2.1 Requisition List View
DataTable with tabs for All, Draft, Submitted, Approved, Converted, Rejected. Standard toolbar
with search, filter, and "New Requisition" button (MW Yellow CTA).
Columns:
Actions menu: View, Edit (if draft), Submit (if draft), Approve/Reject (if submitted, authorised
user), Convert to PO, Convert to RFQ, Delete (if draft)
Filters: Status, Urgency, Requestor, Date required range, Job reference, Department
4.2.2 New Requisition / Edit Requisition
Form view with the following fields:
Requisition # T ext (REQ-YYYYMM-
NNN)
Yes Yes (search)
Requestor T ext (user name)Yes Yes (dropdown)
Date RequiredDate Yes Yes (date range)
Urgency Badge
(Normal/Urgent/Critica
l)
Yes Yes (multi-select)
Items Number (count of line
items)
Yes No
Estimated T otalCurrency Yes Yes (range)
Job ReferenceT ext (job number,
optional)
Yes Yes (search)
Status Badge Yes Yes (multi-select)
Actions Dropdown menuNo No
Column Type Sortable Filterable
Field Type RequiredValidationDefault

Line Items Table:
Requisition
Number
T ext (read-only)Auto Format: REQ-
YYYYMM-NNN
Auto-generated
RequestorT ext (read-only)Auto Current
authenticated
user
auth.uid() display
name
DepartmentDropdownNo From
departments list
User's default
department
Date RequiredDate pickerYes Must be >= todayT oday + 7 days
Urgency Radio groupYes Normal, Urgent,
Critical
Normal
Job ReferenceComboboxNo Valid job from
plan_ jobs
—
Notes T extareaNo Max 2000 chars—
Product Combobox (product
search)
Yes Must exist in products
table
Quantity Number Yes 0
Unit T ext (read-only)Auto From
product.unit_of_measu
re
Preferred SupplierCombobox No From vendors table
Estimated Unit CostCurrency No = 0, auto-
populated from
supplier_price_li
sts if supplier
selected
Field Type Required Validation

"Add Line Item" button at bottom of table. M inimum 1 line item required.
MRP-Generated Requisitions: When Plan generates a requisition from an MRP run, the
requisition is pre-populated with: product, quantity, date required (from job schedule), job
reference, and preferred supplier (from product supplier info). Status is set to 'submitted' and
routes directly to approval (bypassing draft).
4.2.3 Requisition Status Flow
draft → submitted → approved → converted → closed | rejected
draft → submitted: Requestor clicks "Submit". Triggers notification to approver based on
estimated total and approval thresholds.
submitted → approved: Approver clicks "Approve". Requisition becomes available for
conversion to PO or …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including opens (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.2.1 Requisition List View
DataTable with tabs for All, Draft, Submitted, Approved, Converted, Rejected. Standard toolbar
with search, filter, and "New Requisition" button (MW Yellow CTA).
Columns:
Actions menu: View, Edit (if draft), Submit (if draft), Approve/Reject (if submitted, authorised
user), Convert to PO, Convert to RFQ, Delete (if draft)
Filters: Status, Urgency, Requestor, Date required range, Job reference, Department
4.2.2 New Requisition / Edit Requisition
Form view with the following fields:
Requisition # T ext (REQ-YYYYMM-
NNN)
Yes Yes (search)
Requestor T ext (user name)Yes Yes (dropdown)
Date RequiredDate Yes Yes (date range)
Urgency Badge
(Normal/Urgent/Critica
l)
Yes Yes (multi-select)
Items Number (count of line
items)
Yes No
Estimated T otalCurrency Yes Yes (range)
Job ReferenceT ext (job number,
optional)
Yes Yes (search)
Status Badge Yes Yes (multi-select)
Actions Dropdown menuNo No
Column Type Sortable Filterable
Field Type RequiredValidationDefault

Line Items Table:
Requisition
Number
T ext (read-only)Auto Format: REQ-
YYYYMM-NNN
Auto-generated
RequestorT ext (read-only)Auto Current
authenticated
user
auth.uid() display
name
DepartmentDropdownNo From
departments list
User's default
department
Date RequiredDate pickerYes Must be >= todayT oday + 7 days
Urgency Radio groupYes Normal, Urgent,
Critical
Normal
Job ReferenceComboboxNo Valid job from
plan_ jobs
—
Notes T extareaNo Max 2000 chars—
Product Combobox (product
search)
Yes Must exist in products
table
Quantity Number Yes 0
Unit T ext (read-only)Auto From
product.unit_of_measu
re
Preferred SupplierCombobox No From vendors table
Estimated Unit CostCurrency No = 0, auto-
populated from
supplier_price_li
sts if supplier
selected
Field Type Required Validation

"Add Line Item" button at bottom of table. M inimum 1 line item required.
MRP-Generated Requisitions: When Plan generates a requisition from an MRP run, the
requisition is pre-populated with: product, quantity, date required (from job schedule), job
reference, and preferred supplier (from product supplier info). Status is set to 'submitted' and
routes directly to approval (bypassing draft).
4.2.3 Requisition Status Flow
draft → submitted → approved → converted → closed | rejected
draft → submitted: Requestor clicks "Submit". Triggers notification to approver based on
estimated total and approval thresholds.
submitted → approved: Approver clicks "Approve". Requisition becomes available for
conversion to PO or RFQ.
submitted → rejected: Approver clicks "Reject". Reason required (stored in
requisition_notes). Requestor notified.
approved → converted: When all line items have been converted to a PO or RFQ. Automatic
status update.
converted → closed: Manual close by Purchasing Manager after PO is sent. Or automatic
when linked PO status = 'received'.
4.2.4 Conversion to PO or RFQ
From an approved requisition, two conversion paths:
Convert to PO (single supplier): Opens new PO form pre-populated with all line items,
preferred supplier (if set), quantities, and job reference. One-click conversion when preferred
supplier and prices are known.
Convert to RFQ (multiple suppliers): Opens new RFQ form pre-populated with line items. User
selects multiple suppliers to send the RFQ to. Used when prices need to be compared or
preferred supplier is not set.
Estimated Line T otalCurrency (read-only)Auto Quantity x Estimated
Unit Cost
Notes T ext No Max 500 chars
```

</details>

## 4.3 Requests for Quotation (/buy/rfqs)
### Purpose
4.3.1 RFQ List / Kanban
Default view is Kanban by status: Draft → Sent → Received → Evaluated → Converted. T oggle to
list view available. Standard toolbar with search, filter, and "New RFQ" button.
Kanban card: RFQ #, item summary (first 2 products + "and X more"), supplier count, deadline,
days remaining badge.
List columns:
4.3.2 New RFQ / Edit RFQ
Header fields:
RFQ # T ext (RFQ-YYYYMM-
NNN)
Yes Yes
Items T ext (product
summary)
No No
Suppliers Number (count sent
to)
Yes No
Responses Number (count
received)
Yes No
Deadline Date Yes Yes (date range)
Status Badge Yes Yes (multi-select)
T otal (Best Quote)Currency Yes No
Actions Dropdown No No
Column Type Sortable Filterable
RFQ Number T ext (read-only)Auto Auto-generated RFQ-
YYYYMM-NNN
Deadline Date pickerYes T oday + 14 days
Special RequirementsT extarea No —
Field Type Required Default

Supplier Selection: Multi-select combobox from vendors table. Each selected supplier receives
the RFQ. M inimum 1 supplier, recommended 3+ for price comparison.
Line Items Table: Same structure as requisition line items: Product, Quantity, Unit, Target Price
(optional), Notes.
4.3.3 Supplier Comparison View
After responses are received, the RFQ detail shows a side-by-side comparison table:
Each cell shows: unit price, lead time, MOQ, and any notes from the supplier. Best price per line
highlighted in green. Winner selection: checkbox per cell to select the winning quote per line
item (can split across suppliers). "Convert to PO" button generates one PO per winning supplier.
4.3.4 RFQ Status Flow
draft → sent → received → evaluated → converted → cancelled
draft → sent: User clicks "Send RFQ". Emails sent to all selected suppliers with RFQ details
(PDF attachment).
sent → received: Automatic when at least one supplier response is recorded. Manual entry of
supplier quotes.
received → evaluated: User marks RFQ as evaluated after reviewing comparison. Selects
winners.
evaluated → converted: Winners converted to POs. RFQ automatically moves to converted
when all winning quotes have been converted.
4.3.5 RFQ Email
Sent via Edge Function (send-rfq-email). T emplate configurable in Settings. Contains: RFQ
number, requesting organisation details, line items with quantities, deadline for response, special
requirements, reply instructions.
Source RequisitionLink (read-only)No Set if converted from
requisition
3mm Mild Steel Sheet$45.00 / unit, 5 day
lead, MOQ 10
$42.50 / unit, 7 day
lead, MOQ 20
$47.00 / unit, 3 day
lead, MOQ …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including edit (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.3.1 RFQ List / Kanban
Default view is Kanban by status: Draft → Sent → Received → Evaluated → Converted. T oggle to
list view available. Standard toolbar with search, filter, and "New RFQ" button.
Kanban card: RFQ #, item summary (first 2 products + "and X more"), supplier count, deadline,
days remaining badge.
List columns:
4.3.2 New RFQ / Edit RFQ
Header fields:
RFQ # T ext (RFQ-YYYYMM-
NNN)
Yes Yes
Items T ext (product
summary)
No No
Suppliers Number (count sent
to)
Yes No
Responses Number (count
received)
Yes No
Deadline Date Yes Yes (date range)
Status Badge Yes Yes (multi-select)
T otal (Best Quote)Currency Yes No
Actions Dropdown No No
Column Type Sortable Filterable
RFQ Number T ext (read-only)Auto Auto-generated RFQ-
YYYYMM-NNN
Deadline Date pickerYes T oday + 14 days
Special RequirementsT extarea No —
Field Type Required Default

Supplier Selection: Multi-select combobox from vendors table. Each selected supplier receives
the RFQ. M inimum 1 supplier, recommended 3+ for price comparison.
Line Items Table: Same structure as requisition line items: Product, Quantity, Unit, Target Price
(optional), Notes.
4.3.3 Supplier Comparison View
After responses are received, the RFQ detail shows a side-by-side comparison table:
Each cell shows: unit price, lead time, MOQ, and any notes from the supplier. Best price per line
highlighted in green. Winner selection: checkbox per cell to select the winning quote per line
item (can split across suppliers). "Convert to PO" button generates one PO per winning supplier.
4.3.4 RFQ Status Flow
draft → sent → received → evaluated → converted → cancelled
draft → sent: User clicks "Send RFQ". Emails sent to all selected suppliers with RFQ details
(PDF attachment).
sent → received: Automatic when at least one supplier response is recorded. Manual entry of
supplier quotes.
received → evaluated: User marks RFQ as evaluated after reviewing comparison. Selects
winners.
evaluated → converted: Winners converted to POs. RFQ automatically moves to converted
when all winning quotes have been converted.
4.3.5 RFQ Email
Sent via Edge Function (send-rfq-email). T emplate configurable in Settings. Contains: RFQ
number, requesting organisation details, line items with quantities, deadline for response, special
requirements, reply instructions.
Source RequisitionLink (read-only)No Set if converted from
requisition
3mm Mild Steel Sheet$45.00 / unit, 5 day
lead, MOQ 10
$42.50 / unit, 7 day
lead, MOQ 20
$47.00 / unit, 3 day
lead, MOQ 5
M10 Hex Bolts (100pk)$18.00, 2 day lead$16.50, 3 day leadNot quoted
Item Supplier A Supplier B Supplier C
```

</details>

## 4.4 Purchase Orders (/buy/orders)
### Purpose
This is the core screen of the Buy module and the most detailed specification.
4.4.1 PO List View
DataTable with tabs: All, Draft, Pending Approval, Sent, Acknowledged, Partial, Received,
Cancelled. Standard toolbar with search, filter, "New PO" button (MW Yellow CTA), and Kanban
toggle.
Columns:
PO # T ext (PO-YYYYMM-
NNN)
Yes Yes (search)
Supplier T ext Yes Yes (dropdown)
Order Date Date Yes Yes (date range)
Expected DeliveryDate Yes Yes (date range)
Items Number (line count)Yes No
Status Badge Yes Yes (multi-select)
T otal (inc GST)Currency (JetBrains
Mono)
Yes Yes (range)
Receipt StatusIcon
(none/partial/complete
)
Yes Yes
Bill StatusIcon
(unbilled/partial/billed)
Yes Yes
Job ReferenceT ext Yes Yes (search)
Xero Sync Icon
(synced/pending/error
/not synced)
No Yes
Actions Dropdown No No
Column Type Sortable Filterable

Actions menu: View, Edit (if draft), Submit for Approval (if draft), Approve (if pending, authorised
user), Send to Supplier, Download PDF, Receive Goods, Record Bill, Amend, Cancel, Delete (if
draft)
Kanban view toggle: Cards grouped by status columns, draggable between columns (triggers
status transition validation). Card shows: PO #, Supplier name, T otal, Expected Delivery,
Overdue badge (if applicable).
Bulk actions: Send selected (draft → sent), Export selected, Download PDFs
4.4.2 PO Detail View
Two-section layout: header + detail area.
Header: PO number (large, prominent), Status badge, Supplier name and contact, Order date,
Expected delivery date, Action buttons (Edit, Send, Download PDF, Receive Goods, Record Bill,
Amend, Cancel).
Detail area — tabbed:
Items tab (default):
Line items table with columns: #, Product (name + SKU), Description, Qty Ordered, Qty
Received (read-only, from goods receipts), Qty Billed (read-only, from vendor bills), Unit Price,
Tax Rate, Line T otal. T otals row at bottom: Subtotal, Tax, T otal (inc GST).
Delivery tab:
Timeline of goods receipts against this PO. Each receipt: GR #, Date, Received By, Items
summary, Status. Running total: Ordered vs Received per line item with progress bar. "New
Receipt" button links to /buy/receipts/new?po=:poId.
Billing tab:
List of vendor bills matched to this PO. Each bill: VB #, Supplier Invoice #, Date, Amount, Match
Status (traffic light), Xero Sync Status. Three-way match summary per line item. "Record Bill"
button.
History tab:
Activity timeline: status changes, amendments, approvals, emails sent, receipts, bills. Each
entry: timestamp, user, action …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including edit (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
This is the core screen of the Buy module and the most detailed specification.
4.4.1 PO List View
DataTable with tabs: All, Draft, Pending Approval, Sent, Acknowledged, Partial, Received,
Cancelled. Standard toolbar with search, filter, "New PO" button (MW Yellow CTA), and Kanban
toggle.
Columns:
PO # T ext (PO-YYYYMM-
NNN)
Yes Yes (search)
Supplier T ext Yes Yes (dropdown)
Order Date Date Yes Yes (date range)
Expected DeliveryDate Yes Yes (date range)
Items Number (line count)Yes No
Status Badge Yes Yes (multi-select)
T otal (inc GST)Currency (JetBrains
Mono)
Yes Yes (range)
Receipt StatusIcon
(none/partial/complete
)
Yes Yes
Bill StatusIcon
(unbilled/partial/billed)
Yes Yes
Job ReferenceT ext Yes Yes (search)
Xero Sync Icon
(synced/pending/error
/not synced)
No Yes
Actions Dropdown No No
Column Type Sortable Filterable

Actions menu: View, Edit (if draft), Submit for Approval (if draft), Approve (if pending, authorised
user), Send to Supplier, Download PDF, Receive Goods, Record Bill, Amend, Cancel, Delete (if
draft)
Kanban view toggle: Cards grouped by status columns, draggable between columns (triggers
status transition validation). Card shows: PO #, Supplier name, T otal, Expected Delivery,
Overdue badge (if applicable).
Bulk actions: Send selected (draft → sent), Export selected, Download PDFs
4.4.2 PO Detail View
Two-section layout: header + detail area.
Header: PO number (large, prominent), Status badge, Supplier name and contact, Order date,
Expected delivery date, Action buttons (Edit, Send, Download PDF, Receive Goods, Record Bill,
Amend, Cancel).
Detail area — tabbed:
Items tab (default):
Line items table with columns: #, Product (name + SKU), Description, Qty Ordered, Qty
Received (read-only, from goods receipts), Qty Billed (read-only, from vendor bills), Unit Price,
Tax Rate, Line T otal. T otals row at bottom: Subtotal, Tax, T otal (inc GST).
Delivery tab:
Timeline of goods receipts against this PO. Each receipt: GR #, Date, Received By, Items
summary, Status. Running total: Ordered vs Received per line item with progress bar. "New
Receipt" button links to /buy/receipts/new?po=:poId.
Billing tab:
List of vendor bills matched to this PO. Each bill: VB #, Supplier Invoice #, Date, Amount, Match
Status (traffic light), Xero Sync Status. Three-way match summary per line item. "Record Bill"
button.
History tab:
Activity timeline: status changes, amendments, approvals, emails sent, receipts, bills. Each
entry: timestamp, user, action description, before/after values for amendments.
Xero tab:
Xero sync status, last sync timestamp, Xero PO reference (link to Xero), sync error log if
applicable. Manual "Sync Now" button.

4.4.3 New PO / Edit PO
Header fields:
Line Items Table:
PO NumberT ext (read-only)Auto PO-YYYYMM-
NNN
Auto-generated
SupplierCombobox
(autocomplete)
Yes Must exist in
vendors table
—
Order DateDate pickerYes — T oday
Expected
Delivery
Date pickerYes Must be >= Order
Date
T oday + supplier
default lead time
Payment T ermsDropdownNo — From supplier
default or org
default
Shipping MethodDropdownNo — From supplier
default
Delivery AddressT extareaNo — Organisation
default address
Internal NotesT extareaNo Max 2000 chars—
Supplier NotesT extareaNo Max 2000 chars
(included on PO
PDF)
—
Field Type RequiredValidationDefault
Product Combobox
(product search)
Yes Must exist in
products table
DescriptionT ext No Auto-populated
from product,
editable
Field Type RequiredValidation

"Add Line Item" button. "Import from Requisition" button opens a picker showing approved,
unconverted requisitions.
T otals: Subtotal, Tax (calculated), T otal (inc GST). All displayed in JetBrains Mono.
Supplier auto-population: When a supplier is selected, the following auto-populate: payment
terms (from vendor default), shipping method, and unit prices for any products that exist in
supplier_price_lists for that supplier.
4.4.4 PO Approval Workflow
POs above the auto-approve threshold require approval before sending. The approval flow:
1. Buyer creates PO and clicks "Submit for Approval".
2. System checks PO total against buy_settings approval thresholds.
3. Notification sent to appropriate approver(s) based on amount.
4. Approver reviews PO detail and clicks "Approve" or "Reject" (with reason).
5. On approval, PO status moves to 'approved' and can be sent to supplier.
Quantity Number Yes 0
Unit Price CurrencyYes = 0, auto-
populated
from
supplier_pri
ce_lists for
selected
supplier +
product
Tax Rate DropdownYes From tax_rates
table
Default purchase
tax rate
Line T otalCurrency (read-
only)
Auto Qty x Unit Price
Job ReferenceComboboxNo Valid job from
plan_ jobs

Approval is required before the PO can be sent via email or synced to Xero.
4.4.5 Send PO to Supplier
Triggered by "Send to Supplier" button (available when status = 'approved' or auto-approved
'draft'). Edge Function generates PO PDF from template, emails it to supplier's primary contact
email with PDF attachment. T emplate configurable in Settings.
Email contains: PO number, organisation details, line items summary, expected delivery date,
payment terms, delivery address, and any supplier notes.
On successful send: status → 'sent', email_sent_at timestamp recorded, Xero sync triggered (if
enabled).
4.4.6 PO Amendment
After a PO has been sent, it cannot be directly edited. Instead, an amendment workflow:
1. User clicks "Amend" on a sent PO.
2. System creates a new version (purchase_order_amendments record) with a snapshot of the
original.
3. The PO becomes editable. User makes changes (quantities, prices, add/remove lines).
4. User clicks "Send Amendment". New PDF generated, emailed to supplier with amendment
note.
5. Amendment history visible in the History tab showing diff between versions.
4.4.7 PO Status Flow
draft → pending_approval → approved → sent → acknowledged → partial → received → billed →
closed | cancelled
draft → pending_approval: User submits PO that exceeds auto-approve threshold.
draft → approved: PO is within auto-approve threshold (or threshold is disabled).
pending_approval → approved: Approver approves.
pending_approval → draft: Approver rejects (returned to creator for revision).
approved → sent: User sends PO to supplier.
sent → acknowledged: Supplier acknowledges receipt (manual update or future supplier
portal).
sent/acknowledged → partial: First goods receipt recorded but not all lines fully received.
partial → received: All lines fully received (ordered qty = received qty for all items).
received → billed: All vendor bills matched and approved.

billed → closed: Manual close by Purchasing Manager. All receipts confirmed, all bills
matched, Xero synced.
Any active status → cancelled: User cancels PO. Reason required. If already sent,
cancellation email sent to supplier.
```

</details>

## 4.5 Goods Receipts (/buy/receipts)
### Purpose
4.5.1 Receipt List View
DataTable with columns:
4.5.2 New Goods Receipt (from PO)
T ouch-optimised layout — this screen is designed for tablet use at the receiving dock. Large
inputs, prominent buttons, high contrast.
Route: /buy/receipts/new?po=:poId
Header (read-only, from PO): PO #, Supplier name, Expected delivery date, T otal ordered
items.
Receipt fields:
Receipt # T ext (GR-YYYYMM-
NNN)
Yes Yes
PO ReferenceT ext (link)Yes Yes
Supplier T ext Yes Yes (dropdown)
Delivery DateDate Yes Yes (date range)
Delivery Docket #T ext Yes Yes
Received ByT ext Yes Yes (dropdown)
Items Number Yes No
Status Badge Yes Yes
Quality Badge
(Pass/Fail/Pending)
Yes Yes
Actions Dropdown No No
Column Type Sortable Filterable

Line Items (pre-populated from PO):
Photo Upload: Camera button per line item (opens device camera or file picker). Photos stored
in Supabase Storage under goods_receipt_photos. Used for damage documentation. T ouch-
friendly: large camera icon button (80px).
Receipt NumberT ext (read-only)Auto GR-YYYYMM-
NNN
Auto-generated
Delivery DateDate pickerYes — T oday
Delivery Docket #T ext Yes — —
Received ByT ext (read-only)Auto Current userauth.uid()
Notes T extareaNo Max 2000 chars—
Field Type RequiredValidationDefault
Product T ext (read-only)— From PO line item
Qty OrderedNumber (read-only)— From PO
Qty Previously
Received
Number (read-only)— Sum of previous GRs
for this PO line
Qty ReceivedNumber input (large,
56px height)
Yes Default: remaining qty
(ordered - previously
received)
Qty RejectedNumber inputNo Default: 0
Condition Dropdown
(Good/Damaged/Wron
g Item)
Yes Default: Good
Quality Check T oggle (Pass/Fail)ConfigurableOnly shown if quality
check required in
settings
Notes T ext No —
Field Type Required Notes

Confirm Receipt: Large primary button (full width, 56px height) at bottom. On confirm:
1. goods_receipt and goods_receipt_items records created
2. PO status updated (partial or received based on cumulative quantities)
3. Inventory levels updated for received products
4. If product has lot/serial tracking: prompt for lot/serial assignment before confirmation
4.5.3 Partial Receipts
A PO can have multiple goods receipts. The receipt form shows:
Qty Ordered (from PO)
Qty Previously Received (sum of all prior GRs for this PO line)
Qty Remaining (Ordered - Previously Received)
Qty Received (this receipt — defaults to Qty Remaining)
Each receipt is independent. The PO tracks cumulative received quantities across all GRs.
4.5.4 Goods Receipt Status …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including filter (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.5.1 Receipt List View
DataTable with columns:
4.5.2 New Goods Receipt (from PO)
T ouch-optimised layout — this screen is designed for tablet use at the receiving dock. Large
inputs, prominent buttons, high contrast.
Route: /buy/receipts/new?po=:poId
Header (read-only, from PO): PO #, Supplier name, Expected delivery date, T otal ordered
items.
Receipt fields:
Receipt # T ext (GR-YYYYMM-
NNN)
Yes Yes
PO ReferenceT ext (link)Yes Yes
Supplier T ext Yes Yes (dropdown)
Delivery DateDate Yes Yes (date range)
Delivery Docket #T ext Yes Yes
Received ByT ext Yes Yes (dropdown)
Items Number Yes No
Status Badge Yes Yes
Quality Badge
(Pass/Fail/Pending)
Yes Yes
Actions Dropdown No No
Column Type Sortable Filterable

Line Items (pre-populated from PO):
Photo Upload: Camera button per line item (opens device camera or file picker). Photos stored
in Supabase Storage under goods_receipt_photos. Used for damage documentation. T ouch-
friendly: large camera icon button (80px).
Receipt NumberT ext (read-only)Auto GR-YYYYMM-
NNN
Auto-generated
Delivery DateDate pickerYes — T oday
Delivery Docket #T ext Yes — —
Received ByT ext (read-only)Auto Current userauth.uid()
Notes T extareaNo Max 2000 chars—
Field Type RequiredValidationDefault
Product T ext (read-only)— From PO line item
Qty OrderedNumber (read-only)— From PO
Qty Previously
Received
Number (read-only)— Sum of previous GRs
for this PO line
Qty ReceivedNumber input (large,
56px height)
Yes Default: remaining qty
(ordered - previously
received)
Qty RejectedNumber inputNo Default: 0
Condition Dropdown
(Good/Damaged/Wron
g Item)
Yes Default: Good
Quality Check T oggle (Pass/Fail)ConfigurableOnly shown if quality
check required in
settings
Notes T ext No —
Field Type Required Notes

Confirm Receipt: Large primary button (full width, 56px height) at bottom. On confirm:
1. goods_receipt and goods_receipt_items records created
2. PO status updated (partial or received based on cumulative quantities)
3. Inventory levels updated for received products
4. If product has lot/serial tracking: prompt for lot/serial assignment before confirmation
4.5.3 Partial Receipts
A PO can have multiple goods receipts. The receipt form shows:
Qty Ordered (from PO)
Qty Previously Received (sum of all prior GRs for this PO line)
Qty Remaining (Ordered - Previously Received)
Qty Received (this receipt — defaults to Qty Remaining)
Each receipt is independent. The PO tracks cumulative received quantities across all GRs.
4.5.4 Goods Receipt Status Flow
draft → confirmed → quality_checked → completed
draft → confirmed: Receiver clicks "Confirm Receipt". Quantities locked. Inventory updated.
confirmed → quality_checked: Quality check completed (if required). Pass/Fail recorded per
line.
quality_checked → completed: All items passed QC or rejected items have been
dispositioned.
If quality check is not required (toggle in settings), the flow is: draft → confirmed → completed.
```

</details>

## 4.6 Vendor Bills & Matching (/buy/bills)
### Purpose
4.6.1 Vendor Bill List
DataTable with tabs: All, Pending, Matched, Approved, Pushed to Xero, Disputed. Standard
toolbar with search, filter, "New Bill" button.
Columns:
Internal RefT ext (VB-YYYYMM-
NNN)
Yes Yes
Supplier Invoice #T ext Yes Yes
Column Type Sortable Filterable

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including filter (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.6.1 Vendor Bill List
DataTable with tabs: All, Pending, Matched, Approved, Pushed to Xero, Disputed. Standard
toolbar with search, filter, "New Bill" button.
Columns:
Internal RefT ext (VB-YYYYMM-
NNN)
Yes Yes
Supplier Invoice #T ext Yes Yes
Column Type Sortable Filterable

4.6.2 New Vendor Bill / Bill Detail
Upload and OCR: Drag-drop zone for bill upload (PDF or image). On upload, triggers OCR
processing via Edge Function (process-vendor-bill-ocr). Same AWS T extract integration as Book
module expenses. Extracted fields auto-populate: supplier invoice number, date, total, tax, line
items. Confidence scores shown; low-confidence fields highlighted.
Bill fields:
Supplier T ext Yes Yes (dropdown)
Bill Date Date Yes Yes (date range)
Due Date Date Yes Yes (date range)
PO ReferenceT ext (link)Yes Yes
Match StatusTraffic light
(green/amber/red)
Yes Yes
T otal Currency Yes Yes (range)
Status Badge Yes Yes
Xero Sync Icon No Yes
Actions Dropdown No No
Supplier Invoice #T ext Yes From supplier's
document
Internal ReferenceT ext (read-only)Auto VB-YYYYMM-NNN
Supplier Combobox Yes Must exist in vendors
Bill Date Date Yes —
Due Date Date Yes = Bill Date
PO ReferenceCombobox Yes (for matching)Valid PO for this
supplier
Line Items Table Yes —
Field Type Required Validation

4.6.3 Three-Way Matching
The core procurement control. Each vendor bill line is matched against:
1. PO line — what was ordered (product, quantity, price)
2. Goods Receipt line — what was received (quantity, condition)
3. Vendor Bill line — what the supplier is charging
Visual match indicator per line:
Matching detail view: Three-column layout per line item:
Tax Currency Yes Auto-calculated or
from OCR
T otal Currency Yes Must match line items
+ tax
Full Match Green PO qty = GR qty = Bill qty AND
PO price = Bill price (within
tolerance)
Minor Variance Amber Variance within configured
tolerance (default: 5% price,
2% quantity)
Mismatch Red Variance exceeds tolerance
No Receipt Grey No goods receipt recorded for
this PO line
Match Status Colour Condition
Product: 3mm MS SheetProduct: 3mm MS SheetProduct: 3mm MS Sheet
Qty: 100 Qty Received: 98Qty Billed: 98
Unit Price: $45.00 — Unit Price: $46.00
Line T otal: $4,500.00 — Line T otal: $4,508.00
PO Line Goods Receipt LineVendor Bill Line

Variance row: Qty variance: -2 (2%), Price variance: +$1.00 (2.2%). Both within tolerance →
Amber.
Approval routing for mismatches:
Within tolerance: auto-approved (if setting enabled)
Outside tolerance: routed to Purchasing Manager for manual approval or dispute
No goods receipt: blocked until receipt is recorded
4.6.4 Vendor Bill Status Flow
pending → matched → approved → pushed_to_xero → paid | disputed | cancelled
pending → matched: Bill lines matched to PO and GR lines (automatic or manual).
matched → approved: All lines within tolerance (auto) or manually approved by authorised
user.
approved → pushed_to_xero: Edge Function pushes approved bill to Xero as ACCPAY
invoice.
pushed_to_xero → paid: Payment status pulled from Xero (webhook or polling).
matched → disputed: Purchasing Manager flags bill for dispute with supplier. Reason
required.
disputed → matched: Dispute resolved, bill re-matched.
```

</details>

## 4.7 Suppliers (/buy/suppliers)
### Purpose
4.7.1 Supplier List / Card View
Default view is card grid (same pattern as Sell CRM customers). T oggle to DataTable list view.
Card view: Each card shows: Supplier name, Category badge, Star rating (1-5), Last order date,
T otal spend (current FY), Preferred supplier flag (star icon). Click navigates to supplier detail.
List view columns:
Supplier NameT ext Yes Yes (search)
Category Badge Yes Yes (multi-select)
Type T ext Yes Yes (dropdown)
Rating Stars (1-5)Yes Yes (range)
On-Time DeliveryPercentageYes Yes (range)
Column Type Sortable Filterable

Supplier categories: Raw Materials, Components, T ools & Equipment, Services, Packaging,
Subcontractors, Other
Supplier types: Manufacturer, Distributor, Service Provider, Contractor
4.7.2 New Supplier / Edit Supplier
Uses the existing vendors table (shared with Book module). Form fields:
T otal Spend (FY)Currency Yes Yes (range)
Last Order Date Yes Yes (date range)
Status Badge
(Active/Inactive)
Yes Yes
Actions Dropdown No No
Company NameT ext Yes —
ABN T ext No Valid ABN format (11
digits)
ACN T ext No Valid ACN format (9
digits)
Address T extarea No —
Website URL No Valid URL
Primary Contact NameT ext Yes —
Primary Contact
Phone
Phone No —
Primary Contact EmailEmail Yes Valid email
Category Dropdown Yes From supplier
categories
Type Dropdown Yes From supplier types
Default Payment
T erms
Dropdown No COD, Net 7, Net 14,
Net 30, Net 60
Field Type Required Validation

### Data
- UI components and widgets named in specification body.
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.7.1 Supplier List / Card View
Default view is card grid (same pattern as Sell CRM customers). T oggle to DataTable list view.
Card view: Each card shows: Supplier name, Category badge, Star rating (1-5), Last order date,
T otal spend (current FY), Preferred supplier flag (star icon). Click navigates to supplier detail.
List view columns:
Supplier NameT ext Yes Yes (search)
Category Badge Yes Yes (multi-select)
Type T ext Yes Yes (dropdown)
Rating Stars (1-5)Yes Yes (range)
On-Time DeliveryPercentageYes Yes (range)
Column Type Sortable Filterable

Supplier categories: Raw Materials, Components, T ools & Equipment, Services, Packaging,
Subcontractors, Other
Supplier types: Manufacturer, Distributor, Service Provider, Contractor
4.7.2 New Supplier / Edit Supplier
Uses the existing vendors table (shared with Book module). Form fields:
T otal Spend (FY)Currency Yes Yes (range)
Last Order Date Yes Yes (date range)
Status Badge
(Active/Inactive)
Yes Yes
Actions Dropdown No No
Company NameT ext Yes —
ABN T ext No Valid ABN format (11
digits)
ACN T ext No Valid ACN format (9
digits)
Address T extarea No —
Website URL No Valid URL
Primary Contact NameT ext Yes —
Primary Contact
Phone
Phone No —
Primary Contact EmailEmail Yes Valid email
Category Dropdown Yes From supplier
categories
Type Dropdown Yes From supplier types
Default Payment
T erms
Dropdown No COD, Net 7, Net 14,
Net 30, Net 60
Field Type Required Validation

4.7.3 Supplier Detail (Tabbed Interface)
Overview tab: All form fields from 4.7.2 in read/edit mode. Summary cards: T otal Spend (FY),
Open POs (count + value), Average Order Value, On-Time Delivery Rate.
Products tab: DataTable of products this supplier provides.
"Add Product" button opens a dialog to add a product to this supplier's price list. "Import Price
List" button for bulk CSV upload.
Orders tab: DataTable of all POs with this supplier. Columns: PO #, Date, Status, T otal, Receipt
Status, Bill Status. Filterable by date range and status. Summary row: T otal spend, Average order
value, Order frequency (orders/month).
Performance tab: KPI cards and charts:
Default Shipping
Method
Dropdown No —
Currency Dropdown No Default: AUD
Tax RegistrationT ext No —
Rating Star selector (1-5)No —
Notes T extarea No Max 5000 chars
Product Name T ext (link to product)—
Supplier Part #T ext Supplier's own part number
Unit Price Currency Current price from
supplier_price_lists
Lead Time (days)Number —
MOQ Number Minimum order quantity
Last PurchasedDate —
Preferred Checkbox Whether this is the preferred
supplier for this product
Column Type Notes

On-Time Delivery Rate: percentage, trend sparkline (last 12 months)
Quality Acceptance Rate: percentage of goods receipts with no rejections
Average Lead Time vs Quoted: days actual vs days promised
Price Trend: Recharts line chart showing average unit price over time for top 5 products
Defect Rate: percentage of received items rejected
Supplier Scorecard: weighted composite score from all KPIs
Documents tab: File list with upload. Supabase Storage. Document types: Contracts,
Certificates (ISO, AS/NZS), Insurance, T erms and Conditions, Price Lists, Quality Reports. Each
file: name, type badge, upload date, uploaded by, download button.
History / Activity tab: Timeline of all interactions: POs created, goods received, bills paid, notes
added, rating changes, contact updates. Each entry: timestamp, user, action, details.
```

</details>

## 4.8 Purchase Agreements (/buy/agreements)
### Purpose
4.8.1 Agreement List
DataTable with columns: Agreement #, Supplier, Type (Blanket/Standing/Framework), Start Date,
End Date, Status, Consumed %, T otal Value, Actions.
Status badges: Draft (grey), Active (green), Expiring (amber — within 30 days of end date),
Expired (red), Renewed (blue), Closed (muted).
4.8.2 New Agreement / Agreement Detail
Header fields:
Agreement NumberT ext (read-only)Auto (PA-YYYYMM-NNN)
Supplier Combobox Yes
Type Dropdown (Blanket Order /
Standing Order / Framework
Agreement)
Yes
Start Date Date Yes
End Date Date Yes
T erms T extarea No
Field Type Required

Line Items:
Standing Order schedule (for Standing Order type): Delivery frequency
(weekly/fortnightly/monthly), Quantity per delivery, Next delivery date.
Call-off Orders: "Create Call-off PO" button generates a PO from the agreement with pre-filled
supplier, products, and agreed prices. Consumed quantities increment automatically.
4.8.3 Agreement Status Flow
draft → active → expiring → expired → renewed | closed
draft → active: User activates agreement (start date reached or manual activation).
active → expiring: Automatic when current date is within 30 days of end date. Notification
sent to Purchasing Manager.
expiring → expired: End date passed. No new call-off POs can be created.
expired → renewed: User creates a new agreement referencing the expired one.
active/expiring → closed: Manual close before expiry.
Alerts: Notification when agreement is expiring (30 days), when consumption exceeds 80% of
max quantity.

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including create (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.8.1 Agreement List
DataTable with columns: Agreement #, Supplier, Type (Blanket/Standing/Framework), Start Date,
End Date, Status, Consumed %, T otal Value, Actions.
Status badges: Draft (grey), Active (green), Expiring (amber — within 30 days of end date),
Expired (red), Renewed (blue), Closed (muted).
4.8.2 New Agreement / Agreement Detail
Header fields:
Agreement NumberT ext (read-only)Auto (PA-YYYYMM-NNN)
Supplier Combobox Yes
Type Dropdown (Blanket Order /
Standing Order / Framework
Agreement)
Yes
Start Date Date Yes
End Date Date Yes
T erms T extarea No
Field Type Required

Line Items:
Standing Order schedule (for Standing Order type): Delivery frequency
(weekly/fortnightly/monthly), Quantity per delivery, Next delivery date.
Call-off Orders: "Create Call-off PO" button generates a PO from the agreement with pre-filled
supplier, products, and agreed prices. Consumed quantities increment automatically.
4.8.3 Agreement Status Flow
draft → active → expiring → expired → renewed | closed
draft → active: User activates agreement (start date reached or manual activation).
active → expiring: Automatic when current date is within 30 days of end date. Notification
sent to Purchasing Manager.
expiring → expired: End date passed. No new call-off POs can be created.
expired → renewed: User creates a new agreement referencing the expired one.
active/expiring → closed: Manual close before expiry.
Alerts: Notification when agreement is expiring (30 days), when consumption exceeds 80% of
max quantity.
```

</details>

## 4.9 Products — Procurement View (/buy/products)
### Purpose
This screen reads from the shared products table and displays procurement-specific fields. It is
NOT a separate product database.
Notes T extarea No
Product Combobox Yes
Agreed Price Currency Yes
Min Quantity Number No
Max Quantity Number Yes (for Blanket)
Qty Consumed Number (read-only)Auto (from POs linked to this
agreement)
Qty Remaining Number (read-only)Auto (Max - Consumed)
Field Type Required

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including filter (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
This screen reads from the shared products table and displays procurement-specific fields. It is
NOT a separate product database.
Notes T extarea No
Product Combobox Yes
Agreed Price Currency Yes
Min Quantity Number No
Max Quantity Number Yes (for Blanket)
Qty Consumed Number (read-only)Auto (from POs linked to this
agreement)
Qty Remaining Number (read-only)Auto (Max - Consumed)
Field Type Required

4.9.1 Product Procurement List
DataTable columns:
Reorder Alert logic: None = stock above reorder point. Warning = stock below reorder point but
above zero. Critical = stock at zero with open demand from Plan jobs.
4.9.2 Product Procurement Detail Tab
Accessed from product detail view. Shows procurement-specific information for a single
product.
Supplier Info Table: All suppliers who provide this product:
Product NameT ext Yes Yes (search)
SKU T ext Yes Yes
Preferred SupplierT ext Yes Yes (dropdown)
Last Purchase Price Currency Yes Yes (range)
Avg Purchase Price Currency Yes No
Lead Time (days)Number Yes Yes (range)
MOQ Number Yes No
Reorder PointNumber Yes No
Current StockNumber Yes Yes (range)
On Order QtyNumber Yes No
Reorder AlertIcon
(none/warning/critical)
Yes Yes
Column Type Sortable Filterable
BlueScopeBS-MS3-
$45.00 5 days10 sheets15 Feb
Yes
MetalCorpMC-3MS$42.50 7 days 20 sheets3 Jan 2026No
SupplierPart # Unit PriceLead TimeMOQ Last
Purchased
Preferred

Purchase History Chart: Recharts line chart showing purchase price over time, per supplier.
Identifies price trends and anomalies.
Reorder Rules:
When stock falls below reorder point: if Auto-Requisition is on, a purchase requisition is auto-
generated. If off, a notification is sent to the Purchasing Manager.
```

</details>

## 4.10 Reports & Analytics (/buy/reports)
### Purpose
4.10.1 Report Gallery
Grid of report cards, each showing: Report name, Description, Last generated date, "View"
button.
Available reports:
Min Stock LevelNumber 0
Reorder Point Number — (must be configured)
Reorder Quantity Number MOQ from preferred supplier
Preferred SupplierDropdown —
Auto-Requisition T oggle Off (configurable in settings)
Field Type Default
Spend AnalysisT otal spend by supplier,
category, period
Spend by supplier (bar chart),
Spend by category (pie), Trend
over time (line)
Supplier PerformanceOn-time delivery, quality, price
variance by supplier
Ranking table, Scorecard per
supplier
Purchase Price Variance Budgeted vs actual purchase
prices per product
Variance by product, Trend
over time
Order Cycle TimeAverage time from requisition
to receipt
By supplier, By product
category, Trend
Report Description Key Metrics

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.10.1 Report Gallery
Grid of report cards, each showing: Report name, Description, Last generated date, "View"
button.
Available reports:
Min Stock LevelNumber 0
Reorder Point Number — (must be configured)
Reorder Quantity Number MOQ from preferred supplier
Preferred SupplierDropdown —
Auto-Requisition T oggle Off (configurable in settings)
Field Type Default
Spend AnalysisT otal spend by supplier,
category, period
Spend by supplier (bar chart),
Spend by category (pie), Trend
over time (line)
Supplier PerformanceOn-time delivery, quality, price
variance by supplier
Ranking table, Scorecard per
supplier
Purchase Price Variance Budgeted vs actual purchase
prices per product
Variance by product, Trend
over time
Order Cycle TimeAverage time from requisition
to receipt
By supplier, By product
category, Trend
Report Description Key Metrics

4.10.2 Report Features (All Reports)
Date range picker (default: current month)
Drill-down: Click any chart segment to see underlying records
Export: CSV, Excel, PDF buttons in toolbar
Scheduled email delivery: Configure in Settings (daily/weekly/monthly, recipient list)
Print-optimised layout
```

</details>

## 4.11 Settings (/buy/settings)
### Purpose
The Settings page follows the established MW pattern: left-hand settings navigation with icon-
labelled panels, right-hand content area showing the active panel.
Open PO Report All POs with outstanding
deliveries
Aged by days overdue,
Supplier breakdown
Spend vs BudgetDepartment and job-level
procurement budget tracking
Budget utilisation %, Variance
analysis
Cog General Default currency, PO
numbering (prefix,
sequence), requisition
numbering, RFQ
numbering, goods
receipt numbering,
vendor bill numbering
Form inputs,
dropdowns, live
preview
ShieldCheckApprovals PO approval
thresholds by amount
range and role,
requisition approval
thresholds, vendor bill
approval thresholds,
delegation authority
with date range
Threshold table with
role and amount
columns, delegation
date pickers
Truck Receiving Default quality check
required toggle, partial
T oggle switches
Icon Panel Purpose Key Components

receipt allowed toggle,
photo required on
receipt toggle,
lot/serial tracking
prompt toggle
GitMerge Matching Three-way matching
tolerance — price
variance % (default
5%), quantity variance
% (default 2%), auto-
approve within
tolerance toggle
Number inputs with %
suffix, toggle
File T ext T emplates PO email template
(subject, body with
merge fields), RFQ
email template, PO
PDF template (layout,
logo, fields),
Amendment
notification template
T emplate editor with
merge field picker
AlertTriangle Reorder RulesDefault reorder
behaviour: auto-
requisition or
notification only,
default safety stock
days, default reorder
quantity source
(MOQ/fixed/calculated
)
Radio buttons, number
inputs
Link IntegrationsXero PO sync toggle
(push POs to Xero on
send), Xero bill sync
toggle (push approved
bills as ACCPAY). Sync
status indicators.
T oggle switches,
status dots, last sync
timestamp

Future: Supplier portal,
EDI.
CalculatorPrice Rules Default markup on
supplier prices (for
cost estimation), price
break rules table,
currency conversion
rates for multi-
currency purchasing
Number inputs,
editable table with
quantity break
thresholds

### Data
- UI components and widgets named in specification body.
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Settings page follows the established MW pattern: left-hand settings navigation with icon-
labelled panels, right-hand content area showing the active panel.
Open PO Report All POs with outstanding
deliveries
Aged by days overdue,
Supplier breakdown
Spend vs BudgetDepartment and job-level
procurement budget tracking
Budget utilisation %, Variance
analysis
Cog General Default currency, PO
numbering (prefix,
sequence), requisition
numbering, RFQ
numbering, goods
receipt numbering,
vendor bill numbering
Form inputs,
dropdowns, live
preview
ShieldCheckApprovals PO approval
thresholds by amount
range and role,
requisition approval
thresholds, vendor bill
approval thresholds,
delegation authority
with date range
Threshold table with
role and amount
columns, delegation
date pickers
Truck Receiving Default quality check
required toggle, partial
T oggle switches
Icon Panel Purpose Key Components

receipt allowed toggle,
photo required on
receipt toggle,
lot/serial tracking
prompt toggle
GitMerge Matching Three-way matching
tolerance — price
variance % (default
5%), quantity variance
% (default 2%), auto-
approve within
tolerance toggle
Number inputs with %
suffix, toggle
File T ext T emplates PO email template
(subject, body with
merge fields), RFQ
email template, PO
PDF template (layout,
logo, fields),
Amendment
notification template
T emplate editor with
merge field picker
AlertTriangle Reorder RulesDefault reorder
behaviour: auto-
requisition or
notification only,
default safety stock
days, default reorder
quantity source
(MOQ/fixed/calculated
)
Radio buttons, number
inputs
Link IntegrationsXero PO sync toggle
(push POs to Xero on
send), Xero bill sync
toggle (push approved
bills as ACCPAY). Sync
status indicators.
T oggle switches,
status dots, last sync
timestamp

Future: Supplier portal,
EDI.
CalculatorPrice Rules Default markup on
supplier prices (for
cost estimation), price
break rules table,
currency conversion
rates for multi-
currency purchasing
Number inputs,
editable table with
quantity break
thresholds
```

</details>
