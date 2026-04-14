# Control — §4 Screen-by-Screen Specification

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) — combined MirrorWorks module specification. **Control** module, **Section 4** (screen-by-screen). Text below was extracted from the PDF and structured per project guidelines.

| Reference | Path |
| --- | --- |
| Module spec (PDF) | [`../MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) |
| All §4 extracts (index) | [`README.md`](./README.md) |
| Prototype routes | [`PrototypeRouteMap.md#control`](./PrototypeRouteMap.md#control) · [`src/routes.tsx`](../../routes.tsx) |

**Status:** §4 content extracted from PDF into Purpose / Data / Actions / States. The PDF remains authoritative if wording diverges.

## Prototype mapping

Full route ↔ component list: **[`PrototypeRouteMap.md` — Control](PrototypeRouteMap.md#control)**.

---

## §4 Screens

## 4.1 Dashboard (/control )
### Purpose
[Figma: MW-UX / Control Canvas --- Dashboard]
The Control dashboard is the executive overview of the entire M irrorWorks platform. It
aggregates KPIs from all six operational modules into a single bento grid layout, providing
management with at-a-glance visibility into business health.
4.1.1 Executive KPIs (Top-Row Stat Cards)
Four <StatCard> components displayed in a horizontal row at the top of the dashboard:
Each stat card includes: label text (14px Roboto Medium), value text (32px Roboto Bold), trend
arrow (Lucide TrendingUp or TrendingDown ), trend percentage, and sparkline chart
(Recharts <AreaChart> with MW Yellow fill, 7-day data points).
4.1.2 Company Performance Chart
<ChartCard> spanning two columns of the bento grid. Recharts <ComposedChart>
showing:
Revenue (MTD)invoices table
(Book)
AUD currency, 2
decimal places
vs. prior month
Active Jobsplan_jobs table
(Plan) where status =
'in_progress'
Integer countvs. prior week
On-Time Delivery %shipments table
(Ship)
Percentage, 1 decimal
place
vs. prior month
Machine Utilisationmachine_status_l
ogs table (Control)
Percentage, 1 decimal
place
vs. prior week
KPI Data SourceFormat Trend Period

Revenue (bar chart, MW Yellow #FFCF4B )
Costs (bar chart, MW Earth #8FA6A6 )
Margin % (line overlay, Success #36B37E )
Time period selector: Week / Month / Quarter / Year. Default: Month.
Data source: Aggregated from invoices (revenue), job_costs (costs), calculated margin.
4.1.3 System Health Card
Single bento cell with Andon-style status indicators. Three rows:
Status colours follow the semantic palette: Success #36B37E , Warning #FACC15 , Error 
#DE350B .
4.1.4 Operations Status Grid
A 2×3 grid of mini status cards, one per operational module:
Database Green (< 200ms p95) / Amber
(200--500ms) / Red (>
500ms)
Supabase health endpoint
Xero Sync Green (synced < 1hr ago) /
Amber (1--4hrs) / Red (> 4hrs
or error)
accounting_integrations
.last_sync_at
Active Users Count of currently logged-in
users
Supabase Realtime presence
System Status IndicatorSource
Sell Open Opportunities (count)Pipeline Value (AUD)
Plan Scheduled Jobs (count)Overdue Jobs (count, red if >
0)
Make Active Work Orders (count)Machine Downtime (hours
today)
Ship Pending Shipments (count)Shipments Dispatched T oday
(count)
Module Primary Metric Secondary Metric

Each card is clickable, navigating to the respective module's dashboard. Cards with
overdue/alert counts display an Error #DE350B badge.
4.1.5 Recent Activity Feed
Vertical scrolling list …

### Data
- See extract: data sources and entities described in body.
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including create (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- Dashboard]
The Control dashboard is the executive overview of the entire M irrorWorks platform. It
aggregates KPIs from all six operational modules into a single bento grid layout, providing
management with at-a-glance visibility into business health.
4.1.1 Executive KPIs (Top-Row Stat Cards)
Four <StatCard> components displayed in a horizontal row at the top of the dashboard:
Each stat card includes: label text (14px Roboto Medium), value text (32px Roboto Bold), trend
arrow (Lucide TrendingUp or TrendingDown ), trend percentage, and sparkline chart
(Recharts <AreaChart> with MW Yellow fill, 7-day data points).
4.1.2 Company Performance Chart
<ChartCard> spanning two columns of the bento grid. Recharts <ComposedChart>
showing:
Revenue (MTD)invoices table
(Book)
AUD currency, 2
decimal places
vs. prior month
Active Jobsplan_jobs table
(Plan) where status =
'in_progress'
Integer countvs. prior week
On-Time Delivery %shipments table
(Ship)
Percentage, 1 decimal
place
vs. prior month
Machine Utilisationmachine_status_l
ogs table (Control)
Percentage, 1 decimal
place
vs. prior week
KPI Data SourceFormat Trend Period

Revenue (bar chart, MW Yellow #FFCF4B )
Costs (bar chart, MW Earth #8FA6A6 )
Margin % (line overlay, Success #36B37E )
Time period selector: Week / Month / Quarter / Year. Default: Month.
Data source: Aggregated from invoices (revenue), job_costs (costs), calculated margin.
4.1.3 System Health Card
Single bento cell with Andon-style status indicators. Three rows:
Status colours follow the semantic palette: Success #36B37E , Warning #FACC15 , Error 
#DE350B .
4.1.4 Operations Status Grid
A 2×3 grid of mini status cards, one per operational module:
Database Green (< 200ms p95) / Amber
(200--500ms) / Red (>
500ms)
Supabase health endpoint
Xero Sync Green (synced < 1hr ago) /
Amber (1--4hrs) / Red (> 4hrs
or error)
accounting_integrations
.last_sync_at
Active Users Count of currently logged-in
users
Supabase Realtime presence
System Status IndicatorSource
Sell Open Opportunities (count)Pipeline Value (AUD)
Plan Scheduled Jobs (count)Overdue Jobs (count, red if >
0)
Make Active Work Orders (count)Machine Downtime (hours
today)
Ship Pending Shipments (count)Shipments Dispatched T oday
(count)
Module Primary Metric Secondary Metric

Each card is clickable, navigating to the respective module's dashboard. Cards with
overdue/alert counts display an Error #DE350B badge.
4.1.5 Recent Activity Feed
Vertical scrolling list in a single bento cell. Each activity item includes:
User avatar (32px circle)
User name and role badge
Action description (e.g., "Created quote QT-2024-0147 for $12,450")
Timestamp (relative: "5 min ago", "2 hours ago"; absolute on hover)
Module badge (colour-coded: Sell = blue, Plan = purple, Make = orange, Ship = green, Book =
teal, Buy = brown)
Data source: audit_logs table, ordered by created_at DESC , limited to 20 most recent
entries.
4.1.6 Quick Actions
Row of action buttons at the bottom of the bento grid:
Book Outstanding Invoices (AUD)Overdue Invoices (count, red if
> 0)
Buy Open POs (count)Overdue Deliveries (count, red
if > 0)
New Product Package /control/products →
Create dialog
New Employee UserPlus /control/people →
Create dialog
Import Data Upload /control/settings/data
→ Import wizard
Run Report BarChart3 /control/analytics →
Report builder
Action Icon Navigation Target

All buttons: 56px min-height, MW Yellow #FFCF4B background, text-[#1A2732] text
colour.
```

</details>

## 4.2 Factory Locations (/control/locations )
### Purpose
[Figma: MW-UX / Control Canvas --- Factory Locations]
4.2.1 Location DataTable
<DataTable> listing all factory locations for the organisation.
Columns:
T oolbar: Search (filters on name and address), Type filter dropdown, Status filter dropdown,
"Add Location" primary button.
4.2.2 Location Detail Card
Slide-over panel (480px width) or full-page view with four tabs:
Overview Tab:
Location NameString Yes Primary identifier
Address String Yes Street address, city,
state, postcode
Type Enum Yes Factory / Warehouse /
Office / Yard
Status Badge Yes Active / Inactive /
Under Maintenance
Machines Integer Yes Count of machines
assigned
Employees Integer Yes Count of employees
assigned
Utilisation %PercentageYes Average machine
utilisation across
location
Actions Button groupNo View, Edit, Archive
Column Type Sortable Notes

Location name (editable text input)
Address fields: Street, City, State (dropdown: NSW, VIC, QLD, SA, WA, TAS, NT, ACT),
Postcode, Country (default: Australia)
Type selector (Factory / Warehouse / Office / Yard)
Status toggle (Active / Inactive / Under Maintenance)
Contact person (employee selector from People)
Phone number
Operating hours (start/end time pickers per day of week)
Notes (rich text area)
Layout Tab:
<FactoryLayoutDesigner> component --- Babylon.js-powered 2D/3D factory floor
visualisation. Allows drag-and-drop placement of machines, work centres, and zones onto a
floor plan. Grid snapping at 500mm intervals. Machine icons reflect real machine types (press
brake, laser, saw, welder) from the Machines registry.
Equipment Tab:
<DataTable> of machines assigned to this location. Columns: Machine Name, Type, Work
Centre, Status, OEE %. "Assign Machine" button opens a selector from the master Machines list.
Personnel Tab:
<DataTable> of employees assigned to this location. Columns: Name, Department, Title,
Shift, Status. "Assign Employee" button opens a selector from the People directory.

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including edit (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- Factory Locations]
4.2.1 Location DataTable
<DataTable> listing all factory locations for the organisation.
Columns:
T oolbar: Search (filters on name and address), Type filter dropdown, Status filter dropdown,
"Add Location" primary button.
4.2.2 Location Detail Card
Slide-over panel (480px width) or full-page view with four tabs:
Overview Tab:
Location NameString Yes Primary identifier
Address String Yes Street address, city,
state, postcode
Type Enum Yes Factory / Warehouse /
Office / Yard
Status Badge Yes Active / Inactive /
Under Maintenance
Machines Integer Yes Count of machines
assigned
Employees Integer Yes Count of employees
assigned
Utilisation %PercentageYes Average machine
utilisation across
location
Actions Button groupNo View, Edit, Archive
Column Type Sortable Notes

Location name (editable text input)
Address fields: Street, City, State (dropdown: NSW, VIC, QLD, SA, WA, TAS, NT, ACT),
Postcode, Country (default: Australia)
Type selector (Factory / Warehouse / Office / Yard)
Status toggle (Active / Inactive / Under Maintenance)
Contact person (employee selector from People)
Phone number
Operating hours (start/end time pickers per day of week)
Notes (rich text area)
Layout Tab:
<FactoryLayoutDesigner> component --- Babylon.js-powered 2D/3D factory floor
visualisation. Allows drag-and-drop placement of machines, work centres, and zones onto a
floor plan. Grid snapping at 500mm intervals. Machine icons reflect real machine types (press
brake, laser, saw, welder) from the Machines registry.
Equipment Tab:
<DataTable> of machines assigned to this location. Columns: Machine Name, Type, Work
Centre, Status, OEE %. "Assign Machine" button opens a selector from the master Machines list.
Personnel Tab:
<DataTable> of employees assigned to this location. Columns: Name, Department, Title,
Shift, Status. "Assign Employee" button opens a selector from the People directory.
```

</details>

## 4.3 Machines (/control/machines )
### Purpose
[Figma: MW-UX / Control Canvas --- Machines]
4.3.1 Machine DataTable
<DataTable> listing all machines in the organisation.
Columns:
Machine ID String (monospace)Yes Auto-generated: 
MCH-XXXX
Machine NameString Yes e.g., "Trumpf TruLaser
3030"
Column Type Sortable Notes

T oolbar: Search, Type filter, Work Centre filter, Status filter, Location filter, "Add Machine"
primary button.
4.3.2 Machine Detail Card
Tabbed detail view with four tabs:
Overview Tab:
Machine ID (read-only)
Machine Name (editable)
Type selector (enum as listed above)
Manufacturer (text input)
Model (text input)
Serial Number (text input)
Type Enum Yes Laser, Press Brake,
Saw, Welder, CNC Mill,
CNC Lathe, Punch,
Folder, Guillotine, Drill,
Grinder, Paint Booth,
Assembly Station,
Other
Work CentreString Yes Logical grouping (e.g.,
"Cutting", "Forming",
"Welding")
Location String Yes Factory location name
Status Badge Yes Running / Idle /
Maintenance / Down
OEE % PercentageYes Overall Equipment
Effectiveness
Next MaintenanceDate Yes Scheduled
maintenance date
Actions Button groupNo View, Edit, Log
Maintenance

Year of Manufacture (number input)
Work Centre assignment (dropdown)
Location assignment (dropdown from Factory Locations)
Status selector (Running / Idle / Maintenance / Down)
Hourly rate (AUD, used for job costing in Book)
Setup time default (minutes, used as default in Plan routings)
Photo upload (Supabase Storage)
Notes (rich text area)
Maintenance Log Tab:
<DataTable> of maintenance records:
Date
Type (Scheduled / Unscheduled / Breakdown)
Description
Duration (hours)
Cost (AUD)
T echnician (employee selector)
Parts used (text area)
Status (Pending / In Progress / Complete)
"Log Maintenance" button opens <CardFormDialog> .
Performance Tab:
OEE trend chart (Recharts <LineChart> , 30-day rolling, breakdown into Availability ×
Performance × Quality)
Uptime vs Downtime pie chart
Job count per week (bar chart)
Average cycle time trend
Data source: machine_status_logs and time_entries tables.
Specifications Tab:
Key-value pairs for machine specifications (editable):
Max sheet size (mm × mm)
Max material thickness (mm)
Max tonnage (for press brakes, tonnes)

Power requirements (kW)
Compressed air requirements (L/min)
Weight (kg)
Dimensions: L × W × H (mm)
Custom specification fields (admin-configurable key-value pairs)
4.3.3 Machine Status Indicators
Machine status follows Andon visual management principles:
Status changes are logged to machine_status_logs with timestamp, previous …

### Data
- See extract: data sources and entities described in body.
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including edit (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- Machines]
4.3.1 Machine DataTable
<DataTable> listing all machines in the organisation.
Columns:
Machine ID String (monospace)Yes Auto-generated: 
MCH-XXXX
Machine NameString Yes e.g., "Trumpf TruLaser
3030"
Column Type Sortable Notes

T oolbar: Search, Type filter, Work Centre filter, Status filter, Location filter, "Add Machine"
primary button.
4.3.2 Machine Detail Card
Tabbed detail view with four tabs:
Overview Tab:
Machine ID (read-only)
Machine Name (editable)
Type selector (enum as listed above)
Manufacturer (text input)
Model (text input)
Serial Number (text input)
Type Enum Yes Laser, Press Brake,
Saw, Welder, CNC Mill,
CNC Lathe, Punch,
Folder, Guillotine, Drill,
Grinder, Paint Booth,
Assembly Station,
Other
Work CentreString Yes Logical grouping (e.g.,
"Cutting", "Forming",
"Welding")
Location String Yes Factory location name
Status Badge Yes Running / Idle /
Maintenance / Down
OEE % PercentageYes Overall Equipment
Effectiveness
Next MaintenanceDate Yes Scheduled
maintenance date
Actions Button groupNo View, Edit, Log
Maintenance

Year of Manufacture (number input)
Work Centre assignment (dropdown)
Location assignment (dropdown from Factory Locations)
Status selector (Running / Idle / Maintenance / Down)
Hourly rate (AUD, used for job costing in Book)
Setup time default (minutes, used as default in Plan routings)
Photo upload (Supabase Storage)
Notes (rich text area)
Maintenance Log Tab:
<DataTable> of maintenance records:
Date
Type (Scheduled / Unscheduled / Breakdown)
Description
Duration (hours)
Cost (AUD)
T echnician (employee selector)
Parts used (text area)
Status (Pending / In Progress / Complete)
"Log Maintenance" button opens <CardFormDialog> .
Performance Tab:
OEE trend chart (Recharts <LineChart> , 30-day rolling, breakdown into Availability ×
Performance × Quality)
Uptime vs Downtime pie chart
Job count per week (bar chart)
Average cycle time trend
Data source: machine_status_logs and time_entries tables.
Specifications Tab:
Key-value pairs for machine specifications (editable):
Max sheet size (mm × mm)
Max material thickness (mm)
Max tonnage (for press brakes, tonnes)

Power requirements (kW)
Compressed air requirements (L/min)
Weight (kg)
Dimensions: L × W × H (mm)
Custom specification fields (admin-configurable key-value pairs)
4.3.3 Machine Status Indicators
Machine status follows Andon visual management principles:
Status changes are logged to machine_status_logs with timestamp, previous status, new
status, user, and reason. Real-time updates via Supabase Realtime subscriptions.
```

</details>

## 4.4 Inventory (/control/inventory )
### Purpose
[Figma: MW-UX / Control Canvas --- Inventory]
4.4.1 Summary Statistics
Four <StatCard> components at the top of the inventory page:
Running #36B37E
(Success)
success Play Machine is
actively
producing
Idle #FACC15
(Warning)
warning Pause Machine is
available but not
in use
Maintenance#0052CC (Info)info Wrench Scheduled
maintenance in
progress
Down #DE350B (Error)destructive AlertTriangl
e
Unplanned
downtime or
breakdown
Status Colour Badge VariantIcon Description
T otal SKUs COUNT(*) from 
inventory_items where 
Integer
Stat Calculation Format

### Data
- UI components and widgets named in specification body.
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including opens (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- Inventory]
4.4.1 Summary Statistics
Four <StatCard> components at the top of the inventory page:
Running #36B37E
(Success)
success Play Machine is
actively
producing
Idle #FACC15
(Warning)
warning Pause Machine is
available but not
in use
Maintenance#0052CC (Info)info Wrench Scheduled
maintenance in
progress
Down #DE350B (Error)destructive AlertTriangl
e
Unplanned
downtime or
breakdown
Status Colour Badge VariantIcon Description
T otal SKUs COUNT(*) from 
inventory_items where 
Integer
Stat Calculation Format

4.4.2 Inventory DataTable
<DataTable> of all inventory items.
Columns:
status = 'active'
T otal Stock ValueSUM(on_hand_qty *
unit_cost) from 
inventory_items
AUD currency
Low Stock ItemsCOUNT(*) where 
available_qty <=
reorder_point
Integer (red badge if > 0)
Inventory Accuracy %Last cycle count accuracy
(counted matches / total
counted × 100)
Percentage
SKU String (monospace)Yes Stock Keeping Unit
code
Product NameString Yes Linked to Products
catalogue
Category Enum Yes Raw Material /
Component / Finished
Good / Consumable
Location String Yes Warehouse / zone
location
On Hand Number Yes Physical quantity in
stock
Allocated Number Yes Reserved for active
jobs
Available Number (calculated)Yes On Hand − Allocated
On Order Number Yes Quantity on open POs
Column Type Sortable Notes

T oolbar: Search (SKU, product name), Category filter, Location filter, Stock Status filter, "Add
Item" button, "Cycle Count" button, "Import" button.
4.4.3 Stock Status Logic
Stock status is calculated from available quantity relative to reorder point:
4.4.4 Inventory Adjustment Workflow
Stock adjustments are made via the "Adjust Stock" action on an inventory item. Opens a 
<CardFormDialog> with:
Current on-hand quantity (read-only)
Unit String No UoM (ea, kg, m, m²,
sheet)
Unit Cost Currency Yes AUD per unit
T otal ValueCurrency (calculated)Yes On Hand × Unit Cost
Reorder PointNumber Yes Minimum stock before
reorder trigger
Stock StatusBadge Yes OK / Low / Critical /
Out of Stock
Last CountedDate Yes Last cycle count date
1 type StockStatus = 'ok' | 'low' | 'critical' | 'out_of_stock';
3 function getStockStatus(available: number, reorderPoint: number): StockStatus {
4 if (available <= 0) return 'out_of_stock'; // Red badge
5 if (available <= reorderPoint * 0.5) return 'critical'; // Red badge
6 if (available <= reorderPoint) return 'low'; // Amber badge
7 return 'ok'; // Green badge
8 }
OK #36B37E Available > Reorder Point
Low #FACC15 Available ≤ Reorder Point
Critical #DE350B Available ≤ 50% of Reorder
Point
Out of Stock #DE350B (pulsing)Available ≤ 0
Status Colour Threshold

Adjustment type: Receive (+), Issue (−), Count Correction (±), Scrap (−), 
Transfer (move between locations)
Quantity (number input, must be positive)
Reason (required text input)
Reference (optional: job number, PO number, delivery docket)
Location (for transfers: source and destination)
Every adjustment creates an inventory_transactions record with: item_id , 
adjustment_type , quantity , reason , reference , user_id , created_at , 
before_qty , after_qty . This table is append-only (no updates or deletes).
```

</details>

## 4.5 Purchase (/control/purchase )
### Purpose
[Figma: MW-UX / Control Canvas --- Purchase]
The Purchase page in Control provides organisation-level vendor management and purchase
order oversight. This is distinct from the Buy module's operational procurement workflow ---
Control surfaces the administrative view for vendor database management and PO approval
oversight.
4.5.1 Purchase Orders Tab
<DataTable> of all purchase orders.
Columns:
PO Number String (monospace)Yes Auto-generated: PO-
YYYY-XXXX
Vendor String Yes Supplier name
Status Badge Yes Draft / Pending
Approval / Approved /
Sent / Partially
Received / Received /
Cancelled
Order Date Date Yes PO creation date
Expected DeliveryDate Yes Expected receipt date
Column Type Sortable Notes

T oolbar: Search (PO number, vendor), Status filter, Date range filter, Vendor filter.
4.5.2 Vendors Tab
<DataTable> of all vendors/suppliers in the organisation.
Columns:
T otal (excl. GST)Currency Yes AUD
T otal (incl. GST)Currency Yes AUD
Job ReferenceString Yes Linked job number (if
applicable)
Buyer String Yes User who created the
PO
Actions Button groupNo View, Approve, Cancel
Vendor NameString Yes Company name
Contact PersonString Yes Primary contact
Category Enum Yes Steel Supplier /
Consumables /
Subcontractor /
T ooling / Freight /
Services / Other
Rating Stars (1--5)Yes Performance rating
On-Time Delivery %PercentageYes Calculated from goods
receipts
YTD Spend Currency Yes T otal spend current
financial year (July--
June)
Status Badge Yes Active / Preferred / On
Hold / Blacklisted
Actions Button groupNo View, Edit, Archive
Column Type Sortable Notes

T oolbar: Search, Category filter, Status filter, "Add Vendor" button.
4.5.3 PO Detail Card
Full-page view with tabs:
Details Tab:
PO number (read-only), status badge, creation date
Vendor selector (from Vendors table)
Delivery address (default: primary factory location)
Expected delivery date
Payment terms (Net 7 / Net 14 / Net 30 / Net 60 / COD)
Notes / special instructions
Approval status with approver name and timestamp
Line Items Tab:
<DataTable> of PO line items:
Product (selector from Products catalogue)
Description
Quantity
Unit price (AUD)
GST (10% default for AU, adjustable)
Line total
Job reference (optional link to plan_ jobs)
Receiving Tab:
Summary of goods receipts against this PO:
Receipt date, quantities received per line, discrepancies, quality notes
Linked to Buy module goods receipt workflow
History Tab:
Audit trail of all PO changes: creation, amendments, approvals, status changes, …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including edit (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- Purchase]
The Purchase page in Control provides organisation-level vendor management and purchase
order oversight. This is distinct from the Buy module's operational procurement workflow ---
Control surfaces the administrative view for vendor database management and PO approval
oversight.
4.5.1 Purchase Orders Tab
<DataTable> of all purchase orders.
Columns:
PO Number String (monospace)Yes Auto-generated: PO-
YYYY-XXXX
Vendor String Yes Supplier name
Status Badge Yes Draft / Pending
Approval / Approved /
Sent / Partially
Received / Received /
Cancelled
Order Date Date Yes PO creation date
Expected DeliveryDate Yes Expected receipt date
Column Type Sortable Notes

T oolbar: Search (PO number, vendor), Status filter, Date range filter, Vendor filter.
4.5.2 Vendors Tab
<DataTable> of all vendors/suppliers in the organisation.
Columns:
T otal (excl. GST)Currency Yes AUD
T otal (incl. GST)Currency Yes AUD
Job ReferenceString Yes Linked job number (if
applicable)
Buyer String Yes User who created the
PO
Actions Button groupNo View, Approve, Cancel
Vendor NameString Yes Company name
Contact PersonString Yes Primary contact
Category Enum Yes Steel Supplier /
Consumables /
Subcontractor /
T ooling / Freight /
Services / Other
Rating Stars (1--5)Yes Performance rating
On-Time Delivery %PercentageYes Calculated from goods
receipts
YTD Spend Currency Yes T otal spend current
financial year (July--
June)
Status Badge Yes Active / Preferred / On
Hold / Blacklisted
Actions Button groupNo View, Edit, Archive
Column Type Sortable Notes

T oolbar: Search, Category filter, Status filter, "Add Vendor" button.
4.5.3 PO Detail Card
Full-page view with tabs:
Details Tab:
PO number (read-only), status badge, creation date
Vendor selector (from Vendors table)
Delivery address (default: primary factory location)
Expected delivery date
Payment terms (Net 7 / Net 14 / Net 30 / Net 60 / COD)
Notes / special instructions
Approval status with approver name and timestamp
Line Items Tab:
<DataTable> of PO line items:
Product (selector from Products catalogue)
Description
Quantity
Unit price (AUD)
GST (10% default for AU, adjustable)
Line total
Job reference (optional link to plan_ jobs)
Receiving Tab:
Summary of goods receipts against this PO:
Receipt date, quantities received per line, discrepancies, quality notes
Linked to Buy module goods receipt workflow
History Tab:
Audit trail of all PO changes: creation, amendments, approvals, status changes, goods receipts,
invoice matching. Each entry shows user, timestamp, and before/after values.
4.5.4 Vendor Detail Card
Full-page view with tabs:
Overview Tab:

Company name, ABN, address, phone, email, website
Primary contact name, title, phone, email
Category selector
Payment terms default
Currency (default AUD)
Tax registration status
Status selector (Active / Preferred / On Hold / Blacklisted)
Notes
Price Lists Tab:
<DataTable> of products supplied by this vendor with: Product, Unit price, MOQ (minimum
order quantity), Lead time (days), Last updated date. Price history chart per product.
Performance Tab:
On-time delivery % (trend chart, 12 months)
Quality acceptance % (trend chart, 12 months)
Average lead time vs quoted lead time
Price trend per key product
Documents Tab:
File upload area for vendor-related documents: T erms & Conditions, insurance certificates,
quality certifications, price lists (PDF). Stored in Supabase Storage.
```

</details>

## 4.6 People (/control/people )
### Purpose
[Figma: MW-UX / Control Canvas --- People]
4.6.1 Employee DataTable
<DataTable> of all employees in the organisation.
Columns:
Avatar Image (40px circle)No Employee photo or
initials
Full Name String Yes First name + surname
Column Type Sortable Notes

T oolbar: Search (name, employee ID), Department filter, Location filter, Status filter, "Add
Employee" button, "Import" button.
4.6.2 Employee Detail Card
Full-page view with four tabs:
Overview Tab:
Photo upload (circular crop, 200px)
First name, surname, preferred name
Employee ID (read-only)
Date of birth
Email, phone, emergency contact (name, relationship, phone)
Department, title, manager (employee selector)
Location assignment
Start date, employment type (Full-time / Part-time / Casual / Contractor)
Employee IDString (monospace)Yes Auto-generated: 
EMP-XXXX
DepartmentEnum Yes Production / Office /
Sales / Warehouse /
Management /
Maintenance
Title String Yes Job title
Location String Yes Factory location
Manager String Yes Reporting manager
name
MirrorWorks RoleBadge Yes Platform role (Admin,
Manager, Supervisor,
Operator, etc.)
Status Badge Yes Active / On Leave /
T erminated
Actions Button groupNo View, Edit, Deactivate

M irrorWorks role assignment (dropdown: Operator, Supervisor, Scheduler, Estimator,
Manager, Admin, Quality, Maintenance)
Status toggle
Notes
Skills Tab:
<SkillsMatrix> component --- a visual grid showing:
Skill categories (rows): Laser Cutting, Press Brake, Welding (MIG/TIG/Stick), CNC
Programming, Assembly, Quality Inspection, Forklift, Overhead Crane, First Aid, etc.
Proficiency levels (columns): None / Basic / Competent / Proficient / Expert
Certification expiry dates where applicable
Add/remove skills via inline editing
Training Tab:
<DataTable> of training records:
Training name, provider, date completed, expiry date, certificate upload
Compliance status: Current / Expiring Soon (< 30 days) / Expired
"Add Training" button
Performance Tab:
Attendance summary (days worked, sick days, leave balance)
Productivity metrics (if available from Make time entries)
Performance notes (rich text, date-stamped entries by managers)
4.6.3 Organisation Chart
Visual tree diagram showing reporting hierarchy. Built with a recursive component rendering 
<Card> nodes with connecting lines. Each node displays: avatar, name, title, department. Click
a node to navigate to employee detail. Expandable/collapsible branches.

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- People]
4.6.1 Employee DataTable
<DataTable> of all employees in the organisation.
Columns:
Avatar Image (40px circle)No Employee photo or
initials
Full Name String Yes First name + surname
Column Type Sortable Notes

T oolbar: Search (name, employee ID), Department filter, Location filter, Status filter, "Add
Employee" button, "Import" button.
4.6.2 Employee Detail Card
Full-page view with four tabs:
Overview Tab:
Photo upload (circular crop, 200px)
First name, surname, preferred name
Employee ID (read-only)
Date of birth
Email, phone, emergency contact (name, relationship, phone)
Department, title, manager (employee selector)
Location assignment
Start date, employment type (Full-time / Part-time / Casual / Contractor)
Employee IDString (monospace)Yes Auto-generated: 
EMP-XXXX
DepartmentEnum Yes Production / Office /
Sales / Warehouse /
Management /
Maintenance
Title String Yes Job title
Location String Yes Factory location
Manager String Yes Reporting manager
name
MirrorWorks RoleBadge Yes Platform role (Admin,
Manager, Supervisor,
Operator, etc.)
Status Badge Yes Active / On Leave /
T erminated
Actions Button groupNo View, Edit, Deactivate

M irrorWorks role assignment (dropdown: Operator, Supervisor, Scheduler, Estimator,
Manager, Admin, Quality, Maintenance)
Status toggle
Notes
Skills Tab:
<SkillsMatrix> component --- a visual grid showing:
Skill categories (rows): Laser Cutting, Press Brake, Welding (MIG/TIG/Stick), CNC
Programming, Assembly, Quality Inspection, Forklift, Overhead Crane, First Aid, etc.
Proficiency levels (columns): None / Basic / Competent / Proficient / Expert
Certification expiry dates where applicable
Add/remove skills via inline editing
Training Tab:
<DataTable> of training records:
Training name, provider, date completed, expiry date, certificate upload
Compliance status: Current / Expiring Soon (< 30 days) / Expired
"Add Training" button
Performance Tab:
Attendance summary (days worked, sick days, leave balance)
Productivity metrics (if available from Make time entries)
Performance notes (rich text, date-stamped entries by managers)
4.6.3 Organisation Chart
Visual tree diagram showing reporting hierarchy. Built with a recursive component rendering 
<Card> nodes with connecting lines. Each node displays: avatar, name, title, department. Click
a node to navigate to employee detail. Expandable/collapsible branches.
```

</details>

## 4.7 Products (/control/products )
### Purpose
[Figma: MW-UX / Control Canvas --- Products]
4.7.1 Product DataTable
<DataTable> of the master product catalogue. This is the organisation-wide product registry;
the Sell module's product page is a filtered view for sales-facing items.
Columns:

T oolbar: Search (code, name), Category filter, Type filter, Status filter, "Add Product" button,
"Import" button.
4.7.2 Product Detail
The product detail view mirrors the Sell module's product detail structure (see MW-SELL-SPEC-
001, Section 4.7) with five tabs:
Overview Tab: Product name, code, description, category, type, images gallery, sell price, cost
price, tax code (GST/GST-Free), unit of measure, barcode/SKU, status, tags.
Thumbnail Image (48×48px)No Product photo
Product CodeString (monospace)Yes Auto-generated or
manual: PRD-XXXX
Product NameString Yes Descriptive name
Category Enum Yes Finished Product /
Sub-Assembly /
Component / Raw
Material / Consumable
/ Service
Type Enum Yes Make / Buy / Make or
Buy
Sell Price Currency Yes AUD (ex. GST)
Cost Price Currency Yes AUD (ex. GST)
Margin % Percentage
(calculated)
Yes (Sell − Cost) / Sell ×
Stock LevelNumber Yes Current on-hand
quantity
Status Badge Yes Active / Draft /
Discontinued
Actions Button groupNo View, Edit, Duplicate,
Archive
Column Type Sortable Notes

Manufacturing Tab: Default BOM (linked to BOMs page), routing template (sequence of
operations with machine type and estimated time), material specifications, quality standards,
drawing references (file upload or Autodesk Viewer embed).
Inventory Tab: Current stock by location, reorder point, reorder quantity, safety stock, lead time
(days), lot/serial tracking toggle, warehouse location assignment.
Accounting Tab: Revenue account (from Xero COA), COGS account, inventory account, tax
code mapping, cost method (Standard / Average / FIFO).
Documents Tab: File attachments --- drawings (PDF/DWG), spec sheets, photos, certifications.
Stored in Supabase Storage.

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
[Figma: MW-UX / Control Canvas --- Products]
4.7.1 Product DataTable
<DataTable> of the master product catalogue. This is the organisation-wide product registry;
the Sell module's product page is a filtered view for sales-facing items.
Columns:

T oolbar: Search (code, name), Category filter, Type filter, Status filter, "Add Product" button,
"Import" button.
4.7.2 Product Detail
The product detail view mirrors the Sell module's product detail structure (see MW-SELL-SPEC-
001, Section 4.7) with five tabs:
Overview Tab: Product name, code, description, category, type, images gallery, sell price, cost
price, tax code (GST/GST-Free), unit of measure, barcode/SKU, status, tags.
Thumbnail Image (48×48px)No Product photo
Product CodeString (monospace)Yes Auto-generated or
manual: PRD-XXXX
Product NameString Yes Descriptive name
Category Enum Yes Finished Product /
Sub-Assembly /
Component / Raw
Material / Consumable
/ Service
Type Enum Yes Make / Buy / Make or
Buy
Sell Price Currency Yes AUD (ex. GST)
Cost Price Currency Yes AUD (ex. GST)
Margin % Percentage
(calculated)
Yes (Sell − Cost) / Sell ×
Stock LevelNumber Yes Current on-hand
quantity
Status Badge Yes Active / Draft /
Discontinued
Actions Button groupNo View, Edit, Duplicate,
Archive
Column Type Sortable Notes

Manufacturing Tab: Default BOM (linked to BOMs page), routing template (sequence of
operations with machine type and estimated time), material specifications, quality standards,
drawing references (file upload or Autodesk Viewer embed).
Inventory Tab: Current stock by location, reorder point, reorder quantity, safety stock, lead time
(days), lot/serial tracking toggle, warehouse location assignment.
Accounting Tab: Revenue account (from Xero COA), COGS account, inventory account, tax
code mapping, cost method (Standard / Average / FIFO).
Documents Tab: File attachments --- drawings (PDF/DWG), spec sheets, photos, certifications.
Stored in Supabase Storage.
```

</details>

## 4.8 BOMs (/control/boms )
### Purpose
[Figma: MW-UX / Control Canvas --- BOMs]
4.8.1 BOM Explorer
The BOM page uses a split-panel layout:
Left panel (40% width): Product selector (searchable dropdown) and BOM list for the selected
product. Each product can have multiple BOM versions. BOM list shows: Version number, status
(Draft / Active / Obsolete), created date, author.
Right panel (60% width): BOM detail for the selected version, with the BOM tree and cost
analysis.
4.8.2 BOM Tree Component
<BOMTree> is a hierarchical tree view showing the material structure of a product. Each node
displays:
Level indicator (indentation)
Material/component name
Quantity per parent
Unit of measure
Unit cost (AUD)
Extended cost (quantity × unit cost)
Waste factor % (default 5% for sheet metal, configurable per material)
Source indicator: Make (blue) / Buy (green)
Expand/collapse for sub-assemblies

Example structure for a steel cabinet:
Inline editing: click any value to edit. Changes are tracked with version history.
4.8.3 BOM Cost Rollup
Summary panel below the BOM tree:
Version comparison: side-by-side diff of two BOM versions showing added/removed/changed
lines.

### Data
- UI components and widgets named in specification body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- BOMs]
4.8.1 BOM Explorer
The BOM page uses a split-panel layout:
Left panel (40% width): Product selector (searchable dropdown) and BOM list for the selected
product. Each product can have multiple BOM versions. BOM list shows: Version number, status
(Draft / Active / Obsolete), created date, author.
Right panel (60% width): BOM detail for the selected version, with the BOM tree and cost
analysis.
4.8.2 BOM Tree Component
<BOMTree> is a hierarchical tree view showing the material structure of a product. Each node
displays:
Level indicator (indentation)
Material/component name
Quantity per parent
Unit of measure
Unit cost (AUD)
Extended cost (quantity × unit cost)
Waste factor % (default 5% for sheet metal, configurable per material)
Source indicator: Make (blue) / Buy (green)
Expand/collapse for sub-assemblies

Example structure for a steel cabinet:
Inline editing: click any value to edit. Changes are tracked with version history.
4.8.3 BOM Cost Rollup
Summary panel below the BOM tree:
Version comparison: side-by-side diff of two BOM versions showing added/removed/changed
lines.
```

</details>

## 4.9 Analytics (/control/analytics )
### Purpose
[Figma: MW-UX / Control Canvas --- Analytics]
4.9.1 Pre-built Dashboards
Tabbed interface with pre-built analytics views:
1 Steel Cabinet Assembly (PRD-0042)
2 ├── Cabinet Body (Sub-Assembly, Make)
3 │ ├── 1.6mm Mild Steel Sheet (Raw Material, Buy) — 2.4 m², $85.20/m²
4 │ ├── 25×25 SHS Mild Steel (Raw Material, Buy) — 4.8 m, $12.50/m
5 │ └── Spot Weld Consumable (Consumable, Buy) — 48 ea, $0.15/ea
6 ├── Door Assembly (Sub-Assembly, Make)
7 │ ├── 1.2mm Mild Steel Sheet (Raw Material, Buy) — 0.8 m², $72.40/m²
8 │ ├── Piano Hinge 600mm (Component, Buy) — 2 ea, $8.50/ea
9 │ └── D-Handle Chrome (Component, Buy) — 1 ea, $4.20/ea
10 ├── Powder Coat — Dulux White Satin (Service, Buy) — 1 lot, $45.00
11 └── Hardware Kit (Component, Buy) — 1 kit, $12.80
Material Cost Sum of all Buy items ×
quantity × unit cost × (1 +
waste %)
$XXX.XX
Labour Cost Sum of routing operations ×
estimated time × labour rate
$XXX.XX
Overhead Configurable overhead rate
(default 15% of labour)
$XXX.XX
Subcontract Sum of all Service items $XXX.XX
T otal Cost Sum of above $XXX.XX
Sell Price From product record$XXX.XX
Margin % (Sell − T otal Cost) / Sell × 100XX.X%
Cost Element Calculation Value

All charts use MW brand colours with Recharts library. Date range selector on each dashboard:
This Week / This Month / This Quarter / This Year / Custom.
4.9.2 Report Builder
Custom report creation interface:
Data source selector: Choose from available tables/views (Products, Jobs, Invoices,
Inventory, etc.)
Column picker: Drag-and-drop columns from the data source into the report
Filters: Add filter conditions (field, operator, value)
Grouping: Group by one or more fields with aggregation (Sum, Count, Average, M in, Max)
Sorting: Multi-column sort
Preview: Live preview of the report as a DataTable
Save: Named report saved to user's report library
4.9.3 Export & Scheduling
Export formats: CSV, Excel (.xlsx), PDF.
Sales PerformanceRevenue, Pipeline value, Win
rate, Average deal size
Revenue trend (line), Pipeline
funnel (funnel), Win/Loss ratio
(donut)
Production EfficiencyOEE, Job completion rate,
Scrap rate, Labour utilisation
OEE trend (line), Machine
utilisation (heatmap), Job
status (stacked bar)
Financial OverviewGross margin, Operating costs,
Cash flow, AR/AP ageing
Margin trend (line), Cost
breakdown (pie), AR ageing
(bar)
Procurement Spend by supplier, PO cycle
time, On-time delivery
Supplier spend (treemap),
Delivery performance
(scatter), Price trends (line)
Workforce Headcount, Overtime …

### Data
- UI components and widgets named in specification body.
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including export (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- Analytics]
4.9.1 Pre-built Dashboards
Tabbed interface with pre-built analytics views:
1 Steel Cabinet Assembly (PRD-0042)
2 ├── Cabinet Body (Sub-Assembly, Make)
3 │ ├── 1.6mm Mild Steel Sheet (Raw Material, Buy) — 2.4 m², $85.20/m²
4 │ ├── 25×25 SHS Mild Steel (Raw Material, Buy) — 4.8 m, $12.50/m
5 │ └── Spot Weld Consumable (Consumable, Buy) — 48 ea, $0.15/ea
6 ├── Door Assembly (Sub-Assembly, Make)
7 │ ├── 1.2mm Mild Steel Sheet (Raw Material, Buy) — 0.8 m², $72.40/m²
8 │ ├── Piano Hinge 600mm (Component, Buy) — 2 ea, $8.50/ea
9 │ └── D-Handle Chrome (Component, Buy) — 1 ea, $4.20/ea
10 ├── Powder Coat — Dulux White Satin (Service, Buy) — 1 lot, $45.00
11 └── Hardware Kit (Component, Buy) — 1 kit, $12.80
Material Cost Sum of all Buy items ×
quantity × unit cost × (1 +
waste %)
$XXX.XX
Labour Cost Sum of routing operations ×
estimated time × labour rate
$XXX.XX
Overhead Configurable overhead rate
(default 15% of labour)
$XXX.XX
Subcontract Sum of all Service items $XXX.XX
T otal Cost Sum of above $XXX.XX
Sell Price From product record$XXX.XX
Margin % (Sell − T otal Cost) / Sell × 100XX.X%
Cost Element Calculation Value

All charts use MW brand colours with Recharts library. Date range selector on each dashboard:
This Week / This Month / This Quarter / This Year / Custom.
4.9.2 Report Builder
Custom report creation interface:
Data source selector: Choose from available tables/views (Products, Jobs, Invoices,
Inventory, etc.)
Column picker: Drag-and-drop columns from the data source into the report
Filters: Add filter conditions (field, operator, value)
Grouping: Group by one or more fields with aggregation (Sum, Count, Average, M in, Max)
Sorting: Multi-column sort
Preview: Live preview of the report as a DataTable
Save: Named report saved to user's report library
4.9.3 Export & Scheduling
Export formats: CSV, Excel (.xlsx), PDF.
Sales PerformanceRevenue, Pipeline value, Win
rate, Average deal size
Revenue trend (line), Pipeline
funnel (funnel), Win/Loss ratio
(donut)
Production EfficiencyOEE, Job completion rate,
Scrap rate, Labour utilisation
OEE trend (line), Machine
utilisation (heatmap), Job
status (stacked bar)
Financial OverviewGross margin, Operating costs,
Cash flow, AR/AP ageing
Margin trend (line), Cost
breakdown (pie), AR ageing
(bar)
Procurement Spend by supplier, PO cycle
time, On-time delivery
Supplier spend (treemap),
Delivery performance
(scatter), Price trends (line)
Workforce Headcount, Overtime hours,
Skill coverage, Training
compliance
Department breakdown (bar),
Skill matrix (heatmap), Training
compliance (gauge)
Dashboard Key Metrics Charts

Scheduled delivery:
Frequency: Daily / Weekly / Monthly / Quarterly
Delivery method: Email (to specified recipients), In-app notification
Format: PDF or Excel attachment
Saved schedule with enable/disable toggle
Configuration stored in report_schedules table with cron expression, recipients, format, and
report definition.
```

</details>

## 4.10 Integrations (/control/integrations )
### Purpose
[Figma: MW-UX / Control Canvas --- Integrations]
4.10.1 Connector Card Grid
Responsive card grid (3 columns desktop, 2 tablet, 1 mobile) of available integrations. Each card
displays:
Integration logo (48×48px)
Integration name
Category badge
Connection status: Connected (green) / Disconnected (grey) / Error (red)
Last sync timestamp
"Configure" button (56px min-height)
Integration categories and connectors:
Accounting Xero, QuickBooks OnlineXero: Phase 1, QuickBooks:
Phase 2
CAD / Design Autodesk Fusion 360,
SolidWorks
Fusion 360: Phase 1,
SolidWorks: Phase 2
Shipping / Carriers Australia Post, T oll/IPEC,
StarTrack, TNT, DHL, FedEx,
UPS
AU carriers Phase 1,
International Phase 2
Io T / Machine Monitoring MTConnect, OPC UAPhase 2
Category Connectors Status

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
[Figma: MW-UX / Control Canvas --- Integrations]
4.10.1 Connector Card Grid
Responsive card grid (3 columns desktop, 2 tablet, 1 mobile) of available integrations. Each card
displays:
Integration logo (48×48px)
Integration name
Category badge
Connection status: Connected (green) / Disconnected (grey) / Error (red)
Last sync timestamp
"Configure" button (56px min-height)
Integration categories and connectors:
Accounting Xero, QuickBooks OnlineXero: Phase 1, QuickBooks:
Phase 2
CAD / Design Autodesk Fusion 360,
SolidWorks
Fusion 360: Phase 1,
SolidWorks: Phase 2
Shipping / Carriers Australia Post, T oll/IPEC,
StarTrack, TNT, DHL, FedEx,
UPS
AU carriers Phase 1,
International Phase 2
Io T / Machine Monitoring MTConnect, OPC UAPhase 2
Category Connectors Status

4.10.2 Integration Detail
Clicking "Configure" on a connector card opens a full-page integration detail view:
Integration name and description
Connection status with last successful sync timestamp
Authentication method: OAuth 2.0 (Xero, Google) / API Key (carriers, Io T) / SMTP credentials
(email)
Connect / Disconnect button
Sync settings: Auto-sync toggle, sync frequency (Every 5 min / 15 min / 30 min / 1 hour / 4
hours / Daily), sync direction (One-way MW→External / One-way External→MW / Two-way)
Sync history log: timestamp, direction, records synced, errors
Field mapping table (for accounting integrations): MW field → External field
4.10.3 API Key Management
For API-authenticated integrations:
API key display (masked: xxxx-xxxx-xxxx-ABCD , reveal on click)
Key generation / regeneration button
Key expiry date
Key usage log (last 50 API calls with timestamp, endpoint, status)
Rate limit display (requests per minute)
4.10.4 Webhook Configuration
For event-driven integrations:
Webhook URL input
Secret key (for signature verification)
Event selector (checkboxes): Order Created, Invoice Sent, PO Approved, Machine Status
Changed, Job Completed, etc.
Delivery log: timestamp, event, URL, response code, retry count
T est button (sends sample payload)
CommunicationEmail (SMTP), SMS (Twilio),
Slack
Phase 1
Storage Google Drive, DropboxPhase 2
Payment Stripe Phase 2
```

</details>
