# Shop-Floor / Floor — Filter, Search & View UX Audit

Operator-facing surfaces split across two trees:

- `apps/web/src/components/floor/` — the canonical kiosk/tablet experience (`/floor/*`). No sidebar, no banners, no agent FAB — see `FloorModeLayout.tsx:39`.
- `apps/web/src/components/shop-floor/` — the office-embedded "shop-floor" overlay (tabs reachable from `/make/shop-floor`). This is more of a supervisor/lead view that *also* gets reused inside `FloorRun` for the canonical work-order execution screen.

The two surfaces serve different users (operator at machine vs. lead at desk) and the filter UX should diverge accordingly. Today the kiosk tree is appropriately minimal; the `shop-floor/` tab tree drags too much desktop filter chrome into a touch context.

---

## 1. Current filters, search & view modes

| Surface | File | Filters / Search | View toggles |
|---|---|---|---|
| `/floor` entry funnel | `floor/FloorHome.tsx:32` | none (it's a gated state machine: clock-in → station → scan) | n/a |
| Clock-in operator picker | `floor/FloorClockIn.tsx:192` | none — face grid, recognition over recall | n/a |
| Station picker | `floor/FloorStationPicker.tsx:71` | none; auto-grouped by `workCenter` (`floor/FloorStationPicker.tsx:84`) | grid only |
| Scan / Queue | `floor/FloorScanJob.tsx:30` | scan input (barcode = keyboard); no search/filter on the queue list | list only, sorted by `sequence` |
| Work-order run | `floor/execution/FloorExecutionScreen.tsx` + `WorkOrderFullScreen.tsx` | none — single-job focus | reference panel segment toggle: drawing / 3D / SOP (`execution/ReferencePanel.tsx`) |
| AndonTopBar | `floor/execution/AndonTopBar.tsx:36` | persistent: machine, operator, cycle vs target, sync state, theme toggle | n/a |
| Isometric floor map | `floor/IsometricFloorView.tsx:53` | none — passive 3D viewport, hover/click only | isometric only (no list fallback in same surface) |
| **Overview tab** | `shop-floor/OverviewTab.tsx:286` | search box + Status / Priority / Machine dropdown stubs (`OverviewTab.tsx:294`); also a "Floor Mode" toggle (`:150`) that swaps to a dark KPI tile view | Office View ↔ Floor Mode (dark, big tiles) |
| Work tab | `shop-floor/WorkTab.tsx:111` | search box + Filter + View buttons (stubs, no logic) | nested MO → WO accordion only |
| Quality tab | `shop-floor/QualityTab.tsx:265` | `PillNav` (Overview / Active issues / Inspections / Reports); per-tab filter pills ("Today/Week/Month", "All Types/First Article/…"); search + Status/Priority dropdowns on Active Issues (`:474`) | n/a |
| Issues tab | `shop-floor/IssuesTab.tsx` | no filters — large issue-type tiles + alert list | tile dashboard |
| Time clock | `shop-floor/TimeClockTab.tsx:22` | none — single operator clock state | single view |
| Intelligence Hub | `shop-floor/IntelligenceHubTab.tsx:298` | scrollable filter chips: All / Critical / Efficiency / Quality / Scheduling | feed cards |
| Voice mobile | `shop-floor/VoiceInterfaceMobile.tsx:15` | none — push-to-talk | full-screen |

---

## 2. Irrelevant / inherited-from-desktop filters

| Filter | Where | Why it doesn't belong on a tablet |
|---|---|---|
| "Status" + "Priority" + "Machine" filter dropdowns | `shop-floor/OverviewTab.tsx:294-303` | 14-row table is supervisor surface, but the dropdowns are pure desktop chrome (`ChevronDown` triggers, no chip preview, no count badges). Operator at machine doesn't filter by machine — they ARE the machine. |
| Generic "Filter" + "View" buttons | `shop-floor/WorkTab.tsx:121-128` | Stubs with no behaviour; "View" with no view modes wired up. |
| Search box on Work / Overview / Quality | `WorkTab.tsx:115`, `OverviewTab.tsx:288`, `QualityTab.tsx:475` | Operators don't type. Search must be barcode-scan first (the FloorScanJob pattern in `floor/FloorScanJob.tsx:64` is the right model). |
| "Today / This Week / Month" pills | `shop-floor/QualityTab.tsx:381` | Operator doesn't pick a time range — system should default to "my shift". |
| "All Types / First Article / In-Process / Final / Receiving" inspection pill row | `QualityTab.tsx:559` | 5 long-label pills wrap awkwardly on tablet; better as a single primary CTA with type pre-selected by context. |
| Floor Mode toggle button (`OverviewTab.tsx:156`) | OverviewTab header | Mode-switch belongs at app shell level (`FloorModeLayout`), not buried in a tab header. |

---

## 3. Recommended filters per operator screen (1–3 max each)

| Screen | Quick filter 1 | Quick filter 2 | Quick filter 3 |
|---|---|---|---|
| `FloorScanJob` queue (`floor/FloorScanJob.tsx`) | **My station only** (default ON, derived from session) | **Ready vs blocked** (hide waiting-on-material) | **Priority hot** (red dot only) |
| Station picker (`floor/FloorStationPicker.tsx`) | **My work centre** (collapse other groups) | **Available** (hide running by others) | — |
| Quality / hold list | **My shift** | **My machine** | **Awaiting me** (assigned to my role) |
| Issues / Andon | **My station / cell** | **Active vs resolved** | — |
| Intelligence Hub feed | **Affects my next job** | **Critical** | — |

Search across all of the above should be replaced by a single floating "Scan / type WO" affordance that uses the same `ScanInput` already present at `floor/FloorScanJob.tsx:129`.

---

## 4. Recommended view modes — and where they are missing

| Operator view mode | Where it lives today | Gap |
|---|---|---|
| **Single-task "now" card** | `floor/execution/FloorExecutionScreen.tsx` — exists and is the canonical surface | Good. No gap. |
| **Queue (list, sequence-ordered)** | `floor/FloorScanJob.tsx:175` | Exists but only as a pre-pick screen. No way to flip *back* to the queue from an in-flight job without closing the run. Add a "next 3" peek slot inside the run header. |
| **Station kanban (cell-level "what's at my cell")** | Not present | Missing. `IsometricFloorView` shows machines but not WO-by-station columns. Useful for cell-lead view. |
| **Isometric floor map** | `floor/IsometricFloorView.tsx` | Exists but is read-only and only used for browsing. Not wired as a *pick* surface — tapping a machine should let a roving lead jump to that station's queue. Today it only fires a `toast` (`IsometricFloorView.tsx:280`). |
| **Voice / scan-first "what's next"** | `shop-floor/VoiceInterfaceMobile.tsx` | Voice modal exists but is not wired into FloorScanJob. Operator with greasy gloves should be able to say "What's next on my station?" from the queue screen. |
| **Big-board / kiosk dashboard** | `shop-floor/OverviewTab.tsx:170` ("Floor Mode") | Exists as a toggle but lives inside the office overlay. Should be its own `/floor/board` route for wall-mounted TVs. |
| **Lead "expedite" view** | Not present | A cross-station Gantt or list filtered by "late or trending-late". |

---

## 5. Persistent quick toggles for the kiosk top bar

`AndonTopBar` (`floor/execution/AndonTopBar.tsx:36`) currently shows: back button, operator avatar, machine + WO + product, status pill, cycle vs target, sync state, theme toggle.

Suggested *persistent* toggles to add (lead/roving roles only — operator running a job should not be distracted):

- **Shift** chip (Day / Swing / Night) — pre-resolves "today" everywhere downstream.
- **Station** chip — already implicit in `session.stationName` (see `floor/FloorModeLayout.tsx:94`), but should be tappable to swap without leaving floor mode.
- **My-only** toggle — when ON, queue / issues / quality lists hide other operators' work.
- **Voice-on** chip (mic-ready indicator) — current mic UI is modal-only (`VoiceInterfaceMobile.tsx`), should have a persistent ready-state pill.

These belong in the `FloorModeLayout` status bar (`FloorModeLayout.tsx:71`), not in each tab — putting them in the chrome guarantees they survive route changes.

---

## 6. Preset opportunities — "shift defaults", not saved filters

Operator presets are really *role × station × shift* defaults, ideally lead-curated and pushed to the kiosk:

1. **Day-shift CNC cell setup** — station group = "CNC", my-only OFF (cell lead sees all), shift = day, queue ordered by promise date.
2. **Welder station view** — single station, scan-first, hide blocked, suppress AI insights other than safety.
3. **QC inspector roaming** — filter = `quality-hold OR awaiting first article`, sorted by hold-age desc.
4. **Night-shift skeleton crew** — multi-station view (operator covers 3 machines), big-card mode, audible andon on blocked.
5. **Goods-in / receiving** — locked to receiving station, scan-only, no work-order list.

Implementation hint: presets should be selectable on the station picker (`FloorStationPicker.tsx`) as an extra "view template" row so the operator picks station + role-template in one tap.

---

## 7. Smart / AI assists worth building on the floor

1. **"What's next best for me?"** — given operator skills (from `Employee`), current station, queue and material readiness, recommend the highest-EV next WO. Surface as a single hero card on `FloorScanJob` above the queue.
2. **Pre-flight "likely-late" flag** — before operator hits Start on a WO, AI predicts overrun from cycle history at this station × this product × this operator. Inline in `PrimaryActionCard` (`floor/execution/PrimaryActionCard.tsx`).
3. **Voice "where's my material?"** — wire `VoiceInterfaceMobile.tsx` into the materials pick list (`floor/execution/MaterialsPickListCard.tsx`) so operators with gloves don't have to scroll.
4. **Auto-route blocked WOs** — when a WO trips a quality hold or material short, AI suggests the next ready WO at the same station and hot-swaps it in the queue.
5. **Visual defect pre-flag** — `QualityTab` already shows an "AI Suggested NCR" (`shop-floor/QualityTab.tsx:147`); extend that to the operator run screen so they see a vision-system flag *before* they hit "complete unit".
6. **Shift-handover summary** — at clock-out, AI drafts a one-line handover note from the session's events (units, holds, NCRs). Pre-fill the `onSwitchOperator(handoverNote)` callback already plumbed in `floor/FloorRun.tsx:90`.

---

## 8. Touch-target & kiosk-distance concerns

- `OverviewTab.tsx:295` — three filter `Button`s use `h-14` (good), but the chevron dropdown affordance is `w-4` — barely tappable with gloves. Convert to chip-with-checkmark, not chevron-dropdown.
- `WorkTab.tsx:122` — Filter / View buttons are `h-10`, below the 44 px touch minimum. Compare to FloorScanJob queue cards at `min-h-[88px]` (`floor/FloorScanJob.tsx:183`) — that's the correct kiosk scale.
- `IntelligenceHubTab.tsx:343` — filter chip row is `overflow-x-auto` which means filters can be hidden off-screen on a 10" tablet. Either elevate to top 3 chips + "More" sheet, or stack vertically.
- `QualityTab.tsx:381` — Today/Week/Month pills are rendered as bare `<button>`s with no explicit height — tiny on tablet.
- `QualityTab.tsx:474` — inline `<Input>` at `h-10`, hidden on the touch-first tablet; readable but not tappable from arms-length.
- `OverviewTab.tsx:152` — "Floor Mode" toggle reads `h-14` but ships `text-sm` for the label; from 80 cm wall-mount distance the icon dominates and the label disappears. Bump to `text-base` on the floor variant.
- `AndonTopBar.tsx:53` — overall 64 px height is fine for tablet but a wall-mounted big-board needs a 96 px+ variant; current chrome doesn't scale.
- `FloorClockIn.tsx:215` — operator avatar tiles are `min-h-[180px]` and `w-20 h-20` avatars — excellent kiosk scale, use as the reference for other lists.

---

## Summary

The kiosk-side `floor/*` tree is correctly minimalist — its real gaps are *missing* surfaces (cell kanban, big-board route, persistent shift/station chips, voice-into-pick-list) rather than over-filtering. The `shop-floor/*` tab tree, by contrast, has imported desktop search + dropdown chrome (`OverviewTab`, `WorkTab`, `QualityTab`) that is too dense and untyped for tablets and should be replaced with 1–3 chip filters per screen with "my-station / my-shift / ready-vs-blocked" defaults. The biggest single wins are: (1) wire `IsometricFloorView` as a navigable picker, (2) replace text search with scan-first everywhere, (3) move the shift/station/my-only toggles into `FloorModeLayout` so they survive route changes, and (4) deliver a real "what's next best for me" AI hero card on `FloorScanJob`.
