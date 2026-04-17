# Bridge — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding.
  - Code: `apps/web/src/components/bridge/`
  - Routes: `apps/web/src/routes.tsx` — `/bridge`, `/control/mirrorworks-bridge`, redirect `/design/initial-data`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Guideline: `apps/web/src/guidelines/modules/bridge/MirrorWorksBridge.md`
  - Screenshots: `docs/audits/screenshots/bridge/bridge.png`, `control-mirrorworks-bridge.png`, `design-initial-data.png`
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-bridge.md`. Only `bridge-wizard.md`, which is developer-facing; no user-facing Bridge doc exists in the repo.

## Completeness findings

- **No user-facing Bridge documentation exists.** The single existing file is a component/route reference (moved to `docs/dev/modules/bridge/`), not a task guide. End-users have nothing to read.
- No imperative task guides. At minimum, users need: "Connect your data sources", "Upload a spreadsheet", "Map columns to MirrorWorks fields", "Review rows before import", "Import and fix errors", "Assign team members to modules". None of these exist.
- No "what is Bridge?" landing page for operators; the product name (MirrorWorks Bridge) and the route family are not signposted in user docs.
- No guidance on the multi-source flow shown in the Source step UI — users can pick spreadsheets **and** pen & paper, and the wizard rewires itself. That behaviour is not documented anywhere a user would read.
- No file-prep checklist. The mock service detects entities from filenames containing `customer`, `client`, `product`, `part`, `machine`, `equipment`, `employee`, `staff`, `team`, `supplier`, `vendor`, `job`, `order`, `work`, `invoice`, `bill`. Users who name files differently will see `unknown` entity detection with no explanation.
- No accepted-file-format list (code: `xlsx`, `xls`, `csv`).
- No guidance on the optional **Connectivity** sub-form under Manual Entry → Machines & work centres.
- No troubleshooting section for the `failed` or `cancelled` session states.
- No tier badge. Users on lower-tier plans have no way to know if Bridge is available to them.
- No role-based task variants (admin vs lead vs team). If only admins can run a Bridge session, the doc should say so.

## Accuracy findings

- N/A at the doc level — there is no user doc to check against the running UI. (The Source step rendered in the screenshot uses copy "Where is your data coming from?" and "Select everything that applies" which should appear verbatim in any future task guide.)

## Consistency findings

- The product is named **MirrorWorks Bridge** in the guideline, **Bridge Wizard** in the migrated dev doc, **Bridge** in routes, and simply "Source" / "Upload" / etc. in the stepper. A user guide needs a single canonical product name and a defined relationship to the wizard-step language.
- Mount points differ: `/bridge`, `/control/mirrorworks-bridge`, `/design/initial-data` (legacy redirect). Users won't know which URL to bookmark. A user doc should pin one recommended entry point.

## Style findings

- Not applicable — no user doc exists. Once drafted, it must follow:
  - UK English, Oxford comma, 2nd person, present tense, imperative headings.
  - Imperative headings like "Connect a data source", "Upload your spreadsheet", "Map columns", "Review before import", "Assign the team to modules".
  - No marketing verbs from the block-list (leverage, seamless, robust, cutting-edge, empower, game-changer, optimise your workflow, unlock, unleash, streamline, "This isn't X, it's Y").
  - No emojis.
  - No mention of Supabase, Convex, WorkOS, Resend, React, Zustand, Con-form Group; 3D is not a differentiator.

## Visual findings

- Screenshots captured:
  - `docs/audits/screenshots/bridge/bridge.png` (Source step, 1440×900, 129 KB)
  - `docs/audits/screenshots/bridge/control-mirrorworks-bridge.png` (same Source step via alternate mount, 130 KB)
  - `docs/audits/screenshots/bridge/design-initial-data.png` (same Source step via legacy redirect, 130 KB)
- All three mount points render the same Source step — user doc needs only one canonical screenshot per step but must note the redirect.
- Later wizard steps (Scope, Upload, Mapping, Manual Entry, Review, Results, Team Setup) are URL-gated by wizard state and cannot be captured without walking the flow. A user doc will need step-specific captures produced via a scripted fixture once one exists.
- MW yellow `#FFCF4B` appears on the active stepper pill and on the Continue CTA — compliant with brand. A yellow-background reminder from memory: when the doc illustrates MW-yellow buttons, use dark text on yellow (never white).

## Gaps and recommendations

### P0 (blocking)

- **No spec doc of record.** The `MirrorWorksBridge.md` guideline cites a PLAT 01 PDF that is not committed to the repo. No user doc can be written authoritatively without it.
- **No user-facing Bridge documentation at all.** For a module that is the first thing every customer touches during onboarding, this is a blocker for launch.

### P1 (should fix before launch)

- Write "Run the Bridge wizard" as the top-level user task. Cover:
  - "Connect a data source" — checkbox multi-select, including pen & paper plus spreadsheets in the same journey.
  - "Answer the shop-scope questions" — triggered when pen & paper is selected.
  - "Upload your file" — accepted formats `.xlsx`, `.xls`, `.csv`; file-name hints for entity detection.
  - "Map columns to MirrorWorks fields" — what required/optional/custom means; what AI confidence signals.
  - "Enter machines, customers, and products by hand" — when you pick pen & paper only.
  - "Review rows before import" — exclude rows, address warnings.
  - "Watch the import run" — progress by entity, what to do on error.
  - "Assign team members to module groups" — only appears when employees were imported.
  - "Come back later" — the Zustand persist snapshot preserves source selections and step; file uploads and mappings do not survive a refresh.
- Add a tier badge. Confirm Pilot vs Expand gating.
- Add role expectations (admin, lead, team only; no "Manager" / "Operator" wording).
- Pin one canonical URL and document the legacy redirect as a footnote.
- Call out the **Connectivity (optional)** sub-form inside Manual Entry → Machines, and note that protocol/network fields can be deferred and filled in later from Control → Machines.

### P2 (nice to have)

- Glossary: `customers`, `products`, `employees`, `machines`, `suppliers`, `jobs`, `invoices` — what MirrorWorks expects in each entity.
- "Prepare your spreadsheet" checklist tied to the filename-detection rules in `bridgeService.ts`.
- Animated GIF of the stepper progressing (completed / current / future states) with MW-yellow active pill.
- Cross-link from the Sell / Plan / Make user guides back to Bridge as the master-data entry point.
