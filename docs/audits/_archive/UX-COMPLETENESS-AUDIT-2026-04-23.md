# UX Completeness & Heuristic Audit

**Date:** 2026-04-23  
**Auditor:** Automated (Claude Code scheduled task)  
**Environment:** localhost:5173 (dev server) and live at app.mirrorworks.ai  
**Viewport:** 1280x800 desktop  

---

## Executive Summary

96 routes were audited across 7 modules + Admin + Floor Mode. The app has strong visual consistency and a well-designed information architecture. **Plan**, **Ship**, and **Make** are the most complete modules. **Sell**, **Buy**, **Book**, and **Control** have the most placeholder actions. No pages are completely blank or broken, but several pages render only summary cards without their expected detail tables.

| Category | Count |
|----------|-------|
| Fully functional pages | ~68 |
| Pages with "coming soon" toast actions | ~28 |
| Sparse pages (summary only, no detail table) | 6 |
| Empty content areas (tabs/sections render nothing) | 3 |
| Total "coming soon" toast instances in code | 78 |

---

## 1. Empty / Blank Content Areas

These pages render structural elements (header, tabs, breadcrumbs) but show no meaningful content in the main area:

| Route | Module | Issue | Severity |
|-------|--------|-------|----------|
| `/sell/portal` | Sell | Customer Portal preview shows tabs (Orders, Invoices, Quotes) but content area is completely empty | P1 |
| `/control/shifts` | Control | Shift Manager shows title + legend (Day/Arvo/Night) but no shift grid renders | P1 |
| `/book` (Expenses/Purchases/Job Costs tabs in Book.tsx) | Book | Three tab panels render literal "coming soon..." text strings instead of redirecting to their dedicated pages | P2 |

### Recommendation
- **Sell Portal:** Either populate with mock customer-facing data or redirect tabs to the corresponding Sell list views filtered by customer.
- **Control Shifts:** The component exists but the grid table isn't rendering. Likely a missing mock data array or conditional render bug.
- **Book tabs:** These tabs duplicate routes that already have full pages (`/book/expenses`, `/book/purchases`, `/book/job-costs`). Replace the inline text with `<Navigate>` redirects or remove the tabs and rely on sidebar navigation.

---

## 2. Sparse Pages (Summary Cards Only)

These pages show one or more summary/KPI cards but are missing the expected detail table, list, or visualization below:

| Route | Module | What's shown | What's missing |
|-------|--------|-------------|----------------|
| `/buy/mrp-suggestions` | Buy | "Shortfall Items: 6" card | Table of individual shortfall items with action buttons |
| `/buy/reorder-rules` | Buy | "Materials Tracked: 5" card | Table of reorder rules with min/max/supplier columns |
| `/book/wip` | Book | "Total WIP Value: $4,755" card | Per-job WIP breakdown table |
| `/make/scrap-analysis` | Make | 3 summary cards (3.9%, Powder Coat Line, 41 qty) | Heat map visualization referenced in title |
| `/control/maintenance` | Control | 3 summary cards (Overdue, MTTR, Availability) | Maintenance schedule table and history log |
| `/buy/reports` | Buy | "Spend by Supplier" chart renders blank, Monthly Spend Trend chart works | Populate the donut/bar chart or show empty state |

### Recommendation
Each of these pages has the header and context to be useful, but stops short of the actionable detail. Priority is to add mock data tables — even static ones — so evaluators and prospects can see the full page layout.

---

## 3. "Coming Soon" Toast Actions Inventory

78 instances of `toast('... coming soon')` exist across the codebase. These are buttons and actions that look functional but fire a toast notification when clicked. Grouped by priority:

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
| `ControlLocations` | + New Location | "New location coming soon" |
| `ControlMachines` | + Add Machine / Edit / etc. | "coming soon" (5 actions) |
| `ControlInventory` | + New Item | "New inventory item coming soon" |
| `BookInvoiceDetail` | Record Payment | "Payment recording form coming soon" |

