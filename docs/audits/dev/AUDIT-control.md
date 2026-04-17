# Control — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — there is no `.docx` Control spec. A PDF (`apps/web/src/guidelines/MirrorWorksModuleSpec.pdf`) covers ARCH 00 but was not readable by this worker. See P0 finding.
  - Code: `apps/web/src/components/control/` (22 files)
  - Routes: `apps/web/src/routes.tsx` lines 391–440 — `/control/*` (20 routes) and `/design/*` redirect alias
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`, `packages/contracts/src/access.ts`
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-control.md`

## Completeness findings

- **Route coverage: 18 of 21 effective Control routes have a doc.** Routes in `apps/web/src/routes.tsx:393–422` enumerate 21 routes (20 `/control/*` + index). Only 18 of them have matching files in `docs/user/modules/control/`. The following routes are registered but **undocumented**:
  - `/control/groups` → `ControlGroups.tsx` (visible in sidebar line 379 as "Groups").
  - `/control/billing` → `ControlBilling.tsx` (sidebar line 388 as "Billing & subscription").
  - `/control/audit` → `ControlAudit.tsx` (sidebar line 382 as "Access audit").
- **Components with no doc:** the following exist under `apps/web/src/components/control/` and are not referenced by any doc in `docs/user/modules/control/`:
  - `ControlAudit.tsx`, `ControlBilling.tsx`, `ControlGroups.tsx`, `MirrorWorksBridge.tsx` (legacy wrapper), `WorkflowCanvas.tsx` (used by `ControlWorkflowDesigner.tsx`).
  - Under `apps/web/src/components/control/people/`: `AccessResolutionPopover.tsx`, `EffectivePermissionsPanel.tsx`, `GroupDetailSheet.tsx`, `GroupsTab.tsx`, `InviteUserDialog.tsx`, `ModuleAccessCard.tsx`, `PermissionGrid.tsx`, `UserDetailSheet.tsx`, `UsersTab.tsx`, plus helpers `group-helpers.ts`, `mock-data.ts`, `people-data.ts`, `types.ts`. None of them appear in any doc's "Components Used" list with a meaningful description.
