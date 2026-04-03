/**
 * MirrorWorks Smart FactoryOS — Design System v2.0
 *
 * Single font: Roboto (M3 properties)
 * Colours: 60-30-10 rule (white/grey/MW Yellow)
 * Shape: Large radii (rounded-2xl cards, rounded-xl buttons)
 *
 * **Colours in UI:** Prefer `var(--*)` from `src/styles/globals.css` in components.
 * The `colors` object below remains for TS constants / gradual migration; new code
 * should not add parallel hex sources — use CSS variables.
 */

// ============================================================================
// COLORS - Legacy TS mirror (prefer CSS variables in `.tsx`)
// ============================================================================

export const colors = {
  // MW Yellow Scale
  yellow50: '#FFFBF0',
  yellow100: '#FFF3D6',
  yellow200: '#FFE8AD',
  yellow300: '#FFDB7A',
  yellow: '#FFCF4B',       // mw-yellow-400 — Primary CTA, active states
  yellowHover: '#F2BF30',  // mw-yellow-500 — Hover on primary buttons
  yellowActive: '#E6A600', // mw-yellow-600 — Active/pressed on primary buttons
  yellow700: '#CC8E00',
  yellow800: '#A67300',
  yellow900: '#805900',

  // Neutrals — standard greyscale
  nearBlack: '#0A0A0A',   // neutral-900 — Headlines, primary text, active icons
  darkGray: '#2C2C2C',    // neutral-800 — Secondary text, body copy, text on yellow buttons
  midGray: '#525252',     // neutral-600 — Table body text, descriptions
  mediumGray: '#737373',  // neutral-500 — Labels, captions, inactive icons, table headers
  borderGray: '#E5E5E5',  // neutral-200 — Card borders, dividers
  subtleGray: '#F5F5F5',  // neutral-100 — Page background, input backgrounds
  bgLight: '#FAFAFA',     // neutral-50
  white: '#FFFFFF',

  // Dark Accent
  mirage: '#1A2732',      // Dark buttons, dark badges, sidebar, pipeline cards
  offWhite: '#F8F7F4',    // Warm grouped card background

  // Status Colours (dots and badges only — never card backgrounds)
  success: '#36B37E',
  info: '#0052CC',
  warning: '#FACC15',
  error: '#DE350B',

  // Status light variants (badge backgrounds)
  successLight: '#E3FCEF',
  infoLight: '#DEEBFF',
  warningLight: '#FFF9C4',
  errorLight: '#FFEBE6',
} as const;

// ============================================================================
// TYPOGRAPHY - Roboto only, M3 properties
// ============================================================================

export const fonts = {
  sans: "'Roboto', sans-serif",
} as const;

// ============================================================================
// SPACING - Material 3 8px Grid
// ============================================================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// ============================================================================
// RADIUS - Large radii pattern (per user preference)
// ============================================================================

export const radius = {
  none: '0px',
  xs: '4px',       // Checkboxes, small chips
  sm: '8px',       // Toggle tracks
  md: '12px',      // Inputs, action icon wells (rounded-xl in Tailwind); buttons use rounded-full
  lg: '16px',      // Cards, modals (rounded-2xl in Tailwind)
  xl: '24px',      // Sheets, expanded containers
  full: '9999px',  // Badges, pills, avatars
} as const;

// ============================================================================
// SHADOWS - M3 Elevation
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '2': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
} as const;

// ============================================================================
// MOTION - Material 3 Duration & Easing
// ============================================================================

