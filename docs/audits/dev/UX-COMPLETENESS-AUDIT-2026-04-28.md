# UX Completeness & Heuristic Audit

**Date:** 2026-04-28  
**Auditor:** Automated (Claude Code scheduled task)  
**Environment:** Live at app.mirrorworks.ai  
**Viewport:** 1400x851 desktop  
**Previous audit:** 2026-04-23  

---

## Executive Summary

This is a follow-up audit comparing current state against the 2026-04-23 baseline. The app structure remains stable across 96+ routes and 7 modules + Admin + Floor Mode. Visual consistency is strong, dashboards are polished, and several modules (Plan, Ship, Make) continue to be exemplary. **No regressions were found since the last audit.** However, all previously flagged empty/sparse pages remain unresolved, and a new sparse page (Book > Cost Variance) was identified.

| Category | Apr-23 | Apr-28 | Delta |
|----------|--------|--------|-------|
| Fully functional pages | ~68 | ~68 | — |
| Pages with "coming soon" toast actions | ~28 | ~28 | — |
| Sparse pages (summary only, no detail table) | 6 | 7 | +1 |
| Empty content areas (tabs/sections render nothing) | 3 | 2 | -1 |
| Total "coming soon" toast instances in code | 78 | 78+ | — |

**Changes since last audit:**
- Book dashboard tabs (Expenses/Purchases/Job Costs) no longer render inline "coming soon..." text — they now link correctly to dedicated pages. **Previous P1 → Resolved.**
- Cost Variance page (`/book/cost-variance`) identified as newly sparse — 3 summary cards with no per-job breakdown table.
- All other flagged issues persist unchanged.

---

## 1. Empty / Blank Content Areas

These pages render structural elements (header, tabs, breadcrumbs) but show no meaningful content in the main area:

| Route | Module | Issue | Severity | Status vs Apr-23 |
|-------|--------|-------|----------|-------------------|
| `/sell/portal` | Sell | Customer Portal shows "Portal preview" banner, customer dropdown, but content area below is completely empty — no orders, invoices, or quotes render | P1 | **Unchanged** |
| `/control/shifts` | Control | Shift Manager shows "Active staff: 8" and "Shifts this week: 41" summary cards with search and department filter, but the weekly shift grid/calendar does not render | P1 | **Unchanged** |

### Recommendation
- **Sell Portal:** Populate with mock customer-facing data (orders, quotes, invoices for the selected customer) or render the existing data filtered by the selected customer.
- **Control Shifts:** The shift grid table is missing below the summary cards. The component has the data (41 shifts) but fails to render the grid. Likely a render bug or missing mock data mapping.

---

## 2. Sparse Pages (Summary Cards Only)

These pages show one or more summary/KPI cards but are missing the expected detail table, list, or visualization below:

| Route | Module | What's shown | What's missing | Status vs Apr-23 |
|-------|--------|-------------|----------------|-------------------|
| `/buy/mrp-suggestions` | Buy | "Shortfall Items: 6, 147 total units short" card | Table of individual shortfall items with action buttons | **Unchanged** |
| `/buy/reorder-rules` | Buy | "Materials Tracked: 5, Active reorder rules" card | Table of reorder rules with min/max/supplier columns | **Unchanged** |
| `/buy/reports` | Buy | "Spend by Supplier" chart renders blank (loading spinner only), "Monthly Spend Trend" bar chart works | Populate the donut/bar chart or show empty state | **Unchanged** |
| `/book/wip` | Book | "Total WIP Value: $4,755, Across 4 active jobs" card | Per-job WIP breakdown table | **Unchanged** |
| `/book/cost-variance` | Book | 3 cards: Total Budget $29,400 / Total Actual $30,850 / Total Variance +$1,450 (over budget, red) | Per-job or per-cost-element variance table | **NEW** |
| `/make/scrap-analysis` | Make | 3 cards: 3.9% Avg Scrap Rate, Powder Coat Line (Worst Machine, 8.5%), 41 Total Scrap Qty — plus Equipment/Operator/Week toggle tabs | Heat map visualization referenced in the title/description | **Unchanged** |
| `/control/maintenance` | Control | 3 cards: Overdue 1, Avg MTTR 45 min, Equipment Availability 50% (2 machines in maintenance) | Maintenance schedule table and history log | **Unchanged** |

