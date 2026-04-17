# Shop-Floor — User documentation audit

- **Audit date:** 2026-04-18
- **Auditor:** Claude Code (batch worker)
- **Source-of-truth references:**
  - Spec doc: **NOT PRESENT IN REPO** — see P0
  - Surfaces: `/floor`, `/floor/run/:workOrderId`, `/make/shop-floor`
  - Screenshots: `docs/audits/screenshots/shop-floor/` (1024×768 tablet + 1440×900 desktop)
  - Migrated docs: `docs/user/modules/shop-floor/floor-home.md`, `docs/user/modules/shop-floor/floor-run.md`
- **Context for the user:** the reader is an **operator on a tablet at a workstation**, usually with gloves on and a physical barcode wedge plugged in. They are not sat at a desk. They opened a kiosk URL and they need to clock in, pick a work order, and get to work. Docs must match that posture.

## Completeness findings

1. **No spec `.docx`.** User doc cannot lean on a design reference. Both migrated docs are auto-generated summaries. (**P0** — rubric.)
2. **`/make/shop-floor` has no user doc.** Only `/floor` and `/floor/run` have migrated docs. The operator view inside the main app shell (Make → Shop Floor) is undocumented for end users. (**P0**.)
3. **No task-oriented headings.** Both migrated docs have sections like "Summary / Route / User Intent / Primary Actions / Key UI Sections / Data Shown / States / Components Used / Logic / Behaviour / Dependencies / Design Notes". None of those are imperative. Users want "Clock in", "Pick a work order", "Scan a barcode", "Acknowledge a revision", "Log scrap", "Hand over to the next shift". (**P0**.)
4. **No numbered task steps.** Rubric says "Step guides must be numbered and short." Migrated docs have bullet lists that read as marketing blurb ("Operator-first kiosk surface with reduced office chrome"). (**P0**.)
5. **Barcode scanning not documented.** Recent commit integrated barcode support (shared `ScanInput` / `BarcodeScanner`). User doc never mentions scanners, wedge keyboards, or the format of a traveller barcode (WO-YYYY-NNNN or MO-YYYY-NNNN). (**P0**.)
6. **Tablet setup not documented.** No instructions for booting a kiosk tablet, bolting it to a station, or using the `?station=<machineId>` URL to preset the station. (**P1**.)
7. **Switch-operator / handover not documented.** `FloorRun.tsx` has `handleSwitchOperator` wired to a `HandoverSheet` component and a `pendingResumeWorkOrderId` pattern. End users will need to hand over a running job at shift change — not mentioned. (**P1**.)
8. **Revision acknowledgement not documented.** Screenshot shows a "REVISION ACKNOWLEDGEMENT REQUIRED — Rev B must be acknowledged before the job can continue" with a full-width yellow CTA. Critical floor interaction, not in docs. (**P0**.)
9. **First-off inspection / inspection sheet not documented.** `InspectionSheet.tsx` is a core component; the on-screen step at capture time was "Record first-off inspection". User doc silent. (**P1**.)
10. **Exception / defect logging not documented.** `ExceptionSheet.tsx` and `DefectReportModal.tsx` exist; user doc has nothing on logging a scrap/defect on the floor. (**P1**.)
11. **Reference workspace / CAD files not documented.** `ReferenceWorkspace.tsx`, `CadFileModal.tsx` — operators can pull up drawings / CAD during a run. Not in docs. (**P2**.)
12. **Who can see what role is not stated.** User doc should say: "Your shop-floor account is in the **team** group. You can clock in, run work orders and log defects. You cannot edit routings or see costs." (finding matches `project_access_role_vocab`). (**P1**.)
13. **Tier not stated.** Shop-Floor is almost certainly Produce+. User doc should have a tier badge and a one-line explanation of what Pilot tenants see (likely read-only or stub). (**P1**.)
14. **Offline behaviour not described.** Shop floor wifi drops. User needs to know what still works when the tablet loses connection. Doc does not address it. (**P1**.)
15. **No cross-reference between `/floor/run` and `/make/shop-floor`.** Leads and admins use the Make view to see what's running on each machine; operators use `/floor`. Both docs should explain when to use which. (**P1**.)