export const motion = {
  duration: {
    instant: 0,
    short1: 50,    // --duration-short1: micro-interactions
    short2: 100,   // --duration-short2: simple state changes
    medium1: 250,  // --duration-medium1: standard transitions (default)
    medium2: 350,  // --duration-medium2: complex transitions (dialog open)
    long1: 450,    // --duration-long1: page transitions
    long2: 550,    // --duration-long2: emphasis transitions
    // Aliases for backward compatibility
    fast: 100,
    medium: 250,
    standard: 250,
    slow: 450,
    luxurious: 550,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0, 1.0)',
    accelerate: 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    sidebarPanel: 'cubic-bezier(0.75, 0, 0.25, 1)',
    sidebarContent: 'cubic-bezier(0.7, -0.15, 0.25, 1.15)',
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    linear: 'linear',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  transition: {
    hoverColor: 'color 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    hoverBackground: 'background-color 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    hoverBorder: 'border-color 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    hoverShadow: 'box-shadow 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    opacity: 'opacity 300ms linear',
    transform: 'transform 300ms cubic-bezier(0.2, 0.0, 0, 1.0)',
    sidebarPanel: 'transform 400ms cubic-bezier(0.75, 0, 0.25, 1), width 400ms cubic-bezier(0.75, 0, 0.25, 1)',
    sidebarContent: 'width 400ms cubic-bezier(0.7, -0.15, 0.25, 1.15), margin-left 400ms cubic-bezier(0.7, -0.15, 0.25, 1.15)',
    sidebarLabel: 'opacity 300ms linear, margin 300ms linear',
    modal: 'all 500ms cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    all: 'all 300ms cubic-bezier(0.2, 0.0, 0, 1.0)',
  },
} as const;

// ============================================================================
// TOUCH TARGETS - M3 minimum sizes
// ============================================================================

export const touchTargets = {
  minimum: '48px',
  comfortable: '56px',
  large: '80px',
} as const;

// ============================================================================
// COMPONENT PATTERNS
// ============================================================================

export const componentClasses = {
  card: `bg-white border border-[var(--neutral-200)] rounded-[var(--shape-lg)] shadow-xs`,
  cardHover: `hover:shadow-md transition-shadow duration-[var(--duration-medium1)] ease-[var(--ease-standard)]`,

  badge: {
    base: `inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-medium text-xs`,
    success: `bg-[var(--mw-success-light)] text-[var(--mw-success)]`,
    warning: `bg-[var(--mw-warning-light)] text-[var(--mw-yellow-800)]`,
    error: `bg-[var(--mw-error-light)] text-[var(--mw-error)]`,
    info: `bg-[var(--neutral-100)] text-foreground`,
    neutral: `bg-[var(--neutral-100)] text-[var(--neutral-600)]`,
  },

  button: {
    primary: `bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)] text-[var(--neutral-800)] font-medium rounded-full`,
    outline: `border border-[var(--neutral-200)] bg-white hover:bg-[var(--neutral-50)] rounded-full`,
    ghost: `hover:bg-[var(--neutral-100)] active:bg-[var(--neutral-200)] rounded-full`,
    dark: `bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90 rounded-full`,
    destructive: `bg-[var(--mw-error)] text-white hover:bg-[var(--mw-error)]/90 rounded-full`,
  },

  input: {
    base: `bg-[var(--neutral-100)] border border-[var(--neutral-200)] rounded-xl px-3 py-2 text-[14px]`,
    focus: `focus:border-[var(--neutral-900)] focus:ring-1 focus:ring-[var(--neutral-900)]`,
  },
} as const;

// ============================================================================
// PRIORITY COLORS
// ============================================================================

export const priorityColors = {
  low: '#737373',
  medium: '#FFCF4B',
  high: '#E6A600',
  urgent: '#DE350B',
} as const;

// ============================================================================
// STATUS COLORS
// ============================================================================

export const statusColors = {
  draft: colors.mediumGray,
  new: colors.nearBlack,
  pending: colors.yellow,
  inProgress: colors.yellow,
  completed: colors.success,
  cancelled: colors.mediumGray,
  sent: colors.nearBlack,
  viewed: colors.nearBlack,
  paid: colors.success,
  overdue: colors.error,
  partiallyPaid: colors.yellow,
  scheduled: colors.nearBlack,
  producing: colors.yellow,
  produced: colors.success,
  onHold: colors.yellow,
} as const;

// ============================================================================
// EXPORT
// ============================================================================

export const designSystem = {
  colors,
  fonts,
  spacing,
  radius,
  shadows,
  motion,
  touchTargets,
  componentClasses,
  priorityColors,
  statusColors,
} as const;

export default designSystem;
