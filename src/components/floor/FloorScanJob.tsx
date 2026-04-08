/**
 * FloorScanJob — Pick the next work order to run at this station.
 *
 * Two ways to get to a work order:
 *   1. Scan the traveler barcode (WO number or MO number) — fastest on the
 *      floor and what most shops will use. A physical barcode scanner acts
 *      as a keyboard: it types the code and fires Enter, which we capture
 *      here as "submit".
 *   2. Tap from the queue — a list of pending + in-progress work orders
 *      assigned to this station, ordered by sequence. This is the fallback
 *      for paperwork-less shops and when the operator knows what's next.
 *
 * Demo hint: scan "WO-2026-0002" or "MO-2026-0001" from the Alliance Metal
 * mock data set. The matcher is case-insensitive.
 *
 * On successful pick we push the operator to /floor/run/:workOrderId. The
 * work order execution screen then owns the rest of the flow (timer, parts
 * counter, checklist, emergency stop, etc.).
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ScanBarcode,
  Search,
  Clock,
  AlertTriangle,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { makeService } from '@/services/makeService';
import { useFloorSession } from '@/store/floorSessionStore';
import type { WorkOrder, ManufacturingOrder } from '@/types/entities';

export function FloorScanJob() {
  const navigate = useNavigate();
  const session = useFloorSession();

  const [query, setQuery] = useState('');
  const [queue, setQueue] = useState<WorkOrder[]>([]);
  const [mos, setMos] = useState<ManufacturingOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the pending queue for this station + MO map for enrichment.
  useEffect(() => {
    if (!session.stationId) return;
    let cancelled = false;
    Promise.all([
      makeService.getPendingWorkOrdersForStation(session.stationId),
      makeService.getManufacturingOrders(),
    ]).then(([woList, moList]) => {
      if (cancelled) return;
      setQueue(woList);
      setMos(moList);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [session.stationId]);

  // Keep the scan input focused so a hardware scanner "just works".
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const moById = (id: string) => mos.find((m) => m.id === id);

  const runWorkOrder = (wo: WorkOrder) => {
    session.startJob(wo.id);
    navigate(`/floor/run/${wo.id}`);
  };

  const handleScan = () => {
    const raw = query.trim().toUpperCase();
    if (!raw) return;

    // First try: direct WO number match against the live queue.
    const woHit = queue.find((w) => w.woNumber.toUpperCase() === raw);
    if (woHit) {
      runWorkOrder(woHit);
      return;
    }

    // Fallback: MO number → pick the first pending WO for this station on
    // that MO. This lets operators scan the bigger MO traveler barcode at
    // the top of the paper packet.
    const moHit = mos.find((m) => m.moNumber.toUpperCase() === raw);
    if (moHit) {
      const woForMo = queue.find((w) => w.manufacturingOrderId === moHit.id);
      if (woForMo) {
        runWorkOrder(woForMo);
        return;
      }
      setError(
        `MO ${moHit.moNumber} has no pending work at ${session.stationName}.`
      );
      setQuery('');
      return;
    }

    setError(`No match for "${query.trim()}". Try scanning again.`);
    setQuery('');
  };

  return (
    <div className="h-full w-full overflow-auto bg-[var(--neutral-100)]">
      <div className="max-w-[980px] mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--neutral-500)]">
              {session.stationName ?? 'Station'}
            </span>
            <span className="text-[var(--neutral-300)]">•</span>
            <button
              onClick={() => session.clearStation()}
              className="text-xs font-medium text-[var(--neutral-500)] hover:text-[var(--neutral-800)] underline-offset-4 hover:underline"
            >
              Change station
            </button>
          </div>
          <h1 className="text-4xl font-bold text-[var(--neutral-800)] mb-3">
            Scan your traveler
          </h1>
          <p className="text-base text-[var(--neutral-500)] max-w-[620px]">
            Scan the barcode on the top of your paper traveler, or tap a work
            order from the queue below.
          </p>
        </motion.div>

        {/* Scan input */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.2, 0, 0, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 p-2 bg-card border-2 border-[var(--neutral-200)] rounded-[var(--shape-lg)] focus-within:border-[var(--mw-yellow-400)] focus-within:shadow-[var(--elevation-2)] transition-all">
            <div className="w-14 h-14 rounded-[var(--shape-md)] bg-[var(--neutral-100)] flex items-center justify-center shrink-0">
              <ScanBarcode className="w-7 h-7 text-[var(--neutral-800)]" />
            </div>
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setError(null);
                setQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScan();
              }}
              placeholder="Scan or type WO-2026-0002…"
              className="flex-1 h-14 text-xl border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 placeholder:text-[var(--neutral-400)]"
              autoFocus
              spellCheck={false}
              autoCapitalize="characters"
            />
            <Button
              onClick={handleScan}
              disabled={!query.trim()}
              className="h-14 px-6 bg-[var(--neutral-800)] hover:bg-[var(--neutral-900)] text-white font-bold"
            >
              <Search className="w-5 h-5 mr-2" />
              Find
            </Button>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 text-sm text-[var(--mw-error)]">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="mt-3 text-xs text-[var(--neutral-400)]">
            Demo travelers: <span className="font-mono">WO-2026-0002</span>,{' '}
            <span className="font-mono">WO-2026-0003</span>,{' '}
            <span className="font-mono">MO-2026-0001</span>
          </div>
        </motion.div>

        {/* Queue for this station */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.2, 0, 0, 1] }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              Queued at {session.stationName ?? 'this station'}
            </h2>
            <span className="text-xs text-[var(--neutral-400)]">
              {loading
                ? 'Loading…'
                : `${queue.length} ${queue.length === 1 ? 'job' : 'jobs'}`}
            </span>
          </div>

          {loading ? (
            <div className="text-sm text-[var(--neutral-500)]">
              Loading queue…
            </div>
          ) : queue.length === 0 ? (
            <div className="p-8 bg-card border border-dashed border-[var(--neutral-200)] rounded-[var(--shape-lg)] text-center">
              <div className="text-base font-medium text-[var(--neutral-800)] mb-1">
                Nothing queued here right now.
              </div>
              <div className="text-sm text-[var(--neutral-500)]">
                Scan a traveler to start an ad-hoc job, or check with your
                supervisor.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((wo) => {
                const mo = moById(wo.manufacturingOrderId);
                const isActive = wo.status === 'in_progress';
                return (
                  <button
                    key={wo.id}
                    onClick={() => runWorkOrder(wo)}
                    className="group w-full flex items-center gap-4 p-5 bg-card border border-[var(--neutral-200)] rounded-[var(--shape-lg)] text-left hover:border-[var(--mw-yellow-400)] hover:shadow-[var(--elevation-2)] active:scale-[0.995] transition-all min-h-[88px]"
                  >
                    {/* Sequence chip */}
                    <div className="w-14 h-14 rounded-[var(--shape-md)] bg-[var(--neutral-100)] flex flex-col items-center justify-center shrink-0 border border-[var(--neutral-200)]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--neutral-500)]">
                        Seq
                      </span>
                      <span className="text-xl font-bold text-[var(--neutral-800)] tabular-nums leading-none">
                        {wo.sequence}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
                        <span className="text-xs font-mono text-[var(--neutral-500)]">
                          {wo.woNumber}
                        </span>
                        {isActive && (
                          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--mw-yellow-400)]/20 text-[var(--mw-yellow-700)]">
                            In progress
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-[var(--neutral-800)] text-lg leading-tight truncate">
                        {wo.operation}
                      </div>
                      <div className="text-xs text-[var(--neutral-500)] mt-1 truncate">
                        {mo
                          ? `${mo.moNumber} • ${mo.productName} • ${mo.customerName}`
                          : wo.manufacturingOrderId}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="tabular-nums font-medium">
                          {wo.estimatedMinutes} min
                        </span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-[var(--neutral-400)] group-hover:text-[var(--mw-yellow-700)] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
