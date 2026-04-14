# Make Module — Figma vs Codebase Gap Analysis

**Date:** 31 March 2026
**Scope:** Make module sidebar, Manufacturing Orders, Work Orders, Shop Floor, Intelligence Hub
**Rule:** Use existing codebase design system and UX patterns, not Figma component library

---

## 1. Sidebar Navigation

### Figma Design (1255:46345)
Make sub-items: Dashboard, Schedule, Manufacturing Orders, Time Clock, Quality, Products, Settings

### Current Code
Make sub-items: Dashboard, Schedule, Shop Floor, Work, Issues, Settings

### Gaps

| Item | Figma | Code | Gap |
|------|-------|------|-----|
| Manufacturing Orders | Sidebar item, dedicated route | No dedicated sidebar item — MOs live within Shop Floor tabs and Work page | **Naming/routing mismatch** — Figma treats MOs as a first-class sidebar destination |
| Shop Floor | Not a sidebar item | Sidebar item at `/make/shop-floor` with 7 internal tabs | **Code has more** — Shop Floor is a mega-screen housing Overview, Kanban, Work Orders, Issues, Quality, Time Clock, Intelligence Hub |
| Time Clock | Sidebar item | Internal tab within MakeShopFloor | **Architecture difference** — Figma wants it as a sidebar route, code nests it in Shop Floor |
| Quality | Sidebar item | Internal tab within MakeShopFloor | **Same as Time Clock** — Figma wants standalone route |
| Products | Sidebar item | Missing entirely from Make | **Missing** — needs `/make/products` route |
| Work | Not a sidebar item in Figma | Sidebar item at `/make/work` | **Code has extra** |
| Issues | Not a sidebar item in Figma | Sidebar item at `/make/issues` | **Code has extra** — Figma puts Issues as a tab within MO detail |

### Key Decision
The fundamental architecture differs. Figma treats Manufacturing Orders as the primary view with tabs inside (Overview, Work, Issues, Intelligence Hub). Code spreads functionality across Shop Floor (mega-tab-container) and separate sidebar routes. The Figma approach is cleaner and aligns with the Plan module pattern (Jobs list → Job detail with tabs).

**Recommendation:** Restructure Make sidebar to match Figma: Dashboard, Schedule, Manufacturing Orders, Time Clock, Quality, Products, Settings. This means pulling Time Clock and Quality out of the Shop Floor mega-screen into their own routes.

---

## 2. Manufacturing Order Detail — Multi-Screen Layout

### Figma Design (1255:46345)
MO detail page shows:
- **Header:** "Mounting Bracket Assembly" + Job #1210 badge + "In Progress" status badge
- **Subtitle:** "Manufacturing Order started by M. Johnson on Dec 5, 2025"
- **Actions:** "Print Traveler" (outline) + "Add Work Order" (black/primary)
- **Breadcrumb:** Home > Make > Manufacturing Orders > MO-2024-001
- **Tabs:** Overview, Work (active), Issues, Intelligence Hub (4 tabs)
- **Work tab content:** Collapsible MO sections with nested Work Order cards

This follows the same full-page detail pattern as Plan's PlanJobDetail and Sell's SellCustomerDetail — `JobWorkspaceLayout` already exists at `src/components/shared/layout/JobWorkspaceLayout.tsx` and should be used here.

### Current Code
- **No dedicated MO detail page exists**
- `MakeShopFloor.tsx` is a 7-tab container (Overview, Kanban, Work Orders, Issues, Quality, Time Clock, Intelligence Hub)
- `WorkTab.tsx` shows collapsible MO list with nested WO cards (closest match to Figma)
- `WorkOrderFullScreen.tsx` is a full-screen overlay for individual WO detail
- No breadcrumb navigation for MO detail

### Gaps

| Area | Figma | Code | Gap |
|------|-------|------|-----|
| MO detail page | Full-page with 4 tabs (Overview, Work, Issues, Intelligence Hub) | No dedicated page — functionality spread across ShopFloor tabs | **Major structural gap** — needs MO detail page following PlanJobDetail pattern |
| Tab count | 4 tabs | 7 tabs in ShopFloor (but different scope) | Architecture mismatch |
| Tab style | Segmented control (rounded pill with shadow, same as shadcn Tabs) | Custom pill buttons in PlanJobDetail, custom tabs in ShopFloor | **Should use shared tab component** |
| Breadcrumb | Home > Make > Manufacturing Orders > MO-ID | No breadcrumb on MO detail | **Missing breadcrumb** |
| Print Traveler button | Prominent action in header | Not present | **Missing action** |
| Add Work Order button | Prominent black CTA in header | Not present as standalone action | **Missing action** |
| MO header info | Job badge, status badge, subtitle with operator and date | Simpler header in WorkTab | **Needs enrichment** |

