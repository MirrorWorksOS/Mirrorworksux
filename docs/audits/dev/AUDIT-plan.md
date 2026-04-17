# Plan — Dev documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding
  - Code: `apps/web/src/components/plan/`
  - Routes: `apps/web/src/routes.tsx` — `/plan/*`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see MIGRATION-LOG-plan.md

## Completeness findings

- No `.docx` or PDF spec of record for Plan exists in the repo. Files under `docs/modules/plan/` were the only Plan documentation and consist of auto-generated scaffolds. (`docs/user/modules/plan/*.md`)
- None of the 20 migrated docs include a **last-reviewed**, **status**, or **owner** metadata block. (`docs/user/modules/plan/*.md`)
- No documentation covers the non-routed Plan helper components: `BomGenerator.tsx`, `PlanCapableToPromise.tsx`, `PlanOperationRouting.tsx`, `PlanShiftCalendar.tsx`, `PlanSubcontracting.tsx`, `PlanScheduleEngine.tsx`, `RushOrderPanel.tsx`, `PlanIntelligenceHubTab.tsx`, `PlanBudgetTab.tsx`, `PlanOverviewTab.tsx`, `PlanProductionTab.tsx`, `PlanScheduleTab.tsx`, `PlanActivities.tsx`. (`apps/web/src/components/plan/`)
- `PlanTravellersTab.tsx` is referenced nowhere in source (the file has been deleted per workspace status) yet there is no migration note in any Plan doc describing the removal or where traveller views now live in Make.
- No doc mentions the Product Studio v2 tree under `apps/web/src/components/plan/product-studio/blockly-v2/` (separate code path with its own components and store).
- Job Detail doc lists the tab components but omits the permission-gated behaviour (e.g., Budget tab visibility keyed off `budget.visibility` — see `PlanSettings.tsx:28`).
- Zustand stores used by Plan (`productBuilderStore`, `materialLibraryStore`, `finishLibraryStore`) are not cited from any of the relevant Plan docs.
- React Query / data-fetching patterns are not documented for any Plan route. Every component pulls from `@/services/planService` which in turn reads mocks; no query keys exist.
- Convex/Resend migration context (target backend) is absent from every Plan doc; only the generic phrase "mock/seed data paths" appears.
- ARCH 00 v7 permissions: only `settings.md` implicitly surfaces this via `ModuleSettingsLayout`. Route-level gating (e.g., schedule edit, BOM edit, traveller release) is not documented per-route.
- Testing approach (unit, Playwright, mock harness) is not mentioned in any of the 20 docs.
- `product-studio-legacy*.md` do not carry a **Deprecation status** heading or removal timeline, despite the route being a legacy path that still renders (`apps/web/src/components/plan/product-studio/ProductStudio.tsx`).

## Accuracy findings

- README lists legacy URLs `/plan/product-studio/legacy` and `/plan/product-studio/legacy/:productId`. These paths are **not registered** in `apps/web/src/routes.tsx`; the router redirects `/plan/product-studio/v2` and `/plan/product-studio/blockly-spike` to `/plan/product-studio` and there is no `/legacy` segment. (`docs/user/modules/plan/README.md`, `apps/web/src/routes.tsx:295-332`)
- `machine-io.md` does not mention the legacy redirects `/plan/nc-connect` → `/plan/machine-io?tab=nc-connect` and `/plan/cad-import` → `/plan/machine-io?tab=cad-import` that live in `routes.tsx:307-308`.
- `libraries.md` lists components but does not mention the tab query-param contract (`?tab=materials|finishes`) enforced by the routes file.
- `settings.md` describes "Access & Permissions" panel but omits the specific permission keys defined in `PlanSettings.tsx:25-36` (e.g., `traveller.release`, `traveller.exception_release`, `traveller.view_all`).
- `schedule.md` claims the page uses `PlanScheduleEngine` alongside `ScheduleCalendar` and `GanttChart`; this matches source but the doc does not describe the `?view=calendar` query-param that drives view mode (`routes.tsx:303`).
- `dashboard.md` component list does not include `ModuleQuickNav` or `AIFeed`, both imported and rendered in `PlanDashboard.tsx:12-30`.
- `jobs.md` lists `KanbanBoard/Card/Column` but misses the fact that the kanban stage map hardcodes four stages via `STATUS_TO_STAGE` in `PlanJobs.tsx:51-56`, and uses `EXTRA_KANBAN_JOBS` seed data independent of the `planService` feed.
- `nesting.md` does not surface that the nesting renderer uses a deterministic grid fallback (`PlanNesting.tsx:43-60`) rather than a real nesting algorithm.

