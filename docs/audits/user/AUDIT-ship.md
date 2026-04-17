# Ship — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0 finding. `apps/web/src/guidelines/specs/Ship-04-Screen-by-Screen.md` is a PDF extract that cites a `MirrorWorksModuleSpec.pdf` not in the repo.
  - Code: `apps/web/src/components/ship/`
  - Routes: `apps/web/src/routes.tsx` — `/ship/*`
  - Access: `apps/web/src/guidelines/access/AccessRightsAndPermissions.md`
  - Confluence PLAT: referenced, not fetched
- **Existing docs migrated:** see `docs/audits/MIGRATION-LOG-ship.md`
- **Screenshots:** `docs/audits/screenshots/ship/*.png` (11 routes, 1440×900)

## Completeness findings

- None of the 11 user docs use imperative task headings. They all use noun labels ("Orders", "Packaging", "Shipping") rather than user-doc imperatives ("Pack a shipment", "Print carrier labels", "Generate a manifest").
- `docs/user/modules/ship/README.md` does not identify the three roles (admin, lead, team) that can perform Ship tasks.
- No doc shows the end-to-end user journey (Sell order → Ship Orders kanban → Packaging → Shipping → Tracking → optional Returns). The README lists pages but does not narrate the flow.
- `docs/user/modules/ship/dashboard.md` Primary Actions is a single bullet: "Review current records and execute available CTA actions." A user doc must state what a user can actually click: "Jump to any sub-page from the bento grid", "Review exceptions", "Drill into carrier performance".
- `docs/user/modules/ship/orders.md` does not mention that dragging a card across the kanban advances its stage, nor that clicking a card opens a detail sheet with "Advance stage", "Flag issue", and "View bill of lading" actions.
- `docs/user/modules/ship/packaging.md` does not say that scanning the wrong barcode flashes red or that "Complete & print label" is disabled until every item is checked.
- `docs/user/modules/ship/shipping.md` does not say how to compare rates (enter from, to, weight, and dimensions then pick from the sorted list) or that the "Agent pick" badge marks the AI-recommended rate.
- `docs/user/modules/ship/tracking.md` does not explain how to filter to exceptions only, how to notify a customer, or how to open the carrier portal.
- `docs/user/modules/ship/returns.md` does not describe how to approve a pending RMA or how to process a refund once the return is received.
- `docs/user/modules/ship/scan-to-ship.md` does not list the three sample barcodes shown in the UI as hints (`BKT-001-001`, `PLT-042-001`, `FST-010-001`, `HW-KIT-001`) nor the matched vs unmatched badge meaning.
- `docs/user/modules/ship/warehouse.md` does not explain that zones with >60% utilisation are highlighted yellow on the map, or how to submit a cycle count.
- `docs/user/modules/ship/reports.md` does not describe the six charts or the "This Week" / "Export" toolbar actions.
- `docs/user/modules/ship/settings.md` does not walk through any panel (General, Carriers, Reports, Access & Permissions) — it simply lists "Form controls for editing/creation".

## Accuracy findings

- `docs/user/modules/ship/README.md` Primary Users says "customer fulfillment staff" using US spelling. Project style is UK English — should read "customer fulfilment staff" (the rest of the sentence already uses "fulfilment").
- `docs/user/modules/ship/README.md` "Key Workflows" says users "Execute module-specific configuration/setup from settings or control pages." There is no Control page in Ship; settings live at `/ship/settings` only.
- `docs/user/modules/ship/orders.md` Data Shown lists "values" — the code never renders a monetary value for a shipping order.
- `docs/user/modules/ship/shipping.md` Data Shown mentions "return states". Returns are on `/ship/returns`, not `/ship/shipping`.
- `docs/user/modules/ship/dashboard.md` Primary Actions claims the page has "CTA actions". The dashboard is read-only pipeline / KPI display; the only CTAs are navigations via the bento grid.
- `docs/user/modules/ship/carrier-rates.md` Data Shown is generic ("Page-specific records and controls…"). The page is specifically a rate comparison table sortable by price or estimated days.
- `docs/user/modules/ship/reports.md` User Intent says "Review aggregated outputs and export analysis for decisions." The page surfaces six charts plus an export CSV trigger; the current copy is vague.
- `docs/user/modules/ship/packaging.md` does not state the hard-coded example values ("Pack Station 1", "Matt Quigley", packed count 34, orders 8, SKU list beginning `AL-5052-BP`). Users will see these fixtures in the screenshot but no doc explains they are demo placeholders.
- Screenshot cross-check:
  - `ship.png` matches doc topics (KPIs, fulfilment pipeline, carrier performance, exceptions).
  - `orders.png` confirms kanban view is the default; doc does not say so.
  - `packaging.png` shows the pack-station UI; doc never mentions the layout.
  - `shipping.png` shows the "Carriers" tab active by default; doc does not name the tab.
  - `tracking.png` shows status pills with colour dots; doc does not define them.
  - `returns.png` shows the RMA detail with timeline; doc does not describe the timeline stages.
  - `warehouse.png` shows the map tab with zone blocks; doc does not describe it.
  - `reports.png` shows six charts; doc does not name any.
  - `carrier-rates.png` shows five rows sorted by price; doc does not mention sorting.
  - `scan-to-ship.png` shows the scan input and sample barcode hints; doc does not mention hints or the generate-packing-list CTA.
  - `settings.png` shows the three-panel settings layout with General selected; doc does not name any panel.