### Recommended Actions
1. **Create `MakeManufacturingOrderDetail.tsx`** — full-page MO detail following PlanJobDetail/SellCustomerDetail pattern with 4 tabs
2. **Adopt `JobWorkspaceLayout.tsx`** (exists at `src/components/shared/layout/JobWorkspaceLayout.tsx`) for the Overview tab
3. **Route:** `/make/manufacturing-orders/:id` with tabs for Overview, Work, Issues, Intelligence Hub
4. **Add "Print Traveler" and "Add Work Order" actions** to the header
5. **Migrate relevant content** from ShopFloor tabs into MO detail tabs

---

## 3. Work Orders — Nested List View

### Figma Design (1255:46345)
The Work tab within MO detail shows:
- **Collapsible MO groups** — each MO header shows: MO ID, product name, unit count badge, due date, priority (colour-coded), customer
- **Nested Work Orders** within each MO:
  - WO ID | Part name | workstation badge (e.g., CNC-01, Pack-Station, Laser-01)
  - Progress bar (full-width, black fill)
  - Percentage | units done/total | status badge (In Progress / Pending)
  - Chevron for expand/navigation
- Yellow left border indicator on active/selected WO
- Search bar: "Search work orders..."
- Filter + View buttons

### Current Code
- **`WorkTab.tsx`** — collapsible MO list with nested WO cards (structurally similar)
- **`WorkOrderFullScreen.tsx`** — full-screen overlay for WO detail with live timer, progress, materials BOM, CAD viewer

### Gaps

| Area | Figma | Code | Gap |
|------|-------|------|-----|
| WO list structure | Collapsible MOs with nested WOs | Similar pattern exists in WorkTab | **Good alignment** — minor styling differences |
| Progress bar style | Full-width black bar with percentage | Progress exists but styling may differ | **Minor styling alignment** |
| Workstation badge | Per-WO badge showing machine assignment (CNC-01, Laser-01) | May exist in WO card | **Verify badge styling** |
| Yellow left border | Active WO indicator | MW-YELLOW-400 left border pattern exists in codebase | **Should align** |
| Search + Filter | Prominent search bar + Filter/View buttons | May exist in WorkTab | **Verify presence** |
| Unit count display | "75/100 units" format with status badge | Exists in WorkOrderFullScreen | **Verify in list view** |

### Recommended Actions
1. **Verify WorkTab styling** matches Figma's progress bar and badge patterns
2. **Add workstation badge** to WO cards if not present
3. **Ensure yellow left border** on active/selected WO
4. **Add search + filter bar** to Work tab if missing

---

## 4. Shop Floor Overview & Andon Board

### Figma Design
The Make overview Figma page (201:19589) is a high-level section map listing:
- Dashboard (Production execution)
- Work Orders (Job execution)
- Machines (Equipment management)
- Quality (In-process QC)
- Materials (Shop floor inventory)
- Teams (Shift management)
- Reports (Production analytics)
- Maintenance (Equipment care)

### Current Code
- **`MakeDashboard.tsx`** — Andon board with machine status grid, KPI cards (Running/Down/Avg Utilisation)
- **`OverviewTab.tsx`** — Active jobs, shift performance, andon alerts, MO table, inline AI insights

### Gaps

| Area | Figma | Code | Gap |
|------|-------|------|-----|
| Machines screen | "Equipment management" as dedicated section | Machine status in Dashboard only | **No dedicated Machines page** — needs `/make/machines` or within MO detail |
| Materials screen | "Shop floor inventory" as dedicated section | `MaterialsModal` exists as modal only | **No dedicated Materials page** |
| Teams screen | "Shift management" as dedicated section | Time Clock tab handles clock-in/out only | **No team/shift management page** |
| Reports screen | "Production analytics" as dedicated section | Intelligence Hub tab covers analytics | **Reports may be covered by Intelligence Hub** |
| Maintenance screen | "Equipment care" as dedicated section | Not present at all | **Missing entirely** |

### Note
The Figma overview page appears to be a planning/sitemap view rather than a UI design. The section descriptions suggest future expansion areas. Current code covers the core paths (Dashboard, Schedule, Work Orders, Quality, Time Clock) well. Machines, Materials, Teams, Reports, and Maintenance are expansion areas.

---

## 5. Time Clock

### Figma Design
Time Clock appears as a sidebar item (standalone route).

### Current Code
- **`TimeClockTab.tsx`** (438 lines) — 4-digit PIN clock-in/out, real-time elapsed timer, break management, timesheet history, touch-optimized
- Currently a tab within MakeShopFloor, not a standalone route

### Gap
**Routing only** — the component exists and is feature-rich. Needs to be accessible as `/make/time-clock` sidebar route in addition to (or instead of) being a ShopFloor tab.

---

## 6. Quality

### Figma Design
Quality appears as a sidebar item (standalone route).

