/**
 * MakeQualityDashboard — in-context quality KPIs for the Make module Quality tab.
 *
 * Displays: FPY, scrap rate, open NCR/CAPA counts, on-time inspection %, 30-day
 * FPY trend, top-5 defect pareto, recent NCR list, and open CAPAs. A corner link
 * keeps the dedicated /make/quality deep-dive route accessible.
 */

import { useNavigate } from 'react-router';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ClipboardList,
  Timer,
  ExternalLink,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { KpiStatCard } from '@/components/shared/cards/KpiStatCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { cn } from '@/components/ui/utils';
import { capaRecords, ncrRecords } from '@/services/mock/data';

// ─── Mock KPI values ────────────────────────────────────────────────────────

const FPY_PERCENT = 94.2;
const SCRAP_RATE_PERCENT = 3.1;
const ON_TIME_INSPECTION_PERCENT = 96;

const openCapas = capaRecords.filter((c) => c.status !== 'closed');
const openNcrs = ncrRecords.filter((n) => n.status !== 'closed');

// ─── 30-day FPY trend (day 1 = oldest) ──────────────────────────────────────

const FPY_TREND: number[] = [
  91, 90, 92, 93, 91, 88, 89, 92, 94, 93,
  95, 96, 94, 93, 91, 92, 94, 95, 96, 97,
  95, 94, 93, 95, 96, 94, 95, 96, 94, 94,
];

// ─── Top-5 defect pareto ──────────────────────────────────────────────────────

const DEFECT_PARETO = [
  { label: 'Dimensional', count: 23 },
  { label: 'Surface Finish', count: 18 },
  { label: 'Weld Defect', count: 14 },
  { label: 'Material Defect', count: 9 },
  { label: 'Equipment Error', count: 6 },
];
const PARETO_MAX = DEFECT_PARETO[0].count;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FpyTrendChart() {
  const min = Math.min(...FPY_TREND);
  const max = Math.max(...FPY_TREND);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-[2px] h-[120px] w-full">
      {FPY_TREND.map((val, i) => {
        const heightPct = Math.round(((val - min) / range) * 75) + 25;
        const isGood = val >= 95;
        const isWarn = val >= 90 && val < 95;
        return (
          <div
            key={i}
            title={`Day ${i + 1}: ${val}%`}
            className="flex-1 rounded-t transition-all duration-200 hover:opacity-80 cursor-default"
            style={{
              height: `${heightPct}%`,
              backgroundColor: isGood
                ? 'var(--mw-success)'
                : isWarn
                ? 'var(--mw-mirage)'
                : 'var(--mw-warning)',
            }}
          />
        );
      })}
    </div>
  );
}

