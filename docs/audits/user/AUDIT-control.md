# Control — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Audience:** End users of the Control module — operations admins, implementation leads, shift leads, and team members with Control access.
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0.
  - User-doc home: `docs/user/modules/control/` (20 files, post-migration).
  - Screenshots: `docs/audits/screenshots/control/`.
  - Access & permissions (user-language reference): `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`.
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-control.md`.

## Completeness findings

- The sidebar exposes 22 Control destinations (Sidebar.tsx lines 346–403). Only 18 have a user-facing doc. **Users have no written guidance for:**
  - **Groups** (`/control/groups`) — where group membership is managed; directly shapes what every user can see and do.
  - **Billing & subscription** (`/control/billing`) — where tier upgrades and user seats are handled.
  - **Access audit** (`/control/audit`) — where admins review permission changes.
- The Control README (`docs/user/modules/control/README.md`) lists 18 routes but not these three.
- No doc explains how `/design` URLs (legacy bookmarks) redirect to their new `/control` homes. Users who saved `/design/factory-layout`, `/design/process-builder`, or `/design/initial-data` bookmarks will be silently redirected with no note in the product docs that this alias exists or will be retired.
- No doc tells a user "how to invite a teammate" end to end. `people.md` lists `InviteUserDialog` as a component but never walks through the invite flow (open People → Invite → assign groups → send).
- No doc describes "Reset a user's access" or "Deactivate a user" — both are real UX paths on `UserDetailSheet.tsx`.
- No doc explains the ARCH 00 access model in **user language**: "you belong to an organisation, an organisation has modules, each module has groups, your group membership determines what you can see". Access is described only via developer headings (Permissions, Effective Permissions Panel).
- No doc explains the three role tiers in user language: **admin** (org-wide control), **lead** (full access within one module), **team** (default — access determined by the groups you belong to). `people.md` does not use these words.
- No doc walks a shift lead through "Create this week's shift pattern", "Assign a team member to a shift", or "Cover a shift". `shifts.md` is 52 lines of boilerplate template.
- No doc walks a maintenance lead through "Book a machine in for service" or "Close a maintenance job". `maintenance.md` is also boilerplate.
- No doc explains how to import initial data with MirrorWorks Bridge. `mirrorworks-bridge.md` does not describe the wizard steps.
- No doc explains the empty-states showcase (`/control/empty-states`) is for internal reference only — a user clicking it in the sidebar gets no context.

## Accuracy findings

- **`role-designer.md` describes a removed feature.** This doc should carry a top-of-page banner: "This feature has been removed — access is now managed through Control → People and each module's Settings → Access & Permissions." The doc already has that sentence on line 5 but then continues for 45 more lines listing components and behaviour that no longer exist. A user who lands on this page by search will scroll past the deprecation line into obsolete instructions.
- **Route list in README is missing three live destinations** (`/control/groups`, `/control/billing`, `/control/audit`). A user reading the README to find "Where do I change my subscription?" finds nothing.
- **Factory Designer has three names.** Sidebar says "Factory Designer". Doc title says "Factory Layout". URL slug says `factory-layout`. A user searching for any of these may or may not find the right page.
- **`people.md` contradicts what users see.** It says "No explicit mock marker in this file" and "No explicit store/service/hook dependency imported" — neither statement helps a user, and the underlying claim is wrong (the People screen uses `mock-data.ts` and pulls multiple dedicated People components and services).
- **Boilerplate everywhere.** At least 19 of the 20 docs share the sentence "Complete {screen} work and move records to the next stage." This tells a user nothing about what the screen does.
- **"Primary Actions" is generic.** Most docs say "Create or add records/items. Switch tabs/sub-views within the page. Use modal/sheet interactions for edits and quick actions." A user does not learn which button to press to create a machine, add a product, book maintenance, or assign a shift.
- **"Data Shown" is generic.** Most docs say "Page-specific records and controls shown in current UI implementation." This is a non-statement. `ControlMachines.tsx` for example shows machine name, type, status, utilisation, assigned operator, and location — none of that surfaces in the doc.
- **Currency assumption unstated.** Monetary figures appear in Purchase and Inventory screens. The docs never say "prices are shown in the organisation's base currency" or equivalent.
- **Role vocabulary in the UI contradicts the access model.** The Factory Designer palette has "Operator Station" and "Supervisor Station" tiles; Process Builder has "Operator" and "Supervisor" nodes; Machines has an "Assigned Operator" field. The access model only has the roles `admin`, `lead`, `team`. A new user will reasonably assume that an "Operator" in the palette corresponds to an "Operator" role they can assign — they cannot. The docs should either rename these palette items or explicitly note "Operator/Supervisor are visual labels for station ownership; they are not access roles."

## Consistency findings

- **Screen title conventions drift.** Doc titles use mixed capitalisation: `# Factory Layout`, `# Process Builder`, `# Workflow Designer`, `# Shift Manager`, `# People`, `# Purchase Control`. Sidebar uses "Factory Designer", "Process Builder", "Workflow Designer", "Shifts", "People", "Purchase". Users reading the docs will not always recognise them as the same screen.
- **"Summary" sentence template is not stable.** Most docs use: `"{Screen} screen. Behavior is documented from current component implementation."` A few use `"{Screen} screen. Current implementation includes mock/seed data paths."`. Neither is a user-useful summary.
- **States list varies.** `factory-layout.md` lists six states, most others list three. A user has no way to map these to what they will actually encounter.
- **"Known Gaps / Questions" is dev-language.** Users do not know what "mock/seed-backed", "action persistence paths", or "integration testing" mean. All 20 docs carry at least one dev-language gap statement.

