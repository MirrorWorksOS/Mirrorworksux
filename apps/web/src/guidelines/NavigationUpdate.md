# Navigation & Routing

Rolling reference for the MirrorWorks Smart FactoryOS web app's navigation, routing, and global chrome. Keep this current — log each material change in the [Changelog](#changelog) at the bottom.

## Current state

### Modules

Seven modules, each with its own directory under `apps/web/src/components/{module}/` and routes under `/{module}`:

| Module | Path | Notes |
|---|---|---|
| Sell | `/sell/*` | CRM, opportunities, quotes, customer portal |
| Plan | `/plan/*` | Activities, Gantt, MirrorView, traveller signatures |
| Make | `/make/*` | Shop floor kanban, jobs, immersive `shop-floor/` legacy UI |
| Ship | `/ship/*` | Dispatch, timeline, checklists |
| Book | `/book/*` | Financials (tabular-nums, right-aligned) |
| Buy | `/buy/*` | POs, requisitions, three-way match |
| Control | `/control/*` | Admin, settings, factory designer, workflow designer, MirrorWorks Bridge |

The standalone **Design** module was folded into Control. Legacy `/design/*` URLs redirect to their Control equivalents in `routes.tsx`.

### Global chrome

- **`apps/web/src/components/Sidebar.tsx`** — collapsible left sidebar; per-module expandable sub-menus; active-route highlighting; manual dark-mode toggle; Cmd+K palette trigger; site/role switcher footer.
- **`apps/web/src/components/Layout.tsx`** — sidebar + outlet wrapper for nested routes.
- **`apps/web/src/components/WelcomeDashboard.tsx`** — homepage at `/`.
- **`apps/web/src/components/shared/command/CommandPalette.tsx`** — Cmd+K global search/jump palette (`useCommandPaletteStore`).
- **`apps/web/src/components/shared/layout/RouteBreadcrumbs.tsx`** — breadcrumbs in page headers.
- **`apps/web/src/components/shared/layout/MobileBottomNav.tsx` + `MobileMenu.tsx`** — mobile chrome.

### Routing

- React Router (`react-router`) with `createBrowserRouter` in `apps/web/src/routes.tsx`.
- All module screens are **lazy-loaded** via `lazyWithRetry` for code splitting.
- URL pattern: `/{module}` for dashboards, `/{module}/{page}` for sub-pages.
- 404 fallback route handles invalid URLs.
- Legacy `/design/*` URLs are redirected to Control.

### Navigation features

- ✅ Collapsible per-module sidebar with active-route highlighting (MW Yellow)
- ✅ Cmd+K command palette (search, jump-to-page)
- ✅ Breadcrumbs in page headers
- ✅ Dark mode toggle (manual, persisted in `theme-provider`)
- ✅ Site switcher (multi-site customers)
- ✅ Mobile bottom nav + slide-out menu
- ✅ Browser back/forward + deep-linkable URLs
- ✅ Quick Create global action

## Design system compliance

Navigation follows the canonical design system in [DesignSystem.md](./DesignSystem.md) and `.cursor/rules/design-system.mdc`:

- MW Yellow (`#FFCF4B`) for active sidebar item + Quick Create
- M3 shape scale (see DesignSystem.md §3 for current values)
- Borders use `--neutral-200` (auto-flips in dark mode)
- Roboto for all text
- M3 motion tokens (250ms standard easing)
- 48px minimum touch targets (sidebar items, buttons)

## Adding a new route

1. Create the screen at `apps/web/src/components/{module}/{Module}{Feature}.tsx`.
2. Add a `lazyWithRetry` import + route entry in `apps/web/src/routes.tsx` under the relevant module's `children`.
3. Add the menu item in `apps/web/src/components/Sidebar.tsx` (look for the module's section in the sidebar config).
4. If it should appear in Cmd+K, add a command entry to the CommandPalette registry.
5. If it needs a breadcrumb label, add it to the breadcrumb config.

```tsx
// routes.tsx
const SellNewFeature = lazyWithRetry(() => import('./components/sell/SellNewFeature').then(m => ({ default: m.SellNewFeature })));

// inside the `sell` route node
{ path: 'new-feature', element: <L><SellNewFeature /></L> },
```

## Changelog

Newest first. Log meaningful changes — new modules, removed modules, navigation pattern shifts, new global chrome.

- **2026-05-19** — Doc converted to rolling format with changelog. Removed stale references to "Alliance Metal", the Design module (folded into Control), and out-of-date component counts. Marked dark mode, Cmd+K palette, breadcrumbs, and Quick Create as shipped.
- **earlier** — Initial navigation system built: sidebar, React Router v6 data mode, nested routes, welcome dashboard, lazy loading. (Historical baseline; pre-dates this rolling format.)
