# Buy — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Audience:** Buy-module end users — admins, leads, and team members in the Purchasing, Receiving, or Accounts groups (ARCH 00 §4.8).
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** as `.docx` — see P0 finding in `docs/audits/dev/AUDIT-buy.md`.
  - Code: `apps/web/src/components/buy/` (19 components)
  - Routes: `apps/web/src/routes.tsx` lines 269-293
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Screenshots: `docs/audits/screenshots/buy/` (15 PNGs this pass)
  - Existing user docs: `docs/user/modules/buy/` (20 files, migrated from `docs/modules/buy/` — see `docs/audits/MIGRATION-LOG-buy.md`)

## Completeness findings

- 19 of 19 routes have a doc in `docs/user/modules/buy/`. Route coverage is complete.
- No doc contains an imperative "how to" heading (e.g. "Create a purchase order", "Receive goods against a PO", "Compare vendor quotes"). Every doc leads with "Summary" + "User Intent" in an abstract tone. For a user audience this is the single biggest gap.
- No doc contains screenshots or numbered step-by-step instructions.
- No doc contains a "What you need before you start" or "Prerequisites" section (e.g. "you must be in the Purchasing group, and at least one supplier must exist").
- No doc contains a "What to do next" / "Related tasks" section at the end. `README.md` lists Related Modules (Plan, Book, Control, Make) but screen docs do not follow up.
- No doc includes a troubleshooting section ("Nothing happens when I click X → the mutation is not wired yet; expect to see a toast that says 'coming soon'"). This is critical today because 16 of the Buy CTAs resolve to exactly that toast (see dev audit Completeness).
- No doc explains which **tier** a given feature requires. A user on the Pilot tier clicking `/buy/mrp-suggestions` has no way to know whether it's unavailable, incomplete, or working as intended.
- No doc explains the **permission** needed to perform an action. A user who cannot see the "Approve" button on a PO detail page has no in-doc explanation that `po.approve` is a separate permission from `po.create`.
- No doc explains the **MRP Suggestions vs. Plan Purchase vs. Plan MRP** distinction. Three different pages, overlapping words, zero cross-references.
- No doc describes **required field vs. optional field** behaviour on any form. The Receipts page, for example, has a "Receiving now" input — no doc states what happens on partial receipt vs. full.
- No doc describes **what happens after you click "Create PO"** on an MRP suggestion. Today the action optimistically adds the suggestion id to `createdIds` and fires a toast; the doc does not describe the journey from suggestion → PO record → supplier confirmation.
- `README.md` "Primary Users" lists `Purchasing officers, planners, and procurement managers`. These are not canon roles and not even consistently used elsewhere. A user cannot self-identify from this list.
- `README.md` "Key Workflows" contains three generic bullets that apply to any list+detail module. Buy-specific end-to-end journeys are undocumented:
  - Requisition → approve → PO → receipt → bill (procure-to-pay)
  - Suggested shortfall → bulk RFQ → compare quotes → award → PO
  - Reorder rule triggers → auto PO → receipt
- Dynamic detail routes (`:id`) are documented as if they are navigable from nowhere. No doc states "you reach this page by clicking a row on `/buy/orders`" or "by following a requisition's 'Converted to PO' link".

## Accuracy findings

- `README.md` line 7 lists non-canon user personas (see dev audit Style findings). For a user-facing doc this is worse than a style issue — users will not recognise themselves.
- `dashboard.md` "Data Shown" reads `"Page-specific records and controls shown in current UI implementation."` — a user cannot act on this. The page actually shows procurement KPIs (open POs, overdue receipts, supplier on-time %, spend vs. budget), two charts (spend by category, supplier performance), an approval queue, and an AI feed.
- `mrp-suggestions.md` "User Intent: Complete mrp suggestions work and move records to the next stage." — vacuous. A user needs to know "given a shortfall, create a purchase order in one click, grouped by preferred supplier".
- `rfqs.md`, `bills.md`, `agreements.md`, `reorder-rules.md`, `planning-grid.md`, `vendor-comparison.md`, `reports.md`, `receipts.md`, `products.md` all have the same boiler-plate "User Intent: Complete X work and move records to the next stage." Almost every page has a more specific purpose — none of it is captured.
- `settings.md` "User Intent: Configure module-specific defaults, policies, and operating behavior." — the actual settings page has four distinct panels (General, Suppliers, Reports, Access & Permissions) and each deserves its own user task.
- `receipts.md` mentions "Barcode scanner" and "Camera capture" without saying those buttons currently fire a "coming soon" toast. A user will click and be surprised.
- `products.md` refers to "Product/material/BOM and inventory planning records". Users will not recognise this sentence as a description of the materials directory they see in the UI.
- `suppliers.md` "Data Shown" mentions "sourcing comparisons" — comparisons live on `/buy/vendor-comparison`, not `/buy/suppliers`. Users will look for the wrong thing.
- `orders.md` "User Intent: Complete purchase orders work" — no mention of sending, printing, revising, or receiving.
- `requisitions.md` does not describe the **approval** flow, which is the single most important user task on this page.