- **Service layer silence.** `apps/web/src/services/controlService.ts` (84 lines) is an async facade over `./mock` with the comment _"Replace the mock implementation with a remote adapter when Convex is ready"_. It exposes `controlService.*` methods for machines, products, employees, suppliers, systemHealth, maintenance, tooling, documents, shifts. **Zero** Control docs reference `controlService` or any of its method names.
- **Service imports in components are rare.** `grep -rEn "from '@/services'" apps/web/src/components/control/` returns one match: `ControlDashboard.tsx:14` imports `systemHealth`. Every other Control component reads data from a local `const` (mock seed embedded inline) or from `apps/web/src/services/mock/data.ts`. The dev docs do not call out that Control is primarily inline-mock-backed even though a service layer exists.
- **Inline mock seed is the dominant data pattern.** `ControlMachines.tsx:80` declares `const MACHINES: Machine[]` (starts line 83) — a large inline array. Similar inline seed arrays appear in `ControlProducts.tsx`, `ControlLocations.tsx`, `ControlInventory.tsx`, `ControlPurchase.tsx`, `ControlMaintenance.tsx`, `ControlTooling.tsx`, `ControlDocuments.tsx`, `ControlShiftManager.tsx`, `ControlProcessBuilder.tsx`, `ControlFactoryDesigner.tsx`, `ControlGamification.tsx`, `WorkflowCanvas.tsx`. This inline seed will block Convex migration and is mentioned in only vague language ("Current page includes mock/seed data sources (inferred from code)") in the docs — no doc names the seed constant or its shape.
- **Zustand stores.** `grep` for `@/store` in `apps/web/src/components/control/` finds 0 matches. No Control screen binds to a Zustand store. Stores under `apps/web/src/store/` (`bridgeStore`, `materialLibraryStore`, `productBuilderStore`, `floorExecutionStore`, etc.) are consumed by other modules. No Control doc says "this module is store-free".
- **React Query keys.** `grep` for `useQuery`, `useMutation`, `useInfiniteQuery`, `@tanstack/react-query` in `apps/web/src/components/control/` returns 0 matches. Control has no query-keyed data fetches; every "refresh" is a local state update. Dev docs do not flag this.
- **Event flows.** Every mutation in Control resolves to `toast(...)` — 25 toast sites across 12 files (`ControlGamification.tsx` 8, `ControlMachines.tsx` 5, `ControlProcessBuilder.tsx` 2, `ControlBOMs.tsx` 2, etc.). No doc describes the pending wiring to real mutations or links this to a migration TODO.
- **Permission touchpoints (ARCH 00 §4.9).** Canonical Control permissions per `packages/contracts/src/access.ts:37–43`: `products.manage`, `boms.manage`, `locations.manage`, `machines.manage`, `people.view`, `people.manage`, `workflow.manage`, plus the global `documents.scope`, `settings.access`, `reports.access`. None of the per-screen Control docs map themselves to a permission key. For example, `locations.md` does not state that `locations.manage` governs its CTAs.
- **Tier gates (feature gates).** `apps/web/src/lib/subscription.ts` defines tiers `Pilot | Produce | Expand | Excel`, and `packages/contracts/src/feature-gates.ts` defines `TierFeatureGrant`. `grep -Ern "requiresFeature|requiresTier|tierGate|FeatureGate"` across `apps/web/src/components/control/` returns 0 hits. Control ships no tier gating in the prototype. The dev docs do not flag which features (factory-layout, process-builder, workflow-designer, gamification, maintenance, tooling, MirrorWorks Bridge) are candidates for higher-tier gates — this is the densest gating module in the app and the docs are silent.
- **Types.** `packages/contracts/src/access.ts` exports `PermissionKey`, `ScopePermissionKey`, `PermissionSet`, `EffectivePermissionGrant`, `ModuleGroupSummary`, `PermissionDefinition`, `PermissionCatalog`, `TierFeatureDefinition`. `apps/web/src/components/control/people/types.ts` defines parallel types (`AuditLogCategory`, etc.). No dev doc names either file.
- **Migration TODOs.** `controlService.ts:3` names Convex as the target backend. No migrated Control doc surfaces this. There is no `## Migration status` section in the doc template.
- **Testing notes.** None of the 20 Control docs has a `## Testing` or `## QA` section. No link to Vitest, Playwright, or fixtures.
- **Legacy bridge alias.** `MirrorWorksBridge.tsx` sits at `apps/web/src/components/control/MirrorWorksBridge.tsx` as a thin re-export/helper. `mirrorworks-bridge.md` links to `apps/web/src/components/bridge/BridgeWizard.tsx` via the README ("Important Components"). Dev docs do not reconcile the two — is `MirrorWorksBridge.tsx` live, deprecated, or a legacy shim?
- **Shift naming.** Canonical role vocabulary is `admin`, `lead`, `team` only (`packages/contracts/src/access.ts`, `AccessRightsAndPermissions.md`). The **screen** `ControlShiftManager.tsx` / doc `shifts.md` is titled "Shift Manager" — this is a UI/page title and does NOT describe a role; it is acceptable and not flagged.

## Accuracy findings

- **`role-designer.md` documents a removed feature.** The doc at `docs/user/modules/control/role-designer.md` references `apps/web/src/components/control/ControlRoleDesigner.tsx`. `find apps/web/src -name 'ControlRoleDesigner*'` returns no results; the route `/control/role-designer` is absent from `apps/web/src/routes.tsx`; the sidebar has no entry. The doc itself admits "Deprecated and removed from active navigation and routing" (line 11) but keeps a full "Components Used" list (lines 27–31) pointing at files that no longer exist. The MIGRATION-LOG classifies this as **Deprecated**.
- **`/design/*` → `/control/*` redirect is not captured in the docs.** `apps/web/src/routes.tsx:432–440` defines a `design` route tree whose children all issue `<Navigate to="/control/..." replace />`. The Control README's route list (lines 15–33) does not mention that `/design`, `/design/factory-layout`, `/design/process-builder`, `/design/initial-data` resolve here. A developer reading only the docs will not learn of the bookmark alias.
- **Sidebar label drift.** `Sidebar.tsx:359` labels the route `/control/factory-layout` as "Factory Designer". `docs/user/modules/control/factory-layout.md:1` titles itself "Factory Layout". The URL slug says `factory-layout`. Three names for one screen; pick one.
- **Invalid role vocabulary in source.** The rubric requires the three-role model `admin | lead | team`. Control **source code** uses Manager / Supervisor / Operator language 28 times (`grep -Ern "Manager\b|Supervisor\b|Operator\b"` minus the `ShiftManager` screen, minus unrelated CLI/package hits). Notable sites:
  - `ControlMachines.tsx:68,452,474` — `assignedOperator` field, `Assigned Operator` / `Assign Operator` labels.
  - `ControlFactoryDesigner.tsx:143–144` — palette items `Operator Station`, `Supervisor Station`.
  - `ControlFactoryDesigner.tsx:1454` — `Assigned Operator` detail label.
  - `ControlProcessBuilder.tsx:90–91, 187` — palette/graph nodes `Operator`, `Supervisor`.
  - `ControlWorkflowDesigner.tsx:111,199` — `Operator` label and "customer tier" prompt.
  - `WorkflowCanvas.tsx:172, 250` — `Manager approved?`, `QC Manager, Plant Manager` copy.
  These are UI strings, not role assignments in the permission model — but they contradict the vocabulary rule. Dev docs do not acknowledge the conflict. Recommend relabelling to neutral terms ("Assigned to", "Station owner") or documenting why these are distinct from access roles.
