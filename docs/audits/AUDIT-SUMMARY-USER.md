# Cross-module user documentation audit — summary

- **Consolidation date:** 2026-04-18
- **Consolidator:** Claude Code (consolidation worker)
- **Inputs:** Per-module user audits on sibling branches. See [MIGRATION-LOG.md](./MIGRATION-LOG.md) for the full list of sources.

> **Coverage gap.** Only 7 of 9 planned sibling branches were available on `origin` at consolidation time. The **Sell** and **Control** module branches (`docs/audit-sell`, `docs/audit-control`) did not publish. Every finding below that cites Sell or Control is carried forward from earlier context rather than a first-party audit this pass. See [MIGRATION-LOG.md](./MIGRATION-LOG.md#coverage-gap).

---

## 1. Information architecture assessment

The proposed long-term user documentation structure is:

```
docs/
└── user/
    └── modules/
        ├── book/
        ├── bridge/            (empty today — needs priority-1 authoring; see §2)
        ├── buy/
        ├── control/           (TBD — branch missing this pass)
        ├── make/              (empty today — see Make user audit P0)
        ├── plan/
        ├── sell/              (TBD — branch missing this pass)
        ├── ship/
        └── shop-floor/
```

**Verdict: the per-module shape works for reference pages, but it misses three distinct reader surfaces.** The user audits consistently ask for task-based entry points (Buy P0), concept explanations (Sell earlier commit), and shop-floor / tablet-specific copy (Shop Floor P1.1). A single `docs/user/modules/{module}/README.md` + N screen docs cannot carry that.

Missing shelves that should open in follow-up work:

- `docs/user/concepts/` — plain-English explanations of cross-module ideas: quote, order, job, manufacturing order, work order, traveller, packet, release, RFQ, receipt, BOL, nest, BOM, MRP, WIP, cost variance. Every user audit calls out missing concept sections.
- `docs/user/glossary/` — term index with one-line definitions, cross-linked from every article. Today Buy's audit explicitly asks for "CRM, pipeline, opportunity, quote, order, invoice, portal, RFQ" — once for Buy, once for Sell, once for Book. It should live once.
- `docs/user/shop-floor/` (separate from `docs/user/modules/shop-floor/`) — the shop-floor module renders in a distinct kiosk chrome (`FloorModeLayout`, no sidebar, no command palette, no AgentFAB). A tablet operator does not navigate a documentation site the same way a desk user does. Propose a dedicated `docs/user/shop-floor/` section that bundles the handful of tablet tasks, is printable, and does not sit inside the general `docs/user/modules/` grid.
- `docs/user/tasks/` — intent-driven entry points: "procure to pay", "quote to cash", "plan to make to ship", "release a job", "scan at the machine", "run end-of-period". Every audit flags that current docs are keyed by URL, not by intent.
- `docs/user/admin/` — ARCH 00 v7 in plain language: "roles, groups, tiers, permission keys, module access". Today every module's `settings.md` re-invents the permission explanation.

**Recommendation on the shop-floor split:** yes, `docs/user/shop-floor/` should be distinct from `docs/user/modules/shop-floor/`. The modules tree is for office-chrome surfaces reached via the sidebar; `docs/user/shop-floor/` is for the kiosk. Cross-link between them.

---

## 2. Cross-module consistency findings

### 2.1 Template drift

The canonical user-doc template (Overview / Concepts / Tasks / FAQs / Related) is **not used by any audited module**. Every module inherited the dev-oriented 13-heading template (Summary, Route, User Intent, Primary Actions, Key UI Sections, Data Shown, States, Components Used, Logic / Behaviour, Dependencies, Design / UX Notes, Known Gaps / Questions, Related Files).

| Module | Has Overview/Summary? | Has Concepts? | Has Tasks (imperative)? | Has FAQs? | Has Related? | Has metadata block? |
|--------|----------------------|---------------|-------------------------|-----------|--------------|---------------------|
| Book | Yes (Summary) | No | Partial (Primary Actions) | No | Partial (README only) | No |
| Bridge | **No user docs at all** | — | — | — | — | — |
| Buy | Yes (Summary) | No | Partial (Primary Actions) | No | No | No |
| Make | **No user docs at all** | — | — | — | — | — |
| Plan | Yes (Summary) | No | Partial (Primary Actions) | No | No | No |
| Ship | Yes (Summary) | No | Partial (Primary Actions) | No | No | No |
| Shop Floor | Yes | No | Partial (Primary Actions) | No | No | No |

Every user audit flags the dev-leakage sections (Components Used, Logic / Behaviour, Dependencies, Related Files) as either to be removed or moved to the dev stubs.

### 2.2 Voice drift

Consistent failure modes across modules:

- **Third person and passive voice dominate.** "Records are managed", "Files are uploaded", "Primary table/list region for records" (Buy, Ship, Plan). No imperative, no "you".
- **Boilerplate User Intent line.** Every module has at least one file with "Complete <x> work and move records to the next stage." This is a template placeholder that survived migration.
- **Coming-soon strings leak into narrative.** Buy audit catalogued the backlog; neither Buy nor Ship nor Make user docs surface it as a "known limitations" page.
- **Dev terminology leaks in.** "mock/seed data sources (inferred from code)", "store/service/hook", "behaviour is documented from current component implementation", "Components Used: `@/components/ship/ShipOrders`" all appear in user docs.
- **Marketing verbs absent** — which is good. Grep across audits returns 3 hits for "robust" (all dev leakage, not marketing), zero for "leverage / seamless / cutting-edge / empower / unlock / streamline".

### 2.3 Worked examples

Only Sell (per earlier commit) had plausible fab-shop seed data in the component (TechCorp, BHP Contractors, PROD-SR-001 "Server Rack Chassis") and only because the component hard-codes them. None of that seed leaked into the user doc. Every other module's docs use "record" / "item" / "row" rather than a named example.

---

## 3. Terminology and glossary gaps

### 3.1 UI element names

The same shape means different things in different modules. A user reading across Sell → Plan → Make → Ship will encounter each term without a definition:

| Term | Drift |
|------|-------|
| **Dashboard** | Every module has one, but what it contains varies wildly — KPI strip (Book, Buy, Ship), cards (Make), Gantt strip (Make), AIFeed (Make, Ship), Quick Nav (Ship). No shared definition. |
| **Panel** | Used for left-side quick navs, right-side inspectors, and dialog bodies. Buy audit calls Settings a "panel"; Make uses "panel" for agent cards. |
| **Drawer** | Used in Make, Sell, Ship for side-in overlays. Not distinct from "sheet" in the code. |
| **Sheet** | Shadcn component used throughout (`Sheet` from `@/components/ui/sheet`). Users see it as "the thing that slides in from the right". No user-doc defines it. |
| **Card** | Every dashboard and list page. Also used for individual records in Kanban. |
| **Action** | Used for CTA buttons, menu items, and Agent card CTAs. Ambiguous. |
| **Kanban** | Present in Make (CAPA), Ship (Orders), Book (Expenses). Column vocabularies differ per module — no shared "move between stages" explainer. |
| **Traveller / Traveler** | UK vs US spelling actively drifts. Component file is `MakeJobTraveler.tsx`; docs and commit messages use `traveller`. |
| **Release** | In Plan → Make handoff, refers to releasing a traveller. In Ship, refers to releasing a shipment. Same word, two meanings. |
| **Packet** | New term in Make (commit `c5e6d45c`); undefined anywhere in user docs. |
| **Work Order vs Manufacturing Order** | Shop Floor's dual-identity gotcha (`wo-002` / `WO-2026-0002` versus `mo-001` / `MO-2026-0001`). No user doc explains the two. |
| **Module vs Section vs Area** | Sidebar says "modules"; in-app banner says "area"; breadcrumb might say "section". No user doc normalises. |

### 3.2 Tier name drift

Tiers across the audits are consistently referenced as **Pilot / Produce / Expand / Excel**. But:

- No user doc carries a tier badge across the 7 available module audits (Book, Bridge, Buy, Make, Plan, Ship, Shop Floor). Every single audit flags tier-badge absence as P1 or P0.
- Tier assignments are seed-guessed by each auditor, not pinned against a canonical source. Examples of conflicting seed guesses:
  - Shop Floor seeded as **Produce+** in the shop-floor audit.
  - Buy's MRP / planning-grid / vendor-comparison / reorder-rules seeded as **Expand+**; reports as **Produce+**; core PO flow as **Pilot**.
  - Book's WIP, Cost Variance, Stock Valuation seeded as **Expand+**; Reports P&L as **Produce+**.
  - Make's andon alerts / AI forecasting seeded as **Expand / Excel**; Schedule / Scrap / CAPA as **Produce**; core MO/traveller/shop-floor as **Pilot**.

These are plausible but unverified. Until a canonical spec pins tier → route, publishing any tier badge risks cross-article contradiction.

### 3.3 Role name drift (user-facing)

ARCH 00 v7 fixes roles at **admin / lead / team** only. Memory `project_access_role_vocab` is categorical: *never* use Manager / Supervisor / Operator. Audit findings:

- Buy README (pre-migration): "Purchasing officers, planners, and procurement managers" — wrong.
- Sell README (earlier commit): "sales reps, account managers, estimating staff, customer service" — wrong.
- Ship README: "fulfillment" (US spelling) plus role names not mapped to the three canonical roles.
- Shop Floor: docs still refer to job titles ("CNC Operator", "Machinist") as if they were roles.
- Make: groups listed as `Production`, `Quality`, `Maintenance`, `Office` — these are **groups**, not roles. User docs do not make the distinction.

---

## 4. Deprecated pattern sweep (user-visible)

| Pattern | User-facing impact | Source |
|---------|---------------------|--------|
| **ControlRoleDesigner** (removed) | Users who followed old internal pointers would land on a non-existent page. Memory `project_role_config_deprecated` says roles now live in module Settings. User docs for Control were not audited this pass. | Commit `f6771df1`; no Control audit branch. |
| **Plan README advertising non-existent `/plan/product-studio/legacy*` routes** | Broken links in user-facing README. | Plan user audit P0. |
| **Product Studio legacy pages (`product-studio-legacy.md`, `product-studio-legacy-product.md`)** | No deprecation banner on the user doc. Users will follow link and see legacy UI without warning. | Plan user audit P1. |
| **`/make/time-clock` → `/floor` redirect** | A bookmark in a user's browser will redirect silently. Shop Floor and Make user docs do not mention this. | Make dev audit; user docs silent. |
| **`/make/scan` → `/floor` redirect** | Same. | Make dev audit; user docs silent. |
| **Traveller store removed; traveller tab in Plan deleted** | Traveller workflow moved to Make. Plan job-detail user doc still implies traveller lives in Plan. | Plan dev P0. |
| **Customer Portal is a preview, not a real external portal** | User-facing messaging frames it as shipped. The component self-identifies as "portal preview" with hard-coded `PORTAL_CUSTOMER_ID`. | Sell user audit (earlier commit). |
| **Scan-to-Ship doc stale vs commit `bc6495fc`** | Users are not guided through the new scan workflow that already ships. | Ship user audit P1 #7. |

---

## 5. Proposed knowledge base structure (long term)

The shape below draws from Apple Support (topic-first, task-keyed) and the Google developer docs (concept → guide → reference).

```
docs/
└── user/
    ├── README.md                      (welcome, what MirrorWorks is, how docs are organised)
    ├── getting-started/
    │   ├── first-login.md
    │   ├── run-the-bridge-wizard.md   (what Bridge is, how to import existing data)
    │   ├── invite-your-team.md
    │   └── choose-a-tier.md
    ├── concepts/
    │   ├── roles-and-groups.md        (admin, lead, team + domain groups)
    │   ├── tiers.md                   (Pilot, Produce, Expand, Excel)
    │   ├── modules.md                 (Sell, Plan, Make, Ship, Book, Buy, Control, Bridge, Shop Floor)
    │   ├── journey-quote-to-cash.md
    │   ├── journey-plan-to-ship.md
    │   ├── journey-procure-to-pay.md
    │   ├── journey-close-the-books.md
    │   └── agentworks.md              (what agents do, where they appear)
    ├── glossary/
    │   └── index.md
    ├── tasks/
    │   ├── sell/ …                    (verbs: create-a-quote, send-a-quote, …)
    │   ├── plan/ …
    │   ├── make/ …
    │   ├── ship/ …
    │   ├── book/ …
    │   ├── buy/ …
    │   └── control/ …
    ├── modules/                       (per-module reference — Overview / Concepts / Tasks / FAQs / Related)
    │   ├── book/ …
    │   ├── bridge/ …
    │   ├── buy/ …
    │   ├── control/ …
    │   ├── make/ …
    │   ├── plan/ …
    │   ├── sell/ …
    │   └── ship/ …
    ├── shop-floor/                    (printable, tablet-first; NOT under modules/)
    │   ├── README.md
    │   ├── set-up-your-tablet.md
    │   ├── clock-in.md
    │   ├── pick-a-machine.md
    │   ├── scan-a-traveller.md
    │   ├── run-a-step.md
    │   ├── first-off-inspection.md
    │   ├── log-scrap-or-defect.md
    │   ├── switch-operator.md
    │   └── finish-the-job.md
    ├── admin/                         (tenant admin tasks)
    │   ├── configure-permissions.md
    │   ├── manage-groups.md
    │   └── choose-tier.md
    └── reference/
        ├── keyboard-shortcuts.md
        ├── known-limitations.md       (coming-soon toast backlog, user-facing)
        └── faqs.md
```

Every module page under `docs/user/modules/{module}/` carries the standard skeleton:

```
# <Page name>

**Tier:** Pilot | Produce | Expand | Excel
**Who can do this:** admin | lead | team (and which groups)
**Last reviewed:** YYYY-MM-DD

## Overview
## Concepts
## Tasks
  ### To <verb> <object>
  1. …
## FAQs
## Related
```

---

## 6. Tier gating audit rollup

### 6.1 Coverage

| Module | Articles | Articles with a tier badge | Articles that should be tier-gated |
|--------|----------|----------------------------|------------------------------------|
| Book | 14 | 0 | WIP, Cost Variance, Stock Valuation (Expand+); Reports P&L (Produce+) |
| Bridge | 0 | — | Whole module — Pilot vs Expand gating unresolved |
| Buy | 20 | 0 | MRP suggestions, Planning grid, Vendor comparison, Reorder rules (Expand+); RFQs, Agreements, Reports (Produce+) |
| Make | 0 (empty) | — | Schedule (Gantt), Scrap Analysis, CAPA (Produce+); Andon, AI forecasting (Expand/Excel) |
| Plan | 20 | 0 | Product Studio v2, MRP, What-if, Nesting (Expand+); QC Planning, Schedule (Produce+) |
| Ship | 12 | 0 | Carrier rates, Agent pick, Scan to Ship (Produce/Expand); Returns, Warehouse map (Produce+) |
| Shop Floor | 2 | 0 | Whole module seeded **Produce+** by the shop-floor audit |

**Total badged: 0 of 68 audited articles.** This is the single most consistent cross-module user-doc finding.

### 6.2 Cross-article inconsistency (same feature, different tier)

Because no article carries a badge today, **no pair of articles contradicts another on tier**. The risk arrives as soon as one module is badged: the first three articles to cite cross-module features will almost certainly drift. Candidates to watch on the first tier-badging pass:

- **AI-assisted features** (AgentWorks, AIFeed, "Agent pick" rate recommendation, AI quote assistant). Make user audit seeds these as Expand/Excel. Ship's "Agent pick" is unclassified. Sell's quote assistant was flagged in the earlier commit as unbadged. Pick one tier for the AI surface, apply to every module.
- **MRP appears in 3 places.** `/buy/mrp-suggestions`, `/plan/mrp`, `/plan/purchase`. Buy's audit seeds `/buy/mrp-suggestions` as Expand+; Plan has no seed. Align before shipping badges.
- **Reports pages are in every module.** Book P&L, Buy spend, Ship analytics, Make scrap analysis, Plan what-if, Sell win-loss. Seed guesses cluster at Produce+. One shared "Reports tier" rule should be documented.
- **Advanced scheduling surfaces.** Plan Schedule (Produce+), Make Schedule (Produce+ guess), Ship carrier rates (Produce+ guess). If Schedule is Produce+ in Plan, Make should match.
- **Scan flows.** Ship Scan-to-Ship, Shop-Floor scan-a-traveller, Plan CAD-import. Shop-floor audit seeds barcode scanning as Produce+ implicitly; Ship's is unclassified.

### 6.3 Recommendation

1. Publish the tier → route table once, in `docs/user/concepts/tiers.md`, sourced from the canonical `.docx` spec (once the spec reaches the repo — see dev summary P0.1).
2. Each article imports its tier badge from that table rather than setting it locally. Avoids cross-article contradiction by construction.
3. Until the table exists, **do not ship ad-hoc tier badges** — an early wrong badge is worse than no badge.

---

## Priority rollup

### P0 (blocking)

- **P0.1 — No user docs for Bridge or Make.** Bridge is the first surface every new customer touches; Make is the highest-concurrency internal module. *Raised by:* Bridge user P0, Make user P0.
- **P0.2 — Dev content still in user docs** across Buy, Plan, Ship, Shop Floor. "Components Used", "Logic / Behaviour", "Dependencies", "Related Files" sections must be stripped from user copies. *Raised by:* Buy user P0, Ship user P0 #2, Sell (earlier commit), Shop Floor implicit.
- **P0.3 — Zero task-based entry points.** Users arrive by intent; docs are indexed by URL. Needs a `docs/user/tasks/` shelf. *Raised by:* Buy user P0 #2, Make user P0.
- **P0.4 — Plan README advertises non-existent legacy routes.** Broken links in a user-facing README. *Raised by:* Plan user P0.
- **P0.5 — No canonical spec.** User articles cannot be verified against a source of truth. Six of seven user audits flag this. *Raised by:* Bridge P0, Buy P0 implicit, Make P0, Plan P0, Ship P0 #1, Shop Floor P0.5.
- **P0.6 — Barcode workflow undocumented for users** despite shipping in commit `bc6495fc`. *Raised by:* Make user P0, Ship user P1 #7, Shop Floor user P0.4.
- **P0.7 — Shop-Floor task docs are scaffolds.** `floor-home.md` and `floor-run.md` need rewrites into imperative kiosk tasks. *Raised by:* Shop Floor user P0.1–P0.4.
- **P0.8 — `/make/shop-floor` is broken.** Documented with screenshot evidence. User docs cannot send users there until it renders. *Raised by:* Shop Floor user P0.2 + dev P0.3.

### P1

- Tier badges on every article (P1.1 on every audit). Publish tier → route table first (§6.3).
- Rewrite "User Intent" boilerplate into imperative task statements on every screen doc.
- Add Concepts, FAQs, Related sections to every screen doc.
- Role / group callouts per article using canonical `admin | lead | team` vocabulary; map domain groups (Purchasing / Warehouse / Quality / Production / Accounts / etc.) back to roles.
- Add cross-module handoff docs (Sell → Plan, Plan → Make, Make → Ship, Make → Book).
- Convert "coming soon" toast backlog into a single user-facing `docs/user/reference/known-limitations.md`.
- Add realistic metal-fab worked examples — reuse seed data that already exists in code.
- Add labelled screenshots embedded in articles. Most audits captured screenshots but none are referenced from the user docs.
- Fix the Sell "Customer Portal is actually a preview" mis-framing (pending Sell branch).
- Fix US → UK spelling (`fulfilment`, `memoised`, `behaviour`, `traveller`).
- Flag deprecated pages with a banner (`/plan/product-studio/legacy*`, Plan traveller tab handoff to Make).
- Translate permission-key syntax into plain English (e.g. `andon.manage` → "Manage andon alerts").
- Recapture screenshots in dark mode for parity (Make user P1).
- Shop Floor: add tablet setup, handover, offline behaviour, role explainer, tier badge (Shop Floor P1.1–P1.12).

### P2

- Apple-Support-style topic layer (`docs/user/concepts/`, `docs/user/tasks/`, `docs/user/glossary/`).
- "What's next" chaining per article (Book P1).
- Thumbnail grid in each module's user README (Ship P1 #16).
- Error-state guidance where integrations fail (Xero sync in Book; Shop-Floor offline resync).
- Per-module "Before you begin" / prerequisites blocks for multi-step flows (Plan P1).