## Consistency findings

- Every non-README doc opens with a `## Summary` block that repeats the page title in a slightly different sentence ("Agreements screen. Behavior is documented from current component implementation."). Low signal for users.
- "User Intent" copy is templated and almost identical across 15 of 19 docs ("Complete X work and move records to the next stage.").
- "States" appears in every doc but is not explained. A user reading `default, loading, error, success, blocked, populated` has no idea what each state means or when they'd encounter it.
- "Components Used" exposes internal React implementation detail that does not belong in user docs (e.g. `@/components/ui/button`, `@/components/shared/data/MwDataTable`).
- "Known Gaps / Questions" uses dev-oriented phrasing ("action persistence paths are not fully visible in this component alone"). A user reading this will not understand it means "the Save button does not yet save anything".
- No doc distinguishes the **read-only** Planning Grid from the **actionable** MRP Suggestions page. Both pages are presented in similar shape.
- Screen titles in screenshots (e.g. `/buy/reports` shows "Procurement Reports", `/buy/mrp-suggestions` breadcrumb reads "MRP Suggestions") do not match the page headings used in the docs (`reports.md` heading: "Reports"; `mrp-suggestions.md` heading: "MRP Suggestions"). `reports.md` should say "Procurement Reports" to match the UI.

## Style findings (per user-doc rubric)

- **UK English:** mixed — "behavior"/"memoized" appear in several docs (see dev audit); user docs should be fully UK (`behaviour`, `memoised`, `optimise`, `recognise`, `colour`, `centre`).
- **Oxford comma:** `README.md` line 4 uses it correctly. Rest of docs rarely have lists that exercise it.
- **Second person, present, imperative:** **completely absent.** Every doc uses third-person abstract ("Complete X work", "Page includes", "Routing links and back navigation are handled in-component"). User docs should read "You create a purchase order by…", "Click the Plus icon…", "Review the approval queue…".
- **Marketing verbs to flag:** scan across `docs/user/modules/buy/*.md`: zero hits for `leverage`, `seamless`, `robust`, `cutting-edge`, `empower`, `game-changer`, `optimise your workflow`, `unlock`, `unleash`, `streamline`, `"This isn't X, it's Y"`. Clean.
- **No emojis:** confirmed — no emojis anywhere in Buy docs.
- **Forbidden vendor/framework names:** zero hits for Supabase, Convex, WorkOS, Resend, React, Zustand, Con-form Group. Clean.
- **3D as differentiator:** zero hits. Clean.
- **Colours:** `README.md` and every screen doc do not mention colour, so no policy drift. Screenshot spot-check confirms MW Yellow CTAs render with dark text (compliant with `feedback: Yellow bg = dark text`).

## Visual findings

- Screenshots captured: `docs/audits/screenshots/buy/*.png` — 15 files (all list/standalone routes under `/buy/*`). File sizes 74 KB – 168 KB, chromium 1440×900.
- **Missing:** the 4 dynamic detail routes (`/buy/orders/:id`, `/buy/requisitions/:id`, `/buy/suppliers/:id`, `/buy/products/:id`). A user-doc set without detail-page screenshots has a visible gap.
- No user doc embeds any image. For user-facing docs, at least one labelled screenshot per page is the minimum expectation — especially for complex pages like `/buy/planning-grid` and `/buy/vendor-comparison`.
- Spot-check: `buy-orders.png` shows a table with columns PO Number / Supplier / Order Date / Expected / Total / Status; `orders.md` does not name the columns. A user skimming the doc cannot anticipate the screen layout.
- Spot-check: `buy-requisitions.png` shows a filter pill bar and a summary bar; `requisitions.md` mentions "Toolbar" but does not describe filter behaviour.
- Spot-check: `buy-settings.png` shows a tabbed left-rail layout (General / Suppliers / Reports / Access & Permissions); `settings.md` "Key UI Sections" lists "Charts and trend cards" — no charts are visible on the landing panel. Inaccurate and will confuse users.