- **People doc contradicts reality.** `docs/user/modules/control/people.md:45–46` says "No explicit store/service/hook dependency imported in this component." `ControlPeople.tsx` is a 7-hit `@/services` / state importer (grep showed 7 occurrences). It also pulls multiple People-subfolder components and mock data. The "No explicit mock marker" statement (line 49) is also false — `apps/web/src/components/control/people/mock-data.ts` is the canonical mock for this screen.
- **Mock marker claim is boilerplate.** Nineteen of the 20 docs include `"No explicit mock marker in this file"` or `"Mock/seed records are present; edge-case realism may be limited."` as copy-pasted lines. Several are factually wrong. Examples: `machines.md`, `products.md`, `locations.md`, `inventory.md`, `purchase.md`, `maintenance.md`, `tooling.md`, `documents.md`, `shifts.md`, `gamification.md`, `process-builder.md`, `factory-layout.md`, `workflow-designer.md` all pull inline mock arrays directly from their component file.
- **README component list is stale.** `docs/user/modules/control/README.md:38–49` names 10 "Important Components". Missing from that list but present in the module: `ControlShiftManager`, `ControlMaintenance`, `ControlTooling`, `ControlDocuments`, `ControlGamification`, `ControlWorkflowDesigner`, `ControlGroups`, `ControlAudit`, `ControlBilling`, `ControlEmptyStates`, `MirrorWorksBridge`, `WorkflowCanvas`, and every file under `control/people/`.
- **README "Open Issues" is out of sync.** `README.md:56–69` enumerates Open Issues only for `/control/factory-layout`, `/control/process-builder`, `/control/locations`, `/control/machines`, `/control/inventory`. Toast-driven mutation feedback exists in 12 files (section above) — the doc calls it out for 3 of them.
- **ARCH 00 drift risk in `AccessRightsAndPermissions.md`.** The access doc (line 3) points to `./MirrorWorksModuleSpec.pdf` but the PDF lives at `apps/web/src/guidelines/MirrorWorksModuleSpec.pdf`, i.e. one directory above — the relative link is broken. Recent commits (`c5e6d45c`, `bc6495fc`) touched both `packages/contracts/src/access.ts` and `AccessRightsAndPermissions.md`; the permission matrix section of the access doc does list Control keys (`products.manage, boms.manage, locations.manage, machines.manage, people.view, people.manage, workflow.manage, settings.access, reports.access`) and those match `access.ts:37–43`. No drift in keys; drift is in the spec link.
- **Currency / locale.** Control screens do not currency-format prices heavily, but `ControlPurchase.tsx` and `ControlInventory.tsx` display monetary amounts. No doc declares a locale/currency policy. Not a bug; flag for the module-level note.
- **Factory Designer is explicitly 2D.** `ControlFactoryDesigner.tsx:1–6` header: _"Factory Designer — interactive 2D factory layout canvas (ARCH 00 / Control). SVG-based canvas..."_ and `grep -E "3D|three\.js|@react-three|isometric"` returns 0. Docs do not overstate 3D — they stay silent on the rendering approach. Clean on this rubric item, but the silence is itself a gap (dev readers need to know it is SVG-based with no 3D roadmap).

## Consistency findings

