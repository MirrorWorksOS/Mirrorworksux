# MirrorWorks Book Module — Figma Make Screen Prompts v2

**Document ID:** MW-BOOK-FIGMA-002
**Author:** Matt Quigley / Claude AI
**Date:** 26 February 2026
**Purpose:** Structured prompts for generating Book module screen designs in Figma Make
**UX Reference:** https://manual-glyph-92684719.figma.site (MirrorWorks UI Design System v2.0.0)

---

## How to Use This Document

Each section below contains a self-contained prompt for Figma Make. Copy the full prompt into Figma Make. Every prompt includes the design system context block so it can be used independently without needing to paste a separate reference.

---

## Design System Context Block

> **Paste this block at the start of every Figma Make prompt, or include it in the Figma Make system instructions if the tool supports it.**

```
DESIGN SYSTEM: MirrorWorks UI Design System v2.0.0

COLOUR PALETTE (60-30-10 rule):
60% MAIN: #FFFFFF (white), #F8F7F4 (off-white backgrounds)
30% SECONDARY: #1A2732 (MW Mirage — text, headings, icons)
10% ACCENT: #FFCF4B (MW Yellow — CTAs, active states, highlights)

Yellow scale: 50 #FFFBF0, 100 #FFF3D6, 200 #FFE8AD, 300 #FFDB7A, 400 #FFCF4B (PRIMARY), 500 #F2BF30 (pressed), 600 #E6A600 (hover), 700 #CC8E00, 800 #A67300, 900 #805900
Neutral scale: 50 #FAFAFA, 100 #F5F5F5, 200 #E5E5E5 (borders), 300 #D4D4D4, 400 #A3A3A3 (placeholder), 500 #737373 (secondary text), 600 #525252 (body), 700 #404040, 800 #262626 (headings), 900 #171717
Anchor colours (card backgrounds): Earth #8FA6A6, Saddle #A68060, Sea Foam #7B9386
Semantic: Success #36B37E, Info #0052CC, Warning #FACC15, Error #DE350B
AI features: AI Purple #7C3AED, Siri-gradient border (purple-blue-pink-orange) for AI insights

TYPOGRAPHY (Material Design 3 type scale, Roboto + Roboto Mono):
Display: Large 57/64 R400, Medium 45/52 R400, Small 36/44 R400
Headline: Large 32/40 R400, Medium 28/36 R400, Small 24/32 R400
Title: Large 22/28 R400, Medium 16/24 M500 tracking 0.15px, Small 14/20 M500 tracking 0.1px
Body: Large 16/24 R400 tracking 0.5px, Medium 14/20 R400 tracking 0.25px, Small 12/16 R400 tracking 0.4px
Label: Large 14/20 M500 tracking 0.1px, Medium 12/16 M500 tracking 0.5px, Small 11/16 M500 tracking 0.5px
Roboto Mono: Data Medium 14/20 M500 (table values, amounts), Code Regular 13/20 R400 (IDs, codes), Code Small 12/16 R400 (serial numbers)

SPACING (4px base grid, 8px rhythm):
space-1: 4px, space-2: 8px, space-3: 12px, space-4: 16px, space-5: 20px, space-6: 24px, space-8: 32px, space-10: 40px, space-12: 48px, space-16: 64px

SHAPE (M3 shape scale):
shape-none: 0px, shape-xs: 4px (chips, small), shape-sm: 8px (cards, inputs, containers), shape-md: 12px (panels, modals, large cards), shape-lg: 16px (sheets), shape-xl: 24px (hero cards), shape-full: 9999px (pills, avatars)

BORDERS:
Default: 1px #E5E5E5. Focus/Active: 2px #FFCF4B. Error: 2px #DE350B. Dividers: 1px #E5E5E5.

ELEVATION:
Level 0: none (base). Level 1: 0 1px 2px 0 rgba(0,0,0,0.05) (cards, inputs). Level 2: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) (buttons, hover cards). Level 3: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) (popovers, menus). Level 4: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) (modals, dialogs).

BUTTONS (M3 types):
Filled (Primary): #FFCF4B background, #1A2732 text, shape-xs (4px radius), Label Large 14/20 M500. Hover: #E6A600. Pressed: #F2BF30.
Outlined (Secondary): transparent bg, 1px #E5E5E5 border, #1A2732 text. Hover: #F5F5F5 fill.
Text (Tertiary): transparent, #1A2732 text. Hover: 8% overlay.
Tonal: #FFF3D6 background, #1A2732 text.
Elevated: white bg + Level 2 shadow.
Icon buttons: 44x44px touch target minimum, 2px stroke Lucide icons.
Extended FAB: #FFCF4B, icon + label, Level 3 shadow, shape-lg (16px radius).

INPUTS:
Height: 56px (default), 40px (dense). Padding: 16px horizontal. Label: 14px M500, 8px above field. Helper text: 12px R400, 4px below field. Spacing between fields: 16px. Outlined variant: 4px radius all corners. Focus: 2px MW Yellow border. Error: 2px #DE350B border. Selected checkbox fill: #FFCF4B.

NAVIGATION:
Sidebar: 256px width collapsible. Active item: #FFCF4B left border, #FFFBF0 background.
Tabs: MW Yellow underline indicator on active tab.

CARDS (M3):
Default: white bg, 8px radius, Level 1 shadow, 1px #E5E5E5 border. Padding: 16px compact, 24px standard.
Hover: Level 2 shadow. Content order: Header > Supporting text > Media > Actions.
Touch targets: minimum 44x44px interactive, 48x48px for tablet.
State layers: 8% overlay on hover, 12% on press.
Gap between card elements: 8px. Between sections: 16px. Between action buttons: 12px.

KANBAN:
Column: min 280px wide, #F8F7F4 background, 16px padding, 8px radius. Drop zone hover: #FFF9E6 background + 2px dashed #FFCF4B border.
Card: white bg, 8px radius, 16px padding, 12px gap between cards, 1px #E5E5E5 border. Hover: MW Yellow border + Level 2 shadow.
Drag state: 40% opacity + MW Yellow border, Level 3 shadow, 2deg rotation + 2% scale, 3px MW Yellow ring glow.
Priority badges: Low #F0F0F0, Medium #FFF4CC, High #FFE5E5. 10px bold uppercase text.

DATA TABLES:
Row height: min 56px. Alternating row backgrounds: white / #F5F5F5. Monospace (Roboto Mono M500 14px) for numeric values and IDs. Right-align financial figures. Status badges: rounded pills (shape-full).

MANUFACTURING PATTERNS:
Status dots: Running #36B37E, Idle #FACC15, Error #DE350B, Info #0052CC.
Machine card: white bg, 8px radius, Level 1 shadow, Roboto Mono for machine IDs and data values.
Job card: white bg, 8px radius, 16px padding, status badge, progress bar, monospace for job IDs.
AI Insight: Siri-gradient border (purple-blue-pink-orange) for high-priority AI suggestions. AI Purple #7C3AED badge for AI-generated content.

MOTION:
Standard (most transitions): 300ms cubic-bezier(0.4, 0.0, 0.2, 1). Entering: 300ms cubic-bezier(0.0, 0.0, 0.2, 1). Exiting: 300ms cubic-bezier(0.4, 0.0, 1, 1). Micro: 100ms. Quick: 200ms. Never exceed 400ms. Respect prefers-reduced-motion.

ICONS: Lucide React, 2px stroke weight. Sizes: 16px (inline), 20px (default), 24px (nav), 32px (feature cards), 48px (hero).

TERMINOLOGY: "Shop" not "facility". "Operator" not "user". "Job" not "project". "Machine" not "asset". "Set up" not "onboard".

BRAND VOICE: Confident, direct, practical. No buzzwords. "Built by people who work in shops."
```

---

## Screen 1: Book Dashboard

