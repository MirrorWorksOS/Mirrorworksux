# Live Floor (wall display)

## Summary
A manager- and operator-facing view of the whole shop floor, designed to be shown on a mounted TV or projector in the factory. Read it from across the room.

## Route
`/make` → click the **Live floor** tab.

## When to use it
- Mount on a wall or large monitor in the workshop
- Supervisors glancing at the floor while walking past
- Shift handover — one glance shows who's on track, what's down, how much time is left in the shift

## What you see (top to bottom)

### 1. Shift header
- **Big clock** (updates every second) and current shift name
- **Remaining time** in the shift
- **Operators on track** — e.g. "6 / 7" — out of everyone currently working, how many are still under their estimated time

### 2. Status summary ribbon
Five coloured pills showing how many machines are in each state:

| Colour | State | Meaning |
|---|---|---|
| 🟢 Green | Running | Machine is actively producing |
| 🟠 Amber | Setup | Operator is setting up the next job |
| 🟡 Yellow | Idle | Machine is available but nothing running |
| 🔴 Red | Down | Machine is broken or blocked — needs attention |
| ⚫ Grey | Maintenance | Scheduled PM in progress |

Pills dim when the count is zero.

### 3. Machine Andon grid
One card per machine, colour-coded by status. Each card shows:
- Machine name and work centre
- **Status label** (Running, Idle, etc.)
- Current job number (if any)
- Current operator (if any)
- Today's utilisation %

Cards use the full status colour as the background — the floor can tell which machines are fine and which aren't without reading text.

### 4. Operator grid
One card per active operator. Each card shows:
- **Operator name + initials**
- Work order and operation they are on
- **Big timer** — `42 / 60 min` = 42 minutes elapsed vs 60-minute estimate
- **Progress bar** coloured by how close they are to the estimate:
  - **Green** — under 80% of the estimate (on track)
  - **Yellow** — 80–100% (approaching the estimate)
  - **Red, pulsing card background** — over the estimate (attention needed)
- Operators who are **Paused** or **On break** appear dimmed with a small badge

Over-estimate operators also show `+5m over` next to the timer so you can see how far over at a glance.

## Tips
- **Mount at eye level** for standing operators, or higher if it's meant to be read from across the floor.
- The page is **dark by default** and full-bleed — it works on cheap TVs with high ambient light.
- It updates live every second. No action required — just leave it running.
- If an operator goes over estimate, the card **pulses red**. This is intentional — it's the one signal you can catch in your peripheral vision.

## Common questions
- **Why is the clock slightly different from my watch?** The clock reads from the browser's local time. Make sure the display's OS clock is correct.
- **An operator is on break but still shows a timer.** Break and Paused states show a badge but the timer keeps counting until a new WO starts.
- **How do I switch the shift schedule?** In the prototype the shift is hardcoded (Day Shift, ends 17:00). Real scheduling will come from the shift/people module.
