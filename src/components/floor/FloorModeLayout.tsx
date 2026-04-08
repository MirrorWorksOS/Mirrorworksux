/**
 * FloorModeLayout — Kiosk shell for the shop-floor operator experience.
 *
 * This is a SIBLING to the main <Layout /> (which wraps all office routes
 * with the sidebar, banners, agent FAB, command palette, etc.). Floor mode
 * deliberately has NONE of that: an operator standing at a machine with
 * gloves on does not need a Sell upgrade banner, a global search box, or
 * the Make sidebar. The URL is the mode — if you are at /floor/*, you are
 * in kiosk chrome, period.
 *
 * What lives here:
 *   - A full-viewport dark-friendly canvas
 *   - A minimal status bar (online indicator + operator name + leave button)
 *   - <Outlet /> for the floor sub-routes (FloorHome, FloorRun, …)
 *
 * What does NOT live here:
 *   - Sidebar
 *   - Global banners (Sell upgrade, etc.)
 *   - Agent FAB (no AI chat at the machine)
 *   - Command palette keyboard hooks
 */

import { Outlet, useNavigate } from 'react-router';
import { LogOut, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFloorSession } from '@/store/floorSessionStore';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function FloorModeLayout() {
  const navigate = useNavigate();
  const session = useFloorSession();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [leaveOpen, setLeaveOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLeave = () => {
    // Explicit exit. We do NOT auto-clock-out — leaving floor mode and
    // clocking out are separate concerns. Leaving just returns to the
    // office view; clock-out must be performed intentionally.
    setLeaveOpen(false);
    navigate('/make/shop-floor');
  };

  return (
    <div className="fixed inset-0 bg-[var(--neutral-100)] flex flex-col overflow-hidden font-sans">
      {/* Minimal status bar (48px). Visible only when there IS an active
          operator session — the clock-in screen renders completely full-bleed
          so it feels like a lock screen. */}
      {session.operatorId && (
        <div className="h-12 shrink-0 bg-card border-b border-[var(--neutral-200)] flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 bg-[var(--neutral-100)] px-3 py-1 rounded-full border border-[var(--neutral-200)]">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[var(--mw-green)]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--neutral-500)]">
                    Online
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--neutral-500)]">
                    Offline
                  </span>
                </>
              )}
            </div>
            <span className="text-sm font-medium text-[var(--neutral-800)] truncate">
              {session.operatorName}
            </span>
            {session.stationName && (
              <>
                <span className="text-[var(--neutral-300)]">•</span>
                <span className="text-sm text-[var(--neutral-500)] truncate">
                  {session.stationName}
                </span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-[var(--neutral-500)] hover:text-[var(--neutral-800)]"
            onClick={() => setLeaveOpen(true)}
            aria-label="Leave shop floor mode"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Leave Shop Floor
          </Button>
        </div>
      )}

      {/* Floor route outlet — each child is responsible for its own full-bleed
          layout within the remaining viewport. */}
      <div className="flex-1 min-h-0 relative">
        <Outlet />
      </div>

      {/* Leave confirmation — prevents accidental exits mid-shift.
          Error prevention heuristic: users often tap things by mistake. */}
      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Shop Floor Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              You will return to the office view.
              {session.activeWorkOrderId ? (
                <>
                  {' '}
                  Your active work order stays running in the background — when
                  you return to Shop Floor you will be auto-resumed into it.
                </>
              ) : (
                <>
                  {' '}
                  You will remain clocked in until you explicitly clock out.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on the floor</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave}>
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
