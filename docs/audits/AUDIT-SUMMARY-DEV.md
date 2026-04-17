# Cross-module dev documentation audit — summary

- **Consolidation date:** 2026-04-18
- **Consolidator:** Claude Code (consolidation worker)
- **Inputs:** Per-module dev audits on sibling branches. See [MIGRATION-LOG.md](./MIGRATION-LOG.md) for the full list of sources.

> **Coverage gap.** Only 7 of 9 planned sibling branches were available on `origin` at consolidation time. The **Sell** and **Control** module branches (`docs/audit-sell`, `docs/audit-control`) did not publish. Every finding below that cites Sell or Control is derived from code-read context rather than a first-party audit on this pass. See [MIGRATION-LOG.md](./MIGRATION-LOG.md#coverage-gap).

---

## 1. Information architecture assessment

The proposed long-term dev documentation structure is:

```
docs/
├── dev/
│   └── modules/
│       ├── book/
│       ├── bridge/
│       ├── buy/
│       ├── control/         (TBD — branch missing this pass)
│       ├── make/
│       ├── plan/
│       ├── sell/            (TBD — branch missing this pass)
│       ├── ship/
│       └── shop-floor/
```

**Verdict: sensible, but incomplete.** `docs/dev/modules/{module}/` works as a per-route reference layer, but it does not cover the cross-cutting surface. The following dev-doc shelves are missing entirely and should be opened in follow-up work:

- `docs/dev/architecture/` — system-level ADRs (Supabase → Convex migration plan, services layer location, offline-first boundary at Shop Floor, Zustand vs React Query boundary).
- `docs/dev/contracts/` — `@/types/entities` reference and `packages/contracts` overlay. Multiple modules (Sell per earlier commit, Buy, Ship, Make) flagged that no doc lists the entity types they consume. One shared contracts reference would prevent 9 modules each re-documenting `Customer`, `PurchaseOrder`, `WorkOrder`, etc.
- `docs/dev/platform/` — the still-unmigrated `docs/modules/platform/` residue (`README.md`, `dashboard-alias.md`, `notifications.md`, `welcome-dashboard.md`) plus `commandPaletteStore`, `agentStore`, `notificationStore`, `bridgeStore`.
- `docs/dev/access/` — one canonical ARCH 00 v7 page replacing the scattered `§4.N` references in each module doc. Today every module audit independently re-states "permissions from §4.5 Make / §4.6 Ship / §4.7 Book / §4.8 Buy" — this is drift-prone and should live in one place.
- `docs/dev/services/` — service-facade index (one row per `apps/web/src/services/{x}Service.ts`). See §6 for the P0 repo-wide finding this belongs with.
- `docs/dev/migration/` — the Supabase → Convex migration tracker. Every module audit calls out `"// Replace the mock implementation with a remote adapter when Convex is ready"` and asks for a `## Migration status` section; that work should roll up to one document.
- `docs/dev/glossary.md` — shared vocabulary (AgentWorks, Bridge, View, traveller, MO vs WO, packet, release, andon). See §3.

---

## 2. Cross-module consistency findings

### 2.1 Template adoption

| Module | Template used | Mixed files? | Dev stubs authored? |
|--------|---------------|--------------|----------------------|
| Book | Refreshed dev stubs authored from source | No — fresh authored | Yes, all 14 |
| Bridge | Single migrated doc, pulled from `modules/platform/` | No | Yes, 1 |
| Buy | 19 legacy mixed docs + stub dev files with TODO | Yes | Stubs only (content not split) |
| Make | Legacy scaffolds moved as-is to `docs/dev/modules/make/` | No (renamed as dev) | No user docs written |
| Plan | 20 legacy mixed docs + stub dev files with TODO | Yes | Stubs only (content not split) |
| Ship | 11 legacy mixed docs + stub dev files with TODO | Yes | Stubs only (content not split) |
| Shop Floor | 2 migrated files + stubs | Yes | Stubs (pointer + quick-ref only) |

**Finding:** three distinct strategies landed. Book is the only module that actually authored fresh dev content. Make moved scaffolds wholesale. Buy/Plan/Ship/Shop Floor left Mixed files in user/ plus empty dev stubs — meaning the advertised split is **not real yet**.

This is called out as a P0 by the Buy audit and as findings #1–3 on the Ship audit. It should be treated as a consolidation-level blocker: **the dev-doc split is an unkept promise across 4 of 7 audited modules**.

### 2.2 Heading hierarchy variance

- Book dev stubs adopt a consistent new template: Route, Component, Entity types, Services, Stores / React Query keys, Permission keys, Tier, Known gaps.
- Buy and Ship stubs adopt Buy's proposed headings (`Service layer`, `Types`, `Mock shape`, `Stores / React Query keys`, `Event flows`, `Permission gate`, `Tier gate`, `Migration status`, `Testing`).
- Make's migrated dev docs inherit the **old** 13-heading template (Summary / Route / User Intent / Primary Actions / Key UI Sections / Data Shown / States / Components Used / Logic / Behaviour / Dependencies / Design / UX Notes / Known Gaps / Related Files). That template was explicitly flagged as dev-leaky for user docs and dev-thin for dev docs.
- Plan stubs inherit the old template headings in the user copies and add a TODO marker to the dev stubs.
- Bridge's migrated doc is a 53-line scaffold inheriting the old template.
- Shop Floor's migrated docs inherit the old template.

**Recommendation:** pick one canonical dev-doc template and retrofit. The Buy proposal is the most complete and should be adopted as of the next audit pass:

```
# <Screen> — dev

- Route: /…
- Component: apps/web/src/components/…
- Service calls: …
- Entity types: …
- Mock shape: apps/web/src/services/mock/…
- Stores / React Query keys: …
- Event flows: …
- Permission gate (ARCH 00 §x): …
- Tier gate: Pilot | Produce | Expand | Excel
- Migration status: …
- Testing: …
- Known gaps: …
```

### 2.3 Where modules agree

Six of seven available dev audits independently raise the same top-level findings:

1. **No `.docx` spec in the repo.** Raised by Book, Bridge, Buy, Make, Plan, Ship, Shop Floor. Only Sell (earlier commit) noted the PDF exists at `apps/web/src/guidelines/MirrorWorksModuleSpec.pdf` with a broken relative link — the other six audits are not even aware of the PDF because the link is broken the same way from every module.
2. **No React Query layer.** Every module reports `useEffect` + `useState` + `service.getX().then(setState)`. Zero `useQuery` / `useMutation` hits across Book, Buy, Make, Plan, Ship, Shop Floor.
3. **Toast-only mutations.** Every module has "coming soon" toast calls in place of actual mutations. Buy catalogued 16 across 10 screens; Ship, Make, and Book all have their own backlogs.
4. **Tier gates missing at the route layer.** No module's `routes.tsx` entries check a tier or permission before mounting a page.
5. **Mock/seed data lives inline in screen components** rather than being factored to `apps/web/src/services/mock/`. Ship flagged 7 of 11 components, Book flagged WIP and Cost Variance specifically, Sell (per earlier commit) flagged every screen doc as silent on the point.

### 2.4 Where modules disagree or drift

- **Services location.** Every module ships `apps/web/src/services/{x}Service.ts`. The audit rubric explicitly expects `apps/web/src/lib/services/` — that directory **does not exist** (confirmed by Book, Buy, Make, Ship). This is a repo-wide divergence and must be reconciled (see §6).
- **Role vocabulary.** ARCH 00 v7 fixes roles at `admin | lead | team`. But the in-code copy and pre-existing docs use domain names (Buy → "Purchasing Officer", "Accounts"; Ship → "Warehouse", "Shipping", "Customer Service"; Book → "AR", "AP", "Expenses"; Shop Floor → "CNC Operator", "Machinist") which conflate **groups** with **roles**. Make's `arch00_frontend_gaps` memory flags `super_admin` as missing across the whole frontend.
- **Permission-key keys.** Each settings page declares its own keys (e.g. `BookSettings.tsx` → 7 keys; `BuySettings.tsx` → 8 keys; `MakeSettings.tsx` → 9 keys; `ShipSettings.tsx` → 7 keys). No single index lists every key by module. ARCH 00's §4.N references imply such a table exists but it is scattered across the components.
- **Shop-Floor surface is split.** `apps/web/src/components/floor/`, `apps/web/src/components/shop-floor/`, and `apps/web/src/components/make/shop-floor/` all exist. The shop-floor dev audit surfaces the duplication; the make audit does not reconcile it.
- **Deprecated components.** `docs/modules/plan/product-studio-legacy*.md` remains live without a deprecation header. `ControlRoleDesigner` has been removed entirely (commit `f6771df1`) but its doc was not audited because the Control branch never landed.

---

## 3. Terminology and glossary gaps

The following terms are used across multiple modules with no shared definition. A `docs/dev/glossary.md` should open with these entries.

| Term | Used by | Drift / gap |
|------|---------|-------------|
| **AgentWorks** | Sell, Plan, Make, Buy, global sidebar | No doc defines what the AgentFAB is, what agents exist, or where they are invoked. `MirrorWorksAgentCard` / `AgentLogomark` referenced in the Sell audit; `AIFeed` on dashboards everywhere. |
| **Bridge** | Bridge (underdocumented), Control (mount at `/control/mirrorworks-bridge`), legacy redirect at `/design/initial-data`, `useBridge` hook, `bridgeStore` (persist key `mirrorworks-bridge-v2`), `bridgeService` | Bridge is confused with **MirrorWorks View** in some materials. No single page says "Bridge is the data-import wizard; View is the 3D viewer." |
| **View** | 3D viewer surface (not audited by any worker this pass; grep-clean in Sell) | If present, needs a glossary entry — name collides with "views" in tables and the generic noun. |
| **Traveller** | Plan (source of release), Make (primary surface), Shop Floor (scanned artefact), Book (cost roll-up recipient) | `travellerStore` was removed from `apps/web/src/store/`; `PlanTravellersTab.tsx` deleted. Traveller concept still central but docs haven't caught up. Spelling drifts between `traveller` (UK) and `traveler` (US — e.g. `MakeJobTraveler.tsx`). |
| **Manufacturing Order (MO) vs Work Order (WO)** | Make, Shop Floor | Both IDs exist in mock data (`mo-001` / `MO-2026-0001`, `wo-002` / `WO-2026-0002`). Shop Floor docs call out the dual-identity gotcha; Make docs don't. |
| **Packet** | Make (traveller release packets), Plan handoff | Recent commit `c5e6d45c` surfaces packets in Make; only the commit message references the term. |
| **Release** | Plan → Make handoff, Shop Floor read side | `release traveller` is a permission key (Plan settings) and an operator action. No cross-module doc explains the contract. |
| **Andon** | Make, Shop Floor | `andon.manage` permission key exists; no doc defines the term or the UX signal. |
| **Shop Floor / Floor / Floor Mode** | Shop Floor module, Make → Shop Floor page | Three distinct surfaces (`/floor`, `/make/shop-floor`, legacy `/make/time-clock` and `/make/scan` redirects). Only the shop-floor audit names them all. |
| **Tier** | Every module — but every module lacks badges | Pilot / Produce / Expand / Excel. No single page defines what each tier gates. The access memory `feedback_arch00_spec` is the closest thing; it is auto-memory, not committed docs. |
| **Role vs Group** | Every module | Groups like `Production`, `Quality`, `Maintenance`, `Office` (Make); `Purchasing`, `Receiving`, `Accounts` (Buy); `Warehouse`, `Shipping`, `Customer Service` (Ship). These are *groups*, not *roles*. Every user-facing doc and some dev docs mislabel them. |
| **Agent pick** | Ship (Carrier rates highlight) | No definition for how agents participate in decision-making. |

---

## 4. Deprecated pattern sweep

Cross-module deprecated-feature findings from the 7 available audits plus context from the repo working tree:

| Pattern | Status | Source |
|---------|--------|--------|
| `ControlRoleDesigner` | **Removed** in commit `f6771df1` ("Add access review infra, remove Role Designer, control pages, and UI polish"). Memory `project_role_config_deprecated` confirms the page is gone. Route no longer exists. | Working tree; Control branch not audited this pass. |
| `docs/modules/control/role-designer.md` | **Stale.** Describes a page that no longer exists. Needs removal or redirection. | Git status shows the file was modified but not deleted. |
| `apps/web/src/store/travellerStore.ts` | **Deleted** (git status `D`). Dev docs referencing `useTravellerStore` need updating. | Working tree. |
| `apps/web/src/components/plan/PlanTravellersTab.tsx` | **Deleted** (git status `D`). Plan audit flagged that no plan doc notes the removal. | Working tree. |
| `docs/framer/MODULE_PAGES_RUNBOOK.md` / `MODULE_PAGES_STATUS.md` / `module-pages-spec.json` | **Deleted** (git status `D`). Framer site integration retired. | Working tree. |
| `scripts/validate-module-pages-spec.mjs` | **Deleted** (git status `D`). Validation tooling retired alongside the framer spec. | Working tree. |
| `/plan/product-studio/legacy*` routes | **Advertised but non-existent.** Plan README lists them; `routes.tsx` redirects `/v2` and `/blockly-spike` to `/plan/product-studio` with no `/legacy` segment. | Plan dev audit, accuracy findings. |
| Product Studio v2 vs legacy vs blockly-v2 | **Coexisting**, unclear precedence. Plan audit flagged the legacy path renders but has no deprecation header. | Plan dev audit completeness findings. |
| `BookInvoices.tsx` vs `InvoiceList.tsx` (book) | Orphan component; route binds to `BookInvoices`. Old doc listed only one; the other is dead. | Book dev audit #2–3. |
| `Book.tsx` (book) | Orphan. Not referenced by `routes.tsx`. | Book dev audit #2. |
| `/make/time-clock` → `/floor` redirect, `/make/scan` → `/floor` redirect | Live runtime redirects undocumented in dev docs. | Make dev audit #1. |
| `/design/initial-data` → `/control/mirrorworks-bridge` redirect | Live runtime redirect referenced in Bridge dev audit only. | Bridge dev audit. |

---

## 5. Proposed knowledge base structure (long term)

```
docs/
├── README.md                          (top-level entry; points to dev/ and user/)
├── architecture/
│   ├── README.md                      (index of ADRs)
│   ├── adr-001-services-layer.md
│   ├── adr-002-supabase-to-convex.md
│   ├── adr-003-react-query-adoption.md
│   ├── adr-004-shop-floor-offline.md
│   └── adr-005-bridge-data-import.md
├── dev/
│   ├── README.md
│   ├── glossary.md                    (see §3)
│   ├── access/
│   │   └── arch-00-v7.md              (canonical permission-key + role + tier table)
│   ├── contracts/
│   │   ├── entities.md                (@/types/entities by module)
│   │   └── packages-contracts.md
│   ├── platform/
│   │   ├── agent-fab.md
│   │   ├── command-palette.md
│   │   ├── notifications.md
│   │   ├── dashboard-alias.md
│   │   └── welcome-dashboard.md
│   ├── services/
│   │   ├── README.md                  (one row per service)
│   │   ├── bookService.md
│   │   ├── bridgeService.md
│   │   ├── buyService.md
│   │   ├── makeService.md
│   │   ├── planService.md
│   │   ├── sellService.md
│   │   └── shipService.md
│   ├── migration/
│   │   ├── supabase-to-convex.md
│   │   └── toast-backlog.md           (all "coming soon" strings)
│   └── modules/
│       ├── book/ …
│       ├── bridge/ …
│       ├── buy/ …
│       ├── control/ …
│       ├── make/ …
│       ├── plan/ …
│       ├── sell/ …
│       ├── ship/ …
│       └── shop-floor/ …
└── audits/
    ├── MIGRATION-LOG.md               (this pass)
    ├── AUDIT-SUMMARY-DEV.md           (this doc)
    ├── AUDIT-SUMMARY-USER.md
    ├── dev/                           (per-module dev audits)
    ├── user/                          (per-module user audits)
    └── screenshots/                   (per-module routes)
```

---

## 6. Service-layer contract readiness

The batch criteria asks whether per-module service documentation is sufficient for backend implementation without additional clarification. The answer across 7 available audits is **no**, and the underlying reason is a repo-wide gap.

### Repo-wide P0: no services-layer abstraction

**`apps/web/src/lib/services/` does not exist.** The audit rubric expects it. Every module's service facade lives at `apps/web/src/services/{module}Service.ts` — alongside the mock data at `apps/web/src/services/mock/data.ts`. There is no boundary between:

- pure domain service signatures (what backend should implement),
- mock implementations,
- real remote adapters (none yet),
- thin wrappers over HTTP / Convex / Supabase.

Six of seven available modules flag this explicitly (Book P1, Buy P0, Make P1, Plan P1, Ship P1, Shop Floor P1). Make's header comment in `makeService.ts` says `"Replace the mock implementation with a remote adapter when Convex is ready"` — the exact same comment lands on `sellService.ts`, `bookService.ts`, `buyService.ts`, and likely every other facade. A canonical services layer with interface + mock impl + remote impl split is a prerequisite for any Convex migration.

### Per-module readiness assessment

| Module | Service facade | Methods | Signatures documented in dev docs? | Ready for backend? |
|--------|----------------|---------|------------------------------------|--------------------|
| Book | `bookService.ts` | 11 named (`getInvoices`, `getExpenses`, `getBills`, `getJobCosts`, `getJobCostById`, `getJobCostByJobId`, `getKpis`, `getApprovalQueue`, `getOverdueItems`, `getWipValuations`, `getCostVariance`) | **Yes** — Book stubs name all 11 in the new dev README | Partial — no mutation contracts named |
| Bridge | `bridgeService.ts` | Upload / analyse / AI match / map / preview / import / summary pipeline + future `POST /bridge/sessions/:id/ingest` | **No** — 1 doc scaffold does not list signatures | No |
| Buy | `buyService.ts` | 16 named methods (`getPurchaseOrders`, `getPurchaseOrderById`, …, `getVendorComparison`, `getPurchasePlanningGrid`) | **No** — stubs only | No |
| Make | `makeService.ts` | Multiple (not enumerated in audit summary, but dev docs reference `makeService.getX()`) | **No** — migrated scaffolds contain no signatures | No |
| Plan | `planService.ts` | Not enumerated in audit | **No** — mixed docs inherit old template | No |
| Sell | `sellService.ts` (181 LOC) | 12+ (per earlier commit — `getCustomers`, etc.) | **No (earlier commit)** — every screen doc says "no store/service/hook" which is false | No |
| Ship | `shipService.ts` | Several (`getBillOfLading`, `getCarrierRates`, …) | **No** — stubs empty | No |
| Shop Floor | No dedicated service; consumes `makeService` | — | **Partial** — docs name the methods used | Partial |

### Underspecified modules

The following modules are the least ready for a backend adapter and should be prioritised for dev-doc rewrites before any Convex cutover is attempted:

1. **Bridge** — one scaffolded doc for a ~2,887 LOC module with 8 wizard steps, future ingest endpoint, persist-keyed Zustand store. Highest complexity, thinnest docs.
2. **Buy** — 16 service methods, zero described in committed content.
3. **Ship** — 11 dev stubs all empty; `ShipBillOfLading.tsx` entirely undocumented.
4. **Plan** — 20 mixed docs inherit old template; service-facade signatures and Product Studio v2 tree absent.
5. **Make** — dev docs contain factually wrong "no store/service/hook" claims.

Book is the only module genuinely near-ready; the stubs name the service surface and gaps are enumerated.

---

## Priority rollup

### P0 (repo-wide or cross-module)

- **P0.1 — Canonical spec missing.** No `.docx` or accessible PDF for any module. `MirrorWorksModuleSpec.pdf` exists but is linked from `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` with a broken relative path. Six modules flag this independently. *Raised by:* Book, Bridge, Buy, Make, Plan, Ship, Shop Floor dev audits.
- **P0.2 — No `apps/web/src/lib/services/` layer.** Repo-wide. Every service facade lives under `apps/web/src/services/` with mock shapes co-located. Adopt or amend the rubric. *Raised by:* Book P1, Buy P0, Make P1, Ship P1; formally called out here as cross-module P0 because no module can ship a Convex adapter until this is resolved.
- **P0.3 — Dev-doc split is an unkept promise across 4 modules.** Buy, Plan, Ship, Shop Floor all left Mixed content in user/ with empty stubs under dev/. *Raised by:* Buy dev P0, Ship dev P0 #2, Plan dev P1, Shop Floor dev P0.2.
- **P0.4 — Missing per-screen permission mapping.** No module's per-screen docs say which permission key gates which CTA. ARCH 00 §4.N references float unmapped. *Raised by:* Make dev P0, Book P1, Buy P1, Ship P1.
- **P0.5 — Detail routes do not read `:id`.** Book P0 — `/book/invoices/:id` and `/book/job-costs/:id` render hard-coded ids regardless of URL. Likely pattern elsewhere (Sell per earlier commit noted similar copy-paste behaviour); needs a cross-module sweep.
- **P0.6 — Stale dev docs in Make.** Make dev P0 — four findings (#4, #5, #6, #9) have docs that directly contradict source.
- **P0.7 — Shop-floor `/make/shop-floor` render loop.** Shop-floor dev P0.3 — documented with screenshot evidence; blocks kiosk launch.
- **P0.8 — Shop-floor spec + barcode integration doc missing.** Shop-floor dev P0.1 and P0.4.
- **P0.9 — No `apps/web/src/components/sell/` dedicated docs for 13 components.** Raised by sell audit (earlier commit) — carried forward pending canonical sell branch.

### P1

- Unify the dev-doc template. Buy's proposal is the most complete; adopt repo-wide.
- Add `## Tier gate` and `## Permission gate` to every screen doc.
- Replace every "no store/service/hook" blanket false-positive in every migrated doc.
- Document all Zustand stores by owning module (`travellerStore` deleted, `floorExecutionStore`, `shopFloorEntryStore`, `productBuilderStore`, `materialLibraryStore`, `finishLibraryStore`, `agentStore`, `bridgeStore`, `commandPaletteStore`, `notificationStore`).
- Document the Supabase → Convex migration plan once, not per module.
- Fix the broken `MirrorWorksModuleSpec.pdf` relative link in `AccessRightsAndPermissions.md`.
- Unify the three `shop-floor` component trees.
- Add React Query keys per module before Convex cutover.
- Handle `super_admin` role (memory `project_arch00_frontend_gaps`).
- Add testing targets per module — currently zero tests under any `apps/web/src/components/{module}/`.

### P2

- UK English sweep (`memoised`, `behaviour`, `fulfilment`, `traveller`).
- Code fences with route and service signatures in every dev doc.
- Cross-link deprecated redirects (`/make/time-clock`, `/make/scan`, `/design/initial-data`, Plan legacy product studio).
- Consolidate the 40+ "coming soon" toast strings into `docs/dev/migration/toast-backlog.md`.
- Extract a shared `InvoiceTable` primitive (Book vs Sell invoice overlap).
- Audit `docs/modules/platform/` residue (Bridge and Shop Floor already claimed pieces).
