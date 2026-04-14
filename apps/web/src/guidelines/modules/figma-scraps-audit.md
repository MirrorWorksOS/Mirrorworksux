# Figma Scraps Audit

**Date:** 2026-04-01
**Source:** MW-UX Figma file (`mYbNU57fvXaYpgUZ5yoAnX`)
**Scope:** Scraps sections found at the bottom of Sell, Plan, and Make pages

---

## What Are Scraps?

Scraps are inspiration references, earlier design explorations, and spec notes placed outside the main UX flow at the bottom of each Figma page. They represent design intent that may not have been fully realised in the codebase.

---

## Sell Page Scraps (node `1490:20734`)

| Scrap | Type | Description | Gap Opportunity |
|-------|------|-------------|-----------------|
| **Dashboard Inspiration** (Group 8) | Screenshot reference | Dark-themed dashboard showing a half-year income statement with $1.65B headline, area chart, Sales Forecast / Monthly Expenses / Budget Forecast / Insight cards, and an AI "Ask anything" search bar | **Yes** — The AI "Ask anything" search bar is not implemented on any dashboard. Could add a command-palette-style AI search to the Sell Dashboard header. |
| **Dashboard Notes** | Text note | "Consider gamification based on sales activities" | **Yes** — No gamification exists. Could add achievement badges, streak counters, or leaderboard rankings to Sell Dashboard. |
| **Sales Performance Spec** (466:182160) | Detailed text spec | 10 dashboard component specifications: Sales Performance Score, Pipeline Funnel Analysis, Revenue Trends, Sales Forecast, Pipeline Health Score, Sales Leaderboard, Win/Loss Analysis, Quota Attainment, Quote-to-Cash Cycle (manufacturing-specific), Customer Segmentation | **Yes** — Only ~4 of these 10 are implemented. Missing: Sales Performance Score (StatCard health index 0-100), Pipeline Health Score (weighted pipeline + stalled deals), Quota Attainment (team/individual %), Quote-to-Cash Cycle (manufacturing timeline), Customer Segmentation (pie/donut by industry/size/region). |
| **Import/Export Data** (Import group) | Screenshot reference (Clay app) | Multi-step CSV import wizard: file upload → column mapping → data preview → validation → confirmation. Also 5 export screenshots showing data table export flows. | **Resolved** — Import buttons now navigate to `/control/mirrorworks-bridge` (MirrorWorks Bridge), which implements the full import wizard flow. Export functionality still needs work. |
| **Invoice Overview** | Screenshot reference | Invoice detail page mockup showing header, line items, payment timeline | **Partial** — SellInvoiceDetail already exists with similar structure. May need refinement to match this earlier vision. |
| **New Customer / CRM Quick Views** | Screenshot references | Three CRM quick-add customer form variants and a CRM list view | **Partial** — SellCRM has card/list views but the quick-add customer form is just a toast. These scraps show a proper slide-over form. |
| **Visual Workflow Builder / Stage 2** | Text label + screenshots | Advanced workflow builder inspiration for process automation | **Partial** — ControlWorkflowDesigner exists but is simulated. These scraps suggest a more visual drag-and-drop builder. |
| **Calendar Views** (4 variants) | Frames | Month, Week, Day, and Event calendar views with different layouts | **Partial** — SellActivities has Month/Week/Day views. The Event detail view variant is not implemented as a separate view. |
| **Blocks / Opportunity / Quotes** | Component | A quotes tab within opportunity detail showing quote list | **No** — This is already implemented in the main flow as SellNewQuote. |

---

## Plan Page Scraps (node `1499:36893`)

