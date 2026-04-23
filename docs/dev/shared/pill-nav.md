# PillNav (shared)

Canonical pill-shaped tab strip for dashboards, detail pages, and any multi-section nav. Added 2026-04-22 (commit `252091f5`, PR [#27](https://github.com/matthewjquigley/Mirrorworksux/pull/27)).

## File

`apps/web/src/components/shared/navigation/PillNav.tsx`

Built on the base `Tabs` / `TabsList` / `TabsTrigger` primitives in `@/components/ui/tabs`. Those primitives supply the motion-animated white-card indicator (spring, `layoutId`). PillNav layers on:

- Subtle hover lift on each pill (`-1px` translate).
- Icon micro-animation when a tab becomes active (spring scale bump from `1` → `1.08`).
- Count-badge entrance/exit via `AnimatePresence` with scale-spring.
- Optional `magnify` prop — macOS-dock-style cursor magnification, shared `mouseX` MotionValue across pills.

## API

```ts
interface PillNavTab {
  key: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

interface PillNavProps {
  tabs: PillNavTab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;        // outer <Tabs>
  listClassName?: string;    // <TabsList>
  triggerClassName?: string; // each <TabsTrigger>
  magnify?: boolean;         // default false
  'aria-label'?: string;
}
```

## Usage

```tsx
<PillNav
  tabs={[
    { key: 'overview', label: 'Overview' },
    { key: 'quotes',   label: 'Quotes',     count: 2 },
    { key: 'activity', label: 'Activities', count: 4, icon: Activity },
  ]}
  value={tab}
  onValueChange={setTab}
  magnify                 // optional, default off
/>
```

Use `magnify` sparingly — it's best on wall-display / hero nav bars. The default is off.

## Magnify internals

- `MAGNIFY_REACH = 120` — pixel distance from pill centre where the lens fades to zero.
- `MAGNIFY_MAX = 0.14` — additional scale factor at the centre of the lens.
- Smoothed via a spring (`stiffness: 500, damping: 30, mass: 0.5`) so the lens glides instead of snapping.

Distance is measured on the x-axis only (`mouseX - pillBounds.x - pillBounds.width / 2`). When the cursor leaves the bar, `mouseX` is set to `Infinity` and all pills return to scale 1.

## Underlying Tabs primitive change

Same commit converted `apps/web/src/components/ui/tabs.tsx` `TabsList` and `TabsTrigger` to `React.forwardRef`. This is required for `motion.create(TabsTrigger)` to attach a ref for bounding-box measurement. Radix's roving-focus continues to work unchanged.

## Known gaps

- Magnify uses `ref.current?.getBoundingClientRect()` inside a `useTransform` callback, which runs each mousemove. On a very long tab strip (>20 pills) this may cost more than a reflow-free approach using a shared `ResizeObserver`.
- No keyboard-magnify equivalent — magnification is mouse-only.
- `aria-label` on the list is supported but the individual triggers inherit only the label text.
