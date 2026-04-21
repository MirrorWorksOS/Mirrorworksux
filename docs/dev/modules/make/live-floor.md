# Live Floor

## Summary
Wall-display Andon board for the shop floor. Designed for a 3–10m viewing distance on a mounted TV — **not** a desk browser. Lives as the "Live floor" tab on the Make dashboard.

## Route
`/make` (tab: `live-floor`) — rendered by `MakeDashboard.tsx` when `activeTab === 'live-floor'`

## User Intent
Keep the whole shop floor glanceable from a distance: who is on track, which machines are running, which operators are going over estimate, how much of the shift is left.

## Design Constraints (important)
- **Viewing distance 3–10m.** Typography is 2–6× larger than the rest of the app:
  - Shift clock: 72px
  - Operator hero timer: 56px
  - Machine card name: 30px
  - Status labels: 24px
  - Progress bars: 16px
- **Forced dark theme.** The root wraps children in `className="dark"` with a full-bleed `var(--neutral-950)` background (`-m-8` cancels `ModuleDashboard`'s padding). Reduces glare under factory lighting regardless of app-level theme.
- **One-signal-per-card colour semantics.** No dual meanings:
  - Running → green (`var(--mw-success)`)
  - Idle → yellow (`var(--mw-yellow-400)`)
  - Setup → amber (`var(--mw-amber)`)
  - Down → red (`var(--mw-error)`)
  - Maintenance → neutral dark
  - Time state (operator): under 80% → green bar, 80–100% → yellow, over → red card bg + `animate-pulse`

## Key UI Sections (top to bottom, priority order)
1. **Shift header** — live clock, shift name, remaining time, on-track ratio
2. **Summary ribbon** — 5 coloured machine-status pills with counts
3. **Machine Andon grid** — full-colour card per machine (2–3 cols)
4. **Operator grid** — big timer + progress bar per active operator (2–3 cols)

## Data Shown
- Active operators (`activeOperators` mock; `ActiveOperator` type in `services/mock/data.ts`)
  - name, initials, WO number, operation, machine, `estimatedMinutes`, `startedAt` (ISO), status
- Machines (`machines` / `Machine` type) — existing Andon data
  - id, name, workCenter, status, `currentJobNumber`, `operatorName`, `utilizationToday`

## Live ticker
```ts
const [now, setNow] = useState(() => Date.now());
useEffect(() => {
  const id = setInterval(() => setNow(Date.now()), 1000);
  return () => clearInterval(id);
}, []);
```
`now` is passed into `OperatorCard` for elapsed-minute recalculation and into `ShiftHeader` for the clock + remaining-time computation.

## Components Used
- `@/components/ui/card` — `Card`
- `@/components/ui/utils` — `cn`
- `@/services` — `activeOperators`, `machines`, `ActiveOperator`
- `@/types/entities` — `Machine`
- `@/types/common` — `MachineStatus`
- `lucide-react` — `CheckCircle2`, `Clock`, `AlertTriangle`, `Wrench`, `Zap`, `Activity`

## States
- default
- populated (mock data always present; empty states not yet designed)

## Logic / Behaviour
- Self-contained — owns its own 1s ticker, derives on-track / counts from mock arrays.
- Re-renders every second while tab is visible; acceptable given ≤8 cards and no network I/O.
- `getTimeState(ratio)` classifies operators as `on-track | near | over` based on `elapsed / estimated`.
- `SHIFT` config (endHour, endMinute, name) is a module-local constant for the prototype — needs to move to shift-scheduling service once real data is wired.

## Dependencies
- No stores/services/hooks — pure mock + local state.

## Known Gaps / TODO
- Shift data is hardcoded (`SHIFT` constant). Real impl should come from `controlService.getCurrentShift()` or similar.
- No pagination / rotation when operator count exceeds ~9 cards (wall display ergonomics).
- No sound/animation triggers on state transitions (e.g. flash when a machine goes `down`).
- Typography sizes are hardcoded in JSX. Extract to a `live-floor-typography` token set if a second wall view is built.
- Dark-mode lock uses `.dark` class + full-bleed bg; verify with the app's `ThemeProvider` if it's ever toggled dynamically.

## Related Files
- `apps/web/src/components/make/LiveFloorView.tsx`
- `apps/web/src/components/make/MakeDashboard.tsx` — hosts the tab
- `apps/web/src/services/mock/data.ts` — `activeOperators` + `machines`
- `apps/web/src/types/entities.ts` — `Machine` interface
- `apps/web/src/types/common.ts` — `MachineStatus` union