```
Design a financial dashboard page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Book Module Dashboard — /book/dashboard
FRAME: 1440x1024px, #F8F7F4 page background

LEFT SIDEBAR (256px wide, #FFFFFF background, Level 1 elevation):
- Top: MirrorWorks logo (120px min width) + organisation name dropdown below it
- Nav group "BOOK" with Lucide icons (24px, 2px stroke, #737373 default):
  - LayoutDashboard icon: "Dashboard" — ACTIVE STATE: 3px #FFCF4B left border, #FFFBF0 background, #1A2732 bold text
  - FileText icon: "Invoices"
  - Receipt icon: "Expenses"
  - ShoppingCart icon: "Purchases"
  - TrendingUp icon: "Job Costs"
  - Target icon: "Budgets"
  - Package icon: "Stock Valuation"
  - BarChart3 icon: "Reports"
  - Settings icon: "Settings"
- Nav items: 56px height each, 16px left padding, Body Medium (14/20 R400) text, #737373 inactive colour
- Bottom: dark mode toggle (Moon icon), user avatar circle (32px, shape-full)
- 1px #E5E5E5 right border separating sidebar from content

TOP BAR (1184px wide content area, 64px height, #FFFFFF, Level 1 elevation):
- Left: Breadcrumb "Book > Dashboard" in Body Small (12/16 R400) #737373, active segment in #1A2732
- Right: Bell icon (20px) with notification dot (#DE350B), Settings icon (20px), 16px gap between icons

KPI ROW (6 stat cards in 3-column grid, 16px gap):
Each card: #FFFFFF background, shape-sm (8px radius), Level 1 elevation, 24px padding
- Top: Icon (20px, #737373) + title in Label Medium (12/16 M500) #737373
- Middle: Value in Headline Large (32/40 R400) #1A2732 — use Roboto Mono M500 for dollar amounts
- Bottom: Change badge — pill shape (shape-full), 11px M500 text. Green #36B37E bg for positive, #DE350B bg for negative

Card 1: DollarSign icon | "Monthly Revenue" | "$124,560" (Roboto Mono) | +12% green badge
Card 2: Receipt icon | "Outstanding" | "23 invoices" | "$67,200" subtitle Body Small
Card 3: TrendingUp icon | "Profit Margin" | "18.5%" (Roboto Mono) | +2.3% green badge
Card 4: BarChart3 icon | "Cash Flow" | "$45,230" (Roboto Mono) | +15% green badge
Card 5: AlertTriangle icon | "Overdue" | "4" in #DE350B | "$12,340 outstanding" subtitle
Card 6: CreditCard icon | "Expenses MTD" | "$34,200" (Roboto Mono) | "78% of budget" subtitle + thin progress bar (#FFCF4B fill, #E5E5E5 track)

CHARTS ROW (2 charts, equal width, 16px gap, white card containers with shape-sm + Level 1):
Left chart — "Revenue vs Expenses" in Title Medium (16/24 M500):
- Recharts area chart, 12-month x-axis labels in Label Small (11/16 M500) #737373
- Revenue line: #FFCF4B (2px stroke) with 15% opacity fill below
- Expense line: #8FA6A6 (2px stroke) with 10% opacity fill below
- Y-axis: dollar format, Roboto Mono 12px
- Grid lines: 1px #F5F5F5

Right chart — "Job Profitability" in Title Medium:
- Horizontal bar chart, 8 jobs
- Y-axis: job IDs in Roboto Mono Code Small (12/16)
- Bar colours: #36B37E (margin >15%), #FACC15 (5-15%), #DE350B (<5%)
- Value labels: Roboto Mono 12px at end of each bar

ACTION CARDS ROW (3 cards, equal width, 16px gap):
Card style: white bg, shape-sm, Level 1, 16px padding, 1px #E5E5E5 border
Card 1: ClipboardCheck icon (20px, #FACC15) | "Approval Queue" Title Small | "5 items awaiting approval" Body Small #737373 | "Review" outlined button (shape-xs, 40px height)
Card 2: RefreshCw icon (20px, #36B37E) | "Xero Sync" Title Small | "Last sync: 2 min ago" Body Small + green dot (8px circle #36B37E) | "Sync Now" outlined button
Card 3: AlertCircle icon (20px, #DE350B) | "Overdue Actions" Title Small | "4 overdue invoices, 2 unpaid bills" Body Small | "View All" outlined button
```

---

## Screen 2: Invoice List View

```
Design an invoice list page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Invoice List — /book/invoices
FRAME: 1440x1024px, #F8F7F4 page background
SIDEBAR: Same 256px sidebar as Dashboard, but "Invoices" nav item is now active (#FFCF4B left border, #FFFBF0 bg)

CONTENT AREA (1184px wide, 24px padding):

PAGE HEADER (64px height):
- Left: "Invoices" Headline Large (32/40 R400) #1A2732
- Below title: "Manage customer invoices and track payments" Body Medium (14/20) #737373
- Right: "New Invoice" filled button (#FFCF4B bg, #1A2732 text, PlusCircle icon 20px, Label Large 14/20 M500, shape-xs 4px radius, 48px height)

TOOLBAR (48px height, 16px below header, 12px gap between elements):
- Search input: 320px wide, 40px height (dense), Search icon (16px) left, placeholder "Search invoices..." Body Medium #A3A3A3, outlined style 4px radius, 1px #E5E5E5 border
- Filter dropdown button: SlidersHorizontal icon (20px) + "Filter" Label Medium, outlined style
- Export split button: "Export" text + ChevronDown icon, outlined style. Dropdown: CSV, Excel, PDF
- Right end: "1-25 of 147" Label Small #737373

TABS (48px height, 8px below toolbar):
- Tab items: Label Large (14/20 M500), 16px horizontal padding, #737373 text default
- Active tab: #1A2732 text, 3px #FFCF4B bottom border
- Tabs: All (147) | Draft (23) | Sent (45) | Paid (56) | Overdue (12) | Cancelled (11)
- Count numbers in Label Small inside parentheses

DATA TABLE (white bg, shape-sm radius, Level 1 elevation, 16px below tabs):
- Header row: #F8F7F4 background, Label Medium (12/16 M500) #737373 uppercase, 48px height, 16px cell padding
- Columns: [Checkbox 18x18] | Invoice # | Customer | Issue Date | Due Date | Status | Total | Balance Due | [MoreHorizontal icon]
- Invoice # column: Roboto Mono Code Regular (13/20) #0052CC (link colour)
- Customer: Body Medium (14/20) #1A2732
- Dates: Body Medium #525252
- Status badges: shape-full pill, Label Small (11/16 M500), 6px horizontal padding, 2px vertical
  - Draft: #F5F5F5 bg, #737373 text
  - Sent: #E6F0FF bg, #0052CC text
  - Viewed: #E6F0FF bg, #0052CC text
  - Partially Paid: #FFF4CC bg, #805900 text
  - Paid: #E6F7EF bg, #1B7D4F text
  - Overdue: #FFE5E5 bg, #DE350B text
  - Cancelled: #F5F5F5 bg, #A3A3A3 text
- Total / Balance Due: Roboto Mono Data Medium (14/20 M500), right-aligned
- Data rows: 56px height, white bg, hover: #FFFBF0 bg. Alternating rows: white / #FAFAFA
- Row separator: 1px #F5F5F5

SAMPLE DATA (8 rows):
INV-2026-0045 | Con-form Group | 24 Feb 2026 | 26 Mar 2026 | Sent | $18,450.00 | $18,450.00
INV-2026-0044 | Acme Steel Works | 22 Feb 2026 | 24 Mar 2026 | Paid | $7,230.00 | $0.00
INV-2026-0043 | Pacific Fabrication | 20 Feb 2026 | 22 Mar 2026 | Overdue | $12,680.00 | $12,680.00
INV-2026-0042 | Hunter Steel | 18 Feb 2026 | 20 Mar 2026 | Partially Paid | $5,400.00 | $2,700.00
INV-2026-0041 | BHP Contractors | 15 Feb 2026 | 17 Mar 2026 | Paid | $23,100.00 | $0.00
INV-2026-0040 | Sydney Rail Corp | 12 Feb 2026 | 14 Mar 2026 | Sent | $9,870.00 | $9,870.00
INV-2026-0039 | Kemppi Welding Supplies | 10 Feb 2026 | 12 Mar 2026 | Draft | $4,560.00 | $4,560.00
INV-2026-0038 | Oberon Engineering | 08 Feb 2026 | 10 Mar 2026 | Cancelled | $1,200.00 | $0.00

PAGINATION (48px, bottom of table):
Left: "Showing 1-25 of 147 invoices" Label Small #737373
Right: Page number buttons (32x32px, shape-xs), ChevronLeft / ChevronRight icons, active page: #FFCF4B bg
```

