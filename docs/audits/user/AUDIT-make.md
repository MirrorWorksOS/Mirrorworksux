# Make — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding
  - Code: `apps/web/src/components/make/`
  - Routes: `apps/web/src/routes.tsx` — `/make/*`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-make.md` — no user-facing articles existed in `docs/modules/make/`. `docs/user/modules/make/` is empty; all user articles below are **missing** (P0/P1 gaps).
- **Screenshots:** `docs/audits/screenshots/make/` (11 route captures at 1440×900)

## Completeness findings

1. The `docs/user/modules/make/` directory is empty. Zero task-oriented articles exist for Make. Every required article below is a gap.
2. Required imperative-titled articles (minimum set):
   - `release-a-manufacturing-order.md` — user flow for moving an MO from Draft → Confirmed → In Progress on `/make/manufacturing-orders`.
   - `print-a-job-traveller.md` — what the paper traveller contains, where the barcode is, how to re-print (covers `/make/job-traveler/:id` and the `auto-print job travellers on release` toggle in Make Settings).
   - `log-scrap.md` — how to file a scrap entry that shows on `/make/scrap-analysis`; explains the `equipment / operator / week` grouping and how the heat map reads.
   - `open-a-capa.md` — walk the six CAPA states (`Identified → Root Cause → Containment → Corrective Action → Verification → Closed`) and the four severity tiers.
   - `raise-a-hold-on-the-shop-floor.md` — the "Hold / Raise issue" button on `/make/shop-floor` and what happens to planning.
   - `schedule-a-manufacturing-order.md` — Gantt, calendar, and list views on `/make/schedule`.
   - `inspect-quality-on-the-floor.md` — `/make/quality` tab and the QC checkpoints surfaced on the traveller.
   - `configure-make-settings.md` — General, Quality, Reports, Access & Permissions panels on `/make/settings`.
   - `add-a-product-to-make.md` — BOM status, routing steps, default work centre on `/make/products` and the card "Make" CTA that starts an MO.
   - `read-the-make-dashboard.md` — Andon board, KPI strip, AI Feed, work-order cards, schedule Gantt strip.
3. Metadata is missing on every (non-existent) article. Each user article must declare: tier (Pilot / Produce / Expand / Excel), role (admin / lead / team), prerequisites, estimated time, and related-tasks cross-refs.
4. No cross-reference to the `/floor` kiosk. Users reading Make docs need a pointer that operators actually clock in at `/floor`, not at `/make/shop-floor` or `/make/time-clock` (the latter redirects per `apps/web/src/routes.tsx:347`).
5. No article documents the **barcode workflow** end-to-end: print traveller (`BarcodeDisplay` on `/make/job-traveler/:id`) → scan at kiosk → execution. The barcode feature was added in commit `bc6495fc` and ships with zero user docs.

## Accuracy findings

6. N/A — no user articles to cross-check. Flagged here so the count is explicit: the audit cannot report accuracy on absent content.

## Consistency findings

7. When authored, every Make user article should reuse the same UI vocabulary the product uses: "manufacturing order" (not "MO" in body copy; "MO" only in headings/callouts), "traveller" (UK spelling — pick one and stick to it, given code-side inconsistency between `MakeJobTraveler.tsx` and `travellerStore.ts`), "shop floor" (two words), "work centre" (UK — matches `MakeSettings.tsx` "Work centre timeout").
8. Role vocabulary must stay within `admin`, `lead`, `team`. Do not reintroduce "Manager / Supervisor / Operator" — current `MakeSettings.tsx:40-90` groups (`Production`, `Quality`, `Maintenance`, `Office`) are **permission groups**, not roles; clarify in copy.

## Style findings

9. No existing user copy to lint. Set style guardrails before authoring:
   - UK English, Oxford comma, 2nd person, present tense, imperative headings.
   - No marketing verbs (`leverage`, `seamless`, `robust`, `cutting-edge`, `empower`, `game-changer`, `optimise your workflow`, `unlock`, `unleash`, `streamline`, "This isn't X, it's Y").
   - No emojis.
   - No mentions of Supabase, Convex, WorkOSn Resend, React, Zustand, or "Con-form Group".
   - 3D / Babylon / MirrorWorks View is not a differentiator for Make — do not feature.

## Visual findings

10. Use the captured screenshots `docs/audits/screenshots/make/*.png` as the seed visual set:
    - `make.png` and `make-dashboard.png` → "Read the Make dashboard".
    - `make-manufacturing-orders.png` → "Release a manufacturing order".
    - `make-job-traveler.png` → "Print a job traveller" (note: screenshot is the 404 fallback state because `/make/job-traveler` has no `:id` segment; re-shoot with `/make/job-traveler/mo-1` for the real article).
    - `make-shop-floor.png` → "Raise a hold on the shop floor".
    - `make-quality.png` → "Inspect quality on the floor".
    - `make-scrap-analysis.png` → "Log scrap".
    - `make-capa.png` → "Open a CAPA".
    - `make-schedule.png` → "Schedule a manufacturing order".
    - `make-products.png` → "Add a product to Make".
    - `make-settings.png` → "Configure Make settings".
11. All captured PNGs show light mode. User docs must also show dark-mode variants (or verify styles hold) per memory guidance: **never modify existing light mode styles when implementing dark mode**.
12. The `/make/capa` screenshot should be re-shot once seed data covers all four severities (`low / medium / high / critical`) and six statuses, so each kanban column has at least one card.
13. On any yellow-on-dark visual (MW Yellow `#FFCF4B` tile, badge, or CTA), user docs must remind the author to use dark text — never white text on yellow (per memory).

## Gaps and recommendations

### P0 (blocking)

- **No `.docx` spec** for Make. User writers have no canonical source of truth — every article below will drift unless a spec is imported from Confluence PLAT or authored locally at `docs/specs/make-module.docx`.
- **Zero user articles exist** for Make. Ship the ten articles listed in finding 2 before Pilot rollout. Priority order: `release-a-manufacturing-order`, `print-a-job-traveller`, `raise-a-hold-on-the-shop-floor`, `read-the-make-dashboard`.
- **Barcode workflow undocumented.** The feature is already live (`BarcodeDisplay` component rendered on `/make/job-traveler/:id` at `MakeJobTraveler.tsx:204-208`). Users cannot self-serve scanning without step-by-step docs.

### P1 (should fix before launch)

- **Add tier badges to every article metadata block.** Tiers are Pilot, Produce, Expand, Excel. Seed guess for Make routes (needs confirmation):
  - Pilot: Dashboard, Manufacturing Orders, Job Traveller, Shop Floor, Quality, Products, Settings.
  - Produce: Schedule (Gantt), Scrap Analysis, CAPA.
  - Expand / Excel: advanced andon alerts, AI-assisted forecasting on dashboard (see `AIFeed` in `MakeDashboard.tsx`).
  Every article must declare its tier in the metadata header until the spec confirms.
- **Role callouts per article.** State which of `admin`, `lead`, `team` can perform the task. Example: `team` can release a traveller; only `lead` can void a CAPA.
- **Cross-module links.** The Make → Ship handover (when an MO reaches "Done"), and Make → Book linkage (cost roll-up), both need user-visible docs. Today they are mentioned only in the Make README "Related Modules" list.
- **Settings copy.** The existing in-app copy includes internal terms like "andon.manage" (permission-key syntax). User docs must translate to plain English ("Manage andon alerts").
- **Screenshots in dark mode.** Recapture the same 11 routes with `prefers-color-scheme: dark` or the in-app dark-mode toggle, for parity.

### P2 (nice to have)

- Add a short glossary for Make terms: MO, WO, traveller, routing, work centre, andon, CAPA, NCR, scrap rate.
- Inline video or GIF for the CAPA drag-drop interaction on `/make/capa`.
- Search-friendly titles: the imperative form helps SEO and in-product help search. Avoid nominal titles like "Manufacturing Orders Overview".
- Cross-link each user article to its dev-side page in `docs/dev/modules/make/` for writers who want to trace implementation.
- Quickstart index article at `docs/user/modules/make/README.md` with a 4-step "your first job" happy path.
