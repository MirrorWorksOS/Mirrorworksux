# Plan Module — Figma vs Codebase Gap Analysis

**Date:** 31 March 2026
**Scope:** Plan module sidebar, Jobs, NC Connect, Intelligence Hub
**Rule:** Use existing codebase design system and UX patterns, not Figma component library

---

## 1. Sidebar Navigation

### Figma Design
Plan sub-items: Dashboard, Jobs, Activities, Schedule, Purchase, Quality, Products, Settings

### Current Code
Plan sub-items: Dashboard, Jobs, Activities, Purchase, QC Planning, Products, Settings

### Gaps

| Item | Figma | Code | Gap |
|------|-------|------|-----|
| Schedule | Present as sidebar item | Only exists as a tab inside PlanJobDetail | **Missing sidebar route** — needs `/plan/schedule` page showing cross-job overview schedule |
| Quality vs QC Planning | "Quality" | "QC Planning" | **Naming mismatch** — decide on one label |
| Order of items | Dashboard, Jobs, Activities, Schedule, Purchase, Quality, Products, Settings | Dashboard, Jobs, Activities, Purchase, QC Planning, Products, Settings | Schedule is missing and ordering differs |

**Note on Schedule:** The Figma design (node 331:188871) shows a standalone schedule page with an overview of all jobs. The existing `PlanScheduleTab.tsx` is scoped to a single job's operations (9 hardcoded operations for one job, Gantt + Calendar toggle). The sidebar Schedule route should be a cross-job overview, while the tab within job detail remains the per-job view.

**Effort:** Medium — add Schedule route, sidebar entry, and build a cross-job schedule overview component. Rename QC Planning if needed.

---

## 2. Job Detail — Multi-Screen Layout

### Figma Design (816:18584)
The job layout shows:
- Tabs: Overview, Production, Intelligence Hub (3 visible tabs, not 5)
- A "Materials to produce" table with columns: checkbox, Part, Route, To produce, Inventory, UoM, Status, Responsible
- Inline editing with save button
- The layout implies a structured two-column workspace

### Current Code
- **PlanJobDetail.tsx** — 5 tabs: Overview, Production, Schedule, Intelligence Hub, Budget
- **PlanOverviewTab.tsx** — 65/35 grid split (left: job details form + products table + budget summary; right: calendar, intelligence preview, files, chatter)
- Tab implementation: fully custom buttons, not using shared shadcn `Tabs` component
- Products table: raw `<table>`, not `MwDataTable`

### Sell Module Reference Pattern
The Sell module already has this multi-page layout in two forms:
- **`SellOpportunityDetail.tsx`** — 560px Sheet slide-over (3 tabs: overview, activities, notes, underline tab style)
- **`SellCustomerDetail.tsx`** — Full-page 65/35 split (6 tabs: overview, sales, accounting, contacts, documents, activity, pill tab style). Its header comment says: "Follows PlanJobDetail tab pattern with 65/35 two-column overview"

Both Plan and Sell use the same inline pattern for the 65/35 split: `grid grid-cols-1 lg:grid-cols-3 gap-6 p-6` with `lg:col-span-2` for the left column. `JobWorkspaceLayout` already exists at `src/components/shared/layout/JobWorkspaceLayout.tsx` — it uses PageShell, PageHeader, and shadcn Tabs with pill-style TabsTrigger and count badges.

### Gaps

| Area | Figma | Code | Gap |
|------|-------|------|-----|
| Tab count | 3 tabs visible | 5 tabs | Code has more tabs — likely intentional evolution |
| Tab component | Standard tab bar | Custom `<button>` elements | **Should use shared pattern** — both Plan and Sell duplicate the same pill-style tab code |
| Products table | Checkbox selection, Route column, structured columns | Raw `<table>`, no checkboxes, no Route column | **Needs MwDataTable**, add checkbox selection and Route column |
| Two-column workspace | Structured workspace layout | Basic CSS grid inline in each module | **`JobWorkspaceLayout.tsx` exists** at `src/components/shared/layout/JobWorkspaceLayout.tsx` — uses PageShell, PageHeader, and shadcn Tabs with pill-style TabsTrigger and count badges |
| Save pattern | Inline save button at section level | Save buttons per card | Figma is cleaner — single save context |