## Consistency findings

- All 11 screen docs use the same skeleton (Summary / Route / User Intent / Primary Actions / Key UI Sections / Data Shown / States / Components Used / Logic & Behaviour / Dependencies / Design & UX Notes / Known Gaps / Related Files). The "Components Used", "Logic & Behaviour", "Dependencies", "Related Files" sections are developer content that should not appear in user docs — they belong in the dev stubs.
- `## States` section lists machine states (`default | error | success | blocked | populated`) — this is internal React state, not user-facing state. Remove from user docs.
- README lists Related Modules as "Sell, Make, Book". Ship also depends on Buy for inbound goods and Control for permissions. Either widen the list or say why Buy/Control are excluded.
- The "Badge" / "Active" / "Connected" / "Configure" vocabulary in Settings UI is not explained in docs; neither is the distinction between the carrier *brand* and the carrier *service level* in Shipping ("StarTrack Premium" etc.).
- Two different rate-comparison surfaces exist: `/ship/shipping` (Rates tab) and `/ship/carrier-rates`. Docs do not explain how they differ.
- The Ship Orders kanban uses five stages (`Pick | Pack | Ship | Transit | Delivered`). The Ship Returns sheet uses six stages (`pending → approved → in_transit → received → refunded → closed`). Naming casing differs (Title Case vs snake_case) — user copy should normalise to one.

## Style findings

- UK English: "On-Time Rate", "fulfilment", "organisation" used correctly. But README uses "fulfillment" once (see Accuracy) — US spelling drift.
- Oxford comma: not consistently applied. Example in `README.md`: "Fulfilment and logistics workflows for shipment preparation, dispatch, tracking, and returns." — correct. Other docs less consistent when three or more items are listed.
- Second person, present, imperative: the current docs are in descriptive third person ("The Orders screen shows…"). Rewrite to "Use Orders to move shipments through Pick, Pack, Ship, Transit, and Delivered."
- Banned marketing verbs: none spotted (`leverage`, `seamless`, `robust`, `cutting-edge`, `empower`, `game-changer`, `optimise your workflow`, `unlock`, `unleash`, `streamline`, "This isn't X, it's Y"). Confirmed clean.
- Banned technology names: none spotted (no Supabase, Convex, WorkOS, Resend, React, Zustand, or Con-form Group in the user docs themselves).
- Emojis: none found in docs. Clean.
- 3D language: none found. Clean.
- "Summary" sections use the template phrase "Behavior is documented from current component implementation" — US spelling of "Behavior" should be "Behaviour", and the phrase is a template stub that should be replaced with real user-facing copy on every file.

## Visual findings

- Screenshots show all 11 Ship routes render without error at 1440×900. Meaningful content present on every page (PNG sizes 88 KB – 144 KB).
- MW Yellow `#FFCF4B` is used consistently as the primary CTA colour on "Advance stage", "Generate manifest", "Process refund", "Complete & print label", "Submit count", "Notify customer" buttons. Dark text is used on all yellow surfaces in the screenshots — conforms to yellow-bg / dark-text rule.
- MW Mirage is used for secondary dark surfaces (`Pack Station 1` badge, completed pipeline nodes, hover states on warehouse inventory dots). Consistent across pages.
- Reports page uses a yellow reference line at the 95% on-time SLA marker — document this in the user copy as the target threshold.
- Roboto is applied consistently (no fallback fonts visible in any screenshot).
- Screenshot placement: no Ship user doc currently embeds or links to any image from `docs/audits/screenshots/ship/`. Add inline `![Page name](../../audits/screenshots/ship/<slug>.png)` references to each file.

