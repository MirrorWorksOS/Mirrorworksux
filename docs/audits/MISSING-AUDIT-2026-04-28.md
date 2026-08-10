# Missing-Components Audit — 2026-04-28

Wider sweep across all modules after Phase 1 + 2 + repricing. Three independent
explore passes covered (1) dead-end interactions, (2) broken navigation, and
(3) structural completeness. This document compiles the overlap and prioritises
what's worth fixing next.

## Scope

`apps/web/src` — all modules (Sell, Buy, Plan, Make, Ship, Book, Control,
Bridge, Floor, Admin, Shared). Test/story/mock files excluded. Findings are
aggregated; deduplicated; cross-checked against `routes.tsx`.

## TL;DR

| Severity | Count | Theme |
|---|---|---|
| **Critical** | 1 | Save → 404 on new product |
| **High** | 7 | Settings "Save" buttons that lie about saving (2) + hardcoded demo IDs in nav (5) |
| **Medium** | ~47 | Long tail of "coming soon" toasts; Control module is ~33% |
| **Low** | 6 | Dead Book.tsx wrapper, 5 animate-ui React 19 TODOs |
| **Info** | 73 | Routes registered but never linked in-app |

**No structural gaps found** — all detail pages, tab switches, sheet bodies,
and navigation paths resolve. The remaining issues are interaction-level
polish, not missing screens.

---

## CRITICAL (1)

### C1 — Saving a new product navigates to a 404

`apps/web/src/components/shared/product/ProductDetail.tsx:1742`

```tsx
navigate(`/${module}/products/new-${Date.now()}`, { replace: true });
```

After a successful "Save" on `/sell/products/new` (or `/buy/products/new` etc.)
the URL becomes `/sell/products/new-1714305432`. That id matches the
`/products/:id` route param but is never present in the mock catalogue, so the
detail page renders the "not found" branch. UX: toast says "Product created"
then immediately shows a "not found" screen.

**Fix:** mirror the Phase 1 pattern from `BuySupplierDetail` etc. — navigate
back to the list (`/${module}/products`) on save, OR drop a real synthetic
record into the mock store so the redirect resolves. The same issue likely
exists wherever `handleSave` uses `Date.now()` synthetic IDs; grep `new-\${Date.now()}`
for the full list.

---

## HIGH (7)

### H1–H2 — "Save" buttons that fire a toast but persist nothing

`apps/web/src/components/shared/settings/ModuleSettingsLayout.tsx:89-90`
`apps/web/src/components/shared/product/ProductDetail.tsx:1702-1705`

The Save button toasts "Settings saved" / "Planning rules saved" but no state
mutation runs. A user who edited fields, hit Save, and reloaded would lose
work without any signal. Highest UX risk in this audit because it actively
misleads.

**Fix:** wire to local state at minimum (so refresh is honest about losing
data), or hide the Save button until backend persistence exists. Same handler
should also `// TODO(backend)` mark the persistence call.

### H3–H7 — Hardcoded demo IDs that 404 outside the seed dataset

| File:line | Bad target |
|---|---|
| `components/make/MakeProducts.tsx:208` | `/make/manufacturing-orders/mo-001` |
| `components/plan/PlanOverviewTab.tsx:285` | `/sell/orders/so-001` |
| `components/plan/PlanOverviewTab.tsx:300` | `/sell/opportunities/opp-001` |
| `components/sell/SellNewInvoice.tsx:112` | `/sell/invoices/inv-008` |
| `components/sell/SellNewInvoice.tsx:121` | `/sell/invoices/inv-009` |

Each one navigates after a state change ("Draft saved", "Invoice issued")
to a literal id. Works in the seeded mock; breaks the moment the backend
returns a real id. Easy to slip past test plans because the demo dataset
hides it.

**Fix:** thread the freshly-created entity's id through the handler instead
of hardcoding. For now, while it's still mock-mode, make the literal id
explicit (`// TODO(backend): replace mo-001 with response.id`) and
ideally pass through whichever id exists on the in-memory entity.

---

## MEDIUM — Coming-soon toasts (47 across 19 files)

Grouped by module so you can see the dense spots. These all `toast(…)` and do
nothing else; clicking the button changes nothing in the app.

### Control (16 — ~33% of all coming-soons)

