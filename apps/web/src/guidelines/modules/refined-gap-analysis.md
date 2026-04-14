# Refined Gap Analysis — Sell, Plan, Make + End-to-End Flow

**Date:** 1 April 2026
**Scope:** Sell → Plan → Make → Book end-to-end job flow, 4-page record layouts, factory floor UX, AI/Intelligence Hub
**Sources:** Figma designs (Sell opportunity `284:170765`, Make MO detail `1255:46346`), codebase audit, SD-BIZ 01 PDF (AI Automation Opportunities)
**Rule:** Use existing codebase design system (shadcn + MW tokens), not Figma component library

---

## 1. End-to-End Job Flow: Current State

The full lifecycle of a manufacturing job:

```
Sell → Opportunity → Quote → Order
  ↓
Plan → Job → Schedule → NC Connect
  ↓
Make → Manufacturing Order → Work Order (factory floor)
  ↓
Book → Invoice → Payment
```

### What exists today

| Stage | List page | Record detail | Drill-in / full-screen | Linked forward | Linked back |
|-------|-----------|---------------|------------------------|----------------|-------------|
| **Sell Opportunity** | `/sell/opportunities` (kanban) | `/sell/opportunities/:id` (4-tab JobWorkspaceLayout) | — | Quote builder exists; no order conversion | — |
| **Sell Order** | `/sell/orders` (table) | — no detail page — | — | No link to Plan job | Opportunity ref shown |
| **Plan Job** | `/plan/jobs` (table) | `PlanJobDetail` (5-tab JobWorkspaceLayout, modal-based) | — | No link to Make MO | Quote ID in header |
| **Make MO** | `/make/manufacturing-orders` (table) | `/make/manufacturing-orders/:id` (4-tab JobWorkspaceLayout) | `WorkOrderFullScreen` (factory floor overlay) | No link to Book invoice | Job number in header |
| **Book Invoice** | `/book/invoices` (table) | — no detail page — | — | — | No link to originating order |

### Critical flow gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **Sell Order → Plan Job:** No "Convert to Job" action or link from Sell orders to Plan | Breaks the handoff; users must manually create jobs | **P0** |
| **Plan Job → Make MO:** No "Create Manufacturing Order" action from job detail | Schedulers must context-switch to Make and manually link | **P0** |
| **Make MO → Book Invoice:** No "Generate Invoice" or link to Book module | Billing disconnected from production completion | **P1** |
| **Sell Order detail page:** Missing entirely — no `/sell/orders/:id` route | Users can't view or manage individual orders | **P0** |
| **Book Invoice detail page:** Missing — no `/book/invoices/:id` route | Users can't view invoice details | **P1** |
| **Cross-module breadcrumb trail:** Each record shows its own module breadcrumbs but never links to the upstream/downstream record | Users lose context of the full job lifecycle | **P1** |
| **Global job search:** No way to search across modules by job ID | Common task for managers tracking a job end-to-end | **P2** |

---

## 2. Sell Module — "Particularly Light"

### 2.1 Current state: 60% designed, 20% wired, 20% missing

The Sell module has surface-level pages for all major areas but lacks depth. Most pages are list/table views with no record detail drill-ins.

### 2.2 Opportunity page (4-tab layout) — Figma vs Code

The opportunity page at `/sell/opportunities/:id` uses `JobWorkspaceLayout` with 4 tabs:

| Tab | Figma (node `284:170765`) | Code (`SellOpportunityPage.tsx`) | Gap |
|-----|---------------------------|----------------------------------|-----|
| **Overview** | 65/35 layout, customer card, opportunity details form, quote summary, activity timeline | 65/35 layout with details form, quotes table, timeline, AI card | Close match — minor field differences |
| **Activities** | Full activity log with calendar view, "New Activity" multi-field form | Basic timeline only — no calendar, no structured new activity form | **P1** — Missing activity calendar (`294:177483`) and new activity flow |
| **Quotes** | Quote pipeline within opportunity, version history, PDF preview | Missing as a tab entirely — quote builder exists at `/sell/quotes/new` but not linked as tab | **P1** — No Quotes tab on opportunity |
| **Intelligence Hub** | Full AI panel with win probability, competitor analysis, recommended actions, engagement scoring | Only a single `AIInsightCard` on overview sidebar | **P0** — Intelligence Hub surface is 10% of Figma design |

### 2.3 Missing Sell pages and features

