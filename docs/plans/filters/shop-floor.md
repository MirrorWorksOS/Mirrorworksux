# Shop-Floor / Floor — Filter, Search & View Migration Plan

**Status:** Proposal · **Date:** 2026-05-11 · **Owner:** Matt
**Pilot reference:** Sell module landed in `d4f0c565` (`apps/web/src/components/sell/SellOpportunities.tsx`)
**Audit source:** `docs/audits/dev/AUDIT-filters-shop-floor.md`
**Cross-doc:** `docs/plans/FILTERS-REDESIGN.md` §10 "Operator-mode collapse"

---

## 0. Paradigm — why this module is different

The shop-floor / floor surfaces are **operator-facing, touch-first, scan-first**. The Sell-pilot pattern (search + preset + 5–7 facet chips + `+ Filter` overflow + view-mode switcher) is **the wrong shape** here. Operators in gloves at a kiosk do not type, do not browse facet pickers, and do not switch view modes mid-shift.

We re-use the **same `FilterSchema` type** from `apps/web/src/components/shared/filters/schema.ts`, but each operator screen renders it in **collapsed mode**:

- 1–3 chip facets only, all declared `pinned: true, persistent: true`.
- No `+ Filter` overflow button.
- Search slot is replaced with `ScanInput` (pattern: `floor/FloorScanJob.tsx:129`).
- Smart-filter chip strip is replaced with **one AI hero card** ("Your next best job: WO-1234") above the list.
- View-mode switcher is hidden — each screen has one canonical operator view.
- Heights are kiosk-scale: 48–64 px touch targets (vs 40 px on desktop).
- Lead-shared presets become **shift defaults** pushed by the cell lead, not user-saved views.

Three-role vocab applies: **admin / lead / team** (operator == `team`).

---

## 1. Scope

Two component trees, two different problems:

| Tree | State | Action |
|---|---|---|
| `apps/web/src/components/floor/*` (`/floor/*` kiosk) | Already minimal — `FloorScanJob`, `FloorStationPicker`, `FloorClockIn`. No bad filter chrome. | Add: AI hero card on scan queue, station-picker presets, wire `IsometricFloorView` clicks. No filter-bar migration. |
| `apps/web/src/components/shop-floor/*` (office-embedded tabs under `/make/shop-floor`) | Drags desktop chrome (text search + chevron dropdowns + `h-10` buttons) onto tablets. `OverviewTab.tsx:294`, `WorkTab.tsx:121`, `QualityTab.tsx:474`. | Replace search with `ScanInput`, replace dropdowns with 1–3 pinned chip facets, bump heights, drop the stub `Filter` / `View` buttons. |

---

## 2. Screen-by-screen plan

### 2.1 `floor/FloorScanJob.tsx` — Scan queue

**Header**
- File: `apps/web/src/components/floor/FloorScanJob.tsx`
- Current state: `ScanInput` already in place (`:129`). Queue is sequence-sorted, no filters. `min-h-[88px]` queue cards — correct kiosk scale.
- Gap: no "next best job" AI hero. Operator can't toggle ready-vs-blocked. Lead can't push a shift default that hides other operators' work.

**Minimal filter schema**

```ts
const floorScanJobSchema: FilterSchema = {
  module: "floor.scan-job",
  label: "Scan queue",
  facets: [
    {
      id: "scope",
      label: "My station only",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: MapPin,
    },
    {
      id: "readiness",
      label: "Ready",
      kind: "select",
      pinned: true,
      persistent: true,
      icon: CheckCircle2,
      options: [
        { value: "all", label: "All" },
        { value: "ready", label: "Ready" },
        { value: "blocked", label: "Blocked" },
      ],
    },
    {
      id: "priority",
      label: "Priority hot",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: Flame,
      // iconTone: "error" — red dot when ON
    },
  ],
  viewModes: [{ id: "list", label: "Queue", icon: List }],
  defaultView: "list",
  // No `smart` chip strip — AI surfaces as hero card instead.
};
```

Scan input config (replaces search slot):

```ts
{
  scanInput: {
    size: "large",
    placeholder: "Scan or type WO-2026-0002…",
    pattern: /^(WO|MO)-\d{4}-\d{4}$/,
  }
}
```

**Touch-target sizing**
- Scan input: existing `size="large"` (≈ 64 px). Keep.
- Filter chips: **56 px** height (`h-14`), 20 px text, 24 px icon.
- Queue cards: keep `min-h-[88px]`.

