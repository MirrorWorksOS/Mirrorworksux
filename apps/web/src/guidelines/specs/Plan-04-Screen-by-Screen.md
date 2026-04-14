# Plan — §4 Screen-by-Screen Specification

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) — combined MirrorWorks module specification. **Plan** module, **Section 4** (screen-by-screen). Text below was extracted from the PDF and structured per project guidelines.

| Reference | Path |
| --- | --- |
| Module spec (PDF) | [`../MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) |
| All §4 extracts (index) | [`README.md`](./README.md) |
| Prototype routes | [`PrototypeRouteMap.md#plan`](./PrototypeRouteMap.md#plan) · [`src/routes.tsx`](../../routes.tsx) |

**Status:** §4 content extracted from PDF into Purpose / Data / Actions / States. The PDF remains authoritative if wording diverges.

## Prototype mapping

Full route ↔ component list: **[`PrototypeRouteMap.md` — Plan](PrototypeRouteMap.md#plan)**.

---

## §4 Screens

## 4.1 Plan Dashboard
### Purpose
Route: /plan. Component: PlanDashboard.tsx. Layout: DashboardPage with
bentoVariant="bentoDashboard".
4.1.1 KPI Cards (Top Row)
4.1.2 Action Cards
Upcoming Tasks: List of today's priority items with timestamps. Links to Activities page.
Priority Jobs: Cards showing job name, due date, priority badge (High/Medium/Low with
colour coding). Links to job detail.
Active Jobs68 +8 (up arrow, green)COUNT(*) FROM
plan_ jobs WHERE
status NOT IN
('completed',
'cancelled')
Tasks T oday125 +12 (up arrow, green)COUNT(*) FROM
plan_operations
WHERE planned_date
= CURRENT_DATE
Avg Lead Time3.2d -5% (down arrow,
green)
AVG(actual_end -
actual_start) FROM
plan_ jobs WHERE
completed_at >
NOW() - INTERVAL
'30 days'
On-Time Rate92% +3% (up arrow, green)COUNT completed
on-time / COUNT
completed total,
trailing 30 days
Card Value ExampleChange IndicatorData Source

Quick Actions: New Job, Schedule, View Tasks buttons. Each opens the relevant page or
creation flow.
Production Schedule Chart: Weekly bar chart showing planned vs actual output. Placeholder
in MVP, implemented Phase 2.
MVP note: The dashboard chart is a placeholder. In Phase 2, this becomes a
live production schedule visualisation powered by the AI scheduling engine.

### Data
- UI components and widgets named in specification body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Route: /plan. Component: PlanDashboard.tsx. Layout: DashboardPage with
bentoVariant="bentoDashboard".
4.1.1 KPI Cards (Top Row)
4.1.2 Action Cards
Upcoming Tasks: List of today's priority items with timestamps. Links to Activities page.
Priority Jobs: Cards showing job name, due date, priority badge (High/Medium/Low with
colour coding). Links to job detail.
Active Jobs68 +8 (up arrow, green)COUNT(*) FROM
plan_ jobs WHERE
status NOT IN
('completed',
'cancelled')
Tasks T oday125 +12 (up arrow, green)COUNT(*) FROM
plan_operations
WHERE planned_date
= CURRENT_DATE
Avg Lead Time3.2d -5% (down arrow,
green)
AVG(actual_end -
actual_start) FROM
plan_ jobs WHERE
completed_at >
NOW() - INTERVAL
'30 days'
On-Time Rate92% +3% (up arrow, green)COUNT completed
on-time / COUNT
completed total,
trailing 30 days
Card Value ExampleChange IndicatorData Source

Quick Actions: New Job, Schedule, View Tasks buttons. Each opens the relevant page or
creation flow.
Production Schedule Chart: Weekly bar chart showing planned vs actual output. Placeholder
in MVP, implemented Phase 2.
MVP note: The dashboard chart is a placeholder. In Phase 2, this becomes a
live production schedule visualisation powered by the AI scheduling engine.
```

</details>

## 4.2 Jobs - Kanban View
### Purpose
Route: /plan/jobs (default view). Component: KanbanListPage with module="plan",
entityType="job".
4.2.1 Layout
The Kanban view shows six columns representing the job lifecycle stages:
Backlog N Jobs Jobs created but not yet
planned. Default landing stage
for new jobs.
Planning N Jobs Jobs being planned: BOM
review, routing definition,
resource allocation.
Materials N Jobs Waiting for materials. Purchase
orders created, awaiting
delivery.
Scheduled N Jobs Fully planned and scheduled.
Waiting for production slot.
In Production N Jobs Active on the shop floor.
Handed off to Make module.
Review & Close N Jobs Production complete. Awaiting
QC sign-off, budget
reconciliation.
Column Count Label Description

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
Route: /plan/jobs (default view). Component: KanbanListPage with module="plan",
entityType="job".
4.2.1 Layout
The Kanban view shows six columns representing the job lifecycle stages:
Backlog N Jobs Jobs created but not yet
planned. Default landing stage
for new jobs.
Planning N Jobs Jobs being planned: BOM
review, routing definition,
resource allocation.
Materials N Jobs Waiting for materials. Purchase
orders created, awaiting
delivery.
Scheduled N Jobs Fully planned and scheduled.
Waiting for production slot.
In Production N Jobs Active on the shop floor.
Handed off to Make module.
Review & Close N Jobs Production complete. Awaiting
QC sign-off, budget
reconciliation.
Column Count Label Description

4.2.2 Job Card (Kanban)
Each card displays:
Job ID (e.g., MW001) in bold with monospace font (JetBrains Mono).
Job name / product name below the ID.
Description text (truncated to 2 lines).
Quote count (e.g., "1 Quote" or "0 Quote").
T otal value (e.g., "$77,030") with trend icon.
Assigned user avatar (32px, top-right corner).
4.2.3 Card Interactions
Drag-and-drop between columns to change stage. Triggers status update via Supabase RPC.
Click card to open Job Detail view.
Stage transitions may have validation gates (see Section 7).
4.2.4 Toolbar
Above the Kanban board:
Search input (left): Full-text search across job ID, name, customer, description.
Filter button: Opens filter panel with fields for status, priority, customer, date range, assigned
user.
Create button (MW Yellow): Opens new job creation form.
View toggle (right): List / Grid / Kanban icons. Active view highlighted.
```

</details>

## 4.3 Jobs - Card View
### Purpose
Route: /plan/jobs (card view toggle). Displays a 3-column grid of job cards. Two card types are
visible in the Figma designs:
4.3.1 Organisation Card
Organisation avatar (48px, circular) with name and location (e.g., "Newark, New Jersey").
Coloured status dots row (6 dots representing pipeline stage distribution).
Footer metrics: "24 Orders" count and "$124,030" total value.
4.3.2 Contact Card
Contact avatar (48px, circular) with name and organisation name.
Tag badge (right-aligned).

Footer actions: Email and Call buttons.
Design gap: The Card view mixes CRM-style contact cards with job summary
cards. For the Plan module, cards should show job data (ID, product, stage,
value, due date), not contact info. The contact cards are inherited from the
shared KanbanListPage component and need Plan-specific card templates.

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Route: /plan/jobs (card view toggle). Displays a 3-column grid of job cards. Two card types are
visible in the Figma designs:
4.3.1 Organisation Card
Organisation avatar (48px, circular) with name and location (e.g., "Newark, New Jersey").
Coloured status dots row (6 dots representing pipeline stage distribution).
Footer metrics: "24 Orders" count and "$124,030" total value.
4.3.2 Contact Card
Contact avatar (48px, circular) with name and organisation name.
Tag badge (right-aligned).

Footer actions: Email and Call buttons.
Design gap: The Card view mixes CRM-style contact cards with job summary
cards. For the Plan module, cards should show job data (ID, product, stage,
value, due date), not contact info. The contact cards are inherited from the
shared KanbanListPage component and need Plan-specific card templates.
```

</details>

## 4.4 Jobs - List View
### Purpose
Route: /plan/jobs (list view toggle). Table layout with sortable columns.
4.4.1 Column Definitions
Job ID T ext (mono)Yes Auto-generated ID,
format MW###. Links
to job detail.
Job Name T ext Yes Product or project
name.
Customer T ext + AvatarYes Organisation name
from CRM link.
Stage Badge Yes Current pipeline stage
with colour coding.
Priority Badge Yes Low (green), Medium
(yellow), High
(orange), Urgent (red).
Value Currency Yes T otal job value from
linked quote/order.
Due Date Date Yes Expected delivery
date. Red highlight if
overdue.
Assigned Avatar(s) No User(s) responsible for
the job.
Column Type Sortable Description

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Route: /plan/jobs (list view toggle). Table layout with sortable columns.
4.4.1 Column Definitions
Job ID T ext (mono)Yes Auto-generated ID,
format MW###. Links
to job detail.
Job Name T ext Yes Product or project
name.
Customer T ext + AvatarYes Organisation name
from CRM link.
Stage Badge Yes Current pipeline stage
with colour coding.
Priority Badge Yes Low (green), Medium
(yellow), High
(orange), Urgent (red).
Value Currency Yes T otal job value from
linked quote/order.
Due Date Date Yes Expected delivery
date. Red highlight if
overdue.
Assigned Avatar(s) No User(s) responsible for
the job.
Column Type Sortable Description
```

</details>

## 4.5 Job Detail - Overview Tab
### Purpose
Route: /plan/jobs/:jobId. The Overview tab is the default view when opening a job. It uses a
two-column layout on desktop (65/35 split).
4.5.1 Left Column: Job Metadata
The top section shows the job header with:
Job Name (H2), Stage badge (e.g., "New"), Priority badge (e.g., "Urgent" in red), T otal value
(e.g., "$20,000").
Progress bar below the header (green fill proportional to completion).
Save button (top-right).
Below the header, the Job ID section contains:
Progress Progress barNo Percentage of
operations completed.
Job ID # Auto-generatedRead-only. Format: MW-
{ORG_PREFIX}-
{SEQUENTIAL}
Stage Button group New / Planning / Materials /
Scheduled / In Production /
Review & Close. Click to
advance.
Customer Linked entity Populated from CRM. Click to
navigate to customer record.
Customer ContactT ext input Primary contact name for this
job.
Customer PO T ext input Customer's purchase order
reference number.
Tags Multi-select badgesColour-coded tags (e.g.,
Urgent = red). Configurable in
settings.
Field Type Notes

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Route: /plan/jobs/:jobId. The Overview tab is the default view when opening a job. It uses a
two-column layout on desktop (65/35 split).
4.5.1 Left Column: Job Metadata
The top section shows the job header with:
Job Name (H2), Stage badge (e.g., "New"), Priority badge (e.g., "Urgent" in red), T otal value
(e.g., "$20,000").
Progress bar below the header (green fill proportional to completion).
Save button (top-right).
Below the header, the Job ID section contains:
Progress Progress barNo Percentage of
operations completed.
Job ID # Auto-generatedRead-only. Format: MW-
{ORG_PREFIX}-
{SEQUENTIAL}
Stage Button group New / Planning / Materials /
Scheduled / In Production /
Review & Close. Click to
advance.
Customer Linked entity Populated from CRM. Click to
navigate to customer record.
Customer ContactT ext input Primary contact name for this
job.
Customer PO T ext input Customer's purchase order
reference number.
Tags Multi-select badgesColour-coded tags (e.g.,
Urgent = red). Configurable in
settings.
Field Type Notes

4.5.2 Left Column: Products Table
Heading: "Products" with subtitle "Materials sold". Displays the line items for this job:
Each row has: Part name, T o produce (quantity), Inventory (on-hand), UoM, Status badge,
Responsible user avatar, CAD file link icon.
Footer actions: Save, Expand (full-screen table), Share.
Sales Order Linked entity Reference to the Sell module
order (e.g., GGPC-001).
Opportunity Linked entity Reference to the originating
opportunity.
Order Date Date picker Date the order was confirmed.
Planned Production DateDate picker Target start date for
production.
Expected Delivery DateDate picker Promise date to customer.
Sales RepresentativeUser select Salesperson responsible (from
Sell module).
Shipping T extarea Shipping instructions, special
handling notes.
Description T extarea Job description, scope of
work, special requirements.
Part T ext Manifold
Bracket
Units Produced
(green)
AvatarCAD icon
Part T ext Angle BUnits In progress
(yellow)
AvatarCAD icon
Part T ext Sliding
Brace
Units Scheduled
(blue)
AvatarCAD icon
ColumnType ExampleUoM StatusResponsibl
e
CAD

4.5.3 Left Column: Budget Section
Heading: "Budget" with subtitle "Project running costs". Three-row table:
Footer actions: Save, Expand, Send (email budget report), Share.
4.5.4 Right Column: Schedule M ini-Calendar
A compact monthly calendar with highlighted dates showing scheduled activities. Below the
calendar, a date-specific activity list showing:
Activity title (e.g., "Order 3rd party powder coating").
Date and time range (e.g., " Jun 12, 9:00-10:00").
Expand and Create buttons at the bottom.
4.5.5 Right Column: Intelligence Hub Preview
Shows a 3D rendered image of the primary product (via Autodesk Viewer thumbnail), the
heading "Customer engagement and notes", and a preview of the most recent Chatter
messages. Expand button links to the full Intelligence Hub tab.
4.5.6 Right Column: Chatter
Real-time conversation thread attached to the job. Supports:
T ext messages with user avatar, name, and timestamp.
File upload notifications (e.g., " Jill Wright uploaded BOM and NC files").
Expand button to view full chatter history in Intelligence Hub.
4.5.7 Right Column: Files
File attachment section showing CAD Drawings with item count and upload date. Links to the
file management system in Intelligence Hub.
Materials $20,000 $500 $19,500 Thin progress bar
(low spend =
green)
Labour $20,000 $10,000 $10,000 Progress bar
(50% = amber)
Purchase$10,000 $3,000 $7,000 Progress bar
(30% = green)
CategoryBudget Actual RemainingStatus Bar
```

</details>

## 4.6 Job Detail - Production Tab
### Purpose
The Production tab is the core planning interface. It combines product/routing management, 3D
visualisation, and operation instructions in a single scrollable view.
4.6.1 Products Table (Extended)
The Production tab shows an extended version of the Products table with additional columns:
Additional columns vs the Overview table: Route (Make/Buy/Subcontract), BOM link, NC Files
link, Operator avatar, Workstation assignment, CAD viewer link.
4.6.2 MirrorView (3D Part Visualisation)
Section heading: "MirrorView" with subtitle "3D part visualisation". Tab bar allows switching
between products (e.g., Sliding brace / Angle 50x50 / Manifold bracket).
The viewer is an embedded Autodesk Viewer iframe showing isometric 3D view of the selected
part assembly. T oolbar includes standard Autodesk controls: Home, Model browser, Properties,
Settings. Viewer actions: Geometry, Print, Snapshots, Share.
Implementation: Use the Autodesk Platform Services (APS) Viewer SDK. The
viewer token is obtained via a Supabase Edge Function that authenticates
with APS using client credentials. CAD files (STEP, DWG, Inventor) are
uploaded to APS for translation and viewing. Never store Autodesk credentials
in the frontend.
Sliding
brace
Make 10,000 500 BOM iconNC iconProducedLaser
Angle
50x50
Make 5,000 2,550 BOM iconNC iconIn
progress
Turret
Manifold
bracket
Make 800 0 BOM iconNC iconSchedule
d
Press
Brake
ColumnRouteT o
Produce
InventoryBOM NC FilesStatusWorkstati
on(s)

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Production tab is the core planning interface. It combines product/routing management, 3D
visualisation, and operation instructions in a single scrollable view.
4.6.1 Products Table (Extended)
The Production tab shows an extended version of the Products table with additional columns:
Additional columns vs the Overview table: Route (Make/Buy/Subcontract), BOM link, NC Files
link, Operator avatar, Workstation assignment, CAD viewer link.
4.6.2 MirrorView (3D Part Visualisation)
Section heading: "MirrorView" with subtitle "3D part visualisation". Tab bar allows switching
between products (e.g., Sliding brace / Angle 50x50 / Manifold bracket).
The viewer is an embedded Autodesk Viewer iframe showing isometric 3D view of the selected
part assembly. T oolbar includes standard Autodesk controls: Home, Model browser, Properties,
Settings. Viewer actions: Geometry, Print, Snapshots, Share.
Implementation: Use the Autodesk Platform Services (APS) Viewer SDK. The
viewer token is obtained via a Supabase Edge Function that authenticates
with APS using client credentials. CAD files (STEP, DWG, Inventor) are
uploaded to APS for translation and viewing. Never store Autodesk credentials
in the frontend.
Sliding
brace
Make 10,000 500 BOM iconNC iconProducedLaser
Angle
50x50
Make 5,000 2,550 BOM iconNC iconIn
progress
Turret
Manifold
bracket
Make 800 0 BOM iconNC iconSchedule
d
Press
Brake
ColumnRouteT o
Produce
InventoryBOM NC FilesStatusWorkstati
on(s)

4.6.3 Instructions & Activities Table
Section heading: "Instructions & Activities" with subtitle "Manufacturing instructions". Tab bar
mirrors the Products tabs. Outline dropdown and Columns dropdown for view customisation.
Each row has a drag handle for reordering and a three-dot menu for edit/delete.
4.6.4 2D Drawing Viewer
Below the Instructions table, a second Autodesk Viewer instance displays 2D technical
drawings with dimensions, part details, and assembly instructions. This is the manufacturing
drawing that operators reference during production.
```

</details>

## 4.7 Schedule Tab - Gantt View
### Purpose
The Schedule tab within a job detail shows operations plotted on a timeline. Default view is the
Gantt chart.
OperationStep nameTurret punch
parts
T ext RequiredLinked to
routing
template
Work CentreMachine/stati
on
Turret PunchSelect From
work_centres
table
Drives
capacity
planning
OperatorAssigned
person
Jarrik
Tashjyulov
User selectOptionalCan be auto-
assigned by
AI
MinutesEstimated
duration
60 Number
0 Used for
scheduling
calculations
QC Quality statusIn Progress /
Done
Badge Enum Links to
Quality
module
InstructionsWork
instructions
Nesting
instructions
Link/UploadOptionalPDF, image, or
text
Column DescriptionExample
Value
Type ConstraintsNotes

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Schedule tab within a job detail shows operations plotted on a timeline. Default view is the
Gantt chart.
OperationStep nameTurret punch
parts
T ext RequiredLinked to
routing
template
Work CentreMachine/stati
on
Turret PunchSelect From
work_centres
table
Drives
capacity
planning
OperatorAssigned
person
Jarrik
Tashjyulov
User selectOptionalCan be auto-
assigned by
AI
MinutesEstimated
duration
60 Number
0 Used for
scheduling
calculations
QC Quality statusIn Progress /
Done
Badge Enum Links to
Quality
module
InstructionsWork
instructions
Nesting
instructions
Link/UploadOptionalPDF, image, or
text
Column DescriptionExample
Value
Type ConstraintsNotes

4.7.1 Gantt Chart Layout
Header: "Schedule" with filter chips (All, Done, Pending) and view toggle icons (list view, grid
view).
The Gantt chart has:
Left column: "Operations" label with count (e.g., "9 tasks"). Dropdown to collapse/expand.
T op row: Day numbers (1-20 visible) for the current month. Current day highlighted with a
circle (e.g., day 6).
Each operation row shows coloured blocks spanning the scheduled days.
4.7.2 Operation Rows (from Figma)
4.7.3 Colour Coding
Green (#36B37E): Operation completed.
Yellow (#FFCF4B / MW Yellow): Operation scheduled, in progress, or pending.
Amber/darker yellow: Operation approaching deadline or slightly delayed.
Grey: Unscheduled placeholder days.
Prepare BOMGreen (complete)Days 2-3 None (first)
Prepare NC files Green + YellowDays 4-5 After BOM
Laser CuttingYellow Days 7-9 After NC files
Deburr Cut PartsYellow Days 8-12 After/during Laser
Bend Panels on Press
Brake
Yellow Days 13-14After Deburr
Spot Welding of
Internal Brackets
Yellow Days 7-9 Parallel track
Surface Preparation
Before Coating
Yellow Days 9-10 After Welding
Apply Powder Coating
and Bake
Yellow Days 10-11 After Surface Prep
QC Yellow/AmberDays 12-14After Coating
Operation Colour Approx DaysDependency

4.7.4 Interaction
Horizontal scroll to view more days (scroll bar visible at bottom).
Month navigation arrows (< >) to move between months.
Click an operation block to open edit dialog (change dates, reassign, mark complete).
Drag operation blocks to reschedule (MVP: manual only; Phase 2: AI suggestions).
```

</details>

## 4.8 Schedule Tab - Calendar View
### Purpose
T oggle to Month/Week/Day calendar view via tabs above the calendar.
4.8.1 Month View
Standard monthly calendar grid (Mon-Sun columns). Job events display as coloured blocks
spanning their scheduled dates. Each event card shows:
Job name (e.g., " Job 001").
Assigned operator avatars (up to 3, overflow as +N).
Machine/work centre tags as pills (e.g., "Turret punch", "Press brake").
Event background: MW Yellow (#FFCF4B).
4.8.2 Week and Day Views
Week view shows a 7-column grid with hourly time slots. Day view shows a single-column
hourly breakdown. Both show individual operations as blocks with the same card content as
month view.
M issing from Figma: The Week and Day views are not yet designed. These
should follow the same event card pattern as the Month view but with hourly
granularity. Recommend using the same CalendarProvider component from
shadcn-io used in the Activities page.

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
T oggle to Month/Week/Day calendar view via tabs above the calendar.
4.8.1 Month View
Standard monthly calendar grid (Mon-Sun columns). Job events display as coloured blocks
spanning their scheduled dates. Each event card shows:
Job name (e.g., " Job 001").
Assigned operator avatars (up to 3, overflow as +N).
Machine/work centre tags as pills (e.g., "Turret punch", "Press brake").
Event background: MW Yellow (#FFCF4B).
4.8.2 Week and Day Views
Week view shows a 7-column grid with hourly time slots. Day view shows a single-column
hourly breakdown. Both show individual operations as blocks with the same card content as
month view.
M issing from Figma: The Week and Day views are not yet designed. These
should follow the same event card pattern as the Month view but with hourly
granularity. Recommend using the same CalendarProvider component from
shadcn-io used in the Activities page.
```

</details>

## 4.9 Activities Calendar
### Purpose
Route: /plan/activities. Component: CalendarActivitiesPage with module="plan".
Shared component with Sell module. Displays planning-specific activities such as:
Material order follow-ups.
Design review meetings.
Subcontractor coordination calls.
Job milestone reminders.

QC inspection schedules.
Calendar supports Month, Week, Day views with drag-to-create and click-to-edit interactions.

### Data
- UI components and widgets named in specification body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Route: /plan/activities. Component: CalendarActivitiesPage with module="plan".
Shared component with Sell module. Displays planning-specific activities such as:
Material order follow-ups.
Design review meetings.
Subcontractor coordination calls.
Job milestone reminders.

QC inspection schedules.
Calendar supports Month, Week, Day views with drag-to-create and click-to-edit interactions.
```

</details>

## 4.10 Intelligence Hub Tab
### Purpose
The Intelligence Hub is the AI-powered command centre for each job. It surfaces insights,
tracks engagement, and provides a natural-language interface for job-related queries.
4.10.1 Quote Status Timeline
Vertical timeline showing quote lifecycle events:
Quote #NNN Sent by email (timestamp)
Quote #NNN Opened (timestamp)
Quote #NNN Confirmed (highlighted in MW Yellow, timestamp)
4.10.2 Budget Tracker
Same budget table as Overview tab (Materials/Labour/Purchase with
Budget/Actual/Remaining/Status). Below the table:
Save, Send, Share action buttons.
AI Insight banner (MW Yellow background): Proactive budget analysis. Attributed to
"Intelligence Hub" with timestamp.
4.10.3 Files Section
Six-card grid showing uploaded files:
Drawing sets (01-04) with file icon, name, timestamp.
Bills of Materials (x2) with file icon, name, timestamp.
Footer actions: Upload, Download, Share.
4.10.4 Chatter (Full View)
Threaded conversation with day separators ("T oday", "Yesterday", "Earlier"). Message types:
Intelligence Hub messages (MW Yellow background): AI-generated notifications like " Job
production complete in Make" or material requirements calculations.
User messages: T ext with avatar, name, timestamp. Supports replies.
Voice messages: Audio player with waveform visualisation, duration display.
System messages: File uploads, status changes, schedule notifications.
Input bar at the bottom: Attachment icon (left), text input, camera icon, send button (right).

AI Integration (Phase 2+): The Intelligence Hub will use a Supabase Edge
Function that calls the Anthropic API (Claude) with job context (BOM, routing,
historical data) to answer natural-language questions.

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- User interactions per specification narrative in body.

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Intelligence Hub is the AI-powered command centre for each job. It surfaces insights,
tracks engagement, and provides a natural-language interface for job-related queries.
4.10.1 Quote Status Timeline
Vertical timeline showing quote lifecycle events:
Quote #NNN Sent by email (timestamp)
Quote #NNN Opened (timestamp)
Quote #NNN Confirmed (highlighted in MW Yellow, timestamp)
4.10.2 Budget Tracker
Same budget table as Overview tab (Materials/Labour/Purchase with
Budget/Actual/Remaining/Status). Below the table:
Save, Send, Share action buttons.
AI Insight banner (MW Yellow background): Proactive budget analysis. Attributed to
"Intelligence Hub" with timestamp.
4.10.3 Files Section
Six-card grid showing uploaded files:
Drawing sets (01-04) with file icon, name, timestamp.
Bills of Materials (x2) with file icon, name, timestamp.
Footer actions: Upload, Download, Share.
4.10.4 Chatter (Full View)
Threaded conversation with day separators ("T oday", "Yesterday", "Earlier"). Message types:
Intelligence Hub messages (MW Yellow background): AI-generated notifications like " Job
production complete in Make" or material requirements calculations.
User messages: T ext with avatar, name, timestamp. Supports replies.
Voice messages: Audio player with waveform visualisation, duration display.
System messages: File uploads, status changes, schedule notifications.
Input bar at the bottom: Attachment icon (left), text input, camera icon, send button (right).

AI Integration (Phase 2+): The Intelligence Hub will use a Supabase Edge
Function that calls the Anthropic API (Claude) with job context (BOM, routing,
historical data) to answer natural-language questions.
```

</details>
