# MirrorWorks Frontend Standardisation — Phase 2

## Context

This is a follow-up to the initial frontend cleanup that has already been completed. That work covered:
- Fixed `ui/card.tsx` defaults to use design system tokens (shape-lg, neutral-200, shadow-xs, M3 easing)
- Added CVA `cardVariants` (flat, elevated, dark, ghost) to `ui/card.tsx`
- Created `shared/MwDataTable.tsx` wrapping ShadCN Table with design system enforcement
- Created `shared/StatusBadge.tsx` with centralised status-to-colour mapping
- Aligned `design-system.ts` motion durations with CSS tokens; created `shared/motion-variants.ts`
- Ensured `globals.css` `@theme inline` registers all M3 tokens as Tailwind utilities
- Migrated Sell module to standardised components (reference implementation)
- Migrated Book module — fixed radius, shadow, removed Geist font
- Migrated Plan module — standardised cards, removed Geist
- Migrated Buy, Ship, Make, Control, Shop-floor modules
- Removed dead imports, deprecated fonts, hardcoded hex, inline styles, unused deps

**This phase builds the full shared component library, icon system, drag-and-drop, datetime components, and completes the motion standardisation.**

## Reference Files

Read these before making any changes:
- `src/guidelines/DesignSystem.md` — Token definitions, colour system, typography, shape, elevation
- `src/guidelines/VisualLanguage.md` — Design philosophy, Crextio benchmark, visual principles
- `COMPONENT_PATTERNS.md` (repo root) — Concrete composition patterns for every component type
- `src/styles/globals.css` — CSS variables, M3 tokens, @theme inline
- `src/lib/design-system.ts` — TS constants (being phased out in favour of CSS vars)
- `src/components/shared/motion-variants.ts` — M3-aligned Framer Motion variants

Also reference the design system repo for working implementations:
- `/Users/mattquigley/Documents/GitHub/Mirrorworksdesignsystem/src/app/components/design-system/lists-kanbans-section.tsx` — Working react-dnd kanban + draggable list with MW drag states
- `/Users/mattquigley/Documents/GitHub/Mirrorworksdesignsystem/src/app/components/design-system/calendars-section.tsx` — Working date picker, date range picker, full calendar view
- `/Users/mattquigley/Documents/GitHub/Mirrorworksdesignsystem/src/app/components/design-system/motion-section.tsx` — Motion principles and patterns

## Dependencies to Install

```bash
npm install react-dnd@16.0.1 react-dnd-html5-backend@16.0.1 @formkit/auto-animate
```

`date-fns` is already available as a transitive dependency via `react-day-picker`. Make it explicit if not already in `package.json`:
```bash
npm install date-fns@3.6.0
```

Do NOT install: daisyUI, MUI, Mantine, styled-components, axios, react-slick, GSAP, @hello-pangea/dnd.

## Dependencies to Remove

```bash
npm uninstall hono next-themes tw-animate-css
```

After removing `tw-animate-css`:
- Remove `@import 'tw-animate-css';` from `src/index.css`
- Find all `animate-in`, `animate-out`, `fade-in-0`, `fade-out-0`, `zoom-in-95`, `zoom-out-95`, `slide-in-from-*`, `slide-out-to-*` classes in `src/components/ui/` files and replace with Framer Motion equivalents or CSS transitions using M3 duration/easing tokens
- Remove any `next-themes` imports (ThemeProvider, useTheme) from any files

---

## Task 0: Shared Dashboard Shell

Create `src/components/shared/dashboard/`. This is the highest-priority shared component — it replaces 8 separate dashboard implementations (SellDashboard, PlanDashboard, MakeDashboard, ShipDashboard, BookDashboard, BuyDashboard, ControlDashboard, WelcomeDashboard) with one configurable shell.

Reference the Figma design: `https://www.figma.com/design/mYbNU57fvXaYpgUZ5yoAnX/MW-UX?node-id=204-22120`

### `src/components/shared/dashboard/ModuleDashboard.tsx`

The top-level shell. Every module dashboard renders this.

```tsx
interface DashboardTab {
  id: string;
  label: string;
  icon?: React.ReactNode;        // Lucide icon for the tab
  content: React.ReactNode;      // What renders when this tab is active
}

interface ModuleDashboardProps {
  title?: string;                 // Override — defaults to module name from route
  tabs: DashboardTab[];
  defaultTab?: string;            // Tab ID to show initially, defaults to first
  headerActions?: React.ReactNode; // Right side of header (notification bell, settings gear)
  className?: string;
}
```

Structure — matching the Figma design:

- Header bar: 49px tall, `border-b border-[var(--neutral-200)]`, `px-6`. Title left, action icons right.
- Tab bar: full width, `border-b-2 border-[var(--neutral-200)]`. Each tab is `flex-1`, centred. Active tab has a 2px `bg-[var(--mw-yellow-400)]` underline bar at the bottom. This is NOT a pill/background tab — it is an underline indicator.
- Tab labels: `text-sm font-medium`. Active: `text-[var(--neutral-900)]`. Inactive: `text-[var(--neutral-500)]`. Each tab has an optional 16px Lucide icon to the left of the label.
- Content area: `flex-1 overflow-y-auto p-6`. Tab switch animates content with fade + slight slide-up (250ms, decelerate easing). Use Framer Motion `AnimatePresence` with key={activeTab}.
- Import `motion` from `motion/react` and `staggerContainer` from shared motion variants.

### `src/components/shared/dashboard/DashboardKPIRow.tsx`

Standardised KPI card row matching the Figma design's 4-card layout.

```tsx
interface KPIConfig {
  label: string;                    // "Total revenue" — 14px, neutral-500
  value: string;                    // "$15,231.89" — 30px, font-bold, tabular-nums, neutral-900
  change?: {
    value: string;                  // "+12.5%"
    direction: 'up' | 'down' | 'flat';
  };
  trend?: string;                   // "Trending up this month" — 14px, neutral-900
  trendIcon?: 'up' | 'down';       // TrendingUp or TrendingDown Lucide icon, 16px
  description?: string;             // "Visitors for the last 6 months" — 14px, neutral-500
}

interface DashboardKPIRowProps {
  kpis: KPIConfig[];
  className?: string;
}
```