## Gaps and recommendations

### P0 (blocking)

- **Nothing in `docs/user/modules/buy/` is written for a user audience.** Every doc is a high-level metadata card. Recommend rewriting all 19 screen docs in imperative voice with numbered procedures ("To create a purchase order: 1. Click the yellow **+** button in the Orders toolbar. 2. …"). Until this is done, the user docs are not fit for purpose.
- **No task-based entry points.** Users do not arrive at docs by URL — they arrive by intent ("How do I approve a PO?" "Why can't I see the Supplier edit button?"). A Buy user documentation set needs a task index (procure-to-pay, supplier onboarding, approvals, receipts, reconciliation).

### P1 (should fix before launch)

- Rewrite every "User Intent" line with a Buy-specific verb phrase. Candidates:
  - `dashboard.md` → "Get a morning snapshot of procurement health: open POs, overdue receipts, supplier performance, and the approval queue."
  - `orders.md` → "Create a purchase order, send it to a supplier, track receipt, and reconcile against a bill."
  - `requisitions.md` → "Raise a requisition, route it for approval, and convert an approved requisition to a purchase order."
  - `receipts.md` → "Record goods received against an open purchase order, partial or full."
  - `suppliers.md` → "Maintain the supplier directory — add suppliers, update contact details, and see each supplier's on-time and quality performance."
  - `rfqs.md` → "Send a request for quotation to one or more suppliers and compare the responses."
  - `bills.md` → "Match supplier bills against receipts and approve them for payment."
  - `mrp-suggestions.md` → "Turn material shortfalls into purchase orders, one row at a time, with preferred-supplier and cost pre-filled."
  - `planning-grid.md` → "See purchase demand bucketed by week and supplier; drill into a cell to plan what to buy and when."
  - `vendor-comparison.md` → "Compare suppliers side-by-side on price, lead time, quality, and on-time performance before awarding an RFQ."
  - `reorder-rules.md` → "Define a min/max reorder rule per item; let the system raise PO suggestions automatically when stock falls below the trigger."
  - `reports.md` → "Export procurement spend, supplier performance, and savings reports."
  - `settings.md` → "Configure procurement defaults, approval thresholds, supplier preferences, and who can do what in Buy (ARCH 00 §4.8)."
  - `agreements.md` → "Maintain blanket agreements — price and volume commitments that feed automatic PO creation."
- Replace `README.md` line 7 with: "Primary users: anyone in the **Purchasing**, **Receiving**, or **Accounts** group. Module leads and admins also have full access."
- Document the canonical **procure-to-pay journey** in `README.md` as a flowchart: Requisition → Approval → PO → Send → Receipt → Bill → Pay.
- Add a "What you'll need" section to every screen doc listing permission keys and tier. Use the ARCH 00 §4.8 keys verbatim.
- Re-write `settings.md` to describe the four actual panels (General / Suppliers / Reports / Access & Permissions). Do not mention charts — there are none.
- Document the "coming soon" toast backlog in a single `docs/user/modules/buy/known-limitations.md` file, so users who click these buttons have somewhere to land.
- Cross-link `/buy/mrp-suggestions`, `/plan/mrp`, `/plan/purchase` from each of their docs. Explain the intended use of each.
- Add labelled screenshots to every screen doc (reuse the 15 captured this pass; capture the 4 detail routes next pass).
- Remove "Components Used" and other implementation-detail sections from user docs. They belong in `docs/dev/modules/buy/`.
- Replace "Known Gaps / Questions" with a user-facing "Known limitations" section that names the limitation in plain English (e.g. "The 'Query supplier' button on the bill detail sheet is not yet wired up. You will see a 'coming soon' toast.").

### P2 (nice to have)

- Normalise to UK English across all Buy docs (`behaviour`, `memoised`, `optimise`, `recognise`, `colour`).
- Add a glossary — RFQ, MRP, PO, GRN, blanket agreement, reorder point, lead time, on-time performance. Users will not all be fluent.
- Add a "When to use this page vs. another" call-out to the four overlapping pages (Planning Grid vs. MRP Suggestions vs. Plan Purchase vs. Plan MRP).
- Add a module-wide consistency guide for titles — match the visible UI heading exactly ("Procurement Reports" rather than "Reports" for `/buy/reports`).
- Capture dynamic-route screenshots with seed ids on the next pass.
- Move the README "Open Issues" list out to a `KNOWN-ISSUES.md` file and regenerate it from the current component state.