- **Template uniformity.** 19 of 20 docs use the same 13-heading template (Summary, Route, User Intent, Primary Actions, Key UI Sections, Data Shown, States, Components Used, Logic / Behaviour, Dependencies, Design / UX Notes, Known Gaps / Questions, Related Files). `README.md` uses a different landing-page template (Purpose, Primary Users, Key Workflows, etc.) — acceptable.
- **States vocabulary is inconsistent.** `factory-layout.md` lists `default, loading, error, success, blocked, populated`. `boms.md`, `machines.md`, `shifts.md`, `tooling.md`, `documents.md`, `gamification.md` list only `default, blocked, populated`. `people.md` same. No module-level enum.
- **"Components Used" mixed notation.** Same issue as the Sell audit — some entries use `@/components/...`, some use `apps/web/src/components/...`, often in the same list (e.g. `people.md:30–38`).
- **"Design / UX Notes" boilerplate.** Phrases appearing in ≥10 files: `"Mock/seed records are present; edge-case realism may be limited."`, `"Placeholder/legacy text suggests unfinished UX in parts of this page."`, `"Action persistence paths are not fully visible in this component alone."`, `"No explicit mock marker in this file; verify real-data behavior in integration testing."`.
- **Filename vs component name convention.** Kebab-case doc (`factory-layout.md`) vs PascalCase component (`ControlFactoryDesigner.tsx`) — convention holds but is undocumented; `workflow-designer.md` maps to `ControlWorkflowDesigner.tsx`, `mirrorworks-bridge.md` maps to both `MirrorWorksBridge.tsx` and `bridge/BridgeWizard.tsx`.
- **Screen title drift.** README's route list uses "Factory Layout" (line 17); sidebar uses "Factory Designer"; URL slug is `factory-layout`; component is `ControlFactoryDesigner`. Same split across "Workflow Designer" vs `workflow-designer.md`, "Process Builder" vs `process-builder.md` (consistent on those two).

## Style findings