Each KPI card structure from Figma:
- Container: `<Card variant="elevated">` (border + shadow-sm + rounded-xl), `p-6`
- Row 1: label left (`text-sm text-[var(--neutral-500)]`), change badge right
- Change badge: `bg-[var(--mw-yellow-400)] rounded-[var(--shape-md)] px-2 py-0.5 flex items-center gap-1`. Contains 12px trend icon + `text-xs font-medium text-[var(--neutral-900)]`
- Row 2: value `text-[30px] leading-[36px] font-bold tabular-nums text-[var(--neutral-900)]`
- Row 3: trend text `text-sm text-[var(--neutral-900)]` + trend icon (16px) inline
- Row 4: description `text-sm text-[var(--neutral-500)]`
- Gap between rows 1-2: 6px. Gap between row 2 and row 3-4 block: 24px.

Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` (16px gap — tighter than content cards, matching Figma)

### `src/components/shared/dashboard/DashboardGrid.tsx`

Responsive grid for widget cards below the KPI row.

```tsx
interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;            // default 2 on desktop
  className?: string;
}
```

Grid: `grid gap-6 grid-cols-1 lg:grid-cols-2` (default). Children use `lg:col-span-2` to span full width.

### `src/components/shared/dashboard/DashboardWidget.tsx`

Wrapper for individual widgets (charts, tables, activity feeds). Provides consistent card + title + actions.

```tsx
interface DashboardWidgetProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;        // Period toggle (ViewToggle), export button
  children: React.ReactNode;
  colSpan?: 1 | 2;                 // Grid column span
  className?: string;
}
```

Structure:
- `<Card variant="elevated">` with `overflow-hidden`
- `colSpan={2}` adds `lg:col-span-2`
- Title row: `p-6 pb-0`, flex between title/subtitle left and actions right
- Content: `p-6`
- The Revenue chart in Figma uses `colSpan={2}` with a `ViewToggle` in the actions slot showing "Last 3 months | Last 30 days | Last 7 days"

### `src/components/shared/dashboard/AddWidgetButton.tsx`

For future customisation. Renders as a dashed-border card.

```tsx
interface AddWidgetButtonProps {
  onClick: () => void;
  className?: string;
}
```

Structure:
- `border-2 border-dashed border-[var(--neutral-200)] rounded-[var(--shape-lg)] flex flex-col items-center justify-center py-12 cursor-pointer hover:border-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-50)] transition-colors`
- Plus icon (size-6, neutral-400) + "Add widget" text (text-sm, neutral-500)
- For MVP: just calls `onClick`. Full widget picker (popover with categories) is post-MVP.

### Module tab configurations

Each module gets the same shell with different tabs:

| Module | Tabs (id: label) |
|--------|-------------------|
| Main Dashboard | overview: Overview, analysis: Analysis, reports: Reports, forecasts: Forecasts |
| Sell | overview: Overview, pipeline: Pipeline, analysis: Analysis, reports: Reports, forecasts: Forecasts |
| Plan | overview: Overview, schedule: Schedule, production: Production, reports: Reports |
| Make | overview: Overview, shopfloor: Shop floor, quality: Quality, reports: Reports |
| Ship | overview: Overview, dispatch: Dispatch, tracking: Tracking, reports: Reports |
| Book | overview: Overview, pnl: P&L, cashflow: Cash flow, reports: Reports |
| Buy | overview: Overview, orders: Orders, suppliers: Suppliers, reports: Reports |
| Control | overview: Overview, inventory: Inventory, people: People, reports: Reports |

The Overview tab always contains: `<DashboardKPIRow>` + `<DashboardGrid>` with module-specific widgets. Other tabs render module-specific content (kanban, gantt, table views) directly as the tab content.

### Migration pattern

Each existing dashboard (100-400 lines) becomes ~50 lines of config:

```tsx
export function SellDashboard() {
  return (
    <ModuleDashboard
      title="Dashboard"
      tabs={[
        {
          id: 'overview',
          label: 'Overview',
          icon: <LayoutDashboard className="size-4" />,
          content: (
            <>
              <DashboardKPIRow kpis={SELL_KPIS} />
              <DashboardGrid>
                <DashboardWidget title="Revenue" subtitle="For the last 3 months" colSpan={2}
                  actions={<ViewToggle options={[...]} value="3m" onChange={() => {}} />}
                >
                  {/* Recharts AreaChart */}
                </DashboardWidget>
                <DashboardWidget title="Recent sales" subtitle="You made 265 sales this month." colSpan={2}>
                  {/* MwDataTable with avatar rows */}
                </DashboardWidget>
              </DashboardGrid>
            </>
          ),
        },
        { id: 'analysis', label: 'Analysis', icon: <TrendingUp className="size-4" />, content: <div>Analysis</div> },
        { id: 'reports', label: 'Reports', icon: <BookOpen className="size-4" />, content: <div>Reports</div> },
        { id: 'forecasts', label: 'Forecasts', icon: <SearchCheck className="size-4" />, content: <div>Forecasts</div> },
      ]}
    />
  );
}
```

### Dashboard migration order

1. Build the 5 dashboard shared components
2. Migrate **WelcomeDashboard** first (simplest — Overview tab only)
3. Migrate **SellDashboard** (reference implementation, matches Figma exactly)
4. Migrate **BookDashboard** (financial KPIs, P&L charts)
5. Migrate remaining 5 dashboards

---

## Task 1: Shared Card Components

Create `src/components/shared/cards/`. Each component enforces design system tokens so modules cannot accidentally use wrong radius, shadow, or colour.

### `src/components/shared/cards/StatCard.tsx`

KPI stat card for dashboard top rows. Used on every dashboard (7 modules + WelcomeDashboard).

Props:
```tsx
interface StatCardProps {
  label: string;                          // "Monthly revenue"
  value: string | number;                 // "$287,500" or 287500
  change?: { value: number; direction: 'up' | 'down' | 'flat' };
  icon?: React.ReactNode;                 // Lucide icon
  iconVariant?: 'neutral' | 'dark';       // neutral = neutral-100 bg, dark = Mirage bg with yellow icon
  formatValue?: (v: number) => string;    // Custom formatter
  className?: string;
}
```

Structure:
- Uses `<Card variant="flat">` as container, `p-6`
- Top row: icon in 40px (`size-10`) rounded-lg container + change badge (right-aligned)
  - `iconVariant="neutral"`: `bg-[var(--neutral-100)]` container, `text-[var(--neutral-500)]` icon
  - `iconVariant="dark"`: `bg-[var(--mw-mirage)]` container, `text-[var(--mw-yellow-400)]` icon
- Label: `text-[13px] font-medium text-[var(--neutral-500)]`
- Value: `text-[24px] font-bold tabular-nums text-[var(--neutral-900)]`
- Change badge: uses `StatusBadge` or inline pill — positive = `bg-[var(--mw-yellow-400)]/20 text-[var(--neutral-900)]`, negative = `bg-[var(--mw-error)]/10 text-[var(--mw-error)]`
- Hover: `hover:shadow-md transition-shadow duration-[var(--duration-medium1)] ease-[var(--ease-standard)]`

### `src/components/shared/cards/DarkAccentCard.tsx`

Mirage hero KPI card. Maximum 1-2 per page.

Props:
```tsx
interface DarkAccentCardProps {
  label: string;                          // "Total revenue"
  value: string | number;                 // "$284,500"
  change?: { value: number; direction: 'up' | 'down' | 'flat' };
  subtitle?: string;                      // "vs last month"
  className?: string;
}
```

Structure:
- Uses `<Card variant="dark">` as container, `p-6`
- Label: `text-xs font-medium uppercase tracking-wider text-white/60`
- Value: `text-[48px] leading-[56px] font-bold tabular-nums tracking-[-0.25px] text-white`
- Change badge: `rounded-full bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] text-xs font-medium px-2.5 py-0.5`
- Subtitle: `text-xs text-white/60`

### `src/components/shared/cards/EntityCard.tsx`

Avatar-anchored card for people, customers, suppliers, machines. See COMPONENT_PATTERNS.md section 1e.

Props:
```tsx
interface EntityCardProps {
  name: string;
  role?: string;
  avatar?: string;
  initials?: string;
  actions?: { icon: React.ReactNode; onClick: () => void; label: string }[];
  metric?: { label: string; value: string | number; percentage?: number };
  onClick?: () => void;
  className?: string;
}
```

Structure:
- `<Card variant="flat">`, `p-6`
- Top row: Avatar (size-12, ring-2 ring-white shadow-sm) + name/role + action icon buttons (size-10 rounded-full bg-neutral-100)
- Bottom: metric label + `tabular-nums font-medium` value + ProgressBar if percentage provided
- Action buttons: `hover:bg-[#0A0A0A]/[0.08]` state layer

### `src/components/shared/cards/FlatCard.tsx`

Simplest wrapper. For generic content containment.

```tsx
interface FlatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;  // For table cards where the table handles its own padding
}
```

Structure: `<Card variant="flat" className={cn(noPadding ? "p-0" : "p-6", className)}>`

---

## Task 2: Page Layout Components

Create `src/components/shared/layout/`.

### `src/components/shared/layout/PageShell.tsx`

Every page wraps content in this. Enforces `p-8 space-y-8`.

```tsx
interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

// Renders:
<motion.div
  initial="initial"
  animate="animate"
  variants={staggerContainer}
  className={cn("p-8 space-y-8", className)}
>
  {children}
</motion.div>
```

Import `staggerContainer` from `shared/motion/motion-variants.ts`.

### `src/components/shared/layout/PageHeader.tsx`

```tsx
interface PageHeaderProps {
  breadcrumb?: string;           // "Sell / Quotes"
  title: string;                 // "Active quotes"
  actions?: React.ReactNode;     // Buttons, right-aligned
}
```

Structure:
- Flex row, `items-center justify-between`
- Left: breadcrumb (`text-xs text-[var(--neutral-500)] tracking-wide`) + title (`text-[32px] leading-[40px] font-normal tracking-normal text-[var(--neutral-900)] mt-1`)
- Right: action buttons in `flex items-center gap-3`

### `src/components/shared/layout/KPIRow.tsx`

```tsx
interface KPIRowProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;  // default 4
}

// Renders:
<div className={cn("grid gap-6", columns === 2 ? "grid-cols-1 md:grid-cols-2" : columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4")}>
  {children}
</div>
```

### `src/components/shared/layout/FilterBar.tsx`

Sits inside table cards above the header row.

```tsx
interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;  // Filter chips, dropdowns, view toggle
}
```

Structure:
- `flex items-center gap-3 px-4 py-3 border-b border-[var(--neutral-100)]`
- Search `<Input>` with `max-w-xs` on the left
- Children (filter buttons, chips) in the middle/right

### `src/components/shared/layout/DetailSheet.tsx`

Right panel sheet for entity details.

```tsx
interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  avatar?: string;
  initials?: string;
  stats?: { label: string; value: string }[];
  children: React.ReactNode;
  width?: string;  // default "w-[600px]"
}
```

Structure:
- `<Sheet>` with `<SheetContent className="bg-white/95 backdrop-blur-xl rounded-l-[var(--shape-lg)] shadow-xl overflow-y-auto">`
- Entity header: Avatar (size-16) + title (text-xl font-medium) + subtitle
- Stat pills row: `flex gap-3`, each pill is `flex-1 bg-[var(--neutral-50)] rounded-[var(--shape-md)] p-4 text-center`
- Children below for tabbed content / activity feed

---

## Task 3: Kanban Components (with Drag-and-Drop)

Create `src/components/shared/kanban/`. Port the drag-and-drop patterns from the design system repo (`lists-kanbans-section.tsx`), using `react-dnd` + `react-dnd-html5-backend`.

### `src/components/shared/kanban/drag-styles.ts`

Shared visual constants for drag states. Used by KanbanCard, KanbanColumn, and DraggableList.

```tsx
// Drag state applied to the card being dragged
export const DRAG_CARD_STYLE = {
  dragging: {
    opacity: 0.4,
    cursor: 'grabbing' as const,
    transform: 'rotate(3deg) scale(1.05)',
    transition: 'none',
  },
  idle: {
    opacity: 1,
    cursor: 'grab' as const,
    transform: 'none',
    transition: 'all 200ms ease',
  },
} as const;

// Border + shadow during drag
export const DRAG_BORDER_STYLE = {
  dragging: {
    borderColor: '#FFCF4B',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 3px rgba(255, 207, 75, 0.2)',
  },
  idle: {
    borderColor: 'var(--neutral-200)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
} as const;

// Drop zone (column) hover state
export const DROP_ZONE_STYLE = {
  hovering: {
    backgroundColor: '#FFF9E6',
    border: '2px dashed #FFCF4B',
  },
  idle: {
    backgroundColor: 'var(--mw-off-white)',
    border: '2px solid transparent',
  },
} as const;

// List item drag (slightly less dramatic than kanban)
export const DRAG_LIST_STYLE = {
  dragging: {
    opacity: 0.4,
    cursor: 'grabbing' as const,
    transform: 'rotate(2deg) scale(1.02)',
    transition: 'none',
  },
  idle: {
    opacity: 1,
    cursor: 'grab' as const,
    transform: 'none',
    transition: 'all 200ms ease',
  },
} as const;

export const DND_ITEM_TYPES = {
  KANBAN_CARD: 'kanbanCard',
  LIST_ITEM: 'listItem',
} as const;
```

### `src/components/shared/kanban/KanbanBoard.tsx`

Top-level wrapper. Provides DndProvider context.

```tsx
interface KanbanBoardProps {
  children: React.ReactNode;
  className?: string;
}
```

Structure:
```tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("flex gap-6 overflow-x-auto pb-4", className)}
           style={{ minHeight: 'calc(100% - 24px)' }}>
        {children}
      </div>
    </DndProvider>
  );
}
```

### `src/components/shared/kanban/KanbanColumn.tsx`

Drop target column. Uses `useDrop` from react-dnd.

```tsx
interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  valueSummary?: string;               // "$128,000" total
  variant?: 'default' | 'dark';        // dark = Mirage header
  onDrop?: (itemId: string, fromColumnId: string) => void;
  width?: string;                       // default "w-[380px]"
  emptyMessage?: string;               // default "No items"
  children: React.ReactNode;           // KanbanCard items
}
```

Structure:
- Outer: `flex-shrink-0` + width, `flex flex-col`
- Header: `rounded-t-[var(--shape-lg)] px-4 py-3 flex items-center justify-between`
  - `variant="default"`: `bg-[var(--neutral-100)]` background
  - `variant="dark"`: `bg-[var(--mw-mirage)] text-white` background
- Title: `text-sm font-medium` + count badge (rounded-full, neutral or yellow on dark)
- Value summary: `tabular-nums text-sm text-[var(--neutral-500)]` (or `text-white/80` on dark)
- Card area: `flex-1 bg-[var(--mw-off-white)] rounded-b-[var(--shape-lg)] p-3 space-y-3`
- Uses `useDrop({ accept: DND_ITEM_TYPES.KANBAN_CARD })` with `DROP_ZONE_STYLE` applied when `isOver`
- Empty state: dashed border card `border-2 border-dashed border-[var(--neutral-200)] rounded-[var(--shape-lg)] p-6 text-center text-xs text-[var(--neutral-500)]`

### `src/components/shared/kanban/KanbanCard.tsx`

Draggable card. Uses `useDrag` from react-dnd.

```tsx
interface KanbanCardProps {
  id: string;
  columnId: string;
  onClick?: () => void;
  children?: React.ReactNode;
  // OR structured variant:
  header?: React.ReactNode;              // Job ID + status dot
  title?: string;
  subtitle?: string;
  metadata?: { label: string; value: string | React.ReactNode }[];
  footer?: React.ReactNode;
}
```

Structure:
- Uses `useDrag({ type: DND_ITEM_TYPES.KANBAN_CARD, item: { cardId: id, columnId } })`
- Collects `isDragging` from monitor
- Applies `DRAG_CARD_STYLE` and `DRAG_BORDER_STYLE` based on `isDragging`
- Card: `bg-white border rounded-[var(--shape-lg)] p-4`
- Idle hover: `hover:shadow-md transition-shadow`
- Active press: `active:scale-[0.98]`
- If using structured props:
  - Header row: `flex items-center justify-between mb-2` — ID in `tabular-nums text-xs text-[var(--neutral-500)]`, status/priority badge right
  - Title: `text-sm font-medium text-[var(--neutral-900)] mb-1`
  - Subtitle: `text-xs text-[var(--neutral-500)] mb-3`
  - Metadata: key-value pairs, `text-[13px]`, labels in `text-[var(--neutral-500)]`, values in `text-[var(--neutral-900)]`
  - Footer: `pt-3 border-t border-[var(--neutral-100)]`
- If using `children`: just render children inside the card shell

### `src/components/shared/kanban/DraggableList.tsx`

Reorderable list with drag handles. For job priority queues, machine assignment, maintenance tasks.

```tsx
interface DraggableListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number, dragHandleRef: React.Ref<any>) => React.ReactNode;
  onReorder: (reorderedItems: T[]) => void;
  className?: string;
}
```

Structure:
- Each item wrapped in a div that is both a drag source and drop target
- Uses `useDrag` + `useDrop` for reorder (hover swaps indices, same pattern as design system repo)
- Drag handle: `GripVertical` icon at `size-5`, in a 48px touch target (`p-2 rounded-[var(--shape-sm)]`)
  - Default: `text-[var(--neutral-400)]`
  - Hover: `hover:bg-[var(--mw-off-white)]`
  - Dragging: `text-[var(--mw-yellow-400)]`
- Item applies `DRAG_LIST_STYLE` (2deg rotation, 1.02 scale) and `DRAG_BORDER_STYLE` when dragging
- Use `@formkit/auto-animate` ref on the list container for smooth reorder transitions:
  ```tsx
  import { useAutoAnimate } from '@formkit/auto-animate/react';
  const [parent] = useAutoAnimate();
  return <div ref={parent} className={className}>{/* items */}</div>;
  ```

---

## Task 4: DateTime Components

Create `src/components/shared/datetime/`. Port patterns from the design system repo's `calendars-section.tsx`, but use CSS variables instead of hardcoded hex, and use M3 shape/duration tokens.

### `src/components/shared/datetime/DatePicker.tsx`

Single date picker in a popover. Wraps a custom calendar built with `date-fns` (NOT react-day-picker — build the calendar UI directly for full control, matching the design system repo pattern).

```tsx
interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;            // default "Select date"
  disabled?: boolean;
  className?: string;
}
```

Structure:
- Trigger: `h-14 min-h-[56px]` (matching design system repo spec), `rounded-[var(--shape-md)]`, border `var(--neutral-400)`, focus border `var(--mw-yellow-400)`
- Calendar icon right-aligned in trigger, `text-[var(--neutral-500)]`
- Display: `tabular-nums text-sm` formatted date
- Popover: 328px wide (M3 standard), `rounded-[var(--shape-lg)]`, `shadow-[var(--elevation-2)]`
- Month navigation: 40x40px rounded-full buttons with chevrons
- Month/year header: `text-base font-medium text-[var(--neutral-900)]`
- Weekday headers: `text-xs font-medium text-[var(--neutral-500)]`, single letters (M, T, W, T, F, S, S)
- Date cells: 40x40px `rounded-full`
  - Default: `text-sm text-[var(--neutral-600)]`, `hover:bg-[#0A0A0A]/[0.08]`
  - Selected: `bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] font-medium`
  - Today (not selected): yellow dot indicator below the number (`w-1 h-1 rounded-full bg-[var(--mw-yellow-400)]`)
  - Outside month: `text-[var(--neutral-300)]`, disabled
- Footer: "Today" text button, right-aligned
- Close popover on date selection

### `src/components/shared/datetime/DateRangePicker.tsx`

From/to range picker with preset chips.

```tsx
interface DateRangePickerProps {
  value: { from: Date | null; to: Date | null };
  onChange: (range: { from: Date | null; to: Date | null }) => void;
  presets?: boolean;               // default true — show preset chips
  placeholder?: string;            // default "Select range"
  className?: string;
}
```

Structure:
- Trigger: same styling as DatePicker, displays `tabular-nums` formatted range ("23 Mar - 24 Mar 2026")
- Popover: wider than DatePicker (~560px), `rounded-[var(--shape-lg)]`, `shadow-[var(--elevation-2)]`
- Left side: preset chips (vertical list of buttons)
  - Presets: Today, This week, This month, Last 30 days, This quarter, This FY (July-June for AU), Custom
  - Active preset: `bg-[var(--mw-yellow-400)]/15 text-[var(--neutral-900)] font-medium`
  - Inactive: `text-[var(--neutral-600)] hover:bg-[#0A0A0A]/[0.08]`
- Right side: two-month calendar side by side
- Range highlight on days between from and to: `bg-[var(--mw-yellow-50)]`
- Start day: `bg-[var(--mw-yellow-400)] rounded-l-full`
- End day: `bg-[var(--mw-yellow-400)] rounded-r-full`

### `src/components/shared/datetime/TimePicker.tsx`

Styled time input replacing raw `<Input type="time">`.

```tsx
interface TimePickerProps {
  value: string;                   // "06:00", "14:30"
  onChange: (time: string) => void;
  step?: number;                   // minutes, default 15
  disabled?: boolean;
  className?: string;
}
```

Structure:
- Container: `h-12 min-h-[48px]`, `rounded-[var(--shape-md)]`, border `var(--neutral-200)`, `bg-[var(--neutral-100)]`
- Display: `tabular-nums text-sm font-medium text-[var(--neutral-900)]`, centred
- Up/down buttons (or native time input styled to match)
- Focus: `ring-2 ring-[#0A0A0A]`

### `src/components/shared/datetime/DateTimePicker.tsx`

Combines DatePicker + TimePicker for scheduling manufacturing orders.

```tsx
interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
}
```

Structure: DatePicker on the left, TimePicker on the right, inside a single `flex items-center gap-2` container with a shared border.

### `src/components/shared/datetime/ScheduleCalendar.tsx`

Full month grid view with event blocks. Port from design system repo's `FullCalendarView`.

```tsx
interface ScheduleCalendarProps {
  events: { date: Date; title: string; time?: string; colour?: string }[];
  currentMonth?: Date;
  onMonthChange?: (month: Date) => void;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: any) => void;
  className?: string;
}
```

Structure:
- 7 columns (Mon-Sun), min cell height 100px
- Header: month/year (`text-xl font-medium`) + chevron navigation (40x40px buttons)
- Weekday row: `text-xs font-medium text-[var(--neutral-500)]`, centred
- Cell borders: `border border-[var(--neutral-200)]`
- Current month cells: `bg-white`
- Outside month cells: `bg-[var(--mw-off-white)]`
- Event blocks: `bg-[var(--mw-yellow-400)] rounded-[var(--shape-xs)] px-2 py-1 text-[11px] font-medium text-[var(--neutral-900)]`
- Today cell: subtle highlight ring or dot indicator

---

## Task 5: Schedule Components

Create `src/components/shared/schedule/`.

### `src/components/shared/schedule/GanttChart.tsx`

SVG-based Gantt chart. Consolidates the two separate implementations in `MakeSchedule.tsx` (313 lines) and `PlanScheduleTab.tsx` (307 lines).

```tsx
interface GanttChartProps {
  rows: { id: string; label: string }[];
  bars: GanttBarData[];
  startDate: Date;
  dayCount: number;
  todayOffset?: number;
  statusConfig: Record<string, { colour: string; label: string }>;
  onBarClick?: (bar: GanttBarData) => void;
  rowHeight?: number;     // default 56
  dayWidth?: number;      // default 72
  labelWidth?: number;    // default 120
  className?: string;
}

interface GanttBarData {
  id: string;
  rowId: string;
  startDay: number;
  durationDays: number;
  status: string;
  label: string;
  sublabel?: string;
}
```

Structure:
- SVG element with calculated width/height
- Left column: row labels (work centres, machines) at `labelWidth` wide
- Day axis: date labels along top, weekend columns get `bg-[var(--neutral-50)]` fill
- Today marker: vertical dashed line in `var(--mw-yellow-400)`
- Bars: `rounded-[var(--shape-xs)]` rect, coloured by `statusConfig`, positioned by `startDay * dayWidth`
- Bar text: `text-[11px] font-medium`, clipped to bar width
- Hover tooltip: frosted glass (`bg-white/90 backdrop-blur-md rounded-[var(--shape-md)] shadow-lg p-3`), shows bar label, sublabel, dates, status
- Row borders: `stroke="#E5E5E5"` horizontal lines

**Status colours (corrected from non-system blues/reds):**
- Completed: `var(--mw-yellow-400)` (#FFCF4B)
- In progress: `var(--mw-mirage)` (#1A2732)
- Scheduled: `var(--neutral-300)` (#D4D4D4)
- Overdue: `var(--mw-error)` (#DE350B)

No blue (#0A7AFF). No Tailwind red (#EF4444). Only brand colours + neutral + status.

### `src/components/shared/schedule/TimelineView.tsx`

Vertical timeline for delivery tracking, customer activity, job history.

```tsx
interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'complete' | 'current' | 'pending';
  actions?: React.ReactNode;
}

interface TimelineViewProps {
  events: TimelineEvent[];
  className?: string;
}
```

Structure:
- `space-y-0` container
- Each event: `flex gap-4`
- Left: vertical dot + connector line
  - Complete: `size-3 rounded-full bg-[var(--neutral-300)]`
  - Current: `size-3 rounded-full bg-[var(--mw-yellow-400)] ring-4 ring-[var(--mw-yellow-400)]/20`
  - Pending: `size-3 rounded-full bg-[var(--neutral-200)]`
  - Connector: `w-px flex-1 bg-[var(--neutral-200)]` between dots
- Right: `pb-6`
  - Title: `text-sm font-medium text-[var(--neutral-900)]`
  - Description: `text-xs text-[var(--neutral-500)] mt-0.5`
  - Timestamp: `tabular-nums text-xs text-[var(--neutral-400)] mt-1`

---

## Task 6: Data Components

Create/update `src/components/shared/data/`.

### `src/components/shared/data/ProgressBar.tsx`

```tsx
interface ProgressBarProps {
  value: number;                      // 0-100
  variant?: 'linear' | 'segmented';
  segments?: { value: number; colour?: 'yellow' | 'dark' | 'hatched' }[];  // for segmented
  showLabel?: boolean;                // show percentage text
  label?: string;                     // "Schedule adherence"
  height?: number;                    // default 8 (h-2)
  className?: string;
}
```

Linear variant:
- Track: `bg-[var(--neutral-200)]`, `rounded-full`, `h-2`
- Fill: `bg-[var(--mw-yellow-400)]`, `rounded-full`, `transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]`

Segmented variant:
- `flex gap-1 h-2`
- Yellow segment: `rounded-full bg-[var(--mw-yellow-400)]`
- Dark segment: `rounded-full bg-[var(--mw-mirage)]`
- Hatched segment: `rounded-full` with `background: repeating-linear-gradient(135deg, var(--neutral-300), var(--neutral-300) 2px, var(--neutral-100) 2px, var(--neutral-100) 4px)`

With label (`showLabel=true`):
- Wrapper with label left, `tabular-nums font-medium` value right, bar below

### `src/components/shared/data/MetricBadge.tsx`

Pill-shaped inline metric. `tabular-nums` for consistent digit width.

```tsx
interface MetricBadgeProps {
  value: string | number;
  variant?: 'neutral' | 'accent' | 'positive' | 'negative';
  className?: string;
}
```

- `rounded-full px-3 py-1 tabular-nums text-xs font-medium`
- neutral: `bg-[var(--neutral-100)] text-[var(--neutral-700)]`
- accent: `bg-[var(--mw-yellow-400)]/20 text-[var(--neutral-900)]`
- positive: `bg-[var(--mw-success)]/10 text-[var(--mw-success)]`
- negative: `bg-[var(--mw-error)]/10 text-[var(--mw-error)]`

### `src/components/shared/data/FinancialTable.tsx`

Wraps `MwDataTable` with financial-specific behaviour.

```tsx
interface FinancialColumnDef<T> extends MwColumnDef<T> {
  type?: 'text' | 'currency' | 'percentage' | 'number';
  negativeRed?: boolean;  // default true for currency/number
}

interface FinancialTableProps<T> extends Omit<MwDataTableProps<T>, 'columns'> {
  columns: FinancialColumnDef<T>[];
  showSubtotal?: boolean;
  subtotalLabel?: string;
  subtotalValues?: Record<string, number>;
  showGrandTotal?: boolean;
  grandTotalLabel?: string;
  grandTotalValues?: Record<string, number>;
}
```

Automatic formatting:
- `type="currency"`: `text-right tabular-nums font-medium`, formatted via `Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })`
- `type="percentage"`: `text-right tabular-nums font-medium`, formatted with `%` suffix
- `type="number"`: `text-right tabular-nums font-medium`
- Negative values (when `negativeRed=true`): `text-[var(--mw-error)]`
- Subtotal rows: `bg-[var(--neutral-50)] font-medium border-t border-[var(--neutral-200)]`
- Grand total: `text-base font-bold`

---

## Task 7: Feedback Components

Create `src/components/shared/feedback/`.

### `src/components/shared/feedback/EmptyState.tsx`

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;          // Lucide icon
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
```

Structure:
- `flex flex-col items-center justify-center py-16 px-8 text-center`
- Icon container: `size-16 rounded-full bg-[var(--neutral-100)] flex items-center justify-center mb-4`
- Icon: `size-8 text-[var(--neutral-400)]`
- Title: `text-base font-medium text-[var(--neutral-900)] mb-1`
- Description: `text-sm text-[var(--neutral-500)] max-w-sm mb-6`
- Action button: `<Button>` with icon, only shown if `actionLabel` + `onAction` provided

### `src/components/shared/feedback/ConfirmDialog.tsx`

For destructive actions. Wraps `AlertDialog` from ShadCN.

```tsx
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;           // default "Delete"
  cancelLabel?: string;            // default "Cancel"
  onConfirm: () => void;
  variant?: 'destructive' | 'default';
}
```

Structure:
- Overlay: `bg-black/20 backdrop-blur-sm`
- Content: `rounded-[var(--shape-lg)] shadow-xl`
- Title: `font-medium`
- Confirm button: `bg-[var(--mw-error)] text-white hover:bg-[var(--mw-error)]/90` for destructive, default yellow for default

---

## Task 8: Checklist Components

Create `src/components/shared/checklist/`.

### `src/components/shared/checklist/Checklist.tsx` + `ChecklistItem.tsx`

For quality checklists (Make) and packing checklists (Ship). 56px rows, large checkboxes.

```tsx
interface ChecklistItemData {
  id: string;
  label: string;
  note?: string;
  completed: boolean;
  completedAt?: string;
}

interface ChecklistProps {
  items: ChecklistItemData[];
  onToggle: (id: string) => void;
  className?: string;
}
```

ChecklistItem structure:
- `flex items-center gap-4 min-h-[56px] px-4 py-3 rounded-[var(--shape-md)] hover:bg-[#0A0A0A]/[0.04] cursor-pointer`
- Checkbox: `size-6 rounded-[var(--shape-xs)] data-[state=checked]:bg-[var(--mw-yellow-400)] data-[state=checked]:text-[var(--neutral-900)] data-[state=checked]:border-[var(--mw-yellow-400)]`
- Label: `text-base`, strikethrough + `text-[var(--neutral-400)]` when completed
- Note: `text-xs text-[var(--neutral-500)]`
- Completion time: `tabular-nums text-xs text-[var(--neutral-400)]`, right-aligned

---

## Task 9: Chart Theming

Create `src/components/shared/charts/`.

### `src/components/shared/charts/chart-theme.ts`

```tsx
export const MW_CHART_COLOURS = {
  hero: '#FFCF4B',
  secondary: '#A3A3A3',
  tertiary: '#D4D4D4',
  negative: '#DE350B',
  grid: '#E5E5E5',
  axis: '#737373',
} as const;

export const MW_CHART_COLOUR_SEQUENCE = [
  MW_CHART_COLOURS.hero,
  MW_CHART_COLOURS.secondary,
  MW_CHART_COLOURS.tertiary,
];

export const MW_AXIS_TICK = {
  fontSize: 11,
  fontFamily: 'Roboto, sans-serif',
  fill: '#737373',
  style: { fontVariantNumeric: 'tabular-nums' } as React.CSSProperties,
};

export const MW_CARTESIAN_GRID = {
  strokeDasharray: '3 3',
  stroke: '#E5E5E5',
  vertical: false,
};
```

### `src/components/shared/charts/ChartTooltip.tsx`

Frosted glass tooltip for Recharts.

```tsx
export function MwChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-[var(--shape-md)] shadow-lg border border-white/30 p-3">
      <p className="text-xs font-medium text-[var(--neutral-900)] mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="tabular-nums text-sm text-[var(--neutral-700)]">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}
```

### `src/components/shared/charts/ChartCard.tsx`

Card wrapper for any Recharts chart.

```tsx
interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;  // Period selector, export button
  children: React.ReactNode;  // The Recharts component
  className?: string;
}
```

Structure: `<Card variant="flat" className="p-6">` with title row + chart content.

---

## Task 10: Navigation Component

### `src/components/shared/navigation/ViewToggle.tsx`

Segmented control for switching views. Used in ~8 places (table/kanban, day/week/month, gantt/calendar, list/grid).

```tsx
interface ViewToggleProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
```

Structure:
- Container: `h-12 min-h-[48px] bg-[var(--neutral-100)] rounded-[var(--shape-md)] p-1 flex`
- Option: `flex-1 flex items-center justify-center gap-2 rounded-[var(--shape-sm)] text-sm font-medium transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]`
- Active: `bg-white shadow-sm text-[var(--neutral-900)]`
- Inactive: `text-[var(--neutral-500)] hover:text-[var(--neutral-700)]`

---

## Task 11: Icon System

### `src/lib/icon-config.ts`

Single source of truth for module-to-icon mapping.

```tsx
import { Kanban } from '@/components/animate-ui/icons/kanban';
import { ChartSpline } from '@/components/animate-ui/icons/chart-spline';
import { List as ListIcon } from '@/components/animate-ui/icons/list';
import { Cog } from '@/components/animate-ui/icons/cog';
import { Forklift } from '@/components/animate-ui/icons/forklift';
import { CircuitBoard } from '@/components/animate-ui/icons/circuit-board';
import { Blocks } from '@/components/animate-ui/icons/blocks';
import { Route } from '@/components/animate-ui/icons/route';

export const MODULE_ICONS = {
  sell: Kanban,
  plan: ListIcon,
  make: CircuitBoard,
  ship: Forklift,
  book: ChartSpline,
  buy: Blocks,
  control: Cog,
  design: Route,
} as const;

export const ICON_SIZES = {
  sidebar: 20,       // In Mirage square
  dashboard: 28,     // In yellow square on WelcomeDashboard
  page: 20,          // w-5 h-5 — buttons, toolbar
  table: 16,         // w-4 h-4 — inside table rows
  shopFloor: 24,     // w-6 h-6 — glove-friendly
  chevron: 16,       // w-4 h-4 — structural
  status: 8,         // w-2 h-2 — colour dots only
} as const;
```

### Update `src/components/Sidebar.tsx`

- Replace Lucide module icons with Animate UI equivalents from `MODULE_ICONS`
- Keep `LayoutDashboard` (Lucide) for the Dashboard home link
- Keep `Search`, `Plus`, `ChevronRight`, `Settings` as Lucide (utility icons, not module identity)
- Bump module icon size from current `w-4 h-4` to `size={ICON_SIZES.sidebar}` (20px)
- Add `animateOnHover` prop to each Animate UI icon
- Remove the manual `isIconBouncing` / scale(1.15) hack — Animate UI handles hover animation natively
- Icon colour: `text-white` (on Mirage square background)
- Active state: MW Yellow dot next to label (keep existing), icon square gets `ring-2 ring-[var(--mw-yellow-400)]/30`

### Update `src/components/WelcomeDashboard.tsx`

- Replace Lucide module icons with Animate UI equivalents from `MODULE_ICONS`
- Icon size: `size={ICON_SIZES.dashboard}` (28px)
- Add `animateOnHover` prop to each icon
- Icon colour: `text-[var(--mw-mirage)]` (on yellow background)
- Keep `ArrowRight` as Lucide (action icon, not module identity)
- Yellow square container: `size-12 rounded-[var(--shape-md)] bg-[var(--mw-yellow-400)] flex items-center justify-center group-hover:scale-110 transition-transform duration-[var(--duration-medium1)] ease-[var(--ease-standard)]`

---

## Task 12: Motion Standardisation

### Update `src/components/shared/motion/motion-variants.ts`

The existing file is good. Verify it uses the M3 curves from `globals.css` (NOT the old Material Design 2 curves from the design system repo):

- Standard: `[0.2, 0, 0, 1.0]` (correct M3)
- Decelerate: `[0, 0, 0, 1]` (correct M3)
- Accelerate: `[0.3, 0, 1, 1]` (correct M3)
- Emphasized decelerate: `[0.05, 0.7, 0.1, 1.0]` (correct M3)

If the file references `[0.4, 0.0, 0.2, 1]` (Material Design 2 standard curve), correct it to M3.

### Create `src/components/shared/motion/use-reduced-motion.ts`

```tsx
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}
```

Use in drag components: when `reduced` is true, skip rotation/scale transforms during drag but keep the yellow border/glow (visual feedback is essential).

### Add `transition-mw` utility to `src/styles/globals.css`

Inside the `@layer base` or as a standalone utility:

```css
@utility transition-mw {
  transition-property: color, background-color, border-color, box-shadow, opacity, transform;
  transition-duration: var(--duration-medium1);
  transition-timing-function: var(--ease-standard);
}
```

### Migrate motion imports across all modules

Find all files that import from `../../lib/design-system` and use `animationVariants`:

```
import { designSystem } from '../../lib/design-system';
const { animationVariants } = designSystem;
```

Replace with:
```
import { staggerContainer, staggerItem, fadeVariants } from '@/components/shared/motion/motion-variants';
```

And update variant references:
- `variants={animationVariants.stagger}` → `variants={staggerContainer}`
- `variants={animationVariants.listItem}` → `variants={staggerItem}`
- `variants={animationVariants.fade}` → `variants={fadeVariants}`

After all migrations are complete, remove `animationVariants` from `src/lib/design-system.ts`.

---

## Task 13: Global Cleanup

### Remove dead code

1. Delete `src/imports/` directory entirely (38 files, 2.2MB). First verify nothing references it:
   ```bash
   grep -r "from.*imports/" src/ --include="*.tsx" --include="*.ts" | grep -v node_modules
   ```
   If any active imports found, move those specific files to proper locations first.

2. Delete duplicate docs from `src/`:
   - `src/Attributions.md` (duplicate of `src/guidelines/Attributions.md`)
   - `src/BUILD_PROGRESS.md` (duplicate)
   - `src/BUDGET_FUNCTIONALITY_REVIEW.md` (duplicate)
   - `src/NAVIGATION_UPDATE.md` (duplicate)

3. Clean stale git lock files:
   ```bash
   rm .git/index\ 2 .git/index\ 2.lock .git/index\ 3.lock .git/index\ 4.lock .git/index\ 5.lock .git/index\ 6.lock
   ```

### Pin wildcard versions in `package.json`

Replace `"*"` versions with actual installed versions:
```bash
# Check actual installed versions
npm ls clsx hono react-router tailwind-merge
```
Then pin them in `package.json`.

### Typography cleanup (if not already done in Phase 1)

Search and fix remaining violations:
- `font-semibold` → `font-medium` (design system says 500 max for UI, 700 only for hero stats)
- `font-bold` on non-hero text → `font-medium`
- `font-['Geist:Regular',sans-serif]` → remove entirely (Roboto is set globally)
- `font-['Inter',sans-serif]` → remove entirely
- Arbitrary sizes `text-[13px]`, `text-[15px]`, `text-[28px]` → nearest M3 token (`text-xs`, `text-sm`, `text-base`, `text-lg`, etc.)

### Colour token migration (if not already done in Phase 1)

Replace remaining hardcoded hex with CSS variables:
- `#FFCF4B` → `var(--mw-yellow-400)`
- `#1A2732` → `var(--mw-mirage)`
- `#0A0A0A` → `var(--neutral-900)`
- `#2C2C2C` → `var(--neutral-800)`
- `#525252` → `var(--neutral-600)`
- `#737373` → `var(--neutral-500)`
- `#E5E5E5` → `var(--neutral-200)`
- `#F5F5F5` → `var(--neutral-100)`
- `#FAFAFA` → `var(--neutral-50)`
- `#F8F7F4` → `var(--mw-off-white)`
- `#36B37E` → `var(--mw-success)`
- `#DE350B` → `var(--mw-error)`
- `#FACC15` → `var(--mw-warning)`
- `#0052CC` → `var(--mw-info)`

Remove non-brand colours:
- `#EF4444` (Tailwind red) → `var(--mw-error)`
- `#4CAF50` (Material green) → `var(--mw-success)`
- `#0A7AFF` / `#0065FF` (arbitrary blue) → `var(--mw-mirage)` or `var(--mw-info)` depending on context

---

## Task 14: Wire Up Modules to Shared Components

After all shared components are built, update each module to use them. Priority order:

### Dashboards (8 files — HIGHEST PRIORITY)
Every dashboard should use `ModuleDashboard` as its shell. Replace the current 100-400 line components with ~50 lines of tab + KPI + widget configuration. Follow the Figma design (node 204:22120) exactly for the tab bar underline style, KPI card layout, and widget grid.

Migration order: WelcomeDashboard → SellDashboard (matches Figma) → BookDashboard → remaining 5.

Pattern:
```tsx
<ModuleDashboard
  title="Dashboard"
  tabs={[
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="size-4" />,
      content: (
        <>
          <DashboardKPIRow kpis={MODULE_KPIS} />
          <DashboardGrid>
            <DashboardWidget title="Revenue" colSpan={2} actions={<ViewToggle ... />}>
              {/* Recharts */}
            </DashboardWidget>
            <DashboardWidget title="Recent activity" colSpan={2}>
              {/* Table or feed */}
            </DashboardWidget>
          </DashboardGrid>
        </>
      ),
    },
    // ... other tabs
  ]}
/>
```

### Kanban views (3 files)
- `sell/SellOpportunities.tsx` → `KanbanBoard` + `KanbanColumn` + `KanbanCard` with `onCardMove`
- `book/ExpenseKanban.tsx` → same pattern, 4 approval columns
- `make/MakeShopFloorKanban.tsx` → same pattern, 3 status columns

### Table views (41 files)
Replace all hand-built `<table>` elements with `MwDataTable` or `FinancialTable`. Wire up `FilterBar` in each table card.

### Schedule views (2 files)
- `make/MakeSchedule.tsx` → `GanttChart` component
- `plan/PlanScheduleTab.tsx` → `GanttChart` + `ScheduleCalendar` (tab toggle via `ViewToggle`)

### Detail sheets (8 files)
Replace hand-built sheet layouts with `DetailSheet`.

### Settings pages (7 files)
Already use `ModuleSettingsLayout` — verify consistency.

### Timeline views (3 files)
Replace inline timelines with `TimelineView`.

### Checklists (2 files)
Replace inline checklists with `Checklist` + `ChecklistItem`.

---

## Verification

After all tasks, run these checks:

```bash
cd src/components

# No remaining ShadCN defaults in shared components
for pattern in 'bg-popover' 'ring-ring' 'font-semibold' 'disabled:opacity-50' 'bg-primary\b' 'bg-accent\b' 'rounded-md\b'; do
  count=$(grep -rn "$pattern" shared/ --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  echo "$pattern: $count (should be 0)"
done

# No deprecated fonts
grep -rn "Geist\|Inter\|JetBrains\|Roboto Mono" --include="*.tsx" | grep -v node_modules | grep -v "animate-ui"
# Should return nothing

# No Tailwind greys
grep -rn "bg-slate-\|bg-gray-\|bg-zinc-\|text-slate-\|text-gray-\|text-zinc-" --include="*.tsx" | grep -v node_modules
# Should return nothing

# Shared component adoption
echo "ModuleDashboard imports:" && grep -rn "ModuleDashboard" --include="*.tsx" -l | wc -l
echo "DashboardKPIRow imports:" && grep -rn "DashboardKPIRow" --include="*.tsx" -l | wc -l
echo "MwDataTable imports:" && grep -rn "MwDataTable" --include="*.tsx" -l | wc -l
echo "StatusBadge imports:" && grep -rn "StatusBadge" --include="*.tsx" -l | wc -l
echo "StatCard imports:" && grep -rn "StatCard" --include="*.tsx" -l | wc -l
echo "KanbanBoard imports:" && grep -rn "KanbanBoard" --include="*.tsx" -l | wc -l
echo "PageShell imports:" && grep -rn "PageShell" --include="*.tsx" -l | wc -l

# No dead imports
grep -rn "from.*imports/" --include="*.tsx" --include="*.ts" | grep -v node_modules
# Should return nothing after cleanup

# Motion variants adopted
grep -rn "animationVariants" --include="*.tsx" | grep -v "design-system.ts"
# Should return nothing — all migrated to shared/motion/motion-variants.ts
```

---

## Final Directory Structure

```
src/components/shared/
├── dashboard/
│   ├── ModuleDashboard.tsx       — Shell with header, tab bar, content area
│   ├── DashboardKPIRow.tsx       — 4-card KPI grid matching Figma design
│   ├── DashboardGrid.tsx         — Responsive widget grid
│   ├── DashboardWidget.tsx       — Widget card wrapper with title + actions
│   └── AddWidgetButton.tsx       — Dashed-border add widget placeholder
├── cards/
│   ├── StatCard.tsx
│   ├── DarkAccentCard.tsx
│   ├── EntityCard.tsx
│   └── FlatCard.tsx
├── kanban/
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   ├── KanbanCard.tsx
│   ├── DraggableList.tsx
│   └── drag-styles.ts
├── datetime/
│   ├── DatePicker.tsx
│   ├── DateRangePicker.tsx
│   ├── DateTimePicker.tsx
│   ├── TimePicker.tsx
│   └── ScheduleCalendar.tsx
├── schedule/
│   ├── GanttChart.tsx
│   └── TimelineView.tsx
├── data/
│   ├── MwDataTable.tsx              (exists)
│   ├── MwSortableTable.tsx
│   ├── FinancialTable.tsx
│   ├── StatusBadge.tsx              (exists)
│   ├── ProgressBar.tsx
│   └── MetricBadge.tsx
├── forms/
│   ├── MwFormField.tsx              (exists)
│   ├── FormSection.tsx
│   ├── FormSheet.tsx
│   └── InlineEdit.tsx
├── feedback/
│   ├── EmptyState.tsx
│   ├── CardSkeleton.tsx             (exists)
│   ├── TableSkeleton.tsx            (exists)
│   ├── ConfirmDialog.tsx
│   └── Toast.tsx
├── layout/
│   ├── PageShell.tsx
│   ├── PageHeader.tsx
│   ├── KPIRow.tsx
│   ├── FilterBar.tsx
│   └── DetailSheet.tsx
├── charts/
│   ├── ChartCard.tsx
│   ├── chart-theme.ts
│   └── ChartTooltip.tsx
├── checklist/
│   ├── Checklist.tsx
│   └── ChecklistItem.tsx
├── navigation/
│   └── ViewToggle.tsx
├── ai/
│   ├── AIInsightCard.tsx            (exists — update to remove Geist ref, fix font-semibold)
│   └── IntelligenceHub.tsx          (exists)
├── settings/
│   └── ModuleSettingsLayout.tsx     (exists)
└── motion/
    ├── motion-variants.ts           (exists)
    └── use-reduced-motion.ts
```

**37 new files, 11 existing. Total: 48 shared components.**
