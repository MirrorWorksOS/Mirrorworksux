import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, LifeBuoy, Lock, Printer } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { useFloorExecutionStore } from '@/store/floorExecutionStore';

import { AndonTopBar } from './AndonTopBar';
import { OperationHeaderCard } from './OperationHeaderCard';
import { ReferencePanel } from './ReferencePanel';
import { MaterialsPickListCard } from './MaterialsPickListCard';
import { QualityActionsRow } from './QualityActionsRow';
import { PrimaryActionCard } from './PrimaryActionCard';
import { RoutingStrip } from './RoutingStrip';
import { TimeSummaryGrid } from './TimeSummaryGrid';
import { QuickActionsFooter } from './QuickActionsFooter';
import { ScrapDialog } from './dialogs/ScrapDialog';
import { NCRDialog } from './dialogs/NCRDialog';
import { HoldDialog } from './dialogs/HoldDialog';
import { PrintLabelDialog } from './dialogs/PrintLabelDialog';
import { CloseWODialog } from './dialogs/CloseWODialog';
import { RoutingStepDrawer } from './RoutingStepDrawer';
import type {
  AndonStatus,
  ExecutionMutation,
  ExecutionWorkflowStep,
  PickListRow,
  ReferenceView,
  WorkOrderExecutionSnapshot,
} from './types';

interface FloorExecutionScreenProps {
  mode: 'overlay' | 'route';
  snapshot: WorkOrderExecutionSnapshot;
  onClose: () => void;
  onSwitchOperator?: (handoverNote: string) => void;
}

const IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes of no input → start lock countdown
const LOCK_COUNTDOWN_MS = 30 * 1000; // 30 seconds warning before lock
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;

type DerivedState =
  | 'awaiting_first_off'
  | 'pick_required'
  | 'running'
  | 'on_hold'
  | 'failed_pending_ncr'
  | 'complete';

type ReferenceSegment = Exclude<ReferenceView, 'checklist'>;