## Consistency findings

- There is no **structural P1** for missing `src/lib/services/` — the repo has no such directory. Plan components reach for `@/services` (`apps/web/src/services/`) instead. Docs should either reference this actual location or note that `src/lib/services/` is the target location pending refactor. (`apps/web/src/services/planService.ts`)
- All 20 docs use the same generic phrase "Behavior is documented from current component implementation" regardless of whether the component is mostly presentational or complex. Consistency checks are impossible while the prose is boilerplate.
- Component import-path style is inconsistent across docs: some use the `@/components/...` alias, others use `apps/web/src/components/...` absolute paths, sometimes within the same file (e.g., `dashboard.md`).
- Role vocabulary: permission-related docs in Plan do not reference the canonical three-role taxonomy (`admin`, `lead`, `team`). Default group names like "Scheduling" and "Engineering" in `PlanSettings.tsx:39-60` are fine (they are groups, not roles), but audit docs should make the distinction explicit.
- "Supervisor"/"Operator"/"Manager" role names do not appear in Plan source — good. (No flag here, noted for completeness.)

## Style findings

- Every doc opens with "Screen. Behavior is documented from current component implementation." — passive voice and not task-oriented. Dev docs should instead lead with purpose + integration points.
- `mrp.md` titles the screen "MRP Demand Cascade" but the component (`PlanMrp.tsx`) is not a cascade implementation; name drift.
- Several docs include the text "No explicit mock marker in this file; verify real-data behavior in integration testing." which is a scaffold artefact rather than engineering content. (e.g., `libraries.md`, `machine-io.md`, `product-detail.md`.)
- US spelling "Behavior" used throughout — rubric mandates UK English.

## Visual findings

- Screenshots captured at 1440×900 for all 16 routed pages (plus `/plan/nc-connect`, `/plan/cad-import` legacy redirects which resolve to the Machine I/O tab). See `docs/audits/screenshots/plan/`. All files >10 KB; none failed.
- No doc cross-references screenshots. Dev audits benefit from visual anchors next to component trees.

## Gaps and recommendations

### P0 (blocking)

- **No spec doc of record for Plan.** Treat as P0 — dev audit baseline cannot be validated. (`docs/modules/plan/` contained only scaffolds, now migrated.)
- README advertises routes that do not exist (`/plan/product-studio/legacy*`). Readers will hit 404s or be misdirected. (`docs/user/modules/plan/README.md`)
- `PlanTravellersTab.tsx` deletion is not reflected in any doc; traveller workflow is referenced by `docs/user/modules/plan/job-detail.md` (implicit) yet no redirect to Make is noted.

### P1 (should fix before launch)

- Add metadata block (last-reviewed, applies-to, status, owner) to every Plan dev doc.
- Document permission key set from `PlanSettings.tsx` and link each route-level enforcement point.
- Document Zustand stores (`productBuilderStore`, `materialLibraryStore`, `finishLibraryStore`) and where each is consumed.
- Document legacy redirect table for `/plan/nc-connect`, `/plan/cad-import`, `/plan/material-library`, `/plan/finish-library`, `/plan/activities`, `/plan/product-studio/v2`, `/plan/product-studio/blockly-spike`.
- Decide and document whether Plan services should live under `apps/web/src/services/` or `apps/web/src/lib/services/`. Current convention mixes the two between docs and code.
- Replace boilerplate "Behavior is documented from current component implementation" with per-component specifics.
- Explicitly mark `product-studio-legacy*` pages as **deprecated** with a removal owner/date.
- Cover non-routed Plan components (Bom, CTP, Routing, Shift, Subcontracting, Intelligence Hub, Budget, Overview, Production, Schedule tabs).

### P2 (nice to have)

- Cross-reference screenshots from `docs/audits/screenshots/plan/` in each dev doc.
- Add a Plan-level architecture diagram showing `PlanDashboard → tabs → services/planService → mocks`.
- Add Convex/Resend migration TODOs per route (target backend).
- Add Playwright smoke-test targets per route.
- Resolve US → UK spelling across all migrated docs.