## Gaps and recommendations

### P0 (blocking)

1. **No canonical `.docx` spec for Ship in the repo.** User docs cannot be verified against a canonical source. Check the `.docx` / PDF in or define the path of record.
2. **User docs contain developer content.** The 11 mixed-content files still include `Components Used`, `Logic & Behaviour`, `Dependencies`, `Related Files` sections which must be stripped to the dev stubs before release.
3. **Every doc is missing an imperative heading and procedural body.** Current format is a structural stub, not a user instruction ("Pack a shipment", "Print carrier labels", "Approve a return", "Run a cycle count").

### P1 (should fix before launch)

4. **No tier badges.** No user doc flags which features are in Pilot, Produce, Expand, or Excel tiers. Example gaps: Carrier Rates comparison (Produce?), Scan to Ship barcode flow (Expand?), Agent pick AI recommendation (Excel?). Add a "Tier" metadata line to every file.
5. **Role vocabulary drift.** Docs do not state which of `admin`, `lead`, `team` can carry out each task. Settings permission groups (Warehouse, Shipping, Customer Service) are not mapped back to the three roles.
6. **README uses "fulfillment" (US).** Replace with "fulfilment".
7. **Scan to Ship doc is stale.** Does not reflect the recent barcode-scanning integration (commit `bc6495fc`). Rewrite around the real workflow: scan → match against expected items → see matched/unmatched badges → generate packing list.
8. **Ship Orders user doc omits kanban drag-to-advance behaviour.** Core interaction; must be explicit.
9. **Returns user doc omits conditional CTAs.** "Approve return" only appears when status is pending; "Process refund" only when received. Document both.
10. **Tracking doc omits the exceptions filter toggle.** Major user-facing feature.
11. **Warehouse doc omits map zone semantics** (high-use yellow vs. normal neutral) and cycle-count submission.
12. **Shipping doc omits the three sections (Carriers, Rates, Manifests)** and does not explain the "Agent pick" AI highlight on rates.
13. **Reports doc lists no charts.** Name every chart and what decision it supports.
14. **Settings doc lists no panels.** Name the four panels (General, Carriers, Reports, Access & Permissions) and state what each controls.
15. **No doc explains the difference between `/ship/shipping` Rates tab and the dedicated `/ship/carrier-rates` page.** Pick one as primary and document the relationship.
16. **README does not surface screenshots.** Add a "Pages" index with thumbnails or links to the screenshots under `docs/audits/screenshots/ship/`.

### P2 (nice to have)

17. **Add a "Before you start" section to Packaging and Scan to Ship** covering barcode scanner hardware expectations and the camera fallback.
18. **Add a "Tips" section** to Tracking (e.g., the customer-notify CTA uses the sonner toast pattern; no email is actually sent in the current build).
19. **Normalise stage naming.** Orders uses Title Case (`Pick | Pack | Ship | Transit | Delivered`); Returns uses snake_case (`pending | approved | in_transit | received | refunded | closed`). Pick one and align both docs.
20. **Explain the "Fragile" toggle** in Packaging — it currently does nothing in the UI but is user-visible.
21. **Explain the "Park" button** in Packaging — code shows no handler; docs should either reflect "coming soon" or drop the mention until wired.
22. **Add a safety note** on Bill of Lading PDF generation: the "Download PDF" button currently emits a success toast but no file is produced. Users need to know.
23. **Carrier-rates doc should name the carriers currently shown** (Sendle, Australia Post, StarTrack, TNT, DHL, Aramex) so users can anticipate what they will see.
24. **Warehouse doc should reference the four inventory statuses** (OK, Low, Empty, Reserved) as the colour key for the Inventory tab.
25. **Reports doc should state the 95% on-time SLA** shown as a yellow reference line.
26. **Settings Carriers panel** — note that "Connect" currently toast-stubs and does not open an OAuth flow.
27. **Fixture customer names appear in screenshots** (Con-form Group, Acme Steel, Pacific Fab, Hunter Steel). User docs should explain these are demo data.