## Style findings

- **Voice.** Rule: UK English, Oxford comma, 2nd person, present, imperative. Current docs fail the 2nd-person-imperative test — most sentences are noun phrases or passive ("Complete people work and move records to the next stage"). User docs should use commands like "Create a location", "Schedule a maintenance window", "Invite a teammate".
- **UK English.** `memoized`, `memoize`, `behavior`, `color` appear across multiple docs. Should be `memoised`, `memoise`, `behaviour`, `colour`. These are mostly confined to "Logic / Behaviour" paragraphs but still leak into user sections.
- **Marketing verbs.** Clean — none of `leverage`, `seamless`, `robust`, `empower`, `streamline`, `unleash`, `unlock`, "This isn't X, it's Y", etc. appear.
- **Banned names.** Clean — no `Supabase`, `Convex`, `WorkOS`, `Resend`, `Zustand`, `Con-form Group`, `React`.
- **Emojis.** None. Clean.
- **Brand colours / fonts.** Not referenced in user docs. Appropriate — these are design-system concerns, not user-doc content.
- **3D claims.** None. `factory-layout.md` does not overstate 3D; it is silent on rendering entirely. Factory Designer is a 2D SVG canvas per the source header; docs do not mischaracterise this.

## Visual findings

- Screenshots for all 18 in-scope routes plus `/design` are captured at 1440×900 and live under `docs/audits/screenshots/control/`. All exceed 100 KB.
- No user doc embeds any screenshot. A user-facing doc is strongly improved by inline visuals (call-out arrows on key CTAs); none of the 20 Control docs has one.
- `/design` screenshot confirms the redirect: the URL bar would show `/control/factory-layout` after the client-side `<Navigate replace />`, and the page contents are the Factory Designer canvas.
- Empty-states showcase page (`empty-states.png`) is visually rich; the doc does not describe what any of the empty states are.

## Permissions — user-language summary

ARCH 00 maps to these three user-facing concepts (see `AccessRightsAndPermissions.md`):

- **Your organisation** is the top container. Every user belongs to one organisation.
- **Your group memberships** determine what you can see and do in each module. You can belong to more than one group per module; permissions combine (allow wins for toggles; broader scope wins for "own vs all" scopes).
- **Your role tier** is one of three: **admin** (org-wide — full access everywhere), **lead** (full access in a single module), **team** (default — access determined by your group memberships).

Control-specific user-facing permission surfaces:

- **Manage products, BOMs, locations, machines** — gated by corresponding `*.manage` permissions on your Control group. If you cannot see the "Create" button, your group does not grant the permission.
- **View / manage people** — split between `people.view` and `people.manage`. A shift lead typically has `people.view` but not `people.manage`.
- **Manage workflows** — gated by `workflow.manage`. Applies to Workflow Designer and Process Builder.
- **See all documents vs your own documents** — scoped by `documents.scope` (`own` or `all`).
- **Access settings, access reports** — gated by `settings.access`, `reports.access`.

None of the per-screen user docs state which permission gates each screen. This should be a one-line note at the top of each doc: "You need `locations.manage` to create or edit locations."

## Gaps and recommendations

### P0 (blocking)

- No spec doc of record — the product team has no authoritative source for what Control should do. Every user-doc author is reverse-engineering from the prototype.
- `role-designer.md` describes a removed feature. Either delete or banner-mark at the top of page 1, not on line 5 below a "Summary" heading.
- Three registered routes (`/control/groups`, `/control/billing`, `/control/audit`) have no user doc. All are reachable from the sidebar.
- Every doc is generic-boilerplate — no doc teaches a user how to do anything. This is the deepest gap in the module.

### P1 (should fix before launch)

- Rewrite each screen doc around imperative user tasks. Example headings for `locations.md`: "Create a location", "Edit an address", "Archive a location you no longer use", "Set a default shipping location".
- Add a per-screen "You need" permissions line naming the relevant `*.manage` / `*.view` / scope permission.
- Rename the three-name Factory Designer / Factory Layout screen consistently across sidebar, URL, component, and doc.
- Write a single "Access in Control" user explainer under `docs/user/modules/control/` covering organisation → groups → role tiers in plain English. Link every per-screen doc back to it.
- Write the missing docs for Groups, Billing, and Access audit.
- Rewrite `role-designer.md` as a single-page tombstone: banner at top ("This feature has been removed. Manage access via Control → People or each module's Settings → Access & Permissions."), nothing else.
- Annotate the `Operator` / `Supervisor` UI copy in Factory Designer / Process Builder / Machines with a note that these are station labels, not access roles.
- Add "How to import your starting data" walkthrough to `mirrorworks-bridge.md` (current doc is pure boilerplate).
- Add "Create a shift pattern" and "Cover a shift" walkthroughs to `shifts.md`.
- Add "Schedule maintenance" and "Close a maintenance job" walkthroughs to `maintenance.md`.
- Add "Invite a user" end-to-end walkthrough to `people.md`.

### P2 (nice to have)

- Embed one screenshot per screen doc, annotated with key CTAs.
- Normalise UK English across all 20 docs.
- Remove "Known Gaps / Questions" from user-facing docs (that section belongs in the dev split).
- Collapse the repetitive "Summary" and "Primary Actions" boilerplate into one short, screen-specific paragraph.
- Link every per-screen doc to the relevant ARCH 00 §4.9 permission key by name.
