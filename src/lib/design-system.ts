/**
 * Alliance Metal Design System
 * MirrorWorks UX with Material 3 Motion Principles
 * 
 * This file defines the core design tokens and animation constants
 * used consistently across all modules: Plan, Book, Ship, Make, Sell, etc.
 */

// ============================================================================
// COLORS - MirrorWorks Design System
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

  // Neutrals
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
// TYPOGRAPHY - Font Stacks
// ============================================================================

export const fonts = {
  // Primary fonts — Roboto (v2.0)
  sans: "'Roboto',sans-serif",
  sansLight: "'Roboto',sans-serif",     // weight 300
  sansMedium: "'Roboto',sans-serif",    // weight 500
  sansBold: "'Roboto',sans-serif",      // weight 700

  // Monospace for IDs, codes, financial figures — Roboto Mono (v2.0)
  mono: "'Roboto Mono',monospace",
  monoFinancial: "'Roboto Mono',monospace",
} as const;

// ============================================================================
// SPACING - Material 3 8px Grid
// ============================================================================

export const spacing = {
  xs: '4px',    // 0.5 unit
  sm: '8px',    // 1 unit
  md: '16px',   // 2 units
  lg: '24px',   // 3 units
  xl: '32px',   // 4 units
  '2xl': '48px', // 6 units
  '3xl': '64px', // 8 units
} as const;

// ============================================================================
// RADIUS - Consistent corner radii
// ============================================================================

export const radius = {
  none: '0px',       // shape-none — Table inner rows
  xs: '4px',         // shape-xs — Checkboxes, small chips, toggle thumbs
  sm: '8px',         // shape-sm — Toggle tracks, compact elements
  md: '12px',        // shape-md — Buttons, inputs, dropdowns
  lg: '16px',        // shape-lg — Cards, modals, dialogs, table containers
  xl: '24px',        // shape-xl — Bottom sheets, expanded containers
  full: '9999px',    // shape-full — Badges, pills, avatars
} as const;

// ============================================================================
// SHADOWS - Elevation system
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

/**
 * Material 3 Motion Principles + Custom Parallax Effects:
 * - Fast movements: 100-200ms (simple transitions)
 * - Medium movements: 250-400ms (standard)
 * - Slow movements: 500-700ms (emphasis, parallax)
 * 
 * Easing curves:
 * - Standard: cubic-bezier(0.2, 0.0, 0, 1.0) - General purpose
 * - Decelerate: cubic-bezier(0.0, 0.0, 0, 1.0) - Enter screen
 * - Accelerate: cubic-bezier(0.3, 0.0, 1.0, 1.0) - Exit screen
 * - EmphasizedDecelerate: cubic-bezier(0.05, 0.7, 0.1, 1.0) - Luxurious
 * - EmphasizedAccelerate: cubic-bezier(0.3, 0.0, 0.8, 0.15) - Quick exit
 * 
 * Sidebar Parallax Effect:
 * - Sidebar panel: cubic-bezier(0.75, 0, 0.25, 1) - Fast start, smooth decelerate
 * - Content gap: cubic-bezier(0.7, -0.15, 0.25, 1.15) - Pull-back with overshoot
 */