| Scrap | Type | Description | Gap Opportunity |
|-------|------|-------------|-----------------|
| **Calendar / Day** | Frame | Day view calendar with time slots | **No** — Already implemented in activities calendar. |
| **Calendar / Week** | Frame | Week view calendar with columns | **No** — Already implemented. |
| **Section 1** (977:27816) | Section | Large section (17235×5474) — likely contains additional layout explorations | **Unknown** — Needs manual Figma review to determine contents. |
| **Duplicate Blocks** (18 component sets) | Component copies | Copies of Orders List, Invoice List, Products List, Settings pages, Activity views — appear to be duplicates of components from the main Plan flow | **No** — These are working copies/backups, not new designs. |

---

## Make Page Scraps (node `1499:47056`)

| Scrap | Type | Description | Gap Opportunity |
|-------|------|-------------|-----------------|
| **Duplicate Blocks** (18 component sets) | Component copies | Copies of Orders List, Invoice List, Products List, New Quote, Activities, Activity Calendar, Intelligence Hub, New Activity, New Invoice, Settings pages | **No** — These are duplicated blocks from Sell/Plan, likely used as templates when building the Make page. |
| **Calendar / Day** | Frame | Day calendar view | **No** — Already implemented. |
| **Calendar / Week** | Frame | Week calendar view | **No** — Already implemented. |

---

## Gap Summary & Recommendations

### HIGH Priority (Fills significant UX gaps)

| # | Gap | Source Scrap | Recommendation |
|---|-----|-------------|----------------|
| 1 | **CSV Import Wizard** | Sell > Import group (Clay screenshots) | ~~Build a shared `ImportWizard` component.~~ Import buttons now route to `/control/mirrorworks-bridge` (MirrorWorks Bridge), which provides the full import flow: Upload → Map Columns → Preview → Import. No separate wizard needed. |
| 2 | **Missing Dashboard KPIs** | Sell > Sales Performance Spec | Add 3-4 of the missing dashboard cards: Sales Performance Score (0-100 health index), Quota Attainment (% gauge), Quote-to-Cash Cycle (timeline chart). These are manufacturing-specific differentiators. |

### MEDIUM Priority (Polish & enhancement)

| # | Gap | Source Scrap | Recommendation |
|---|-----|-------------|----------------|
| 3 | **AI Search / Ask Anything** | Sell > Dashboard Inspiration | Add an AI-powered command palette or search bar to the global header or dashboard. The inspiration shows "Ask anything or search" with suggested prompts. |
| 4 | **Quick-Add Customer Form** | Sell > CRM Quick Views | Replace the toast-based "New Customer" button with a proper slide-over form matching the 3 CRM quick-add variants in the scraps. |
| 5 | **Gamification Elements** | Sell > Dashboard Notes | Add subtle gamification: quota progress rings, achievement badges on the leaderboard, activity streaks on the dashboard. |

### LOW Priority (Already partially covered)

| # | Gap | Source Scrap | Recommendation |
|---|-----|-------------|----------------|
| 6 | **Event Detail Calendar View** | Sell > Calendar / Event | Add an event detail panel/modal when clicking a calendar event in Activities. |
| 7 | **Visual Workflow Builder v2** | Sell > Workflow Builder Stage 2 | Enhance ControlWorkflowDesigner with more visual drag-and-drop capabilities. Deferred to Stage 2. |

---

## Empty State Artwork Inventory

SVG illustrations available at `src/art/empty-states/`:

| Module | File | Target Screen |
|--------|------|---------------|
| Sell | `sell/CRM.svg` | CRM (customers list) |
| Sell | `sell/Quote.svg` | Quotes list |
| Sell | `sell/Opportuinity.svg` | Opportunities kanban |
| Make | `make/Make.svg` | Make dashboard / general |
| Make | `make/MO.svg` | Manufacturing Orders list |
| Book | `book/Book.svg` | Book dashboard / general |
| Book | `book/Invoices.svg` | Invoices list |
| Buy | `buy/Buy.svg` | Buy dashboard / general |
| Ship | `ship/Ship.svg` | Ship dashboard / general |
| Plan | *(none)* | No artwork yet — needs design |
| Control | *(none)* | No artwork yet — needs design |
