## Prompt

Design a complete shipping and logistics module ("Ship") for MirrorWorks Smart FactoryOS — an AI-native ERP for metal fabrication SMEs. The module manages warehouse operations, carrier logistics, and customer delivery for a manufacturing business. It sits between the "Make" (production) and "Book" (invoicing) modules in the pipeline: Sell → Plan → Make → Ship → Book.

The audience is warehouse staff, shipping coordinators, and logistics managers working in Australian sheet metal fabrication workshops. The UI must work on desktop (primary) and tablets used on the warehouse floor with gloved hands.

### Global Design System

**Brand colours:**
- Primary CTA / active states: MW Yellow #FFCF4B (hover: #E6BA3A)
- Primary text / dark backgrounds / sidebar: MW Mirage #1A2732
- High contrast text: MW Black Ash #191406
- Card backgrounds (anchor palette): MW Earth #8FA6A6, MW Saddle #A68060, MW Sea Foam #7B9386
- Semantic: Success #36B37E, Warning #FACC15, Error #DE350B, Info #0052CC
- Links / interactive: Azure #0176FF

**Shipment status colours (used for badges throughout):**
- draft: Slate #94A3B8
- picking: Blue #3B82F6
- packing: Violet #8B5CF6
- ready_to_ship: Amber #F59E0B
- shipped: Cyan #06B6D4
- in_transit: Blue #3B82F6
- out_for_delivery: Emerald #10B981
- delivered: Green #22C55E
- exception: Red #EF4444
- cancelled: Grey #6B7280

**Return status colours:**
- pending: Amber #F59E0B
- approved: Blue #3B82F6
- label_sent: Violet #8B5CF6
- in_transit: Cyan #06B6D4
- received: Emerald #10B981
- inspected: Indigo #6366F1
- refund_processed: Green #22C55E
- closed: Grey #6B7280
- rejected: Red #EF4444

**Typography:** Roboto for all UI. Roboto Mono for tracking numbers, shipment IDs, barcodes, and data table values.
- Display: Extrabold 60px, tight tracking
- Headline: Bold 36px, tight tracking
- Title: Semibold 24px
- Body: Regular 16px
- Label: Medium 14px
- Caption: Regular 12px, muted foreground

**Touch targets:** Minimum 44px for desktop, 56px preferred for warehouse/shop floor interfaces. Critical pack station actions (e.g. "Complete & Print Label") should be 120px wide, 56px tall.

**Component library:** ShadCN/UI primitives styled with Material Design 3 principles. Key components: Sidebar, DataTable, Card, Tabs, Badge, Progress, Select, Input, Checkbox, Button, Alert, Dialog, Sheet (slide-over panel), Tooltip, ScrollArea, Skeleton loaders.

**Layout:** 256px collapsible sidebar on the left with: MirrorWorks logo at top, organisation switcher, 9 navigation items (Dashboard, Orders, Packaging, Shipping, Tracking, Returns, Warehouse, Reports, Settings), user avatar at bottom. Content area fills remaining width. Breadcrumb bar at top of content area.

**Radius:** 8px for cards, 6px for buttons, 4px for badges and inputs.

**Shadows:** Cards use subtle shadow on rest, shadow-lg on hover with 200ms transition.

**Motion:** 150ms fast (icon changes, scan flash), 200ms base (transitions, hovers), 300ms medium (card reveals, sheet slide-in, tab switch), 500ms slow (page transitions). Easing: cubic-bezier(0.4, 0.0, 0.2, 1).

---

### Screen 1: Dashboard (/ship/dashboard)

The command centre for logistics operations. Bento grid layout.

**Top row — 6 KPI stat cards in a responsive grid (3 columns on desktop, 2 on tablet):**
1. Active Shipments — count with green/red trend arrow
2. Pending Orders — count with trend indicator
3. On-Time Delivery Rate — percentage with trend
4. Avg Transit Time — days with month comparison
5. Delivery Exceptions — count, red variant if > 0
6. Returns Pending — count with trend

Each stat card has: large number (Title weight), label below (Caption), trend indicator (small arrow icon + percentage), subtle left-border colour accent. MW Yellow left border on the primary KPI.

**Middle section — Fulfilment Pipeline Summary:**
A horizontal pipeline visualisation showing counts at each stage: Ready to Pick → Picking → Packing → Ready to Ship → Shipped → In Transit → Delivered. Each stage is a rounded pill with the stage's status colour and a count inside. Connecting arrows between pills. Clicking a stage filters the Orders view.

