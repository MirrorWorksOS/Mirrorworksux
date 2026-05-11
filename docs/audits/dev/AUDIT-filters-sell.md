# Sell — Filter / Search / View UX Audit

- **Audit date:** 2026-05-11
- **Scope:** `apps/web/src/components/sell/` list/board/grid screens
- **Shared infra noted:** `apps/web/src/components/shared/layout/ToolbarFilterButton.tsx`, `PageToolbar.tsx`, `IconViewToggle.tsx`

## Cross-cutting finding — the generic filter popover

`ToolbarFilterButton.tsx:18` hard-codes `STATUS_OPTIONS = ["All", "Active", "Draft", "Completed"]` and a generic search + date range. Every Sell page that drops a `<ToolbarFilterButton />` (CRM, Opportunities, Orders, Invoices, Activities, Quotes) inherits this list verbatim. The popover state is local-only — `handleApply` just toasts "Filters applied". So **every screen below has the same three irrelevant status pills until this is replaced with a per-screen, schema-aware filter model** (Odoo-style facets: chip filters + group-by + saved searches).

---

## SellCRM.tsx (Customers)

**Current** — `SellCRM.tsx:32-65`
- Search: company / contact substring (`SellCRM.tsx:37-40`)
- Filter: generic `ToolbarFilterButton` → bogus Active/Draft/Completed
- Views: `card` (default), `list` (placeholder — "Would render SellCRMList component here", `SellCRM.tsx:146`)
- No sort, no group-by, no tab pills

