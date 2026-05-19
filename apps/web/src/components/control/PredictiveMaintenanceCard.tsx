/**
 * PredictiveMaintenanceCard — surfaces ML-style maintenance predictions
 * across the shop floor. Each prediction lists the machine, plain-English
 * forecast, severity, expandable "Why?" rationale, and a CTA to schedule
 * service.
 *
 * Mock-only: predictions live inline; the CTA fires a toast.
 *
 * Two variants:
 *  - `default` (full card) — used on Control / Machines
 *  - `compact` (summary)   — used on Make / Dashboard
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ChevronDown, Sparkles, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

export type PredictionSeverity = 'critical' | 'warning' | 'info';

export interface MaintenancePrediction {
  id: string;
  machine: string;
  prediction: string;
  severity: PredictionSeverity;
  /** ISO date string for the suggested service date — used in the toast. */
  suggestedDate: string;
  /** 2–3 data points that drove the prediction. */
  evidence: string[];
}

export const PREDICTED_MAINTENANCE: MaintenancePrediction[] = [
  {
    id: 'pm-press-1',
    machine: 'Press Brake #1',
    prediction: 'Hydraulic pressure trending down — service within 7 days.',
    severity: 'critical',
    suggestedDate: '2026-05-14',
    evidence: [
      'Pump pressure 178 bar vs 195 bar baseline (-9%) over last 10 cycles.',
      'Reservoir temperature climbing 2.4 °C above 30-day mean.',
      'Pattern matches 2024 failure on identical Amada HFE3 unit.',
    ],
  },
  {
    id: 'pm-cnc-01',
    machine: 'CNC-01',
    prediction: 'Spindle bearing wear — ~40 hrs to failure, schedule before WO-006.',
    severity: 'warning',
    suggestedDate: '2026-05-18',
    evidence: [
      'Vibration sensor +18% over baseline on Z-axis.',
      'Oil-temp pattern matches historical failure signature.',
      'Acoustic emission spikes correlate with toolchange events.',
    ],
  },
  {
    id: 'pm-laser-02',
    machine: 'Laser-02',
    prediction: 'Optics fouling — predicted decline in cut quality in ~120 hrs.',
    severity: 'info',
    suggestedDate: '2026-05-24',
    evidence: [
      'Assist-gas flow holding +4% above nominal to maintain pierce time.',
      'Kerf width drift trending up on 6 mm mild steel jobs.',
      'Last lens clean 412 hours ago vs 350-hour cadence.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Styling helpers
// ---------------------------------------------------------------------------

const SEVERITY_STYLES: Record<PredictionSeverity, {
  dot: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  label: string;
}> = {
  critical: {
    dot: 'bg-[var(--mw-error)]',
    badgeBg: 'bg-[var(--mw-error-light)] dark:bg-[var(--mw-error)]/15',
    badgeText: 'text-[var(--mw-error)]',
    borderAccent: 'var(--mw-error)',
    label: 'Critical',
  },
  warning: {
    dot: 'bg-[var(--mw-warning)]',
    badgeBg: 'bg-[var(--mw-warning-light)] dark:bg-[var(--mw-warning)]/15',
    badgeText: 'text-[var(--mw-yellow-700)] dark:text-[var(--mw-yellow-400)]',
    borderAccent: 'var(--mw-warning)',
    label: 'Warning',
  },
  info: {
    dot: 'bg-[var(--mw-info)]',
    badgeBg: 'bg-[var(--mw-blue-50)] dark:bg-[var(--mw-info)]/15',
    badgeText: 'text-[var(--mw-info)]',
    borderAccent: 'var(--mw-info)',
    label: 'Info',
  },
};

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function schedule(p: MaintenancePrediction) {
  // TODO(backend): maintenance.schedule({ machineId, suggestedDate })
  toast.info(`Maintenance scheduled for ${p.machine} on ${p.suggestedDate}`);
}

// ---------------------------------------------------------------------------
// Row (default variant)
// ---------------------------------------------------------------------------

function PredictionRow({ prediction }: { prediction: MaintenancePrediction }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_STYLES[prediction.severity];

  return (
    <div
      className="rounded-md border border-[var(--neutral-200)] dark:border-[var(--border)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-200)]/40 p-4"
      style={{ borderLeft: `3px solid ${cfg.borderAccent}` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={cn('h-2 w-2 rounded-full shrink-0', cfg.dot)} aria-hidden />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{prediction.machine}</span>
              <Badge className={cn('border-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5', cfg.badgeBg, cfg.badgeText)}>
                {cfg.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--neutral-600)] dark:text-[var(--muted-foreground)]">
              {prediction.prediction}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5 rounded-full h-8"
          onClick={() => schedule(prediction)}
        >
          <Wrench className="w-3.5 h-3.5" />
          Schedule maintenance
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--neutral-600)] dark:text-[var(--muted-foreground)] hover:text-foreground transition-colors"
        aria-expanded={expanded}
      >
        Why?
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden mt-2 space-y-1 text-xs text-[var(--neutral-600)] dark:text-[var(--muted-foreground)] list-disc pl-5"
          >
            {prediction.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full card — used on /control/machines
// ---------------------------------------------------------------------------

export function PredictiveMaintenanceCard() {
  return (
    <Card className="p-6" style={{ borderLeft: '4px solid var(--mw-warning)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--mw-yellow-500)]" />
          <h3 className="text-base font-medium text-foreground">Predicted maintenance</h3>
        </div>
        <Badge className="border-0 bg-[var(--mw-warning)]/10 text-[var(--mw-warning)]">
          {PREDICTED_MAINTENANCE.length} signals
        </Badge>
      </div>
      <div className="space-y-3">
        {PREDICTED_MAINTENANCE.map((p) => (
          <PredictionRow key={p.id} prediction={p} />
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Compact summary — used on /make
// ---------------------------------------------------------------------------

export function PredictiveMaintenanceSummary({
  onViewAll,
}: {
  onViewAll?: () => void;
}) {
  const counts = PREDICTED_MAINTENANCE.reduce(
    (acc, p) => ({ ...acc, [p.severity]: (acc[p.severity] ?? 0) + 1 }),
    {} as Record<PredictionSeverity, number>,
  );
  const top = [...PREDICTED_MAINTENANCE].sort((a, b) => {
    const order: Record<PredictionSeverity, number> = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  })[0];
  const topCfg = SEVERITY_STYLES[top.severity];

  return (
    <Card className="p-6 h-full" style={{ borderLeft: '4px solid var(--mw-warning)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--mw-warning)]" />
          <h3 className="text-base font-medium text-foreground">Predicted maintenance</h3>
        </div>
        <Badge className="border-0 bg-[var(--mw-warning)]/10 text-[var(--mw-warning)] text-xs">
          {PREDICTED_MAINTENANCE.length}
        </Badge>
      </div>

      <div className="flex items-center gap-3 mb-4 text-xs text-[var(--neutral-500)]">
        {(['critical', 'warning', 'info'] as PredictionSeverity[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', SEVERITY_STYLES[s].dot)} />
            <span className="tabular-nums font-medium text-foreground">{counts[s] ?? 0}</span>
            <span>{SEVERITY_STYLES[s].label.toLowerCase()}</span>
          </span>
        ))}
      </div>

      <div
        className="rounded-md border border-[var(--neutral-200)] dark:border-[var(--border)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-200)]/40 p-3"
        style={{ borderLeft: `3px solid ${topCfg.borderAccent}` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('h-2 w-2 rounded-full', topCfg.dot)} />
          <span className="text-sm font-medium text-foreground">{top.machine}</span>
          <Badge className={cn('border-0 text-[10px] uppercase px-1.5 py-0.5', topCfg.badgeBg, topCfg.badgeText)}>
            {topCfg.label}
          </Badge>
        </div>
        <p className="text-xs text-[var(--neutral-600)] dark:text-[var(--muted-foreground)] mb-3">
          {top.prediction}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-8 gap-1.5"
            onClick={() => schedule(top)}
          >
            <Wrench className="w-3.5 h-3.5" />
            Schedule maintenance
          </Button>
          {onViewAll && (
            <Button size="sm" variant="ghost" className="rounded-full h-8" onClick={onViewAll}>
              View all
            </Button>
          )}
        </div>
        <p className="text-[10px] text-[var(--neutral-500)] mt-2">
          Suggested: {formatLongDate(top.suggestedDate)}
        </p>
      </div>
    </Card>
  );
}
