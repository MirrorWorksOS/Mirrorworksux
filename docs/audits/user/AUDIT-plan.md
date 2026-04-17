# Plan — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding
  - Code: `apps/web/src/components/plan/`
  - Routes: `apps/web/src/routes.tsx` — `/plan/*`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
- **Existing docs migrated:** see MIGRATION-LOG-plan.md
- **Screenshots:** `docs/audits/screenshots/plan/`

## Completeness findings

- None of the 20 migrated Plan user docs include a **tier badge** (Pilot / Produce / Expand / Excel). Every article requires one.
- No doc includes user-facing metadata: **last-reviewed**, **applies-to** (tier list), **status**, **related** links.
- Headings are framed as page overviews ("Jobs", "Schedule") rather than imperative tasks ("Create a job", "Schedule a job", "Nest a sheet"). Every article needs to be rewritten around tasks.
- No doc tells the reader which roles can perform each action (`admin`, `lead`, `team`). For example, releasing travellers is a high-trust action but the Plan Settings article does not say so.
- No "Before you begin" / "Prerequisites" sections for any workflow.
- No doc covers workflow linkage between modules (e.g., Plan → Make handoff for travellers, Plan → Buy handoff for purchase planning).
- No standalone Quick Start article for the Plan module exists — only a `README` index.
- No troubleshooting / FAQ section anywhere in `docs/user/modules/plan/`.

## Accuracy findings

- README lists `/plan/product-studio/legacy` and `/plan/product-studio/legacy/:productId` as live routes. These paths are not registered in `apps/web/src/routes.tsx` and will 404 for a user following the link.
- `machine-io.md` does not mention that `/plan/nc-connect` and `/plan/cad-import` both redirect to `/plan/machine-io`, so a user who bookmarked the older URL will not understand the change.
- `libraries.md` does not mention the `?tab=materials|finishes` deep-links that users will receive from sidebar entries.
- `schedule.md` references the `?view=calendar` query param only obliquely; it should be shown as a user-facing option ("Switch between Calendar and Gantt views").
- `settings.md` refers to generic permission groups but the current implementation ships with four defaults (Scheduling, Engineering, Planners, Viewers) in `PlanSettings.tsx:39-` that should be documented so users know what they get on day one.
- `product-studio*` docs do not tell users that v2 uses a blockly-style tree editor and that the legacy editor is being retired. (This is also misleading because legacy routes do not exist, per P0.)

## Consistency findings

- Colours referenced in dashboards (e.g., chart scale tokens) are CSS variables in code; no doc shows the MirrorWorks colour tokens (Yellow `#FFCF4B`, Mirage `#1A2732`, Black Ash `#191406`). No prohibited colours (lime, Sea Foam, Azure, AI Purple, Saddle, Earth) appear in Plan docs — OK.
- No doc uses Inter or Geist fonts in code samples. Roboto is not explicitly documented either.
- Backend references: no Plan doc mentions Supabase, Convex, WorkOS, Resend, React, Zustand, or Con-form Group — which is correct for user docs.
- Role terminology: docs do not reference any role at all; they should use only `admin`, `lead`, `team`. No forbidden terms (Manager, Supervisor, Operator) appear in the 20 files — good.

## Style findings

- Boilerplate phrase "Behavior is documented from current component implementation" appears in every doc. Not user-facing; must be removed.
- Passive constructions throughout ("Behavior is documented", "Actions can be taken") — should be 2nd person ("You can…" / imperative "Do X").
- US spelling "Behavior", "color" (in some docs) instead of UK "Behaviour", "colour".
- No marketing verbs found in the current docs — OK.
- No emojis found — OK.
- `product-studio*` pages do not lead with 3D / Babylon / MirrorWorks View claims — OK, meets rubric.
- No Oxford-comma style decisions made; lists are short enough that the choice is rarely triggered, but the policy should be stated in a style guide.

## Visual findings

