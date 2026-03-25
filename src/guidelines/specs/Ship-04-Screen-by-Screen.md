# Ship — §4 Screen-by-Screen Specification

**Canonical source:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) — combined MirrorWorks module specification. **Ship** module, **Section 4** (screen-by-screen). Text below was extracted from the PDF and structured per project guidelines.

| Reference | Path |
| --- | --- |
| Module spec (PDF) | [`../MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) |
| All §4 extracts (index) | [`README.md`](./README.md) |
| Prototype routes | [`PrototypeRouteMap.md#ship`](./PrototypeRouteMap.md#ship) · [`src/routes.tsx`](../../routes.tsx) |

**Status:** §4 content extracted from PDF into Purpose / Data / Actions / States. The PDF remains authoritative if wording diverges.

## Prototype mapping

Full route ↔ component list: **[`PrototypeRouteMap.md` — Ship](PrototypeRouteMap.md#ship)**.

---

## §4 Screens

## 4.1 Dashboard
### Purpose
The Ship module dashboard serves as the central command centre for logistics operations,
providing at-a-glance visibility of shipment status, carrier performance, and fulfilment pipeline
health.
4.1.1 KPI Cards (Top Row)
A bento grid layout displays six key performance indicators in the dashboard header:
Layout grid: 3 columns on desktop, 2 on tablet, 1 on mobile. Cards use ShadCN Card
component with 16px padding. Typography: metric in 28px Roboto bold, label in 14px Roboto
Active ShipmentsCount of shipments
currently in transit
Trend arrow (green
up/red down)
Click navigates to
Tracking list filtered to
"In Transit"
Pending OrdersCount of orders ready
to dispatch
Trend indicatorNavigates to Orders
filtered to "Ready to
Ship"
On-Time Delivery
Rate
Percentage of on-time
deliveries (current
month)
Trend percentageLinks to Reports view
for detailed analysis
Avg Transit TimeAverage days in transit
for delivered
shipments
Trend days Shows comparison to
previous month
Delivery ExceptionsCount of current
issues (delays,
damage, refusals)
Red variant if > 0,
green if 0
Click opens Delivery
Exceptions panel
T oday's DispatchesCurrent dispatches vs
daily target (e.g.,
47/50)
Progress barShows breakdown by
carrier
KPI Content Visual Interaction

regular. Trend arrows positioned top-right at 12px Roboto.
4.1.2 Active Shipments Card
Scrollable list displaying up to 10 most recent in-transit shipments. Each row contains:
Field specifications:
Tracking Number: Copy button on hover (12px Roboto Mono)
Carrier Icon: 24x24px logo from carrier branding set
Customer Name: 14px Roboto, primary text
Destination City & State: 12px Roboto, secondary text
ETA: Bold red (#FF6B6B) if overdue, standard if on schedule
Status Badge: ShadCN Badge component, colour coded
Click row to open Tracking detail sheet. Scroll shows up to 3 shipments; "View All" link at bottom
navigates to full Tracking screen.
4.1.3 Fulfilment Pipeline Summary
Horizontal progress pipeline showing counts at each stage:
Visual specification:
Six connected boxes with arrow connectors
Count centred in box, 16px Roboto bold
Stage label below, 12px Roboto
Background: #F5F5F5, text: #1A2732 (MW M irage)
Active stage highlighted with #FFCF4B border (MW Yellow)
Each stage is clickable and navigates to Orders screen with status filter applied. Hover shows
tooltip with additional details (e.g., "12 items in packing queue, estimated 2.5 hours to
completion").
4.1.4 Carrier Performance Card
M ini horizontal bar chart showing …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Ship module dashboard serves as the central command centre for logistics operations,
providing at-a-glance visibility of shipment status, carrier performance, and fulfilment pipeline
health.
4.1.1 KPI Cards (Top Row)
A bento grid layout displays six key performance indicators in the dashboard header:
Layout grid: 3 columns on desktop, 2 on tablet, 1 on mobile. Cards use ShadCN Card
component with 16px padding. Typography: metric in 28px Roboto bold, label in 14px Roboto
Active ShipmentsCount of shipments
currently in transit
Trend arrow (green
up/red down)
Click navigates to
Tracking list filtered to
"In Transit"
Pending OrdersCount of orders ready
to dispatch
Trend indicatorNavigates to Orders
filtered to "Ready to
Ship"
On-Time Delivery
Rate
Percentage of on-time
deliveries (current
month)
Trend percentageLinks to Reports view
for detailed analysis
Avg Transit TimeAverage days in transit
for delivered
shipments
Trend days Shows comparison to
previous month
Delivery ExceptionsCount of current
issues (delays,
damage, refusals)
Red variant if > 0,
green if 0
Click opens Delivery
Exceptions panel
T oday's DispatchesCurrent dispatches vs
daily target (e.g.,
47/50)
Progress barShows breakdown by
carrier
KPI Content Visual Interaction

regular. Trend arrows positioned top-right at 12px Roboto.
4.1.2 Active Shipments Card
Scrollable list displaying up to 10 most recent in-transit shipments. Each row contains:
Field specifications:
Tracking Number: Copy button on hover (12px Roboto Mono)
Carrier Icon: 24x24px logo from carrier branding set
Customer Name: 14px Roboto, primary text
Destination City & State: 12px Roboto, secondary text
ETA: Bold red (#FF6B6B) if overdue, standard if on schedule
Status Badge: ShadCN Badge component, colour coded
Click row to open Tracking detail sheet. Scroll shows up to 3 shipments; "View All" link at bottom
navigates to full Tracking screen.
4.1.3 Fulfilment Pipeline Summary
Horizontal progress pipeline showing counts at each stage:
Visual specification:
Six connected boxes with arrow connectors
Count centred in box, 16px Roboto bold
Stage label below, 12px Roboto
Background: #F5F5F5, text: #1A2732 (MW M irage)
Active stage highlighted with #FFCF4B border (MW Yellow)
Each stage is clickable and navigates to Orders screen with status filter applied. Hover shows
tooltip with additional details (e.g., "12 items in packing queue, estimated 2.5 hours to
completion").
4.1.4 Carrier Performance Card
M ini horizontal bar chart showing on-time delivery rate per carrier, sorted by volume (highest
first).
Data visualisation:
1 Tracking #123456 | [Carrier Icon] | John Smith | Melbourne, VIC | ETA: 2026-03-05 | [In
Transit Badge]
1 Awaiting Pick: 23 | Picking: 8 | Packing: 12 | Ready to Ship: 34 | Shipped: 156 | Delivered:
1,247

X-axis: 0–100% on-time rate
Y-axis: Carrier names (Australia Post, T oll/IPEC, StarTrack, TNT, DHL Express, Aramex,
Sendle, Allied Express)
Bar colour: green (#4CAF50) if ≥95%, amber (#FFC107) if 85–94%, red (#FF6B6B) if <85%
Percentage label at bar end, 12px Roboto
Card header: "Carrier On-Time Performance" | "View Full Reports" link (blue, 12px)
Chart height: 200px. Use ShadCN Chart or Recharts library for rendering.
Click "View Full Reports" to navigate to Reports > Carrier Performance Comparison.
4.1.5 Delivery Exceptions Card
List of current active exceptions (delayed, address issue, damage claim, refused delivery). Each
exception row:
Specifications:
Left Border: 4px solid #FF6B6B (red)
Tracking Number: 12px Roboto Mono, copiable
Exception Type Badge: ShadCN Badge, variant="destructive"
Customer Name: 13px Roboto
Action Buttons:
Contact Customer: Opens communication panel
Reroute: Requires carrier selection, triggers shipping recalc
Resolve: Marks exception as resolved, logs timestamp
Maximum 5 exceptions shown; "View All Exceptions" link scrolls to Delivery Exceptions panel.
Background on hover: #FFF5F5. T ouch target: 56px minimum height.
4.1.6 Today's Schedule
Timeline strip at dashboard bottom showing scheduled pickups by carrier with time windows.
Visual design:
Horizontal timeline, left-aligned time
1 | ▮ [Red left border, 4px] | #123456 | Address Issue | Sarah Johnson | [Contact Customer]
[Reroute] [Resolve]
1 [09:00 AM] Australia Post [45 packages]
2 [11:30 AM] Toll/IPEC [32 packages]
3 [02:00 PM] StarTrack [28 packages]
4 [04:30 PM] TNT [18 packages]

Carrier logo (24x24px) with carrier name (13px Roboto)
Package count in smaller text (11px)
Card background: #F5F5F5
Time in 13px Roboto Mono, bold
Each pickup is clickable and navigates to Shipping > Pickup Schedule with carrier filtered. Hover
shows tooltip: "Ready for pickup: 45 packages | Manifest status: Prepared | Actions: View
Manifest, Call Carrier".
```

</details>

## 4.2 Orders (Fulfilment Pipeline)
### Purpose
The Orders module displays the fulfilment pipeline as a Kanban board, allowing operators to
manage orders from production handoff through to shipment.
4.2.1 Kanban Board
Pipeline layout with five columns representing fulfilment stages:
1. Completed Production (items ready for pick list generation)
2. Pick List (orders being picked from warehouse)
3. Packaging (orders in packing station)
4. Ready to Ship (packed orders awaiting carrier pickup)
5. Shipped (handed to carrier)
Column headers display:
Specifications:
Column width: Responsive; minimum 300px desktop, single column on mobile
Background: #FAFAFA
Header background: #F5F5F5
Drag-and-drop enabled between columns
Dragged card shows semi-transparent overlay (0.7 opacity)
Orders not yet assigned to a fulfilment stage appear in a separate "Unassigned" column.
4.2.2 Order Card Anatomy
Each order is represented as a draggable ShadCN Card in the Kanban board:
1 [Stage Name]
2 Count: 23
3 Total Value: $15,487.50

Field-level specifications:
Card dimensions: 280px width, variable height based on content (min 240px). Padding: 16px.
Shadow: ShadCN default. Hover: subtle background lift, cursor pointer.
TSX Pseudocode for Order Card Component:
1 ┌─────────────────────────────────────┐
2 │ ORD-2026-0847 [Express] [Free Ship] │
3 │ John Smith, Sydney NSW │
4 │ Ship: 2026-03-04 [URGENT if red] │
5 │ 3 items | ████░░░░░░ 60% │
6 │ Deliver: Parramatta NSW │
7 │ • Blue Widget × 2 [SKU-001] │
8 │ • Red Gadget × 1 [SKU-024] │
9 │ + 0 more │
10 │ [Pick List] [Pack Order] [💬] │
11 └─────────────────────────────────────┘
Order Number Bold 14px Roboto, copiable, left-aligned
Priority Badge ShadCN Badge: "Standard" (grey), "Express"
(#FF9800), "Priority" (red #FF6B6B)
Shipping Method Badge ShadCN Badge: "Free Ship", "Flat Rate",
"Standard", "Express"
Customer Name & Location13px Roboto, primary text
Ship Date 12px Roboto; red text (#FF6B6B) if same-day
or overdue
Item Count & Progress "3 items" in 11px; progress bar 100px wide,
filled colour #4CAF50
Delivery City/State 12px Roboto, secondary text, light colour
Line Items Summary First 2 items shown as "• Description × qty
[SKU]", 11px Roboto. If >2 items, "+ X more"
link
Action Buttons Three ShadCN Buttons, 56px height touch
target: "Pick List", "Pack Order", "💬 Chat"
(ModuleChatButton)
Field Specification
1 import React from 'react';
2 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

3 import { Badge } from '@/components/ui/badge';
4 import …

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
The Orders module displays the fulfilment pipeline as a Kanban board, allowing operators to
manage orders from production handoff through to shipment.
4.2.1 Kanban Board
Pipeline layout with five columns representing fulfilment stages:
1. Completed Production (items ready for pick list generation)
2. Pick List (orders being picked from warehouse)
3. Packaging (orders in packing station)
4. Ready to Ship (packed orders awaiting carrier pickup)
5. Shipped (handed to carrier)
Column headers display:
Specifications:
Column width: Responsive; minimum 300px desktop, single column on mobile
Background: #FAFAFA
Header background: #F5F5F5
Drag-and-drop enabled between columns
Dragged card shows semi-transparent overlay (0.7 opacity)
Orders not yet assigned to a fulfilment stage appear in a separate "Unassigned" column.
4.2.2 Order Card Anatomy
Each order is represented as a draggable ShadCN Card in the Kanban board:
1 [Stage Name]
2 Count: 23
3 Total Value: $15,487.50

Field-level specifications:
Card dimensions: 280px width, variable height based on content (min 240px). Padding: 16px.
Shadow: ShadCN default. Hover: subtle background lift, cursor pointer.
TSX Pseudocode for Order Card Component:
1 ┌─────────────────────────────────────┐
2 │ ORD-2026-0847 [Express] [Free Ship] │
3 │ John Smith, Sydney NSW │
4 │ Ship: 2026-03-04 [URGENT if red] │
5 │ 3 items | ████░░░░░░ 60% │
6 │ Deliver: Parramatta NSW │
7 │ • Blue Widget × 2 [SKU-001] │
8 │ • Red Gadget × 1 [SKU-024] │
9 │ + 0 more │
10 │ [Pick List] [Pack Order] [💬] │
11 └─────────────────────────────────────┘
Order Number Bold 14px Roboto, copiable, left-aligned
Priority Badge ShadCN Badge: "Standard" (grey), "Express"
(#FF9800), "Priority" (red #FF6B6B)
Shipping Method Badge ShadCN Badge: "Free Ship", "Flat Rate",
"Standard", "Express"
Customer Name & Location13px Roboto, primary text
Ship Date 12px Roboto; red text (#FF6B6B) if same-day
or overdue
Item Count & Progress "3 items" in 11px; progress bar 100px wide,
filled colour #4CAF50
Delivery City/State 12px Roboto, secondary text, light colour
Line Items Summary First 2 items shown as "• Description × qty
[SKU]", 11px Roboto. If >2 items, "+ X more"
link
Action Buttons Three ShadCN Buttons, 56px height touch
target: "Pick List", "Pack Order", "💬 Chat"
(ModuleChatButton)
Field Specification
1 import React from 'react';
2 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

3 import { Badge } from '@/components/ui/badge';
4 import { Button } from '@/components/ui/button';
5 import { Progress } from '@/components/ui/progress';
6 import { MessageCircle } from 'lucide-react';
8 interface OrderCardProps {
9 order: {
10 number: string;
11 customerName: string;
12 customerLocation: string;
13 shipDate: Date;
14 items: Array<{ description: string; sku: string; quantity: number }>;
15 deliveryCity: string;
16 deliveryState: string;
17 priority: 'standard' | 'express' | 'priority';
18 shippingMethod: string;
19 progressPercent: number;
20 isUrgent: boolean;
21 };
22 onPickList: () => void;
23 onPackOrder: () => void;
24 onChat: () => void;
25 }
27 export const OrderCard: React
.FC<OrderCardProps> = ({
28 order,
29 onPickList,
30 onPackOrder,
31 onChat,
32 }) => {
33 const getPriorityVariant = () => {
34 const map = {
35 standard: 'secondary',
36 express: 'orange',
37 priority: 'destructive',
38 };
39 return map[order.priority];
40 };
42 const isShipDateRed = order.shipDate <= new Date() || order.isUrgent;
44 return (
45 <Card className="w-[280px] cursor-grab active:cursor-grabbing hover:shadow-lg
transition-shadow">
46 <CardHeader className="pb-3">
47 <div className="flex items-start justify-between gap-2">
48 <CardTitle className="text-sm font-bold font-roboto">
49 {order.number}
50 </CardTitle>
51 <div className="flex gap-1">
52 <Badge variant={
getPriorityVariant()}>
53 {order.priority}
54 </Badge>
55 <Badge variant="outline">{order.shippingMethod}</Badge>
56 </div>
57 </div>
58 <div className="text-xs text-gray-600">
59 {order.customerName}, {order.customerLocation}
60 </div>
61 </CardHeader>
63 <CardContent className="space-y-3">
64 {/* Ship Date */}
65 <div>
66 <div
67 className={`text-xs font-medium ${
68 isShipDateRed ? 'text-red-600' : 'text-gray-700'

69 }`}
70 >
71 Ship: {order.shipDate.toLocaleDateString('en-AU')}
72 </div>
73 </div>
75 {/* Item Count & Progress */}
76 <div>
77 <div className="text-xs text-gray-600 mb-1">
78 {order.items.length} items
79 </div>
80 <Progress value={order.progressPercent} className="h-1" />
81 <div className="text-xs text-gray-500 mt-1">
82 {order.progressPercent}% complete
83 </div>
84 </div>
86 {/* Delivery Location */}
87 <div className="text-xs text-gray-600">
88 Deliver: {order.deliveryCity}, {order.deliveryState}
89 </div>
91 {/* Line Items */}
92 <div className="text-xs space-y-1">
93 {order.items.slice(0
, 2).map((item, idx) => (
94 <div key={idx} className="text-gray-700">
95 • {item.description} × {item.quantity} [{item.sku}]
96 </div>
97 ))}
98 {order.items.length > 2 && (
99 <div className="text-blue-600 cursor-pointer">
100 + {order.items.length - 2} more
101 </div>
102 )}
103 </div>
105 {/* Action Buttons */}
106 <div className="flex gap-2 pt-2">
107 <Button
108 size="sm"
109 variant="outline"
110 onClick={onPickList}
111 className="flex-1 h-[56px]"
112 >
113 Pick List
114 </Button>
115 <
Button
116 size="sm"
117 variant="outline"
118 onClick={onPackOrder}
119 className="flex-1 h-[56px]"
120 >
121 Pack Order
122 </Button>
123 <Button
124 size="sm"
125 variant="outline"
126 onClick={onChat}
127 className="h-[56px] w-[56px] p-0"
128 >
129 <MessageCircle size={18} />
130 </Button>
131 </div>
132 </CardContent>
133 </Card>
134 );

4.2.3 Order Detail Sheet
A full-screen modal or side panel opened by clicking an order card. Contains tabbed interface
with eight sections:
Overview Tab
Displays summary information:
Order number, created date/time, customer details
Shipping address, billing address (if different)
Shipping method, service level, cost (AUD)
Special instructions (large text field, 400px height)
Timeline: Order Created → Picked → Packed → Shipped → Out for Delivery → Delivered
(visual timeline with dates/times)
Items Tab
Data table with columns:
SKU (left-aligned, 80px)
Description (flexible width)
Quantity (centre, 60px)
Unit Price (AUD, right, 80px)
Line T otal (AUD, right, 100px)
Actions (bin icon to remove)
Subtotal, shipping, tax, total displayed at bottom in bold 14px.
Address Tab
Billing and shipping addresses in card format. Edit buttons for each address. Validation on save.
Address format: Street | Suburb | State | Postcode.
Shipping Tab
Shipping method dropdown (Standard, Express, Overnight, International)
Carrier selection (Australia Post, T oll/IPEC, StarTrack, TNT, DHL, Aramex, Sendle, Allied
Express)
Service level (selected carrier's service options)
Insurance options (checkbox, optional AUD value field)
Signature on delivery (checkbox)
135 };

Deliver date (auto-calculated, editable)
Packaging Tab
Box dimensions (cm: length, width, height)
Box weight (kg, tare weight)
Packing notes (text area)
Special handling (checkboxes: Fragile, Keep Upright, Hazmat, Perishable)
Documents Tab
Invoice (PDF download link)
Packing slip (PDF download link)
Shipping label (PDF download link)
Customs declaration (if international)
Custom documents (file upload area)
Tracking Tab
Tracking number (copiable)
Carrier name with logo
Real-time tracking events (table: timestamp, location, status, details)
Delivery proof (photo if available)
Customer notification history (sent at: order shipped, out for delivery, delivered)
History Tab
Chronological log of all state changes
Table: timestamp, user, action, details
Filter by action type (created, status changed, address modified, notes added, etc.)
Sheet dimensions: Full-width modal on mobile/tablet, 800px fixed on desktop with right side
panel. Close button (X) top-right.
4.2.4 Filter Panel
Located above Kanban board, collapsible filter bar with the following filters:
Status Multi-select dropdownAwaiting Pick, Picking,
Packing, Ready to Ship,
Shipped
Filter Type Options

Filter specifications:
Filter bar background: #F5F5F5, padding 12px 16px
Filter chips displayed as tags with × to remove
"Clear All" button resets all filters
Filtered results count shown: "Showing X of Y orders"
Filters are URL-parameterised for sharable links
```

</details>

## 4.3 Packaging (Pack Station Interface)
### Purpose
The Pack Station module is optimised for warehouse operators physically packing orders.
T ouch-friendly layout with minimal text entry and rapid workflows.
4.3.1 Station Header
T op banner displaying operator workspace context:
Specifications:
Station ID: 16px Roboto bold, left-aligned
Operator Name: 14px Roboto, with avatar circle (32px, initials " JC" if no photo)
Shift Badge: ShadCN Badge, colour-coded (Morning: green, Afternoon: orange, Night: dark)
Efficiency Percentage: 16px Roboto bold, trend arrow (green up if >90%), right-aligned
Tappable for shift change, operator details popup.
Priority Multi-select checkboxStandard, Express, Priority
Carrier Multi-select dropdownAustralia Post, T oll/IPEC,
StarTrack, TNT, DHL, Aramex,
Sendle, Allied Express
Ship Date Date range pickerFrom date → T o date
Destination T ext/postcode searchSearches on suburb or
postcode
Customer T ext search fieldSearches on customer name,
phone, email
Has Exceptions Boolean toggleOn/Off
1 Pack Station A1 | Operator: Jamie Chen | Shift: Morning (06:00 – 14:30) | Efficiency: 94% ↑

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
The Pack Station module is optimised for warehouse operators physically packing orders.
T ouch-friendly layout with minimal text entry and rapid workflows.
4.3.1 Station Header
T op banner displaying operator workspace context:
Specifications:
Station ID: 16px Roboto bold, left-aligned
Operator Name: 14px Roboto, with avatar circle (32px, initials " JC" if no photo)
Shift Badge: ShadCN Badge, colour-coded (Morning: green, Afternoon: orange, Night: dark)
Efficiency Percentage: 16px Roboto bold, trend arrow (green up if >90%), right-aligned
Tappable for shift change, operator details popup.
Priority Multi-select checkboxStandard, Express, Priority
Carrier Multi-select dropdownAustralia Post, T oll/IPEC,
StarTrack, TNT, DHL, Aramex,
Sendle, Allied Express
Ship Date Date range pickerFrom date → T o date
Destination T ext/postcode searchSearches on suburb or
postcode
Customer T ext search fieldSearches on customer name,
phone, email
Has Exceptions Boolean toggleOn/Off
1 Pack Station A1 | Operator: Jamie Chen | Shift: Morning (06:00 – 14:30) | Efficiency: 94% ↑

4.3.2 Active Order Panel
Main content area with two-column layout (desktop) or stacked (mobile):
Left Column (Order Information):
Typography: Order number 16px bold, labels 12px secondary, values 13px primary. Address in
monospace font.
Right Column (Items to Pack Checklist):
Specifications:
SKU in 12px Roboto Mono, bold
Quantity and bin location in 11px secondary text
Serial numbers listed per item (if applicable)
Checkbox 24px target, tap to mark packed
Completed items strikethrough, opacity 0.6
All items packed: green success message "✓ All items packed"
4.3.3 Package Selection & Completion
Three-column layout at bottom of screen (desktop) or stacked below items (mobile):
Column 1: Package Selection
Dropdown menu with recommended box sizes. Each option shows:
1 Order ORD-2026-0847
2 Customer: John Smith
3 Order Date: 2026-02-28
4 Shipping Method: Express Post
5 Delivery Address:
6 47 Parramatta Road
7 Parramatta NSW 2150
8 Australia
10 Special Instructions:
11 Leave with trusted neighbour if unattended.
12 Signature required.
1 ┌─ Items to Pack ────────────────────┐
2 │ ☐ Blue Widget [SKU-001] │
3 │ Qty: 2 | Bin: A-12-3 │
4 │ Serial: WD-2026-0847-001 │
5 │ Serial: WD-2026-0847-002 │
6 │ │
7 │ ☐ Red Gadget [SKU-024] │
8 │ Qty: 1 | Bin: C-05-1 │
9 │ Serial: RG-2026-0847-001 │
10 │ │
11 │ ☐ Green Component [SKU-047] │
12 │ Qty: 3 | Bin: B-08-2 │
13 │ (No serial numbers) │
14 └────────────────────────────────────┘

Selection highlights recommended option based on item dimensions/weight. ShadCN Select
component. T ouching dropdown shows full catalogue with photos.
Column 2: Package Details
Input fields (metric units):
Weight (kg): Number input, spinner controls, placeholder "0.00 kg", required
Insurance Value (AUD): Number input, optional, placeholder "$0.00"
Dimensions (cm): Three separate inputs for Length, Width, Height, optional
Fields validate on blur; weight must be ≥0.2kg and ≤ box max weight.
Column 3: Complete Packing
Three action buttons stacked vertically:
1. "Complete & Print Label" - Primary button, background MW Yellow (#FFCF4B), text
#1A2732, 56px height, full column width. Triggers label printing to designated printer, updates
order status to "Ready to Ship", opens next order automatically.
2. "Add Photo" - Secondary outline button, camera icon. Opens photo capture on mobile, file
picker on desktop. Stores packaging photo for reference.
3. "Add Note" - T ertiary outline button, notepad icon. Opens text input modal for packer notes
(e.g., "Box slightly crushed but items intact").
4.3.4 Productivity Metrics
Bottom row displaying operator performance metrics in four ShadCN stat cards:
1 Standard Box (L: 40cm × W: 25cm × D: 15cm, Max: 5kg) | Cost: $0.85 | [AI Recommended ★]
2 Large Box (L: 60cm × W: 40cm × D: 40cm, Max: 15kg) | Cost: $1.40
Orders Packed T oday47 24px Roboto bold, secondary
"Target: 50"
Average Pack Time8.3 min 18px Roboto, secondary "Per
order"
Accuracy Rate99.2% 20px Roboto, green #4CAF50,
secondary "↑ vs 97.1%
yesterday"
Packages/Hour7.2 18px Roboto, secondary
"Station capacity: 8.0"
Metric Display Format

Card background: #F5F5F5, padding 12px. Typography centred. Update in real-time every 30
seconds.
TSX Pseudocode for PackStation Component:
1 import React, { useState } from 'react';
2 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
3 import { Badge } from '@/components/ui/badge';
4 import { Button } from '@/components/ui/button';
5 import { Checkbox } from '@/components/ui/checkbox';
6 import {
7 Select,
8 SelectContent,
9 SelectItem,
10 SelectTrigger,
11 SelectValue,
12 } from '@/components/ui/select';
13 import { Input } from '@/components/ui/input';
14 import { CheckCircle2, Camera, MessageSquare, Printer } from 'lucide-react';
16 interface PackStationProps {
17 stationId: string;
18 operatorName: string;
19 currentOrder: {
20 number: string;
21 customer: string;
22 shippingAddress: string;
23 specialInstructions: string;
24 items: Array<{
25 sku: string;
26 description: string;
27 quantity: number;
28 binLocation: string;
29 serialNumbers: string[];
30 }>;
31 };
32 onComplete: (packageDetails: any) => void;
33 onNextOrder: () => void;
34 }
36 export const PackStation: React.FC<PackStationProps> = ({
37 stationId,
38 operatorName,
39 currentOrder,
40 onComplete,
41 onNextOrder,
42 }) => {
43 const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
44 const [selectedBox, setSelectedBox] = useState('');
45 const [weight, setWeight] = useState('');
46 const [insuranceValue, setInsuranceValue] = useState('');
47 const [dimensions, setDimensions] = useState({
 length: '', width: '', height: '' });
49 const allItemsPacked = currentOrder.items.every(
50 (item) => packedItems[item.sku]
51 );
53 const handleCompletePacking = async () => {
54 if (!allItemsPacked || !selectedBox || !weight) {
55 alert('Please pack all items and enter package details');
56 return;
57 }

59 const packageDetails = {
60 box: selectedBox,
61 weight: parseFloat(weight),
62 insuranceValue: insuranceValue ? parseFloat(insuranceValue) : 0,
63 dimensions,
64 };
66 onComplete(packageDetails);
67 // Print label
68 await printLabel(currentOrder.number);
69 onNextOrder();
70 };
72 const printLabel = async (orderNumber: string) => {
73 // Integration with label printer
74 console.log(`Printing label for ${orderNumber}`);
75 };
77 return (
78 <div className="min-h-screen bg-white flex flex-col">
79 {/* Station Header */}
80 <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b">
81 <div className="flex items-center gap-4">
82 <div className="text-lg font-bold font-roboto">
83 Pack Station {stationId}
84 </div>
85 <div className="flex items-center gap-2
">
86 <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-
center text-white text-xs font-bold">
87 {operatorName.split(' ').map((n) => n[0]).join('')}
88 </div>
89 <span className="text-sm">Operator: {operatorName}</span>
90 </div>
91 </div>
92 <Badge className="bg-green-100 text-green-800">Efficiency: 94%</Badge>
93 </div>
95 {/* Main Content Grid */}
96 <div className="flex-1 grid grid-cols-2 gap-6 p-6 lg:grid-cols-2 md:grid-cols-1">
97 {/* Left: Order Info */}
98 <Card>
99 <CardHeader>
100 <CardTitle className="text-base">
101 Order {currentOrder.number}
102 </CardTitle>
103 </CardHeader>
104 <CardContent className="space-y-4 text-sm">
105 <div>
106 <div
className="text-xs text-gray-500">Customer</div>
107 <div className="font-medium">{currentOrder.customer}</div>
108 </div>
109 <div>
110 <div className="text-xs text-gray-500">Shipping Address</div>
111 <div className="font-mono text-xs whitespace-pre-wrap">
112 {currentOrder.shippingAddress}
113 </div>
114 </div>
115 <div>
116 <div className="text-xs text-gray-500">Special Instructions</div>
117 <div className="text-xs">{currentOrder.specialInstructions}</div>
118 </div>
119 </CardContent>
120 </Card>
122 {/* Right: Items Checklist */}
123 <Card>
124 <CardHeader>

125 <CardTitle className="text-base">Items to Pack</CardTitle>
126 </CardHeader>
127 <CardContent className="space-y-4">
128 {currentOrder.items.map((item) => (
129 <div
130 key={item.sku}
131 className={`p-3 border rounded flex gap-3 ${
132 packedItems[item.sku]
133 ? 'bg-gray-50 opacity-60 line-through'
134 : ''
135 }`}
136 >
137 <Checkbox
138 checked={packedItems[item.sku] || false}
139 onCheckedChange={(checked) =>
140 setPackedItems({
141 ...packedItems,
142 [item.sku]: checked,
143 })
144 }
145 className="w-6 h-6 mt-0.5"
146 />
147 <div className="flex-1 text-xs space-y-1">
148 <div className="font-mono font-bold">{item.sku}</div>
149 <div>{item.description}</div>
150 <div className="text-gray-600">
151 Qty: {item.quantity} | Bin: {item.binLocation}
152 </div>
153 {item.serialNumbers.length > 0 && (
154 <div className="text-gray-600">
155 {item.serialNumbers.map((sn) => (
156 <div key={sn}>Serial: {sn}</div>
157 ))}
158 </div>
159 )}
160 </div>
161 </div>
162 ))}
164 {allItemsPacked && (
165 <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2
rounded">
166 <CheckCircle2 size={18} />
167 <span className="text-sm font-medium">All items packed</span>
168 </div>
169 )}
170 </CardContent>
171 </Card>
172 </div>
174 {/* Package Selection & Completion */}
175 <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 border-t lg:grid-cols-3
md:grid-cols-1">
176 {/* Box Selection */}
177 <Card>
178 <CardHeader>
179 <CardTitle className="text-sm">Select Box</CardTitle>
180 </CardHeader>
181 <CardContent>
182 <Select value={selectedBox} onValueChange={setSelectedBox}>
183 <SelectTrigger>
184 <SelectValue placeholder="Choose box size" />
185 </SelectTrigger>
186 <SelectContent>
187 <SelectItem value="standard">
188 Standard (40×25×15cm, $0.85)
189 </SelectItem>

190 <SelectItem value="large">
191 Large (60×40×40cm, $1.40)
192 </SelectItem>
193 </SelectContent>
194 </Select>
195 </CardContent>
196 </Card>
198 {/* Package Details */}
199 <Card>
200 <CardHeader>
201 <CardTitle className="text-sm">Package Details</CardTitle>
202 </CardHeader>
203 <CardContent className="space-y-3">
204 <div>
205 <label className="text-xs block mb-1">Weight (kg)</label>
206 <Input
207 type="number"
208 value={weight}
209 onChange={(e) => setWeight(e.target.value)}
210 placeholder="0.00"
211 step="0.1"
212 />
213 </div>
214 <div>
215 <label className="text-xs block mb-1">Insurance (AUD)</label>
216 <Input
217 type="number"
218 value={insuranceValue}
219 onChange={(e) => setInsuranceValue(e.target.value)}
220 placeholder="$0.00"
221 step="0.01"
222 />
223 </div>
224 </CardContent>
225 </Card>
227 {/* Complete Packing */}
228 <Card>
229 <CardHeader>
230 <CardTitle className="text-sm">Finish Packing</CardTitle>
231 </CardHeader>
232 <CardContent className="flex flex-col gap-3">
233 <Button
234 onClick={handleCompletePacking}
235 disabled={!allItemsPacked || !weight || !selectedBox}
236 className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 h-14 font-bold"
237 >
238 <Printer className="mr-2" size={18} />
239 Complete & Print Label
240 </Button>
<Button variant="outline" size="sm">
242 <Camera size={16} className="mr-2" />
243 Add Photo
244 </Button>
245 <Button variant="outline" size="sm">
246 <MessageSquare size={16} className="mr-2" />
247 Add Note
248 </Button>
249 </CardContent>
250 </Card>
251 </div>
253 {/* Productivity Metrics */}
254 <div className="grid grid-cols-4 gap-4 p-6 bg-white border-t lg:grid-cols-4 md:grid-
cols-2">
255 <Card>
```

</details>

## 4.4 Shipping (Carrier Management)
### Purpose
The Shipping module manages carrier integrations, rate comparisons, and outbound manifest
preparation.
4.4.1 Carrier Dashboard
Grid layout displaying carrier status cards (4 across on desktop, 2 on tablet, 1 on mobile). Each
carrier card shows:
Field specifications:
256 <CardContent className="text-center py-4">
257 <div className="text-2xl font-bold font-roboto">47</div>
258 <div className="text-xs text-gray-600">Orders Packed Today</div>
259 <div className="text-xs text-gray-500">Target: 50</div>
260 </CardContent>
261 </Card>
262 <Card>
263 <CardContent className="text-center py-4">
264 <div className="text-2xl font-bold font-roboto">8.3 min</div>
265 <div className="text-xs text-gray-600">Average Pack Time</div>
266 <div className="text-xs text-gray-500">Per order</div>
267 </CardContent>
268 </Card>
269 <Card>
270 <CardContent className="text-center py-4">
271 <div className="text-2xl font-bold font-roboto text-green-600">99.2%</div>
272 <div className="text-xs text-gray-600">Accuracy Rate</div>
273 <div className="text-xs text-gray-500">↑ vs 97.1% yesterday</div>
274 </CardContent>
275 </Card>
276 <Card>
277 <CardContent className="text-center py-4">
278 <div className="text-2xl font-bold font-roboto">7.2</div>
279 <div className="text-xs text-gray-600">Packages/Hour</div>
280 <div className="text-xs text-gray-500">Capacity: 8.0</div>
281 </CardContent>
282 </Card>
283 </div>
284 </div>
285 );
286 };
1 ┌─────────────────────────────────┐
2 │ [Carrier Logo] │
3 │ Australia Post │
4 │ ● Status: Active │
5 │ Today: 127 shipments │
6 │ On-Time Rate: 97.2% │
7 │ ████████░░ 97% [Score Bar] │
8 │ [Configure] [Rates] │
9 └─────────────────────────────────┘
Carrier Logo 64×64px, centred, crisp SVG or PNG
Element Specification

Card background: #F5F5F5, padding 16px, border-radius 8px. Hover: subtle shadow lift.
Australian Carriers:
Australia Post
T oll/IPEC
StarTrack
TNT
DHL Express
Aramex
Sendle
Allied Express
4.4.2 Rate Comparison
Modal interface with input fields and results list. Layout:
Input Section (top):
Field specifications:
Carrier Name 16px Roboto bold, centred
Status Dot 12px circle: green (#4CAF50) = active, amber
(#FFC107) = delayed, red (#FF6B6B) = offline
Shipment Count "T oday: 127 shipments" in 13px Roboto
On-Time Rate Bold 14px percentage, secondary text "On-
Time Rate"
Performance Score Horizontal progress bar, 100px wide, colour:
green if ≥95%, amber 85–94%, red <85%
Configure Button ShadCN Button outline, 48px height minimum,
navigates …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Shipping module manages carrier integrations, rate comparisons, and outbound manifest
preparation.
4.4.1 Carrier Dashboard
Grid layout displaying carrier status cards (4 across on desktop, 2 on tablet, 1 on mobile). Each
carrier card shows:
Field specifications:
256 <CardContent className="text-center py-4">
257 <div className="text-2xl font-bold font-roboto">47</div>
258 <div className="text-xs text-gray-600">Orders Packed Today</div>
259 <div className="text-xs text-gray-500">Target: 50</div>
260 </CardContent>
261 </Card>
262 <Card>
263 <CardContent className="text-center py-4">
264 <div className="text-2xl font-bold font-roboto">8.3 min</div>
265 <div className="text-xs text-gray-600">Average Pack Time</div>
266 <div className="text-xs text-gray-500">Per order</div>
267 </CardContent>
268 </Card>
269 <Card>
270 <CardContent className="text-center py-4">
271 <div className="text-2xl font-bold font-roboto text-green-600">99.2%</div>
272 <div className="text-xs text-gray-600">Accuracy Rate</div>
273 <div className="text-xs text-gray-500">↑ vs 97.1% yesterday</div>
274 </CardContent>
275 </Card>
276 <Card>
277 <CardContent className="text-center py-4">
278 <div className="text-2xl font-bold font-roboto">7.2</div>
279 <div className="text-xs text-gray-600">Packages/Hour</div>
280 <div className="text-xs text-gray-500">Capacity: 8.0</div>
281 </CardContent>
282 </Card>
283 </div>
284 </div>
285 );
286 };
1 ┌─────────────────────────────────┐
2 │ [Carrier Logo] │
3 │ Australia Post │
4 │ ● Status: Active │
5 │ Today: 127 shipments │
6 │ On-Time Rate: 97.2% │
7 │ ████████░░ 97% [Score Bar] │
8 │ [Configure] [Rates] │
9 └─────────────────────────────────┘
Carrier Logo 64×64px, centred, crisp SVG or PNG
Element Specification

Card background: #F5F5F5, padding 16px, border-radius 8px. Hover: subtle shadow lift.
Australian Carriers:
Australia Post
T oll/IPEC
StarTrack
TNT
DHL Express
Aramex
Sendle
Allied Express
4.4.2 Rate Comparison
Modal interface with input fields and results list. Layout:
Input Section (top):
Field specifications:
Carrier Name 16px Roboto bold, centred
Status Dot 12px circle: green (#4CAF50) = active, amber
(#FFC107) = delayed, red (#FF6B6B) = offline
Shipment Count "T oday: 127 shipments" in 13px Roboto
On-Time Rate Bold 14px percentage, secondary text "On-
Time Rate"
Performance Score Horizontal progress bar, 100px wide, colour:
green if ≥95%, amber 85–94%, red <85%
Configure Button ShadCN Button outline, 48px height minimum,
navigates to Settings > Carriers
Rates Button ShadCN Button outline, 48px height minimum,
opens Rate Comparison modal
1 Origin Postcode: [2000 v] Destination: [2050 v]
2 Weight (kg): [5.0 ] Service Level: [Standard v]
3 [Get Rates]

Origin Postcode: T ext input, Australian postcode format (4 digits), required, default:
warehouse postcode
Destination Postcode: T ext input, 4 digits, required
Weight (kg): Number input with spinners, min 0.2, max 25, step 0.1
Service Level: Dropdown with options: Standard, Express, Overnight, Weekend (if available)
Get Rates Button: Primary CTA, 56px height, triggers API call to carrier rate endpoints
Results Section (scrollable list below):
Results list specifications:
Sorted by cost (lowest first)
Each row: rank number | carrier name | transit days | cost (AUD bold 14px) | savings badge (if
applicable)
Click row to select carrier, closes modal
Savings badge shows if rate is <10% above cheapest option
"You save $X.XX" text in green (#4CAF50)
Modal width: 600px on desktop, full-width on mobile. Close button (X) top-right.
4.4.3 Pickup Schedule
Display of today's scheduled carrier pickups:
Specifications:
1 1. Australia Post Standard | 2–5 business days | $8.50 | [You save $1.20]
2 2. Toll/IPEC Express | Next business day | $14.20 |
3 3. StarTrack Premier | 1 business day | $18.60 |
4 4. DHL Express | Next business day | $22.10 |
5 5. Aramex Standard | 2–3 business days | $12.30 |
1 ┌─────────────────────────────────────────────┐
2 │ 09:00 AM | Australia Post | 45 packages | ✓ Ready │ [Manifest]
3 │ 11:30 AM | Toll/IPEC | 32 packages | ⏳ Prep │ [Manifest]
4 │ 02:00 PM | StarTrack | 28 packages | ✓ Ready │ [Manifest]
5 │ 04:30 PM | TNT | 18 packages | ✗ Pending│ [Manifest]
6 └─────────────────────────────────────────────┘
Time Window Left-aligned, 13px Roboto Mono bold
Carrier Logo + Name 24×24px logo + 14px Roboto name
Package Count "XX packages", 12px secondary
Column Content

Card background: #F5F5F5, padding 12px. T ouch target: 56px height for entire row.
4.4.4 Shipping Manifests
Batch processing interface for end-of-day carrier manifests. Interface allows operators to:
1. Select pickups: Multi-select checkboxes for each carrier pickup
2. Review batch: Summary showing total packages, total weight, manifest status
3. Generate manifest: Button to generate PDF manifest file with package details
4. Print & seal: Manifest details print for carrier signature
Specifications:
Manifest generated as PDF with QR code containing manifest ID
Manifest PDF includes: manifest number, date/time, carrier, warehouse address, package list
(order number, weight, destination)
Operator name and signature field (can be printed and signed, or digital signature)
Status updates to "Manifested" once submitted
Carrier integration: API call to transmit manifest data to carrier (if available)
```

</details>

## 4.5 Tracking
### Purpose
The Tracking module provides shipment visibility for both internal operators and customer-
facing tracking.
4.5.1 Tracking Overview KPIs
Four stat cards at module top:
Status Badge ShadCN Badge: "Ready" (green), "Prep"
(amber), "Pending" (grey), "Collected" (blue)
Manifest Button ShadCN Button outline, navigates to Shipping
Manifests section
In Transit 247 Click filters list to "In Transit"
only
Out for Delivery83 Click filters to "Out for
Delivery"
KPI Display Interaction

Card styling: 28px Roboto bold metric, 12px label. Background #F5F5F5. Exceptions card
background red if count >0.
4.5.2 Tracking Search
Search bar with three search modes accessible via dropdown:
Dropdown options:
By Tracking Number (default): Exact match search
By Order Number (ORD-XXXX-XXXX): Exact match
By Customer Name: Substring search, shows results dropdown with matching customers
Search box specifications:
Placeholder: "Enter tracking number, order # or customer name"
Real-time suggestions dropdown appears after 2 characters
Search is case-insensitive, whitespace-trimmed
Returns maximum 10 results in dropdown
4.5.3 Active Shipments List
Grid/list display of tracked shipments with coloured left borders by status:
Specifications:
Delivered T oday392 Click filters to "Delivered" with
date = today
Exceptions 12 Click filters to exceptions only,
red background if >0
1 [🔍 By Tracking Number ▼] [Search box] [Search Button]
1 ┌──ORD-2026-0847─────────────────────┐
2 │▮ #TRK-2026-0847123 | ORD-2026-0847 │
3 │ John Smith | [Carrier Icon] │
4 │ [In Transit] ████░░░░░░ 60% │
5 │ ETA: 2026-03-05 | Melbourne, VIC │
6 │ Last: 2026-03-02 16:45 | Sydney │
7 │ [Track] [Contact] [Options ⋯] │
8 └─────────────────────────────────────┘
Left Border 4px, colour-coded: In Transit #4CAF50
(green), Out for Delivery #FF9800 (orange),
Field Detail

Card dimensions: 100% width on mobile, 280px on desktop. Hover: subtle shadow. T ouch
target: 56px row height.
4.5.4 Delivery Exceptions Panel
Alert cards with exception details and corrective actions:
Specifications:
Card variant: "destructive" (red background #FFF5F5, red border #FF6B6B)
Exception Icon: Alert triangle, 24px, red
Exception Type: Bold 14px, red text
Order/Tracking Details: 12px secondary
Delivered #4CAF50 (green), Exception
#FF6B6B (red)
Tracking Number 12px Roboto Mono, copiable with icon
Order Number 12px Roboto, greyed
Customer Name 13px Roboto bold
Carrier Logo 24×24px
Status Badge ShadCN Badge, variant by status
Delivery Progress Bar 100% …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Tracking module provides shipment visibility for both internal operators and customer-
facing tracking.
4.5.1 Tracking Overview KPIs
Four stat cards at module top:
Status Badge ShadCN Badge: "Ready" (green), "Prep"
(amber), "Pending" (grey), "Collected" (blue)
Manifest Button ShadCN Button outline, navigates to Shipping
Manifests section
In Transit 247 Click filters list to "In Transit"
only
Out for Delivery83 Click filters to "Out for
Delivery"
KPI Display Interaction

Card styling: 28px Roboto bold metric, 12px label. Background #F5F5F5. Exceptions card
background red if count >0.
4.5.2 Tracking Search
Search bar with three search modes accessible via dropdown:
Dropdown options:
By Tracking Number (default): Exact match search
By Order Number (ORD-XXXX-XXXX): Exact match
By Customer Name: Substring search, shows results dropdown with matching customers
Search box specifications:
Placeholder: "Enter tracking number, order # or customer name"
Real-time suggestions dropdown appears after 2 characters
Search is case-insensitive, whitespace-trimmed
Returns maximum 10 results in dropdown
4.5.3 Active Shipments List
Grid/list display of tracked shipments with coloured left borders by status:
Specifications:
Delivered T oday392 Click filters to "Delivered" with
date = today
Exceptions 12 Click filters to exceptions only,
red background if >0
1 [🔍 By Tracking Number ▼] [Search box] [Search Button]
1 ┌──ORD-2026-0847─────────────────────┐
2 │▮ #TRK-2026-0847123 | ORD-2026-0847 │
3 │ John Smith | [Carrier Icon] │
4 │ [In Transit] ████░░░░░░ 60% │
5 │ ETA: 2026-03-05 | Melbourne, VIC │
6 │ Last: 2026-03-02 16:45 | Sydney │
7 │ [Track] [Contact] [Options ⋯] │
8 └─────────────────────────────────────┘
Left Border 4px, colour-coded: In Transit #4CAF50
(green), Out for Delivery #FF9800 (orange),
Field Detail

Card dimensions: 100% width on mobile, 280px on desktop. Hover: subtle shadow. T ouch
target: 56px row height.
4.5.4 Delivery Exceptions Panel
Alert cards with exception details and corrective actions:
Specifications:
Card variant: "destructive" (red background #FFF5F5, red border #FF6B6B)
Exception Icon: Alert triangle, 24px, red
Exception Type: Bold 14px, red text
Order/Tracking Details: 12px secondary
Delivered #4CAF50 (green), Exception
#FF6B6B (red)
Tracking Number 12px Roboto Mono, copiable with icon
Order Number 12px Roboto, greyed
Customer Name 13px Roboto bold
Carrier Logo 24×24px
Status Badge ShadCN Badge, variant by status
Delivery Progress Bar 100% full = delivered
ETA Bold 12px, red if overdue
Last Scan Location & Time11px Roboto, secondary text
Delivery City 12px Roboto
Action Buttons Track (navigates to detailed tracking), Contact
(opens message), Options (kebab menu: share
link, view proof of delivery, print label)
1 ┌─ Delivery Exception ─────────────────────┐
2 │ [!] Address Issue │
3 │ Order: ORD-2026-0847 │
4 │ Tracking: #TRK-2026-0847123 │
5 │ Customer: John Smith │
6 │ Issue: Invalid house number in address │
7 │ Suggested Action: Contact customer │
8 │ [Contact Customer] [Reroute] [Resolve] │
9 └──────────────────────────────────────────┘

Issue Description: 13px Roboto, up to 2 lines
Suggested Action: 11px Roboto italic
Action Buttons: three contextual buttons at bottom
Exception types and actions:
Delayed: Reroute, Request Expedited Delivery, Contact Carrier
Address Issue: Correct Address, Contact Customer, Return to Sender
Damage Claim: View Photos, Generate Claim Form, Contact Carrier
Refused Delivery: Reroute, Return to Warehouse, Contact Customer
4.5.5 Customer Notification System
Automated notification system with configurable triggers and channels.
Notification Triggers:
Channel specifications:
Email templates:
From: or configurable sender name
Subject line: Personalised with order/tracking info
Body: HTML email with customer's company branding (if white-label)
Order Shipped Email "Your order #ORD-XXXX-
XXXX has shipped. Track:
[link]"
Out for DeliveryEmail, SMS (future)"Your delivery is on the way!
Expected today [time
window]"
Delivered Email "Your order #ORD-XXXX-
XXXX was delivered. Photos
attached."
Exception Email, SMS (future)"Issue with your delivery:
[details]. Please contact us:
[link]"
Trigger Default ChannelMessage
noreply@mirrorworks.com

Footer: Company name, contact info, unsubscribe link
Tracking link format: https://track.mirrorworks.com/?tracking=
[trackingNumber]
SMS (future):
Character limit: 160 chars or 306 multi-part
Carrier: Twilio or similar service integration
Opt-in required per customer
Notification history per shipment:
Table showing: trigger, channel, sent datetime, recipient email/phone, status (sent/failed),
bounce reason (if failed)
TSX Pseudocode for Tracking Card:
1 import React from 'react';
2 import { Card, CardContent } from '@/components/ui/card';
3 import { Badge } from '@/components/ui/badge';
4 import { Button } from '@/components/ui/button';
5 import { Progress } from '@/components/ui/progress';
6 import { Copy, MessageCircle, MoreVertical } from 'lucide-react';
8 interface TrackingCardProps {
9 tracking: {
10 trackingNumber: string;
11 orderNumber: string;
12 customerName: string;
13 carrierLogo: string;
14 status: 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
15 progressPercent: number;
16 eta: Date;
17 lastScanLocation: string;
18 lastScanTime: Date;
19 deliveryCity: string;
20 };
21 onTrack: () => void;
22 onContact: () => void;
23 }
25 const statusColours = {
26 in_transit: 'border-l-green-500',
27 out_for_delivery:
'border-l-orange-500',
28 delivered: 'border-l-green-500',
29 exception: 'border-l-red-500',
30 };
32 const statusVariants = {
33 in_transit: 'secondary',
34 out_for_delivery: 'outline',
35 delivered: 'default',
36 exception: 'destructive',
37 };
39 export const TrackingCard: React.FC<TrackingCardProps> = ({
40 tracking,
41 onTrack,
42 onContact,

43 }) => {
44 const borderClass = statusColours[tracking.status];
45 const badgeVariant = statusVariants[tracking.status];
47 return (
48 <Card className={`border-l-4 ${borderClass} w-full min-h-[220px] hover:shadow-md
transition-shadow`}>
49 <CardContent className="pt-4 space-y-3">
50 {/* Header Row */}
51 <div className="flex items-start justify-between">
52 <div className="flex-1">
53 <div className="flex items-center gap-2">
54 <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
55 {tracking.trackingNumber}
56 </code>
57 <button className="text-gray-400 hover:text-gray-600">
58 <Copy size={14} />
59 </button>
60 </div>
61 <div className="text-xs text-gray-600 mt-1">
62 {tracking.orderNumber}
63 </div>
64 </div>
65 <Button variant="ghost" size="sm">
66 <MoreVertical size={16} />
67 </Button>
68 </div>
70 {/* Customer & Carrier */}
71 <div className="flex items-center justify-between">
72 <div className="text-sm font-medium">{tracking.customerName}</div>
73 <img
74 src={tracking.carrierLogo}
75 alt="Carrier"
76 className="w-6 h-6 object-contain"
77 />
78 </div>
80 {/* Status Badge */}
81 <Badge variant={badgeVariant as any}>
82 {tracking.status.replace('_', ' ').toUpperCase()}
83 </Badge>
85 {/* Progress Bar */}
86 <div className="space-y-1">
87 <Progress
value={tracking.progressPercent} className="h-2" />
88 <div className="text-xs text-gray-600">
89 {tracking.progressPercent}% delivered
90 </div>
91 </div>
93 {/* ETA & Location */}
94 <div className="grid grid-cols-2 gap-4 text-xs">
95 <div>
96 <div className="text-gray-600">ETA</div>
97 <div className="font-medium">
98 {tracking.eta.toLocaleDateString('en-AU')}
99 </div>
100 </div>
101 <div>
102 <div className="text-gray-600">Delivery City</div>
103 <div className="font-medium">{tracking.deliveryCity}</div>
104 </div>
105 </div>
107 {/* Last Scan */}
108 <div className=
"bg-gray-50 p-2 rounded text-xs">
```

</details>

## 4.6 Returns
### Purpose
The Returns module manages return merchandise authorisations (RMAs) and return processing
workflows.
4.6.1 Returns Overview KPIs
Four stat cards:
109 <div className="text-gray-600">
110 Last scan:{' '}
111 {tracking.lastScanTime.toLocaleTimeString('en-AU', {
112 hour: '2-digit',
113 minute: '2-digit',
114 })}
115 </div>
116 <div className="font-medium">{tracking.lastScanLocation}</div>
117 </div>
119 {/* Actions */}
120 <div className="flex gap-2 pt-2">
121 <Button
122 size="sm"
123 variant="outline"
124 onClick={onTrack}
125 className="flex-1"
126 >
127 Track
128 </Button>
129 <Button
130 size="sm"
131 variant="outline"
132 onClick={onContact}
133 className="flex-1 h-[44px]"
134 >
135 <MessageCircle size={16} className="mr-1" />
136 Contact
137 </Button>
138 </div>
139 </CardContent>
140 </Card>
141 );
142 };
Pending RMAs 34 Click filters RMA queue to
"Pending"
In Transit Returns 18 Click filters to "In Transit"
Processing Queue 12 Click filters to "Processing"
Return Rate 2.3% Shows percentage of total
orders, links to analytics
KPI Display Interaction

Card styling: Consistent with Tracking KPIs. Return Rate secondary text shows "↓ vs 2.8% last
month" with trend arrow.
4.6.2 RMA Queue
Cards with orange left border (4px, #FF9800). Each card displays:
Specifications:
Card hover: subtle shadow. T ouch target: 56px minimum button height.
4.6.3 Return Analytics
Two charts displayed side-by-side (stacked on mobile):
1 ┌─ RMA-2026-0034 ────────────────────┐
2 │▮ Original Order: ORD-2026-0847 │
3 │ Customer: John Smith │
4 │ [Pending] [Damaged Item] [Refund] │
5 │ Items to Return: Blue Widget × 2 │
6 │ Refund Amount: $47.50 │
7 │ [Process Return] [Contact] [Deny] │
8 └─────────────────────────────────────┘
Left Border 4px solid #FF9800 (orange)
RMA Number 12px Roboto Mono bold, copiable
Original Order 12px Roboto, clickable → Order Detail
Customer Name 13px Roboto bold
Status Badge ShadCN Badge: Pending, Approved, In Transit,
Processed
Reason Badge ShadCN Badge variant: Damaged, Wrong Item,
Not as Described, Defective, Changed Mind,
Other
Items List "Product name × qty [SKU]", 11px Roboto, max
3 items shown + "X more" link
Refund Amount Bold 14px, AUD currency
Action Buttons Process Return (primary, yellow), Contact
(secondary), Deny (destructive)
Field Detail

Return Reasons Pie Chart:
Segment colours: Damaged #FF6B6B, Wrong Item #FF9800, Not as Described #FFC107,
Defective #4CAF50, Changed M ind #2196F3, Other #9C27B0
Labels show: Reason name | count | …

### Data
- Entities, fields, and widgets per specification body below.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Returns module manages return merchandise authorisations (RMAs) and return processing
workflows.
4.6.1 Returns Overview KPIs
Four stat cards:
109 <div className="text-gray-600">
110 Last scan:{' '}
111 {tracking.lastScanTime.toLocaleTimeString('en-AU', {
112 hour: '2-digit',
113 minute: '2-digit',
114 })}
115 </div>
116 <div className="font-medium">{tracking.lastScanLocation}</div>
117 </div>
119 {/* Actions */}
120 <div className="flex gap-2 pt-2">
121 <Button
122 size="sm"
123 variant="outline"
124 onClick={onTrack}
125 className="flex-1"
126 >
127 Track
128 </Button>
129 <Button
130 size="sm"
131 variant="outline"
132 onClick={onContact}
133 className="flex-1 h-[44px]"
134 >
135 <MessageCircle size={16} className="mr-1" />
136 Contact
137 </Button>
138 </div>
139 </CardContent>
140 </Card>
141 );
142 };
Pending RMAs 34 Click filters RMA queue to
"Pending"
In Transit Returns 18 Click filters to "In Transit"
Processing Queue 12 Click filters to "Processing"
Return Rate 2.3% Shows percentage of total
orders, links to analytics
KPI Display Interaction

Card styling: Consistent with Tracking KPIs. Return Rate secondary text shows "↓ vs 2.8% last
month" with trend arrow.
4.6.2 RMA Queue
Cards with orange left border (4px, #FF9800). Each card displays:
Specifications:
Card hover: subtle shadow. T ouch target: 56px minimum button height.
4.6.3 Return Analytics
Two charts displayed side-by-side (stacked on mobile):
1 ┌─ RMA-2026-0034 ────────────────────┐
2 │▮ Original Order: ORD-2026-0847 │
3 │ Customer: John Smith │
4 │ [Pending] [Damaged Item] [Refund] │
5 │ Items to Return: Blue Widget × 2 │
6 │ Refund Amount: $47.50 │
7 │ [Process Return] [Contact] [Deny] │
8 └─────────────────────────────────────┘
Left Border 4px solid #FF9800 (orange)
RMA Number 12px Roboto Mono bold, copiable
Original Order 12px Roboto, clickable → Order Detail
Customer Name 13px Roboto bold
Status Badge ShadCN Badge: Pending, Approved, In Transit,
Processed
Reason Badge ShadCN Badge variant: Damaged, Wrong Item,
Not as Described, Defective, Changed Mind,
Other
Items List "Product name × qty [SKU]", 11px Roboto, max
3 items shown + "X more" link
Refund Amount Bold 14px, AUD currency
Action Buttons Process Return (primary, yellow), Contact
(secondary), Deny (destructive)
Field Detail

Return Reasons Pie Chart:
Segment colours: Damaged #FF6B6B, Wrong Item #FF9800, Not as Described #FFC107,
Defective #4CAF50, Changed M ind #2196F3, Other #9C27B0
Labels show: Reason name | count | percentage
Interactive: click segment to filter RMA queue to that reason
Return Trends Line Chart:
X-axis: Last 12 months (date range format: "Mar 2025 – Mar 2026")
Y-axis: Number of returns (0–100 scale, auto-scale)
Line colour: #2196F3
Data points: circles, clickable to show exact count
Trend indicator: "↑ 12% vs previous period" shown near top
Both charts use ShadCN Chart or Recharts library. Export buttons (PDF/PNG) in chart headers.
TSX Pseudocode for Return Card:
1 import React from 'react';
2 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
3 import { Badge } from '@/components/ui/badge';
4 import { Button } from '@/components/ui/button';
6 interface ReturnCardProps {
7 rma: {
8 rmaNumber: string;
9 originalOrder: string;
10 customerName: string;
11 status: 'pending' | 'approved' | 'in_transit' | 'processed';
12 reason: string;
13 items: Array<{ name: string; sku: string; quantity: number }>;
14 refundAmount: number;
15 };
16 onProcess: () => void;
17 onContact: () => void;
18 onDeny: () => void;
19 }
21 const reasonBadgeVariant = {
22 damaged: 'destructive',
23 wrong_item: 'outline',
24 not_as_described: 'secondary'
,
25 defective: 'outline',
26 changed_mind: 'secondary',
27 other: 'outline',
28 };
30 export const ReturnCard: React.FC<ReturnCardProps> = ({
31 rma,
32 onProcess,
33 onContact,
34 onDeny,
35 }) => {
36 return (
37 <Card className="border-l-4 border-l-orange-500 w-full">
38 <CardHeader className="pb-3">

39 <div className="flex items-start justify-between">
40 <div>
41 <CardTitle className="text-sm font-mono">
42 {rma.rmaNumber}
43 </CardTitle>
44 <div className="text-xs text-gray-600 mt-1">
45 Order: {rma.originalOrder}
46 </div>
47 </div>
48 </div>
49 </CardHeader>
51 <CardContent className="space-y-3">
52 <div className="text-sm font-medium">{rma.customerName}</div>
54 <div className="flex gap-2">
55 <Badge variant={rma.status === 'pending' ? 'secondary' : 'default'}>
56 {rma.status}
57 </Badge>
58 <Badge
59 variant={
60 reasonBadgeVariant[rma.reason as keyof typeof reasonBadgeVariant] ||
61 'outline'
}
63 >
64 {rma.reason}
65 </Badge>
66 </div>
68 <div className="text-xs space-y-1">
69 <div className="font-medium">Items to Return</div>
70 {rma.items.slice(0, 3).map((item, idx) => (
71 <div key={idx} className="text-gray-700">
72 {item.name} × {item.quantity} [{item.sku}]
73 </div>
74 ))}
75 {rma.items.length > 3 && (
76 <div className="text-blue-600">+ {rma.items.length - 3} more</div>
77 )}
78 </div>
<div className="bg-orange-50 p-2 rounded">
81 <div className="text-xs text-gray-600">Refund Amount</div>
82 <div className="text-lg font-bold">${rma.refundAmount.toFixed(2)}</div>
83 </div>
85 <div className="flex gap-2 pt-2">
86 <Button
87 size="sm"
88 className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
89 onClick={onProcess}
90 >
91 Process Return
92 </Button>
93 <Button
94 size="sm"
95 variant="outline"
96 onClick={onContact}
97 className="flex-1"
98 >
99 Contact
100 </Button>
101 <Button
102 size="sm"
103 variant="destructive"
104 onClick={onDeny}
105 className="flex-1"
```

</details>

## 4.7 Warehouse
### Purpose
The Warehouse module provides inventory visibility and warehouse operations management.
4.7.1 Warehouse Overview KPIs
Four stat cards:
Card styling: 24px Roboto bold metric, 12px label. Secondary text shows comparison to previous
period. Icon-based (inventory, location, accuracy check, speed indicator).
4.7.2 Warehouse Layout (SVG Map)
SVG-based interactive warehouse map showing:
Warehouse zones: Receiving (REC), Pick Zone A (PKA), Pick Zone B (PKB), Pack Station
(PKS), Shipping (SHP)
Heatmap overlay: Colour-coded activity levels per zone (green = low, yellow = medium, red =
high activity in last hour)
Picker location dots: Animated pulse (1.5s cycle) showing current picker positions in zones
Clickable zones: Click zone to drill down into zone detail (SKU list, picker assignments,
activity log)
SVG specifications:
Canvas size: 800×600px responsive
Zone rectangles: thin border #CCCCCC, filled with heatmap colour at 0.6 opacity
106 >
107 Deny
108 </Button>
109 </div>
110 </CardContent>
111 </Card>
112 );
113 };
T otal SKUs 1,247 Items in inventory
Available Locations856 Warehouse bin locations
Inventory Accuracy99.4% Physical vs system count
Pick Efficiency 187 picks/hourCurrent shift average
KPI Display Unit

Picker dots: 8px circle, animated pulse scale 1→1.2, colour #4CAF50 (active) or #FFC107 (idle
>2 mins)
Zone labels: 14px Roboto, centred, black text
Scale indicator: Grid overlay with 5m markings (visible on zoom)
Zoom/pan capability: mouse wheel to zoom, click-drag to pan. Double-click to reset view.
4.7.3 Inventory Management Table
DataTable with sortable, filterable columns:
Table specifications:
Sortable: click column header to sort A→Z or numeric asc/desc
Filterable: filter bar above table with SKU, Description, Location search fields
Pagination: 25 rows per page, "Load More" button at bottom
Row actions: Click row to open inventory detail drawer (cost, supplier, reorder level, images)
Bulk actions: Checkbox in header to select all visible rows; bulk actions dropdown: Cycle
Count, Adjust Quantity, Assign Bin
4.7.4 Cycle Counting
Schedule cards with purple left border (4px, #9C27B0). Each card shows:
SKU 100px Product code, copiable,
monospace font
Description Flexible Product name, searchable
Primary Location80px Bin code (e.g., "A-12-3"),
clickable → zone detail
On Hand 70px Current physical quantity,
numeric
Allocated 70px Quantity assigned to pending
orders
Available 70px (On Hand – Allocated), bold if
<5 items
Last Count 100px Date of last …

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
The Warehouse module provides inventory visibility and warehouse operations management.
4.7.1 Warehouse Overview KPIs
Four stat cards:
Card styling: 24px Roboto bold metric, 12px label. Secondary text shows comparison to previous
period. Icon-based (inventory, location, accuracy check, speed indicator).
4.7.2 Warehouse Layout (SVG Map)
SVG-based interactive warehouse map showing:
Warehouse zones: Receiving (REC), Pick Zone A (PKA), Pick Zone B (PKB), Pack Station
(PKS), Shipping (SHP)
Heatmap overlay: Colour-coded activity levels per zone (green = low, yellow = medium, red =
high activity in last hour)
Picker location dots: Animated pulse (1.5s cycle) showing current picker positions in zones
Clickable zones: Click zone to drill down into zone detail (SKU list, picker assignments,
activity log)
SVG specifications:
Canvas size: 800×600px responsive
Zone rectangles: thin border #CCCCCC, filled with heatmap colour at 0.6 opacity
106 >
107 Deny
108 </Button>
109 </div>
110 </CardContent>
111 </Card>
112 );
113 };
T otal SKUs 1,247 Items in inventory
Available Locations856 Warehouse bin locations
Inventory Accuracy99.4% Physical vs system count
Pick Efficiency 187 picks/hourCurrent shift average
KPI Display Unit

Picker dots: 8px circle, animated pulse scale 1→1.2, colour #4CAF50 (active) or #FFC107 (idle
>2 mins)
Zone labels: 14px Roboto, centred, black text
Scale indicator: Grid overlay with 5m markings (visible on zoom)
Zoom/pan capability: mouse wheel to zoom, click-drag to pan. Double-click to reset view.
4.7.3 Inventory Management Table
DataTable with sortable, filterable columns:
Table specifications:
Sortable: click column header to sort A→Z or numeric asc/desc
Filterable: filter bar above table with SKU, Description, Location search fields
Pagination: 25 rows per page, "Load More" button at bottom
Row actions: Click row to open inventory detail drawer (cost, supplier, reorder level, images)
Bulk actions: Checkbox in header to select all visible rows; bulk actions dropdown: Cycle
Count, Adjust Quantity, Assign Bin
4.7.4 Cycle Counting
Schedule cards with purple left border (4px, #9C27B0). Each card shows:
SKU 100px Product code, copiable,
monospace font
Description Flexible Product name, searchable
Primary Location80px Bin code (e.g., "A-12-3"),
clickable → zone detail
On Hand 70px Current physical quantity,
numeric
Allocated 70px Quantity assigned to pending
orders
Available 70px (On Hand – Allocated), bold if
<5 items
Last Count 100px Date of last cycle count
Column Width Content

Card specifications:
Left Border: 4px solid #9C27B0 (purple)
Count Name & Zone: 13px Roboto bold
Schedule Details: "Scheduled: [date time]", 12px Roboto
Frequency: Recurring pattern (Weekly, Monthly, etc.)
Last Completed: Previous completion date, secondary text
Assigned T o: T eam/operator name, clickable
SKU Count: T otal items to count in this cycle, 12px
Estimated Time: Based on items × average pick rate, 11px
Start Count Button: Primary CTA, opens cycle count interface (list of SKUs, barcode scanner
input, variance tracking)
```

</details>

## 4.8 Reports
### Purpose
Analytics and insights module for performance monitoring.
4.8.1 Report Controls
Header controls for filtering report data:
Field specifications:
Date Range Picker: ShadCN Popover with calendar. Default: current month. Preset buttons:
"T oday", "This Week", "This Month", "Last 3 Months", "Custom"
Report Type Dropdown: "Shipping Performance", "Carrier Performance", "Delivery Zones",
"Return Analysis", "Warehouse KPIs"
Export Button: Downloads report data as PDF or CSV. PDF includes charts rendered as
images, CSV is raw data table
1 ┌─ Cycle Count: Zone A ──────────────┐
2 │▮ Schedule: 2026-03-15 09:00 AM │
3 │ Frequency: Weekly │
4 │ Last Completed: 2026-03-08 │
5 │ Assigned To: Warehouse Team 1 │
6 │ SKU Count: 287 items │
7 │ Estimated Time: 3.5 hours │
8 │ [Start Count] [View Schedule] │
9 └─────────────────────────────────────┘
1 [Date Range: 01 Mar 2026 - 31 Mar 2026 ▼] [Report Type: Shipping Performance ▼] [Export to
PDF]

### Data
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including click (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Analytics and insights module for performance monitoring.
4.8.1 Report Controls
Header controls for filtering report data:
Field specifications:
Date Range Picker: ShadCN Popover with calendar. Default: current month. Preset buttons:
"T oday", "This Week", "This Month", "Last 3 Months", "Custom"
Report Type Dropdown: "Shipping Performance", "Carrier Performance", "Delivery Zones",
"Return Analysis", "Warehouse KPIs"
Export Button: Downloads report data as PDF or CSV. PDF includes charts rendered as
images, CSV is raw data table
1 ┌─ Cycle Count: Zone A ──────────────┐
2 │▮ Schedule: 2026-03-15 09:00 AM │
3 │ Frequency: Weekly │
4 │ Last Completed: 2026-03-08 │
5 │ Assigned To: Warehouse Team 1 │
6 │ SKU Count: 287 items │
7 │ Estimated Time: 3.5 hours │
8 │ [Start Count] [View Schedule] │
9 └─────────────────────────────────────┘
1 [Date Range: 01 Mar 2026 - 31 Mar 2026 ▼] [Report Type: Shipping Performance ▼] [Export to
PDF]

4.8.2 Key Shipping Metrics
Five stat cards displayed horizontally (stacked on mobile):
Card styling: 20px Roboto bold metric, green/red trend arrows, secondary text in 11px.
Background #F5F5F5.
4.8.3 Shipping Performance Trends
Composed chart showing trends over selected date range (dual-axis chart):
Left Y-axis: On-Time Delivery Rate (%), scale 0–100%
Right Y-axis: Shipment Count, scale auto
X-axis: Date (daily buckets, formatted "Mar 01", "Mar 02", etc.)
Line 1: On-Time Rate (blue line, #2196F3)
Line 2: Shipment Count (bar chart, #FFCF4B, MW Yellow)
Interactive: hover data point to show exact values in tooltip. Click legend to toggle line visibility.
4.8.4 Carrier Performance Comparison
Table comparing carriers across KPIs:
T otal Shipments12,487 Count, secondary: "↑ 8% vs
previous period"
On-Time Delivery Rate96.2% Percentage, secondary:
"Target: 95%"
Avg Transit Time 3.2 days Days, secondary: "↓ 0.3 days
improvement"
Cost per Shipment$4.87 AUD Currency, secondary: "↑ $0.12
vs last month"
Customer Satisfaction4.7/5.0 Stars, secondary: based on
feedback surveys
Metric Format Detail
Australia Post97.2% 3.1d 4,237 $4.50 4.6/5
Carrier On-Time RateAvg Transit ShipmentsCost/Unit Customer
Rating

Sortable columns: click header to sort by that metric. Colour-coded cells: green ≥95%, amber
85–94%, red <85% for on-time rate.
4.8.5 Shipping Zones Analysis
Bar chart grouped by delivery zone/region (geographic areas served):
X-axis: Geographic zones (e.g., "Sydney Metro", "NSW Regional", "VIC", "QLD", "SA", "WA",
"TAS", "NT")
Y-axis: Number of shipments (0–2000 scale)
Bars: Colour-coded by status: Delivered (green), In Transit (blue), Exception (red)
Data labels: Count on top of bar
Interactive: click bar to drill down into that zone, showing suburb-level breakdown and carrier
mix. T ooltip shows: zone name, total shipments, on-time rate for zone.
```

</details>

## 4.9 Settings
### Purpose
Configuration module for administrators and logistics managers. Route: /ship/settings/* .
Access restricted to Logistics Manager and Admin roles.
General Settings
T oll/IPEC94.8% 2.9d 2,156 $5.20 4.4/5
StarTrack96.1% 3.0d 1,847 $4.80 4.7/5
TNT 93.5% 2.5d 1,234 $6.10 4.3/5
DHL Express95.9% 2.1d 987 $8.50 4.5/5
Default Carrier Dropdown Australia PostCarrier auto-selected
for new orders
Shipping Label PrefixT ext "SHP" Prefix for tracking
numbers (e.g., SHP-
2026-0847)
Weight Unit Radio Kilogram (kg)Display unit for all
weights in interface
Setting Type Default Description

Form layout: Label | Input, 2-column grid on desktop, 1-column on mobile. Save button at
bottom.
Warehouse Settings
Zones interface: Table with add/edit/delete rows. Each zone has name, code, capacity count.
Bin naming uses placeholder syntax for templating.
Carriers Settings
Dimension Unit Radio Centimetre (cm)Display unit for box
dimensions
Timezone Dropdown Australia/SydneyTimezone for all
timestamps and
schedules
Business Days Multi-checkboxMon–Fri Days considered
"business day" for
transit calculations
Warehouse NameT ext "Primary Warehouse"Display name for this
warehouse location
Warehouse AddressT extarea — Street, suburb, state,
postcode, country
Zones Multi-text inputsA, B, C, PKS, SHPZone codes used in
bin locations
Locations per ZoneNumber 50 T otal bin locations
available per zone
Bin Naming
Convention
T ext "{ZONE}-{ROW:2d}-
{POS:1d}"
Format for bin codes
(e.g., A-01-3)
Multi-Site EnabledT oggle Off Allow management of
multiple warehouse
locations
Setting Type Default Description

Carrier cards layout: One card per carrier (Australia Post, T oll/IPEC, StarTrack, TNT, DHL,
Aramex, Sendle, Allied Express). Each card contains toggles and input fields. API credentials
stored securely (masked on display, ● ● ● ●).
Packaging Settings
Box sizes table columns: Box Name | Length (cm) | Width (cm) | Height (cm) | Max Weight (kg) |
Cost (AUD) | Actions (edit/delete).
Fulfilment Settings
API CredentialsT ext inputs Per carrier: API key, Account
ID, T est/Live mode toggle
Account NumbersT ext Carrier account number for
each service provider
Service LevelsMulti-select Enable/disable per-carrier
service options (Standard,
Express, Overnight)
Margin % Number Add percentage markup to
carrier rates shown in Rate
Comparison
Enable/DisableT oggle T oggle carrier availability
on/off for new shipments
Setting Type Details
Box Sizes Table Predefined box dimensions
and weight limits
Default …

### Data
- UI components and widgets named in specification body.
- Tabular fields and columns as per specification tables in body.

### Actions
- Interactions including drag (see full extract).

### States
Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) and prototype; PDF may not enumerate all states per screen.

<details>
<summary>Full specification extract (verbatim from PDF text layer)</summary>

```text
Configuration module for administrators and logistics managers. Route: /ship/settings/* .
Access restricted to Logistics Manager and Admin roles.
General Settings
T oll/IPEC94.8% 2.9d 2,156 $5.20 4.4/5
StarTrack96.1% 3.0d 1,847 $4.80 4.7/5
TNT 93.5% 2.5d 1,234 $6.10 4.3/5
DHL Express95.9% 2.1d 987 $8.50 4.5/5
Default Carrier Dropdown Australia PostCarrier auto-selected
for new orders
Shipping Label PrefixT ext "SHP" Prefix for tracking
numbers (e.g., SHP-
2026-0847)
Weight Unit Radio Kilogram (kg)Display unit for all
weights in interface
Setting Type Default Description

Form layout: Label | Input, 2-column grid on desktop, 1-column on mobile. Save button at
bottom.
Warehouse Settings
Zones interface: Table with add/edit/delete rows. Each zone has name, code, capacity count.
Bin naming uses placeholder syntax for templating.
Carriers Settings
Dimension Unit Radio Centimetre (cm)Display unit for box
dimensions
Timezone Dropdown Australia/SydneyTimezone for all
timestamps and
schedules
Business Days Multi-checkboxMon–Fri Days considered
"business day" for
transit calculations
Warehouse NameT ext "Primary Warehouse"Display name for this
warehouse location
Warehouse AddressT extarea — Street, suburb, state,
postcode, country
Zones Multi-text inputsA, B, C, PKS, SHPZone codes used in
bin locations
Locations per ZoneNumber 50 T otal bin locations
available per zone
Bin Naming
Convention
T ext "{ZONE}-{ROW:2d}-
{POS:1d}"
Format for bin codes
(e.g., A-01-3)
Multi-Site EnabledT oggle Off Allow management of
multiple warehouse
locations
Setting Type Default Description

Carrier cards layout: One card per carrier (Australia Post, T oll/IPEC, StarTrack, TNT, DHL,
Aramex, Sendle, Allied Express). Each card contains toggles and input fields. API credentials
stored securely (masked on display, ● ● ● ●).
Packaging Settings
Box sizes table columns: Box Name | Length (cm) | Width (cm) | Height (cm) | Max Weight (kg) |
Cost (AUD) | Actions (edit/delete).
Fulfilment Settings
API CredentialsT ext inputs Per carrier: API key, Account
ID, T est/Live mode toggle
Account NumbersT ext Carrier account number for
each service provider
Service LevelsMulti-select Enable/disable per-carrier
service options (Standard,
Express, Overnight)
Margin % Number Add percentage markup to
carrier rates shown in Rate
Comparison
Enable/DisableT oggle T oggle carrier availability
on/off for new shipments
Setting Type Details
Box Sizes Table Predefined box dimensions
and weight limits
Default Packaging RulesDropdown Auto-select packaging based
on: Item Count, T otal Weight,
Dimensions
Custom Box Definitions File upload CSV upload for custom box
catalogue (dimensions, cost,
code)
Setting Type Details

Rules engine interface: Drag-and-drop rule builder with conditions (IF order value < $50 THEN
use Standard Shipping, ELSE use Express).
Notifications Settings
Pick Method Radio Single (one order at a time),
Batch (multiple orders per trip),
Wave (all orders in time
window)
Pack Verification Radio Optional, Recommended,
Required (barcode scan or
weight check)
Auto-Carrier SelectionT oggle + rules Enable auto-selection based
on: Order value, Destination
zone, Ship date urgency,
Carrier on-time rate
Setting Type Options
Email T emplatesDropdown + editor System templateCustomise email
templates for: Order
Shipped, Out for
Delivery, Delivered,
Exception
Sender NameT ext "MirrorWorks
Logistics"
Sender name in email
From header
Sender EmailEmail "
"
Sender email address
Tracking URL FormatT ext " URL template for
customer tracking
links
SMS Enable T oggle Off Enable SMS
notifications (future
Setting Type Default Description
noreply@mirrorworks
.com
https://track.mirrorwo
rks.com/?tracking=
{trackingNumber}"

T emplate editor: Rich text editor (WYSIWYG) with merge field buttons: {customerName},
{orderNumber}, {trackingNumber}, {deliveryDate}, {carrierName}.
Returns Settings
Auto-approve rules: Visual rule builder with AND/OR logic. Drag-and-drop conditions: return
reason, order age, item cost, customer account history.
Integrations Settings
feature, Twilio
integration)
Return Window Number 30 Days after delivery
customer can initiate
return
Auto-Approve RulesRule builder— Conditions for
automatic RMA
approval (e.g., under
$50, within 7 days,
defective only)
Restocking FeePercentage0% Percentage deducted
from refund for
restocked items
Return ReasonsMulti-text inputsDamaged, Wrong
Item, Not as
Described, Defective,
Changed Mind, Other
Dropdown options for
RMA reason selection
Refund MethodsMulti-checkboxOriginal Payment,
Store Credit,
Exchange
Allowed refund
methods
Setting Type Default Description
Carrier API ConnectionsStatus grid Connection status per carrier
(✓ Connected, ✗
Setting Type Details

Each integration section has: status indicator, configuration form, test/verify button, logging
toggle (for debugging API calls).
Design System Notes
Colour Palette:
Primary CTA: MW Yellow #FFCF4B
Dark backgrounds: MW M irage #1A2732
Success: #4CAF50 (green)
Warning: #FFC107 (amber)
Error: #FF6B6B (red)
Secondary: #2196F3 (blue)
Neutral backgrounds: #F5F5F5, #FAFAFA
Typography:
Font family: Roboto (regular, bold, italic variants)
Headings: 28px bold for section titles, 16px bold for card titles
Body text: 13–14px regular
Labels: 12px regular secondary colour
Monospace: Roboto Mono for codes (tracking, SKU, orders)
Disconnected, ⚠ Error). T est
button to verify connection.
WMS ConnectorsDropdown Select connected warehouse
management system (none,
NetSuite, Cin7, etc.)
Barcode Scanner Config Radio + inputs USB HID keyboard, Bluetooth,
Honeywell device, etc.
Prefix/suffix characters for
scan parsing
Label Printer SetupDropdown + IP Select printer type (Zebra,
Dymo, Brother, thermal
generic). Input IP address, test
print button

Components:
All buttons: ShadCN/UI Button component with 56px touch target height
Cards: ShadCN/UI Card with default shadow and rounded corners
Badges: ShadCN/UI Badge with semantic variants (default, secondary, outline, destructive)
Tables: ShadCN/UI DataTable with sorting, filtering
Date pickers: ShadCN/UI Calendar Popover
Dropdowns: ShadCN/UI Select
Progress bars: ShadCN/UI Progress component
Modals/Sheets: ShadCN/UI Dialog or Sheet components
Accessibility:
M inimum 56px touch targets for all interactive elements
Colour not sole indicator; use patterns, icons, text labels
All inputs have associated labels
ARIA landmarks and semantic HTML
Focus visible states (blue outline)
Screen reader tested
Responsive Design:
Desktop: 1920px reference width, full multi-column layouts
Tablet (768px–1024px): 2-column layouts, stacked cards
Mobile (<768px): Single-column, bottom sheets instead of side panels, simplified data tables
(horizontal scroll or card format)
```

</details>