**Bottom left — Carrier Performance (card, ~60% width):**
Horizontal bar chart showing on-time delivery percentage per carrier. Carriers listed: Australia Post, StarTrack, Toll/IPEC, TNT, DHL, Aramex, Sendle. Each bar uses the carrier's brand colour or MW palette. A target line at 95%.

**Bottom right — Recent Exceptions (card, ~40% width):**
A scrollable list of 5-8 delivery exception cards. Each shows: exception type badge (delay/damage/refused/lost), tracking number in monospace, customer name, carrier name, time since reported. Red left-border accent. "View All" link at bottom.

**Floating element — ModuleChatButton:**
Bottom-right corner, circular button (56px) with AI chat icon in MW Yellow. Opens the AI assistant contextualised to the Ship module.

---

### Screen 2: Orders (/ship/orders)

The fulfilment pipeline — Kanban board as default view with a list view toggle.

**Header bar:**
- Page title "Fulfilment Orders" (Title weight)
- ViewSwitcher toggle: Kanban (default) | List
- FilterBar: Status dropdown (multi-select), Carrier dropdown, Priority dropdown (Urgent/High/Normal/Low), Date range picker, Destination state/zone
- SearchBar: "Search orders, tracking numbers, customers..."
- Sort dropdown: Date (newest), Priority, Carrier, Destination

**Kanban view (default):**
6 columns matching fulfilment stages: Ready to Pick, Picking, Packing, Ready to Ship, Shipped, Delivered. Each column has a header with stage name, count badge, and the stage's status colour as a top border.

**Order cards (384px width in columns):**
- Coloured left border matching priority (Urgent=Red, High=Amber, Normal=Blue, Low=Grey)
- Order number in monospace bold (e.g. SH-202603-001)
- Customer name (Body weight)
- Item count and total weight (Caption, e.g. "3 items · 12.4 kg")
- Carrier badge with carrier logo/name
- Required delivery date with countdown (e.g. "Due in 2 days")
- Priority badge (colour-coded pill)
- Status badge (colour-coded pill matching shipment status colours)
- Small progress bar showing fulfilment completion percentage (MW Yellow fill)
- Bottom row: "View" ghost button, AI chat icon button (small)

**Clicking a card opens the Order Detail Sheet (right slide-over, 480px):**
8 tabs across the top with MW Yellow active indicator underline: Overview, Items, Address, Shipping, Packaging, Documents, Tracking, History.

- Overview tab: Order summary card, fulfilment status timeline (vertical stepper), special instructions callout box, customer info section
- Items tab: Checklist-style list with checkbox per item, SKU in monospace, description, quantity ordered vs picked vs packed, bin location badge, pick status badge
- Address tab: Ship-to address block, billing address block, delivery instructions, embedded map preview placeholder
- Shipping tab: Carrier selector dropdown, service level options, estimated cost display, transit days, rate comparison button (opens dialog), insurance toggle
- Packaging tab: Package type selector, dimensions inputs (L × W × H in cm), weight input (kg), fragile toggle, packing instructions textarea, AI-recommended box highlight in MW Yellow border
- Documents tab: Grid of document cards (Pick List, Packing Slip, Shipping Label, PoD), each with preview thumbnail, download button, print button
- Tracking tab: Vertical tracking timeline with status dots and timestamps, carrier tracking link, current location, ETA display
- History tab: Audit log table with timestamp, user, action, previous/new value columns

---

### Screen 3: Packaging (/ship/packaging)

The pack station interface — optimised for warehouse staff with gloves. All interactive elements use 56px touch targets.

**Pack Station Header:**
- Operator name + avatar (logged-in user)
- Active station badge (e.g. "Pack Station 1")
- Session stats: items packed today, orders completed today
- "End Session" ghost button

**Main layout — two columns:**

**Left column (~60%) — Active Order:**
- Large order number (Headline weight, monospace)
- Customer name and destination
- Item checklist: Each item is a row with 56px checkbox, product image thumbnail (48px), SKU (monospace), description, quantity to pack (large bold number), bin location badge. Checked items grey out with strikethrough. Unchecked items are prominent.
- Scan input field at top of checklist: tall input (56px) with barcode icon, auto-focused, placeholder "Scan item barcode..." Green flash animation on successful scan, red shake on failed scan.

**Right column (~40%) — Package Details:**
- Package type selector (large cards, not dropdown): Small Box, Medium Box, Large Box, Pallet, Custom. Each shows dimensions preview.
- Weight input (56px, large font) with "kg" suffix
- Dimensions: L × W × H inputs in cm
- Fragile toggle switch (56px)
- Special instructions textarea (if any, highlighted in amber)
- Packing slip preview card (thumbnail)