### Current Code
- **`QualityTab.tsx`** (29.5 KB) — 4 internal tabs: Overview, Active Issues, Inspections, Reports
- **`DefectReportModal.tsx`** — photo evidence, defect type, auto NCR generation
- **`MakeSettings.tsx`** quality panel — inspection type, sampling rate, photo requirements, NCR auto-creation
- Currently a tab within MakeShopFloor, not a standalone route

### Gap
**Routing only** — the component is comprehensive. Needs `/make/quality` sidebar route.

---

## 7. Intelligence Hub within Make

### Figma Design (1255:46345)
Intelligence Hub appears as a tab within MO detail (4th tab: Overview, Work, Issues, Intelligence Hub).

### Current Code
- **`IntelligenceHubTab.tsx`** (23.6 KB) — AI insights across 6 categories: Efficiency, Quality Alerts, Scheduling, Material Alerts, Performance Trends, Risk Warnings
- Each insight has severity, analysis block, recommendations, action buttons
- **`VoiceInterfaceMobile.tsx`** — voice queries integration
- Currently a tab within MakeShopFloor

### Gap
**Context mismatch** — Figma scopes Intelligence Hub to a specific MO. Code scopes it to the entire Shop Floor. Both are valid but serve different purposes.

**Recommendation:** Keep the shop-floor-wide Intelligence Hub AND add a scoped version within MO detail (similar to Plan's approach where PlanIntelligenceHubTab exists within job detail AND shared IntelligenceHub exists as a reusable component).

---

## 8. Schedule

### Figma Design (1255:46345 sidebar)
Schedule appears as a Make sidebar item.

### Current Code
- **`MakeSchedule.tsx`** — Gantt, Calendar, List views for MOs
- Uses shared `GanttChart` and `ScheduleCalendar` components
- Already has its own route at `/make/schedule`

### Gap
**Good alignment** — Schedule is already a standalone route with 3 view modes. Compare visuals with Figma for any styling differences.

---

## 9. Cross-Cutting Design System Gaps

| Pattern | Expected | Actual in Make | Gap |
|---------|----------|----------------|-----|
| MO detail page | Full-page with tabs (like PlanJobDetail) | No MO detail page — mega ShopFloor tabs instead | **Major structural gap** |
| Two-column layout | `JobWorkspaceLayout` (exists at `src/components/shared/layout/JobWorkspaceLayout.tsx`) | Not used — ShopFloor is full-width tabs | **Needs adoption** — adopt JobWorkspaceLayout for MO detail page |
| Tab style | Segmented control (Figma) or shared pill tabs | Custom per-component | **Should use shared tab component** |
| Page wrapper | `PageShell` + `PageHeader` | Used in MakeDashboard, MakeSchedule | **Good** — already adopted in some screens |
| Breadcrumb | Present in Figma MO detail | Missing in ShopFloor | **Needs adding** to MO detail |
| Products page | Sidebar item | Not present in Make | **Missing route** |

---

## 10. Scraps / Waste Section

Per instruction: **ignored** (Figma node 1499:47056).

---

## 11. Priority Summary

### High Priority (structural gaps)
1. **Create MO detail page** (`MakeManufacturingOrderDetail.tsx`) — full-page with 4 tabs (Overview, Work, Issues, Intelligence Hub) following PlanJobDetail pattern
2. **Restructure Make sidebar** — add Manufacturing Orders, Time Clock, Quality, Products as standalone routes; remove Shop Floor mega-container
3. **Adopt `JobWorkspaceLayout`** (exists at `src/components/shared/layout/JobWorkspaceLayout.tsx`) for MO Overview tab
4. **Add `/make/manufacturing-orders/:id` route** with breadcrumb navigation

### Medium Priority (feature completeness)
5. **Pull Time Clock and Quality** out of ShopFloor into standalone routes
6. **Add Products page** at `/make/products`
7. **Add "Print Traveler" + "Add Work Order" actions** to MO detail header
8. **Scope Intelligence Hub** — add MO-level version alongside shop-floor-wide version

### Low Priority (polish)
9. **Align WO card styling** — progress bars, workstation badges, yellow left border
10. **Add search + filter** to Work Orders list
11. **Standardise tab component** across Make screens
12. **Future expansion:** Machines, Materials, Teams, Maintenance screens (from Figma sitemap)

---

## Key Architectural Decision

The Make module has a fundamental structural difference from Figma. The code organises around a **ShopFloor mega-screen** (7 tabs covering everything from work orders to quality to time clock). Figma organises around **Manufacturing Orders as the primary entity** with focused tabs, and other features (Time Clock, Quality) as standalone sidebar routes.

The Figma approach is more consistent with:
- How Plan organises around Jobs
- How Sell organises around Opportunities/Customers
- The `JobWorkspaceLayout` pattern (exists at `src/components/shared/layout/JobWorkspaceLayout.tsx`)

**Recommended path:** Create the MO detail page as the primary view, keep ShopFloor overview as the dashboard/andon board, and promote Time Clock and Quality to standalone routes. This doesn't require deleting existing components — mostly re-routing and creating a new MO detail wrapper.