## Accuracy findings

16. **"Primary Actions" is filler.** Both docs list identical bullets ("Open related pages and record detail views. Progress kiosk flow from sign-in/station selection to work execution.") — generic, not accurate to what the operator can actually do on each screen. (**P1**.)
17. **"Key UI Sections" is a single filler line.** Actual `FloorRun` screen has: execution header with MO/WO/operator/machine, status badge, revision-ack banner, primary next-action card, current-step card, reference workspace, action console, switch-operator button. None listed. (**P1**.)
18. **"States" list wrong.** Lists `default / loading / error / success / mobile-responsive differences / populated` — the real observable user-facing states for `/floor/run/:workOrderId` are `loading the work order`, `unknown work order` (404 card), `needs revision acknowledgement`, `running current step`, `inspection required`, `exception raised`, `awaiting handover`. (**P1**.)
19. **"Data Shown" is partially wrong.** "Order headers, statuses, due dates, quantities, and values" — "values" (monetary) are not shown on floor screens, and due dates are also not present on the `FloorExecutionScreen` header. (**P2**.)

## Consistency findings

20. **Two docs, two voices.** `floor-home.md` and `floor-run.md` are nearly identical templates with the same filler bullets — neither reads like it was written for the actual screen. (**P1**.)
21. **"Kiosk" vs "Shop Floor" naming.** Sometimes "Floor", sometimes "Kiosk", sometimes "Shop floor". Pick one and stick to it — recommend "shop floor" in headings and "kiosk mode" in the one explanatory sentence about tablet posture. (**P2**.)
22. **Operator titles vs access roles.** Clock-in screen shows "CNC Operator / Machinist", "Welder / Boilermaker", "Quality Inspector". Per `project_access_role_vocab` the three access roles are admin / lead / team only. User doc must not imply "Operator" is an access role. (**P1**.)

## Style findings

23. **"Behavior" (US).** Both docs. Change to "Behaviour". Rubric mandates UK English. (**P2**.)
24. **Third-person summary sentences.** "Floor Home screen. Behavior is documented from current component implementation." Rewrite in 2nd-person imperative: "Use this screen to clock in at the start of a shift." (**P1**.)
25. **Marketing verbs.** Scan clean — no leverage / seamless / robust / empower / streamline / unlock / unleash. Good. (**P2**.)
26. **Stack names.** No Supabase / Convex / WorkOS / Resend / React / Zustand / Con-form Group found in the user docs. Keep it that way. (**P2**.)
27. **Emojis.** None. Keep. (**P2**.)

## Visual findings

Captures in `docs/audits/screenshots/shop-floor/` — two viewports per route:

- `floor-home-tablet-1024x768.png`, `floor-home-desktop-1440x900.png`
- `floor-run-WO-2026-0002-tablet-1024x768.png`, `floor-run-WO-2026-0002-desktop-1440x900.png`
- `make-shop-floor-tablet-1024x768.png`, `make-shop-floor-desktop-1440x900.png`

28. **`/floor` tablet view:** Three large operator tiles with photo/initials, role line, clean "Step 1 of 2 — Who's clocking in?" heading. Touch targets generous. Helper line "Don't see yourself? Ask a supervisor to be added to the shop floor roster." is exactly the right tone for the user doc. (**P2**: use this copy verbatim as a quoted example in the user doc.)
29. **`/floor/run` tablet view:** MO header clips to "MO-202…" at 1024×768 — minor but worth flagging. Yellow "Acknowledge revision" CTA uses dark text on yellow (compliant with memory). Touch targets on "Back to queue" and "Switch operator" chips look tight for gloved taps — recommend user doc mention "use the middle of the button". (**P1**.)
30. **`/make/shop-floor` tablet and desktop:** Both viewports render an **unhandled React error** (Maximum update depth exceeded). The page does not load at all in the current build. User cannot follow any user doc for `/make/shop-floor` until this is fixed (see dev audit P0.3). (**P0** for user-doc launch readiness.)
31. **No screenshots embedded in either user doc.** Must be remedied before publication — tablet users benefit disproportionately from annotated screenshots. (**P1**.)