**Irrelevant filters** — Draft, Completed (customers aren't documents). Even "Active" is ambiguous vs the data's actual `status` of `active | prospect | inactive`.

**Recommended filters**
| Facet | Why |
|---|---|
| Lifecycle status | prospect / active / inactive / churned (matches `Customer.status`) |
| Account owner / sales rep | Books-of-business view |
| Territory / region | State or postcode band (AU context) |
| Revenue band | <\$10k / \$10–50k / \$50–250k / \$250k+ (off `totalRevenue`) |
| Open opportunities | has-open / none |
| Last activity recency | ≤7d / ≤30d / ≤90d / dormant 90d+ |
| Industry / segment | Steel, rail, aerospace, etc. |
| Payment-terms / credit risk | Net 30 / Net 60 / on hold |
| Tags | free-form CRM tags |

**Recommended views** — Card (have), List (build out the placeholder), **Map** (pin customers by site for territory planning), **Pipeline-by-customer** roll-up (treemap of $ value).

**Date fields** — Not a date-critical screen; keep date inside the filter popover.

**Preset opportunities**
1. *My active accounts* (owner = me, status = active)
2. *Dormant — no activity 60d+* (re-engagement list)
3. *Hot prospects* (prospect + open opp + activity ≤7d)
4. *Top revenue tier* ($250k+ this FY)
5. *Credit watch* (overdue invoices > 0)

**Smart / AI filters**
- "Customers I haven't touched in 30 days who placed an order last year"
- "Accounts with declining order frequency"
- "Prospects most similar to our top 10 wins"
- "Customers with quotes expiring this week"

---

## SellOpportunities.tsx (Pipeline)

**Current** — `SellOpportunities.tsx:62-104`
- Search: free-text (`:98`)
- Filter: generic popover — no stage / priority / owner filter at all
- View: **kanban only** (`:108-186`). No list, no card grid, no calendar, no forecast/value chart view.
- Summary bar by stage (`:88-95`)

**Irrelevant filters** — Draft/Completed don't match the stage vocabulary (`new | qualified | proposal | negotiation | won | lost`).

**Recommended filters**
| Facet | Notes |
|---|---|
| Stage | already columns on kanban — also needed when in list view |
| Priority | `low / medium / high / urgent` (on `Opportunity.priority`) |
| Owner / rep | for team-lead views |
| Expected close | this week / month / quarter, overdue close |
| Value band | <\$25k / \$25–100k / \$100k+ |
| Probability % | ≥70 / 40–70 / <40 |
| Tags | already on the entity (`o.tags`) — unused as filter |
| Customer / account | for "show all opps for X" |
| Source | inbound / referral / trade-show / outbound |
| Last-activity recency | stale > 14d flag |

**Recommended views** — Kanban (have), **List** (must-have for sortable forecast review), **Card grid** (alternate browse), **Forecast / weighted-pipeline chart**, **Calendar** by expected-close date, **Funnel chart** (conversion).

**Persistent date field** — Yes. Expected-close range should be a chip on the toolbar (e.g. "Closing: this month") not buried in a popover, because forecast review is the most common task.

**Preset opportunities**
1. *My open pipeline — this quarter*
2. *Closing this month* (any owner, stage ≠ won/lost, close ≤ 30d)
3. *At risk* (probability <40 OR last activity >14d AND stage ≥ proposal)
4. *Team review — Leads' board* (shared, group-by stage)
5. *Stalled in Proposal >21d*
6. *High-value urgent* (value > \$100k AND priority = urgent)

**Smart / AI filters**
- "Show me opportunities likely to slip past close date"
- "Deals where the customer has gone quiet" (uses activity recency + quote views)
- "Opps similar to the last 5 I won"
- "Where my forecast is most at risk this month"
- "Suggest next best action for each open opp"

---

## SellQuotes.tsx

**Current** — `SellQuotes.tsx:139-214`
- Search (number + customer, `:148-153`)
- Status pills via `ToolbarFilterPills`: All / Draft / Sent / Accepted / Expired (`:54-60`, `:173-177`) — these are correct
- Also the generic `ToolbarFilterButton` (`:179`) — redundant + wrong options
- View: **table only**

**Irrelevant filters** — The popover's Active/Draft/Completed duplicates and conflicts with the (correct) pill row above.

**Recommended filters** — Owner, customer, opportunity, value band, valid-until window (expiring this week!), viewed-by-customer y/n (`viewEvents` is already on the entity but unused as filter), markup band, currency.

**Recommended views** — Table (have), **Card** (visual review of recent sends), **Kanban by status**, **Calendar by valid-until** (so reps see expiry cliffs).

**Persistent date field** — Yes. *Valid-until* range should be visible on the toolbar; expiring quotes are the highest-leverage daily task.

**Preset opportunities**
1. *My quotes awaiting customer response* (sent + viewed but not accepted)
2. *Expiring this week*
3. *Sent but never viewed >3d* (follow-up nudge)
4. *Accepted — not yet converted to SO*
5. *High-value drafts* (>\$50k, draft >5d)

**Smart / AI filters**
- "Quotes likely to close this month based on view activity"
- "Which quotes need a follow-up call today?"
- "Quotes with pricing outside our usual margin band"
- "Suggest a revision for quotes the customer viewed multiple times but didn't accept"

---

## SellOrders.tsx (Sales Orders)

**Current** — `SellOrders.tsx:58-92`
- Search, generic filter button, summary bar (`:71-79`), table view only
- No status pills (despite a clear 6-state status enum at `:27`)

**Irrelevant filters** — generic Active/Draft/Completed doesn't match `draft | confirmed | in_production | shipped | invoiced | complete`.

**Recommended filters** — Status (the real 6), customer, owner, date range (order date), value band, has-job-ref / unlinked, on-time vs late, partial-shipment flag.

**Recommended views** — Table (have), **Kanban by status** (visual fulfilment board), **Calendar by promised ship date**, **Group-by customer/job** (collapsible).

**Persistent date field** — Yes if a "promised ship date" exists in the entity; otherwise order date range as a chip.

**Preset opportunities**
1. *Awaiting confirmation* (status = draft, >24h old)
2. *In production this week*
3. *Ready to invoice* (status = shipped, not yet invoiced)
4. *My orders — late this week*
5. *Unlinked to a job* (jobReference empty)

**Smart / AI filters**
- "Orders that will likely miss their promised date"
- "Orders without a linked production job"
- "Customers whose orders are slowing down month-over-month"

---

## SellInvoices.tsx

**Current** — `SellInvoices.tsx:51-237`
- Status pills (correct): All / Draft / Sent / Paid / Overdue (`:196-202`)
- Plus generic filter button (`:205`) — redundant
- Table only; overdue-days inline on Due column (`:99-107`)

**Irrelevant filters** — popover Active/Completed; the status pills already work.

**Recommended filters** — Aging buckets (current / 1–30 / 31–60 / 61–90 / 90+), customer, amount band, payment method, currency, partially-paid, has-credit-note, owner / AR rep.

**Recommended views** — Table (have), **Aging report grid** (buckets × customer), **Calendar by due date**, **Card** for at-risk overdue.

**Persistent date field** — Yes. Due-date range chip on the toolbar — aging is the daily AR task.

**Preset opportunities**
1. *Overdue 60+ days* (red list)
2. *Due this week*
3. *Sent — unpaid >14d, no reminder sent*
4. *My customers — outstanding balance*
5. *Drafts older than 7d* (cleanup)

**Smart / AI filters**
- "Invoices likely to be paid late based on customer history"
- "Customers whose DSO is trending up"
- "Suggested dunning queue for today"
- "Disputes — invoices viewed but not paid >21d"

---

## SellActivities.tsx

**Current** — `SellActivities.tsx:534-721`
- Search, list/calendar `IconViewToggle` (`:667-674`), inline chip rows for Type and Status (`:681-721`) — this is the most evolved filter UX in Sell
- Calendar with month/week/day granularity (`:773-787`)
- Still includes the generic `ToolbarFilterButton` (`:666`) on top of the working chip rows — redundant

**Irrelevant filters** — popover Active/Draft/Completed doesn't match the activity `status` enum (`scheduled | in_progress | overdue | completed`).

**Recommended filters** — Assignee (currently absent from the chip row even though data has it), related opportunity / customer, due window (Today / Next 7 / Overdue), type (have), status (have), priority, has-notes, completed-by-me.

**Recommended views** — List (have), Calendar (have), **Kanban by status**, **Timeline per opportunity**, **My agenda** (today + tomorrow stacked).

**Persistent date field** — Yes. A "Due:" range chip should sit beside Type/Status chips so reps can scope the list to "Today + Overdue" with one click.

**Preset opportunities**
1. *My tasks today*
2. *Overdue — anyone*
3. *Next 7 days — my team* (shared, lead view)
4. *Awaiting reply* (emails sent >3d, no response)
5. *Notes captured this week* (review intel)

**Smart / AI filters**
- "What should I do next today?"
- "Activities I keep snoozing"
- "Meetings without a follow-up task logged"
- "Customers I owe a follow-up to"

---

## SellCustomerPortal.tsx

Customer-facing read-only preview. Sections (shipping, quotes, orders, invoices) have implicit status chips and no top-level filter bar. Out of scope for sales-user filtering, but the same principle applies: the embedded mini-tables (`:540`, `:617`) hard-code statuses with no filter affordance — for portal customers a simple "Outstanding only" / "Last 90d" toggle on invoices and orders would be high value.

---

## Top-level recommendations

1. **Kill the generic `ToolbarFilterButton`** or refactor it into a schema-driven component (`<EntityFilter schema={…}/>`) where each screen passes its own facet list. Today it is actively misleading on every Sell screen.
2. **Adopt Odoo-style chip filters + group-by + saved searches** as the standard pattern. The chip rows in `SellActivities` are the right direction — generalise and reuse.
3. **Promote date range to a first-class toolbar chip** on Quotes (valid-until), Invoices (due date), Activities (due date), Opportunities (expected close), Orders (promised ship).
4. **Add list + card alongside kanban on Opportunities** — kanban-only is a known frustration for forecast review.
5. **Build a shared "Saved Views" model** so presets above can be persisted per-user and shared by Leads to their team (matches the access-role vocabulary: admin / lead / team).
6. **Wire `viewEvents`, `tags`, `priority`, `probabilityPercent`, `lastActivity`** into filter facets — the data is already on the entities but not surfaced.