export function FloorExecutionScreen({
  mode,
  snapshot,
  onClose,
}: FloorExecutionScreenProps) {
  const {
    referenceViews,
    queuedMutations,
    setReferenceView,
    queueMutation,
  } = useFloorExecutionStore();

  const workOrderId = snapshot.workOrderId;
  const persistedView =
    (referenceViews[workOrderId] as ReferenceSegment | undefined) ?? null;
  const referenceDefault: ReferenceSegment =
    snapshot.referenceViewDefault === 'checklist'
      ? 'drawing'
      : (snapshot.referenceViewDefault as ReferenceSegment);
  const referenceView: ReferenceSegment = persistedView ?? referenceDefault;

  const [scrapOpen, setScrapOpen] = useState(false);
  const [ncrOpen, setNcrOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [routingStep, setRoutingStep] = useState<ExecutionWorkflowStep | null>(null);
  const [overrideState, setOverrideState] = useState<DerivedState | null>(null);
  const [stepCheckIds, setStepCheckIds] = useState<string[]>([]);
  const [now, setNow] = useState(Date.now());
  const [helpRequestedAt, setHelpRequestedAt] = useState<number | null>(null);
  const [scanningRowId, setScanningRowId] = useState<string | null>(null);
  const [cycleSeconds, setCycleSeconds] = useState(0);
  const [advancedSteps, setAdvancedSteps] = useState<number[]>([]);
  const [closedConfirmation, setClosedConfirmation] = useState<{
    qty: number;
    printer?: string;
  } | null>(null);
  const [lockCountdownSec, setLockCountdownSec] = useState<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const workOrderMutations = useMemo(
    () => queuedMutations.filter((mutation) => mutation.workOrderId === workOrderId),
    [queuedMutations, workOrderId],
  );

  const derived = useMemo(
    () => applyMutations(snapshot, workOrderMutations),
    [snapshot, workOrderMutations],
  );

  const workOrderState: DerivedState = useMemo(() => {
    if (overrideState) return overrideState;
    if (derived.unitsCompleted >= derived.unitsTarget) return 'complete';
    if (derived.unitsCompleted === 0) return 'awaiting_first_off';
    if (derived.pickList.some((row) => !row.picked)) return 'pick_required';
    return 'running';
  }, [derived, overrideState]);

  const andonStatus: AndonStatus = useMemo(() => {
    if (workOrderState === 'on_hold' || workOrderState === 'failed_pending_ncr') return 'blocked';
    if (workOrderState === 'awaiting_first_off' || workOrderState === 'pick_required') return 'setup';
    if (workOrderState === 'complete') return 'idle';
    return 'running';
  }, [workOrderState]);

  useEffect(() => {
    setReferenceView(workOrderId, referenceView);
  }, [referenceView, setReferenceView, workOrderId]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (workOrderState === 'on_hold' || workOrderState === 'complete' || workOrderState === 'failed_pending_ncr') {
      return;
    }
    const t = window.setInterval(() => setCycleSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [workOrderState]);

  useEffect(() => {
    setCycleSeconds(0);
  }, [derived.unitsCompleted]);

  // Idle lock — only in kiosk (route) mode. Resets the 5 min idle timer on any
  // user activity. Once idle threshold is hit we start a 30 s countdown banner;
  // if the operator doesn't tap during the countdown, the WO is queued for
  // resume and we navigate back to the clock-in screen.
  useEffect(() => {
    if (mode !== 'route') return;
    if (closedConfirmation) return;

    const onActivity = () => {
      lastActivityRef.current = Date.now();
      setLockCountdownSec(null);
    };
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true } as AddEventListenerOptions),
    );

    const tick = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs < IDLE_THRESHOLD_MS) {
        return;
      }
      const elapsedSinceWarning = idleMs - IDLE_THRESHOLD_MS;
      const remaining = Math.max(0, Math.ceil((LOCK_COUNTDOWN_MS - elapsedSinceWarning) / 1000));
      setLockCountdownSec(remaining);
      if (remaining === 0) {
        useFloorExecutionStore.getState().setPendingResumeWorkOrder(workOrderId);
        toast.message('Kiosk locked', { description: 'Tap your photo to resume the work order.' });
        onClose();
      }
    }, 1000);

    return () => {
      window.clearInterval(tick);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onActivity),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, workOrderId, closedConfirmation]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (workOrderState !== 'running') return;
      event.preventDefault();
      handleIncrement();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrderState]);

  const handleIncrement = () => {
    queueMutation(makeMutation({ workOrderId, type: 'quantity', bucket: 'good', delta: 1 }));
  };

  const handleDecrement = () => {
    if (derived.unitsCompleted <= 0) return;
    queueMutation(makeMutation({ workOrderId, type: 'quantity', bucket: 'good', delta: -1 }));
  };

  const handlePick = (rowId: string) => {
    const row = derived.pickList.find((entry) => entry.id === rowId);
    if (!row) return;
    setScanningRowId(rowId);
    window.setTimeout(() => {
      setScanningRowId(null);
      queueMutation(makeMutation({ workOrderId, type: 'pick', pickListRowId: rowId, qty: row.requiredQty }));
      toast.success(`Scanned ${row.binLocation} · ${row.requiredQty} ${row.unit} issued`);
    }, 900);
  };

  const handleIssueAll = () => {
    queueMutation(makeMutation({ workOrderId, type: 'pick-all' }));
    toast.success('All remaining materials issued');
  };

  const effectiveRouting = useMemo(() => {
    const baseCurrentIdx = snapshot.routing.findIndex((step) => step.status === 'current');
    const advanced = new Set(advancedSteps);
    let newCurrentIdx = baseCurrentIdx;
    while (newCurrentIdx >= 0 && advanced.has(snapshot.routing[newCurrentIdx]?.stepNumber)) {
      newCurrentIdx += 1;
    }
    return snapshot.routing.map((step, idx) => ({
      ...step,
      status: (
        advanced.has(step.stepNumber) || idx < baseCurrentIdx
          ? 'previous'
          : idx === newCurrentIdx
            ? 'current'
            : 'next'
      ) as ExecutionWorkflowStep['status'],
      checklist: step.checklist.map((item) => ({
        ...item,
        completed: item.completed || advanced.has(step.stepNumber),
      })),
    }));
  }, [snapshot.routing, advancedSteps]);

  const currentOp = effectiveRouting.find((step) => step.status === 'current');
  const currentStepItems = currentOp?.checklist ?? [];
  const stepChecksComplete =
    currentStepItems.length === 0 ||
    currentStepItems.every((item) => item.completed || stepCheckIds.includes(item.id));

  useEffect(() => {
    if (!currentOp || currentStepItems.length === 0) return;
    if (!stepChecksComplete) return;
    if (advancedSteps.includes(currentOp.stepNumber)) return;
    const t = window.setTimeout(() => {
      setAdvancedSteps((prev) => [...prev, currentOp.stepNumber]);
      setStepCheckIds([]);
      toast.success(`Step ${currentOp.stepNumber} complete · advancing to next`);
    }, 350);
    return () => window.clearTimeout(t);
  }, [advancedSteps, currentOp, currentStepItems.length, stepChecksComplete]);

  const handlePass = () => {
    // First-off recording is itself the quality gate — don't require sub-step
    // checks. Recording the first-off also counts the first good unit so the
    // state machine flips to `running` and the CTA advances.
    if (workOrderState === 'awaiting_first_off') {
      queueMutation(
        makeMutation({
          workOrderId,
          type: 'inspection',
          gate: 'first_off',
          result: 'pass',
          inspectorName: snapshot.operatorName,
        }),
      );
      handleIncrement();
      toast.success('First-off recorded. Batch can run.');
      return;
    }

    if (!stepChecksComplete) {
      toast.error('Complete current-step checks first', {
        description: 'Tick every check on the current routing step before PASS.',
      });
      return;
    }
    handleIncrement();
  };

  const handleFail = () => {
    setNcrOpen(true);
  };

  const handleHold = () => {
    setHoldOpen(true);
  };

  const handleScrapSubmit = (payload: { qty: number; reason: string; notes: string }) => {
    queueMutation(
      makeMutation({
        workOrderId,
        type: 'scrap',
        qty: payload.qty,
        reason: payload.reason,
        notes: payload.notes,
      }),
    );
    toast.success(`Scrap recorded: ${payload.qty} unit · ${payload.reason}. Inventory adjusted.`);
  };

  const handleNcrSubmit = (payload: {
    defectType: string;
    affectedQty: number;
    measurement: string;
    notes: string;
  }) => {
    const ncrId = `NCR-2026-${String(14 + snapshot.ncrs.length).padStart(4, '0')}`;
    queueMutation(
      makeMutation({
        workOrderId,
        type: 'ncr',
        defectType: payload.defectType,
        affectedQty: payload.affectedQty,
        measurement: payload.measurement,
        notes: payload.notes,
      }),
    );
    setOverrideState('failed_pending_ncr');
    toast.error(`${ncrId} raised. Supervisor notified.`);
  };

  const handleHoldSubmit = (payload: { reason: string; notes: string }) => {
    setOverrideState('on_hold');
    toast.message('Job placed on hold', { description: payload.reason });
  };

  const handleResume = () => {
    setOverrideState(null);
    toast.success('Job resumed');
  };

  const handlePrintSubmit = (payload: { template: string; qty: number; printer: string }) => {
    queueMutation(
      makeMutation({
        workOrderId,
        type: 'print-label',
        template: payload.template,
        qty: payload.qty,
        printer: payload.printer,
      }),
    );
    toast.success(`${payload.qty} label${payload.qty === 1 ? '' : 's'} sent to ${payload.printer}`);
  };

  const handleRequestHelp = () => {
    setHelpRequestedAt(Date.now());
    toast.message('Help requested', { description: 'Andon alert raised to floor lead.' });
  };

  const handleCancelHelp = () => {
    setHelpRequestedAt(null);
    toast.success('Help request cancelled');
  };

  const handleResetDemo = () => {
    setOverrideState(null);
    setHelpRequestedAt(null);
    setScanningRowId(null);
    setStepCheckIds([]);
    setCycleSeconds(0);
    setAdvancedSteps([]);
    useFloorExecutionStore.getState().clearWorkOrderState(workOrderId);
    toast.success('Demo state reset');
  };

  const handlePrimaryAction = () => {
    switch (workOrderState) {
      case 'awaiting_first_off':
        handlePass();
        break;
      case 'pick_required':
        toast.message('Pick list focus', { description: 'Pick the highlighted rows below the reference.' });
        document.getElementById('mw-pick-list')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      case 'running':
        handleIncrement();
        break;
      case 'on_hold':
        handleResume();
        break;
      case 'failed_pending_ncr':
        toast.message('NCR pending review', { description: 'Supervisor follow-up needed before resuming.' });
        break;
      case 'complete':
        setCloseOpen(true);
        break;
    }
  };

  const handleCloseWOOnly = () => {
    setClosedConfirmation({ qty: derived.unitsCompleted });
  };

  const handleCloseWOPrint = (payload: { qty: number; printer: string }) => {
    queueMutation(
      makeMutation({
        workOrderId,
        type: 'print-label',
        template: 'WIP to Finished Goods',
        qty: payload.qty,
        printer: payload.printer,
      }),
    );
    setClosedConfirmation({ qty: payload.qty, printer: payload.printer });
  };

  const cycleTargetSeconds = parseClock(snapshot.targetCycleTimeLabel ?? '0:00');
  const cycleActualLabel = formatClock(cycleSeconds);
  const cycleVariancePct = cycleTargetSeconds
    ? Math.round(((cycleSeconds - cycleTargetSeconds) / cycleTargetSeconds) * 100)
    : 0;

  const totalActualMin =
    snapshot.timeSummary.setupActualMin +
    snapshot.timeSummary.runActualMin +
    snapshot.timeSummary.firstOffActualMin;

  const primary = derivePrimaryActionView(workOrderState);

  const liveSnapshot = useMemo(
    () => ({ ...snapshot, routing: effectiveRouting, currentStep: currentOp ?? snapshot.currentStep }),
    [snapshot, effectiveRouting, currentOp],
  );

  return (
    <div className="absolute inset-0 flex min-h-0 flex-col bg-[var(--neutral-100)] font-sans">
      <AndonTopBar
        mode={mode}
        snapshot={liveSnapshot}
        status={andonStatus}
        cycleActualLabel={cycleActualLabel}
        cycleTargetLabel={snapshot.targetCycleTimeLabel ?? '—'}
        cycleVariancePct={cycleVariancePct}
        cycleSeconds={cycleSeconds}
        syncLabel={`Synced ${formatRelative(now)}`}
        onClose={onClose}
        onResetDemo={handleResetDemo}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_420px] lg:overflow-hidden">
        <main className="space-y-6 lg:overflow-y-auto lg:pr-1">
          {lockCountdownSec !== null ? (
            <IdleLockBanner
              secondsRemaining={lockCountdownSec}
              onStayActive={() => {
                lastActivityRef.current = Date.now();
                setLockCountdownSec(null);
              }}
            />
          ) : null}
          {helpRequestedAt ? (
            <HelpBanner
              since={now - helpRequestedAt}
              onCancel={handleCancelHelp}
            />
          ) : null}
          <OperationHeaderCard
            snapshot={liveSnapshot}
            unitsCompleted={derived.unitsCompleted}
            unitsTarget={derived.unitsTarget}
            cycleEstimateLabel={snapshot.targetCycleTimeLabel ?? '—'}
            cycleActualLabel={cycleActualLabel}
            cycleVariancePct={cycleVariancePct}
            totalActualMin={totalActualMin}
            totalEstimateMin={
              snapshot.timeSummary.setupEstMin +
              snapshot.timeSummary.runEstMin +
              snapshot.timeSummary.firstOffEstMin
            }
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />

          <ReferencePanel
            snapshot={snapshot}
            activeView={referenceView}
            onViewChange={(view) => setReferenceView(workOrderId, view)}
          />

          <div id="mw-pick-list">
            <MaterialsPickListCard
              rows={derived.pickList}
              scanningRowId={scanningRowId}
              onPick={handlePick}
              onIssueAll={handleIssueAll}
            />
          </div>

          <QualityActionsRow
            onPass={handlePass}
            onFail={handleFail}
            onHold={handleHold}
            onReportScrap={() => setScrapOpen(true)}
            disabled={workOrderState === 'complete' || workOrderState === 'failed_pending_ncr' || workOrderState === 'on_hold'}
            passGateMessage={!stepChecksComplete ? 'Complete current-step checks to enable PASS' : undefined}
          />
        </main>

        <aside className="space-y-6 lg:overflow-y-auto lg:pr-1">
          <PrimaryActionCard
            eyebrow={primary.eyebrow}
            title={primary.title}
            supportingText={primary.supportingText}
            actionLabel={primary.actionLabel}
            actionIcon={primary.actionIcon}
            onAction={handlePrimaryAction}
          />

          <RoutingStrip
            snapshot={liveSnapshot}
            checkedStepItemIds={stepCheckIds}
            onToggleStepItem={(itemId) =>
              setStepCheckIds((current) =>
                current.includes(itemId)
                  ? current.filter((id) => id !== itemId)
                  : [...current, itemId],
              )
            }
            onSelectStep={setRoutingStep}
            ncrWatchCount={snapshot.ncrs.length}
          />

          <TimeSummaryGrid summary={snapshot.timeSummary} totalActualMin={totalActualMin} />

          <QuickActionsFooter
            onPrintLabel={() => setPrintOpen(true)}
            onReportScrap={() => setScrapOpen(true)}
            onRequestHelp={handleRequestHelp}
          />
        </aside>
      </div>

      <ScrapDialog
        open={scrapOpen}
        reasons={snapshot.scrapReasons}
        onOpenChange={setScrapOpen}
        onSubmit={handleScrapSubmit}
      />

      <NCRDialog
        open={ncrOpen}
        onOpenChange={setNcrOpen}
        onSubmit={handleNcrSubmit}
      />

      <HoldDialog
        open={holdOpen}
        onOpenChange={setHoldOpen}
        onSubmit={handleHoldSubmit}
      />

      <PrintLabelDialog
        open={printOpen}
        snapshot={snapshot}
        defaultQty={Math.max(1, derived.unitsCompleted) || 1}
        onOpenChange={setPrintOpen}
        onSubmit={handlePrintSubmit}
      />

      <CloseWODialog
        open={closeOpen}
        snapshot={snapshot}
        unitsCompleted={derived.unitsCompleted}
        unitsTarget={derived.unitsTarget}
        onOpenChange={setCloseOpen}
        onPrintAndClose={handleCloseWOPrint}
        onCloseOnly={handleCloseWOOnly}
      />

      <RoutingStepDrawer
        open={routingStep !== null}
        step={routingStep}
        snapshot={liveSnapshot}
        onOpenChange={(open) => !open && setRoutingStep(null)}
      />

      {closedConfirmation ? (
        <ClosedConfirmation
          woNumber={snapshot.woNumber}
          productName={snapshot.productName}
          qty={closedConfirmation.qty}
          printer={closedConfirmation.printer}
          onDismiss={onClose}
        />
      ) : null}
    </div>
  );
}