**Bottom action bar (sticky, full width):**
- "Complete & Print Label" — primary CTA, MW Yellow background, 120px wide, 56px tall, bold text
- "Park Order" — secondary ghost button
- "Flag Issue" — destructive outline button

---

### Screen 4: Shipping (/ship/shipping)

Carrier management and dispatch operations. Three sub-views accessible via tabs: Carrier Dashboard (default), Rate Comparison, Manifests.

**Carrier Dashboard tab:**
Grid of carrier cards (3 columns on desktop). Each carrier card shows:
- Carrier logo (48px square)
- Carrier name (Title weight)
- Connection status badge (Connected/Disconnected/Error)
- Today's shipments count
- Average delivery time (days)
- On-time rate percentage with progress bar
- "Configure" ghost button, "Book Shipment" primary button (MW Yellow)

Australian carriers to show: Australia Post, StarTrack, Toll/IPEC, TNT Express, DHL Express, Aramex, Sendle, Allied Express.

**Rate Comparison tab:**
- Input section: Origin postcode, destination postcode, weight (kg), dimensions (L × W × H cm), service level dropdown (Express/Standard/Economy)
- Results: List of carrier rate cards sorted by price. Each row shows: carrier logo, service name, estimated cost (AUD, bold), transit days, pickup availability, "Select" button (MW Yellow for cheapest option, ghost for others). AI-recommended option highlighted with yellow border and "AI Pick" badge.

**Manifests tab:**
- DataTable of daily manifests. Columns: Date, Carrier, Shipment Count, Total Weight, Status (Open/Closed/Submitted), Actions (Close Manifest, Download PDF, Print)
- "Generate Manifest" primary button at top right

---

### Screen 5: Tracking (/ship/tracking)

Active shipment tracking with exception management.

**Header:**
- Search bar: "Search by tracking number, order number, or customer..."
- Filter: Status (multi-select with status colour dots), Carrier, Date range, Exception type
- View toggle: List (default) | Map (placeholder)

**Shipment list (DataTable):**
Columns: Tracking Number (monospace, clickable), Order Number (monospace), Customer, Carrier + Service, Status Badge (coloured), ETA, Last Update, Actions (Track, Notify).

**Clicking a tracking number opens a Tracking Detail Sheet (480px slide-over):**
- Header: Tracking number (large, monospace), carrier logo + name, service level
- Vertical tracking timeline: Each event is a node with coloured dot (matching status), timestamp, location, description. Current status node is larger and pulsing. Future estimated events shown as dashed/grey.
- Package details card: weight, dimensions, contents summary
- Delivery details: recipient name, address, delivery instructions, signature requirement
- Actions: "Send Update to Customer" button, "Report Exception" button, "Open Carrier Portal" link

**Exception Queue section (below main list or as a tab):**
Filtered list showing only shipments with exceptions. Each exception card has:
- Red left border
- Exception type badge (Delay, Damage, Refused, Lost, Address Issue)
- Tracking number, customer name, carrier
- Time since reported
- "Resolve" button, "Escalate" button, "Contact Carrier" button

---

### Screen 6: Returns (/ship/returns)

RMA (Return Merchandise Authorisation) management.

**Header:**
- Page title "Returns & RMAs"
- "Create RMA" primary button (MW Yellow)
- FilterBar: Return Status (multi-select with status colours), Date range, Return reason, Customer search

**RMA Queue (DataTable):**
Columns: RMA Number (monospace, e.g. RMA-202603-001), Order Number, Customer, Items (count), Return Reason (badge: Defective, Wrong Item, Damaged, Change of Mind, Other), Status Badge (coloured), Created Date, Actions.

**Clicking an RMA opens Return Detail Sheet (480px slide-over):**
- Header: RMA number, status badge, created date
- Customer info section
- Return items table: SKU, description, quantity, reason, condition on receipt
- Return shipping: prepaid label status, tracking number (if shipped), carrier
- Timeline: vertical stepper showing return progress (Pending → Approved → Label Sent → In Transit → Received → Inspected → Refund Processed → Closed)
- Actions: "Approve Return", "Send Return Label", "Mark Received", "Process Refund", "Reject" (destructive)
- Notes/comments section

**Return Analytics card (sidebar or below table):**
- Returns this month (count + trend)
- Top return reasons (horizontal bar chart)
- Average processing time (days)
- Return rate percentage

---

### Screen 7: Warehouse (/ship/warehouse)

Lightweight warehouse management. Three sub-views via tabs: Warehouse Map (default), Inventory Grid, Cycle Counting.