### Recommended Actions
1. **`src/components/shared/layout/JobWorkspaceLayout.tsx` already exists** — uses PageShell, PageHeader, and shadcn Tabs with pill-style TabsTrigger and count badges
2. **Refactor PlanJobDetail and PlanOverviewTab** to use JobWorkspaceLayout
3. **Replace raw `<table>` with `MwDataTable`** in products section — add checkbox selection and Route column
4. **Extract shared tab pattern** — both PlanJobDetail and SellCustomerDetail duplicate the same pill-style tab code with count badges

---

## 3. NC Connect with Smart Nesting

### Figma Design (933:37498)
A full dedicated screen with:
- **File upload area** — upload, replace, delete NC files
- **G-code preview panel** — syntax-highlighted code block showing Fanuc G-code (G90, G94, G17, etc.)
- **File validation section:**
  - Format: Valid (green badge)
  - Post-processor: Fanuc Generic
  - Tools T1-T12 found in header
  - Matches work order spec
  - Fits within machine envelope
  - Post-processor warning with "View details" link
- **Machine status cards** (3 machines):
  - Haas VF-2 — Sent, Idle, envelope/spindle/tools info, "View on Machine" button
  - Doosan DNM 5700 — Running, "Add to Queue" button
  - Mazak QTN 200 — Turning Center, Error state
- Each machine card shows: status badge, machine type, envelope, spindle, tools, readiness indicator

### Current Code
- **No NC Connect screen exists**
- NC files column slot in `PlanProductionTab.tsx` products table (upload placeholder only)
- Nesting instructions field in routing operations table (optional upload)
- Scrap allowance toggle in Settings
- Spec document references this as Phase 2+

### Gaps — This is the largest gap

| Area | Figma | Code | Gap |
|------|-------|------|-----|
| Dedicated screen | Full NC Connect page | Nothing | **Entirely missing** |
| G-code viewer | Syntax-highlighted code block | Nothing | Needs a code preview component |
| File validation | 5-point validation checklist with status badges | Nothing | Needs validation engine + UI |
| Machine integration | 3 machine status cards with live state | Nothing | Needs machine registry + status API |
| File management | Upload, replace, delete with drag-drop | Column slot only | Needs full file management UI |
| Smart nesting | Implied by name, envelope fitting check | Nothing | Needs nesting logic or integration |

### Recommended Approach
This is a major feature. Break into phases:

**Phase 1 — NC File Management**
- New route: `/plan/jobs/:id/nc-connect` or as a tab/drawer within job detail
- File upload component (reuse existing patterns from Files card in Overview)
- G-code preview component (use a code block with basic syntax highlighting)
- Basic file validation UI (format check, tool list extraction)

**Phase 2 — Machine Integration**
- Machine registry data model (name, type, status, capabilities)
- Machine status cards component
- Queue management (add to queue, view on machine)
- Envelope/spindle/tools spec display

**Phase 3 — Smart Nesting**
- Nesting visualisation (2D sheet layout)
- Material utilisation metrics
- Scrap/offcut tracking integration

### New Components Needed
- `NCConnectScreen.tsx` or `NCConnectTab.tsx`
- `GCodePreview.tsx` — code block with line numbers
- `FileValidationCard.tsx` — checklist with status badges
- `MachineStatusCard.tsx` — machine info with status, specs, actions
- `NCFileUpload.tsx` — drag-drop file management

---

## 4. Intelligence Hub

### Figma Design (331:189502)
Full-width intelligence hub within job detail showing:
- **Customer Engagement timeline** — vertical timeline with coloured event dots (Quote opened, confirmed, sent by email)
- **Budget tracker table** — Category, Budget, Spent, Remaining, Progress with progress bars
- **AI Bot presence** — bot icon, AI-generated insights
- Tabs visible: Overview, Production, Customer Engagement (different tab naming)

### Current Code
- **`PlanIntelligenceHubTab.tsx`** exists with:
  - Quote status timeline (vertical, coloured dots — blue standard, yellow active)
  - Budget tracker table
  - Hardcoded AI insight card (prototype text)
  - 6-card files grid (PDFs + XLSXs with thumbnails)
  - Full threaded chatter (AI messages, user messages, system events, voice input placeholder)
- **Shared `IntelligenceHub.tsx`** (201 lines) — reusable insight panel with 5 insight types
- **`AIInsightCard.tsx`** — individual insight card component
- **`AiCommandBar.tsx`** — natural language command input
- **Edge function stub** for Claude API integration (not yet live)