- **UK English.** `dashboard.md:47`, `people.md:43`, `machines.md`, `products.md`, etc. use `memoized` / `behavior` — should be `memoised` / `behaviour`. Mixed within the same doc in several cases (`behaviour` in heading "Logic / Behaviour" then `behavior` in body).
- **Oxford comma.** Content is too short and list-oriented to exercise it meaningfully.
- **Marketing verbs.** No hits on `leverage`, `seamless`, `robust`, `cutting-edge`, `empower`, `game-changer`, `streamline`, `unleash`, `unlock`, "This isn't X, it's Y" across the 20 Control docs. Clean.
- **Banned brand/tech names.** No hits on `Supabase`, `Convex`, `WorkOS`, `Resend`, `Zustand`, `Con-form Group`. Clean — but see P1: the migration-target backend (Convex) is named in `controlService.ts`; the docs redact it entirely, which is also a problem (readers need to know what's coming).
- **Emojis.** None in Control docs. Clean.
- **Code fences.** Zero fenced code blocks across the 20 docs. Dev readers will expect at least permission keys, route signatures, and service method shapes in fenced blocks.
- **Voice.** 2nd-person imperative (`Create a machine`, `Define a workflow`) is absent — docs lead with noun phrases (`Page-specific records and controls shown in current UI implementation.`). The user-facing side of the Mixed docs does not meet the imperative rule.

## Visual findings

Screenshots captured at 1440×900 live under `docs/audits/screenshots/control/`:

- `control.png`, `control-locations.png`, `control-machines.png`, `control-inventory.png`, `control-purchase.png`, `control-people.png`, `control-products.png`, `control-boms.png`, `control-workflow-designer.png`, `control-factory-layout.png`, `control-process-builder.png`, `control-gamification.png`, `control-shifts.png`, `control-maintenance.png`, `control-tooling.png`, `control-documents.png`, `control-mirrorworks-bridge.png`, `control-empty-states.png`.
- `design-redirect.png` — confirms `/design` issues a client-side redirect to `/control/factory-layout` (the screenshot shows the Factory Designer canvas, not a `/design/*` page).

Coverage:

- Covered: all 18 routes listed in scope.
- Missing: `/control/groups` (documented nowhere and not in scope), `/control/billing` (same), `/control/audit` (same), `/control/role-designer` (no longer exists in source).
- No doc in `docs/user/modules/control/` embeds any image. Screenshots are reference-only.
- Spot-check: `control-factory-layout.png` vs `factory-layout.md` — doc lists `@/components/ui/resizable` (line 37), screenshot shows a resizable split (canvas + properties panel). Consistent. No 3D surface visible in the screenshot — consistent with source.

## Gaps and recommendations

### P0 (blocking)

- **No `.docx` spec doc of record** — Control has the densest permission and workflow model in the app, and no readable canonical spec exists in this worktree. The ARCH 00 PDF is referenced from `AccessRightsAndPermissions.md` with a broken relative link (`./MirrorWorksModuleSpec.pdf` resolves to nothing in that directory; the actual file is one level up at `apps/web/src/guidelines/MirrorWorksModuleSpec.pdf`). Fix the link and land a Control-specific spec doc before further doc work.
- **`role-designer.md` documents a REMOVED feature.** `ControlRoleDesigner.tsx` is deleted; the `/control/role-designer` route is unregistered; the sidebar has no entry. The doc still lists "Components Used" pointing at the deleted file. Classification in MIGRATION-LOG-control.md is "Deprecated". Decision required: either delete the doc in a follow-up PR or leave it as a tombstone with a prominent "REMOVED" banner at the top.
- **Three registered routes are undocumented:** `/control/groups`, `/control/billing`, `/control/audit`. All three are in the sidebar and all three correspond to live components (`ControlGroups.tsx`, `ControlBilling.tsx`, `ControlAudit.tsx`). New docs must be authored before the next audit pass.
- **Dev-doc split is not real.** `docs/dev/modules/control/` now contains 20 stub files (created in this PR). They all point back at the Mixed user docs. Until a human editor does the actual split, the dev audience has only stubs.
- **Inline mock seed is load-bearing.** Every Control screen except `ControlDashboard.tsx` reads from a component-local `const MACHINES/LOCATIONS/PRODUCTS/…: T[] = […]` array. This makes the Convex migration (named in `controlService.ts:3`) a large extraction job that is currently invisible in the docs.

### P1 (should fix before launch)

- Add a `## Service layer` section to the screen-doc template; back-fill it for all Control screens, naming `controlService` methods and the inline-seed constants they'll replace.
- Add a `## Permission gate` section mapping each screen to its ARCH 00 §4.9 key (`products.manage`, `boms.manage`, `locations.manage`, `machines.manage`, `people.view`, `people.manage`, `workflow.manage`, `documents.scope`, `settings.access`, `reports.access`). Cross-check against `packages/contracts/src/access.ts:37–43`.
- Add a `## Tier gate` section naming the feature-gate for each Control screen (factory-layout, process-builder, workflow-designer, gamification, maintenance, tooling, MirrorWorks Bridge are prime candidates for Expand/Excel gating per the tier model in `apps/web/src/lib/subscription.ts`). Control ships NO tier gates today; doc this explicitly.
- Fix the "No explicit store/service/hook dependency imported" boilerplate on every Control doc where it is false (`people.md`, `dashboard.md`, `machines.md`, `products.md`, etc.).
- Rename or document the role-vocabulary hits (`Operator`, `Supervisor`, `Manager`) across `ControlMachines.tsx`, `ControlFactoryDesigner.tsx`, `ControlProcessBuilder.tsx`, `ControlWorkflowDesigner.tsx`, `WorkflowCanvas.tsx`. These are UI copy, not permission roles, but the vocabulary rule is tripped 28 times.
- Document the `/design` → `/control` redirect alias in the Control README and in the three affected screen docs (`factory-layout.md`, `process-builder.md`, `mirrorworks-bridge.md`).
- Reconcile the sidebar label "Factory Designer" vs doc title "Factory Layout" vs URL slug `factory-layout` vs component name `ControlFactoryDesigner`. Pick one canonical name and update the other surfaces.
- Document the `control/people/` subfolder (10 components + 4 helpers). It is the ARCH 00 access-control UX surface and is currently opaque to dev readers. `people.md` lists only three of them.
- Update `README.md` "Important Components" list (currently 10 entries) to cover all 22 components in the folder.
- Refresh `README.md` "Open Issues" list — toast-driven mutation feedback spans 12 files; doc mentions 3.
- Document `ControlShiftManager` shift rotation model, `ControlGamification` leaderboard model, `ControlProcessBuilder` node graph model, `ControlWorkflowDesigner` node/edge model, `ControlFactoryDesigner` palette/undo-redo model — all have non-trivial state machines not described in their docs.
- Capture the three missing route screenshots (`/control/groups`, `/control/billing`, `/control/audit`) for the next audit pass.

### P2 (nice to have)

- Normalise UK English (`memoised`, `behaviour`, `colour`) across all 20 docs.
- Replace "Components Used" heterogeneous notation with a single alias style (`@/`-alias preferred).
- Add a module-level `## States` enum and reference it from every screen doc.
- Add fenced code blocks for: route registration snippet from `routes.tsx`, service method signatures from `controlService.ts`, permission-key arrays from `packages/contracts/src/access.ts`, and key inline seed constants.
- Document that Control is a store-free, query-free, service-thin module in its current prototype form; call out the migration path to `controlService` + Convex.
- Surface `MirrorWorksBridge.tsx` vs `bridge/BridgeWizard.tsx` — either consolidate or explain the split.
- Remove or banner-mark `role-designer.md` once no internal links still point at it.