---

## Screen 3: Invoice Detail View

```
Design an invoice detail page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Invoice Detail — /book/invoices/INV-2026-0045
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Invoices" active

CONTENT AREA (1184px, 24px padding):

HEADER BAR (64px):
- Left: ArrowLeft icon (20px, clickable) + "INV-2026-0045" Roboto Mono Headline Small (24/32) #1A2732 + "Sent" status badge (pill, #E6F0FF bg, #0052CC text, Label Small)
- Right: Action buttons (40px height, 12px gap):
  - "Send" outlined button (Send icon 16px)
  - "Download PDF" outlined button (Download icon 16px)
  - "Record Payment" filled button (#FFCF4B, DollarSign icon 16px)
  - MoreVertical icon button (three-dot menu, 44x44px touch target)

TWO-COLUMN LAYOUT (16px gap):

LEFT PANEL (60% width — Invoice preview):
- White card, shape-md (12px radius), Level 1 elevation, 32px padding
- Simulates printed invoice layout

Top section:
- Left: Company logo placeholder (48px square, #F5F5F5) + "MirrorWorks Pty Ltd" Title Medium #1A2732, "123 Factory Road, Oberon NSW 2787" Body Small #737373, "ABN: 12 345 678 901" Roboto Mono Code Small
- Right: "INVOICE" Display Small (36/44) #1A2732

Two-column header (16px below, 1px #E5E5E5 bottom border, 16px padding below):
- Left column "Bill To": "Con-form Group" Title Medium bold, address lines Body Small #525252
- Right column: Key-value pairs right-aligned:
  "Invoice Number" Label Small #737373 / "INV-2026-0045" Roboto Mono 13px #1A2732
  "Issue Date" / "24 February 2026"
  "Due Date" / "26 March 2026"
  "PO Reference" / "PO-CF-2026-089" Roboto Mono
  "Job Reference" / "JOB-2026-0012" Roboto Mono #0052CC (link)

Line items table (16px below):
- Header: #F8F7F4 bg, Label Medium uppercase #737373
- Columns: # | Product | Description | Qty | Unit Price | Disc | Tax | Total
- Roboto Mono for Qty, Unit Price, Disc %, Total (right-aligned)
- Row 1: 1 | 10mm MS Plate | AS/NZS 3678-250 | 50 | $85.00 | 5% | GST 10% | $4,037.50
- Row 2: 2 | Laser Cutting | Profile cutting per metre | 120m | $12.50 | — | GST 10% | $1,650.00
- Row 3: 3 | Assembly Labour | Fabrication and welding | 16hr | $95.00 | — | GST 10% | $1,672.00
- Row 4: 4 | Paint Finish | Dulux powder coat, custom RAL | 1 | $890.00 | — | GST 10% | $979.00
- 1px #E5E5E5 row separators

Totals section (right-aligned, 16px below table, 1px top border):
- "Subtotal" Label Medium #737373 / "$8,338.50" Roboto Mono 14px
- "GST (10%)" / "$833.85"
- 1px separator
- "Total" Title Medium bold / "$9,172.35" Roboto Mono Headline Small bold
- "Amount Paid" / "$0.00" #737373
- "Balance Due" Label Large bold / "$9,172.35" Roboto Mono Headline Medium #DE350B (red because unpaid)

Footer: "Payment Terms: Net 30" Body Small #737373. "Notes: Please reference INV-2026-0045 on all remittances."

RIGHT PANEL (40% width):

Section "Payments" (white card, shape-sm, Level 1, 16px padding):
- Heading: "Payments" Title Small + DollarSign icon (16px)
- Empty state: "No payments recorded yet" Body Small #A3A3A3, center aligned
- "Record Payment" text button (#FFCF4B text)

Section "Email History" (white card, shape-sm, Level 1, 16px padding, 12px below):
- Heading: "Email History" Title Small + Mail icon (16px)
- Timeline items: 8px left border (#E5E5E5), 16px left padding
  - "Invoice sent to accounts@conform.com.au" Body Small, "24 Feb 2026, 10:32 AM" Label Small #737373, Send icon (16px #36B37E)
  - "Email opened" Body Small, "24 Feb 2026, 11:15 AM" Label Small, Eye icon (16px #0052CC)

Section "Activity" (white card, shape-sm, Level 1, 16px padding, 12px below):
- Heading: "Activity" Title Small + Clock icon (16px)
- Timeline: vertical line 2px #E5E5E5, circle dots (8px) at each event
  - "Invoice created by Matt" Body Small, timestamp Label Small #737373
  - "Sent to customer" Body Small, timestamp
  - "Pushed to Xero" Body Small + Xero blue dot, "XeroID: abc123..." Roboto Mono Code Small

Section "Xero" (white card, shape-sm, Level 1, 16px padding, 12px below):
- "View in Xero" text button with ExternalLink icon (16px), #0052CC text
- "Sync Status: Synced" Label Small + green dot (8px #36B37E)
- "Last synced: 24 Feb 2026, 10:33 AM" Label Small #737373
```

---

## Screen 4: Expense Kanban View

```
Design an expense management page with Kanban view for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Expense Kanban — /book/expenses
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Expenses" active

CONTENT AREA:

PAGE HEADER (64px):
- Left: "Expenses" Headline Large #1A2732
- Right: View toggle — two icon buttons (LayoutGrid active for Kanban / List icon for list), 8px gap. "New Expense" filled button (#FFCF4B, PlusCircle icon)

TOOLBAR (48px, 16px below):
- Search input (320px, 40px dense, outlined)
- Date range picker (outlined button with Calendar icon)
- Category multi-select dropdown (outlined button with Tag icon + "Category")
- Employee filter dropdown (outlined with User icon)

KANBAN BOARD (16px below toolbar, 16px gap between columns):
Follows MW Kanban spec exactly:

Column 1 — "Draft" (header: #F5F5F5 bg pill, Label Medium #737373):
- Column bg: #F8F7F4, 16px padding, 8px radius (shape-sm)
- Header: "Draft" Label Large + count badge "3" (shape-full, #F5F5F5, Label Small) + total "$1,230" Roboto Mono Label Small #737373
- 3 expense cards

Column 2 — "Submitted" (header: #E6F0FF bg pill, #0052CC text):
- Count "4" + total "$5,890"
- 4 expense cards

Column 3 — "Approved" (header: #E6F7EF bg pill, #1B7D4F text):
- Count "6" + total "$12,450"
- 6 expense cards

Column 4 — "Paid" (header: #1A2732 bg pill, #FFFFFF text):
- Count "8" + total "$23,670"
- 8 expense cards (show 3, scroll indicator for rest)

EXPENSE CARD (per MW Kanban card spec):
- White bg, shape-sm (8px), 16px padding, 1px #E5E5E5 border, 12px gap between cards
- Hover: 2px #FFCF4B border + Level 2 shadow
- Drag handle: GripVertical icon (16px, #D4D4D4) left side, always visible
- Layout:
  Row 1: Vendor name Title Small (14/20 M500) #1A2732 | Amount Roboto Mono Data Medium (14/20 M500) bold right-aligned
  Row 2: Category badge (shape-full pill, Label Small 11px) | Date Body Small #737373
  Row 3 (optional): Paperclip icon (12px) "1 receipt" Label Small #A3A3A3 | "JOB-2026-0012" Roboto Mono Code Small #737373
  Row 4: User avatar (24px circle) + employee name Body Small #525252

Category badge colours:
- "Materials": #E6F0FF bg, #0052CC text
- "Utilities": #E6F7EF bg, #1B7D4F text
- "Maintenance": #FFF4CC bg, #805900 text
- "Consumables": #F3E8FF bg, #7C3AED text
- "Subcontractor": #FFE5E5 bg, #DE350B text

SAMPLE CARDS:
Draft: "BOC Gas" $340.00 Consumables 25 Feb | "Workshop Supplies" $450.00 Materials 24 Feb | "Fuel — site delivery" $440.00 draft mileage
Submitted: "Blackwoods Steel" $2,450.00 Materials 23 Feb JOB-2026-0012 | "AGL Energy" $890.00 Utilities 22 Feb | "Kemppi Service" $1,200.00 Maintenance 21 Feb | "BOC Gas" $1,350.00 Consumables 20 Feb
Approved: 6 cards with mixed categories
```