**Warehouse Map tab:**
- Interactive SVG floor plan of the warehouse. Rectangular zones shown as coloured regions:
  - Receiving (blue tint)
  - Storage / Racking (neutral grey)
  - Pick Face (green tint)
  - Pack Station (violet tint)
  - Dispatch / Staging (amber tint)
  - Returns Processing (red tint)
- Each zone shows: zone name label, current item count, utilisation percentage
- Bin locations shown as small rectangles within zones with bin codes (e.g. A-01-03)
- Colour intensity indicates fill level (empty = light, full = saturated)
- Clicking a zone zooms in and shows detailed bin layout
- Legend in bottom-left corner

**Inventory Grid tab:**
DataTable with columns: Bin Location (monospace), SKU, Product Name, Quantity On Hand, Quantity Reserved (for pending orders), Quantity Available, Last Movement (date), Status Badge (In Stock/Low/Empty/Reserved).
- Inline search and column filters
- "Adjust Stock" action button per row
- Bulk actions: "Export CSV", "Print Inventory Report"

**Cycle Counting tab:**
- Active count header: Count ID, Zone being counted, Progress bar (items counted / total)
- Item list: Bin location, expected SKU, expected quantity, actual quantity input (56px, large font), variance indicator (green check if match, red alert if mismatch)
- "Start Count" button to begin a new cycle count for a selected zone
- "Submit Count" primary CTA
- Recent counts history table below

---

### Screen 8: Reports (/ship/reports)

Shipping analytics and performance reporting.

**Header:**
- Page title "Ship Reports"
- Date range picker (preset: This Week, This Month, This Quarter, Custom)
- "Export PDF" button, "Export CSV" button

**Performance Dashboard (bento grid of chart cards):**

**Row 1 (3 cards):**
1. Shipments Over Time — line chart, daily shipment volume for selected period
2. On-Time Delivery Trend — line chart with 95% target line
3. Average Transit Time — line chart by carrier

**Row 2 (2 cards):**
4. Carrier Cost Comparison — grouped bar chart, cost per shipment by carrier (AUD)
5. Shipment Status Distribution — donut chart with status colours

**Row 3 (2 cards):**
6. Top Destinations — horizontal bar chart, shipment count by Australian state (NSW, VIC, QLD, WA, SA, TAS, NT, ACT)
7. Return Rate Trend — line chart, returns as percentage of shipments

**Each chart card:** Title (Semibold), subtitle/description (Caption), the chart, and a "View Details" link in the bottom-right.

---

### Screen 9: Settings (/ship/settings)

8 tabbed configuration panels. Tabs listed vertically on the left (like a settings sidebar within the settings page), content on the right.

**Settings tabs (vertical list, left side):**
1. General — Default carrier, shipping prefix, weight/dimension units, timezone, business days
2. Warehouse — Zones, bin locations, multi-site toggle
3. Carriers — Carrier connections, API credentials, default services
4. Packaging — Package type definitions (name, dimensions, max weight, cost)
5. Fulfilment — Auto-dispatch rules, pick strategy, pack verification toggle
6. Notifications — Email/SMS templates for shipping confirmation, delivery, exception
7. Returns — RMA policy, return window days, auto-approve rules, restocking fee
8. Integrations — External system connections (accounting, marketplace, carrier portals)

Each panel uses a form layout with: Section headers, form fields (inputs, selects, switches, textareas), "Save" primary button (MW Yellow) and "Reset" ghost button at the bottom.

**Example — General Settings panel:**
- Default Carrier: dropdown (Australia Post, StarTrack, etc.)
- Shipping Prefix: text input, default "SH-"
- Weight Unit: radio group (kg selected, lb)
- Dimension Unit: radio group (cm selected, in)
- Timezone: dropdown (Australia/Sydney default)
- Business Days: checkbox group (Mon-Fri checked by default)
- Cut-off Time: time picker (default 14:00)

---

### Design Notes

- This is a B2B SaaS product for small manufacturing businesses, not a consumer app. Keep the design professional, data-dense, and functional.
- Australian market: use "postcode" not "zip code", metric units (kg, cm), AUD currency ($), AU state abbreviations (NSW, VIC, QLD, etc.).
- Warehouse interfaces (Packaging, Warehouse screens) need extra-large touch targets (56px) because operators wear work gloves.
- Monospace font (Roboto Mono) for all IDs, tracking numbers, barcodes, and bin locations.
- Status badges are a core UI pattern — they appear on almost every screen. Use the shipment status colour palette consistently.
- The sidebar should show the "Ship" module as active (MW Yellow highlight on the module icon). Other modules (Sell, Plan, Make, Book) are visible but inactive in the sidebar.
- Dark mode is not required for v1.
- Design for 1440px desktop viewport as primary, with responsive considerations for 1024px tablet landscape.
