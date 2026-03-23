/**
 * MirrorWorks Smart FactoryOS — Design System v2.0
 *
 * Single font: Roboto (M3 properties)
 * Colours: 60-30-10 rule (white/grey/MW Yellow)
 * Shape: Large radii (rounded-2xl cards, rounded-xl buttons)
 */

// ============================================================================
// COLORS - MirrorWorks Design System (60-30-10)
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
  md: '12px',      // Buttons, inputs (rounded-xl in Tailwind)
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
    fast: 150,
    medium: 300,
    standard: 400,
    slow: 500,
    luxurious: 700,
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
  card: `bg-white border border-[#E5E5E5] rounded-2xl shadow-sm`,
  cardHover: `hover:shadow-md transition-shadow duration-[var(--duration-medium1)]`,

  badge: {
    base: `inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-medium text-xs`,
    success: `bg-[#E3FCEF] text-[#36B37E]`,
    warning: `bg-[#FFF9C4] text-[#A67300]`,
    error: `bg-[#FFEBE6] text-[#DE350B]`,
    info: `bg-[#F5F5F5] text-[#0A0A0A]`,
    neutral: `bg-[#F5F5F5] text-[#525252]`,
  },

  button: {
    primary: `bg-[#FFCF4B] hover:bg-[#F2BF30] active:bg-[#E6A600] text-[#2C2C2C] font-medium rounded-xl`,
    outline: `border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] rounded-xl`,
    ghost: `hover:bg-[#F5F5F5] active:bg-[#E5E5E5] rounded-xl`,
    dark: `bg-[#1A2732] text-white hover:bg-[#1A2732]/90 rounded-xl`,
    destructive: `bg-[#DE350B] text-white hover:bg-[#DE350B]/90 rounded-xl`,
  },

  input: {
    base: `bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl px-3 py-2 text-[14px]`,
    focus: `focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A]`,
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
// ANIMATION VARIANTS
// ============================================================================

export const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motion.duration.medium / 1000 },
  },
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { duration: motion.duration.slow / 1000, ease: [0.05, 0.7, 0.1, 1.0] },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: motion.duration.fast / 1000 },
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
  listItem: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: motion.duration.medium / 1000 },
  },
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
  animationVariants,
} as const;

export default designSystem;