| Missing item | Figma reference | Effort | Priority |
|--------------|-----------------|--------|----------|
| **Sell Order Detail** (`/sell/orders/:id`) — 4-tab workspace: Overview, Line Items, Fulfilment, Documents | Orders list block `204:25027` | Medium | **P0** |
| **Dashboard sub-tabs:** Analysis, Reports, Forecasts | `204:22632`, `204:23161`, `480:246893` | Medium | **P0** |
| **Activities sidebar item** + activities list page | Figma IA labels Activities as first-class | Small | **P1** |
| **Quotes list page** at `/sell/quotes` | Figma shows Quotes as discoverable area | Small | **P1** |
| **Intelligence Hub** as sidebar item or tab | `284:170764` | Medium | **P0** |
| **New Invoice flow** from opportunity/order | `294:171225` | Medium | **P1** |
| **Recent Sales leaderboard** on dashboard (rep avatars, Target vs Actual) | `204:22120` | Small | **P1** |
| **Activity Calendar** view on opportunity | `294:177483` | Medium | **P1** |
| **Convert Opportunity → Order** action button | Not in Figma but critical for flow | Small | **P0** |
| **Convert Order → Job** action button (links to Plan) | Not in Figma but critical for flow | Small | **P0** |

### 2.4 Sell AI / Intelligence Hub gaps

The Figma Intelligence Hub for Sell shows:

- **Win probability score** (ML-based, 0–100%) with contributing factors
- **Competitor analysis** (detected from email/call transcripts)
- **Recommended next actions** (contextual: "Send revised quote", "Schedule site visit")
- **Customer engagement scoring** (email opens, response times, meeting frequency)
- **Deal velocity tracking** (days in stage vs average, acceleration/deceleration)

**Current code:** A single `AIInsightCard` on the overview sidebar with hardcoded text. No probability, no competitor data, no recommended actions.

---

## 3. Plan Module — Remaining Gaps

The Plan module is the most complete of the three. After the previous gap analysis implementation, the main remaining gaps are:

| Gap | Current state | Needed | Priority |
|-----|---------------|--------|----------|
| **Job detail is modal-based** | `PlanJobDetail` renders inside `PlanJobs` via state toggle, not a URL route | Should be `/plan/jobs/:id` with `useParams` for deep-linking, back-button support | **P0** |
| **NC Connect not linked from Job** | `PlanNCConnect` exists at `/plan/nc-connect` standalone | Should also be accessible as a tab within PlanJobDetail (currently referenced in spec but not wired) | **P1** |
| **Create MO from Job** | No action exists | "Create Manufacturing Order" button on job detail, linking to Make | **P0** |
| **Budget tab data** | Static mock data | Connect to actual cost tracking (future backend) | **P2** |
| **Intelligence Hub: predictive schedule** | 3 static AI insight cards | Should show schedule risk prediction, resource conflict detection, critical path analysis | **P1** |
| **QC Planning rename** | Sidebar shows "Quality" (matches Figma) | Route is still `/plan/qc-planning` — consider alias or rename | **P2** |

---

## 4. Make Module — Factory Floor + Office Gap

### 4.1 The Two-Mode Problem

The Make module serves two distinct user contexts:

1. **Office mode** — Supervisors/managers reviewing MOs, scheduling, tracking progress (standard density, mouse/keyboard)
2. **Factory floor mode** — Operators interacting with work orders (large touch targets, high contrast, distance-viewable, minimal text)

**What's excellent:** `WorkOrderFullScreen` is a best-in-class factory floor interface:
- 160px play/pause button with 56px timer text
- 64px +/- buttons for parts counting with donut progress
- 56px PASS/FAIL/HOLD quality buttons with tactile press effects
- 56px Emergency Stop button with pulse animation
- Live Cam / CAD toggle with Vimeo video feeds
- Machine performance banner with real-time cycle time vs target
- Assembly instruction checklist with instruction images
- 48px minimum touch targets throughout
- Online/Offline indicator
- Operator card with avatar

**What's missing from Figma (`1255:46346`) but not in code:**

