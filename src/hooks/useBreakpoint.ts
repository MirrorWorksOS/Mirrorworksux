/**
 * useBreakpoint — JS-level breakpoint detection aligned with Tailwind defaults
 *
 * Returns the current breakpoint name and boolean helpers for common layout decisions.
 * Uses useMediaQuery under the hood for live, resize-responsive updates.
 *
 * Breakpoints (Tailwind defaults):
 *   sm  = 640px
 *   md  = 768px
 *   lg  = 1024px
 *   xl  = 1280px
 *   2xl = 1536px
 */

import { useMediaQuery } from './useMediaQuery';

export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointResult {
  /** Current breakpoint name (xs, sm, md, lg, xl, 2xl) */
  breakpoint: BreakpointName;
  /** True when viewport < 768px (mobile phone) */
  isMobile: boolean;
  /** True when viewport >= 768px and < 1024px (tablet) */
  isTablet: boolean;
  /** True when viewport >= 1024px (desktop / large tablet) */
  isDesktop: boolean;
  /** True when viewport < 1024px (mobile or tablet) */
  isMobileOrTablet: boolean;
  /** Raw boolean per breakpoint threshold */
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
}

export function useBreakpoint(): BreakpointResult {
  const sm = useMediaQuery('(min-width: 640px)');
  const md = useMediaQuery('(min-width: 768px)');
  const lg = useMediaQuery('(min-width: 1024px)');
  const xl = useMediaQuery('(min-width: 1280px)');
  const xxl = useMediaQuery('(min-width: 1536px)');

  let breakpoint: BreakpointName = 'xs';
  if (xxl) breakpoint = '2xl';
  else if (xl) breakpoint = 'xl';
  else if (lg) breakpoint = 'lg';
  else if (md) breakpoint = 'md';
  else if (sm) breakpoint = 'sm';

  return {
    breakpoint,
    isMobile: !md,
    isTablet: md && !lg,
    isDesktop: lg,
    isMobileOrTablet: !lg,
    sm,
    md,
    lg,
    xl,
    xxl,
  };
}