export const motion = {
  // Durations (milliseconds)
  duration: {
    instant: 0,
    fast: 150,       // Quick state changes (hover, active)
    medium: 300,     // Standard transitions (opacity, group labels)
    standard: 400,   // Sidebar, panels, major layout changes
    slow: 500,       // Emphasis animations
    luxurious: 700,  // Parallax effects, complex animations
  },
  
  // Easing functions
  easing: {
    // Standard motion (general purpose)
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    
    // Enter screen (decelerate)
    decelerate: 'cubic-bezier(0.0, 0.0, 0, 1.0)',
    
    // Exit screen (accelerate)
    accelerate: 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
    
    // Emphasized motion (luxurious, parallax)
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    
    // Sidebar parallax effect
    sidebarPanel: 'cubic-bezier(0.75, 0, 0.25, 1)',      // Fast start, smooth decelerate, no overshoot
    sidebarContent: 'cubic-bezier(0.7, -0.15, 0.25, 1.15)', // Pull-back start, slight overshoot end
    
    // UI interactions
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',  // Smooth deceleration for hover/active
    linear: 'linear',                              // Linear for opacity changes
    
    // Spring-like bounce (special effects)
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // CSS transition strings (ready to use)
  transition: {
    // Fast interactions (hover, active states)
    hoverColor: 'color 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    hoverBackground: 'background-color 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    hoverBorder: 'border-color 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    hoverShadow: 'box-shadow 200ms cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    
    // Standard transitions
    opacity: 'opacity 300ms linear',
    transform: 'transform 300ms cubic-bezier(0.2, 0.0, 0, 1.0)',
    
    // Sidebar parallax
    sidebarPanel: 'transform 400ms cubic-bezier(0.75, 0, 0.25, 1), width 400ms cubic-bezier(0.75, 0, 0.25, 1)',
    sidebarContent: 'width 400ms cubic-bezier(0.7, -0.15, 0.25, 1.15), margin-left 400ms cubic-bezier(0.7, -0.15, 0.25, 1.15)',
    sidebarLabel: 'opacity 300ms linear, margin 300ms linear',
    
    // Emphasized (luxurious)
    modal: 'all 500ms cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    
    // Combined
    all: 'all 300ms cubic-bezier(0.2, 0.0, 0, 1.0)',
  },
} as const;

// ============================================================================
// TOUCH TARGETS - Material 3 minimum sizes
// ============================================================================

export const touchTargets = {
  // Minimum touch target sizes for accessibility
  minimum: '48px',      // Material 3 standard
  comfortable: '56px',  // Preferred for shop floor
  large: '80px',        // Gloved hands (manufacturing)
} as const;

// ============================================================================
// COMPONENT PATTERNS
// ============================================================================

export const componentClasses = {
  card: `bg-white border border-[var(--neutral-200)] rounded-[var(--shape-lg)] shadow-[var(--elevation-1)]`,
  cardHover: `hover:shadow-[var(--elevation-2)] transition-shadow duration-[var(--duration-medium1)]`,

  badge: {
    base: `inline-flex items-center justify-center px-2 py-0.5 rounded-full font-medium text-xs`,
    success: `bg-[${colors.success}] text-white`,
    warning: `bg-[${colors.warning}] text-white`,
    error: `bg-[${colors.error}] text-white`,
    info: `bg-[${colors.info}] text-white`,
    neutral: `bg-[var(--neutral-100)] text-[var(--neutral-900)]`,
  },

  button: {
    primary: `bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)] text-[var(--neutral-800)] font-medium`,
    outline: `border border-[var(--neutral-200)] bg-white hover:bg-[var(--neutral-50)]`,
    ghost: `hover:bg-[var(--neutral-50)] active:bg-[var(--neutral-100)]`,
    dark: `bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90`,
    destructive: `bg-destructive text-white hover:bg-destructive/90`,
  },

  input: {
    base: `bg-white border border-[var(--neutral-200)] rounded-[var(--shape-md)] px-3 py-2 text-[14px]`,
    focus: `focus:border-[var(--neutral-900)] focus:ring-1 focus:ring-[var(--neutral-900)]`,
  },
} as const;

// ============================================================================
// PRIORITY COLORS - Consistent across modules
// ============================================================================

export const priorityColors = {
  low: '#36B37E',
  medium: '#FFCF4B',
  high: '#FACC15',
  urgent: '#DE350B',
} as const;

// ============================================================================
// STATUS COLORS - For badges and indicators
// ============================================================================

export const statusColors = {
  // Jobs/Orders
  draft: colors.mediumGray,
  new: colors.info,
  pending: colors.yellow,
  inProgress: colors.yellow,
  completed: colors.success,
  cancelled: colors.mediumGray,
  
  // Invoices
  sent: colors.info,
  viewed: colors.info,
  paid: colors.success,
  overdue: colors.error,
  partiallyPaid: colors.warning,
  
  // Production
  scheduled: colors.info,
  producing: colors.yellow,
  produced: colors.success,
  onHold: colors.warning,
} as const;

// ============================================================================
// ANIMATION VARIANTS - For motion/react usage
// ============================================================================

export const animationVariants = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motion.duration.medium / 1000 },
  },
  
  // Slide from bottom (modals, sheets)
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: {
      duration: motion.duration.slow / 1000,
      ease: [0.05, 0.7, 0.1, 1.0], // emphasizedDecelerate
    },
  },
  
  // Scale (buttons, chips)
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: motion.duration.fast / 1000 },
  },
  
  // Stagger children (lists)
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  
  // List item
  listItem: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: motion.duration.medium / 1000 },
  },
} as const;

// ============================================================================
// EXPORT EVERYTHING
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