| File | Toasts |
|---|---|
| `ControlGamification.tsx` | 10 — edit target/badge, add target, create badge, delete badge, add target to group, edit per-group target… |
| `ControlMachines.tsx` | 5 — Edit machine, Schedule maintenance, Take offline, Assign operator, Add machine |
| `ControlBOMs.tsx` | 2 — Edit / New BOM |
| `ControlRoutes.tsx` | 2 — New route, edit route |
| `ControlInventory.tsx`, `ControlLocations.tsx`, `ControlOperations.tsx`, `ControlProcessBuilder.tsx`, `ControlProducts.tsx`, `ControlShiftManager.tsx`, `ControlWorkflowDesigner.tsx`, `ControlGroups.tsx`, `ControlBilling.tsx` (Manage payment method) | 1 each |

Recommendation: pick the entity that's most-used in demos and wire one full
create/edit flow as the template. Once the pattern is established, the rest
are mostly mechanical follow-up.

### Sell (3)

- `PortalQuoteChat.tsx:93` — File attachment coming soon
- `SellSettings.tsx:204` — Add lead source coming soon
- `SellSettings.tsx:410` — Add activity type coming soon

### Make (1)

- `MakeDashboard.tsx:488` — Dynamic toast for several dashboard actions
  ("Material scheduling", "Shop floor analytics", "Production insights").
  These are dashboard quick-action chips that do nothing.

### Ship (1)

- `ShipSettings.tsx:198` — Per-carrier configuration coming soon

### Book (4)

- `BookInvoices.tsx:277` — Filter panel coming soon
- `BookSettings.tsx:208` — Edit account form coming soon
- `BookSettings.tsx:327` — Xero mapping configuration coming soon
- `PurchaseOrders.tsx:137` — Filter panel coming soon

### Shared (15)

| File | Toasts |
|---|---|
| `shared/product/ProductDetail.tsx` | 7 — Add tier, Edit BOM, Edit routing, Transfer stock, Upload documents, Preview, View all movements |
| `shared/calendar/EventDetailSheet.tsx` | 3 — Add attendee, Edit mode, Reschedule |
| `shared/command/CommandPalette.tsx` | 3 — New job, New MO, Email composer |
| `shared/command/QuickCreatePanel.tsx` | 1 — generic fallback for items still marked `action: 'toast'` |
| `shop-floor/OverviewTab.tsx` | 2 — Customer detail, File attachment |

### Other near-toast-only handlers

A handful of handlers fire `toast.success(...)` for an action (approve,
reject, post, sync) without any state mutation. They look "successful" but
nothing changes:

- `components/buy/BuyRequisitionDetail.tsx:161,169` — approve / reject
- `components/buy/BuyOrderDetail.tsx:772,857,867` — comment, approve, receive goods
- `components/buy/BuyBills.tsx:221,227` — approve / reject
- `components/buy/BuyRFQs.tsx:136` — Awarded to ${supplier}
- `components/book/NewExpense.tsx:142,143` — save as draft / submit for approval

Mark each with `// TODO(backend): <namespace>.<mutation>` (matches the
convention from Phase 1) so they're greppable, and at minimum add a local
state update so refresh doesn't reset.

### Plausibly-real exports / prints (low priority)

Toasts for export / PDF / print operations that *might* be triggering a real
file action and just narrating it. Worth a one-line check to confirm the
download actually fires, then can be left alone:

- `components/buy/BuyNewOrder.tsx:661` — Generating PDF preview
- `components/buy/BuyRequisitions.tsx:177`, `BuyOrders.tsx:146`, `BuyRFQs.tsx`, `BuySettings.tsx:334-335` — CSV exports
- `components/buy/BuySupplierDetail.tsx:178` — Composing email
- `components/book/BookInvoices.tsx:284`, `BookSettings.tsx:382-383` — invoice/expense exports
- `components/buy/BuyRequisitionDetail.tsx:322` — Printing
- `components/shared/audit/AuditTimelineSheet.tsx:76` — Exporting history

### Empty handler

- `components/book/InvoiceList.tsx:163` — Export button has `onClick={() => {}}`. Just dead code.

---

## LOW (6)

### L1 — Dead `Book.tsx` wrapper

`apps/web/src/components/book/Book.tsx`