### Recommendation
Each of these pages has contextual header, KPIs, and the scaffolding to be useful, but stops short of the actionable detail. Priority is to add mock data tables — even static ones — so evaluators and prospects can see the full page layout. Cost Variance in particular would benefit from a per-job table with Standard Cost, Actual Cost, Variance, and % columns.

---

## 3. "Coming Soon" Toast Actions Inventory

78+ instances of `toast('... coming soon')` exist across the codebase. No net change since Apr-23. These are buttons and actions that look functional but fire a toast notification when clicked.

### P1 — Core CRUD Actions (blocks primary workflows)

| Component | Action | Toast message |
|-----------|--------|---------------|
| `SellCRM` | + New Customer | "New customer form coming soon" |
| `SellOrders` | + New Sales Order | "New sales order form coming soon" |
| `SellOrders` | Edit (dropdown) | "Edit order coming soon" |
| `SellOpportunities` | + New Opportunity | "New opportunity form coming soon" |
| `SellProducts` | + New Product | "New product form coming soon" |
| `SellInvoices` | Edit (dropdown) | "Edit invoice coming soon" |
| `SellInvoiceDetail` | Record Payment | "Record payment coming soon" |
| `SellOrderDetail` | Add Line Item | "Add line item coming soon" |
| `PlanJobs` | + Create Job | "New job form coming soon" |
| `MakeManufacturingOrders` | + New MO | "New manufacturing order form coming soon" |
| `MakeProducts` | + New Product | "New product form coming soon" |
| `BuyRequisitions` | + New Requisition | "New requisition coming soon" |
| `BuyRFQs` | + New RFQ | "New RFQ coming soon" |
| `BuyBills` | + New Bill | "New bill coming soon" |
| `BuyNewOrder` | Link Requisition | "Requisition picker coming soon" |
| `BuyOrderDetail` | Add Line Item / Edit | "coming soon" |
| `ControlBOMs` | + New BOM / Edit | "coming soon" |
| `ControlProducts` | + New Product | "New product coming soon" |
| `ControlMachines` | + Add Machine / Edit / etc. | "coming soon" (5 actions) |
| `ControlInventory` | + New Item | "New inventory item coming soon" |
| `ControlShiftManager` | + New Shift | "Add shift form coming soon" |
| `ControlRoutes` | Route Builder / Edit | "coming soon" |

### P2 — Secondary Actions (reduces utility but doesn't block workflow)

| Component | Action |
|-----------|--------|
| `SellSettings` | Add Lead Source / Activity Type |
| `BuySettings` | Edit Approval Level |
| `BuyReceipts` | Barcode Scanner / Camera |
| `BuyBills` | Query Supplier |
| `ShipSettings` | Carrier Configuration |
| `ProductDetail` | Add Tier / Edit BOM / Edit Routing / Transfer Stock / Upload Docs / Preview / New Quote (7 actions) |
| `ControlProcessBuilder` | Load Dialog |
| `ControlWorkflowDesigner` | Edit Mode |
| `ControlGamification` | Add/Edit/Delete Targets & Badges (6 actions) |
| `EventDetailSheet` | Add Attendee / Edit / Reschedule (3 actions) |
| `CommandPalette` | New Job / New MO / Compose Email |
| `QuickCreatePanel` | All quick create forms |

---

## 4. UX Heuristic Analysis

Evaluated against Nielsen's 10 Usability Heuristics and Laws of UX.

### H1: Visibility of System Status — GOOD

