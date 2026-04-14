# Make — §4 Screen-by-Screen Specification

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) — combined MirrorWorks module specification. **Make** module, **Section 4** (screen-by-screen). Text below was extracted from the PDF and structured per project guidelines.

| Reference | Path |
| --- | --- |
| Module spec (PDF) | [`../MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) |
| All §4 extracts (index) | [`README.md`](./README.md) |
| Prototype routes | [`PrototypeRouteMap.md#make`](./PrototypeRouteMap.md#make) · [`src/routes.tsx`](../../routes.tsx) |

**Status:** §4 content extracted from PDF into Purpose / Data / Actions / States. The PDF remains authoritative if wording diverges.

## Prototype mapping

Full route ↔ component list: **[`PrototypeRouteMap.md` — Make](PrototypeRouteMap.md#make)**.

---

## §4 Screens

## 4.1 Dashboard (Andon Overview)
### Purpose
4.1.1 Figma Reference
Screenshot: make_dash_1x.webp. Route: /make. Bento grid layout.
4.1.2 KPI Cards (Top Row)
Five stat cards spanning full width. Each: metric label, icon, primary value, secondary context.
4.1.3 Active MOs Card
Left column. Active MOs as compact cards: MO number, status badge, product name, unit
count, progress bar. Three-dot overflow. Max 5 visible with scroll.
4.1.4 Machine Status (Andon) Grid
Centre column. 2x3 grid of machine cards following T oyota Andon visual management. Each:
machine name, status dot, operator name/avatar. Clickable -- navigates to machine's current
WO.
Active Orders12 +2 from yesterdayInformational only
Machines Running8/10 80% Capacity Below 50% triggers
yellow
Completion Rate92% +4.5% vs targetBelow 85% yellow,
below 70% red
Quality Holds 3 Requires attentionAny > 0 triggers red
border
OEE Utilisation78% -2% from avgBelow 65% yellow,
below 50% red
Card Example ValueContext Alert Condition
Running Green (#36B37E)Actively producing
Idle Yellow (#FACC15)Available but no active WO
Status Colour Meaning

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.1.1 Figma Reference
Screenshot: make_dash_1x.webp. Route: /make. Bento grid layout.
4.1.2 KPI Cards (Top Row)
Five stat cards spanning full width. Each: metric label, icon, primary value, secondary context.
4.1.3 Active MOs Card
Left column. Active MOs as compact cards: MO number, status badge, product name, unit
count, progress bar. Three-dot overflow. Max 5 visible with scroll.
4.1.4 Machine Status (Andon) Grid
Centre column. 2x3 grid of machine cards following T oyota Andon visual management. Each:
machine name, status dot, operator name/avatar. Clickable -- navigates to machine's current
WO.
Active Orders12 +2 from yesterdayInformational only
Machines Running8/10 80% Capacity Below 50% triggers
yellow
Completion Rate92% +4.5% vs targetBelow 85% yellow,
below 70% red
Quality Holds 3 Requires attentionAny > 0 triggers red
border
OEE Utilisation78% -2% from avgBelow 65% yellow,
below 50% red
Card Example ValueContext Alert Condition
Running Green (#36B37E)Actively producing
Idle Yellow (#FACC15)Available but no active WO
Status Colour Meaning

4.1.5 Quality Alerts Card
Right column. Yellow-bordered card with active quality issues. Each row: alert icon, description,
time ago, View link. 'Report Issue' button (MW Yellow) at bottom.
4.1.6 Today's Schedule (Gantt Strip)
Full-width. Machine rows with job blocks on 8:00-17:00 timeline. MW Yellow = scheduled, green
= in-progress, peach = setup, pink = maintenance. Date nav, zoom controls. 'Auto-Schedule'
button (MW Yellow) for AI engine (Phase 2).
4.1.7 Bottom Row
Three cards: Quick Actions (Start New Job, Log QC Check, Scan Material, Print Traveler, Log
Downtime), Real-time OEE Trend (area chart), Throughput vs Target (bar chart by shift).
```

</details>

## 4.2 Shop Floor (Manufacturing Order Kanban)
### Purpose
4.2.1 Figma Reference
Screenshots: _Shop_Floor.png, blocks_shop_floor_1x.webp. Route: /make/shop-floor.
4.2.2 Column Layout
Each column header shows: title, job count (#6 Jobs), and estimated value (~$124,030).
4.2.3 MO Card Anatomy
Header: MO number (bold) + priority badge (HIGH red / NORMAL grey) right-aligned.
Product: name -- part number (Gear Housing -- GH-202).
Down Red (#DE350B) Stopped: error, safety, or
unplanned maintenance
Maintenance Blue (#0052CC)Scheduled maintenance
Offline Grey (#8FA6A6)Not scheduled for shift
Overdue Red/pink (#FFCDD2)Most overdue first
In Progress Green (#C8E6C9)Soonest due first
Not Started Yellow (#FFF9C4)Priority then due date
Column Header Colour Sort Order

Customer: company name.
Progress bar: MW Yellow fill, completed/total parts (10/50 parts).
Assignment: machine dot + name (Mill-04) · operator name (K. Doe).
Due date: clock icon + date/time.
Buttons: 'Start Job' (MW Yellow, 56px) + 'Details' (outlined). Full card width.
4.2.4 Filter Panel
Screenshot: frame_11_1x.webp. Slide-out panel:

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including filter (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.2.1 Figma Reference
Screenshots: _Shop_Floor.png, blocks_shop_floor_1x.webp. Route: /make/shop-floor.
4.2.2 Column Layout
Each column header shows: title, job count (#6 Jobs), and estimated value (~$124,030).
4.2.3 MO Card Anatomy
Header: MO number (bold) + priority badge (HIGH red / NORMAL grey) right-aligned.
Product: name -- part number (Gear Housing -- GH-202).
Down Red (#DE350B) Stopped: error, safety, or
unplanned maintenance
Maintenance Blue (#0052CC)Scheduled maintenance
Offline Grey (#8FA6A6)Not scheduled for shift
Overdue Red/pink (#FFCDD2)Most overdue first
In Progress Green (#C8E6C9)Soonest due first
Not Started Yellow (#FFF9C4)Priority then due date
Column Header Colour Sort Order

Customer: company name.
Progress bar: MW Yellow fill, completed/total parts (10/50 parts).
Assignment: machine dot + name (Mill-04) · operator name (K. Doe).
Due date: clock icon + date/time.
Buttons: 'Start Job' (MW Yellow, 56px) + 'Details' (outlined). Full card width.
4.2.4 Filter Panel
Screenshot: frame_11_1x.webp. Slide-out panel:
```

</details>

## 4.3 MO Detail -- Overview Tab
### Purpose
4.3.1 Figma Reference
Screenshots: shop_floor_mo_overview_1x.webp, manufacturing_order_detail_page_1x.webp.
Route: /make/orders/:id.
4.3.2 Page Header
Breadcrumb: Home > Make > Manufacturing Orders > MO-2024-001. Title: product name
(Mounting Bracket Assembly) + Job reference (Job #1210, superscript link to Plan). Status
badge. Subtitle: started by, date. Right actions: Print Traveler + Add Work Order (MW Yellow).
4.3.3 Shop Floor Summary Cards
Status Pending, In Progress, QC
Hold, Complete
Checkbox multi-select with
counts
Priority Normal, High, RushCheckbox multi-select with
counts
Machine CNC-01 (12), LASER-02 (6),
PRESS-03 (8), Unassigned
(15)
Dynamic from work_centres
Due Date T oday (10), This Week (34),
Overdue (5)
Radio single-select. Overdue
in red.
Group Options Behaviour
Card Content Source

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.3.1 Figma Reference
Screenshots: shop_floor_mo_overview_1x.webp, manufacturing_order_detail_page_1x.webp.
Route: /make/orders/:id.
4.3.2 Page Header
Breadcrumb: Home > Make > Manufacturing Orders > MO-2024-001. Title: product name
(Mounting Bracket Assembly) + Job reference (Job #1210, superscript link to Plan). Status
badge. Subtitle: started by, date. Right actions: Print Traveler + Add Work Order (MW Yellow).
4.3.3 Shop Floor Summary Cards
Status Pending, In Progress, QC
Hold, Complete
Checkbox multi-select with
counts
Priority Normal, High, RushCheckbox multi-select with
counts
Machine CNC-01 (12), LASER-02 (6),
PRESS-03 (8), Unassigned
(15)
Dynamic from work_centres
Due Date T oday (10), This Week (34),
Overdue (5)
Radio single-select. Overdue
in red.
Group Options Behaviour
Card Content Source

4.3.4 MO Table
Columns: MO #, Customer & Part, Due Date, Status, Progress (bar + %), Actions. Expandable
rows show nested WOs.
4.3.5 Communication Sidebar
Right panel (320px). Chatter thread: avatars, messages, timestamps, @-linking. T ext input +
send + attach. Quick Access: linked SOPs, safety docs.
```

</details>

## 4.4 MO Detail -- Work Tab
### Purpose
4.4.1 Figma Reference
Screenshot: shop_floor_work_1x.webp. Route: /make/orders/:id?tab=work.
4.4.2 MO Row (Parent)
Collapsible: MO number · product name · unit badge (400 units). Second line: Due, Priority,
Customer.
4.4.3 Work Order Row (Child)
Active Job FocusCustomer, MO + status, DUE
IN countdown (4d 12h),
PRIORITY tag
manufacturing_orders +
customers
Shift PerformanceDigital clock (05:42:18),
progress ring (87%), operator
avatars, vs Target
time_entries aggregated
Andon Alerts Badge count (3), alert rows
with time ago, View All Issues
link
andon_alerts realtime
WO Number WO-001 Bold, yellow left border
Part Name Mounting Bracket - BasePrimary text
Machine CNC-01 Right-aligned chip
Progress 75% (75/100 units) Full-width bar
Status IN PROGRESS Green badge
Element Example Notes

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.4.1 Figma Reference
Screenshot: shop_floor_work_1x.webp. Route: /make/orders/:id?tab=work.
4.4.2 MO Row (Parent)
Collapsible: MO number · product name · unit badge (400 units). Second line: Due, Priority,
Customer.
4.4.3 Work Order Row (Child)
Active Job FocusCustomer, MO + status, DUE
IN countdown (4d 12h),
PRIORITY tag
manufacturing_orders +
customers
Shift PerformanceDigital clock (05:42:18),
progress ring (87%), operator
avatars, vs Target
time_entries aggregated
Andon Alerts Badge count (3), alert rows
with time ago, View All Issues
link
andon_alerts realtime
WO Number WO-001 Bold, yellow left border
Part Name Mounting Bracket - BasePrimary text
Machine CNC-01 Right-aligned chip
Progress 75% (75/100 units) Full-width bar
Status IN PROGRESS Green badge
Element Example Notes
```

</details>

## 4.5 Operator Execution View (Shop Floor Mode)
### Purpose
4.5.1 Figma Reference
Screenshot: shop_floor_shop_floor_1x.webp. Primary operator interface. Full-screen three-panel
layout for landscape tablets.
4.5.2 Header Bar (Andon Signal)
Yellow banner: machine icon (red dot), machine name (Amada Ensis Laser), cycle time (3:45,
Target: 3:20), performance alert ('13% SLOWER THAN TARGET').
4.5.3 Left Panel -- Operator & Time
Operator: avatar, name, role, machine. Time: large PAUSE button (120px+, MW Yellow), WORK
ORDER TIME clock (00:16:14, 48px font), estimated finish with progress ring. Unit counter: large
number (78/100) with +/- buttons (56px). Quick actions: Print Label, Report Scrap, Rework.
4.5.4 Centre Panel -- Visual Reference
Large dark viewport. T oggle: Live Cam / CAD. Live Cam: camera feed + green LIVE FEED
indicator. CAD: 3D/2D viewer (Autodesk APS). Footer: BOM button, CAD File button, Next job
link.
4.5.5 Right Panel -- Workflow & QC
Numbered step list with sub-steps. Coloured circles: green=complete, yellow=active,
grey=upcoming. Active step shows inline CAD drawing and checklist items. Example: 1. Setup
calibration (done) → 2. Laser cutting (active, sub-step B: Run cutting program with drawing
preview, checklist).
4.5.6 QC Decision Buttons
Expand chevron > Opens WO execution view
PASS Green #10B981Full width, 64pxMarks step passed,
advances to next
FAIL Red #EF4444Half width, 56pxOpens NCR form,
pauses timer, notifies
supervisor
Button Colour Size Action

HOLD Yellow #FFCF4BHalf width, 56pxPuts WO on hold,
reason required,
notifies supervisor

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including opens (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
4.5.1 Figma Reference
Screenshot: shop_floor_shop_floor_1x.webp. Primary operator interface. Full-screen three-panel
layout for landscape tablets.
4.5.2 Header Bar (Andon Signal)
Yellow banner: machine icon (red dot), machine name (Amada Ensis Laser), cycle time (3:45,
Target: 3:20), performance alert ('13% SLOWER THAN TARGET').
4.5.3 Left Panel -- Operator & Time
Operator: avatar, name, role, machine. Time: large PAUSE button (120px+, MW Yellow), WORK
ORDER TIME clock (00:16:14, 48px font), estimated finish with progress ring. Unit counter: large
number (78/100) with +/- buttons (56px). Quick actions: Print Label, Report Scrap, Rework.
4.5.4 Centre Panel -- Visual Reference
Large dark viewport. T oggle: Live Cam / CAD. Live Cam: camera feed + green LIVE FEED
indicator. CAD: 3D/2D viewer (Autodesk APS). Footer: BOM button, CAD File button, Next job
link.
4.5.5 Right Panel -- Workflow & QC
Numbered step list with sub-steps. Coloured circles: green=complete, yellow=active,
grey=upcoming. Active step shows inline CAD drawing and checklist items. Example: 1. Setup
calibration (done) → 2. Laser cutting (active, sub-step B: Run cutting program with drawing
preview, checklist).
4.5.6 QC Decision Buttons
Expand chevron > Opens WO execution view
PASS Green #10B981Full width, 64pxMarks step passed,
advances to next
FAIL Red #EF4444Half width, 56pxOpens NCR form,
pauses timer, notifies
supervisor
Button Colour Size Action

HOLD Yellow #FFCF4BHalf width, 56pxPuts WO on hold,
reason required,
notifies supervisor
```

</details>