| Missing element | Figma shows | Current code | Priority |
|-----------------|-------------|--------------|----------|
| **Entry point from MO detail** | Clicking a WO in the MO detail opens WorkOrderFullScreen | WO rows in MO detail have `ChevronRight` but no click handler — `WorkOrderFullScreen` only accessible from `MakeShopFloor` Work tab | **P0** |
| **Machine status dashboard** | Large KPI tiles showing machine utilisation, OEE, uptime — factory-floor density (big numbers, colour-coded) | `MakeDashboard` has metrics but at office density | **P1** |
| **Quick WO switcher** | "Next: MO-26-402" in bottom bar is clickable, swipe between WOs | Bottom bar exists with "Next" label but no navigation wired | **P1** |
| **Voice notes / voice command** | Mic button for hands-free defect reporting | Not implemented | **P2** |
| **Barcode/QR scanning** | Scan to open WO, scan material batches | Not implemented | **P2** |
| **Offline mode** | Full offline capability with sync indicator | Online/Offline toggle exists as UI but no actual offline storage | **P2** |
| **Multi-camera angles** | Camera selector for different machine angles | Single Vimeo feed; no camera switching | **P2** |

### 4.2 MO Detail page — Office mode gaps

The `MakeManufacturingOrderDetail` (4-tab layout) is good but office-density throughout. Gaps:

| Gap | Detail | Priority |
|-----|--------|----------|
| **WO click → full-screen** | Work tab WO rows are clickable (cursor-pointer) but have no `onClick` — should open `WorkOrderFullScreen` | **P0** |
| **Schedule/Gantt per MO** | No schedule visualisation within MO detail (Plan jobs have this) | **P1** |
| **Documents tab** | Figma shows a Documents tab (drawings, BOMs, travellers) — code has 4 tabs, no Documents | **P1** |
| **Cost tracking** | No cost/budget section (Plan jobs have PlanBudgetTab) | **P2** |
| **Print Traveler** | Button exists but no print layout or PDF generation | **P2** |

### 4.3 Shop Floor overview gaps

`MakeShopFloor` (3 tabs: Overview, Kanban, Work Orders) serves as the floor supervisor view.

| Gap | Detail | Priority |
|-----|--------|----------|
| **Overview factory-floor mode** | OverviewTab uses office density — should have a "floor mode" toggle showing large KPI tiles, colour-coded machine status, distance-viewable numbers | **P1** |
| **WO click → full-screen** | WorkTab WO click sets `selectedWorkOrder` state → opens `WorkOrderFullScreen` — this works but only from the Shop Floor, not from MO detail | **P0** (same as above) |
| **SPC charts** | No statistical process control visualisation | **P2** |
| **Real-time machine data** | All machine status is mock/static | **P2** (backend dependency) |

---

## 5. AI Implementation & Intelligence Hub

### 5.1 Current AI surfaces in codebase

| Component | Location | Content |
|-----------|----------|---------|
| `AIInsightCard` | Shared component | Static text card with sparkle icon, used in ~8 places |
| `AIInsightMessage` | Shared component | Inline AI message variant |
| `AiCommandBar` | Module dashboards | Natural language search bar (UI only, no backend) |
| Intelligence Hub tabs | PlanJobDetail, MakeManufacturingOrderDetail | 3 static AIInsightCards each + timeline |
| Sell overview AI | SellOpportunityPage | 1 static AIInsightCard in sidebar |

**All AI content is hardcoded mock data with no backend integration.**

### 5.2 AI Automation Opportunities (from SD-BIZ 01 PDF)

The PDF identifies six priority AI implementations for manufacturing:

#### Tier 1 — Production Scheduling Engine (Phase 1, Months 1–3)
- **What:** AI-powered production scheduling that optimises across machines, operators, materials, and due dates
- **Suggestive AI example:** "Moving WO-004 start forward by 1 day enables parallel processing with WO-003. Net benefit: 4 hours saved. [Apply] [Dismiss]"
- **Current gap:** `PlanScheduleTab` and `MakeSchedule` show static Gantt/calendar. No optimisation suggestions.
- **Implementation surface:** Intelligence Hub tab in Plan Job Detail + Make Schedule page

#### Tier 2 — Computer Vision Quality Control (Phase 2, Months 4–6)
- **What:** Camera-based defect detection, dimensional verification, surface finish analysis
- **Suggestive AI example:** "Vision system detected 0.3mm deviation on part #78 edge. Within tolerance but trending — recommend recalibration at part #90. [View analysis] [Dismiss]"
- **Current gap:** `WorkOrderFullScreen` has Live Cam but no vision analysis overlay. QualityTab has manual PASS/FAIL only.
- **Implementation surface:** Overlay on Live Cam feed + Quality tab integration