---

## Screen 5: New Expense with Receipt Upload

```
Design a new expense form with receipt upload for a manufacturing ERP called MirrorWorks. Optimised for both desktop and tablet (44px minimum touch targets, 56px for primary actions).

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: New Expense — /book/expenses/new
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Expenses" active

CONTENT AREA:

HEADER: ArrowLeft icon + "New Expense" Headline Small (24/32) #1A2732

SPLIT LAYOUT (16px gap):

LEFT PANEL (55% width, white card, shape-md 12px radius, Level 1, 24px padding):

Form fields follow MW Input spec exactly: 56px height, 16px horizontal padding, 4px radius outlined, Label 14px M500 8px above, 16px vertical gap between fields.

Field 1: Label "Vendor / Supplier" — Combobox with Search icon, autocomplete dropdown (Level 3 shadow). Placeholder "Search suppliers..." #A3A3A3
Field 2: Label "Expense Date" — Date picker with Calendar icon right side. Default: today's date. 56px height.
Field 3: Label "Amount" — Number input with "$" prefix inside field (Roboto Mono). Below field: calculated row "GST (10%): $XX.XX" and "Total incl. GST: $XXX.XX" in Roboto Mono Code Small #737373. Toggle: "Tax inclusive" / "Tax exclusive" segmented control (2 segments, 40px height).
Field 4: Label "Category" — Dropdown with hierarchical groups:
  Group "Operating": Raw Materials, Utilities, Maintenance, Consumables, Freight, Subcontractor
  Group "Capital": Equipment, Vehicles, Tooling
  Group "Reimbursement": Travel, Mileage, Training, Meals
Field 5: Label "Payment Method" — Segmented control (4 segments): Cash | Credit Card | Bank Transfer | Petty Cash. 48px height. Active segment: #FFCF4B bg.
Field 6: Label "Description" — Textarea, 3 rows (88px height). Placeholder "Add notes about this expense..." Optional.
Field 7: Label "Link to Job" — Optional combobox. Placeholder "Search jobs..." Search icon. "Optional" Label Small #A3A3A3 right of label.
Field 8: "Reimbursable" — Toggle switch. When ON: employee combobox appears below (animated slide-down, 300ms ease-standard). Switch track: #E5E5E5 off, #FFCF4B on.
Field 9: "Billable to Customer" — Toggle switch with customer combobox that appears when ON.

BUTTONS (bottom of form, 24px above card edge, 12px gap):
- "Save as Draft" outlined button (48px height, shape-xs)
- "Submit for Approval" filled button (#FFCF4B, 48px height, shape-xs, Label Large)

RIGHT PANEL (45% width):

Receipt upload area (white card, shape-md, Level 1, 24px padding):
- Upload zone: 200px min height, 2px dashed #E5E5E5 border, shape-sm (8px radius), #FAFAFA background
- Centre: Upload icon (48px, #A3A3A3) + "Drag receipt here or tap to upload" Body Large #525252 + "JPEG, PNG, PDF up to 10MB" Label Small #A3A3A3
- Hover state: 2px dashed #FFCF4B border, #FFFBF0 background
- Active/drop state: 2px solid #FFCF4B border

After upload (replace upload zone):
- Receipt image preview filling the card width, shape-sm corners
- Overlay toolbar (bottom of image, semi-transparent #1A2732 80% bg): ZoomIn, ZoomOut, RotateCw icons (32px touch target each), Delete (Trash2 icon, #DE350B)

OCR status (16px below preview):
- Processing: Spinner icon (animated 300ms) + "Processing receipt..." Body Medium #737373
- Complete: CheckCircle icon (#36B37E) + "Extracted data:" Body Medium
  - Key-value rows: "Vendor" / "Blackwoods" (with confidence dot: green #36B37E = high, yellow #FACC15 = medium, red #DE350B = low)
  - "Date" / "25 Feb 2026" + green dot
  - "Amount" / "$2,450.00" Roboto Mono + green dot
  - "GST" / "$245.00" Roboto Mono + yellow dot (medium confidence, highlighted)
- "Apply to Form" filled button (#FFCF4B, 48px height, full width)

Duplicate warning (conditional, if detected):
- Yellow alert card: #FFF4CC bg, 1px #FACC15 border, shape-sm. AlertTriangle icon (20px #805900) + "Possible duplicate: $2,450.00 from Blackwoods on 23 Feb 2026" Body Small #805900. "View Existing" text button.
```

---

## Screen 6: Job Profitability View

```
Design a job profitability analysis page for a manufacturing ERP called MirrorWorks. This is the key differentiating screen — it answers "did we make money on that job?" with real data.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Job Profitability — /book/job-costs
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Job Costs" active

CONTENT AREA (24px padding):

PAGE HEADER:
- "Job Profitability" Headline Large #1A2732
- "Actual costs vs quoted amounts across all jobs" Body Medium #737373
- Right: Date range picker + "Export" split button (outlined) + Filter icon button

KPI ROW (4 stat cards, equal width, 16px gap):
Card style: white bg, shape-sm (8px), Level 1, 24px padding
Card 1: "Total Revenue" Label Medium #737373 | "$456,780" Roboto Mono Headline Medium (28/36) #1A2732 | "34 completed jobs" Body Small #737373
Card 2: "Total Costs" Label Medium | "$312,450" Roboto Mono Headline Medium | "materials, labour, overhead" Body Small
Card 3: "Average Margin" Label Medium | "31.6%" Headline Medium #36B37E bold | "+2.3% vs last month" badge (shape-full, #E6F7EF bg, #36B37E text, Label Small)
Card 4: "Loss-Making Jobs" Label Medium | "3" Headline Medium #DE350B bold | "$4,200 total loss" Body Small #DE350B

CHARTS ROW (2 charts, 16px gap, white card containers shape-sm Level 1, 24px padding):

Left — "Top 10 Jobs by Profit Margin" Title Medium:
- Horizontal bar chart
- Y-axis: Job IDs in Roboto Mono Code Small (12px), left-aligned
- X-axis: Percentage, Roboto Mono 12px
- Bar colours: #36B37E (margin >15%), #FACC15 (5-15%), #DE350B (<5%)
- Bar height: 24px, 8px gap between bars
- Value label at bar end: Roboto Mono 12px bold

Right — "Customer Profitability" Title Medium:
- Scatter plot
- X-axis: Total Revenue (Roboto Mono 12px), Y-axis: Profit Margin %
- Dot sizes: proportional to number of jobs (legend: "dot size = job count")
- Quadrant colouring: top-right faint #E6F7EF, bottom-right faint #FFF4CC
- Customer name labels on dots, Body Small #525252

DATA TABLE (16px below charts, white card, shape-sm, Level 1):
Header: #F8F7F4 bg, Label Medium uppercase #737373
Columns: [Checkbox] | Job # | Customer | Product | Quoted | Actual Cost | Margin % | Margin $ | Status | [ChevronDown expand]

- Job #: Roboto Mono Code Regular (13/20) #0052CC (clickable link)
- Quoted / Actual / Margin $: Roboto Mono Data Medium (14/20 M500), right-aligned
- Margin % badge: shape-full pill
  - >15%: #E6F7EF bg, #1B7D4F text
  - 5-15%: #FFF4CC bg, #805900 text
  - <5%: #FFE5E5 bg, #DE350B text
- Status: "Complete" #36B37E, "In Production" #0052CC, "On Hold" #FACC15

Row expansion (ChevronDown toggles to ChevronUp):
- Indented sub-table with cost breakdown: Materials, Labour, Overhead, Subcontract, Other
- Each row: Type | Quoted | Actual | Variance (green negative = under budget, red positive = over)
- 4px left border: #FFCF4B on expanded row

SAMPLE DATA (10 rows):
JOB-2026-0012 | Con-form Group | Custom Handrail | $18,500 | $14,230 | 23.1% | $4,270 | Complete
JOB-2026-0011 | Acme Steel | Structural Beam | $12,400 | $11,600 | 6.5% | $800 | Complete
JOB-2026-0010 | Pacific Fab | Tank Assembly | $45,000 | $38,200 | 15.1% | $6,800 | Complete
JOB-2026-0009 | Hunter Steel | Bracket Set | $3,200 | $3,450 | -7.8% | -$250 | Complete
(continue with mix of profitable, marginal, and loss-making)
```