The file imports `BookDashboard` and `BookInvoices` then renders a tab shell
with three placeholder tabs (`Expenses view coming soon`, `Purchases view
coming soon`, `Job Costs view coming soon`). It's never imported anywhere —
the routes go directly to the underlying components. Pure dead code.

**Fix:** delete the file.

### L2–L6 — `animate-ui` React 19 ref-type TODOs

| File | Line(s) | Note |
|---|---|---|
| `components/animate-ui/primitives/effects/highlight.tsx` | 430 | RefObject.current under React 19 |
| `components/animate-ui/primitives/animate/tooltip.tsx` | 212, 220, 435 | React 19 ref types (3×) |
| `components/animate-ui/primitives/animate/slot.tsx` | 32 | RefObject.current assignment under React 19 |

Real tech debt but library-isolated and not currently breaking anything.
Safe to leave until the next animate-ui upgrade.

---

## INFO — 73 routes registered but never linked in-app

Routes declared in `routes.tsx` for which no `navigate(`, `<Link to=`, or
`<Navigate to=` in the codebase points at them. Many are legit (settings,
deep-linkable detail, `/floor` kiosk, legacy redirects). Others might be
WIP or genuinely dead.

Most likely **deliberate (deep-linkable / settings-tab / legacy redirect)**:

- All `/<module>/settings` (one per module, surfaced via SidebarSettings menu)
- `/buy/bills`, `/buy/rfqs`, `/buy/products`, `/buy/receipts`, `/buy/reports`, `/buy/vendor-comparison`, `/buy/mrp-suggestions`, `/buy/planning-grid`, `/buy/reorder-rules` — surfaced via Buy module sidebar
- `/control/*` (gamification, audit, BOMs, documents, locations, machines, etc.) — surfaced via Control sidebar
- `/make/quality`, `/make/products`, `/make/scrap-analysis`, `/make/capa`, `/make/schedule`, `/make/settings` — Make sidebar
- `/plan/*` (qc-planning, mrp, nesting, sheet-calculator, what-if, libraries, etc.) — Plan sidebar
- `/ship/*` (packaging, tracking, returns, warehouse, carrier-rates, scan-to-ship, reports, settings) — Ship sidebar
- `/book/*` (budget, expenses, purchases, job-costs, wip, cost-variance, stock-valuation, reports, settings) — Book sidebar
- `/sell/portal`, `/sell/activities`, `/sell/settings` — Sell sidebar
- `/admin/tenants` — Admin shell index
- `/design/*` — legacy redirects

**Worth a manual look for true dead code:**

- `/plan/cad-import`, `/plan/finish-library`, `/plan/material-library` — these
  are explicitly redirected to `/plan/machine-io?tab=…` and `/plan/libraries?tab=…`
  in the route config, so the unused entries should stay (they're legacy
  bookmark catchers).
- `/plan/product-studio/blockly-spike`, `/plan/product-studio/legacy` — same
  story; legacy bookmark catchers.

**Suggested action:** none. The list is informational. If you ever clean up
sidebar entries, this is the cross-reference to use.

---

## Recommended next-PR scope

If you want to action this audit, the smallest meaningful PR is:

1. **C1** — fix the new-product save → 404. ~10 LOC change.
2. **H1–H2** — wire the two settings Save buttons to local state at minimum
   (or hide them until backend exists). ~30 LOC.
3. **H3–H7** — flip the 5 demo-id navigations to route off the entity's
   actual id with a `// TODO(backend)` marker. ~15 LOC.
4. **L1** — delete `Book.tsx`. 0 LOC change in the rest of the codebase.

That's ~60 LOC + one file deletion and clears the entire "actively misleading"
class of bug. The 47 coming-soon toasts can be addressed incrementally per
module, prioritising Control (16) and ProductDetail (7).

---

## Notes on what's already clean

For the record, these audit categories returned zero findings:

- Empty tab panels (every `JobWorkspaceLayout` switch case has real content)
- Switch-case branches returning null
- Detail-page routing gaps (every list with row clicks has a detail or sheet)
- Empty Sheet / Dialog / Popover bodies
- Console.log click handlers
- Buttons with no onClick AND no asChild Link (silent dead-ends — the
  one outlier is an `onClick={() => {}}` no-op, see Empty handler above)

Phase 1 + 2 + repricing did most of the heavy lifting; the remaining work is
the long tail of polish handlers and a small number of UX-misleading saves.