- 16 screenshots available at `docs/audits/screenshots/plan/` (all >10 KB). They should be embedded in each task page:
  - `plan.png` → Plan Dashboard
  - `plan-jobs.png` → Jobs
  - `plan-schedule.png` → Schedule
  - `plan-product-studio.png` → Product Studio v2
  - `plan-libraries.png` → Libraries
  - `plan-machine-io.png`, `plan-nc-connect.png`, `plan-cad-import.png` → Machine I/O (primary + two redirect views)
  - `plan-purchase.png` → Purchase Planning
  - `plan-qc-planning.png` → QC Planning
  - `plan-what-if.png` → What-if
  - `plan-nesting.png` → Nesting
  - `plan-mrp.png` → MRP
  - `plan-sheet-calculator.png` → Sheet Calculator
  - `plan-products.png` → Products
  - `plan-settings.png` → Plan Settings
- No article currently cross-references any screenshot or includes alt text guidance.

## Gaps and recommendations

### P0 (blocking)

- **No spec doc of record.** The Plan module has no authoritative user-facing spec; all articles are generated scaffolds and every article lacks a tier badge. Block user-doc sign-off.
- README advertises non-existent `/plan/product-studio/legacy*` routes. Readers will hit broken links.

### P1 (should fix before launch)

- Add tier badges (Pilot / Produce / Expand / Excel) to every article and every section that gates by tier.
- Rewrite each article around imperative task headings:
  - Plan Dashboard → "Open the Plan dashboard", "Read the capacity strip", "Jump to a priority job".
  - Jobs → "Create a job", "Move a job between stages", "Filter the jobs list".
  - Job Detail → "Review a job", "Update the schedule tab", "Release a job to the shop".
  - Schedule → "Switch between Calendar and Gantt", "Reschedule a job".
  - Product Studio v2 → "Create a product", "Add a rule", "Preview a configured product".
  - Libraries → "Add a material", "Add a finish", "Retire an unused material".
  - Machine I/O → "Import a CAD file", "Send NC to a machine".
  - Purchase Planning → "Create a purchase requirement", "Bundle requirements into a PO".
  - QC Planning → "Create a QC plan", "Attach a QC plan to a job".
  - What-if → "Run a rush-order scenario", "Compare two scenarios".
  - Nesting → "Open a nest", "Read yield and waste".
  - MRP → "Review demand cascade", "Trigger an MRP run".
  - Sheet Calculator → "Calculate parts per sheet".
  - Products → "Find a product", "Open a product detail".
  - Plan Settings → "Set a default schedule policy", "Edit a permission group", "Grant traveller release".
- Add metadata block per article:
  ```
  ---
  last-reviewed: 2026-04-18
  applies-to: [Pilot, Produce, Expand, Excel]
  status: draft
  related: [/plan/jobs, /make]
  ---
  ```
- Name the three roles (`admin`, `lead`, `team`) explicitly on every task that is permission-gated. Call out high-trust actions: **Release traveller**, **Edit schedule**, **Edit BOM**, **Intelligence hub access**.
- Add "Before you begin" / "Prerequisites" blocks for flows that require setup (e.g., Nesting needs materials in the library).
- Embed the matching screenshot at the top of each task page with alt text.
- Convert US → UK spelling across all 20 files.
- Remove scaffold boilerplate (States, Components Used, Logic/Behaviour) from user docs — move to the dev stubs.
- Mark `product-studio-legacy*` pages **deprecated** at the top and list the v2 migration path, or delete if the routes are gone.

### P2 (nice to have)

- Add a Plan module Quick Start page (1 page, <10 min read) that threads dashboard → jobs → schedule → traveller release.
- Add a glossary page covering Plan-specific terms (traveller, nest, BOM, MRP, CTP, what-if).
- Add cross-module links from Plan → Make (travellers), Plan → Buy (requirements), Plan → Sell (quote to job).
- Add tier-gating callouts on features only present in Expand/Excel (e.g., advanced nesting, intelligence hub).
- Add a printable job-release checklist as a companion artefact.