function ClosedConfirmation({
  woNumber,
  productName,
  qty,
  printer,
  onDismiss,
}: {
  woNumber: string;
  productName: string;
  qty: number;
  printer?: string;
  onDismiss: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--mw-mirage)]/72 backdrop-blur-sm">
      <div className="flex w-[440px] max-w-[90%] flex-col items-center rounded-[var(--shape-lg)] border border-[var(--mw-success)]/40 bg-card p-8 text-center shadow-md">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mw-success)]/12 text-[var(--mw-success)]">
          <Check className="h-7 w-7" />
        </span>
        <div className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
          Work order closed
        </div>
        <h3 className="mt-1 text-2xl font-medium text-[var(--neutral-900)]">{woNumber}</h3>
        <p className="mt-1 text-sm text-[var(--neutral-600)]">
          {productName} · {qty} unit{qty === 1 ? '' : 's'} good
        </p>
        {printer ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--mw-yellow-50)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--mw-mirage)]">
            <Printer className="h-3.5 w-3.5" />
            {qty} label{qty === 1 ? '' : 's'} sent to {printer}
          </p>
        ) : (
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            Closed without printing
          </p>
        )}
        <Button
          type="button"
          size="lg"
          className="mt-6 h-12 w-full bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
          onClick={onDismiss}
        >
          Return to queue
        </Button>
      </div>
    </div>
  );
}

