/**
 * FloorStationPicker — Operator picks which machine this tablet is at.
 *
 * When a tablet is permanently bolted to a specific machine the deployment
 * team sets `?station=<machineId>` in the URL and this screen never renders.
 * But small fab shops often share ONE roving tablet across a dozen stations —
 * in that case the operator has to tell us which station they are standing
 * at right now. The pick persists to floorSessionStore so they only do it
 * once per shift (or until they clear the station).
 *
 * UX:
 *   - Recognition over recall: machines are shown as a tile grid with name,
 *     work centre, and live status dot. No typing, no dropdowns.
 *   - Real-world match: machines are ordered by work centre so the operator
 *     can scan left-to-right for their area.
 *   - Error prevention: machines currently `down` or in `maintenance` are
 *     visually muted but still pickable (an operator at a down machine may
 *     still need to clock in and log time against diagnostics).
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Cog, AlertTriangle, Activity, Wrench, Power } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { makeService } from '@/services/makeService';
import { useFloorSession } from '@/store/floorSessionStore';
import type { Machine } from '@/types/entities';
import type { MachineStatus } from '@/types/common';

// ──────────────────────────────────────────────────────────────────────────
// Status → presentation map. Kept local because the shop-floor kiosk speaks
// a slightly louder visual language than the office views and we do not want
// to drag in the office status-badge styling here.
// ──────────────────────────────────────────────────────────────────────────
const STATUS_META: Record<
  MachineStatus,
  { label: string; dotClass: string; icon: LucideIcon; textClass: string }
> = {
  running: {
    label: 'Running',
    dotClass: 'bg-[var(--mw-green)]',
    icon: Activity,
    textClass: 'text-[var(--mw-green)]',
  },
  idle: {
    label: 'Idle',
    dotClass: 'bg-[var(--neutral-400)]',
    icon: Power,
    textClass: 'text-[var(--neutral-500)]',
  },
  setup: {
    label: 'Setup',
    dotClass: 'bg-[var(--mw-yellow-400)]',
    icon: Cog,
    textClass: 'text-[var(--mw-yellow-700)]',
  },
  down: {
    label: 'Down',
    dotClass: 'bg-[var(--mw-error)]',
    icon: AlertTriangle,
    textClass: 'text-[var(--mw-error)]',
  },
  maintenance: {
    label: 'Maintenance',
    dotClass: 'bg-[var(--neutral-500)]',
    icon: Wrench,
    textClass: 'text-[var(--neutral-500)]',
  },
};

export function FloorStationPicker() {
  const session = useFloorSession();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    makeService.getMachines().then((list) => {
      setMachines(list);
      setLoading(false);
    });
  }, []);

  // Group by work centre for scan-ability. Key order preserved via Map.
  const grouped = useMemo(() => {
    const map = new Map<string, Machine[]>();
    for (const m of machines) {
      const bucket = map.get(m.workCenter) ?? [];
      bucket.push(m);
      map.set(m.workCenter, bucket);
    }
    return Array.from(map.entries());
  }, [machines]);

  const handlePick = (machine: Machine) => {
    session.setStation({ id: machine.id, name: machine.name });
  };

  return (
    <div className="h-full w-full overflow-auto bg-[var(--neutral-100)]">
      <div className="max-w-[1100px] mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          className="mb-10"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--neutral-500)]">
            Hi {session.operatorName?.split(' ')[0] ?? 'there'} — one more step
          </span>
          <h1 className="text-4xl font-bold text-[var(--neutral-800)] mt-2 mb-3">
            Which machine are you at?
          </h1>
          <p className="text-base text-[var(--neutral-500)] max-w-[640px]">
            Pick the station this tablet is standing next to. Your choice is
            remembered for the rest of your shift — you can change it any time
            from the status bar.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-sm text-[var(--neutral-500)]">
            Loading stations…
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([workCenter, list], groupIdx) => (
              <motion.section
                key={workCenter}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.05 * groupIdx,
                  ease: [0.2, 0, 0, 1],
                }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                    {workCenter}
                  </h2>
                  <span className="text-xs text-[var(--neutral-400)]">
                    {list.length} {list.length === 1 ? 'station' : 'stations'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {list.map((machine) => {
                    const meta = STATUS_META[machine.status];
                    const Icon = meta.icon;
                    const isSelected = session.stationId === machine.id;
                    const isOffline =
                      machine.status === 'down' ||
                      machine.status === 'maintenance';

                    return (
                      <button
                        key={machine.id}
                        onClick={() => handlePick(machine)}
                        className={`group relative flex flex-col gap-3 p-5 bg-card rounded-[var(--shape-lg)] border text-left transition-all active:scale-[0.98] min-h-[148px] ${
                          isSelected
                            ? 'border-[var(--mw-yellow-400)] shadow-[var(--elevation-2)] ring-2 ring-[var(--mw-yellow-400)]/40'
                            : 'border-[var(--neutral-200)] hover:border-[var(--mw-yellow-400)] hover:shadow-[var(--elevation-2)]'
                        } ${isOffline ? 'opacity-70' : ''}`}
                        aria-pressed={isSelected}
                      >
                        {/* Status row */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${meta.dotClass} ${
                              machine.status === 'running' ? 'animate-pulse' : ''
                            }`}
                            aria-hidden="true"
                          />
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${meta.textClass}`}
                          >
                            {meta.label}
                          </span>
                          <Icon
                            className={`w-3.5 h-3.5 ml-auto ${meta.textClass}`}
                            aria-hidden="true"
                          />
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[var(--neutral-800)] text-lg leading-tight">
                            {machine.name}
                          </div>
                          {machine.currentJobNumber && (
                            <div className="text-xs text-[var(--neutral-500)] mt-1 line-clamp-1">
                              Running: {machine.currentJobNumber}
                              {machine.operatorName
                                ? ` • ${machine.operatorName}`
                                : ''}
                            </div>
                          )}
                        </div>

                        {/* Utilisation bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--neutral-800)] group-hover:bg-[var(--mw-yellow-400)] transition-colors"
                              style={{
                                width: `${Math.min(100, machine.utilizationToday)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[var(--neutral-500)] tabular-nums">
                            {machine.utilizationToday}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>
        )}

        {/* Help footer */}
        <div className="mt-12 text-xs text-[var(--neutral-500)]">
          Missing a machine? Ask a supervisor to add it to the shop floor
          roster under{' '}
          <span className="font-medium text-[var(--neutral-800)]">
            Control → Machines
          </span>
          .
        </div>
      </div>
    </div>
  );
}