- Every module dashboard shows real-time KPI cards with clear numeric values.
- Agent feed provides proactive status updates with actionable CTAs (e.g., "Pipeline velocity increasing", "Capacity bottleneck forecast", "Carrier delay pattern").
- Status pills (Active, Draft, Sent, Overdue, Prospect, etc.) are consistently colour-coded across all modules.
- Progress bars on billing, budget, work order, and utilisation metrics provide clear feedback.

**Issue:** The "Approaching limit — 15 contacts remaining in Sell. Upgrade" banner persists in the sidebar across all modules, not just Sell. This creates noise when working in unrelated modules. Consider scoping the warning to the Sell module sidebar only, or using a dismissible notification.

### H2: Match Between System and Real World — GOOD

- Domain terminology is accurate for metal fabrication (Work Centres, MOs, BOMs, RFQs, GRNs, CAPA, heat numbers, MTTR, CMM check).
- Module names (Sell, Buy, Plan, Make, Ship, Book, Control) form a clear verb-based mental model.
- Currency formatting is correct (AUD with $ prefix).
- Route card operation sequences use industry-standard names (Laser Cut, Deburr, Press Brake, etc.).

### H3: User Control and Freedom — NEEDS WORK

- **78+ "coming soon" toast actions** represent buttons that look interactive but cannot be used. Users who click "+ New Customer" expect a form, not a toast. This violates user control expectations.
- The MirrorWorks Bridge has a clear "Skip for now" escape hatch — good pattern.
- Floor mode kiosk has clear user-selection flow ("Who's clocking in?").

**Recommendation:** Replace P1 "coming soon" toast buttons with disabled states + tooltips. Active-looking buttons that do nothing erode trust, especially during prospect demos.

### H4: Consistency and Standards — GOOD with minor exceptions

- **Strong:** All modules follow the same layout pattern: breadcrumb > title > subtitle > KPI cards > tabs/filters > data table.
- **Strong:** Module dashboards consistently feature: Agent embed, quick navigation cards, KPI summary row.
- **Strong:** Settings pages share identical sidebar structure across all modules.
- **Strong:** Primary action button styling is consistent (yellow bg, rounded, right-aligned).

**Issues:**
- **Filter pattern:** Some pages use a "Filter" button toolbar (Orders, Quotes, QC Planning), while others use inline chip-style filters (Activities, Scrap Analysis). Both work, but the mixed pattern adds cognitive load.
- **Search placement:** Most list pages have search; some pages (Shift Manager uses search, but Maintenance and Scrap Analysis do not).

### H5: Error Prevention — PARTIAL

- Form inputs have appropriate types (number, date, select).
- The "Approaching limit" banner warns about contact limits before hitting the cap.
- Bridge wizard validates source selection before proceeding.

**Issues:**
- No visible form validation feedback on Settings pages. Users can click "Save changes" without knowing if inputs are valid.
- The Sheet Calculator allows 0 or negative dimensions without warning.

### H6: Recognition Rather Than Recall — GOOD

- Quick navigation cards on every dashboard provide visual shortcuts with icons and descriptions.
- Command palette (Cmd+K) provides searchable access to all features.
- Breadcrumbs on detail pages always show the navigation path.
- MirrorWorks Agent suggestions surface contextual, module-specific actions.

### H7: Flexibility and Efficiency of Use — GOOD

- Keyboard shortcut (Cmd+K) for command palette, (Cmd+N) for Quick Create.
- Grid/list view toggle on CRM, Jobs, and other list pages.
- Multiple entry points to the same data (sidebar, dashboard cards, command palette, agent suggestions).
- Ship module has both kanban and list views for orders.
- Warehouse page offers Map, Inventory, and Cycle count tabs.

**Issue:** No keyboard shortcuts are documented or discoverable beyond Cmd+K and Cmd+N.

### H8: Aesthetic and Minimalist Design — EXCELLENT

