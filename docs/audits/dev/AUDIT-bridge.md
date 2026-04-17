# Bridge — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding. Guidelines file refers to `MirrorWorksModuleSpec.pdf` / `PLAT 01 — Data Import & Onboarding Wizard Specification` but no PDF or `.docx` is committed.
  - Code: `apps/web/src/components/bridge/` (BridgeWizard, BridgeStepper, BridgeSegmentedActions, FieldMappingRow, FileUploadZone, ImportProgressBar, plus eight `steps/*.tsx` files — totals ~2,887 LOC)
  - Routes: `apps/web/src/routes.tsx` — `/bridge` (line 381) and `/control/mirrorworks-bridge` (line 396). Legacy redirect `/design/initial-data` → `/control/mirrorworks-bridge` (line 438).
  - Hook: `apps/web/src/hooks/useBridge.ts`
  - Store: `apps/web/src/store/bridgeStore.ts` (Zustand, persist key `mirrorworks-bridge-v2`)
  - Types: `apps/web/src/types/bridge.ts`
  - Service: `apps/web/src/services/bridgeService.ts` (mock, `USE_MOCK = true`)
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Guideline: `apps/web/src/guidelines/modules/bridge/MirrorWorksBridge.md`
  - Confluence PLAT: referenced (guideline cites PLAT 01), not fetched.
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-bridge.md` — one file (`bridge-wizard.md`) moved from `docs/modules/platform/` to `docs/dev/modules/bridge/`.

## Completeness findings

- Bridge ships with **one** doc file in `/docs` for ~2,887 LOC and eight wizard steps. That is disproportionately thin; most surface area is undocumented.
- The existing `bridge-wizard.md` only lists the `/bridge` route and none of the wizard steps, the alternate mount at `/control/mirrorworks-bridge`, or the legacy redirect `/design/initial-data`.
- `BridgeSegmentedActions` (290 LOC) is not referenced at all — the primary/skip action bar pattern is invisible to any engineer reading the doc.
- `StepManualEntry` (646 LOC) is listed as a bullet only; its machines/work-centres connectivity sub-form is called out in `guidelines/modules/bridge/MirrorWorksBridge.md` but not in the migrated module doc.
- No step-by-step state-flow reference: the routing logic in `useBridge.getActiveSteps` (source-system-driven branching — `pen_paper` opens `scope`, any non-`pen_paper` opens `upload`, files open `mapping`, employees open `team_setup`) is undocumented.
- No coverage of `services/bridgeService.ts` — including the `USE_MOCK = true` flag, `FAST_MOCK_DELAYS` dev behaviour, or the documented-in-code future `POST /bridge/sessions/:id/ingest` ingestion plan.
- No React Query keys section. (Spot check: the hook uses Zustand directly; if there are no React Query keys, the doc should say so explicitly.)
- No mock-data shape reference. `bridgeService.ts` defines entity headers, sample rows, and entity detection heuristics for customers / products / employees / machines / suppliers / jobs / invoices — none of which are surfaced.
- No event-flow diagram for upload → analyse → AI match → map → preview → import → summary.
- No migration TODOs captured against the Supabase-to-Convex cutover, even though the source file has multi-paragraph comments about the future ingest pipeline.
- Permissions section is absent. ARCH 00 v7 roles (admin, lead, team) and tier gating are not mentioned.
- Testing: `apps/web/src/test/smoke/bridge.smoke.test.ts` exists but is not referenced.
- No tier badge. Bridge is a core onboarding journey — if it is Pilot-tier (everyone) the doc should say so; if it is Expand/Excel-gated, the doc should carry a badge.

## Accuracy findings

- `## Route` says `/bridge` only. Actual routes: `/bridge`, `/control/mirrorworks-bridge`, and redirect `/design/initial-data` → `/control/mirrorworks-bridge`.
- `## Dependencies` lists `@/hooks/useBridge` as a bare path; the concrete export is `useBridge` from `apps/web/src/hooks/useBridge.ts` and it wraps `useBridgeStore` from `apps/web/src/store/bridgeStore.ts`. Both should be cited.
- `## Components Used` lists eight step components, which matches code, but `BridgeSegmentedActions` and `FieldMappingRow` / `FileUploadZone` / `ImportProgressBar` are omitted.
- `## Logic / Behaviour` says "largely client-side React state and memoized derivations" — accurate only for the layout; the ingest pipeline is an async mock service with artificial delays (`mockMs`, `FAST_MOCK_DELAYS`). The doc understates this.
- `## States` lists `default` and `populated`. Real session status enum (`apps/web/src/types/bridge.ts`) is `in_progress | mapping | reviewing | importing | completed | failed | cancelled`. The doc's vocabulary does not map to the code.
- Storage key: the guideline file calls out `mirrorworks-bridge-v2`; the module doc omits it.
- Bridge doc claims "no explicit placeholder text found" — the Source step injects the copy "Add more master data any time from Control → MirrorWorks Bridge" which is effectively a permanent cross-reference, not a placeholder.

## Consistency findings

- Guideline file (`MirrorWorksBridge.md`) uses the label **MirrorWorks Bridge**; migrated doc uses **Bridge Wizard**. Pick one module name and one component name, separately.
- Routes file comment on line 379 labels this "Bridge — full wizard (PLAT 01)" — the migrated doc never cites the PLAT 01 identifier.
- The migrated doc is templated (`## Summary ... Behavior is documented from current component implementation.` `## User Intent ... guided setup/import steps with clear progression and validation.`). The same boilerplate appears in other `docs/modules/platform/*.md` files pre-migration; no Bridge-specific voice.

