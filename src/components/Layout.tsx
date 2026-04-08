/**
 * Layout - Main layout wrapper with responsive sidebar behavior
 *
 * Desktop (>= 1024px): Full sidebar — user can manually collapse to icon rail
 *                      via the chevron toggle in the sidebar header (persisted
 *                      to localStorage as `mw.sidebar.collapsed`).
 * Tablet (768px - 1023px): Icon-only rail sidebar (56px) — always rail.
 * Mobile (< 768px): No sidebar — bottom tab bar + mobile menu overlay.
 */

import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { AgentFAB } from './shared/agent/AgentFAB';
import { useCommandPaletteStore } from '@/store/commandPaletteStore';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { MobileBottomNav } from './shared/layout/MobileBottomNav';
import { MobileMenu } from './shared/layout/MobileMenu';

const SIDEBAR_COLLAPSED_KEY = 'mw.sidebar.collapsed';

export function Layout() {
  const location = useLocation();
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPaletteStore();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Manual collapse — only relevant on desktop. Tablet always renders rail.
  const [manuallyCollapsed, setManuallyCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  });

  const toggleSidebarCollapsed = useCallback(() => {
    setManuallyCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore quota / private mode */
      }
      return next;
    });
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isDesktop) {
      setMobileMenuOpen(false);
    }
  }, [isDesktop]);

  // Typeahead: on dashboard, any printable key opens the command palette with that character
  useEffect(() => {
    if (!isDashboard || commandOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input, textarea, or contenteditable
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;

      // Ignore modifier-only keys and special keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;

      // Single printable character — open palette with it
      e.preventDefault();
      setCommandOpen(true, e.key);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDashboard, commandOpen, setCommandOpen]);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Skip-to-main-content link — WCAG 2.4.1 Level A.
          Screen-reader-only until focused, then visible at top-left. */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Sidebar: full on desktop, icon rail on tablet, hidden on mobile.
          Desktop users can also manually collapse the full sidebar to a rail. */}
      {!isMobile && (
        <Sidebar
          variant={isTablet || manuallyCollapsed ? 'rail' : 'full'}
          canToggleCollapse={!isTablet}
          collapsed={manuallyCollapsed}
          onToggleCollapse={toggleSidebarCollapsed}
        />
      )}

      <main
        id="main-content"
        tabIndex={-1}
        className={
          isMobile
            ? 'flex-1 overflow-auto bg-[var(--app-canvas)] pb-mobile-nav'
            : 'flex-1 overflow-auto bg-[var(--app-canvas)]'
        }
      >
        <Outlet />
      </main>

      {/* Mobile bottom nav + menu overlay */}
      {isMobile && (
        <>
          <MobileBottomNav onMenuOpen={() => setMobileMenuOpen(true)} />
          <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </>
      )}

      <AgentFAB />
    </div>
  );
}
