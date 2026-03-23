# MirrorWorks Smart FactoryOS — Design System v2.0

**Last updated:** March 2026
**Status:** Active — replaces v1.0
**Maintained by:** Matt Quigley
**Quality benchmark:** [Crextio](https://crextio.framer.website/) — reference for polish and spacing, not a template to copy.

Single source of truth for Smart FactoryOS. Built on Material Design 3 (M3) principles, optimised for metal fabrication ERP on tablets and desktops. Shop floor operators wearing gloves under bright industrial lighting.

---

## 1. Colour System

### The 60-30-10 Rule

Every screen follows this ratio:

- **60% Background**: White (#FFFFFF) cards on #F5F5F5 page background
- **30% Structure**: Greyscale (#0A0A0A through #737373) for text, borders, icons
- **10% Accent**: MW Yellow (#FFCF4B) for CTAs, active states, checked controls

### MW Yellow Scale (Brand Accent)

| Token | Hex | Role |
|---|---|---|
| mw-yellow-50 | #FFFBF0 | Selected row background, subtle highlight |
| mw-yellow-100 | #FFF3D6 | Text selection highlight |
| mw-yellow-200 | #FFE8AD | Warning alert border |
| mw-yellow-300 | #FFDB7A | — |
| mw-yellow-400 | #FFCF4B | **Primary CTA**, active states, checked controls |
| mw-yellow-500 | #F2BF30 | Hover on primary buttons |
| mw-yellow-600 | #E6A600 | Active/pressed on primary buttons |
| mw-yellow-700 | #CC8E00 | — |
| mw-yellow-800 | #A67300 | — |
| mw-yellow-900 | #805900 | — |

### Grey Scale

| Token | Hex | Role |
|---|---|---|
| Near Black | #0A0A0A | Headlines, primary text, active icons |
| Dark Grey | #2C2C2C | Secondary text, body copy, text on yellow buttons |
| Mid Grey | #525252 | Table body text, descriptions |
| Medium Grey | #737373 | Labels, captions, inactive icons, table headers |
| Border Grey | #E5E5E5 | Card borders, dividers |
| Subtle Grey | #F5F5F5 | Page background, input backgrounds |
| Warm Grey | #F8F7F4 | Grouped card backgrounds inside sheets |
| White | #FFFFFF | Card backgrounds, content surfaces |

**Rule:** Text must never be lighter than #737373. Below that fails readability under industrial lighting.

### Neutral Scale (Tailwind aliases)

`neutral-50` (#FAFAFA), `neutral-100` (#F5F5F5), `neutral-200` (#E5E5E5), `neutral-300` (#D4D4D4), `neutral-400` (#A3A3A3), `neutral-500` (#737373), `neutral-600` (#525252), `neutral-700` (#404040), `neutral-800` (#2C2C2C), `neutral-900` (#0A0A0A).

### Dark Accent

- **Mirage**: #1A2732 — dark buttons, dark badges, sidebar background, pipeline cards
- **Off-white**: #F8F7F4 — warm grouped card background

### Status Colours (dots and badges only — never card backgrounds)

| Status | Hex | Token |
|---|---|---|
| Success | #36B37E | `--mw-success` |
| Info | #0052CC | `--mw-info` |
| Warning | #FACC15 | `--mw-warning` |
| Error | #DE350B | `--mw-error` |

### Deprecated (do not use in new components)

- `--mw-earth` (#8FA6A6)
- `--mw-saddle` (#A68060)
- `--mw-sea-foam` (#7B9386)
- `--mw-azure` — removed
- `--mw-ai-purple` (#7C3AED)

---

## 2. Typography

### Font Stack

| Font | Weights | Use |
|---|---|---|
| Roboto | 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold), 900 (Black) | All UI text |
| Roboto Mono | 400, 500 | Financial values, job IDs, codes |

**No other fonts.** Geist, JetBrains Mono, Inter are all deprecated and must not be used.

Google Fonts import:
```
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Mono:wght@400;500&display=swap');
```

CSS variables:
```css
--font-family-sans: 'Roboto', sans-serif;
--font-family-mono: 'Roboto Mono', monospace;
```

### M3 Type Scale

M3 defaults to Regular (400) and Medium (500). Bold (700) for page titles and hero stats. Light (300) for large display text. Black (900) for marketing only.

| M3 Token | Size | Weight | Line Height | Letter Spacing | MW Usage |
|---|---|---|---|---|---|
| display-large | 57px | 400 | 64px | -0.25px | Marketing hero stats only |
| display-medium | 45px | 400 | 52px | 0px | — |
| display-small | 36px | 400 | 44px | 0px | — |
| headline-large | 32px | 400 | 40px | 0px | Page titles |
| headline-medium | 28px | 400 | 36px | 0px | — |
| headline-small | 24px | 400 | 32px | 0px | Section headers, dialog titles |
| title-large | 22px | 400 | 28px | 0px | Card titles (primary) |
| title-medium | 16px | 500 | 24px | 0.15px | Card titles (secondary), nav items |
| title-small | 14px | 500 | 20px | 0.1px | Compact card titles, sidebar items |
| body-large | 16px | 400 | 24px | 0.5px | Primary body text, descriptions |
| body-medium | 14px | 400 | 20px | 0.25px | Table body text, form content |
| body-small | 12px | 400 | 16px | 0.4px | Captions, timestamps, metadata |
| label-large | 14px | 500 | 20px | 0.1px | Button text, active labels |
| label-medium | 12px | 500 | 16px | 0.5px | Column headers, badges, chips |
| label-small | 11px | 500 | 16px | 0.5px | Micro text, version numbers |

**Custom token:** `stat-display` — 48px, weight 400, 56px line-height, -0.25px tracking. Roboto Mono. For KPI numbers on dark accent cards.

### Typography Rules

1. Financial values, currency, totals → Roboto Mono at applicable size
2. Job numbers, IDs, codes → Roboto Mono at applicable size
3. Everything else → Roboto
4. Maximum 3 type sizes per card
5. Sentence case everywhere. Only `label-medium` and `label-small` may be uppercase.
6. Bold (700) reserved for page titles and hero stat values only
7. Black (900) reserved for marketing materials only

---

## 3. Shape Scale

M3 seven-step border radius scale.

| M3 Token | Radius | CSS Variable | Tailwind Class | Default Use |
|---|---|---|---|---|
| none | 0px | `--shape-none` | `rounded-none` | Table inner rows |
| extraSmall | 4px | `--shape-xs` | `rounded-[var(--shape-xs)]` | Checkboxes, small chips, toggle thumbs |
| small | 8px | `--shape-sm` | `rounded-[var(--shape-sm)]` | Toggle tracks, compact elements |
| medium | 12px | `--shape-md` | `rounded-[var(--shape-md)]` | Buttons, inputs, dropdowns |
| large | 16px | `--shape-lg` | `rounded-[var(--shape-lg)]` | Cards, modals, dialogs, table containers |
| extraLarge | 24px | `--shape-xl` | `rounded-[var(--shape-xl)]` | Bottom sheets, expanded containers |
| full | 9999px | `--shape-full` | `rounded-full` | Badges, pills, avatars |

**Component defaults:**
- Buttons: medium (12px)
- Inputs: medium (12px)
- Cards: large (16px)
- Modals/dialogs: large (16px)
- Sheets: extraLarge (24px)
- Badges: full (pill)
- Checkboxes: extraSmall (4px)

---

## 4. Elevation Hierarchy

Six levels mapped to M3 dp scale.

| Level | M3 dp | CSS Variable | Tailwind | Use |
|---|---|---|---|---|
| 0 | 0dp | `--elevation-0` | `shadow-none` | Page background |
| 1 | 1dp | `--elevation-1` | `shadow-xs` | Content cards (border, minimal shadow) |
| 2 | 3dp | `--elevation-2` | `shadow-sm` | Interactive/summary cards |
| 3 | 6dp | `--elevation-3` | `shadow-md` | Popovers, dropdowns |
| 4 | 8dp | `--elevation-4` | `shadow-lg` | Sticky headers, elevated nav |
| 5 | 12dp | `--elevation-5` | `shadow-xl` | Modals, sheets |

**Rules:**
- Maximum 3 elevation levels visible on any single page
- Dark accent cards (Mirage background) do not use shadow
- Elevation increases with interactivity and importance

---

## 5. Spacing and Layout

### Spacing Tokens

| Token | Value | Use |
|---|---|---|
| `p-8` (32px) | Page padding | Outer page margins |
| `p-6` (24px) | Card padding | Card internal padding |
| `gap-6` (24px) | Row gap | Between cards in a grid |
| `space-y-8` (32px) | Section spacing | Between page sections |
| `gap-2` (8px) | Base grid | Minimum gap unit |

### Density Rules

- 8px base grid — all spacing multiples of 8px
- Cards: `p-6` internal padding
- Forms: `gap-4` between fields, `gap-6` between field groups
- Tables: `px-4 py-3` cell padding

### Responsive Breakpoints

| Breakpoint | Width | Target |
|---|---|---|
| `sm` | 640px | Mobile |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

---

## 6. Touch Targets

| Context | Minimum Height | Tailwind Class | Notes |
|---|---|---|---|
| Desktop interactive | 48px | `h-12 min-h-[48px]` | Buttons, inputs, selects |
| Shop floor interactive | 56px | `h-14 min-h-[56px]` | Make module, glove-friendly |
| Primary CTA (preferred) | 80px | `h-20 min-h-[80px]` | Start/stop production |
| Table rows | 56px | `min-h-[56px]` | All data tables |
| Icon buttons | 48px | `size-12 min-h-[48px]` | Action icons |

**Shop floor rules:**
- Minimum 56px touch targets on Make, Ship modules
- 16px minimum font size for body text
- High contrast required — no text lighter than #737373
- Test under bright overhead lighting

---

## 7. Component Patterns

### Buttons

| Variant | Appearance | Tailwind Classes |
|---|---|---|
| Default (primary) | Yellow background, dark text | `bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)]` |
| Outline | White with border | `border border-[var(--neutral-200)] bg-white text-foreground hover:bg-[var(--neutral-50)]` |
| Ghost | Transparent | `hover:bg-[var(--neutral-50)] active:bg-[var(--neutral-100)]` |
| Dark | Mirage background | `bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90` |
| Destructive | Red | `bg-destructive text-white hover:bg-destructive/90` |

Sizes: Default 48px (`h-12`), Small 40px (`h-10`), Large 56px (`h-14`), Icon 48px (`size-12`).

### Cards

Three tiers:
1. **Flat** (elevation-1): `border border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)]`
2. **Elevated** (elevation-2): `border border-[var(--neutral-200)] shadow-sm rounded-[var(--shape-lg)]`
3. **Dark accent**: `bg-[var(--mw-mirage)] text-white border-none rounded-[var(--shape-lg)]` — no shadow

### Tables

- Wrap in a Card container with `rounded-[var(--shape-lg)]`
- Filter bar above table: `p-4 border-b border-[var(--neutral-100)]`
- Header: `text-xs font-medium uppercase tracking-wider h-12 px-4`
- Rows: `min-h-[56px] px-4 py-3`
- Hover: `hover:bg-[#0A0A0A]/[0.04]`
- Alternating: `even:bg-[var(--neutral-50)]`
- Selected: `bg-[var(--mw-yellow-50)] border-l-[3px] border-l-[var(--mw-yellow-400)]`
- Row borders: `border-b border-[var(--neutral-100)]`
- Job numbers/IDs in `font-mono`

### Progress Bars

- **Linear**: Track `bg-[var(--neutral-200)]`, fill `bg-[var(--mw-yellow-400)]`, height `h-2`, `rounded-full`
- **Segmented**: Individual segments with `gap-1`, each `h-2 rounded-full`

### Badges

Pill shape (`rounded-full`). Variants: default (neutral grey), accent (MW Yellow), dark (Mirage), success, destructive, warning, outline.

### Avatars

Ring: `ring-2 ring-white shadow-sm`. Fallback: `bg-[var(--neutral-100)] text-[var(--neutral-500)] font-medium text-sm`.

### Frosted Glass

Used on overlays, sheets, dialogs, tooltips:
- Overlay: `bg-black/20 backdrop-blur-sm`
- Content: `bg-white/95 backdrop-blur-xl shadow-xl`
- Tooltip: `bg-white/90 backdrop-blur-md border border-white/30 shadow-lg`

---

## 8. Interaction States

### M3 State Layer Opacities

Overlays using the content's own colour at fixed opacities:

| State | Opacity | CSS Variable | Tailwind Pattern |
|---|---|---|---|
| Hover | 8% | `--state-hover` | `hover:bg-[#0A0A0A]/[0.08]` |
| Focus | 10% | `--state-focus` | `focus:bg-[#0A0A0A]/[0.10]` |
| Pressed | 10% | `--state-pressed` | `active:bg-[#0A0A0A]/[0.10]` |
| Dragged | 16% | `--state-dragged` | — |

### Disabled State (Critical — M3 Split)

**Never** use blanket `opacity-50` on the whole element. M3 splits disabled into two layers:

- **Container**: 12% opacity → `disabled:bg-[#0A0A0A]/[0.12]`
- **Content**: 38% opacity → `disabled:text-[#0A0A0A]/[0.38]`

On dark surfaces:
- Container: `disabled:bg-white/[0.12]`
- Content: `disabled:text-white/[0.38]`

### Focus Ring

Standard: `focus-visible:ring-2 focus-visible:ring-[#0A0A0A]`

---

## 9. Charts and Data Visualisation

- **Monochromatic palette** — MW Yellow as hero series, greys for supporting
- Hero series: `var(--mw-yellow-400)` (#FFCF4B)
- Supporting: neutral-300, neutral-400, neutral-500
- Projected/forecast: hatched pattern or dashed
- Tooltip: frosted glass style (`bg-white/90 backdrop-blur-md`)
- No 3D effects, no colour gradients on chart elements
- Right-align all numeric axes
- Use Roboto Mono for axis labels and values

---

## 10. Icons

- **Library**: Lucide React only
- **Style**: Monochromatic — single colour matching text
- **Size**: Default 16px (`size-4`), touch target minimum 20px (`size-5`)
- **Colour**: Inherit from text colour (currentColor)
- **Status indicators**: Use colour dots (8px circles), not coloured icons
- No multi-colour icons. No filled variants except for status dots.

---

## 11. Clean Design Rules

1. **No gradients** — flat colours only, everywhere
2. **No decorative borders** — borders serve structure (card boundaries, dividers)
3. **No colour emphasis** — MW Yellow is the only accent colour. Status colours for dots/badges only.
4. **No blue for primary actions** — MW Yellow is the primary action colour
5. **No coloured card backgrounds** — white cards, #F5F5F5 page, Mirage for dark accent only
6. **Monochromatic icons** — single colour, no multi-colour
7. **No drop shadows for decoration** — shadows indicate elevation only
8. **No animated backgrounds** — static surfaces only
9. **No custom scrollbars** on content areas

---

## 12. UX Principles

1. **One primary action per card** — maximum one yellow button per card
2. **Progressive disclosure** — show summary first, expand for detail
3. **Empty states** — illustration + description + CTA button, never blank
4. **Error messages** — specific and actionable ("Job MW-2024-0891 not found in active jobs" not "Error occurred")
5. **Cmd+K search** — always available, global search shortcut
6. **Short forms** — avoid full-page wizards, prefer inline editing and single-screen forms
7. **Loading states** — skeleton screens (neutral-100 with shape-md radius), never spinners
8. **Confirmation** — destructive actions require explicit confirmation dialog
9. **Undo over confirm** — prefer undo for non-destructive actions rather than confirmation dialogs
10. **Keyboard navigation** — all interactive elements must be keyboard accessible

---

## 13. Module-Specific Notes

### Sell (CRM + Quoting)
- Dark accent cards for pipeline stage columns
- MW Yellow for won deal indicators
- Currency values in Roboto Mono, right-aligned
- Quote line items in table format with card container

### Plan (Scheduling)
- Segmented progress bars for schedule stages
- Timeline views with vertical connectors
- Gantt-style bars use MW Yellow for active, neutral-200 for pending
- Date pickers: selected day `bg-[var(--mw-yellow-400)] text-[#2C2C2C]`

### Make (Production)
- 56px minimum touch targets (glove-friendly)
- Large checkboxes for quality checklists
- Progress bars for job stages
- Timer displays in Roboto Mono stat-display size
- High contrast under industrial lighting

### Ship (Dispatch + Logistics)
- Timeline component for delivery tracking
- Large checkboxes for dispatch checklists (56px)
- Status badges for shipment states
- Delivery timestamps in Roboto Mono

### Book (Finance)
- All financial values in Roboto Mono
- Right-aligned numbers in tables
- Three-decimal currency where required
- P&L tables with alternating rows and section subtotals
- Negative values in `--mw-error` colour

### Buy (Procurement)
- Card nesting for PO → line items
- Three-way match indicators (PO / receipt / invoice)
- Supplier cards with contact info
- Approval workflow with status badges

### Control (Admin + Settings)
- Settings in card groups
- Toggle switches for feature flags
- Role/permission tables
- Audit log in chronological table format

---

## 14. Motion

### M3 Easing Curves

| Token | CSS Variable | Curve | Use |
|---|---|---|---|
| Standard | `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1.0)` | General transitions |
| Standard decelerate | `--ease-standard-decelerate` | `cubic-bezier(0, 0, 0, 1)` | Elements entering view |
| Standard accelerate | `--ease-standard-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | Elements leaving view |
| Emphasised | `--ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1.0)` | Important transitions |
| Emphasised decelerate | `--ease-emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | Entering with emphasis |
| Emphasised accelerate | `--ease-emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Leaving with emphasis |

### M3 Duration Tokens

| Token | CSS Variable | Value | Use |
|---|---|---|---|
| short1 | `--duration-short1` | 50ms | Micro-interactions (checkbox tick) |
| short2 | `--duration-short2` | 100ms | Simple state changes (hover) |
| medium1 | `--duration-medium1` | 250ms | Standard transitions (default) |
| medium2 | `--duration-medium2` | 350ms | Complex transitions (dialog open) |
| long1 | `--duration-long1` | 450ms | Page transitions |
| long2 | `--duration-long2` | 550ms | Emphasis transitions |

### Application Guidance

- **Default**: `duration-[var(--duration-medium1)] ease-[var(--ease-standard)]`
- **Enter**: `ease-[var(--ease-standard-decelerate)]`
- **Exit**: `ease-[var(--ease-standard-accelerate)]`
- **Dialogs open**: `duration-[var(--duration-medium2)]`
- **Dialogs close**: `duration-[var(--duration-medium1)]`
- **Sheets**: `data-[state=open]:duration-[var(--duration-medium2)] data-[state=closed]:duration-[var(--duration-medium1)]`
- No motion on page background. Animate content, not containers.

---

## 15. Tailwind Configuration

Complete `tailwind.config.ts` with all M3 tokens:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "mw-yellow": {
          50: "#FFFBF0",
          100: "#FFF3D6",
          200: "#FFE8AD",
          300: "#FFDB7A",
          400: "#FFCF4B",
          500: "#F2BF30",
          600: "#E6A600",
          700: "#CC8E00",
          800: "#A67300",
          900: "#805900",
        },
        "mw-mirage": "#1A2732",
        "mw-off-white": "#F8F7F4",
        "mw-success": "#36B37E",
        "mw-info": "#0052CC",
        "mw-warning": "#FACC15",
        "mw-error": "#DE350B",
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#2C2C2C",
          900: "#0A0A0A",
        },
      },
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      borderRadius: {
        none: "var(--shape-none)",
        xs: "var(--shape-xs)",
        sm: "var(--shape-sm)",
        md: "var(--shape-md)",
        lg: "var(--shape-lg)",
        xl: "var(--shape-xl)",
        full: "var(--shape-full)",
      },
      boxShadow: {
        "elevation-0": "var(--elevation-0)",
        "elevation-1": "var(--elevation-1)",
        "elevation-2": "var(--elevation-2)",
        "elevation-3": "var(--elevation-3)",
        "elevation-4": "var(--elevation-4)",
        "elevation-5": "var(--elevation-5)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        "standard-decelerate": "var(--ease-standard-decelerate)",
        "standard-accelerate": "var(--ease-standard-accelerate)",
        emphasized: "var(--ease-emphasized)",
        "emphasized-decelerate": "var(--ease-emphasized-decelerate)",
        "emphasized-accelerate": "var(--ease-emphasized-accelerate)",
      },
      transitionDuration: {
        short1: "var(--duration-short1)",
        short2: "var(--duration-short2)",
        medium1: "var(--duration-medium1)",
        medium2: "var(--duration-medium2)",
        long1: "var(--duration-long1)",
        long2: "var(--duration-long2)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 16. What Changed from v1.0

| Area | v1.0 | v2.0 |
|---|---|---|
| Fonts | Geist Sans + JetBrains Mono | Roboto + Roboto Mono |
| Type scale | Custom 8-token | Full M3 15-token scale |
| Colour palette | Multi-colour anchors (earth, saddle, sea-foam) | Monochromatic + MW Yellow only |
| AI indicator | Purple accent (#7C3AED) | Deprecated — use MW Yellow or badge |
| Border radius | Fixed px values | M3 7-step shape scale with CSS variables |
| Elevation | Tailwind shadow classes | M3 6-level dp scale with CSS variables |
| Motion | No system | M3 easing (6 curves) + duration (6 tokens) |
| State layers | `opacity-50` for disabled | M3 split: 12% container, 38% content |
| Touch targets | 44px minimum | 48px desktop, 56px shop floor |
| Disabled state | Blanket opacity | Split container (12%) and content (38%) |
| Shape system | `rounded-md` / `rounded-lg` | 7-step M3 scale (none through full) |
| Component library | Mixed custom + ShadCN | ShadCN/Radix only with MW overrides |
| Status colours | Card backgrounds | Dots and badges only |
| Focus ring | Default browser | `ring-2 ring-[#0A0A0A]` |
| Overlays | `bg-black/50` | `bg-black/20 backdrop-blur-sm` (frosted) |