---

## Screen 7: Job Cost Detail (Drill-Down)

```
Design a job cost detail drill-down page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Job Cost Detail — /book/job-costs/JOB-2026-0012
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Job Costs" active

CONTENT AREA (24px padding):

HEADER:
- ArrowLeft icon (20px, clickable) + "JOB-2026-0012" Roboto Mono Headline Small (24/32) #1A2732
- Row below: "Con-form Group" Body Large #525252 + bullet separator + "Custom Handrail Assembly — Level 4" Body Large + "In Production" badge (pill, #E6F0FF bg, #0052CC text)

HERO METRICS (3-column row, white card, shape-md, Level 1, 32px padding):
Left: "Quoted" Label Large #737373 above "$18,500" Roboto Mono Display Small (36/44) #1A2732
Centre: Circular gauge (120px diameter) showing 23.1% margin. Ring: #36B37E filled portion, #E5E5E5 track. "23.1%" Roboto Mono Headline Medium bold centre. "Profit Margin" Label Medium #737373 below.
Right: "Actual to Date" Label Large #737373 above "$14,230" Roboto Mono Display Small #36B37E (green because under budget)
Below gauge: "Under budget by $4,270" Body Medium #36B37E

COST BREAKDOWN TABLE (16px below hero, white card, shape-sm, Level 1, 24px padding):
Title: "Cost Breakdown" Title Medium + Sparkle icon (16px, AI Purple #7C3AED) if AI insight available

Table header: #F8F7F4 bg, Label Medium uppercase
Columns: Cost Type | Budgeted | Actual | Variance | % of Total

Row style: 56px height, 16px padding, 1px #F5F5F5 separator
- "Materials": $8,200 | $7,450 | -$750 (green, ArrowDown icon 12px) | 52% (horizontal bar fill #0052CC)
- "Labour": $6,100 | $4,890 | -$1,210 (green) | 34% (bar fill #36B37E)
- "Overhead": $2,500 | $1,490 | -$1,010 (green) | 10% (bar fill #FACC15)
- "Subcontract": $1,200 | $400 | -$800 (green) | 3% (bar fill #7C3AED)
- "Other": $500 | $0 | -$500 (green) | 0%
- TOTAL row: bold, 2px #1A2732 top border: $18,500 | $14,230 | -$4,270 | 100%

Variance column: Negative (under budget): #36B37E text + ArrowDown icon. Positive (over): #DE350B text + ArrowUp icon.
% of Total: Thin horizontal bar (4px height, shape-full) showing proportion, colour per cost type. Percentage value right of bar.
All financial figures: Roboto Mono Data Medium (14/20 M500)

AI INSIGHT (conditional, if available — 16px below table):
- Card with Siri-gradient border (purple-blue-pink-orange, 2px). Shape-md (12px radius). 16px padding. #FAFAFA bg.
- Sparkle icon (20px, #7C3AED) + "AI Insight" Label Medium #7C3AED
- "Labour costs are 20% under budget. Consider re-quoting similar jobs — your welding team has improved productivity by ~15% this quarter." Body Medium #525252.
- "Dismiss" text button + "Apply to Quoting" tonal button (#F3E8FF bg)

CHARTS ROW (16px below, 2 charts side by side, 16px gap):

Left — "Cost Breakdown" Title Small:
- Donut chart (200px diameter). Segments: Materials #0052CC, Labour #36B37E, Overhead #FACC15, Subcontract #7C3AED. Center: "$14,230" Roboto Mono Title Large.
- Legend below: coloured dot + label + amount, 2 columns

Right — "Cost Over Time" Title Small:
- Line chart. X-axis: weeks/dates. Y-axis: cumulative cost (Roboto Mono 12px).
- Dashed line: Budget burn line (#A3A3A3, 2px dashed)
- Solid line: Actual cumulative cost (#FFCF4B, 2px solid)
- Fill between: green tint where under budget, red tint where over

DETAIL TABS (16px below charts, white card shape-sm Level 1):
Tabs: Materials | Labour | Overhead | Subcontract
Active tab: #FFCF4B underline

Materials tab (default):
- Table: Date | Item | Qty | Unit Cost | Total | PO Reference | Source
- Roboto Mono for Qty, costs, PO ref
- Sample: 15 Feb | 10mm MS Plate AS3678-250 | 50 | $85.00 | $4,250.00 | PO-2026-023 | Blackwoods

Labour tab:
- Table: Date | Operator | Operation | Hours | Rate | Total | Status
- Source: Make module time tracking. "Auto-captured" Label Small #36B37E badge
```

---

## Screen 8: Purchase Orders List

```
Design a purchase order list page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Purchase Orders — /book/purchases
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Purchases" active

CONTENT AREA (24px padding):

PAGE HEADER:
- "Purchase Orders" Headline Large #1A2732
- Right: "New PO" filled button (#FFCF4B, PlusCircle icon)

TOOLBAR: Search (320px) + Filter dropdown + Export split button

TABS: All (89) | Draft (12) | Sent (23) | Partial (8) | Received (41) | Cancelled (5)
Active tab: #FFCF4B underline, #1A2732 text

DATA TABLE (white card, shape-sm, Level 1):
Header: #F8F7F4 bg, Label Medium uppercase
Columns: [Checkbox] | PO # | Vendor | Order Date | Expected Delivery | Status | Total | Job Ref | Match | [Actions]

- PO #: Roboto Mono Code Regular #0052CC
- Total: Roboto Mono Data Medium right-aligned
- Status badges (pill, shape-full):
  Draft #F5F5F5/#737373, Sent #E6F0FF/#0052CC, Acknowledged #E6F0FF/#0052CC, Partial #FFF4CC/#805900, Received #E6F7EF/#1B7D4F, Cancelled #F5F5F5/#A3A3A3
- Match column: Three-way match indicator
  Green CheckCircle (16px #36B37E): PO + Receipt + Bill all matched
  Yellow AlertCircle (16px #FACC15): Partial match
  Grey Circle (16px #D4D4D4): Not yet matched
- Job Ref: Roboto Mono Code Small, optional link

SAMPLE DATA (8 rows):
PO-2026-034 | Blackwoods Steel | 22 Feb | 01 Mar | Sent | $4,850.00 | JOB-2026-0012 | grey
PO-2026-033 | BOC Gas | 20 Feb | 25 Feb | Received | $670.00 | — | green check
PO-2026-032 | OneSteel | 18 Feb | 28 Feb | Partial | $12,300.00 | JOB-2026-0010 | yellow
PO-2026-031 | Kemppi | 15 Feb | 22 Feb | Received | $2,100.00 | — | green check
PO-2026-030 | Dulux Powder Coats | 12 Feb | 19 Feb | Received | $1,450.00 | JOB-2026-0012 | green check
```

---

## Screen 9: Budget Overview

```
Design a budget management dashboard for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Budget Overview — /book/budgets
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Budgets" active

CONTENT AREA (24px padding):

PAGE HEADER:
- "Budgets" Headline Large #1A2732
- Right: Filter dropdown "Type" (All / Job / Department / Annual) + "New Budget" filled button (#FFCF4B)

KPI ROW (3 cards, equal width, 16px gap):
Card 1: "Total Budgeted" Label Medium #737373 | "$890,000" Roboto Mono Headline Medium | "FY 2025-26" Body Small
Card 2: "Total Spent" Label Medium | "$623,400" Roboto Mono Headline Medium | Progress bar below: 70% fill #FFCF4B on #E5E5E5 track, shape-full, 8px height. "70% utilised" Label Small #737373
Card 3: "Remaining" Label Medium | "$266,600" Roboto Mono Headline Medium #36B37E | "5 months remaining" Body Small

CHART (full width, white card shape-sm Level 1, 24px padding, 16px below KPIs):
"Monthly Budget vs Actual" Title Medium
- Grouped bar chart, 12 months on x-axis
- Each month: Budget bar (#E5E5E5 outline, no fill) next to Actual bar (filled)
- Actual bar colours: #36B37E (under 80% of budget), #FACC15 (80-95%), #DE350B (over 95%)
- Y-axis: dollar values Roboto Mono 12px

BUDGET SECTIONS (16px below chart):

Section "Job Budgets" (collapsible, ChevronDown toggle):
- Section header: "Job Budgets" Title Small + count "12" badge (shape-full, #F5F5F5)
- Card grid (2 columns, 16px gap), each card: white bg shape-sm Level 1 16px padding
  - Top row: Job ID (Roboto Mono Code Regular #0052CC) + Customer name Body Medium
  - Middle: "Budget: $18,500" / "Spent: $14,230" / "Remaining: $4,270" — Roboto Mono 14px
  - Progress bar: shape-full 6px height, filled portion coloured by utilisation: green <80%, yellow 80-95%, red >95%
  - Bottom: "77% utilised" Label Small #737373 + Edit pencil icon button (44x44 touch target)

Section "Department Budgets":
- Cards for: Fabrication, Welding, Assembly, Paint, Dispatch
- Same card format as job budgets

Section "Annual Budget":
- Single wide card with sparkline chart showing monthly spend trend
```

