# Buy Module — Filter, Search & View UX Audit

**Scope**: `apps/web/src/components/buy/*`
**Date**: 2026-05-11
**Status**: Research only — no code changes

The Buy module's status-pill filters are mostly well-aligned to procurement workflow (PO statuses, RFQ stages, requisition approval), but they are skin-deep: no supplier facet, no buyer/owner, no value bands, no overdue toggle, no due-date range. Every screen falls back to the shared `ToolbarFilterButton` (`apps/web/src/components/shared/layout/ToolbarFilterButton.tsx:18`) which hard-codes `["All", "Active", "Draft", "Completed"]` — the same generic four checkboxes the CRM uses. No screen has saved views, persistent date pickers, or natural-language search. View modes are inconsistent: `BuySuppliers` has card/list, `BuyReceipts` has cards but no list, and PO/RFQ/Bill screens have list only — no kanban-by-status anywhere despite obvious workflow boards.

---

## 1. Current state per screen

| Screen | File:line | Filters today | View modes | Search |
|---|---|---|---|---|
| Purchase Orders | `BuyOrders.tsx:131` | Pills: All / Draft / Sent / Acknowledged / Partial / Received / Cancelled + generic `ToolbarFilterButton` | List only | PO # & supplier |
| Suppliers | `BuySuppliers.tsx:147` | None (generic Filter button placeholder, `AnimatedFilter`) | Card / List toggle | Company & contact |
| RFQs | `BuyRFQs.tsx:242` | None — just summary bar (Open/Awarded/Closed/Draft) | List only | RFQ # & title |
| Requisitions | `BuyRequisitions.tsx:163` | Pills: All / Draft / Submitted / Approved / Rejected / Converted + generic | List only | REQ # & requestor |
| Receipts | `BuyReceipts.tsx:79` | None — implicit "POs not yet received" | Card grid (no list) | None |
| Bills | `BuyBills.tsx:149` | None — 4 summary tiles (Matched / Pending GRN / Mismatch / Overdue) act as KPI not filters | List only | Bill # & supplier |
| Products | `BuyProducts.tsx:86` | None | List only | None |
| Agreements | `BuyAgreements.tsx:120` | None | Card list only | Supplier & agreement # |
| Reorder Rules | `BuyReorderRules.tsx:107` | None | List only | None |
| MRP Suggestions | `BuyMrpSuggestions.tsx:103` | None | List only | None |
| Planning Grid | `BuyPlanningGrid.tsx:97` | None — fixed 6-week window | Heatmap only | None |
| Vendor Comparison | `BuyVendorComparison.tsx:91` | Product `Select` (6 options) + vendor checkboxes | Compare + chart | None |

---

## 2. Irrelevant or weak filters

- **`ToolbarFilterButton` everywhere** (`BuyOrders.tsx:145`, `BuyRequisitions.tsx:176`) — the popover still shows hard-coded "Active / Draft / Completed" statuses, which doesn't even match the screen's own status pills. Toast on Apply, no real filter logic.
- **`BuySuppliers` "Filter" button** (`BuySuppliers.tsx:158`) — no popover at all, decorative only.
- **`BuyOrders` "Acknowledged" pill** is rarely used in SME procurement (suppliers seldom acknowledge formally) — usable but low-signal vs. "Awaiting acknowledgement".
- **`BuyRequisitions` "Converted" pill** — once a req is converted to a PO it leaves the buyer's working list; this should be a default-hidden archive view, not equal-weight with Draft.
- **`BuyBills` has no filters at all** despite 4 distinct workflow states displayed.

---

## 3. Recommended filters per screen

### Purchase Orders (`BuyOrders.tsx`)
- **Status** (keep, collapse to: Draft / Sent / Partial / Received / Cancelled).
- **Supplier** (multi-select chip facet).
- **Buyer / owner** — who raised the PO.
- **Delivery window** — date range, with quick chips: "Overdue", "Due this week", "Due in 30d".
- **Value band** — `<$1k`, `$1k–$10k`, `$10k–$50k`, `>$50k`.
- **Has shortage / partial receipt** — boolean.
- **Linked agreement** — under BPA-XXX (yes/no).
- **Currency** (multi-site).
- **Approval state** — awaiting approval, approved, rejected.

