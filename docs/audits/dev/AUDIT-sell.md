# Sell — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker, recovery pass)
- **Source-of-truth references:**
  - Spec doc: `apps/web/src/guidelines/MirrorWorksModuleSpec.pdf` **present in repo**, but the link from `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` (`./MirrorWorksModuleSpec.pdf`) resolves to a sibling that does not exist — the PDF is one directory up. The audit below treats the PDF as not readable by this worker (not parsed).
  - Code: `apps/web/src/components/sell/`
  - Routes: `apps/web/src/routes.tsx` — `/sell/*`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-sell.md`

## Completeness findings

- All 18 routes under `/sell/*` defined in `apps/web/src/routes.tsx` have a corresponding doc file in `docs/user/modules/sell/`. Completeness of routes-to-docs is 100%.
- The following built components have NO dedicated doc file and are not mentioned in any of the 19 migrated docs:
  - `apps/web/src/components/sell/CapableToPromise.tsx`
  - `apps/web/src/components/sell/DxfUploadPanel.tsx`
  - `apps/web/src/components/sell/ESignaturePanel.tsx`
  - `apps/web/src/components/sell/LeadScoreIndicator.tsx`
  - `apps/web/src/components/sell/PortalQuoteChat.tsx`
  - `apps/web/src/components/sell/PortalRevisionTracker.tsx`
  - `apps/web/src/components/sell/QuoteAssistantBar.tsx`
  - `apps/web/src/components/sell/QuoteHeuristicPanel.tsx`
  - `apps/web/src/components/sell/QuoteViewActivity.tsx`
  - `apps/web/src/components/sell/SellOpportunityQuickActivitySheet.tsx`
  - `apps/web/src/components/sell/SellOpportunityRecommendedActions.tsx`
  - `apps/web/src/components/sell/WinLossAnalysis.tsx`
  - `apps/web/src/components/sell/sell-opportunity-agent-feed.tsx`
- Shared module-local helpers not documented anywhere: `apps/web/src/components/sell/sell-activity-shared.ts`, `apps/web/src/components/sell/sell-opportunity-types.ts`.
- The template used in migrated docs lacks a `## Service layer` or `## API surface` section. `apps/web/src/services/sellService.ts` (181 lines, facade over `./mock`, marked _"Replace the mock implementation with a remote adapter when Convex is ready"_) is not referenced by any migrated Sell doc.
- `@/services` is imported by 15 of the 18 screen-level Sell components (see `Found 16 total occurrences across 15 files` grep). Not a single migrated doc lists a service method (e.g. `sellService.getCustomers`) by name.
- `@/types/entities` is the exported TS contract consumed by 13 Sell components. Migrated docs list UI component imports only; no doc surfaces `Customer`, `Opportunity`, `Quote`, `SalesOrder`, `SellInvoice`, `SellActivity`, `CapableToPromiseResult`, `WinLossRecord`, `LossReasonBreakdown`, etc.
- Mock data shapes: `apps/web/src/services/mock/` is the canonical mock source for Sell. No doc names it.
- Zustand stores: grep across `apps/web/src/components/sell/` for `useQuery`, `useMutation`, `zustand`, `@tanstack`, `createStore` returns zero. Stores listed in `apps/web/src/store/` (`agentStore`, `bridgeStore`, `commandPaletteStore`, `notificationStore`, etc.) are not consumed by Sell screens. Dev docs should make it explicit that Sell today is local-state-only; this is absent from every migrated doc.
- React Query keys: no Sell screen uses TanStack Query. Dev docs should flag this as deliberate (prototype stage) vs accidental.
- Event flows / mutations: every mutation in Sell resolves to `toast(...)` from `sonner`. `SellDashboard.tsx`, `SellNewQuote.tsx`, `SellCRM.tsx`, `SellCustomerPortal.tsx`, `SellSettings.tsx` all import `toast` and fire it in handler callbacks. No doc describes the pending wiring to real mutations, nor links this pattern to a migration TODO.
- Migration context: `sellService.ts` comment explicitly names Convex as the target backend. No migrated doc surfaces this, and there is no `## Migration status` section in the doc template.
- Permissions touchpoints (ARCH 00 §4.3): `apps/web/src/components/sell/SellSettings.tsx` declares `sellPermissionKeys`: `documents.scope`, `crm.access`, `pipeline.visibility`, `quotes.create`, `invoices.create`, `pricing.edit`, `settings.access`, `reports.access`. None of the per-screen docs mention which permission key gates them (e.g. `quotes.md` does not note that `quotes.create` governs the "Create Quote" CTA).
- Testing notes: no migrated Sell doc has a `## Testing` or `## QA` section. `docs/user/modules/sell/quotes.md` for example is 63 lines and discusses no test approach.
- Dynamic route coverage: `/sell/crm/:id`, `/sell/opportunities/:id`, `/sell/orders/:id`, `/sell/invoices/:id`, `/sell/products/:id`, `/sell/quotes/:id` all documented. Their param-loading strategy is described as "not obvious in this component" across at least three files (`order-detail.md`, `invoice-detail.md`, `product-detail.md` line 40/58/59) — this is a copy-paste finding rather than screen-specific analysis.

## Accuracy findings

- `docs/user/modules/sell/dashboard.md` says "No explicit mock marker in this file". `SellDashboard.tsx` lines 9-25 import 17 seed data arrays from `@/services` (e.g. `sellKpis`, `revenueByMonth`, `sellApprovalQueue`, `topPerformers`, `quarterlyTargets`). The doc's assertion is factually wrong.
- `docs/user/modules/sell/customer-portal.md` "Components Used" list omits `PortalRevisionTracker` and `PortalQuoteChat`, both of which live in the same folder and are used within the portal flow.
- `docs/user/modules/sell/new-quote.md` "Components Used" omits `MirrorWorksAgentCard` and `AgentLogomark`, used via `QuoteUploadZone` on that route.
- Every migrated doc says "No explicit store/service/hook dependency imported in this component". For at least 15 of the 18 screens this is incorrect — they import `@/services` (e.g. `SellCRM.tsx` line 23: `import { customers } from '@/services';`).
- `docs/user/modules/sell/README.md` line 54 refers to `apps/web/src/services` as the store/service location; this is correct but the per-screen docs contradict it. Treat as dev-doc internal inconsistency.
- `docs/user/modules/sell/settings.md` claims the page "includes mock/seed data sources (inferred from code)". `SellSettings.tsx` declares `sellPermissionKeys` and `sellDefaultGroups` inline — that is hard-coded demo seed, not imported mock. The distinction matters for the migration path (inline seed has to be extracted before it can move to Convex).
- Currency / locale: `SellCustomerPortal.tsx` line 40 hard-codes `'en-AU', currency: 'AUD'`. No doc mentions a locale policy; docs that discuss "pricing" do not flag the AUD-only assumption.
- `QuoteUploadZone.tsx` accepts `.dxf, .dwg, .step, .pdf, .xlsx, .csv, .png, .jpg, .jpeg`. `docs/user/modules/sell/new-quote.md` lists `QuoteUploadZone` as a component but does not enumerate accepted formats, so there is no dev surface for "which file types does the quote uploader accept".
- `SellNewQuote.tsx` pipeline stages (`upload → parse → classify → extract → match → review`) are not described in any doc. This is the central "AI RFQ intake" pipeline for the module and is undocumented for developers.
- `SellDashboard.tsx` is explicitly lazy-loaded via `React.lazy(...)` in `routes.tsx`. No doc mentions code-splitting or lazy routes; a developer reading only the docs would not learn that Sell ships with route-level lazy boundaries.
- No Sell dev doc references `packages/contracts` despite `apps/web/src/services/contracts.ts` existing. README says "Contract alignment reference: `packages/contracts`" — no per-screen doc follows up.
- No doc references Material Tailwind, Tailwind v3, Geist, Inter, Supabase, WorkOS, or Resend (grep returns zero). Clean on this dimension.
- `sellService.ts` comment names Convex as target. No migrated doc conflates Supabase/Convex, but none labels "current vs target" either — findings are silent.

## Consistency findings

- All 18 screen docs use the same 13-heading template (Summary, Route, User Intent, Primary Actions, Key UI Sections, Data Shown, States, Components Used, Logic / Behaviour, Dependencies, Design / UX Notes, Known Gaps / Questions, Related Files). The template is followed consistently across the module.
- README.md does NOT follow the screen template — it uses Purpose / Primary Users / Key Workflows / Main Routes / Core Entities / Important Components / Data Dependencies / Open Issues / Related Modules. This is appropriate for a landing page but should be noted so tooling does not try to parse it as a screen doc.
- "States" vocabulary varies: `quotes.md` lists `default, error, success, blocked, populated`; `customer-portal.md` lists `default, loading, empty, success, populated`; `dashboard.md` lists `default, error, success, populated`. There is no central enum.
- Filename convention is kebab-case (`quote-detail.md`, `new-quote.md`) but the equivalent component filenames are PascalCase (`SellQuoteDetail.tsx`, `SellNewQuote.tsx`). Cross-links resolve, but there is no stated convention for which name wins.
- "Components Used" lists use mixed import notations: `@/components/sell/QuoteViewActivity` vs `apps/web/src/components/ui/button.tsx` in the same list (see `quotes.md` lines 32-41).
- "Design / UX Notes" contains boilerplate phrases repeated across ≥10 files: "Mock/seed records are present; edge-case realism may be limited.", "Action persistence paths are not fully visible in this component alone.", "Placeholder/legacy text suggests unfinished UX in parts of this page."

## Style findings

- UK English: mixed. `dashboard.md` line 47: `"memoized"` (US); `new-quote.md` line 51: `"memoized"`. Should be `memoised`. Also `behavior` vs `behaviour` used inconsistently (`behaviour` in headings, `behavior` in body).
- Oxford comma: not audited line-by-line; template content is short and does not exercise it.
- Direct technical register: acceptable. No marketing verbs in dev docs.
- Hyphenation: `client-side`, `mock/seed-backed` — consistent.
- Code fencing: no code blocks in any migrated doc. Dev audiences will expect at least route definitions, service signatures, and permission key tables — none present.

## Visual findings

Screenshots available under `docs/audits/screenshots/sell/`:

- `sell.png`, `sell-activities.png`, `sell-crm.png`, `sell-invoices.png`, `sell-opportunities.png`, `sell-orders.png`, `sell-portal.png`, `sell-products.png`, `sell-quotes.png`, `sell-settings.png`.

Coverage vs routes:

- Covered: `/sell`, `/sell/activities`, `/sell/crm`, `/sell/invoices`, `/sell/opportunities`, `/sell/orders`, `/sell/portal`, `/sell/products`, `/sell/quotes`, `/sell/settings`.
- Missing: all six dynamic detail routes (`/sell/crm/:id`, `/sell/opportunities/:id`, `/sell/orders/:id`, `/sell/invoices/:id`, `/sell/products/:id`, `/sell/quotes/:id`), plus the two "new" routes (`/sell/invoices/new`, `/sell/quotes/new`).
- No doc in `docs/user/modules/sell/` embeds any image. Screenshots are reference-only for the audit.
- Spot-check: `sell-crm.png` vs `docs/user/modules/sell/crm.md` — doc mentions card view and list toggle; component `SellCRM.tsx` lines 34-35 confirms `viewMode: 'card' | 'list'`. Consistent.

## Gaps and recommendations

### P0 (blocking)

- The spec doc of record `MirrorWorksModuleSpec.pdf` is referenced from `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` with a broken relative path (`./MirrorWorksModuleSpec.pdf` resolves nowhere; the file actually lives at `apps/web/src/guidelines/MirrorWorksModuleSpec.pdf`). Fix the link or move the PDF. Until fixed, no tooling can trace per-module findings back to the canonical spec.
- Dev-doc split is not real. `docs/dev/modules/sell/` exists as an empty directory (stubs named in `MIGRATION-LOG-sell.md` lines 31-48 were never created in this working tree). Either create the stubs or remove the promise.
- Every migrated Sell doc is Mixed (user + dev content in one file). Without a real split, audiences cannot be served — dev readers get marketing-thin user sections; user readers get component import lists. Work the split before next module audit.

### P1 (should fix before launch)

- Add a `## Service layer` section to the screen-doc template and back-fill it for all 18 Sell screens using `apps/web/src/services/sellService.ts` method names.
- Add a `## Permission gate` section and map each screen to its `sellPermissionKeys` entry (ARCH 00 §4.3).
- Fix the false "No explicit store/service/hook dependency imported" claim in every screen doc — Sell imports `@/services` in 15 of 18 screens.
- Document the 13 undocumented Sell components listed above (CapableToPromise, QuoteAssistantBar, QuoteHeuristicPanel, WinLossAnalysis, etc.).
- Document the `QuoteUploadZone` pipeline (6 stages) and accepted file types in `new-quote.md`.
- Replace the three copy-pasted "dynamic route exists but robust data loading/error recovery is not obvious" lines in `order-detail.md`, `invoice-detail.md`, `product-detail.md` with screen-specific analysis.
- Unify "States" vocabulary across screens; publish the enum in a Sell module preamble.
- Add a `## Migration status` section per screen noting the prototype-stage toast-only wiring and the Convex target named in `sellService.ts`.
- Capture the 8 missing screenshots (dynamic detail routes + two "new" routes) for the next audit pass.

### P2 (nice to have)

- Normalise UK English (`memoised`, `behaviour`).
- Add code fences with route definitions, service signatures, and permission key tables to every screen doc.
- Unify import notation in "Components Used" lists (choose `@/`-alias OR absolute `apps/web/src/` path and apply consistently).
- Pull "Currency / locale" into a module-level note since `SellCustomerPortal.tsx` hard-codes AUD.
- Surface lazy-loading / code-splitting behaviour from `routes.tsx` in the Sell README.
- Promote `sell-opportunity-types.ts` into `@/types/entities` or document why it lives beside components.