function IdleLockBanner({
  secondsRemaining,
  onStayActive,
}: {
  secondsRemaining: number;
  onStayActive: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--shape-md)] border border-[var(--mw-error)] bg-[var(--mw-error)]/8 p-4">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--mw-error)] text-white">
        <Lock className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--mw-error)]">
          Kiosk locking in {secondsRemaining}s
        </div>
        <div className="text-sm text-[var(--neutral-700)]">
          We&apos;ve seen no activity for 5 minutes. Tap to keep the work order open, or the screen will return to clock-in and your operator session will be paused.
        </div>
      </div>
      <Button
        type="button"
        size="lg"
        className="h-11 bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-500)]"
        onClick={onStayActive}
      >
        I&apos;m here
      </Button>
    </div>
  );
}

function HelpBanner({ since, onCancel }: { since: number; onCancel: () => void }) {
  const seconds = Math.max(0, Math.floor(since / 1000));
  const label = seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;
  return (
    <div className="flex items-center gap-3 rounded-[var(--shape-md)] border border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] p-4">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)]">
        <LifeBuoy className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--mw-mirage)]">
          Floor lead notified · {label}
        </div>
        <div className="text-sm text-[var(--neutral-700)]">
          A lead is on their way to your station. Continue safely until they arrive.
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 border-[var(--mw-mirage)]/20 bg-card text-[var(--neutral-800)]"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
}

