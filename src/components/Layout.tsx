/**
 * Layout - Main layout wrapper with responsive sidebar behavior
 *
 * Desktop (>= 1024px): Full sidebar
 * Tablet (768px - 1023px): Icon-only rail sidebar (56px)
 * Mobile (< 768px): No sidebar — bottom tab bar + mobile menu overlay
 */

import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { AgentFAB } from './shared/agent/AgentFAB';
import { useCommandPaletteStore } from '@/store/commandPaletteStore';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { MobileBottomNav } from './shared/layout/MobileBottomNav';
import { MobileMenu } from './shared/layout/MobileMenu';

export function Layout() {
  const location = useLocation();
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPaletteStore();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Sidebar: full on desktop, icon rail on tablet, hidden on mobile */}
      {!isMobile && (
        <Sidebar variant={isTablet ? 'rail' : 'full'} />
      )}

      <main
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