---

## Screen 10: Stock Valuation

```
Design a stock valuation page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Stock Valuation — /book/stock-valuation
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Stock Valuation" active

CONTENT AREA (24px padding):

PAGE HEADER:
- "Stock Valuation" Headline Large #1A2732
- Right: Dropdown "Valuation Method" (FIFO / LIFO / Weighted Average, outlined, 40px dense) + Date picker "As at" + "Generate Report" filled button (#FFCF4B)

KPI ROW (3 cards + 1 total, 16px gap):
Card 1: Package icon (24px #0052CC) | "Raw Materials" Label Medium | "$145,600" Roboto Mono Headline Medium | "342 items" Body Small
Card 2: Wrench icon (24px #FACC15) | "Work in Progress" Label Medium | "$89,200" Roboto Mono Headline Medium | "12 jobs" Body Small
Card 3: CheckCircle icon (24px #36B37E) | "Finished Goods" Label Medium | "$67,800" Roboto Mono Headline Medium | "45 items" Body Small
Total card (wider, #1A2732 bg, white text): "Total Inventory Value" Label Medium | "$302,600" Roboto Mono Headline Large white

CHARTS ROW (2 charts, 16px gap):
Left — "Valuation Trend" Title Medium:
- Stacked area chart, 12 months. Raw #0052CC (20% opacity fill), WIP #FACC15 (20%), Finished #36B37E (20%). Roboto Mono 12px axes.

Right — "Current Split" Title Medium:
- Donut chart (200px). Three segments. Centre: "$302,600" Roboto Mono Title Large. Legend below with coloured dots.

TABS: Raw Materials | Work in Progress | Finished Goods | Adjustments
Active: #FFCF4B underline

Raw Materials tab:
- Data table, white card shape-sm Level 1
- Columns: Item | SKU (Roboto Mono) | Qty (Roboto Mono right) | Unit Cost (Roboto Mono right) | Total Value (Roboto Mono right) | Location | Last Movement | Age
- Age column: colour-coded badge
  <30 days: #E6F7EF bg #36B37E text "Fresh"
  30-90 days: #FFF4CC bg #805900 text "Active"
  90-180 days: #FFE5CC bg #CC4400 text "Slow"
  >180 days: #FFE5E5 bg #DE350B text "Stale"
- Sort by Total Value descending default
```

---

## Screen 11: Xero Integration Settings

```
Design a Xero integration settings page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Xero Integration Settings — /book/settings/xero
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Settings" active

CONTENT AREA with settings sub-nav:
Left settings nav (200px, white bg, 1px #E5E5E5 right border):
- "General", "Xero Integration" (active: #FFCF4B left border, #FFFBF0 bg, bold), "Account Mapping", "Tax", "Approvals", "Export"

RIGHT CONTENT (960px, 24px padding):

HEADER: "Xero Integration" Headline Small + "Connect MirrorWorks to your Xero account" Body Medium #737373

CONNECTION CARD (white, shape-md 12px radius, Level 1, 24px padding):
Connected state:
- Left: Xero logo (32px) + "Connected to Con-form Group Pty Ltd" Title Medium #1A2732 + "Connected since 15 Jan 2026" Body Small #737373 + green dot (8px #36B37E)
- Right: "Disconnect" outlined button (#DE350B text, 40px height)

SYNC CONFIGURATION (white card, shape-sm, Level 1, 24px padding, 16px below):
Title: "Sync Entities" Title Medium

Table layout (no borders, 56px row height):
Columns: Entity | Push to Xero | Pull from Xero | Last Sync | Status

- "Invoices" Body Medium | Toggle ON (#FFCF4B) | Toggle ON | "2 min ago" Label Small | green dot 8px
- "Expenses (as Bills)" | Toggle ON | "—" | "5 min ago" | green dot
- "Purchase Orders" | Toggle ON | "—" | "1 hr ago" | green dot
- "Manual Journals (WIP)" | Toggle ON | "—" | "Yesterday" | yellow dot #FACC15
- "Chart of Accounts" | "—" | Toggle ON | "Today 9:00 AM" | green dot
- "Reports (P&L, BS)" | "—" | Toggle ON | "Today 9:00 AM" | green dot

Toggle switches: 36px wide, 20px height. OFF: #E5E5E5 track. ON: #FFCF4B track with white circle.

Below table: "Sync Frequency" dropdown (outlined, 40px dense): Real-time | Every 15 min | Hourly | Daily

MANUAL SYNC (white card, shape-sm, Level 1, 16px padding, 16px below):
Row: "Sync Now" filled button (#FFCF4B, RefreshCw icon 16px, 40px height) + "Full Re-sync" outlined button + "Last full sync: 20 Feb 2026, 09:00 AM" Label Small #737373

SYNC LOG (white card, shape-sm, Level 1, 24px padding, 16px below):
Title: "Recent Sync Activity" Title Small + "View All" text button right-aligned

Mini table (5 rows, compact):
Columns: Time | Entity | Direction | Status | Error
- Time: Label Small #737373
- Direction badges: "Push" pill (#E6F0FF bg), "Pull" pill (#E6F7EF bg)
- Status: "Synced" green dot, "Failed" red dot + error message truncated
- Show 1 failed entry with red row tint (#FFE5E5) and error message: "Xero rate limit exceeded — retry scheduled"

ERROR BANNER (top of page, conditional):
#FFE5E5 bg, 1px #DE350B border, shape-sm. AlertTriangle icon (20px #DE350B) + "3 items failed to sync" Body Medium #DE350B + "View Errors" text button.
```

---

## Screen 12: Account Mapping Settings

```
Design an account mapping settings page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Account Mapping — /book/settings/account-mapping
FRAME: 1440x1024px, #F8F7F4 background
Settings sub-nav with "Account Mapping" active

CONTENT (960px, 24px padding):

HEADER: "Account Mapping" Headline Small + "Map MirrorWorks categories to Xero account codes" Body Medium #737373

WARNING BANNER (if unmapped items exist):
#FFF4CC bg, 1px #FACC15 border, shape-sm, 16px padding. AlertTriangle icon (20px #805900) + "8 categories not yet mapped. Unsynced items will be skipped." Body Medium #805900.

"Refresh from Xero" outlined button (RefreshCw icon 16px, right-aligned, 40px height)

SECTION: "Revenue Accounts" Title Small, 16px below banner
Two-column mapping rows (white card shape-sm Level 1, no cell borders, 56px row height, 16px padding):
Left column header: "MirrorWorks Category" Label Medium #737373
Right column header: "Xero Account" Label Medium #737373

Row: "Sales Revenue" Body Medium | Dropdown [200 — Sales] with account code in Roboto Mono 13px + account name
Row: "Service Revenue" | Dropdown [210 — Service Revenue]

SECTION: "Cost of Goods Sold" Title Small, 24px above
Row: "Raw Materials" | Dropdown [310 — Raw Materials]
Row: "Direct Labour" | Dropdown [320 — Direct Labour]
Row: "Manufacturing Overhead" | Dropdown [330 — Manufacturing Overhead]
Row: "Subcontractor Costs" | Dropdown [340 — Subcontractor Costs]

SECTION: "Operating Expenses"
Row: "Utilities" | Dropdown [410 — Utilities]
Row: "Maintenance & Repairs" | Dropdown [420 — Repairs & Maintenance]
Row: "Consumables" | Dropdown [430 — Consumables]
Row: "Office Supplies" | Dropdown [461 — Office Expenses]

SECTION: "Balance Sheet"
Row: "Work in Progress" | Dropdown [630 — WIP]
Row: "Finished Goods" | Dropdown [640 — Finished Goods]

SECTION: "Tracking Categories" Title Small
Row: "Job Number" | Dropdown [Job / Department / None] — currently "Job"
Row: "Department" | Dropdown [Job / Department / None] — currently "Department"
Helper text: "Xero supports up to 2 tracking categories. These enable job-level P&L filtering." Body Small #737373

BUTTONS (bottom, 24px above):
"Save Mappings" filled button (#FFCF4B, 48px height) + "Reset to Defaults" outlined button
```