function derivePrimaryActionView(state: DerivedState) {
  switch (state) {
    case 'awaiting_first_off':
      return {
        eyebrow: 'Next action',
        title: 'Record first-off',
        supportingText: 'A first-off check is required before the batch can run.',
        actionLabel: 'Record first-off',
        actionIcon: 'check' as const,
      };
    case 'pick_required':
      return {
        eyebrow: 'Next action',
        title: 'Open pick list',
        supportingText: 'Issue the remaining BOM lines before the run continues.',
        actionLabel: 'Open pick list',
        actionIcon: 'list' as const,
      };
    case 'running':
      return {
        eyebrow: 'Next action',
        title: 'Mark unit complete',
        supportingText: 'Tap or press space as each good part leaves the machine.',
        actionLabel: 'Mark unit complete',
        actionIcon: 'plus' as const,
      };
    case 'on_hold':
      return {
        eyebrow: 'On hold',
        title: 'Resume job',
        supportingText: 'The cycle timer is paused. Resume when the line is clear.',
        actionLabel: 'Resume job',
        actionIcon: 'play' as const,
      };
    case 'failed_pending_ncr':
      return {
        eyebrow: 'Quality hold',
        title: 'Open NCR',
        supportingText: 'Supervisor review is required before the job can continue.',
        actionLabel: 'Open NCR',
        actionIcon: 'alert' as const,
      };
    case 'complete':
      return {
        eyebrow: 'Ready to close',
        title: 'Close work order',
        supportingText: 'Target quantity reached. Choose to print labels during close-out, or close without printing.',
        actionLabel: 'Close work order',
        actionIcon: 'check' as const,
      };
  }
}

