/**
 * Shared dashboard chrome — section titling, accent surfaces (home / command surfaces).
 * Typography: skip-a-weight pairing uses bold titles + light supporting copy elsewhere.
 */

/** Primary section titles — Agent, charts, Operations pulse, Recent jobs, Shortcuts, etc. */
export const dashboardSectionTitleClass =
  "text-2xl font-bold tracking-tight text-[var(--mw-mirage)] dark:text-[var(--neutral-900)] sm:text-3xl";

/** Supporting copy under section titles — slightly brighter in dark for contrast on mirage cards */
export const dashboardSectionSubtitleClass =
  "text-base font-light leading-relaxed text-muted-foreground dark:text-[var(--neutral-800)] sm:text-lg max-w-3xl";

/** 1px card outline — design system cards use single hairline borders */
export const mwHairlineBorder =
  "border border-[var(--neutral-200)] dark:border-[var(--border)]";

/** MW Yellow 400 pill on dark text (#2C2C2C) — chips, suggestion CTAs */
export const mwPillYellowClass =
  "rounded-full border border-[#0A0A0A]/10 bg-[var(--mw-yellow-400)] font-bold text-[#2C2C2C]";

/**
 * Agent “Suggestions” label — pale yellow surface, deep amber text, no stroke (degraded-chip style).
 */
export const mwSuggestionLabelClass =
  "rounded-full border-0 bg-[var(--mw-yellow-50)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--mw-yellow-900)] dark:bg-[var(--mw-yellow-100)] dark:text-[var(--mw-yellow-800)]";

/**
 * Agent prompt rows — primary CTA yellow (same as app-wide primary actions). Soft “degraded”
 * styling is reserved for {@link mwSuggestionLabelClass} only.
 */
export const mwAgentChipClass =
  "rounded-full border border-[#0A0A0A]/10 bg-[var(--mw-yellow-400)] px-5 py-3 text-left text-sm font-light leading-snug text-[#2C2C2C] transition-[background-color,box-shadow,transform] duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)] hover:bg-[var(--mw-yellow-500)] hover:shadow-xs dark:border-[#0A0A0A]/20";

/** Subtle hover lift — Motion / CSS */
export const mwSubtleHoverTransition =
  "duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)]";