### Suppliers (`BuySuppliers.tsx`)
- **Active POs**: has open / no open.
- **OTD band**: Excellent (≥95) / Good (85-94) / Fair (75-84) / Poor (<75) — already in code, surface as filter.
- **Category** chips (Raw Materials, Consumables, Hardware, Services, …).
- **Payment terms** (Net 7 / 14 / 30 / 60).
- **Lead-time band**.
- **Spend tier** — top 10, top 25, others (ABC analysis).
- **Risk flags** — single-source, no contract, certifications expired.

### RFQs (`BuyRFQs.tsx`)
- **Stage**: Draft / Sent / Open / Closing soon (<3d) / Closed / Awarded — replace generic "All".
- **Response coverage**: 0 / partial / full.
- **Due window** — Overdue, Due today, This week.
- **Owner / buyer**.
- **Linked requisition / linked job**.
- **Value band** (estimated).

### Requisitions (`BuyRequisitions.tsx`)
- **Status** (keep, hide Converted by default).
- **Department / requestor**.
- **Approver awaiting (me)** — most useful for approvers.
- **Age in current status** — bucket: <1d, 1-3d, >3d (stuck).
- **Value band**.
- **Has PO yet** (yes/no).

### Receipts (`BuyReceipts.tsx`)
- **Due window**: Today / This week / Overdue.
- **Supplier**.
- **Site / dock** (multi-site shops).
- **Partial receipts only**.
- **Has discrepancy logged**.

### Bills (`BuyBills.tsx`)
- **Match status**: Matched / Pending GRN / Amount mismatch / Overdue.
- **Aging bucket**: Current / 1-30 / 31-60 / 61-90 / 90+.
- **Supplier**, **Currency**, **Approver**.
- **Has dispute / query open**.
- **Value band**.

### Products / Reorder Rules / MRP Suggestions
- **Material family**, **Grade**, **Gauge**.
- **Stock state**: OK / Below reorder / Out of stock / Excess.
- **Preferred supplier**.
- **Auto-PO**: on / off.
- **Has open PO covering shortage** (MRP).

### Agreements (`BuyAgreements.tsx`)
- **Status** (Active / Near limit / Exhausted / Expired) — already in data, no UI.
- **Expiring window**: <30d / <90d.
- **Utilisation band** (<25 / 25-75 / 75-100 / >100).
- **Category**, **Supplier**.

---

## 4. Recommended view modes

| Screen | Add | Why |
|---|---|---|
| Purchase Orders | **Kanban by status** + **Calendar by delivery date** | Status board is the natural buyer dashboard; calendar exposes the receiving wave |
| RFQs | **Kanban by stage** (Draft → Sent → Open → Awarded → Closed) + **Calendar by due date** | RFQ lifecycle is the textbook kanban use case |
| Requisitions | **Kanban by approval state** | Approver view: column = "Awaiting me" |
| Receipts | **Calendar (today / this week)** + **List** | Currently only card; planners need a week view of incoming goods |
| Bills | **Aging buckets view** (current / 30 / 60 / 90+) + **Kanban by match status** | AP queue and exception inbox |
| Suppliers | Keep card/list, add **Map** (multi-site shops) | Geography matters for freight |
| Agreements | Card list OK; add **Timeline** (Gantt of validity windows) | See expiry/renewal cliff |
| MRP Suggestions | Add **Group-by supplier** for consolidated POs | Matches the "consolidate" AI suggestion already shown on Planning Grid |
| Planning Grid | Add **Horizon selector** (4/8/12 wks) + **By supplier swap** | Today fixed Wk 14-19 |

---

## 5. Persistent date fields (always-visible in toolbar)

Flag for always-on date range chip in the bar:

- **Purchase Orders** — Delivery date window (and a quick toggle "Order date instead").
- **RFQs** — Due date window.
- **Receipts** — Expected date.
- **Bills** — Due date + aging.
- **Requisitions** — Submitted date (helpful for SLA reporting).
- **Agreements** — End date / expiry window.