#### Tier 3 — Predictive Maintenance (Phase 3, Months 7–12)
- **What:** Machine sensor data analysis predicting failures before they occur
- **Suggestive AI example:** "CNC-01 spindle vibration trending 15% above baseline. Predicted bearing failure in ~40 hours of runtime. Recommend scheduling maintenance before WO-006. [Schedule maintenance] [View data]"
- **Current gap:** Machine cards in NC Connect and Dashboard show static status (idle/running/error). No trend data.
- **Implementation surface:** Machine status cards + MakeDashboard + dedicated maintenance view

#### Tier 4 — Natural Language Shop Floor Assistant
- **What:** Voice/text interface for operators: "What's the setup procedure for job 1210?" or "Log defect on part 78, surface scratch"
- **Suggestive AI example:** Operator says "What's next?" → "Your next operation is deburring on WO-003. Estimated start: 2:15 PM. Setup instructions are loaded."
- **Current gap:** `AiCommandBar` exists on dashboards but is text-only, no voice, and has no backend
- **Implementation surface:** WorkOrderFullScreen (factory floor) + module dashboards

#### Tier 5 — Document Intelligence
- **What:** Auto-extract data from purchase orders, drawings, specs. Auto-populate BOM from CAD files.
- **Suggestive AI example:** "Uploaded drawing 'bracket-v3.pdf' — detected 6 dimensions, 2 tolerances, material: 304SS. Auto-populated BOM. [Review] [Edit]"
- **Current gap:** NC Connect has file upload but no extraction. BridgeWizard does CSV/PDF upload but no AI extraction.
- **Implementation surface:** NC Connect + Bridge + Plan job creation

#### Tier 6 — Dynamic Costing & Quoting Engine
- **What:** Real-time cost estimation based on actual production data, material prices, machine rates
- **Suggestive AI example:** "Based on last 5 similar jobs, estimated production cost is $12,400 (±8%). Material cost trending 12% above quote assumption. [Update quote] [View breakdown]"
- **Current gap:** `PlanBudgetTab` shows static budget. `SellNewQuote` has manual line items. No connection between actual costs and quotes.
- **Implementation surface:** Sell quote builder + Plan budget tab + Book job profitability

### 5.3 Recommended Intelligence Hub content by module

| Module | Intelligence Hub should show | Currently shows |
|--------|------------------------------|-----------------|
| **Sell** (Opportunity) | Win probability, competitor signals, recommended actions, engagement score, deal velocity, similar won/lost deals | 1 static AIInsightCard |
| **Sell** (Dashboard) | Revenue forecast, pipeline health, at-risk deals, rep performance insights | AiCommandBar only |
| **Plan** (Job Detail) | Schedule risk, resource conflicts, material availability prediction, cost variance forecast | 3 static AIInsightCards + customer timeline |
| **Plan** (Schedule) | Cross-job optimisation suggestions, bottleneck prediction, capacity forecasting | None |
| **Make** (MO Detail) | Production efficiency, quality trends, schedule optimisation, operator performance | 3 static AIInsightCards + MO timeline |
| **Make** (Shop Floor) | Machine utilisation insights, shift productivity, quality alerts, maintenance predictions | None (Intelligence Hub was removed from Shop Floor tabs) |
| **Make** (WorkOrderFullScreen) | Real-time quality analysis, next-step guidance, cycle time optimisation | None |
| **Book** (Dashboard) | Cash flow prediction, margin analysis, cost anomalies, invoice aging risk | AiCommandBar only |

---

## 6. 4-Page Record Layout Comparison

All three modules use `JobWorkspaceLayout` for their record detail pages. Consistency check:

| Aspect | Sell Opportunity | Plan Job | Make MO | Consistent? |
|--------|-----------------|----------|---------|-------------|
| **Layout component** | JobWorkspaceLayout | JobWorkspaceLayout | JobWorkspaceLayout | Yes |
| **Breadcrumbs** | Sell > Opportunities > Title | Plan > Jobs > Title | Make > MOs > MO# | Yes |
| **URL routing** | `/sell/opportunities/:id` (useParams) | Modal-based (no URL) | `/make/manufacturing-orders/:id` (useParams) | **No** — Plan Job needs URL route |
| **Tab count** | 4 | 5 (with Budget) | 4 | Close |
| **Overview layout** | 65/35 grid | 65/35 grid | 65/35 grid | Yes |
| **AI presence** | 1 card on sidebar | 1 card on sidebar | 1 card on sidebar | Yes |
| **Intelligence Hub tab** | No | Yes (full) | Yes (full) | **No** — Sell is missing |
| **Header actions** | Back, Email, Save | Back, Save | Back, Print Traveler, Add WO | Consistent pattern |
| **Meta row** | Stage badge + amount | Status badge + quote ID | Status badge + job number | Yes |
| **Cross-module link** | None | Quote ID (no link) | Job number (no link) | **No** — all should link |