function applyMutations(
  snapshot: WorkOrderExecutionSnapshot,
  mutations: ExecutionMutation[],
) {
  let unitsCompleted = snapshot.quantity.good;
  const unitsTarget = snapshot.quantity.target;
  const pickList: PickListRow[] = snapshot.pickList.map((row) => ({ ...row }));

  const ordered = [...mutations].sort((a, b) => a.createdAt - b.createdAt);
  for (const mutation of ordered) {
    switch (mutation.type) {
      case 'quantity':
        if (mutation.bucket === 'good') {
          unitsCompleted = Math.max(0, Math.min(unitsTarget, unitsCompleted + mutation.delta));
        }
        break;
      case 'pick': {
        const row = pickList.find((entry) => entry.id === mutation.pickListRowId);
        if (row) {
          row.picked = true;
          row.pickedAtLabel = `Picked ${formatTimeShort(mutation.createdAt)}`;
        }
        break;
      }
      case 'pick-all':
        for (const row of pickList) {
          if (!row.picked) {
            row.picked = true;
            row.pickedAtLabel = `Picked ${formatTimeShort(mutation.createdAt)}`;
          }
        }
        break;
      case 'inspection':
        // first-off pass is treated as approval for batch run; no quantity change here
        break;
      default:
        break;
    }
  }

  // Keep currentStep in routing aware of unit count for future ops
  const routing: ExecutionWorkflowStep[] = snapshot.routing;

  return {
    unitsCompleted,
    unitsTarget,
    pickList,
    routing,
  };
}

function makeMutation<T extends { type: string }>(input: T): ExecutionMutation {
  return {
    ...input,
    id: `${input.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  } as unknown as ExecutionMutation;
}

function formatTimeShort(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatRelative(now: number) {
  const diff = Math.max(0, Math.round((now - now) / 1000));
  if (diff < 60) return 'just now';
  return `${Math.round(diff / 60)}m ago`;
}

function parseClock(label: string): number {
  const [m, s] = label.split(':').map((n) => Number.parseInt(n, 10));
  if (Number.isNaN(m)) return 0;
  return m * 60 + (Number.isNaN(s) ? 0 : s);
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