---

## Screen 13: Reports Gallery

```
Design a reports gallery page for a manufacturing ERP called MirrorWorks.

[Paste DESIGN SYSTEM CONTEXT BLOCK above]

SCREEN: Reports Gallery — /book/reports
FRAME: 1440x1024px, #F8F7F4 background
SIDEBAR: Same sidebar with "Reports" active

CONTENT (24px padding):

HEADER:
- "Reports" Headline Large #1A2732
- "Financial reports and manufacturing analytics" Body Medium #737373
- Right: "Schedule Report" outlined button (Calendar icon) + "Custom Report" filled (#FFCF4B, Sparkle icon)

SECTION: "From Xero" Title Medium + Xero logo inline (16px)
Card grid (3 columns, 16px gap). Cards: white bg, shape-sm, Level 1, 24px padding. Left border: 3px #13B5EA (Xero blue).
Each card: Icon (32px, #1A2732) top, report name Title Small below, description Body Small #737373, "Generate" outlined button (40px height) bottom-right.

1. BarChart3 icon | "Profit & Loss" | "Income statement with job-level tracking via Xero"
2. PieChart icon | "Balance Sheet" | "Financial position snapshot at any date"
3. FileText icon | "BAS Report" | "Business Activity Statement (AU only)"
4. Clock icon | "Aged Receivables" | "Outstanding invoices by customer age"
5. Clock icon | "Aged Payables" | "Outstanding bills by supplier age"
6. Scale icon | "Trial Balance" | "Account balances from Xero"

"Powered by Xero" Label Small #A3A3A3 below each card

SECTION: "MirrorWorks Reports" Title Medium (24px above)
Card grid (3 columns, 16px gap). Cards: white bg, shape-sm, Level 1, 24px padding. Left border: 3px #FFCF4B.

1. TrendingUp icon | "Job Profitability" | "Revenue vs costs per job with margin drill-down"
2. Users icon | "Customer Profitability" | "Aggregated profitability by customer"
3. DollarSign icon | "Cost Analysis" | "Material, labour, overhead trends over time"
4. Target icon | "Budget vs Actual" | "Variance analysis by job, department, or period"
5. Wrench icon + Sparkle icon (AI Purple) | "WIP Report" | "Current work-in-progress valuation with aging" + AI badge
6. Receipt icon | "Expense Report" | "Expenses by category, employee, job, or period"

SECTION: "Scheduled Reports" Title Medium (24px above)
White card shape-sm Level 1, 16px padding. Compact data table:
Columns: Report Name | Schedule | Recipients | Last Run | Next Run | Active
- Schedule: badge (Daily: #E6F0FF, Weekly: #E6F7EF, Monthly: #FFF4CC)
- Recipients: email pill badges (shape-full, #F5F5F5 bg, Label Small)
- Active: Toggle switch

Sample: "Job Profitability" | Weekly | matt@mirrorworks.io | 19 Feb | 26 Feb | ON
"Expense Report" | Monthly | cormac@mirrorworks.io, matt@mirrorworks.io | 01 Feb | 01 Mar | ON
```

---

## Screen 14: Book Settings (Multi-Panel)

**Purpose:** Comprehensive settings interface for the Book module. Follows the same left-nav/right-panel UX pattern established in the Sell module settings page.

**Reference:** Images 1 (Acme Inc. white-background settings with Plan Usage sidebar) and Images 2–12 (Odoo accounting configuration panels — use as functional reference only, not visual).