## Gaps and recommendations

### P0 (blocking)

- **P0.1** Rewrite `floor-home.md` and `floor-run.md` with imperative, task-first headings:
  - "Clock in at the start of your shift"
  - "Pick which machine you're working on"
  - "Scan a traveller"
  - "Pick from the queue"
  - "Work through the current step"
  - "Acknowledge a revision"
  - "Record a first-off inspection"
  - "Log scrap or a defect"
  - "Switch operator at handover"
  - "Finish the job"
  - (findings #3, #4, #24)
- **P0.2** Create `docs/user/modules/shop-floor/make-shop-floor.md` covering the Make → Shop Floor view (machine grid, in-place overlay). Note the page is currently broken — see dev audit P0.3. (finding #2)
- **P0.3** Document the revision-acknowledgement flow in the run-screen doc. (finding #8)
- **P0.4** Document barcode scanning: "Scan the barcode at the top of your paper traveller. If it doesn't work, type the code (`WO-2026-0002`) and press Enter." (finding #5)
- **P0.5** Source or write the Shop-Floor spec referenced by the dev audit. User doc will copy examples from it. (finding #1)

### P1 (should fix before launch)

- **P1.1** Add a tablet setup section: "Bolt the tablet to the machine. Open `https://app.mirrorworks.com/floor?station=<your-machine-id>`." (finding #6)
- **P1.2** Switch-operator / handover note: "At shift change, tap **Switch operator**. The next operator clocks in and resumes the same work order." (finding #7)
- **P1.3** First-off inspection section referencing the on-screen CTA. (finding #9)
- **P1.4** Defect / scrap logging section. (finding #10)
- **P1.5** Role / group explainer: "Shop-floor accounts are in the **team** group." (findings #12, #22)
- **P1.6** Tier badge `Produce+` and a one-line tier note. (finding #13)
- **P1.7** Offline behaviour note (once confirmed with engineering). (finding #14)
- **P1.8** Operator vs lead cross-reference: "Operators use `/floor`. Leads use **Make → Shop Floor** to watch what's running on each machine." (finding #15)
- **P1.9** Rewrite all filler "Primary Actions / Key UI Sections" into accurate screen-by-screen copy. (findings #16, #17, #18)
- **P1.10** Third-person summary → 2nd-person imperative throughout. (finding #24)
- **P1.11** Flag MO-header clipping on tablet as a known display issue until fixed. (finding #29)
- **P1.12** Embed tablet screenshots inline in each user doc, with alt text, anchored to the step they illustrate. (finding #31)

### P2 (nice to have)

- **P2.1** Unify "Floor" / "Shop Floor" / "Kiosk" language. (finding #21)
- **P2.2** UK English (`Behaviour`). (finding #23)
- **P2.3** Drop "values" from Data Shown on floor-run. (finding #19)
- **P2.4** Quote the friendly "Ask a supervisor to be added to the shop floor roster" copy directly in the user doc's clock-in section. (finding #28)

## Tablet readability and scannability checklist

- Step guides must be numbered and short — currently failing for all tasks (no numbered steps exist). (finding #4)
- No hover-only interactions referenced — pass on principle, but docs never actually describe any interactions, so re-verify once rewritten. (Shop-Floor-specific flag #1)
- Right-click / small touch targets not mentioned — re-verify after P0.1 rewrite.
- `/floor/*` separate-layout context (no sidebar, tablet at workstation) must be the **first line of every shop-floor user doc**. Currently missing entirely. (Shop-Floor-specific flag #4, **P0**.)

## Metadata block (suggested for each rewritten user doc)

```
- Audience: shop-floor operators (team), shop leads for `/make/shop-floor`
- Tier: Produce+
- Device: tablet in kiosk mode at a workstation (1024×768 or larger)
- Prerequisites: operator added to shop-floor roster; tablet URL includes `?station=<machineId>`
- Related: docs/user/modules/make/*, docs/user/modules/shop-floor/make-shop-floor.md
```