### P2 — Secondary Actions (reduces utility but doesn't block workflow)

| Component | Action | Toast message |
|-----------|--------|---------------|
| `SellSettings` | Add Lead Source / Activity Type | "coming soon" |
| `BuySettings` | Edit Approval Level | "coming soon" |
| `BuyReceipts` | Barcode Scanner / Camera | "coming soon" |
| `BuyBills` | Query Supplier | "Supplier query coming soon" |
| `BookSettings` | Configure Mapping / Edit Account | "coming soon" |
| `BookInvoices` | Filter Panel | "Filter panel coming soon" |
| `PurchaseOrders` | Filter Panel | "Filter panel coming soon" |
| `ShipSettings` | Carrier Config | "coming soon" |
| `ProductDetail` | Add Tier / Edit BOM / Edit Routing / Transfer Stock / Upload Docs / Preview / New Quote | 7 actions |
| `ControlProcessBuilder` | Load Dialog | "Load dialog coming soon" |
| `ControlWorkflowDesigner` | Edit Mode | "Edit mode coming soon" |
| `ControlGamification` | Add/Edit/Delete Targets & Badges | 6 actions |
| `EventDetailSheet` | Add Attendee / Edit / Reschedule | 3 actions |
| `PortalQuoteChat` | File Attachment | "File attachment coming soon" |
| `CommandPalette` | New Job / New MO / Compose Email | 3 quick-create actions |
| `QuickCreatePanel` | All items | "form coming soon" (generic) |
| `OverviewTab` (Shop Floor) | Customer Detail / File Attachment | 2 actions |

### P3 — Dashboard Quick Actions (cosmetic)

| Component | Action |
|-----------|--------|
| `MakeDashboard` | All quick-action buttons fire generic "coming soon" |
| `MakeDashboard` | "Quality analytics coming soon" text block |

---

## 4. UX Heuristic Analysis

Evaluated against Nielsen's 10 Usability Heuristics and Laws of UX.

### H1: Visibility of System Status — GOOD

- Every module dashboard shows real-time KPI cards with clear numeric values.
- Agent feed provides proactive status updates with actionable CTAs.
- Status pills (Active, Draft, Sent, Overdue, etc.) are consistently colour-coded across modules.
- Progress bars on billing, budget, and utilisation metrics provide clear feedback.

**Issue:** The "Approaching limit" banner in the sidebar is easy to miss. It competes visually with the navigation items and uses small text. Consider elevating it to a modal or top-bar alert when usage exceeds 80%.

### H2: Match Between System and Real World — GOOD

- Domain terminology is accurate for metal fabrication (Work Centres, MOs, BOMs, RFQs, GRNs, CAPA, heat numbers).
- Module names (Sell, Buy, Plan, Make, Ship, Book, Control) form a clear verb-based mental model.
- Currency formatting is correct (AUD with $ prefix).

**Issue:** "Book" may not immediately communicate "accounting" to all users. Consider a subtitle or tooltip on the sidebar ("Book — Accounting & Finance").

### H3: User Control and Freedom — NEEDS WORK

- **78 "coming soon" toast actions** represent buttons that look interactive but cannot be used. Users who click "+ New Customer" expect a form, not a toast. This violates user control expectations.
- No confirmation dialogs exist for destructive actions (delete, cancel). While no delete actions are implemented, the pattern should be established.
- The MirrorWorks Bridge has a clear "Skip for now" escape hatch — good pattern.

**Recommendation:** Either implement the forms behind P1 actions, or replace the yellow primary-action buttons with disabled states that show tooltips explaining the feature is planned. Active-looking buttons that do nothing erode trust.

### H4: Consistency and Standards — GOOD with exceptions

- **Strong:** All modules follow the same layout pattern: breadcrumb > title > subtitle > KPI cards > tabs/filters > data table. Very consistent.
- **Strong:** Settings pages across all modules share identical sidebar structure (General, sub-sections, Access & Permissions).
- **Strong:** Primary action button styling is consistent (yellow bg, rounded, right-aligned).