## Style findings

- Tense mix: "Behavior is documented from current component implementation" (passive, descriptive) vs. "Complete guided setup/import steps" (imperative fragment under `## User Intent`). Pick one — developer docs should be present-indicative.
- US spelling: `Behavior` used. House style is UK English (`Behaviour`). The sibling `guidelines/modules/bridge/MirrorWorksBridge.md` uses `behaviour`.
- Vague verbs: "Complete guided setup/import steps with clear progression and validation" — no marketing verbs from the block-list, but close to filler. Replace with concrete inventory (e.g., "Select one or more data sources; answer shop-scope questions when `pen_paper` is selected; upload files or enter records manually; map columns; review; import.").
- Oxford comma: N/A — no multi-item lists in prose.
- No emojis present — compliant.
- No references to Supabase, Convex, WorkOS, Resend, React, Zustand, or Con-form Group — compliant, though this is partly because the doc is too thin to mention anything at all.

## Visual findings

- `docs/audits/screenshots/bridge/bridge.png` (1440×900, Source step populated, unselected options) — matches the Source step in `StepSourceSelect.tsx`.
- `docs/audits/screenshots/bridge/control-mirrorworks-bridge.png` — identical-looking view; the two mounts resolve to the same `BridgeWizard` component.
- `docs/audits/screenshots/bridge/design-initial-data.png` — same again via the `/design/initial-data` redirect. Three mount points render the same UI, which is not reflected in the migrated doc.
- No screenshots of downstream steps (Scope, Upload, Mapping, Manual Entry, Review, Results, Team Setup) because they are not reachable by URL alone — state is gated by `useBridge.activeSteps`. Doc needs state fixtures or a deep-link helper for each step.
- Source step uses MW yellow `#FFCF4B` on the active stepper pill and on the "Continue" CTA, which matches the brand palette; the migrated doc does not describe the stepper visual states (`completed`, `current`, `future`).

## Gaps and recommendations

### P0 (blocking)

- **No spec doc of record.** `MirrorWorksBridge.md` guideline cites `MirrorWorksModuleSpec.pdf` and `PLAT 01 — Data Import & Onboarding Wizard Specification`, but no PDF or `.docx` is committed to the repo. Per rubric: missing `.docx` → P0. Resolve by either committing the spec or replacing every canonical-source reference with a Confluence URL and a hash/snapshot date.
- **Bridge documentation coverage is minimal — ONE existing doc for an entire module.** Flag as P0 dev gap per rubric. Bridge has eight wizard steps, a mock service with a documented future ingest API, a Zustand store with a persistence key, and three mount routes, and the only doc is a 53-line auto-generated template.

### P1 (should fix before launch)

- Add a state-flow reference that maps `sourceSystems` + `hasUploadedFiles` + `hasEmployees` → `activeSteps`, mirroring the logic in `useBridge.getActiveSteps`.
- Document `services/bridgeService.ts` — the `USE_MOCK` toggle, the `FAST_MOCK_DELAYS` dev scaling, and the future `POST /bridge/sessions/:id/ingest` plan (verbatim quoting the service file's header comment is acceptable).
- Add a permissions section pinning ARCH 00 v7 roles (admin, lead, team only — never "operator" / "supervisor" / "manager") and tier gate. Bridge is the onboarding on-ramp; confirm whether it is Pilot-tier (open) or Expand-gated.
- Add a tier badge to the top of `bridge-wizard.md`.
- Clarify the three mount points (`/bridge`, `/control/mirrorworks-bridge`, `/design/initial-data`) and the legacy redirect — include a table.
- Document `BridgeSegmentedActions` (primary/skip CTA pattern) — 290 LOC currently invisible to readers.
- Sweep US → UK spelling (`Behavior` → `Behaviour`).
- **Vendor-SDK note (rubric item):** the rubric flags "external hardware / vendor SDK references" for Bridge. In this codebase Bridge is a **data-import wizard** (spreadsheets + ERP exports + pen & paper), not a hardware integration; the only external-vendor surface is the source-system list (`jobboss`, `e2shop`, `fulcrum`, `acumatica`, `odoo`, `xero`). When connectors replace mocks, **check each vendor SDK / export-format reference for version drift**. Call this out explicitly in the doc so readers don't conflate Bridge with machine-networking.
- Note that `StepManualEntry` → Machines & work centres has a `Connectivity (optional)` block for network/protocol metadata. That is the closest thing to "machine integration" in Bridge and is currently only mentioned in the guideline file, not the migrated doc.

### P2 (nice to have)

- Replace boilerplate `## User Intent` / `## Primary Actions` / `## Data Shown` sections with a Bridge-specific narrative.
- Cross-link the smoke test at `apps/web/src/test/smoke/bridge.smoke.test.ts`.
- Add a short migration TODO list for Supabase → Convex cutover mirroring the comments in `bridgeService.ts`.
- Add a mock-data shape appendix (the entity-header and sample-row tables from `bridgeService.ts`).
- Note the Zustand persistence contract: only `sessionId`, `sourceSystems`, `currentStep`, and `scopeAnswers` are persisted via `partialize` — file uploads and mappings are in-memory only.
