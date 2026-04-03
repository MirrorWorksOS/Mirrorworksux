/**
 * Layout - Main layout wrapper with sidebar and warm background
 */

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { useCommandPaletteStore } from '@/store/commandPaletteStore';

export function Layout() {
  const location = useLocation();
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPaletteStore();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

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
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[var(--app-canvas)]">
        <Outlet />
      </main>
    </div>
  );
}
