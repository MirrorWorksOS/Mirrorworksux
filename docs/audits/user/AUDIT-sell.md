# Sell — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker, recovery pass)
- **Source-of-truth references:**
  - Spec doc: **NOT READABLE BY AUDITOR** — `MirrorWorksModuleSpec.pdf` is present at `apps/web/src/guidelines/MirrorWorksModuleSpec.pdf` but the canonical link from `AccessRightsAndPermissions.md` is broken. Tier vocabulary (Pilot / Produce / Expand / Excel) is inferred from wider MirrorWorks materials.
  - Code: `apps/web/src/components/sell/`
  - Routes: `apps/web/src/routes.tsx` — `/sell/*`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-sell.md`

## Completeness findings

- 19 Sell user docs are in place (1 module landing + 18 screen docs). Every `/sell/*` route has a corresponding doc.
- Of the standard user-doc shape (Overview, Concepts, Tasks, FAQs, Related), only **Overview** (as "Summary") and a partial **Tasks** (as "Primary Actions") are represented. **Concepts** sections are absent across all 19 docs. **FAQs** sections are absent across all 19 docs. **Related** is present in the module README as "Related Modules" but absent from every screen doc.
- No Sell user doc contains a worked example — no named metal-fab customer, no example quote, no example invoice. `SellNewQuote.tsx` lines 43-55 ship hard-coded fabrication-flavoured seed data (TechCorp, BHP Contractors, Pacific Fab, PROD-SR-001 "Server Rack Chassis", LABOUR-WLD "Welding Labour") — none of this makes it into the user doc, which is still generic.
- No Sell user doc describes permissions in user terms. `SellSettings.tsx` declares eight permission keys (`crm.access`, `quotes.create`, `invoices.create`, `pricing.edit`, etc.) and three default groups (Sales, Finance, Readonly) which are invisible to users reading the docs.
- `docs/user/modules/sell/README.md` "Primary Users" is a flat list (sales reps, account managers, estimating staff, customer service). It does not say who can do what.

## Accuracy findings

- `README.md` line 54 names `apps/web/src/store` as a location for stores/services — that is a dev-surface path leaking into user docs.
- `README.md` "Open Issues / UX Debt" block (lines 57-70) lists routes with strings like "placeholder/legacy language present", "mock/seed data usage visible in component", "action feedback often toast-driven". These are implementation notes, not user-facing issues, and read as negative marketing inside the user track.
- `customer-portal.md` user doc frames the portal as a live capability ("Complete customer portal work…"). The component (`SellCustomerPortal.tsx` lines 7-8, 35) self-identifies as a "portal **preview**" with a hard-coded `PORTAL_CUSTOMER_ID = "cust-001"`. The user doc should label this as a preview / demo, or users will assume there is a real external portal.
- `new-quote.md` and `quotes.md` say pricing assumptions and margin calculation are visible, which matches the component — but neither mentions the fixed 10% tax rate hard-coded at `SellNewQuote.tsx` line 57 (`TAX_RATE = 0.10`). For user docs this is either a fact that must be surfaced or a limitation that must be labelled.

## Consistency findings

- **Every** Sell user doc uses the same 13-heading template, which is itself a dev-oriented shape (Components Used, Logic / Behaviour, Dependencies, Related Files). User docs should not ship with these headings.
- Heading style: all headings are currently noun phrases ("Summary", "Primary Actions", "Key UI Sections"). None use task-oriented imperatives, but none use gerunds either. Headings are flat and generic rather than wrong.
- Route citations appear as a `## Route` heading in every screen doc. Users do not care about URL paths; the route should move to a metadata block or be dropped.

## Style findings

- **Second person / present tense:** almost never used. `quotes.md` line 10: "Complete quotes work and move records to the next stage." is neither second-person nor present-imperative — it is a template placeholder. Every "User Intent" line is boilerplate of this form across all 18 screens.
- **Passive voice:** pervasive. Example `quotes.md` line 18: "Primary table/list region for records." `dashboard.md` line 54: "verify real-data behavior in integration testing." Rewrite as active instructions.
- **Marketing verbs:** none detected. Grep for `leverage|seamless|robust|cutting-edge|empower|game-changer|streamline|unlock|unleash` returned only three hits of the word "robust" in `invoice-detail.md`, `order-detail.md`, `product-detail.md` — all in a dev-oriented "robust data loading/error recovery" phrase, which is a leak from the dev track but not marketing.
- **Implementation details leaking in:** frequent. Every "Components Used" section names React component paths. Every "Dependencies" section mentions "store/service/hook". "Data Shown" frequently says "mock/seed data sources (inferred from code)". No direct mentions of Supabase, Convex, WorkOS, Resend, React, Zustand, or Con-form Group — grep clean on those names.
- **3D / Babylon / MirrorWorks View:** not over-prominent in Sell user docs. No mentions.
- **Tone:** flat/generic. Reads as machine-generated scaffolding. Needs a human pass to inject verbs, customer language, and scenarios.

## Metadata findings

- **Tier badge (Pilot / Produce / Expand / Excel):** absent from all 19 Sell docs. Grep for `tier|Pilot|Produce|Expand|Excel` returns zero files.
- **`last-reviewed` / `applies-to` / `status` / `related`:** absent from all 19 Sell docs.
- No YAML frontmatter anywhere in `docs/user/modules/sell/`.

## Visual findings

Screenshots available under `docs/audits/screenshots/sell/`:

- Covered (10): `sell.png`, `sell-activities.png`, `sell-crm.png`, `sell-invoices.png`, `sell-opportunities.png`, `sell-orders.png`, `sell-portal.png`, `sell-products.png`, `sell-quotes.png`, `sell-settings.png`.
- Missing screenshots for these task guides:
  - `customer-detail.md` (`/sell/crm/:id`)
  - `opportunity-detail.md` (`/sell/opportunities/:id`)
  - `order-detail.md` (`/sell/orders/:id`)
  - `invoice-detail.md` (`/sell/invoices/:id`)
  - `product-detail.md` (`/sell/products/:id`)
  - `quote-detail.md` (`/sell/quotes/:id`)
  - `new-invoice.md` (`/sell/invoices/new`)
  - `new-quote.md` (`/sell/quotes/new`)
- No user doc embeds any screenshot. Even the 10 captured images are not linked from any `.md` file under `docs/user/modules/sell/`.

## Gaps and recommendations

### P0 (blocking)

- No spec doc of record traceable from the user-doc set. Fix the broken `AccessRightsAndPermissions.md → MirrorWorksModuleSpec.pdf` link so tier definitions and permission keys have a canonical anchor.
- **Tier badges absent across every Sell user doc.** Before launch, every article needs a Pilot / Produce / Expand / Excel badge; today there are zero. This is a hard blocker on user publishing because readers cannot tell which articles apply to their plan.
- Template is dev-oriented. Replace the current 13-heading template with a user-doc skeleton: Overview, Concepts, Tasks (imperative), FAQs, Related, plus a metadata block (tier, last-reviewed, applies-to, status). The existing template must be retired before the next module is migrated.
- "Components Used", "Logic / Behaviour", "Dependencies", and "Related Files" sections are leaking implementation detail into the user track and must be stripped or moved to the dev stubs referenced in `docs/audits/MIGRATION-LOG-sell.md`.

### P1 (should fix before launch)

- Rewrite every "User Intent" as a second-person, present-tense task statement ("Create a quote and send it to a customer for approval", not "Complete quotes work and move records to the next stage").
- Convert "Primary Actions" bullets into imperative task headings ("Add a line item", "Apply a margin") with short procedures underneath.
- Add a **Concepts** section per screen explaining the domain objects (what an opportunity vs a quote vs an order is, in user vocabulary).
- Add an **FAQs** section answering realistic fab-shop questions ("What happens when I delete a line item on an accepted quote?", "Can I re-issue an invoice?").
- Add realistic metal-fab worked examples. `SellNewQuote.tsx` already seeds plausible customers/SKUs (TechCorp, BHP Contractors, PROD-SR-001 Server Rack Chassis, LABOUR-WLD Welding Labour) — lift these into the docs rather than inventing new ones.
- Translate `sellPermissionKeys` into plain English per screen ("You need the **Create quotes** permission to see the New Quote button").
- Label the Customer Portal as a **preview** in its user doc until it is connected to a real external portal.
- Surface the AUD-only / 10% tax-rate assumptions on `new-quote.md` and `new-invoice.md`.
- Capture the 8 missing screenshots and embed all 18 into their matching task guides.

### P2 (nice to have)

- Add a short glossary at `docs/user/modules/sell/README.md` covering CRM, pipeline, opportunity, quote, order, invoice, portal, RFQ.
- Replace boilerplate phrases ("Action persistence paths are not fully visible in this component alone.") with plain statements of what the user will and will not see.
- Cross-link Sell docs to the Plan / Make / Ship / Book docs at the points where handoff happens (quote → production order, order → shipment, invoice → payment).
- Add an "Open Issues" block per screen only if framed as user-visible limitations, not as dev debt.