---

## 7. Implementation Priorities

### Phase 1 — Flow Connectivity (P0)

1. **Plan Job URL routing** — Convert PlanJobDetail from modal to `/plan/jobs/:id` with `useParams`
2. **Sell Order detail** — Create `/sell/orders/:id` with JobWorkspaceLayout (Overview, Line Items, Fulfilment, Documents)
3. **Convert actions** — "Convert to Order" on opportunity, "Create Job" on order, "Create MO" on job, "Generate Invoice" on completed MO
4. **WO click → full-screen in MO detail** — Wire onClick on work order rows in MakeManufacturingOrderDetail to open WorkOrderFullScreen
5. **Cross-module links** — Job number in MO header links to `/plan/jobs/:id`, Quote ID in job header links to `/sell/opportunities/:id`

### Phase 2 — Sell Module Depth (P0/P1)

6. **Sell Intelligence Hub** — Full tab on opportunity page: win probability, recommended actions, engagement scoring, competitor signals
7. **Dashboard sub-tabs** — Analysis, Reports, Forecasts tabs on Sell dashboard
8. **Sidebar IA alignment** — Add Activities, Quotes, Intelligence Hub as sidebar items per Figma
9. **Activity Calendar** — Calendar view within opportunity Activities tab
10. **Quotes tab on opportunity** — Quote pipeline and version history within opportunity context

### Phase 3 — Factory Floor Enhancement (P1)

11. **Floor mode toggle** — Shop Floor Overview with large KPIs for distance viewing
12. **MO detail Documents tab** — Drawings, BOMs, traveller documents
13. **MO schedule visualisation** — Gantt of WOs within MO (reuse GanttChart)
14. **Quick WO switcher** — Navigate between WOs in WorkOrderFullScreen

### Phase 4 — AI / Intelligence Hub (P1/P2)

15. **Suggestive AI pattern component** — New shared component: `AISuggestion` with [Apply] [Dismiss] actions, confidence score, data source
16. **Production scheduling suggestions** — AI cards in Plan schedule and Make schedule showing optimisation opportunities
17. **Quality vision placeholder** — Overlay zone on WorkOrderFullScreen Live Cam for future CV integration
18. **Predictive maintenance cards** — Machine status cards with trend indicators and predicted maintenance dates
19. **NL assistant enhancement** — Upgrade AiCommandBar with suggested prompts contextual to current page

### Phase 5 — Polish (P2)

20. **Book Invoice detail** — `/book/invoices/:id`
21. **Voice notes** — Mic button on WorkOrderFullScreen for hands-free defect reporting
22. **Print Traveler** — PDF layout for MO traveller
23. **Offline mode** — Service worker + IndexedDB for WorkOrderFullScreen
24. **Multi-camera** — Camera selector in WorkOrderFullScreen

---

## 8. Files Referenced

| Route | File | Status |
|-------|------|--------|
| `/sell/opportunities/:id` | `src/components/sell/SellOpportunityPage.tsx` | Exists — needs Intelligence Hub tab |
| `/sell/orders` | `src/components/sell/SellOrders.tsx` | Exists — no detail page |
| `/plan/jobs` | `src/components/plan/PlanJobs.tsx` + `PlanJobDetail.tsx` | Exists — needs URL routing |
| `/make/manufacturing-orders/:id` | `src/components/make/MakeManufacturingOrderDetail.tsx` | Exists — needs WO click handler |
| `/make/shop-floor` | `src/components/make/MakeShopFloor.tsx` | Exists — 3 tabs |
| WO full-screen | `src/components/shop-floor/WorkOrderFullScreen.tsx` | Exists — excellent factory floor UX |
| AI components | `src/components/shared/ai/AIInsightCard.tsx`, `AIInsightMessage.tsx` | Exists — need `AISuggestion` variant |
| Layout | `src/components/shared/layout/JobWorkspaceLayout.tsx` | Exists — shared across all 3 modules |
