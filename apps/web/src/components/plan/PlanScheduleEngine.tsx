/**
 * Schedule Engine — AI-powered work-centre Gantt with auto-sequencing.
 *
 * Sibling to the manual /plan/schedule view. Orchestrates KPI cards, the
 * status-coloured Gantt, the Auto-Schedule confirmation flow, and the AI
 * loading sequence with animated reflow on apply.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { toast as sonnerToast } from 'sonner';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { useScheduleEngineStore } from '@/store/scheduleEngineStore';
import type { AutoScheduleRequest } from '@/types/entities';

import { AvgUtilisationCard } from './schedule-engine/cards/AvgUtilisationCard';
import { ActiveJobsCard } from './schedule-engine/cards/ActiveJobsCard';
import { ScheduleHealthCard } from './schedule-engine/cards/ScheduleHealthCard';
import { BottleneckCard } from './schedule-engine/cards/BottleneckCard';
import { LateRiskCard } from './schedule-engine/cards/LateRiskCard';
import { ScheduleGantt } from './schedule-engine/gantt/ScheduleGantt';
import { AutoScheduleDialog } from './schedule-engine/dialogs/AutoScheduleDialog';
import { AiStatusPanel } from './schedule-engine/panels/AiStatusPanel';
import { ProposalBanner } from './schedule-engine/panels/ProposalBanner';
import { JobDetailSheet } from './schedule-engine/panels/JobDetailSheet';
import { IssuesSheet } from './schedule-engine/panels/IssuesSheet';
import { useAutoScheduleRunner } from './schedule-engine/hooks/useAutoScheduleRunner';

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function PlanScheduleEngine() {
  const current = useScheduleEngineStore((s) => s.current);
  const proposed = useScheduleEngineStore((s) => s.proposed);
  const proposalSummary = useScheduleEngineStore((s) => s.proposalSummary);
  const runState = useScheduleEngineStore((s) => s.runState);
  const currentStepIndex = useScheduleEngineStore((s) => s.currentStepIndex);
  const toast = useScheduleEngineStore((s) => s.toast);
  const loadSnapshot = useScheduleEngineStore((s) => s.loadSnapshot);
  const applyProposal = useScheduleEngineStore((s) => s.applyProposal);
  const discardProposal = useScheduleEngineStore((s) => s.discardProposal);
  const clearToast = useScheduleEngineStore((s) => s.clearToast);

  const { start, cancel } = useAutoScheduleRunner();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!current) void loadSnapshot();
  }, [current, loadSnapshot]);

  // Bridge our store toast → sonner.
  useEffect(() => {
    if (!toast) return;
    sonnerToast.success(toast);
    clearToast();
  }, [toast, clearToast]);

  const view = proposed ?? current;
  const isProposed = !!proposed;

  // Compute which blocks moved between snapshots (by id) — drives the yellow
  // border highlight on the proposed-state Gantt.
  const movedBlockIds = useMemo(() => {
    if (!current || !proposed) return new Set<string>();
    const currentMap = new Map(current.blocks.map((b) => [b.id, `${b.startTime}-${b.workCenterId}`]));
    const moved = new Set<string>();
    proposed.blocks.forEach((b) => {
      const prev = currentMap.get(b.id);
      if (prev !== `${b.startTime}-${b.workCenterId}`) moved.add(b.id);
    });
    return moved;
  }, [current, proposed]);

  const handleAutoScheduleClick = () => {
    if (runState === 'awaiting_approval') {
      void applyProposal();
      return;
    }
    setDialogOpen(true);
  };

  const handleConfirm = useCallback(
    (req: AutoScheduleRequest) => {
      void start(req);
    },
    [start],
  );

  const stateCopy = (() => {
    if (!view) return 'Loading schedule…';
    if (view.source.kind === 'ai') {
      return `Auto-scheduled ${formatRelative(view.generatedAt)} by AI · ${view.source.movedJobIds.length} jobs moved · ${view.source.eliminatedRisks} late risks remaining`;
    }
    return `Last scheduled ${formatRelative(view.generatedAt)} by ${view.source.byName}`;
  })();

  // Auto-Schedule button label/icon shifts when a proposal is awaiting approval.
  const ctaLabel =
    runState === 'running'
      ? 'Scheduling…'
      : runState === 'awaiting_approval'
        ? 'Apply schedule'
        : 'Auto-Schedule';

  return (
    <PageShell className="flex h-[calc(100dvh-var(--app-header-height,0px))] flex-col space-y-5 p-6">
      <PageHeader
        title="Schedule Engine"
        subtitle="Work-centre Gantt with AI sequencing"
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'Schedule Engine' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {runState === 'awaiting_approval' && (
              <Button variant="outline" className="h-12" onClick={() => void discardProposal()}>
                Discard
              </Button>
            )}
            <div
              className={`rounded-full ${runState === 'running' ? 'ai-card-glow ai-card-glow--animating' : ''}`}
            >
              <Button
                size="lg"
                onClick={handleAutoScheduleClick}
                disabled={runState === 'running'}
                className="h-14 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)]"
              >
                {runState === 'awaiting_approval' ? (
                  <Check className="mr-2 h-5 w-5" strokeWidth={2} />
                ) : (
                  <Sparkles
                    className={`mr-2 h-5 w-5 ${runState === 'running' ? 'animate-spin-slow' : ''}`}
                    strokeWidth={1.5}
                  />
                )}
                {ctaLabel}
              </Button>
            </div>
          </div>
        }
      />

      <p className="-mt-4 text-xs tabular-nums text-[var(--neutral-500)]">{stateCopy}</p>

      {isProposed && proposalSummary && (
        <ProposalBanner
          summary={proposalSummary}
          onApply={() => void applyProposal()}
          onDiscard={() => void discardProposal()}
        />
      )}

      {/* KPI strip: single row of 5 light, fixed-height tiles. */}
      {view && (
        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <AvgUtilisationCard kpis={view.kpis} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <ActiveJobsCard kpis={view.kpis} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <ScheduleHealthCard snapshot={view} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <BottleneckCard kpis={view.kpis} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <LateRiskCard kpis={view.kpis} />
          </motion.div>
        </motion.div>
      )}

      {view && (
        <div className="min-h-0 flex-1">
          <ScheduleGantt
            snapshot={view}
            isProposed={isProposed}
            movedBlockIds={movedBlockIds}
            runState={runState}
            currentStepIndex={currentStepIndex}
          />
        </div>
      )}

      <AutoScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirm}
      />

      <AiStatusPanel
        visible={runState === 'running'}
        currentStepIndex={currentStepIndex}
        onCancel={cancel}
      />

      {view && (
        <>
          <JobDetailSheet snapshot={view} />
          <IssuesSheet snapshot={view} />
        </>
      )}

      <style>{`
        .animate-spin-slow { animation: mw-spin 4s linear infinite; }
        @keyframes mw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </PageShell>
  );
}