Non-date-critical: Suppliers, Products, Reorder Rules, MRP Suggestions, Vendor Comparison.

---

## 6. Preset / saved-view opportunities

### Purchase Orders
- **Personal**: "My open POs", "My POs due this week", "My partial receipts".
- **Team**: "All POs overdue", "POs >$10k awaiting approval", "POs against near-limit BPAs".

### RFQs
- **Personal**: "My RFQs awaiting response", "My RFQs closing in 3 days".
- **Team**: "Open RFQs > $25k", "RFQs with zero responses", "Awarded but no PO raised".

### Requisitions
- **Personal**: "Awaiting my approval", "My drafts", "Mine awaiting PO".
- **Team**: "All submitted >3 days", "Rejected last 30 days", "High-value (>$10k) submitted".

### Receipts
- **Personal**: "My docks today", "Overdue from my suppliers".
- **Team**: "Receiving this week", "Partial receipts >7 days old".

### Bills
- **Personal**: "Approvals waiting me", "Mismatches on my POs".
- **Team**: "Bills due in 7 days", "Overdue >30d", "Three-way match exceptions".

### Suppliers
- **Personal**: "My category", "My active suppliers".
- **Team**: "Top 20 by spend YTD", "OTD <85 last 90 days", "Single-source critical".

### Agreements
- **Personal**: "My BPAs near limit".
- **Team**: "Expiring in 90 days", "Utilisation >90%", "Renewal candidates".

### MRP Suggestions
- "Items needing action this week", "Consolidatable by supplier", "Above $5k single-shot".

---

## 7. Smart / AI filter ideas (natural-language)

1. **"POs likely to be late based on supplier history"** — joins PO due date with supplier OTD and lead-time variance; surfaces predicted-late rows on `BuyOrders`.
2. **"Suppliers with deteriorating OTD over last 90 days"** — trend filter on `BuySuppliers` (data already exists on `Supplier.onTimePercent`).
3. **"Items where MRP says reorder now but no open PO covers it"** — `BuyMrpSuggestions` cross-checked against `BuyOrders`.
4. **"BPAs likely to exhaust before end-date at current burn"** — `BuyAgreements`; uses `used + committed` vs days remaining.
5. **"RFQs where the cheapest quote also has the worst OTD"** — risk surface on `BuyRFQs` (already partly suggested by Agent pick).
6. **"Bills with amounts trending up vs prior 6 invoices from same supplier"** — price-creep detection on `BuyBills`.
7. **"Suppliers we paid >$X with no active contract"** — compliance/governance on Suppliers + Agreements.
8. **"Items consolidatable into a single weekly PO to hit volume break"** — already prototyped on Planning Grid agent card; expose as filter on MRP Suggestions.

---

## 8. Shared infra needed

- `ToolbarFilterButton` (`apps/web/src/components/shared/layout/ToolbarFilterButton.tsx:18`) needs to accept a schema (facets + options + types: enum / date-range / number-range / boolean / multi-select-from-source) per host page, instead of the hard-coded `["All", "Active", "Draft", "Completed"]`. Same pattern as Odoo's `<search>` view.
- Saved-view registry (per-user + shared) keyed by route. No such primitive exists today.
- Persistent date-range chip component for the toolbar — date-critical pages currently hide date inside the filter popover.
- View-mode switcher: only `BuySuppliers` and `IconViewToggle` exist; need kanban + calendar variants.

---

## Summary (top 3 findings)

1. Every Buy screen reuses the generic `ToolbarFilterButton` whose statuses (`All/Active/Draft/Completed`) are hard-coded and irrelevant to procurement — and on Suppliers/RFQs/Bills the button is purely decorative, with no real filtering wired up at all.
2. Status pills exist on POs and Requisitions but the high-value procurement facets (supplier, buyer, due-date window, value band, overdue toggle, approval state) are missing across every screen, and there is no saved-view / preset infrastructure to capture buyer routines like "my open POs this week".
3. View modes are stuck on list/card — the screens that scream for kanban (PO status, RFQ stage, requisition approval) and calendar (PO delivery, receipts, bill aging) only have flat tables, leaving the most natural procurement workflows un-served.