**Issues:**
- **Toolbar inconsistency:** Some pages use `ToolbarPrimaryButton` (rounded pill), others use raw `<Button>` with manual yellow styling. The visual result is the same, but code divergence may lead to future drift.
- **Search bar placement:** Most list pages put search left-aligned. Some pages (Receipts, Scan-to-Ship) don't have search at all.
- **Filter pattern:** Some pages have a "Filter" button (Orders, Quotes), while others have inline tab-style filters (Machines, Invoices). Both work, but the mixed pattern adds cognitive load.

### H5: Error Prevention — PARTIAL

- Form inputs have appropriate types (number, date, select).
- The "Approaching limit" banner warns about contact limits before hitting the cap.
- Bridge wizard validates source selection before proceeding.

**Issues:**
- No form validation feedback is visible on any settings page. Users can click "Save changes" without knowing if inputs are valid.
- The Sheet Calculator allows 0 or negative dimensions without warning.

### H6: Recognition Rather Than Recall — GOOD

- Quick navigation cards on every dashboard provide visual shortcuts with icons and descriptions.
- Command palette (Cmd+K) provides searchable access to all features.
- Breadcrumbs on detail pages always show the navigation path.
- MirrorWorks Agent suggestions surface contextual actions.

### H7: Flexibility and Efficiency of Use — GOOD

- Keyboard shortcut (Cmd+K) for command palette.
- Grid/list view toggle on Products, CRM, Machines, Jobs pages.
- Multiple entry points to the same data (sidebar, dashboard cards, command palette, agent suggestions).
- Ship module has both kanban and list views for orders.

**Issue:** No keyboard shortcuts are documented or discoverable beyond Cmd+K.

### H8: Aesthetic and Minimalist Design — EXCELLENT

- Clean, focused layouts with generous whitespace.
- Consistent colour system (yellow primary, neutral greys, semantic status colours).
- Icon usage is restrained and purposeful.
- Typography hierarchy is clear (page title > section heading > body > caption).
- Dark mode available via toggle (Welcome Dashboard has explicit "Dark mode" switch).

### H9: Help Users Recognize, Diagnose, and Recover from Errors — NEEDS WORK

- No error states are visible anywhere in the app. When API calls fail (no backend), data simply doesn't appear.
- Empty states exist on some pages (Products shows a card prompt) but are inconsistent.
- The toast-based "coming soon" messages provide no alternative path — users are left wondering what to do next.

**Recommendation:** Every list page should have an explicit empty state with guidance. The existing `ControlEmptyStates` showcase page demonstrates the pattern but it hasn't been applied universally.

### H10: Help and Documentation — PARTIAL

- MirrorWorks Agent provides contextual AI assistance on every dashboard.
- Agent suggestions surface module-specific prompts.
- Settings pages have descriptive labels and helper text.

**Issues:**
- No help centre link, documentation link, or onboarding tour exists.
- No tooltips on complex features (MRP, What-If, Process Builder, Product Studio).
- The command palette doesn't surface help or documentation results.

---

## 5. Laws of UX Observations

### Fitts's Law
- Primary action buttons are appropriately sized (h-10 to h-12, min 48px touch target).
- The sidebar collapse button is small (icon-only) — fine for desktop, but may be hard to hit on tablet.

### Hick's Law
- Module dashboards wisely limit quick navigation to 8-10 cards, reducing choice paralysis.
- Settings pages use progressive disclosure via sidebar sections rather than showing all options at once.

### Jakob's Law
- The layout follows standard SaaS conventions (left sidebar, top toolbar, main content area).
- Data tables follow standard patterns (sortable columns, status pills, row actions).

### Miller's Law
- KPI cards are grouped in sets of 3-4, which is within working memory limits.
- Sidebar groups sub-items under labelled sections (Pipeline, Transactions, etc.), keeping each group to 2-4 items.

### Doherty Threshold
- Page transitions are instant (SPA routing).
- Agent feed entries animate in smoothly.
- No loading spinners observed (mock data renders immediately).