**AI hero**

A single card *above* the queue, *below* the scan input:

```
┌─────────────────────────────────────────────────┐
│ [Star] Next best for you                        │
│ WO-2026-0007 · Bracket weld-up · seq 3          │
│ Material ready · ~42 min cycle · due 14:30      │
│                          [ Start now → ]        │
└─────────────────────────────────────────────────┘
```

Natural-language queries that belong here (operator-spoken, no chip):
- "what's next on my station?"
- "anything blocked on my queue?"
- "skip the one waiting on material"

Implementation: re-use the existing AI service surface; render once per queue load, refresh on scan or queue update.

**Required wiring**
- Add the schema-driven 3-chip bar above the queue header (`:148-158`).
- Add AI hero card between scan input (`:141`) and queue section (`:144`).
- Hook chip state into the existing `queue` filter logic.
- Persist `scope` / `priority` toggle state per-operator in session (already keyed on `session.stationName`).

**Out of scope**
- View-mode switcher — single canonical list.
- Free-text search — `ScanInput` only.
- `+ Filter` overflow.
- Saved-view dropdown — replaced by shift-default model (§3).
- Smart-suggestion chip strip — replaced by hero card.

---

### 2.2 `floor/FloorStationPicker.tsx` — Station picker

**Header**
- File: `apps/web/src/components/floor/FloorStationPicker.tsx`
- Current state: stations auto-grouped by `workCenter` (`:84`). No filters. Avatar-tile grid.
- Gap: no "my work centre" collapse, no shift-default template row.

**Minimal filter schema**

```ts
const floorStationPickerSchema: FilterSchema = {
  module: "floor.station-picker",
  facets: [
    {
      id: "workCenter",
      label: "My work centre",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: Layers,
    },
    {
      id: "available",
      label: "Available only",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: Circle,
    },
  ],
  viewModes: [{ id: "card", label: "Stations", icon: Grid3x3 }],
  defaultView: "card",
};
```

No `ScanInput` on this screen — operators pick by sight (kiosk distance, recognition over recall — same principle as `FloorClockIn`).

**Touch-target sizing**
- Filter chips: **56 px**.
- Station tiles: `min-h-[180px]` (match `FloorClockIn.tsx:215`).

**AI hero**
- "Resume your last station: CNC-04" — a single restore-card if the operator clocked in within the last 4 h.
- NL queries: "where was I working yesterday?", "any open job on my last station?"

**Required wiring**
- Add chip bar above the work-centre group headings.
- Add a **template row** (per audit §6) above the stations: 2–4 lead-curated shift templates (e.g. "Day-shift CNC cell setup", "Welder station view"). Tap = picks station + applies role-template defaults in one tap.

**Out of scope**
- Search input of any kind.
- View modes (grid only).
- `+ Filter` overflow.

---

### 2.3 `floor/IsometricFloorView.tsx` — Isometric map (currently dead-end)

**Header**
- File: `apps/web/src/components/floor/IsometricFloorView.tsx`
- Current state: clicking a machine fires a toast (`:280`). Read-only.
- Gap: not a navigable picker.

**Minimal filter schema**

```ts
const floorIsoSchema: FilterSchema = {
  module: "floor.isometric",
  facets: [
    {
      id: "status",
      label: "Status",
      kind: "multi",
      pinned: true,
      persistent: true,
      icon: Activity,
      options: [
        { value: "running", label: "Running", color: "var(--success-500)" },
        { value: "idle", label: "Idle", color: "var(--neutral-400)" },
        { value: "blocked", label: "Blocked", color: "var(--error-500)" },
        { value: "down", label: "Down", color: "var(--warning-500)" },
      ],
    },
    {
      id: "myCell",
      label: "My cell",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: MapPin,
    },
  ],
  viewModes: [{ id: "map", label: "Floor map", icon: Map }],
  defaultView: "map",
};
```

**Touch-target sizing**
- Chip overlay (top-left of viewport): **48 px** (`h-12`) — smaller than action screens because the viewport itself is the primary surface.
- Machine click hit-targets: already mesh-based; no change.

**AI hero**
- Bottom-sheet style summary card on tap: "CNC-04 — Running WO-2026-0012, on cycle. Operator: J. Lee. Tap to open station."
- NL queries: "show me everything blocked", "which cell is behind today?"