function ParetoChart() {
  return (
    <div className="space-y-2.5">
      {DEFECT_PARETO.map((row) => {
        const pct = Math.round((row.count / PARETO_MAX) * 100);
        return (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground truncate">{row.label}</span>
              <span className="text-xs text-[var(--neutral-500)] tabular-nums ml-2 shrink-0">
                {row.count}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: 'var(--mw-mirage)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MakeQualityDashboard() {
  const navigate = useNavigate();

  const fpyDelta = FPY_TREND[FPY_TREND.length - 1] - FPY_TREND[0];
  const fpyUp = fpyDelta >= 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header row with "Open full Quality" shortcut */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-foreground">Quality Overview</h2>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">Last 30 days · Alliance Metal Fabrication</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-[var(--neutral-500)] hover:text-foreground"
            onClick={() => navigate('/make/quality')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open full Quality
          </Button>
        </div>
      </motion.div>

      {/* ── KPI Tiles ───────────────────────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {/* First-pass yield */}
          <KpiStatCard
            layout="compact"
            label="First-Pass Yield"
            value=""
            animatedValue={FPY_PERCENT}
            format={(n) => `${n.toFixed(1)}%`}
            icon={CheckCircle2}
            iconSurface="onLight"
            valueClassName="text-2xl font-bold text-[var(--mw-success)]"
            footer={
              <div className={cn(
                'mt-1 flex items-center gap-1 text-[10px] font-medium',
                fpyUp ? 'text-[var(--mw-success)]' : 'text-[var(--mw-error)]',
              )}>
                {fpyUp
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {fpyUp ? '+' : ''}{fpyDelta.toFixed(1)}pp vs 30d ago
              </div>
            }
          />

          {/* Scrap rate */}
          <KpiStatCard
            layout="compact"
            label="Scrap Rate"
            value=""
            animatedValue={SCRAP_RATE_PERCENT}
            format={(n) => `${n.toFixed(1)}%`}
            icon={AlertTriangle}
            iconSurface="onLight"
            valueClassName="text-2xl font-bold text-[var(--mw-warning)]"
          />

          {/* Open NCRs */}
          <KpiStatCard
            layout="compact"
            label="Open NCRs"
            value=""
            animatedValue={openNcrs.length}
            icon={ClipboardList}
            iconSurface="onLight"
            valueClassName={cn(
              'text-2xl font-bold',
              openNcrs.length > 5
                ? 'text-[var(--mw-error)]'
                : 'text-foreground',
            )}
          />

          {/* Open CAPAs */}
          <KpiStatCard
            layout="compact"
            label="Open CAPAs"
            value=""
            animatedValue={openCapas.length}
            icon={ShieldAlert}
            iconSurface="onLight"
            valueClassName={cn(
              'text-2xl font-bold',
              openCapas.length > 3
                ? 'text-[var(--mw-warning)]'
                : 'text-foreground',
            )}
          />

          {/* On-time inspection */}
          <KpiStatCard
            layout="compact"
            label="On-Time Inspection"
            value=""
            animatedValue={ON_TIME_INSPECTION_PERCENT}
            format={(n) => `${n}%`}
            icon={Timer}
            iconSurface="onLight"
            valueClassName="text-2xl font-bold text-foreground"
          />
        </div>
      </motion.div>

      {/* ── Trend + Pareto row ───────────────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 30-day FPY trend */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-foreground">First-Pass Yield — 30 Days</h3>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">Daily FPY % across all operations</p>
              </div>
            </div>
            <FpyTrendChart />
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-success)' }} />
                <span className="text-xs text-[var(--neutral-500)]">≥ 95% (target)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-mirage)' }} />
                <span className="text-xs text-[var(--neutral-500)]">90–95%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--mw-warning)' }} />
                <span className="text-xs text-[var(--neutral-500)]">{'< 90%'}</span>
              </div>
            </div>
          </Card>

          {/* Top defect pareto */}
          <Card className="p-6">
            <h3 className="text-base font-medium text-foreground mb-1">Top Defect Reasons</h3>
            <p className="text-xs text-[var(--neutral-500)] mb-4">Last 30 days · count of NCRs</p>
            <ParetoChart />
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--neutral-500)]">
                Total:{' '}
                <span className="font-medium text-foreground tabular-nums">
                  {DEFECT_PARETO.reduce((s, r) => s + r.count, 0)} NCRs
                </span>
              </p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* ── Recent NCRs ──────────────────────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Recent NCRs</h3>
            <Badge
              className={cn(
                'border-0 text-xs',
                openNcrs.length > 0
                  ? 'bg-[var(--mw-error-light)] text-[var(--mw-error)]'
                  : 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
              )}
            >
              {openNcrs.length} open
            </Badge>
          </div>
          <div className="space-y-0 divide-y divide-[var(--border)]">
            {ncrRecords.slice(0, 10).map((ncr) => (
              <div
                key={ncr.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-medium text-foreground tabular-nums shrink-0">
                      {ncr.ncrNumber}
                    </span>
                    {ncr.workOrderNumber && (
                      <span className="text-xs text-[var(--neutral-500)] shrink-0">
                        · {ncr.workOrderNumber}
                      </span>
                    )}
                    <StatusBadge priority={ncr.severity} />
                  </div>
                  <p className="text-xs text-[var(--neutral-600)] dark:text-[var(--neutral-400)] truncate">
                    {ncr.title}
                  </p>
                  <p className="text-[10px] text-[var(--neutral-500)] mt-0.5">
                    {ncr.defectType} · {ncr.reportedBy} · {ncr.reportedDate}
                  </p>
                </div>
                <StatusBadge status={ncr.status} />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Open CAPAs ───────────────────────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Open CAPAs</h3>
            <Badge className="border-0 text-xs bg-[var(--neutral-100)] text-[var(--neutral-600)]">
              {openCapas.length} open
            </Badge>
          </div>
          {openCapas.length === 0 ? (
            <p className="text-sm text-[var(--neutral-500)] py-4 text-center">No open CAPAs</p>
          ) : (
            <div className="space-y-0 divide-y divide-[var(--border)]">
              {openCapas.map((capa) => {
                const overdue = isOverdue(capa.dueDate);
                return (
                  <div
                    key={capa.id}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <StatusBadge priority={capa.severity} />
                        {capa.jobNumber && (
                          <span className="text-xs text-[var(--neutral-500)] shrink-0">
                            {capa.jobNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground">{capa.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[var(--neutral-500)]">
                        <span>Owner: {capa.assignedToName}</span>
                        <span
                          className={cn(
                            'tabular-nums font-medium',
                            overdue ? 'text-[var(--mw-error)]' : 'text-[var(--neutral-500)]',
                          )}
                        >
                          Due {capa.dueDate}{overdue ? ' · Overdue' : ''}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={capa.status} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
