# Sell — §4 Screen-by-Screen Specification

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) — combined MirrorWorks module specification. **Sell** module, **Section 4** (screen-by-screen). Text below was extracted from the PDF and structured per project guidelines.

| Reference | Path |
| --- | --- |
| Module spec (PDF) | [`../MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) |
| All §4 extracts (index) | [`README.md`](./README.md) |
| Prototype routes | [`PrototypeRouteMap.md#sell`](./PrototypeRouteMap.md#sell) · [`src/routes.tsx`](../../routes.tsx) |

**Status:** §4 content extracted from PDF into Purpose / Data / Actions / States. The PDF remains authoritative if wording diverges.

## Prototype mapping

Full route ↔ component list: **[`PrototypeRouteMap.md` — Sell](PrototypeRouteMap.md#sell)**.

---

## §4 Screens

## 4.1 Dashboard
### Purpose
4.1.1 Overview (Bento Grid)
Figma node: Blocks / Dashboard-Sell-Overview
The dashboard overview uses a bento grid layout with stat cards and chart components. The
layout is responsive, collapsing from a 3-column grid on desktop to a single column on mobile.
Layout: Bento grid with mixed-size cards
Components: StatCard (KPI tiles), ChartCard (Recharts line/bar/area charts), ActionCard
(quick action panels)
Data Sources: Aggregated from opportunities, quotes, orders, and invoices tables
Refresh: Real-time via Supabase subscriptions on opportunity status changes
4.1.2 Analytics
Figma node: Blocks / Dashboard-Sell-Analytics
Deeper analytical views including pipeline funnel, revenue trends, win/loss analysis, sales
leaderboard, and quota attainment. Uses Recharts for all charting with MW brand colours.
4.1.3 Reports
Figma node: Blocks / Dashboard-Sell-Reports (two variants)
Report builder with pre-configured templates and export functionality (PDF, CSV).
Manufacturing-specific reports include Quote-to-Cash Cycle analysis, which tracks the full
pipeline from quote creation through production to payment.

### Data
- See extract: data sources and entities described in body.
- UI components and widgets named in specification body.
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.1.1 Overview (Bento Grid)
Figma node: Blocks / Dashboard-Sell-Overview
The dashboard overview uses a bento grid layout with stat cards and chart components. The
layout is responsive, collapsing from a 3-column grid on desktop to a single column on mobile.
Layout: Bento grid with mixed-size cards
Components: StatCard (KPI tiles), ChartCard (Recharts line/bar/area charts), ActionCard
(quick action panels)
Data Sources: Aggregated from opportunities, quotes, orders, and invoices tables
Refresh: Real-time via Supabase subscriptions on opportunity status changes
4.1.2 Analytics
Figma node: Blocks / Dashboard-Sell-Analytics
Deeper analytical views including pipeline funnel, revenue trends, win/loss analysis, sales
leaderboard, and quota attainment. Uses Recharts for all charting with MW brand colours.
4.1.3 Reports
Figma node: Blocks / Dashboard-Sell-Reports (two variants)
Report builder with pre-configured templates and export functionality (PDF, CSV).
Manufacturing-specific reports include Quote-to-Cash Cycle analysis, which tracks the full
pipeline from quote creation through production to payment.
```

</details>

## 4.2 CRM
### Purpose
4.2.1 Card View
Figma nodes: Blocks / CRM Cards (three variants at different positions)
Displays customers as visual cards in a responsive grid. Each card shows company name,
primary contact, total revenue, active opportunities count, and status badge.

Grid: 3 columns on desktop (384px per card), 1 column on mobile
Card height: 152px (standard) or 158px (with extended info)
Card interactions: Click to open customer detail sheet, hover for quick-action menu
View toggle: Tab component switches between Card and List views
4.2.2 List View
Figma node: Blocks / CRM List
DataTable view with sortable columns: Company Name, Contact, Email, Phone, Revenue,
Opportunities, Status. Includes row selection checkboxes, search, filter dropdown, and
pagination.
4.2.3 Customer Detail Sheet
Figma nodes: CRM Cards (with detail overlays)
Opens as a side drawer or full-page view showing comprehensive customer information,
contact history, linked opportunities, quotes, and orders. Includes an activity timeline and notes
section.

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.2.1 Card View
Figma nodes: Blocks / CRM Cards (three variants at different positions)
Displays customers as visual cards in a responsive grid. Each card shows company name,
primary contact, total revenue, active opportunities count, and status badge.

Grid: 3 columns on desktop (384px per card), 1 column on mobile
Card height: 152px (standard) or 158px (with extended info)
Card interactions: Click to open customer detail sheet, hover for quick-action menu
View toggle: Tab component switches between Card and List views
4.2.2 List View
Figma node: Blocks / CRM List
DataTable view with sortable columns: Company Name, Contact, Email, Phone, Revenue,
Opportunities, Status. Includes row selection checkboxes, search, filter dropdown, and
pagination.
4.2.3 Customer Detail Sheet
Figma nodes: CRM Cards (with detail overlays)
Opens as a side drawer or full-page view showing comprehensive customer information,
contact history, linked opportunities, quotes, and orders. Includes an activity timeline and notes
section.
```

</details>

## 4.3 Opportunities
### Purpose
4.3.1 Kanban Board
Figma node: Blocks / Opportunity Kanban
The primary opportunity view is a drag-and-drop Kanban board with configurable pipeline
stages. Default stages: New, Qualified, Proposal, Negotiation, Won, Lost.
Kanban columns: Configurable via Settings > Leads/Pipeline
Opportunity cards: Show deal value, customer name, expected close date, assigned rep
avatar
Drag-and-drop: Updates opportunity stage via PATCH to opportunities table
Quick create: Inline card creation at top of any column
Filter view: Filter by assignee, date range, value range, tags
4.3.2 Opportunity Overview Detail
Figma node: Blocks / Opportunity / Overview
Full opportunity detail page with tabbed sub-navigation. Shows opportunity header with ID,
assigned avatar, and stage progress indicator. Contains forms for opportunity metadata, linked

quotes, and an activity timeline.
4.3.3 New Quote (from Opportunity)
Figma node: Blocks / Opportunity / New Quote
Quote creation form accessed from within an opportunity. Pre-populates customer details from
the parent opportunity. Key fields:
Customer (auto-filled from opportunity)
Quotation Date, Expiration Date (date pickers)
Expected Close Date, Expected Delivery Date (date pickers)
Notes/Description (textarea)
Stage header with toggle buttons: Invoice, Delivery
Line items table (see Section 4.4 for details)
On save, a Sonner toast confirms: “Everything has been saved”
4.3.4 Activities
Figma nodes: Blocks / Opportunity / Activities, Activity Calendar, New Activity
Activity management with three views:
List view: Chronological activity feed with task cards
Calendar view: Month, Week, and Day calendar layouts (see Calendar reference components
in Figma)
New Activity popup: Title, assigned user, due date, tag selector, description textarea,
checklist, attachments, and comment thread
Activity types include: Call, Email, Meeting, Task, Note, Deadline.
4.3.5 Intelligence Hub
Figma node: Blocks / Opportunity / Intelligence Hub
AI-powered insight panel for opportunity analysis. Phase 3 feature (July–September 2026) that
provides:
Win probability scoring based on historical data
Recommended next actions
Similar won/lost deals for context

Pricing suggestions from win/loss analysis
Competitor intelligence (manual input + AI analysis)

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including filter (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.3.1 Kanban Board
Figma node: Blocks / Opportunity Kanban
The primary opportunity view is a drag-and-drop Kanban board with configurable pipeline
stages. Default stages: New, Qualified, Proposal, Negotiation, Won, Lost.
Kanban columns: Configurable via Settings > Leads/Pipeline
Opportunity cards: Show deal value, customer name, expected close date, assigned rep
avatar
Drag-and-drop: Updates opportunity stage via PATCH to opportunities table
Quick create: Inline card creation at top of any column
Filter view: Filter by assignee, date range, value range, tags
4.3.2 Opportunity Overview Detail
Figma node: Blocks / Opportunity / Overview
Full opportunity detail page with tabbed sub-navigation. Shows opportunity header with ID,
assigned avatar, and stage progress indicator. Contains forms for opportunity metadata, linked

quotes, and an activity timeline.
4.3.3 New Quote (from Opportunity)
Figma node: Blocks / Opportunity / New Quote
Quote creation form accessed from within an opportunity. Pre-populates customer details from
the parent opportunity. Key fields:
Customer (auto-filled from opportunity)
Quotation Date, Expiration Date (date pickers)
Expected Close Date, Expected Delivery Date (date pickers)
Notes/Description (textarea)
Stage header with toggle buttons: Invoice, Delivery
Line items table (see Section 4.4 for details)
On save, a Sonner toast confirms: “Everything has been saved”
4.3.4 Activities
Figma nodes: Blocks / Opportunity / Activities, Activity Calendar, New Activity
Activity management with three views:
List view: Chronological activity feed with task cards
Calendar view: Month, Week, and Day calendar layouts (see Calendar reference components
in Figma)
New Activity popup: Title, assigned user, due date, tag selector, description textarea,
checklist, attachments, and comment thread
Activity types include: Call, Email, Meeting, Task, Note, Deadline.
4.3.5 Intelligence Hub
Figma node: Blocks / Opportunity / Intelligence Hub
AI-powered insight panel for opportunity analysis. Phase 3 feature (July–September 2026) that
provides:
Win probability scoring based on historical data
Recommended next actions
Similar won/lost deals for context

Pricing suggestions from win/loss analysis
Competitor intelligence (manual input + AI analysis)
```

</details>

## 4.4 Quotes
### Purpose
Figma nodes: Blocks / Opportunity / New Quote, New Quote / Sonner
The quote builder is the core revenue-generating tool. It includes a line item table with inline
editing for product selection, quantity, unit price, and discount. The quote total auto-calculates
with subtotal, tax, and grand total.
4.4.1 Quote Line Item Table
The line item table follows the DataTable pattern with inline editing:
Product column: Searchable combobox linked to Products catalogue
Qty and Unit Price: Inline number inputs with 64px width
Discount: Percentage or fixed amount toggle
T otal: Auto-calculated (Qty x Unit Price - Discount)
Add Row: Button at bottom of table or keyboard shortcut (Tab from last cell)

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including search (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Figma nodes: Blocks / Opportunity / New Quote, New Quote / Sonner
The quote builder is the core revenue-generating tool. It includes a line item table with inline
editing for product selection, quantity, unit price, and discount. The quote total auto-calculates
with subtotal, tax, and grand total.
4.4.1 Quote Line Item Table
The line item table follows the DataTable pattern with inline editing:
Product column: Searchable combobox linked to Products catalogue
Qty and Unit Price: Inline number inputs with 64px width
Discount: Percentage or fixed amount toggle
T otal: Auto-calculated (Qty x Unit Price - Discount)
Add Row: Button at bottom of table or keyboard shortcut (Tab from last cell)
```

</details>

## 4.5 Orders
### Purpose
Figma node: Blocks / Orders List
Sales order list view using the standard DataTable pattern. Orders are created from confirmed
quotes (Quote → Sales Order transition). Includes blank state and CSV import screens for
migrating existing order data.
Columns: Order #, Customer, Date, Status, T otal, Actions
Status values: Draft, Confirmed, In Production, Shipped, Invoiced, Complete
Handoff to Plan: Confirmed orders with valid BoM generate Jobs in the Plan module
1 10mm Mild
Steel Plate
AS/NZS
3678-250
50 $85.00 5% $4,037.50
# ProductDescriptionQty Unit Price DiscountT otal

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Figma node: Blocks / Orders List
Sales order list view using the standard DataTable pattern. Orders are created from confirmed
quotes (Quote → Sales Order transition). Includes blank state and CSV import screens for
migrating existing order data.
Columns: Order #, Customer, Date, Status, T otal, Actions
Status values: Draft, Confirmed, In Production, Shipped, Invoiced, Complete
Handoff to Plan: Confirmed orders with valid BoM generate Jobs in the Plan module
1 10mm Mild
Steel Plate
AS/NZS
3678-250
50 $85.00 5% $4,037.50
# ProductDescriptionQty Unit Price DiscountT otal
```

</details>

## 4.6 Invoices
### Purpose
Figma nodes: Blocks / Invoice List, Blocks / Invoice List (detail variant), Blocks / Opportunity /
New Invoice
Invoice management with list view, detail views, and creation workflow. Invoices can be
generated from Sales Orders or created manually. The detail view includes two variants for
different invoice states.
List view: DataTable with tabs for All, Draft, Sent, Paid, Overdue
Detail view: Full invoice preview with line items, payment terms, and status actions
Filter dropdown: Filter by status, date range, customer, amount
New invoice: Form with customer selection, line items, payment terms, due date, and notes
Actions: Send (email), Download (PDF), Mark as Paid, Void, Duplicate

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including filter (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Figma nodes: Blocks / Invoice List, Blocks / Invoice List (detail variant), Blocks / Opportunity /
New Invoice
Invoice management with list view, detail views, and creation workflow. Invoices can be
generated from Sales Orders or created manually. The detail view includes two variants for
different invoice states.
List view: DataTable with tabs for All, Draft, Sent, Paid, Overdue
Detail view: Full invoice preview with line items, payment terms, and status actions
Filter dropdown: Filter by status, date range, customer, amount
New invoice: Form with customer selection, line items, payment terms, due date, and notes
Actions: Send (email), Download (PDF), Mark as Paid, Void, Duplicate
```

</details>

## 4.7 Products
### Purpose
Figma nodes: Blocks / Product Cards, Products List, Product / Overview, Manufacturing,
Inventory, Accounting, Documents
The product catalogue is the most complex screen in the Sell module, with five detail tabs
covering the full product lifecycle.
4.7.1 Product List/Card Views
Same Card/List toggle pattern as CRM. Product cards show: product image, name, SKU,
category, stock level badge, and unit price.
4.7.2 Product Detail — Overview Tab
Figma node: Blocks / Product / Overview (1693x3347px)
Comprehensive product information page with:
Header: Product name (editable), image upload, quick toggles (Can be Sold, Can be
Purchased, Can be Manufactured), SKU badge, status indicator
Product Details section: Product type (Consumable/Storable/Service), category hierarchy,
internal reference, barcode, UoM
Pricing section: Sales price, compare-to price, cost, customer taxes, margin calculation
Description section: Rich text sales description, internal notes
Tags section: Multi-select filterable tags

Attributes & Variants: Variant generation for colour, size, material combinations
4.7.3 Product Detail — Manufacturing Tab
Figma node: Blocks / Product / Manufacturing (1693x1901px)
Manufacturing-specific product configuration:
Manufacturing type: Manufactured (has BoM) or Kit
Bill of Materials table: BoM name, quantity, view/edit actions
Manufacturing lead time and preparation days
Vendor information table: Vendor, product name/code, price, currency, delivery lead time, min
quantity
Quality control checkpoints: Incoming inspection, in-process, final inspection, certificate of
conformance
4.7.4 Product Detail — Inventory Tab
Figma node: Blocks / Product / Inventory (1693x2562px)
Stock management and operations configuration:
Stock on hand: Current, available, forecasted (read-only from inventory)
Stock locations: Expandable list with warehouse/shelf/bin hierarchy
Reordering rules table: Location, min/max qty, order multiples, lead time, route
Routes & operations checkboxes: Buy, Manufacture, Receive (1/2/3 steps), Deliver (1/2/3
steps)
Logistics: Weight, volume, HS code, origin of goods, customer lead time
Packaging table and traceability settings (serial number / lot tracking)
4.7.5 Product Detail — Accounting Tab
Figma node: Blocks / Product / Accounting (1693x2287px)
Financial configuration for the product:
Invoicing policy: Ordered vs. delivered quantities
Income and expense account assignments
Cost method: Standard Price, FIFO, or AVCO
Tax configuration for sales …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Figma nodes: Blocks / Product Cards, Products List, Product / Overview, Manufacturing,
Inventory, Accounting, Documents
The product catalogue is the most complex screen in the Sell module, with five detail tabs
covering the full product lifecycle.
4.7.1 Product List/Card Views
Same Card/List toggle pattern as CRM. Product cards show: product image, name, SKU,
category, stock level badge, and unit price.
4.7.2 Product Detail — Overview Tab
Figma node: Blocks / Product / Overview (1693x3347px)
Comprehensive product information page with:
Header: Product name (editable), image upload, quick toggles (Can be Sold, Can be
Purchased, Can be Manufactured), SKU badge, status indicator
Product Details section: Product type (Consumable/Storable/Service), category hierarchy,
internal reference, barcode, UoM
Pricing section: Sales price, compare-to price, cost, customer taxes, margin calculation
Description section: Rich text sales description, internal notes
Tags section: Multi-select filterable tags

Attributes & Variants: Variant generation for colour, size, material combinations
4.7.3 Product Detail — Manufacturing Tab
Figma node: Blocks / Product / Manufacturing (1693x1901px)
Manufacturing-specific product configuration:
Manufacturing type: Manufactured (has BoM) or Kit
Bill of Materials table: BoM name, quantity, view/edit actions
Manufacturing lead time and preparation days
Vendor information table: Vendor, product name/code, price, currency, delivery lead time, min
quantity
Quality control checkpoints: Incoming inspection, in-process, final inspection, certificate of
conformance
4.7.4 Product Detail — Inventory Tab
Figma node: Blocks / Product / Inventory (1693x2562px)
Stock management and operations configuration:
Stock on hand: Current, available, forecasted (read-only from inventory)
Stock locations: Expandable list with warehouse/shelf/bin hierarchy
Reordering rules table: Location, min/max qty, order multiples, lead time, route
Routes & operations checkboxes: Buy, Manufacture, Receive (1/2/3 steps), Deliver (1/2/3
steps)
Logistics: Weight, volume, HS code, origin of goods, customer lead time
Packaging table and traceability settings (serial number / lot tracking)
4.7.5 Product Detail — Accounting Tab
Figma node: Blocks / Product / Accounting (1693x2287px)
Financial configuration for the product:
Invoicing policy: Ordered vs. delivered quantities
Income and expense account assignments
Cost method: Standard Price, FIFO, or AVCO
Tax configuration for sales and purchase

Deferred revenue/expense settings
4.7.6 Product Detail — Documents Tab
Figma node: Blocks / Product / Documents (1693x2693px)
Document management for product-related files: technical drawings, certificates, datasheets,
and CAD files. Supports Supabase Storage for file uploads with S3 backend.
```

</details>

## 4.8 Settings
### Purpose
Eight settings panels configuring the Sell module behaviour:
General Company defaults, currency,
fiscal year, default taxes
Form inputs, dropdowns
T eams Sales team configuration,
member assignment, targets
User list, role dropdowns
Leads/PipelinePipeline stage management
with default probabilities
Editable table with stage
name, probability %, colour,
actions
Quoting Quote templates, numbering,
validity periods, approval
workflows
Select dropdowns, approval
workflow toggle
Payments Payment gateway integration
(Stripe, PayPal), payment
terms
Integration cards with
connect/disconnect, switch
toggles
Activities Activity type configuration,
notification preferences,
calendar sync
Radio groups, notification
toggle rows
Analytics Report configuration, KPI
targets, dashboard
customisation
T oggle groups, number inputs
Integrations Third-party connections
(accounting, email, calendar)
Integration marketplace cards
Panel Purpose Key Components

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
Eight settings panels configuring the Sell module behaviour:
General Company defaults, currency,
fiscal year, default taxes
Form inputs, dropdowns
T eams Sales team configuration,
member assignment, targets
User list, role dropdowns
Leads/PipelinePipeline stage management
with default probabilities
Editable table with stage
name, probability %, colour,
actions
Quoting Quote templates, numbering,
validity periods, approval
workflows
Select dropdowns, approval
workflow toggle
Payments Payment gateway integration
(Stripe, PayPal), payment
terms
Integration cards with
connect/disconnect, switch
toggles
Activities Activity type configuration,
notification preferences,
calendar sync
Radio groups, notification
toggle rows
Analytics Report configuration, KPI
targets, dashboard
customisation
T oggle groups, number inputs
Integrations Third-party connections
(accounting, email, calendar)
Integration marketplace cards
Panel Purpose Key Components
```

</details>