**Required wiring**
- Replace toast at `:280` with navigation to `FloorScanJob` for the clicked machine's station (admin/lead only — operators don't roam).
- Gate the navigate behavior on session role: `team` keeps the toast (don't jump them off their station), `lead` and `admin` navigate.
- Add status chip overlay in the top-left of the canvas. Dim mesh blocks whose status is filtered out.

**Out of scope**
- Search.
- View-mode switcher (map is the view).
- `+ Filter` overflow.

---

### 2.4 `shop-floor/OverviewTab.tsx` — Office-embedded "Overview"

**Header**
- File: `apps/web/src/components/shop-floor/OverviewTab.tsx`
- Current state: search box + three chevron-dropdown stubs (Status / Priority / Machine) at `:294`. "Floor Mode" toggle at `:150`. 14-row table.
- Gap: pure desktop chrome on what is a tablet/wall-mount surface. Operators don't filter by Machine — they ARE the machine.

**Minimal filter schema**

```ts
const shopFloorOverviewSchema: FilterSchema = {
  module: "shop-floor.overview",
  facets: [
    {
      id: "shift",
      label: "Shift",
      kind: "select",
      pinned: true,
      persistent: true,
      icon: Clock,
      options: [
        { value: "day", label: "Day" },
        { value: "swing", label: "Swing" },
        { value: "night", label: "Night" },
      ],
    },
    {
      id: "scope",
      label: "My cell",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: Layers,
    },
    {
      id: "status",
      label: "Status",
      kind: "multi",
      pinned: true,
      persistent: true,
      icon: Activity,
      options: [
        { value: "running", label: "Running" },
        { value: "blocked", label: "Blocked" },
        { value: "late", label: "Late" },
      ],
    },
  ],
  viewModes: [{ id: "list", label: "Office", icon: List }],
  defaultView: "list",
};
```

Replace `Input` search at `:289-292` with `ScanInput` (size `medium`, ≈ 56 px). Drop the three chevron buttons at `:294-303` and the inline "Floor Mode" toggle at `:150` (mode-switch belongs at `FloorModeLayout` per audit).

**Touch-target sizing**
- Scan input: **56 px** (medium).
- Filter chips: **56 px** (`h-14`) — chip-with-checkmark, not chevron-dropdown.
- Row cards: keep current.

**AI hero**
- Single supervisor card: "3 work orders trending late this shift. Tap to expedite."
- NL queries: "what's slipping?", "anything blocked > 30 min?", "where do I need a tow operator?"

**Required wiring**
- Remove the Status / Priority / Machine buttons (`:294-303`).
- Swap `Input` (`:289`) → `ScanInput`.
- Remove the embedded "Floor Mode" toggle (`:150`); rely on `FloorModeLayout` instead.
- Wire chip values into the table filter (the table is already client-side).

**Out of scope**
- View-mode switcher.
- `+ Filter` overflow.
- Date range chip (covered by Shift).
- Saved-view dropdown — replaced by shift defaults (§3).

---

### 2.5 `shop-floor/WorkTab.tsx` — MO → WO accordion

**Header**
- File: `apps/web/src/components/shop-floor/WorkTab.tsx`
- Current state: `h-10` search + stub Filter + stub View buttons at `:121-128`. Sub-44 px, no logic wired.
- Gap: same as Overview, smaller in scope.

**Minimal filter schema**

```ts
const shopFloorWorkSchema: FilterSchema = {
  module: "shop-floor.work",
  facets: [
    {
      id: "scope",
      label: "My cell",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: Layers,
    },
    {
      id: "readiness",
      label: "Readiness",
      kind: "select",
      pinned: true,
      persistent: true,
      icon: CheckCircle2,
      options: [
        { value: "all", label: "All" },
        { value: "ready", label: "Ready" },
        { value: "blocked", label: "Blocked" },
      ],
    },
  ],
  viewModes: [{ id: "tree", label: "MO → WO", icon: List }],
  defaultView: "tree",
};
```

Replace search with `ScanInput` (when an operator/lead scans a WO, the accordion expands directly to it).

**Touch-target sizing**
- Scan input: **56 px**.
- Filter chips: **56 px**.
- MO row: existing `p-6` is fine; keep.

**AI hero**
- "MO-26-401 is 38 min behind plan. Tap to see why." Single card above the accordion.

**Required wiring**
- Remove `h-10` Filter + View stub buttons (`:122-127`).
- Swap `Input` (`:116`) → `ScanInput`; on scan, expand the matching MO + scroll to the WO.
- Wire chip state into the `MOCK_DATA.filter(...)` at `:133`.

**Out of scope**
- View-mode switcher (single tree view).
- `+ Filter` overflow.

---

### 2.6 `shop-floor/QualityTab.tsx` — Quality pills + Active Issues

**Header**
- File: `apps/web/src/components/shop-floor/QualityTab.tsx`
- Current state: `PillNav` (Overview / Active Issues / Inspections / Reports). Active Issues sub-tab at `:474` has `h-10` Input + Status + Priority buttons. Inspections sub-tab has 5-pill type row at `:559`. "Today/Week/Month" pills at `:381`.
- Gap: tablet-hostile heights, awkward 5-pill wrap, time-range pills should default to "my shift".

**Minimal filter schema** (Active Issues sub-tab)

```ts
const shopFloorQualitySchema: FilterSchema = {
  module: "shop-floor.quality.active-issues",
  facets: [
    {
      id: "shift",
      label: "My shift",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: Clock,
    },
    {
      id: "scope",
      label: "Awaiting me",
      kind: "boolean",
      pinned: true,
      persistent: true,
      icon: UserCheck,
    },
    {
      id: "severity",
      label: "Severity",
      kind: "select",
      pinned: true,
      persistent: true,
      icon: AlertTriangle,
      options: [
        { value: "critical", label: "Critical" },
        { value: "major", label: "Major" },
        { value: "minor", label: "Minor" },
      ],
    },
  ],
  viewModes: [{ id: "list", label: "Issues", icon: List }],
  defaultView: "list",
};
```

For Inspections sub-tab, collapse the 5-pill type row (`:559`) into a single **`Type` select chip** (`pinned: true, persistent: true`) with the 5 options inside. The CTA "Start inspection" becomes the primary action; type is context-derived from the scanned traveler when present.

**Touch-target sizing**
- Scan input (Active Issues + Inspections): **56 px**.
- Filter chips: **56 px**.
- Replace `h-10` Input/Buttons at `:474-481`.

**AI hero**
- "AI-suggested NCR on WO-2026-0011 — visual defect at op 30. Tap to triage." (Already present at `:147` — promote into hero slot on the run screen too, per audit §7.5.)

**Required wiring**
- Swap `Input` (`:475`) → `ScanInput`. Scanning a serial or WO jumps to its issue (or pre-fills "Log new issue").
- Drop `h-10` Status / Priority buttons (`:477-478`); replace with the 3-chip bar above.
- Drop Today/Week/Month pills (`:381`); use `shift: 'my-shift'` default.
- Collapse the 5-pill type row to one chip select.
- Keep the AI sheet button at `:494-499` as-is.

**Out of scope**
- View-mode switcher.
- `+ Filter` overflow.
- Date range chip (Shift handles it).

---

## 3. Operator preset model — shift defaults, not saved views

On desktop (Sell pilot), presets are user-saved combinations of facet values + view mode. **On the floor that model inverts**:

1. **Operators don't save presets.** They land on whatever default the cell lead has pinned for the group.
2. **Leads (`role: lead`) pin a `SavedView` with `scope: "group"` and `isDefault: true`.** That becomes the **shift default** for every operator in that group.
3. **Operators see chip values pre-applied.** No preset dropdown is rendered on operator surfaces — the chips themselves show the active state, and tapping clears/changes the inherited value for that session only (next clock-in re-applies the lead default).
4. **Admin can override per work-centre.** Same schema mechanism; `scope: "org"` for site-wide defaults like "Night-shift skeleton crew".

Mapping onto the existing `SavedView` type (`schema.ts:150`):

| Field | Operator semantic |
|---|---|
| `scope: "group"` | Pushed to every operator in that Control.Group |
| `groupId` | Cell / work-centre group from `ControlGroups` |
| `isDefault: true` | Lands as the active state on clock-in |
| `pinned: true` | Surfaces as a template row on `FloorStationPicker` |
| `icon: LucideIcon` + `iconTone` | Lead picks (no emoji on operator-facing presets — Lucide only) |
| `state.values` | Pre-applied chip values; `state.view` ignored (operator surfaces have one view) |
| `state.search` | Ignored (scan only) |

**Audit §6 templates → concrete presets:**

| Template | Schema target | `state.values` |
|---|---|---|
| Day-shift CNC cell setup | `floor.station-picker` | `{ workCenter: true, available: false }` + lands on `floor.scan-job` with `{ scope: false, readiness: "all", priority: false }` |
| Welder station view | `floor.scan-job` | `{ scope: true, readiness: "ready", priority: false }` + suppress AI hero except safety |
| QC inspector roaming | `shop-floor.quality.active-issues` | `{ shift: true, scope: true, severity: "critical" }` |
| Night-shift skeleton crew | `shop-floor.overview` | `{ shift: "night", scope: false, status: ["blocked","late"] }` + audible andon |
| Goods-in / receiving | `floor.scan-job` | locked to receiving station; queue hidden, scan-only |

**UX rules**
- Lead's "Save view" button (where it appears at all) writes `scope: "group"` by default — desktop pattern of "Personal / Group / Org" tabs collapses to a single radio for floor-facing schemas.
- When a group default updates, currently-clocked operators see a toast: *"Cell lead updated your shift default — refresh queue?"* — never a forced reload mid-job.
- Operator-cleared chip values reset on next clock-in. Lead-curated state always wins on session start.
- No personal preset surface on floor screens. If a `team`-role user tries to save a view (they shouldn't see the button), reject server-side.

---

## 4. Cross-cutting

### 4.1 `FloorModeLayout` chrome (out of scope of any one screen)

Per audit §5, persistent toggles for lead/admin roving role belong in `apps/web/src/components/floor/FloorModeLayout.tsx:71`, not per-tab:

- **Shift chip** (Day / Swing / Night)
- **Station chip** (tap to swap station without leaving floor mode)
- **My-only toggle**
- **Voice-ready chip**

These render in the status bar and survive route changes. They feed the same `scope` / `shift` facet values the screen schemas read.

### 4.2 Big-board route

`OverviewTab.tsx:170`'s "Floor Mode" big-tile view should be promoted out of the tab and into its own `/floor/board` route for wall-mount kiosks (per audit §4). Different schema again: zero filters, AndonTopBar variant at 96 px height (per audit §8).

### 4.3 Lucide-only, dark-text-on-yellow

All icons referenced above (`MapPin`, `CheckCircle2`, `Flame`, `Layers`, `Clock`, `Activity`, `AlertTriangle`, `UserCheck`, `List`, `Map`, `Grid3x3`) are Lucide. No emoji on operator surfaces. Where `iconTone: "yellow"` applies (e.g. AI hero card highlight), use dark icon + dark text per `MEMORY.md` rule.

---

## 5. Rollout

Per `FILTERS-REDESIGN.md` §11, shop-floor lands in phase 6 (after Sell pilot, Buy + Book, Make + Plan, Ship). Suggested PR sequence within the module:

1. **PR 1 — shared collapsed-bar variant.** Add a `ModuleFilterBar` rendering mode `mode: "operator"` that: hides `+ Filter`, hides preset dropdown for `team` role, swaps search slot for `ScanInput`, enforces 56 px chip height. Live behind a flag.
2. **PR 2 — `FloorScanJob` + AI hero.** Lowest risk, highest visible win.
3. **PR 3 — `FloorStationPicker` template row + `IsometricFloorView` navigable picker.** Both wire-ups.
4. **PR 4 — Shop-floor tabs (Overview, Work, Quality).** Bulk swap of desktop chrome.
5. **PR 5 — `FloorModeLayout` persistent chrome (shift / station / my-only / voice).**
6. **PR 6 — `/floor/board` big-board route.**
7. **PR 7 — Shift-default preset wiring** (`SavedView` with `scope: "group"`, lead UI to push). Depends on SavedView storage being server-backed (open question in §12 of cross-doc).

---

## 6. References

- Audit: `docs/audits/dev/AUDIT-filters-shop-floor.md`
- Cross-module plan §10: `docs/plans/FILTERS-REDESIGN.md`
- Schema types: `apps/web/src/components/shared/filters/schema.ts`
- Sell pilot reference: `apps/web/src/components/sell/SellOpportunities.tsx`
- Scan input pattern: `apps/web/src/components/floor/FloorScanJob.tsx:129`
- Iso click handler to rewire: `apps/web/src/components/floor/IsometricFloorView.tsx:280`
- Shop-floor tabs to migrate: `apps/web/src/components/shop-floor/OverviewTab.tsx:294`, `WorkTab.tsx:121`, `QualityTab.tsx:474`
- Role vocab: `MEMORY.md` → "Access role vocabulary" (admin / lead / team)
