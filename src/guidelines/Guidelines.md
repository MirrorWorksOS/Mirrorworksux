# MirrorWorks Smart FactoryOS — Figma Make Guidelines

## 1. Project Goals

MirrorWorks is an AI-native manufacturing ERP for metal fabrication SMEs (10–100 employees). The product is called **Smart FactoryOS**. It replaces legacy ERPs (JobBOSS, E2 Shop, Fulcrum Pro) and Excel/spreadsheet chaos with a purpose-built platform at 80–90% lower cost.

**Primary users:** Shop owners, production managers, estimators, operators, warehouse staff, office managers, accountants.

**Primary environment:** Factory offices and shop floors. Interfaces must work on desktop monitors, wall-mounted displays, and tablets at packing stations — in industrial lighting, with gloved hands.

**Design north star:** An operator who has never used an ERP can complete their first task in under 2 minutes without training.

**Target launch:** April 2026. Australia first, ASEAN Phase 2.

---

## 2. Core Module Documentation

The application has 8 modules following the manufacturing lifecycle. Full specifications live in Confluence:

| Module      | Purpose                                                                         | Confluence Space                                                                  |
| ----------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Sell**    | CRM, opportunities, quoting, orders, invoicing, product catalogue               | [Sell folder](https://mirrorworks.atlassian.net/wiki/spaces/ap/folder/11763719)   |
| **Plan**    | Job creation, scheduling, material planning, budgets                            | [Plan folder](https://mirrorworks.atlassian.net/wiki/spaces/ap/folder/11763715)   |
| **Make**    | Shop floor execution, time tracking, quality control, machine monitoring        | [Make folder](https://mirrorworks.atlassian.net/wiki/spaces/ap/folder/11272210)   |
| **Ship**    | Fulfilment, packing, carrier management, tracking, returns, warehouse           | [Ship folder](https://mirrorworks.atlassian.net/wiki/spaces/ap/folder/11272213)   |
| **Book**    | Job costing, invoicing, expenses, budgets, stock valuation, Xero integration    | [Book folder](https://mirrorworks.atlassian.net/wiki/spaces/ap/folder/11272197)   |
| **Buy**     | Procurement, RFQs, purchase orders, goods receipts, supplier management         | [Buy folder](https://mirrorworks.atlassian.net/wiki/spaces/ap/folder/11272200)    |
| **Control** | Organisation setup, users, roles, machines, inventory master data               | [Control folder](https://mirrorworks.atlassian.net/wiki/spaces/ap/pages/92667905) |
| **Design**  | Onboarding wizard — factory layout, process builder, role designer, data import | (Spec in progress)                                                                |

**Key cross-module documents:**

- [Access Rights & Permissions Model](https://mirrorworks.atlassian.net/wiki/spaces/ap/pages/91717634)
- [Knowledge Base articles (KB 01–07)](https://mirrorworks.atlassian.net/wiki/spaces/ap/pages/92405761)

---

## 3. General Rules

- Only use absolute positioning when necessary. Default to flexbox and CSS grid.
- Keep components modular. One component per file. Helper functions in separate files.
- Keep file sizes under 500 lines. Split large screens into tab components.
- Use sentence case for all UI text. Never all-caps except inside status badges.
- Date format: "Mar 25" (short month + day). Never "2026-03-25" or "25/03/2026" in the UI.
- Currency format: "$24,500.00" with comma separators. Always display in Roboto Mono.
- Job number format: "MW-001" prefix style. Always display in JetBrains Mono.
- Use Australian/UK English in all UI copy ("Organisation" not "Organization", "Colour" not "Color"). Note: database columns use US English ("organization_id").
- Never use placeholder text like "Lorem ipsum". Use realistic manufacturing data: steel grades, part names, machine types, Australian supplier names.

---

## 4. Typography System

Reference: [Material Design 3 Typography](https://m3.material.io/styles/typography/overview)

### Font Stack

| Role              | Font                                    | Usage                                                              |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------ |
| Primary UI        | Geist (Regular, Medium, SemiBold, Bold) | All body text, labels, headings, buttons                           |
| Financial figures | Roboto Mono                             | Currency values, percentages, totals — anywhere money is displayed |
| IDs and codes     | JetBrains Mono                          | Job numbers (MW-001), PO numbers, invoice numbers, SKUs            |

### M3 Type Scale (from globals.css)

| Role            | Size | Line Height | Weight | Tracking | Use                                           |
| --------------- | ---- | ----------- | ------ | -------- | --------------------------------------------- |
| Display Large   | 57px | 64px        | 400    | -0.25px  | Hero numbers on dashboards (rare)             |
| Display Medium  | 45px | 52px        | 400    | 0px      | —                                             |
| Display Small   | 36px | 44px        | 400    | 0px      | —                                             |
| Headline Large  | 32px | 40px        | 400    | 0px      | Page titles ("Jobs", "Invoices", "Dashboard") |
| Headline Medium | 28px | 36px        | 400    | 0px      | Section headers                               |
| Headline Small  | 24px | 32px        | 400    | 0px      | Card titles, modal titles                     |
| Title Large     | 22px | 28px        | 400    | 0px      | —                                             |
| Title Medium    | 16px | 24px        | 500    | 0.15px   | Sidebar group labels, card section headers    |
| Title Small     | 14px | 20px        | 500    | 0.1px    | —                                             |
| Body Large      | 16px | 24px        | 400    | 0.5px    | Primary body text, form inputs                |
| Body Medium     | 14px | 20px        | 400    | 0.25px   | Table body text, descriptions                 |
| Body Small      | 12px | 16px        | 400    | 0.4px    | Captions, timestamps, metadata                |
| Label Large     | 14px | 20px        | 500    | 0.1px    | Buttons, form labels, table headers           |
| Label Medium    | 12px | 16px        | 500    | 0.5px    | Badge text, chip text                         |
| Label Small     | 11px | 16px        | 500    | 0.5px    | Tiny labels (rarely used)                     |

### Rules

- KPI stat card labels: Geist Medium, 13px, `#737373`
- KPI stat card values: Roboto Mono, 24px, semibold, `#0A0A0A`
- KPI stat card subtitles: Geist Regular, 12px, `#737373`
- Table headers: Geist Medium, 12px, `#737373`, uppercase tracking
- Table body: 14px, `#0A0A0A`
- Kanban card titles: Geist Medium, 15px, `#0A0A0A`
- Kanban card descriptions: Geist Regular, 13px, `#737373`, line-clamp-2

---

## 5. Colour System

### Brand

| Token           | Hex       | Usage                                                               |
| --------------- | --------- | ------------------------------------------------------------------- |
| MW Yellow       | `#FFCF4B` | Primary CTA buttons, active states, AI highlights, MW Yellow badges |
| MW Yellow Hover | `#EBC028` | Hover state for Yellow CTAs                                         |
| MW Yellow BG    | `#FFFBF0` | Subtle yellow tinted backgrounds                                    |

### Neutrals

| Token       | Hex       | Usage                                         |
| ----------- | --------- | --------------------------------------------- |
| Near Black  | `#0A0A0A` | Primary text, headings                        |
| Dark Grey   | `#2C2C2C` | Secondary text, CTA text on yellow buttons    |
| Medium Grey | `#737373` | Tertiary text, icons, captions, table headers |
| Light Grey  | `#E5E5E5` | Borders, dividers                             |
| BG Grey     | `#F5F5F5` | Input backgrounds, subtle card backgrounds    |
| BG Light    | `#FAFAFA` | Page backgrounds, Kanban column backgrounds   |
| White       | `#FFFFFF` | Card backgrounds, content areas               |

### Status

| Token   | Hex       | Light Variant | Usage                                       |
| ------- | --------- | ------------- | ------------------------------------------- |
| Success | `#36B37E` | `#E3FCEF`     | Completed, Produced, On Track, Low priority |
| Warning | `#FF8B00` | `#FFEDD5`     | Warning, High priority, Monitor             |
| Error   | `#EF4444` | `#FEE2E2`     | Error, Urgent, Overdue, Over Budget         |
| Info    | `#0A7AFF` | `#DBEAFE`     | Scheduled, Info, Sent, In Progress          |

### Priority Badge Colours

| Priority | Background | Text      |
| -------- | ---------- | --------- |
| Low      | `#36B37E`  | White     |
| Medium   | `#FFCF4B`  | `#2C2C2C` |
| High     | `#FF8B00`  | White     |
| Urgent   | `#EF4444`  | White     |

### Status Dot Colours (inline indicators, as in the Products table screenshot)

- Red dot: Urgent / Overdue / Error
- Yellow/Amber dot: Pending / In Progress / Warning
- Green dot: Completed / On Track / Success
- Blue dot: Scheduled / Info

### Brand system (Figma source)

[MirrorWorks UI Design System](https://www.figma.com/make/wWEWikOK5H9lhoKjAf1ouu/MirrorWorks-UI-Design-System?p=f&t=y38TaYvugLHEr21r-0)

---

## 6. Grid System

- Base unit: 8px. All spacing should be multiples of 8.
- Page padding: 24px (`p-6`)
- Card padding: 24px (`p-6`)
- Gap between cards: 16px (`gap-4`)
- Gap between sections: 24px (`space-y-6`)

### Layout Grid

| Breakpoint            | Grid                             | Content Width                   |
| --------------------- | -------------------------------- | ------------------------------- |
| Desktop (1440px+)     | 12-column, 3-column for KPI rows | Full width within sidebar inset |
| Tablet (768px–1439px) | 2-column for KPI rows            | Full width                      |
| Mobile (<768px)       | 1-column                         | Full width                      |

### Page Structure

```
SidebarProvider
├── Sidebar (256px expanded, collapsible)
│   ├── SidebarHeader (org switcher)
│   ├── SidebarContent (module nav groups)
│   └── SidebarFooter (dark mode toggle, user avatar)
└── SidebarInset
    ├── Top bar (flex justify-between, h-14)
    │   ├── Left: SidebarTrigger + Breadcrumb
    │   └── Right: Search, Notifications, Avatar
    └── Content area (p-6 space-y-6)
        ├── KPI row (grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4)
        ├── Chart row (grid grid-cols-1 lg:grid-cols-2 gap-4)
        └── Table/content area
```

### Sidebar

- Expanded width: 256px
- Module groups are collapsible (Sell, Plan, Make, Ship, Book, Buy, Control, Design)
- Active item has highlighted background
- Sub-items indented within collapsible group
- Org switcher at the top with ChevronsUpDown icon
- Footer: dark mode toggle, user avatar with role

---

## 7. Motion & Animation

Reference: [M3 Motion](https://m3.material.io/styles/motion/overview/how-it-works) | [Animate UI](https://animate-ui.com/docs/components)

### Duration Scale

| Speed     | Duration | Use                                        |
| --------- | -------- | ------------------------------------------ |
| Instant   | 0ms      | Immediate state changes                    |
| Fast      | 150ms    | Hover, active, small state changes         |
| Medium    | 300ms    | Opacity transitions, label changes         |
| Standard  | 400ms    | Sidebar expand/collapse, panel transitions |
| Slow      | 500ms    | Emphasis animations                        |
| Luxurious | 700ms    | Parallax effects, complex transitions      |

### Easing Curves

| Name                  | Curve                                  | Use                                  |
| --------------------- | -------------------------------------- | ------------------------------------ |
| Standard              | `cubic-bezier(0.2, 0.0, 0, 1.0)`       | General transitions                  |
| Decelerate            | `cubic-bezier(0.0, 0.0, 0, 1.0)`       | Elements entering screen             |
| Accelerate            | `cubic-bezier(0.3, 0.0, 1.0, 1.0)`     | Elements leaving screen              |
| Emphasized Decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1.0)`    | Luxurious enter (modals, sheets)     |
| Emphasized Accelerate | `cubic-bezier(0.3, 0.0, 0.8, 0.15)`    | Quick exit                           |
| Sidebar Panel         | `cubic-bezier(0.75, 0, 0.25, 1)`       | Sidebar expand/collapse              |
| Sidebar Content       | `cubic-bezier(0.7, -0.15, 0.25, 1.15)` | Content area parallax with overshoot |

### Rules

- Card hover: `hover:shadow-md transition-shadow duration-150`
- Button colour transitions: 200ms with easeOut
- Sidebar collapse: 400ms with parallax (panel and content use different curves for depth)
- Modal enter: 500ms with Emphasized Decelerate
- List items stagger: 50ms between children
- Never animate on first paint. Only on user interaction or data updates.
- Kanban drag-and-drop: use optimistic updates (move card instantly, roll back on server error)

### Animate UI Components

Reference: [Animate UI Icons](https://animate-ui.com/docs/icons) | [Animate UI Components](https://animate-ui.com/docs/components)

Use Animate UI for:

- Icon transitions on state change (e.g., menu to X, play to pause)
- Micro-interactions on button press
- Skeleton loaders while data loads

---

## 8. Icon System

Reference: [Animate UI Icons](https://animate-ui.com/docs/icons)

- Primary icon library: **Lucide React**
- Icon size: 20px (w-5 h-5) for inline, 24px (w-6 h-6) for standalone
- Icon colour: `#737373` (medium grey) default, `#0A0A0A` for active/emphasis
- Stroke width: 1.5px (Lucide default)
- KPI card icons: Placed in a 40x40px coloured circle background (colour matches the status/category)

### Module Sidebar Icons

| Module  | Icon        |
| ------- | ----------- |
| Sell    | DollarSign  |
| Plan    | GitBranch   |
| Make    | Bot         |
| Ship    | Truck       |
| Book    | BookOpen    |
| Buy     | ShoppingBag |
| Control | Settings2   |
| Design  | Frame       |

### Common Action Icons

| Action     | Icon        |
| ---------- | ----------- |
| Create/Add | Plus        |
| Search     | Search      |
| Filter     | Filter      |
| Export     | Download    |
| Share      | Share2      |
| Edit       | Pencil      |
| Delete     | Trash2      |
| Settings   | Settings    |
| View       | Eye         |
| Expand     | ChevronDown |
| Refresh    | RefreshCw   |
| AI/Insight | Sparkles    |
| Close      | X           |

---

## 9. Card System

Reference: [M3 Cards](https://m3.material.io/components/cards/guidelines)

### Card Base

```
bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow duration-150
```

### Card Types

**KPI Stat Card** — Used in dashboard top rows.

- 40x40px icon circle (top-left), change badge (top-right)
- Label: 13px Geist Medium `#737373`
- Value: 24px Roboto Mono semibold `#0A0A0A`
- Subtitle: 12px Geist Regular `#737373`
- Optional: progress bar (h-2, rounded-full, `#F5F5F5` track, coloured fill)

**Action Card** — Used in dashboard bottom rows.

- Title in Geist SemiBold 16px, count badge in MW Yellow
- List of items on `#FAFAFA` background with hover `#F5F5F5`

**Kanban Card** — Used in pipeline views.

- ID in JetBrains Mono 14px bold
- Title in Geist Medium 15px
- Description in Geist Regular 13px `#737373`, line-clamp-2
- Priority badge, value in Roboto Mono, avatar, due date
- Click to open detail

**Product/Entity Card** — Used in grid views (CRM, Products).

- Image or icon area at top
- Name, ID/SKU, key metric, status badge
- Click to open detail

**AI Insight Card** — Used in Intelligence Hub and Budget tabs.

- Sparkle icon in MW Yellow next to title
- Natural language body text
- "Updated X ago" caption with refresh button

### Rules

- Maximum 6 KPI cards per row on desktop (use grid cols-3 or cols-6)
- Cards should never have more than one primary CTA inside them
- Kanban cards are compact. No multi-line descriptions beyond 2 lines.
- Card hover lifts shadow. Never change background colour on card hover.
- rounded-lg (8px) for standard cards. rounded-xl (12px) for modal dialogs.

---

## 10. Button System

Reference: [M3 Buttons](https://m3.material.io/components/buttons/guidelines)

### Variants

**Primary (Filled)**

- `bg-[#FFCF4B] hover:bg-[#EBC028] text-[#2C2C2C] font-medium`
- One primary button per section. Used for the main action: "New Job", "Create Invoice", "Save".
- Minimum height: 40px on desktop, 56px on shop floor views.

**Outline (Secondary)**

- `border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] text-[#0A0A0A]`
- For supporting actions: "Export", "Filter", "Cancel".

**Ghost (Tertiary)**

- `hover:bg-[#F5F5F5] text-[#737373]`
- For low-emphasis actions: icon-only buttons, toolbar toggles.

**Destructive**

- `bg-[#EF4444] hover:bg-[#DC2626] text-white`
- For irreversible actions: "Delete", "Void", "Cancel Order". Always require confirmation.

### Rules

- Button labels are sentence case: "Create job" not "CREATE JOB" or "Create Job".
- Icon + label buttons: icon before label, 8px gap.
- Icon-only buttons: must have a tooltip.
- No more than 2 buttons side-by-side in a card or row. Use a dropdown for additional actions.
- Toolbar pattern: search input (373px), filter button (outline), view toggle group, primary CTA (filled).
- Shop floor buttons: minimum 56px height, clear labels, high contrast.
- Pack station critical buttons: 120px wide, full colour fill.

---

## 11. Table / DataTable System

Tables are used on 60%+ of screens. Consistency is critical.

### Structure

- Use ShadCN Table component.
- Header row: Geist Medium, 12px, `#737373`, uppercase with tracking.
- Body rows: 14px, `#0A0A0A`. Minimum row height 48px.
- Alternate row shading: optional (white / `#FAFAFA`).
- Hover highlight on rows.
- Borders: horizontal dividers only (`border-b border-[#E5E5E5]`), no vertical lines.

### Column Alignment

- Text columns (names, descriptions): left-aligned
- Numeric columns (quantities, amounts, percentages): right-aligned
- Status columns: left-aligned (badge)
- Date columns: left-aligned
- Action columns: right-aligned

### Features

- Sortable columns: click header to sort, show arrow indicator.
- Row selection: checkbox column on the left.
- Pagination: "Showing 1–10 of 48" with page arrows, rows-per-page selector.
- Filter: dropdown above table, or inline filter chips.
- Tabs above table for status grouping (e.g., All, Draft, Sent, Paid, Overdue).
- Bulk actions toolbar: appears when rows are selected.

### Inline Editing

- Used in quote line items and BOM tables.
- Editable cells have a subtle border on focus.
- "Add row" button at table bottom.

### Empty State

- Centred within the table area.
- Illustration area (optional, 301x264px max).
- Heading text, description text.
- Two action buttons: primary "Create" + secondary "Import".

---

## 12. Badge & Status System

### Badge Base

```
inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium
```

### Status Badges (used across all modules)

| Status           | Background | Text      | Example Modules                |
| ---------------- | ---------- | --------- | ------------------------------ |
| Draft            | `#F5F5F5`  | `#737373` | Invoices, POs, Budgets, RFQs   |
| New              | `#DBEAFE`  | `#0A7AFF` | Opportunities, Requisitions    |
| Sent / Active    | `#DBEAFE`  | `#0A7AFF` | Invoices, POs, Budgets         |
| In Progress      | `#DBEAFE`  | `#0A7AFF` | Jobs, MOs, WOs                 |
| Pending          | `#FFFBF0`  | `#FF8B00` | Approvals, Quality holds       |
| Partial          | `#FFEDD5`  | `#FF8B00` | Deliveries, Payments, Receipts |
| Completed / Paid | `#E3FCEF`  | `#36B37E` | Jobs, Invoices, MOs            |
| Overdue / Error  | `#FEE2E2`  | `#EF4444` | Invoices, Deliveries           |
| Cancelled        | `#F5F5F5`  | `#737373` | All modules                    |

### Status Dot Indicators

- Used inline in tables (e.g., Product status in the job detail screenshot)
- 8px circle, filled with status colour
- Paired with text label

### Rules

- Never use more than one badge per row for the same purpose (don't double-badge "Urgent" + "High Priority").
- Priority badges use filled backgrounds (see Priority Badge Colours in Section 5).
- Status badges use light backgrounds with dark text.
- Maximum badge width: content should not exceed ~100px.

---

## 13. Form & Input System

### Input Base

```
bg-[#F5F5F5] border-transparent rounded-md px-3 py-2 text-[14px] focus:bg-white focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A]
```

### Input Types

- **Text input**: Standard single-line. 373px width for search in toolbars.
- **Textarea**: Multi-line. Used for descriptions, notes, instructions.
- **Select / Dropdown**: ShadCN Select. Use when 3+ options. For 2 options, use a toggle or radio group.
- **Combobox**: Searchable dropdown. Used for product selection, customer selection, supplier selection.
- **Date picker**: ShadCN Calendar-based picker. Display format: "Mar 25".
- **Number input**: Right-aligned. Use Roboto Mono font for financial values.
- **Switch / Toggle**: For boolean settings. Use ShadCN Switch.
- **Checkbox**: For multi-select in tables and lists.
- **Radio group**: For mutually exclusive choices (e.g., tax inclusive/exclusive).

### Rules

- All form fields must have visible labels. Never rely on placeholder text alone.
- Required fields: no asterisk needed if most fields are required. Mark optional fields instead.
- Validation errors: red border, error message below the field in 12px `#EF4444`.
- Form actions: primary "Save" (MW Yellow), secondary "Cancel" (outline). Right-aligned.
- Touch targets: all form controls minimum 44px height, 56px on shop floor views.

---

## 14. Dialog & Sheet System

### When to use what

- **Dialog (Modal)**: For confirmations, quick creation forms (<6 fields), destructive action confirmations. Centred, backdrop blur.
- **Sheet (Slide-over)**: For detail views, complex forms, order detail panels. 480px width, right-anchored.
- **Full Page**: For settings, complex editors (BOM builder, factory layout). Takes over the content area within the sidebar.

### Rules

- Dialogs animate in with 500ms Emphasized Decelerate.
- Sheets slide from right with 400ms Standard easing.
- Always include a close button (X) in the top-right.
- Destructive confirmations: "Are you sure?" with description. Two buttons: outline "Cancel" + red filled "Delete".
- Sheets can have tabs (e.g., Order detail: Overview, Items, Shipping, Documents).

---

## 15. Kanban Board System

Used in: Sell (Opportunities), Plan (Jobs), Make (Shop Floor), Book (Expenses), Buy (RFQs, POs).

### Structure

- Horizontal columns, one per status.
- Column header: status name, count badge.
- Cards within columns: draggable.
- Quick-create button at top of first column.

### Card sizing

- Width: fills column (min 280px per column).
- Padding: 16px.
- Gap between cards: 8px.
- Card content: ID, title, description (2 lines max), priority badge, value, avatar, due date.

### Rules

- Drag-and-drop updates status via PATCH. Use optimistic UI (move card immediately, roll back on error).
- Maximum 7 columns visible without scroll.
- Column backgrounds: `#FAFAFA`. Card backgrounds: white.
- Overdue columns: red-tinted header.
- Won/Completed columns: green-tinted header.

---

## 16. Chart & Data Visualisation

### Library

- **Recharts** for all charts.
- Chart area sits inside a white card with title.

### Colour Assignment

| Data Category               | Colour                    |
| --------------------------- | ------------------------- |
| Revenue / Primary series    | `#FFCF4B` (MW Yellow)     |
| Expenses / Secondary series | `#8FA6A6` (MW Earth)      |
| Materials                   | `#0A7AFF` (Info Blue)     |
| Labour                      | `#36B37E` (Success Green) |
| Overhead                    | `#A68060` (MW Saddle)     |
| Subcontract                 | `#8FA6A6` (MW Earth)      |

### Rules

- Axis labels: 12px Geist Regular, `#737373`.
- No heavy gridlines. Subtle horizontal guides only.
- Tooltips: white card with shadow, 14px body text.
- Area charts: 20% opacity fill below the line.
- Donut charts: inner radius 60% of outer. Centre label for total.
- Bar charts: 8px border-radius on bar tops.
- Always include a legend when there are 2+ series.

---

## 17. Toast & Notification System

- Use **Sonner** component.
- Position: top-centre.
- Auto-dismiss after 4 seconds for success, persist for errors.
- Success: "Everything has been saved" or action-specific ("Invoice sent to customer").
- Error: "Something went wrong. Please try again." with retry action if applicable.
- Never use toasts for critical information. Use inline error states for form validation.

---

## 18. Touch Target & Accessibility

### Touch Targets

| Context                       | Minimum Height | Preferred  |
| ----------------------------- | -------------- | ---------- |
| Standard desktop UI           | 40px           | —          |
| Shop floor / tablets          | 44px           | 56px       |
| Gloved hands (Make, Ship)     | 56px           | 80px       |
| Pack station critical buttons | 80px           | 120px wide |

### Accessibility

- WCAG AA contrast minimum. AAA for critical controls in shop floor views.
- All interactive elements reachable by keyboard.
- Status indicators use both colour AND text/icon — never colour alone.
- Screen reader support: aria-label on icon-only buttons, full status text on badges.
- High contrast mode: test all status badges and progress bars at low brightness.

---

## 19. Data Formatting Conventions

| Data Type      | Format           | Font           | Example       |
| -------------- | ---------------- | -------------- | ------------- |
| Currency       | $X,XXX.XX        | Roboto Mono    | $24,500.00    |
| Date (short)   | Mon DD           | Geist          | Mar 25        |
| Date (long)    | DD Mon YYYY      | Geist          | 25 Mar 2026   |
| Percentage     | XX.X%            | Roboto Mono    | 18.4%         |
| Job number     | XX-NNN           | JetBrains Mono | MW-001        |
| Invoice number | PREFIX-YYYY-NNNN | JetBrains Mono | INV-2026-0047 |
| PO number      | PO-NNNN          | JetBrains Mono | PO-0089       |
| Time duration  | Xh Xm            | Geist          | 4h 30m        |
| Quantity       | N units          | Geist          | 4 units       |

---

## 20. File Organisation

### Component Directory Structure

```
src/components/
├── ui/              # ShadCN base components (shared)
├── sell/            # Sell module screens
├── plan/            # Plan module screens
├── shop-floor/      # Make module screens (existing name)
├── book/            # Book module screens
├── ship/            # Ship module screens
├── buy/             # Buy module screens
├── control/         # Control module screens
└── design/          # Design module screens
```

### Naming Conventions

- Component files: PascalCase matching export name (e.g., `BudgetOverview.tsx`)
- Module prefix for clarity when components share names across modules (e.g., `SellProducts.tsx`, `PlanProducts.tsx`, `BuyProducts.tsx`)
- Tab components: `{Module}{Section}Tab.tsx` (e.g., `PlanBudgetTab.tsx`, `PlanOverviewTab.tsx`)
- Modal components: `{Entity}Modal.tsx` (e.g., `MaterialsModal.tsx`, `DefectReportModal.tsx`)

### Imports

- Design system tokens: `import designSystem from '../../lib/design-system'`
- UI components: `import { Button } from '../ui/button'`
- Icons: `import { Plus, Search } from 'lucide-react'`