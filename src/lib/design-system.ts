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
  // MW Brand Colors
  yellow: '#FFCF4B',      // MW Yellow - Primary CTA, AI highlights
  yellowHover: '#EBC028', // Hover state for MW Yellow
  yellowBg: '#FFFBF0',    // Yellow tinted backgrounds
  
  // Neutrals
  nearBlack: '#0A0A0A',   // Primary text
  darkGray: '#2C2C2C',    // Secondary text
  mediumGray: '#737373',  // Tertiary text / icons
  lightGray: '#E5E5E5',   // Borders
  bgGray: '#F5F5F5',      // Subtle backgrounds
  bgLight: '#FAFAFA',     // Page backgrounds
  white: '#FFFFFF',
  
  // Status Colors
  success: '#36B37E',     // Green - Completed, Produced
  warning: '#FF8B00',     // Orange - Warning, High priority
  error: '#EF4444',       // Red - Error, Urgent, Overdue
  info: '#0A7AFF',        // Blue - Info, Scheduled
  
  // Status Variants
  successLight: '#E3FCEF',
  warningLight: '#FFEDD5',
  errorLight: '#FEE2E2',
  infoLight: '#DBEAFE',
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
  none: '0px',
  sm: '4px',    // Small elements (badges, chips)
  md: '8px',    // Standard (cards, buttons, inputs)
  lg: '12px',   // Large cards
  xl: '16px',   // Modal dialogs
  full: '9999px', // Pills, avatars
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
  // Card base styles
  card: `bg-white border border-[${colors.lightGray}] rounded-[${radius.md}] shadow-sm`,
  cardHover: `hover:shadow-md transition-shadow duration-[${motion.duration.fast}ms]`,
  
  // Badge styles
  badge: {
    base: `inline-flex items-center justify-center px-2 py-0.5 rounded-[${radius.sm}] font-[${fonts.sansMedium}] text-xs`,
    success: `bg-[${colors.success}] text-white`,
    warning: `bg-[${colors.warning}] text-white`,
    error: `bg-[${colors.error}] text-white`,
    info: `bg-[${colors.info}] text-white`,
    neutral: `bg-[${colors.bgGray}] text-[${colors.nearBlack}]`,
  },
  
  // Button styles
  button: {
    primary: `bg-[${colors.yellow}] hover:bg-[${colors.yellowHover}] text-[${colors.darkGray}] font-medium transition-colors duration-[${motion.duration.fast}ms]`,
    outline: `border border-[${colors.lightGray}] bg-white hover:bg-[${colors.bgGray}] transition-colors duration-[${motion.duration.fast}ms]`,
    ghost: `hover:bg-[${colors.bgGray}] transition-colors duration-[${motion.duration.fast}ms]`,
  },
  
  // Input styles
  input: {
    base: `bg-white border border-[${colors.lightGray}] rounded-[${radius.md}] px-3 py-2 font-[${fonts.sans}] text-[14px] transition-colors duration-[${motion.duration.fast}ms]`,
    focus: `focus:border-[${colors.nearBlack}] focus:ring-1 focus:ring-[${colors.nearBlack}]`,
  },
} as const;

// ============================================================================
// PRIORITY COLORS - Consistent across modules
// ============================================================================

export const priorityColors = {
  low: colors.success,
  medium: colors.yellow,
  high: colors.warning,
  urgent: colors.error,
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