/**
 * FloorHome — Entry state machine for /floor.
 *
 * Resolves what the operator should see FIRST when they land in kiosk mode.
 * The rule is "gated funnel with auto-resume":
 *
 *   1. activeWorkOrderId set?  →  jump straight to /floor/run/:id
 *                                 (auto-resume: tablet woke from sleep
 *                                  mid-job, don't make them click 4 times)
 *   2. !operatorId?            →  FloorClockIn
 *   3. !stationId?             →  FloorStationPicker
 *   4. otherwise                →  FloorScanJob (pick or scan a WO)
 *
 * Station override via URL: if the kiosk URL has `?station=mach-001`, we
 * eagerly populate the session so permanently-bolted tablets skip the
 * picker forever. The lookup uses getMachines() so a typo in the query
 * string still falls through to the picker (error prevention heuristic).
 *
 * Back-channel: each sub-screen calls into floorSessionStore actions which
 * advance the state machine on the next render — no prop drilling.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useFloorSession } from '@/store/floorSessionStore';
import { makeService } from '@/services/makeService';
import { FloorClockIn } from './FloorClockIn';
import { FloorStationPicker } from './FloorStationPicker';
import { FloorScanJob } from './FloorScanJob';

export function FloorHome() {
  const navigate = useNavigate();
  const session = useFloorSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stationHydrated, setStationHydrated] = useState(false);

  // ── 1. Auto-resume into an active work order ───────────────────────
  useEffect(() => {
    if (session.activeWorkOrderId) {
      navigate(`/floor/run/${session.activeWorkOrderId}`, { replace: true });
    }
  }, [session.activeWorkOrderId, navigate]);

  // ── 2. Resolve ?station= URL param into session state ──────────────
  useEffect(() => {
    const stationParam = searchParams.get('station');
    if (!stationParam) {
      setStationHydrated(true);
      return;
    }
    // If the URL matches the already-selected station, just clear the
    // param (we don't want it lingering in the address bar forever).
    if (session.stationId === stationParam) {
      searchParams.delete('station');
      setSearchParams(searchParams, { replace: true });
      setStationHydrated(true);
      return;
    }
    // Look up the machine and persist to session. Unknown IDs fall through
    // to the picker, which is the safer failure mode.
    let cancelled = false;
    makeService.getMachineById(stationParam).then((machine) => {
      if (cancelled) return;
      if (machine) {
        session.setStation({ id: machine.id, name: machine.name });
      }
      searchParams.delete('station');
      setSearchParams(searchParams, { replace: true });
      setStationHydrated(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for the URL → session hydration to run before deciding.
  if (!stationHydrated) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[var(--neutral-100)]">
        <div className="text-sm text-[var(--neutral-500)]">
          Starting shop floor…
        </div>
      </div>
    );
  }

  // Auto-resume is async (navigate in useEffect). Render a blank frame
  // while that fires to avoid a flash of the clock-in screen.
  if (session.activeWorkOrderId) {
    return <div className="h-full w-full bg-[var(--neutral-100)]" />;
  }

  // ── 3. Gated funnel ────────────────────────────────────────────────
  if (!session.operatorId) {
    return <FloorClockIn />;
  }

  if (!session.stationId) {
    return <FloorStationPicker />;
  }

  return <FloorScanJob />;
}