### Gaps

| Area | Figma | Code | Gap |
|------|-------|------|-----|
| Customer engagement timeline | Clean vertical timeline with event types | Exists but simpler — quote status dots only | **Enhance timeline** — add more event types (email sent, confirmed, etc.) |
| Budget tracker | Category/Budget/Spent/Remaining/Progress | Exists with similar structure | **Minor alignment** — match column naming |
| AI insights | Bot icon, AI-generated content | Hardcoded prototype data, shared component exists | **Wire up live AI** — edge function stub exists but not connected |
| Tab naming | "Customer Engagement" visible | "Intelligence Hub" | **Naming difference** — code name is better for the broader scope |
| Files grid | Not prominent in this view | 6-card grid with thumbnails | Code has more — keep it |
| Chatter | Not visible in this Figma frame | Full threaded chatter | Code has more — keep it |

### Recommended Actions
1. **Enhance the quote timeline** — add event types beyond just status changes (email sent, document uploaded, call logged)
2. **Connect AI insights to backend** — the edge function stub exists, wire it to the shared `IntelligenceHub` component
3. **Keep the richer code version** — the codebase Intelligence Hub tab has more features than the Figma shows

---

## 5. Standalone Schedule Page

### Figma Design (331:188871)
Shows a schedule overview across all jobs — not scoped to a single job. This is a planning-level view for production scheduling.

### Current Code
- **`PlanScheduleTab.tsx`** (152 lines) — exists only as a tab within PlanJobDetail
- Scoped to single job: 9 hardcoded operations for "Server Rack Chassis"
- Gantt + Calendar toggle using shared `GanttChart` and `ScheduleCalendar` components
- Uses `IconViewToggle` for view switching
- **No `/plan/schedule` route exists**

### Gap
A standalone `/plan/schedule` page is needed that shows:
- All jobs across a time horizon (not just one job's operations)
- Resource/workstation allocation view
- Drag-to-reschedule capability
- Filtering by stage, priority, workstation

The existing `GanttChart` and `ScheduleCalendar` shared components can be reused, but need to be fed cross-job data instead of single-job operations.

---

## 6. Cross-Cutting Design System Gaps

Patterns where the code doesn't consistently use its own design system:

| Pattern | Expected | Actual | Files Affected |
|---------|----------|--------|----------------|
| Data tables | `MwDataTable` component | Raw `<table>` in PlanOverviewTab | `PlanOverviewTab.tsx` products table |
| Tab navigation | Shared tab component | Custom `<button>` elements duplicated across modules | `PlanJobDetail.tsx`, `SellCustomerDetail.tsx` |
| Page wrapper | `PageShell` + `PageHeader` | Fully bespoke header | `PlanJobDetail.tsx` |
| Progress bars | Shared `ProgressBar` component | Inline `div` progress bars | `PlanOverviewTab.tsx` budget section |
| Two-column layout | `JobWorkspaceLayout` (exists at `src/components/shared/layout/JobWorkspaceLayout.tsx`) | Inline `grid-cols-3` duplicated | `PlanOverviewTab.tsx`, `SellCustomerDetail.tsx` |
| Status badges | `StatusBadge` component | Inline badge styling | Multiple locations |

---

## 7. Priority Summary

### High Priority (structural gaps)
1. **Refactor PlanJobDetail and PlanOverviewTab to use `JobWorkspaceLayout`** — the component already exists at `src/components/shared/layout/JobWorkspaceLayout.tsx`; it uses PageShell, PageHeader, and shadcn Tabs with pill-style TabsTrigger and count badges
2. **NC Connect screen** — Phase 1 file management and G-code preview (largest gap)
3. **Add Schedule standalone page** — cross-job overview at `/plan/schedule`
4. **Extract shared tab component** — deduplicate pill-style tabs with count badges

### Medium Priority (consistency)
5. **Refactor products table to `MwDataTable`** — add checkboxes, Route column
6. **Use `PageShell`/`PageHeader`** in job detail for consistency
7. **Enhance Intelligence Hub timeline** with richer event types
8. **Refactor SellCustomerDetail** to use JobWorkspaceLayout

### Low Priority (polish)
9. **Rename QC Planning → Quality** (or confirm the preferred label)
10. **Replace inline progress bars** with shared component
11. **Wire up AI insights** to live backend (edge function stub ready)
12. **Standardise StatusBadge usage** across Plan module