---

## 6. Responsive / Mobile Observations

Not deeply tested in this audit (desktop viewport only), but the sidebar system handles three breakpoints:
- Desktop (1024px+): Full sidebar, collapsible
- Tablet (768-1023px): Icon-only rail
- Mobile (<768px): Bottom tab bar + overlay menu

**Note:** The Factory Designer, Process Builder, and Product Studio are canvas-based tools that likely need specific tablet/mobile adaptations.

---

## 7. Priority Recommendations

### Immediate (P0)
1. **Fix Shift Manager grid** — The page renders but the shift table is missing. Likely a bug, not a design gap.
2. **Populate Customer Portal** — The portal is the customer-facing preview and is completely empty.

### High (P1)
3. **Add detail tables to sparse pages** — MRP Suggestions, Reorder Rules, WIP Valuation, Scrap Analysis heat map, Maintenance schedule, Buy Spend by Supplier chart.
4. **Replace P1 "coming soon" toasts with disabled-button states** — At minimum for: New Customer, New Order, New Job, New MO, Record Payment, New Product (all modules). Active buttons that do nothing damage credibility in demos.
5. **Remove Book.tsx tab stubs** — The three "coming soon..." text paragraphs should redirect to their existing full pages.

### Medium (P2)
6. **Standardise empty states** — Apply the `ControlEmptyStates` pattern to every list page for zero-data scenarios.
7. **Add form validation feedback** — At minimum on Settings pages that have "Save changes" buttons.
8. **Add help tooltips** — On complex features: MRP, What-If Scenario, Process Builder, Product Studio, Nesting.

### Low (P3)
9. **Document keyboard shortcuts** — Add a keyboard shortcut reference accessible from the command palette.
10. **Add onboarding** — A first-run tour or checklist for new tenants coming through Bridge.

---

## 8. Module Completeness Scorecard

| Module | Pages | Content Score | Action Score | Settings | Overall |
|--------|-------|--------------|-------------|----------|---------|
| **Plan** | 15 | 95% | 85% | Complete | A |
| **Ship** | 11 | 98% | 95% | Complete | A |
| **Make** | 8 | 85% | 70% | Complete | B+ |
| **Book** | 11 | 80% | 65% | Complete | B |
| **Buy** | 18 | 80% | 60% | Complete | B |
| **Sell** | 18 | 85% | 55% | Complete | B- |
| **Control** | 15 | 80% | 50% | Complete | B- |
| **Admin** | 2 | 100% | 100% | N/A | A |
| **Floor** | 2 | 100% | 100% | N/A | A |

**Content Score:** Does the page render meaningful data?  
**Action Score:** Do interactive elements (buttons, forms) actually work?  
**Settings:** Does the module Settings page exist and have functional controls?  

---

## Appendix: Files Referenced

### Sparse / empty page components
- `apps/web/src/components/sell/SellCustomerPortal.tsx`
- `apps/web/src/components/control/ControlShiftManager.tsx`
- `apps/web/src/components/book/Book.tsx` (lines 14-27)
- `apps/web/src/components/buy/BuyMRPSuggestions.tsx`
- `apps/web/src/components/buy/BuyReorderRules.tsx`
- `apps/web/src/components/book/BookWIP.tsx`
- `apps/web/src/components/make/MakeScrapAnalysis.tsx`
- `apps/web/src/components/control/ControlMaintenance.tsx`

### "Coming soon" toast hotspots (top 5 by count)
- `apps/web/src/components/shared/product/ProductDetail.tsx` — 7 instances
- `apps/web/src/components/control/ControlGamification.tsx` — 6 instances
- `apps/web/src/components/control/ControlMachines.tsx` — 5 instances
- `apps/web/src/components/sell/SellOrders.tsx` — 3 instances
- `apps/web/src/components/sell/SellInvoiceDetail.tsx` — 3 instances

### Route definitions
- `apps/web/src/routes.tsx`
- `apps/web/src/components/Sidebar.tsx`