- Clean, focused layouts with generous whitespace.
- Consistent colour system (yellow #F5C542 primary, neutral greys, semantic status colours).
- Icon usage is restrained and purposeful (Animate UI icon set).
- Typography hierarchy is clear (page title > section heading > body > caption).
- Dark mode available via toggle. Admin console uses dark theme by default.

### H9: Help Users Recognize, Diagnose, and Recover from Errors — NEEDS WORK

- No error states are visible anywhere in the app. When data doesn't load, the page just appears empty.
- Empty states exist on some pages but are inconsistent.
- The toast-based "coming soon" messages provide no alternative path — users are left wondering what to do next.
- Sparse pages (MRP Suggestions, Reorder Rules, WIP, Cost Variance, Maintenance) give no indication that more content is planned.

**Recommendation:** Every list page should have an explicit empty state with guidance. The existing `ControlEmptyStates` showcase page demonstrates the pattern but hasn't been applied universally.

### H10: Help and Documentation — PARTIAL

- MirrorWorks Agent provides contextual AI assistance on every dashboard.
- Agent suggestions surface module-specific prompts.
- Settings pages have descriptive labels and helper text.
- Sell Settings shows plan usage (185/200 contacts) with clear upgrade path.

**Issues:**
- No help centre link, documentation link, or onboarding tour exists.
- No tooltips on complex features (MRP, What-If Scenario, Process Builder, Product Studio, Nesting).
- The command palette doesn't surface help or documentation results.

---

## 5. Laws of UX Observations

### Fitts's Law
- Primary action buttons are appropriately sized (h-10 to h-12, min 48px touch target).
- Sidebar navigation items have good hit targets.
- Floor mode kiosk uses large avatar cards — excellent for touch/kiosk use.

### Hick's Law
- Module dashboards limit quick navigation to 8-10 cards, reducing choice paralysis.
- Settings pages use progressive disclosure via sidebar sections.
- Sidebar groups items under labelled sections (Pipeline, Transactions, etc.), keeping each group to 2-4 items.

### Jakob's Law
- The layout follows standard SaaS conventions (left sidebar, top toolbar, main content area).
- Data tables follow standard patterns (sortable columns, status pills, row actions).
- Kanban boards (Opportunities, CAPA) follow standard drag-and-drop conventions.

### Miller's Law
- KPI cards are grouped in sets of 3-4, within working memory limits.
- Sidebar groups keep sub-items to 2-4 items per section.

### Doherty Threshold
- Page transitions are instant (SPA routing with lazy loading).
- Agent feed entries animate in smoothly.
- No loading spinners observed on most pages (mock data renders immediately). Exception: Buy Reports "Spend by Supplier" chart shows an infinite spinner.

---

## 6. Responsive / Mobile Observations

Not deeply tested in this audit (desktop viewport only), but the sidebar system handles three breakpoints:
- Desktop (1024px+): Full sidebar, collapsible
- Tablet (768-1023px): Icon-only rail
- Mobile (<768px): Bottom tab bar + overlay menu

**Note:** The Factory Designer, Process Builder, Product Studio, and Warehouse Map are canvas/visual tools that likely need specific tablet/mobile adaptations.

---

## 7. Priority Recommendations

### Immediate (P0) — Unchanged from Apr-23
1. **Fix Shift Manager grid** — The page renders summary cards (8 staff, 41 shifts) but the shift table/calendar is missing. Likely a render bug.
2. **Populate Customer Portal** — The portal is the customer-facing preview and is completely empty despite having a customer selector (TechCorp Industries).

### High (P1)
3. **Add detail tables to sparse pages** — MRP Suggestions, Reorder Rules, WIP Valuation, Cost Variance (NEW), Scrap Analysis heat map, Maintenance schedule, Buy "Spend by Supplier" chart.
4. **Replace P1 "coming soon" toasts with disabled-button states** — At minimum for: New Customer, New Order, New Job, New MO, Record Payment, New Product (all modules). Active buttons that do nothing damage credibility in demos.

### Medium (P2)
5. **Standardise empty states** — Apply the `ControlEmptyStates` pattern to every list page for zero-data scenarios.
6. **Add form validation feedback** — At minimum on Settings pages that have "Save changes" buttons.
7. **Add help tooltips** — On complex features: MRP, What-If Scenario, Process Builder, Product Studio, Nesting.
8. **Scope the "Approaching limit" banner** — Show it only in the Sell module or make it dismissible. Currently it appears on every module sidebar.

### Low (P3)
9. **Document keyboard shortcuts** — Add a keyboard shortcut reference accessible from the command palette.
10. **Add onboarding** — A first-run tour or checklist for new tenants coming through Bridge.

---

## 8. Module Completeness Scorecard

| Module | Pages | Content Score | Action Score | Settings | Overall | vs Apr-23 |
|--------|-------|--------------|-------------|----------|---------|-----------|
| **Plan** | 15 | 95% | 85% | Complete | A | — |
| **Ship** | 11 | 98% | 95% | Complete | A | — |
| **Make** | 8 | 85% | 70% | Complete | B+ | — |
| **Book** | 11 | 75% | 65% | Complete | B | ↓ (cost variance) |
| **Buy** | 18 | 80% | 60% | Complete | B | — |
| **Sell** | 18 | 85% | 55% | Complete | B- | — |
| **Control** | 15 | 80% | 50% | Complete | B- | — |
| **Admin** | 2 | 100% | 100% | N/A | A | — |
| **Floor** | 2 | 100% | 100% | N/A | A | — |

**Content Score:** Does the page render meaningful data?  
**Action Score:** Do interactive elements (buttons, forms) actually work?  
**Settings:** Does the module Settings page exist and have functional controls?  

---

## 9. What's Working Well

Highlights worth preserving as the product evolves:

1. **MirrorWorks Agent integration** — Every module dashboard has a contextual AI agent with proactive insights and actionable CTAs. This is a strong differentiator.
2. **Consistent module architecture** — The verb-based module naming (Sell/Buy/Plan/Make/Ship/Book/Control) and uniform dashboard layout create a learnable, predictable experience.
3. **Visual data pages** — Nesting (sheet layout visualisation), Warehouse Map (zone layout), Planning Grid (demand heatmap), CAPA Board (kanban), Opportunities (kanban) are all polished and visually compelling.
4. **QC Planning** — Rich inspection points table with pass rates, frequency, criteria, and colour-coded type badges. One of the most complete pages in the app.
5. **Routes page** — Clear operation sequence cards with time estimates and step numbering. Excellent at-a-glance view.
6. **Gamification** — Team targets table with metrics and badges with earned counts. Well-structured for engagement.
7. **Admin console** — Clean dark-themed platform admin with tier management and tenant overview. Feature availability matrix is intuitive.
8. **Floor mode** — Simple, focused kiosk experience appropriate for shop floor touch screens.

---

## Appendix: Files Referenced

### Sparse / empty page components
- `apps/web/src/components/sell/SellCustomerPortal.tsx`
- `apps/web/src/components/control/ControlShiftManager.tsx`
- `apps/web/src/components/buy/BuyMrpSuggestions.tsx`
- `apps/web/src/components/buy/BuyReorderRules.tsx`
- `apps/web/src/components/buy/BuyReports.tsx`
- `apps/web/src/components/book/BookWipValuation.tsx`
- `apps/web/src/components/book/BookCostVariance.tsx`
- `apps/web/src/components/make/MakeScrapAnalysis.tsx`
- `apps/web/src/components/control/ControlMaintenance.tsx`

### "Coming soon" toast hotspots (top 5 by count)
1. `apps/web/src/components/shared/product/ProductDetail.tsx` — 8 instances
2. `apps/web/src/components/control/ControlGamification.tsx` — 6 instances
3. `apps/web/src/components/control/ControlMachines.tsx` — 5 instances
4. `apps/web/src/components/buy/BuyOrderDetail.tsx` — 4 instances
5. `apps/web/src/components/shared/command/CommandPalette.tsx` — 3 instances
