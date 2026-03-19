# MirrorWorks Figma Make Prompts — All Modules
## Built from actual MW-UX codebase + Confluence documentation

This file contains screen-by-screen prompts for Figma Make. Each prompt describes intention, content, and data — not design tokens. The existing file has a design system (`src/lib/design-system.ts`, `src/styles/globals.css`) and established patterns in Book, Ship, Plan, and Make (shop-floor) components. Figma Make should match those existing patterns.

### What already exists (iterate, don't rebuild)
- **Make**: 11 components in `src/components/shop-floor/` — OverviewTab, WorkTab, IssuesTab, IntelligenceHubTab, WorkOrderFullScreen, TimeClockTab, QualityTab, VoiceInterfaceMobile, MaterialsModal, CadFileModal, DefectReportModal
- **Book**: 14 components in `src/components/book/` — BookDashboard, BookInvoices, InvoiceList, InvoiceDetail, ExpenseKanban, NewExpense, JobProfitability, JobCostDetail, PurchaseOrders, BudgetOverview, StockValuation, ReportsGallery, BookSettings
- **Ship**: 9 components in `src/components/ship/` — ShipDashboard, ShipOrders, ShipPackaging, ShipShipping, ShipTracking, ShipReturns, ShipWarehouse, ShipReports, ShipSettings
- **Plan**: 7 components in `src/components/plan/` — PlanJobs, PlanProduction, PlanJobDetail, PlanOverviewTab, PlanProductionTab, PlanScheduleTab, PlanIntelligenceHubTab

### What needs to be created from scratch
- **Sell**: 0 components exist. Full module needed.
- **Buy**: 0 components exist. Full module needed.
- **Control**: 0 components exist. Full module needed.
- **Design**: 0 components exist. Full module needed.

### What needs screens added to existing modules
- **Plan**: Missing Dashboard, Activities/Calendar, Purchase, QC Planning, Products, Settings, Budget tab on job detail
- **Book**: Largely complete. May need refinement passes.
- **Ship**: Largely complete. May need refinement passes.
- **Make**: Missing Dashboard (Andon board), Schedule, Shop Floor Kanban. Existing shop-floor components cover MO detail tabs.

---

## ESTABLISHED PATTERNS (from existing code — reference, don't override)

**KPI stat card** (from BookDashboard.tsx):
- White card, border `#E5E5E5`, rounded-lg, p-6, hover shadow
- Top row: icon in 40x40 coloured circle (left), change badge (right)
- Label: Geist Medium, 13px, `#737373`
- Value: Roboto Mono, 24px, semibold, `#0A0A0A`
- Subtitle: Geist Regular, 12px, `#737373`
- Optional: progress bar (h-2, rounded-full, `#F5F5F5` track)

**Action card** (from BookDashboard.tsx):
- Same card shell. Title in Geist SemiBold 16px `#0A0A0A`, count badge in MW Yellow
- List items: `#FAFAFA` background rows, hover `#F5F5F5`, 13px labels

**Data table** (from PlanJobs.tsx, BookInvoices.tsx):
- ShadCN Table. Header row: Geist Medium, 12px, `#737373`, uppercase tracking
- Body rows: 14px `#0A0A0A`. Alternate row shading optional. Hover highlight.
- Status badges: pill shape, coloured per status

**Sidebar** (from App.tsx):
- ShadCN SidebarProvider with collapsible groups per module
- Module groups: Plan, Make, Ship, Book (currently). Sell, Buy, Control, Design to be added.
- Each group has a Collapsible with sub-items
- Icons from lucide-react. Active state highlighted.