```
DESIGN SYSTEM: MirrorWorks UI Design System v2.0.0

COLOUR PALETTE (60-30-10 rule):
60% MAIN: #FFFFFF (white), #F8F7F4 (off-white backgrounds)
30% SECONDARY: #1A2732 (MW Mirage — text, headings, icons)
10% ACCENT: #FFCF4B (MW Yellow — CTAs, active states, highlights)

Yellow scale: 50 #FFFBF0, 100 #FFF3D6, 200 #FFE8AD, 300 #FFDB7A, 400 #FFCF4B (PRIMARY), 500 #F2BF30 (pressed), 600 #E6A600 (hover), 700 #CC8E00, 800 #A67300, 900 #805900
Neutral scale: 50 #FAFAFA, 100 #F5F5F5, 200 #E5E5E5 (borders), 300 #D4D4D4, 400 #A3A3A3 (placeholder), 500 #737373 (secondary text), 600 #525252 (body), 700 #404040, 800 #262626 (headings), 900 #171717
Anchor colours (card backgrounds): Earth #8FA6A6, Saddle #A68060, Sea Foam #7B9386
Semantic: Success #36B37E, Info #0052CC, Warning #FACC15, Error #DE350B
AI features: AI Purple #7C3AED, Siri-gradient border (purple-blue-pink-orange) for AI insights

TYPOGRAPHY (Material Design 3 type scale, Roboto + Roboto Mono):
Display: Large 57/64 R400, Medium 45/52 R400, Small 36/44 R400
Headline: Large 32/40 R400, Medium 28/36 R400, Small 24/32 R400
Title: Large 22/28 R400, Medium 16/24 M500 tracking 0.15px, Small 14/20 M500 tracking 0.1px
Body: Large 16/24 R400 tracking 0.5px, Medium 14/20 R400 tracking 0.25px, Small 12/16 R400 tracking 0.4px
Label: Large 14/20 M500 tracking 0.1px, Medium 12/16 M500 tracking 0.5px, Small 11/16 M500 tracking 0.5px
Roboto Mono: Data Medium 14/20 M500 (table values, amounts), Code Regular 13/20 R400 (IDs, codes), Code Small 12/16 R400 (serial numbers)

SPACING (4px base grid, 8px rhythm):
space-1: 4px, space-2: 8px, space-3: 12px, space-4: 16px, space-5: 20px, space-6: 24px, space-8: 32px, space-10: 40px, space-12: 48px, space-16: 64px

SHAPE (M3 shape scale):
shape-none: 0px, shape-xs: 4px (chips, small), shape-sm: 8px (cards, inputs, containers), shape-md: 12px (panels, modals, large cards), shape-lg: 16px (sheets), shape-xl: 24px (hero cards), shape-full: 9999px (pills, avatars)

BORDERS:
Default: 1px #E5E5E5. Focus/Active: 2px #FFCF4B. Error: 2px #DE350B. Dividers: 1px #E5E5E5.

ELEVATION:
Level 0: none (base). Level 1: 0 1px 2px 0 rgba(0,0,0,0.05) (cards, inputs). Level 2: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) (buttons, hover cards). Level 3: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) (popovers, menus). Level 4: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) (modals, dialogs).

BUTTONS (M3 types):
Filled (Primary): #FFCF4B background, #1A2732 text, shape-xs (4px radius), Label Large 14/20 M500. Hover: #E6A600. Pressed: #F2BF30.
Outlined (Secondary): transparent bg, 1px #E5E5E5 border, #1A2732 text. Hover: #F5F5F5 fill.
Text (Tertiary): transparent, #1A2732 text. Hover: 8% overlay.
Tonal: #FFF3D6 background, #1A2732 text.
Elevated: white bg + Level 2 shadow.
Icon buttons: 44x44px touch target minimum, 2px stroke Lucide icons.
Extended FAB: #FFCF4B, icon + label, Level 3 shadow, shape-lg (16px radius).

INPUTS:
Height: 56px (default), 40px (dense). Padding: 16px horizontal. Label: 14px M500, 8px above field. Helper text: 12px R400, 4px below field. Spacing between fields: 16px. Outlined variant: 4px radius all corners. Focus: 2px MW Yellow border. Error: 2px #DE350B border. Selected checkbox fill: #FFCF4B.

NAVIGATION:
Sidebar: 256px width collapsible. Active item: #FFCF4B left border, #FFFBF0 background.
Tabs: MW Yellow underline indicator on active tab.

CARDS (M3):
Default: white bg, 8px radius, Level 1 shadow, 1px #E5E5E5 border. Padding: 16px compact, 24px standard.
Hover: Level 2 shadow. Content order: Header > Supporting text > Media > Actions.
Touch targets: minimum 44x44px interactive, 48x48px for tablet.
State layers: 8% overlay on hover, 12% on press.
Gap between card elements: 8px. Between sections: 16px. Between action buttons: 12px.

DATA TABLES:
Row height: min 56px. Alternating row backgrounds: white / #F5F5F5. Monospace (Roboto Mono M500 14px) for numeric values and IDs. Right-align financial figures. Status badges: rounded pills (shape-full).

ICONS: Lucide React, 2px stroke weight. Sizes: 16px (inline), 20px (default), 24px (nav), 32px (feature cards), 48px (hero).

TERMINOLOGY: "Shop" not "facility". "Operator" not "user". "Job" not "project". "Machine" not "asset". "Set up" not "onboard".

BRAND VOICE: Confident, direct, practical. No buzzwords. "Built by people who work in shops."

---

SCREEN 14: BOOK SETTINGS PAGE (General Panel — Default View)

Design a settings page for the Book (finance) module of a manufacturing ERP called MirrorWorks. This follows the established MW Sell module settings pattern: white background, left settings navigation panel, right content area.

OVERALL LAYOUT (1440px viewport):
- Top bar: 56px height, white, shadow Level 1. Left: hamburger icon + "MirrorWorks" logotype. Right: notification bell + avatar circle.
- Below top bar: Module sidebar (256px, collapsible) on left. "Book" module active with #FFCF4B left border. Nav items: Dashboard, Invoices, Expenses, Purchase Orders, Job Costs, Budgets, Stock Valuation, Reports, Settings (active).
- Main content area: Breadcrumb "Home > Book > Settings" at top, then split into Settings Nav (240px left) + Panel Content (remaining width right).

LEFT SETTINGS NAVIGATION (inside content area, not the main sidebar):
- 240px wide panel with white background, 1px #E5E5E5 right border.
- Label at top: "Settings" in Title Medium (16/24 M500).
- Vertical nav list with Lucide icons (20px, #525252) + label (14px M500 Roboto, #525252). 40px item height, 16px left padding. 8px vertical gap between items.
- Active item: 3px #FFCF4B left border, #FFFBF0 background, #1A2732 text.
- Hover: #F5F5F5 background.

Navigation items (top to bottom):
1. Settings icon (Cog) + "General" — ACTIVE
2. FileText icon + "Invoicing"
3. Link icon + "Accounting Integration"
4. GitMerge icon + "Account Mapping"
5. Percent icon + "Tax"
6. ShieldCheck icon + "Approvals"
7. Scan icon + "OCR & Automation"
8. Calculator icon + "Cost Rates"
9. Download icon + "Export"

Below nav items (at bottom of left panel): Plan Usage card.
- Light card with 1px #E5E5E5 border, 12px radius, 16px padding.
- Header: "Produce" in a #FFCF4B pill badge (shape-full, 8px horizontal padding, 11px M500 text).
- Three usage rows, each: label (12px M500 #525252) + progress bar below.
  - "375 / 500 Contacts" — black bar at 75% on #E5E5E5 track (4px height, shape-full).
  - "50 / 100 Invoices" — black bar at 50%.
  - "50 / 100 Expenses" — black bar at 50%.
- "Renewal Date: Oct 3, 2026" in 12px R400 #A3A3A3.
- "Upgrade plan" text link in 12px M500 #0052CC with ExternalLink icon (12px).

RIGHT CONTENT PANEL (showing General panel):

Top action bar: Right-aligned. "Discard" text button (#525252, 14px M500) + "Save changes" filled button (#FFCF4B, #1A2732 text, 40px height, disabled state with 40% opacity until changes are made).

SECTION 1: "Organisation Defaults"
Section heading: 12px M500 #A3A3A3 uppercase, tracking 0.5px. 1px #E5E5E5 divider below, 16px spacing before first field.

Three form fields in vertical stack:
1. "Organisation name" label + outlined input (56px height, 4px radius) showing "Acme Metal Fabrication Pty Ltd" with a Lock icon (16px, #A3A3A3) inside right side. Read-only (greyed background #F5F5F5).
2. "Default currency" label + outlined dropdown showing "AUD — Australian Dollar" with ChevronDown icon. Full width.
3. "Fiscal year end" label + two fields inline (50/50 width, 8px gap): Month dropdown showing "June" + Day number input showing "30".

SECTION 2: "Document Numbering"
Same section heading style. 32px gap from previous section.

2x2 grid of form fields (50/50 width, 16px gap):
- Top left: "Invoice prefix" text input showing "INV-". Below field: "Preview: INV-2026-0047" in 12px R400 Roboto Mono #A3A3A3.
- Top right: "Expense prefix" text input "EXP-". Preview: "EXP-2026-0123".
- Bottom left: "PO prefix" text input "PO-". Preview: "PO-2026-0089".
- Bottom right: "Credit note prefix" text input "CN-". Preview: "CN-2026-0005".

SECTION 3: "Lock Date"
Same section heading style.

- "Lock date" label + Date picker input showing "31 Jan 2026" with Calendar icon.
- Helper text: "Transactions dated before this date cannot be created or edited." in 12px R400 #737373.
- "Lock applies to" label + row of four checkboxes (M3 style, 18x18px checkbox, #FFCF4B fill when checked, 14px label):
  [x] Invoices   [x] Expenses   [x] Purchase Orders   [ ] Journals

SECTION 4: "Dashboard"
Same section heading style.
Subtitle below: "Choose which cards appear on the Book dashboard." in 14px R400 #525252.

Two-column checkbox grid (8 items, 4 per column):
Left column:
  [x] Total revenue
  [x] Outstanding invoices
  [x] Profit margin
  [x] Cash flow
Right column:
  [ ] Overdue invoices
  [ ] WIP valuation
  [x] Expenses this month
  [ ] Budget utilisation

Below checkboxes: "Update dashboard" outlined button (40px height).

DESIGN NOTES:
- This is a CLEAN WHITE settings page. No dark backgrounds.
- No card containers around sections — use section headings with dividers to separate groups.
- Form fields use the outlined variant (4px radius, 1px #E5E5E5 border, 56px height).
- Content area has 32px padding from the left nav border and 32px right padding.
- Maximum content width: 720px (don't stretch form fields to full width on wide screens).
- The left settings nav and Plan Usage card are always visible regardless of which panel is active.
- Scrolling: only the right content panel scrolls. Left nav and module sidebar are fixed.
```

---

## Notes for Figma Make Usage

1. **Generate one screen at a time.** Each prompt is self-contained with the design system context block.
2. **Extract reusable components after Screen 1:** Sidebar, top bar, stat card, data table row, status badge, action button group. Use these as Figma components for subsequent screens.
3. **Responsive variants:** These prompts target 1440px desktop. For mobile (375px): collapse sidebar to hamburger menu, stack cards vertically, full-width tables with horizontal scroll.
4. **Dark mode:** Not specified here. Create dark variants after establishing light mode by swapping: #FFFFFF to #1A2732, #F8F7F4 to #262626, #1A2732 text to #FAFAFA, #FFCF4B stays the same.
5. **Accessibility:** All colour pairs meet WCAG AA contrast. Verify: #1A2732 on #FFFFFF (17.2:1), #1A2732 on #FFCF4B (8.7:1), #737373 on #FFFFFF (4.7:1).
6. **Brand voice in UI copy:** Use "Shop" not "facility", "Job" not "project", "Machine" not "asset", "Set up" not "onboard". Keep button labels direct: "Create Job" not "Begin New Project".