**Page layout**:
- `<SidebarInset>` wrapping content
- Top bar: flex justify-between, `<SidebarTrigger>`, breadcrumb, search/bell/avatar
- Content: `p-6 space-y-6`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` for KPI rows

---

## MODULE 1: SELL (new — no existing components)

Sell is the commercial engine — CRM, quoting, orders, invoicing, and product catalogue. Create all components in `src/components/sell/`.

### 1.1 SellDashboard
Bento grid. 6 KPI stat cards: Monthly Revenue, Outstanding Invoices, Profit Margin, Cash Flow, Overdue Invoices, Expenses This Month. Match the BookDashboard pattern exactly. Charts below: Revenue vs Expenses area chart (12-month), Job Profitability bar chart (top 10 by margin, green/yellow/red thresholds at 15% and 5%). Action cards: Approval Queue, Xero Sync Status, Overdue Actions.

### 1.2 SellCRM (Card View)
Customer cards in a responsive grid (3 columns desktop). Each card: company name, primary contact, total revenue, active opportunities count, status badge. Toolbar: search input, filter dropdown, view toggle (Card/List), "New customer" CTA in MW Yellow. Match the card sizing from Plan's job cards.

### 1.3 SellCRMList
DataTable. Columns: Company Name, Contact, Email, Phone, Revenue, Opportunities, Status badge. Row selection checkboxes, pagination. Same table pattern as BookInvoices.

### 1.4 SellCRMDetail
Side drawer or full-page. Customer info, contact history, linked opportunities, quotes, orders. Activity timeline and notes. Tabbed if full-page.

### 1.5 SellOpportunities (Kanban)
Drag-and-drop Kanban. 6 columns: New, Qualified, Proposal, Negotiation, Won, Lost. Cards: deal value (Roboto Mono), customer name, expected close date, assigned avatar, priority badge. Quick create inline. Filters: assignee, date range, value range, tags.

### 1.6 SellOpportunityDetail
Tabbed detail: Overview, Quotes, Activities, Intelligence Hub (Phase 3 placeholder). Header with opportunity ID, assigned avatar, stage progress indicator. Overview tab: metadata form, linked quotes, activity timeline.

### 1.7 SellNewQuote
Quote creation form inside opportunity context. Pre-populates customer. Fields: dates, notes. Line items table with inline editing: Product combobox, Description, Qty, Unit Price, Discount, Total. Add Row. Subtotal/tax/total. Match the table editing pattern.

### 1.8 SellActivities
Three views: List (chronological cards), Calendar (month/week/day), New Activity dialog. Activity types: Call, Email, Meeting, Task, Note, Deadline.

### 1.9 SellOrders
DataTable. Columns: Order #, Customer, Date, Status (Draft/Confirmed/In Production/Shipped/Invoiced/Complete), Total, Actions. Empty state with Create and Import buttons.

### 1.10 SellInvoices
DataTable with tabs: All, Draft, Sent, Paid, Overdue. Match BookInvoices pattern. Columns: Invoice #, Customer, Issue Date, Due Date, Status, Total, Balance Due, Actions dropdown.

### 1.11 SellInvoiceDetail
Two-column. Left (60%): PDF-style invoice preview. Right (40%): payment history, email tracking, activity log, Xero link. Match Book InvoiceDetail pattern.

### 1.12 SellProducts (Card View)
Product cards: image, name, SKU, category, stock level badge, unit price. Card/List toggle.

### 1.13 SellProductDetail
Five tabs: Overview (metadata, pricing), Manufacturing (BOM, routing), Inventory (stock, reorder), Accounting (revenue account, Xero mapping), Documents (drawings, specs).

### 1.14 SellSettings
Left nav with panels: General, Teams, Leads/Pipeline, Quoting, Payments, Activities, Analytics, Integrations. Match BookSettings panel layout.

---

## MODULE 2: PLAN (extend existing — 7 components exist, add missing screens)

### Existing — refine if needed:
- PlanJobs (kanban/list)
- PlanProduction
- PlanJobDetail, PlanOverviewTab, PlanProductionTab, PlanScheduleTab, PlanIntelligenceHubTab

### 2.1 PlanDashboard (NEW)
Bento grid. KPIs: Active Jobs, Tasks Today, Avg Lead Time, On-Time Rate. Charts: Capacity utilisation by work centre (bar), Jobs by status (donut). Action cards: Overdue jobs, Unassigned operations, Material shortages.

### 2.2 PlanBudgetTab (NEW — tab within PlanJobDetail)
Restricted to Scheduler/Manager/Admin. 4 stat cards: Total Budget, Total Spent (with progress bar), Remaining, Margin. Category breakdown table: Materials, Labour, Overhead, Subcontract — Budget/Actual/Variance/% Used/Status columns. Spend vs Plan line chart (planned vs actual burn). AI Budget Insight card (sparkle icon, natural language summary, refresh button).

### 2.3 PlanActivities (NEW)
Full-page calendar. Month/week/day views. Activity types colour-coded: Task, Meeting, Call, Reminder, Milestone. Click to create. Cards show title, assignee, time, job reference.

### 2.4 PlanPurchase (NEW)
Material requirements list from BOMs. Columns: Material, Required Qty, Available Qty, Shortage, Required Date, Job Reference, Status. Bulk "Create POs" action for shortages.

### 2.5 PlanQCPlanning (NEW)
QC checkpoint definition per operation. Table: Operation, Checkpoint Name, Inspection Type, Hold Point toggle, Required Certs. Link to Make QC execution.

### 2.6 PlanProducts (NEW)
Product catalogue (read from Sell). Card/List view. Focus: BOM, routing, manufacturing specs.

### 2.7 PlanSettings (NEW)
Left nav panels: General (planning horizon, lead time buffer, working days, job prefix, timezone), Work Centres (machine list, capacity, setup times, rates), Shifts (patterns, breaks). Phase 2: Materials, Optimisation (AI weight sliders), Alerts.

---

## MODULE 3: MAKE (extend existing — shop-floor components cover MO detail, add missing views)

### Existing — these are the MO detail tabs:
- OverviewTab, WorkTab, IssuesTab, IntelligenceHubTab, QualityTab, TimeClockTab
- WorkOrderFullScreen, VoiceInterfaceMobile
- Modals: MaterialsModal, CadFileModal, DefectReportModal

### 3.1 MakeDashboard (NEW — Andon Board)
Toyota-style real-time overview. KPIs: Active MOs, On-Time Rate, OEE, Scrap Rate, Active Operators, Open Quality Holds. Machine Status Grid: large cards per work centre showing machine name, status (Running green / Idle yellow / Down red / Maintenance blue), current job, operator, cycle progress. Today's Schedule: horizontal Gantt strip. Quick Actions: Start operation, Log downtime, Raise alert, View queue.

### 3.2 MakeSchedule (NEW)
Gantt and calendar views. Today and upcoming operations by work centre. Shared component pattern with Plan schedule. Operators see assigned work. Supervisors see all.

### 3.3 MakeShopFloor (NEW — Kanban)
Primary operator interface. 3 columns: Overdue (red header), In Progress (yellow header), Not Started (neutral). Large MO cards: MO number, product, customer, work centre, operator avatar, priority badge, progress bar. 56px touch targets. Tap opens MO detail.

---

## MODULE 4: SHIP (exists — 9 screens, largely complete)

All 9 screens exist. Review and refine against the spec:
- ShipDashboard: Verify 6 KPIs, active shipments list, exceptions queue
- ShipOrders: Verify 5-column fulfilment pipeline Kanban
- ShipPackaging: Verify pack station interface (large format, barcode scan, item checklist)
- ShipShipping: Verify carrier dashboard, rate comparison, pickup schedule
- ShipTracking: Verify tracking list, map view, exception queue
- ShipReturns: Verify RMA queue, return processing
- ShipWarehouse: Verify warehouse map (SVG zones), inventory grid, cycle counting
- ShipReports: Verify performance charts
- ShipSettings: Verify 8 settings panels

---

## MODULE 5: BOOK (exists — 14 screens, largely complete)

All core screens exist. Review and refine:
- BookDashboard, BookInvoices, InvoiceDetail, ExpenseKanban, NewExpense
- JobProfitability, JobCostDetail, PurchaseOrders, BudgetOverview
- StockValuation, ReportsGallery, BookSettings

### 5.1 BookThreeWayMatching (NEW — sub-view of PurchaseOrders)
Visual matching: PO line items vs Goods Receipt quantities vs Bill amounts side by side. Match/mismatch indicators per line. Discrepancy flags for qty or price variance >5%.

---

## MODULE 6: BUY (new — no existing components)

Create all components in `src/components/buy/`. Procurement and supplier management.

### 6.1 BuyDashboard
Bento grid. KPIs: Open POs (count + value), Pending Requisitions, Overdue Deliveries, Avg Lead Time, Spend This Month, Pending Bills. Charts: Spend by category donut, Spend trend area chart, Supplier performance top 5, Overdue deliveries by supplier bar. Action cards: Approval queue, Goods awaiting receipt, Bills needing matching.

### 6.2 BuyRequisitions
DataTable. Columns: Req #, Requested By, Product, Qty, Required Date, Job Reference, Status (Draft/Submitted/Approved/Ordered/Rejected), Priority. New requisition form: product, qty, date, job link, justification.

### 6.3 BuyRFQs
Kanban (Draft/Sent/Received/Compared/Awarded) or list. RFQ detail: multi-supplier comparison table — supplier, unit price, lead time, MOQ, payment terms, total. Highlight best values. Award button converts to PO.

### 6.4 BuyOrders
DataTable with tabs: All, Draft, Sent, Acknowledged, Partial, Received, Cancelled. PO detail: header, line items (ordered vs received), receipt history, match status. New PO form: supplier, items, delivery date, payment terms, job link.

### 6.5 BuyReceipts
DataTable. Columns: Receipt #, PO Reference, Supplier, Date, Items Received, Status. New receipt: select PO (pre-populates items), enter received qty, flag quality issues, attach photos. Touch-optimised for dock tablets.

### 6.6 BuyBills
DataTable. Columns: Bill #, Supplier, PO, Date, Amount, Match Status, Approval Status. Detail: three-way matching view (PO vs Receipt vs Bill per line).

### 6.7 BuySuppliers
Card view (default) + list toggle. Cards: company, contact, category badges, active PO count, on-time %, total spend. Supplier detail tabs: Overview, Price Lists, Orders, Performance (charts), Documents.

### 6.8 BuyAgreements
Blanket orders. DataTable: Agreement #, Supplier, Products, Valid From/To, Committed/Used Value, Status. Detail: terms, line items with price locks, call-off history.

### 6.9 BuyProducts
Products filtered for procurement. Columns: Product, Preferred Supplier, Last Price, Lead Time, MOQ, Reorder Point, Stock Level.

### 6.10 BuyReports
Spend analysis (supplier, category, period, job). Supplier scorecards. Purchase price variance. Cycle time analysis.

### 6.11 BuySettings
Panels: General (PO numbering, terms, currency), Approvals (thresholds), Receiving (workflow, QC requirements), Matching (tolerance %), Templates (PO/RFQ email), Reorder Rules, Integrations, AI (Phase 3).

---

## MODULE 7: CONTROL (new — no existing components)

Create in `src/components/control/`. Administration hub.

### 7.1 ControlDashboard
Admin overview. Cards: Total Users (active/inactive), Machines (active/maintenance), Products count, Inventory Value, Subscription Tier badge, System Health (API/sync status).

### 7.2 ControlLocations
Factory sites list. Each: name, address, timezone, active toggle. Click to manage work centres and zones within that location.

### 7.3 ControlMachines
Work centre master data. Card/list. Cards: name, type badge (laser/press brake/assembly/etc.), status (Active/Maintenance/Decommissioned), capacity hrs/day, utilisation target. Edit form: name, type, capacity, setup time, overhead rate/hr.

### 7.4 ControlInventory
Inventory master data. Columns: Product, SKU, Location, On Hand, Allocated, Available, Reorder Point, Unit Cost. Bulk import/export. Stock adjustment form.

### 7.5 ControlPurchase
Supplier master data setup. Default payment terms, tax settings, currency, bank details.

### 7.6 ControlPeople
User management. Table: Name, Email, Role, Status (Active/Invited/Deactivated), Last Login, Teams. Invite flow: email, role, module access. Roles & Permissions sub-view: matrix of role vs module vs permission. Teams sub-view: create teams, assign members, link to work centres.

### 7.7 ControlProducts
Central product definition. Authoritative record used across all modules.

### 7.8 ControlBOMs
Bill of Materials management. List: product, version, component count, status (Draft/Active/Obsolete). BOM detail: hierarchical component tree (product, qty, unit, scrap factor, route). Version history.

---

## MODULE 8: DESIGN (new — no existing components)

Create in `src/components/design/`. Onboarding and configuration wizard.

### 8.1 DesignFactoryLayout
Canvas-based factory layout designer. Define zones (Cutting, Forming, Welding, Assembly, Paint, Dispatch). Place work centres within zones. Drag-and-drop. Set zone dimensions and capacity. Feeds into Control machines/locations.

### 8.2 DesignProcessBuilder
Visual routing/workflow builder. Drag-and-drop process steps. Each step: operation name, work centre, estimated duration, QC checkpoint toggle. Connect steps for sequence. Save as routing templates for Plan.

### 8.3 DesignRoleDesigner
Role/permission configuration. Matrix: roles x modules x actions. Pre-built role templates (Operator, Supervisor, Manager, Admin) with customisation. Preview: "See what this role sees" showing filtered sidebar.

### 8.4 DesignInitialData
Data import wizard. Steps: 1) Products (CSV/Excel import), 2) Customers, 3) Suppliers, 4) Inventory (opening stock), 5) Work Centres (confirm from layout), 6) BOMs. Each step: upload area, column mapping, preview table, validation, confirm. Progress indicator across all steps.

---

## SIDEBAR ADDITIONS

The App.tsx sidebar currently has collapsible groups for Plan, Make, Ship, and Book. Add groups for:

**Sell** (above Plan): Dashboard, CRM, Opportunities, Activities, Quotes, Orders, Invoices, Products, Settings

**Buy** (below Book): Dashboard, Requisitions, RFQs, Orders, Receipts, Bills, Suppliers, Agreements, Products, Reports, Settings

**Control** (below Buy): Dashboard, Locations, Machines, Inventory, Purchase, People, Products, BOMs

**Design** (below Control): Factory Layout, Process Builder, Role Designer, Initial Data