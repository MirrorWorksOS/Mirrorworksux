import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ExecutionHeader } from './ExecutionHeader';
import { ReferenceWorkspace } from './ReferenceWorkspace';
import { ActionConsole } from './ActionConsole';
import { ExceptionSheet } from './ExceptionSheet';
import { InspectionSheet } from './InspectionSheet';
import { HandoverSheet } from './HandoverSheet';
import { useFloorExecutionStore } from '@/store/floorExecutionStore';
import type {
  ExecutionMutation,
  ExecutionState,
  ExecutionWorkflowStep,
  InspectionGate,
  IssueType,
  ReferenceView,
  SyncState,
  WorkOrderExecutionSnapshot,
} from './types';

interface FloorExecutionScreenProps {
  mode: 'overlay' | 'route';
  snapshot: WorkOrderExecutionSnapshot;
  onClose: () => void;
  onSwitchOperator?: (handoverNote: string) => void;
}

export function FloorExecutionScreen({
  mode,
  snapshot,
  onClose,
  onSwitchOperator,
}: FloorExecutionScreenProps) {
  const {
    referenceViews,
    inspectionChecklistByGate,
    requiredReferenceChecklistByView,
    referenceChecklistSignoffByView,
    handoverDrafts,
    handoverNotes,
    queuedMutations,
    syncedMutationIds,
    lastSyncedAtByWorkOrder,
    setReferenceView,
    setInspectionChecklist,
    setRequiredReferenceChecklist,
    setReferenceChecklistSignoff,
    setHandoverDraft,
    saveHandoverNote,
    acknowledgeHandoverNote,
    queueMutation,
    markMutationsSynced,
    markSynced,
  } = useFloorExecutionStore();

  const [inspectionGate, setInspectionGate] =
    useState<InspectionGate>('first_off');

  const workOrderId = snapshot.workOrderId;
  const referenceView =
    referenceViews[workOrderId] ?? snapshot.referenceViewDefault;
  const checkedInspectionChecklistIds =
    inspectionChecklistByGate[workOrderId]?.[inspectionGate] ?? [];
  const checkedRequiredReferenceChecklistIds =
    requiredReferenceChecklistByView[workOrderId]?.[referenceView] ?? [];
  const requiredChecklistSignoff =
    referenceChecklistSignoffByView[workOrderId]?.[referenceView] ?? null;
  const handoverDraft = handoverDrafts[workOrderId] ?? '';
  const handoverNote = handoverNotes[workOrderId];
  const lastSyncedAt = lastSyncedAtByWorkOrder[workOrderId] ?? Date.now();

  const [elapsedSeconds, setElapsedSeconds] = useState(snapshot.elapsedSeconds);
  const [issueSheetType, setIssueSheetType] = useState<IssueType>('tooling');
  const [issueSheetOpen, setIssueSheetOpen] = useState(false);
  const [inspectionSheetOpen, setInspectionSheetOpen] = useState(false);
  const [handoverSheetOpen, setHandoverSheetOpen] = useState(false);
  const [handoverSummaryDraft, setHandoverSummaryDraft] = useState('');
  const [routingSheetOpen, setRoutingSheetOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const workOrderMutations = useMemo(
    () =>
      queuedMutations.filter((mutation) => mutation.workOrderId === workOrderId),
    [queuedMutations, workOrderId]
  );

  const pendingMutations = useMemo(
    () =>
      workOrderMutations.filter(
        (mutation) => !syncedMutationIds.includes(mutation.id)
      ),
    [syncedMutationIds, workOrderMutations]
  );

  const derived = useMemo(
    () => applyExecutionMutations(snapshot, workOrderMutations),
    [snapshot, workOrderMutations]
  );

  const syncState: SyncState = !isOnline
    ? 'offline'
    : pendingMutations.length > 0
      ? 'degraded'
      : 'online';
  const syncLabel = getSyncLabel(syncState, lastSyncedAt);

  const primaryAction = useMemo(
    () => derivePrimaryAction(snapshot, derived),
    [derived, snapshot]
  );
  const requiredChecks = snapshot.references[referenceView].items ?? [];
  const requiredChecksComplete =
    requiredChecks.length === 0 ||
    requiredChecks.every((_item, index) =>
      checkedRequiredReferenceChecklistIds.includes(
        `${referenceView}-check-${index + 1}`
      )
    );
  const completionPercent = Math.min(
    100,
    Math.round((derived.quantity.good / Math.max(1, derived.quantity.target)) * 100)
  );

  useEffect(() => {
    if (!referenceViews[workOrderId]) {
      setReferenceView(workOrderId, snapshot.referenceViewDefault);
    }
  }, [
    referenceViews,
    setReferenceView,
    snapshot.referenceViewDefault,
    workOrderId,
  ]);

  useEffect(() => {
    setElapsedSeconds(snapshot.elapsedSeconds);
  }, [snapshot.elapsedSeconds, snapshot.workOrderId]);

  useEffect(() => {
    if (derived.executionState === 'blocked' || derived.executionState === 'complete') {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [derived.executionState]);

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

  useEffect(() => {
    if (lastSyncedAtByWorkOrder[workOrderId]) return;
    markSynced(workOrderId, Date.now());
  }, [lastSyncedAtByWorkOrder, markSynced, workOrderId]);

  useEffect(() => {
    if (!isOnline || pendingMutations.length === 0) return;

    const timeout = window.setTimeout(() => {
      markMutationsSynced(
        workOrderId,
        pendingMutations.map((mutation) => mutation.id)
      );
      markSynced(workOrderId, Date.now());
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [
    isOnline,
    markMutationsSynced,
    markSynced,
    pendingMutations,
    workOrderId,
  ]);

  const handlePrimaryAction = () => {
    switch (primaryAction.type) {
      case 'ack-revision':
        queueMutation({
          id: createMutationId('ack-revision'),
          workOrderId,
          type: 'ack-revision',
          createdAt: Date.now(),
        });
        break;
      case 'set-state':
        queueMutation({
          id: createMutationId('set-state'),
          workOrderId,
          type: 'set-state',
          nextState: primaryAction.nextState,
          createdAt: Date.now(),
        });
        break;
      case 'inspection':
        setInspectionGate(primaryAction.gate);
        setInspectionSheetOpen(true);
        break;
      case 'quantity':
        handleAdjustQuantity(primaryAction.bucket);
        break;
      case 'none':
      default:
        break;
    }
  };

  const handleAdjustQuantity = (bucket: 'good' | 'scrap' | 'undo') => {
    if (bucket === 'undo') {
      const lastQuantityMutation = [...workOrderMutations]
        .reverse()
        .find((mutation) => mutation.type === 'quantity');

      if (!lastQuantityMutation) return;

      queueMutation({
        id: createMutationId('quantity-undo'),
        workOrderId,
        type: 'quantity',
        bucket: lastQuantityMutation.bucket,
        delta: lastQuantityMutation.delta * -1,
        createdAt: Date.now(),
      });
      return;
    }

    queueMutation({
      id: createMutationId(`quantity-${bucket}`),
      workOrderId,
      type: 'quantity',
      bucket,
      delta: 1,
      createdAt: Date.now(),
    });
  };

  const handleInspectionSubmit = ({
    gate,
    result,
    note,
  }: {
    gate: InspectionGate;
    result: 'pass' | 'fail';
    note: string;
  }) => {
    queueMutation({
      id: createMutationId(`inspection-${gate}`),
      workOrderId,
      type: 'inspection',
      gate,
      result,
      inspectorName: snapshot.operatorName,
      createdAt: Date.now(),
    });

    if (note.trim()) {
      queueMutation({
        id: createMutationId('handover-from-inspection'),
        workOrderId,
        type: 'handover',
        note: note.trim(),
        createdAt: Date.now(),
      });
    }
  };

  const handleIssueSubmit = ({
    type,
    title,
    note,
  }: {
    type: IssueType;
    title: string;
    note: string;
  }) => {
    queueMutation({
      id: createMutationId(`issue-${type}`),
      workOrderId,
      type: 'issue',
      issueType: type,
      title,
      note,
      createdAt: Date.now(),
    });
  };

  const handleSaveHandover = () => {
    saveHandoverNote(workOrderId, handoverDraft);
    queueMutation({
      id: createMutationId('handover'),
      workOrderId,
      type: 'handover',
      note: handoverDraft,
      createdAt: Date.now(),
    });
    setHandoverSheetOpen(false);
  };

  return (
    <div className="absolute inset-0 flex min-h-0 flex-col bg-[var(--neutral-100)] font-sans">
      <ExecutionHeader
        mode={mode}
        snapshot={{
          ...snapshot,
          executionState: derived.executionState,
        }}
        syncState={syncState}
        syncLabel={syncLabel}
        pendingActions={pendingMutations.length}
        onClose={onClose}
        onSwitchOperator={
          onSwitchOperator
            ? () => {
                setHandoverSheetOpen(true);
              }
            : undefined
        }
      />

      <div className="flex min-h-0 flex-1 gap-6 p-6">
        <ReferenceWorkspace
          snapshot={snapshot}
          referenceView={referenceView}
          checkedRequiredItemIds={checkedRequiredReferenceChecklistIds}
          requiredChecklistSignoff={requiredChecklistSignoff}
          onReferenceViewChange={(view) => setReferenceView(workOrderId, view)}
          onRequiredChecklistChange={(view, checkedItemIds) => {
            setRequiredReferenceChecklist(workOrderId, view, checkedItemIds);
            const viewRequiredChecks = snapshot.references[view].items ?? [];
            const isComplete =
              viewRequiredChecks.length > 0 &&
              viewRequiredChecks.every((_item, index) =>
                checkedItemIds.includes(`${view}-check-${index + 1}`)
              );

            setReferenceChecklistSignoff(
              workOrderId,
              view,
              isComplete
                ? {
                    signedBy: snapshot.operatorName,
                    signedAt: Date.now(),
                  }
                : null
            );
          }}
        />

        <ActionConsole
          snapshot={{
            ...snapshot,
            executionState: derived.executionState,
            currentStep: derived.currentStep,
            previousStep: derived.previousStep,
            nextStep: derived.nextStep,
            routing: derived.routing,
            stepsSummary: derived.stepsSummary,
            inspection: derived.inspection,
          }}
          executionState={derived.executionState}
          revisionAcknowledged={derived.revisionAcknowledged}
          quantity={derived.quantity}
          completionPercent={completionPercent}
          elapsedLabel={formatElapsed(elapsedSeconds)}
          primaryActionLabel={primaryAction.label}
          primaryActionDescription={primaryAction.description}
          primaryActionDisabled={primaryAction.disabled}
          handoverNote={handoverNote}
          exceptions={derived.exceptions}
          onAcknowledgeHandoverNote={() => acknowledgeHandoverNote(workOrderId)}
          onPrimaryAction={handlePrimaryAction}
          onAdjustQuantity={handleAdjustQuantity}
          onOpenException={(type) => {
            setIssueSheetType(type);
            setIssueSheetOpen(true);
          }}
          onOpenHandover={() => setHandoverSheetOpen(true)}
          onViewRouting={() => setRoutingSheetOpen(true)}
        />
      </div>

      <ExceptionSheet
        open={issueSheetOpen}
        defaultType={issueSheetType}
        onOpenChange={setIssueSheetOpen}
        onSubmit={handleIssueSubmit}
      />

      <InspectionSheet
        open={inspectionSheetOpen}
        gate={inspectionGate}
        snapshot={snapshot}
        checkedChecklistItemIds={checkedInspectionChecklistIds}
        onOpenChange={setInspectionSheetOpen}
        onChecklistChange={(checkedItemIds) =>
          setInspectionChecklist(workOrderId, inspectionGate, checkedItemIds)
        }
        onSubmit={handleInspectionSubmit}
      />

      <HandoverSheet
        open={handoverSheetOpen}
        note={handoverDraft}
        suggestedSummary={handoverSummaryDraft}
        onNoteChange={(value) => setHandoverDraft(workOrderId, value)}
        onOpenChange={setHandoverSheetOpen}
        onGenerateSummary={() =>
          setHandoverSummaryDraft(
            buildAiHandoverSummary({
              snapshot,
              derived,
              elapsedLabel: formatElapsed(elapsedSeconds),
              primaryActionLabel: primaryAction.label,
              completionPercent,
              requiredChecksComplete,
              requiredChecklistSignoff,
            })
          )
        }
        onInsertSummary={() => {
          setHandoverDraft(workOrderId, handoverSummaryDraft);
        }}
        onSave={handleSaveHandover}
        onSwitchOperator={
          onSwitchOperator
            ? () => {
                handleSaveHandover();
                onSwitchOperator(handoverDraft);
              }
            : undefined
        }
      />

      <Sheet open={routingSheetOpen} onOpenChange={setRoutingSheetOpen}>
        <SheetContent
          side="right"
          className="w-full border-l border-[var(--neutral-200)] bg-card sm:max-w-[520px]"
        >
          <SheetHeader>
            <SheetTitle className="text-[var(--neutral-900)]">
              Full routing
            </SheetTitle>
            <SheetDescription className="text-[var(--neutral-500)]">
              Only the current step stays expanded on the main screen. Use this when you need the full route.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            {derived.routing.map((step) => (
              <Card
                key={step.id}
                className={`rounded-[var(--shape-md)] border p-4 shadow-none ${
                  step.status === 'current'
                    ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]'
                    : 'border-[var(--neutral-200)] bg-[var(--neutral-100)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-sm font-medium text-[var(--neutral-900)]">
                    {step.stepNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-medium text-[var(--neutral-900)]">
                        {step.title}
                      </div>
                      {step.status === 'previous' ? (
                        <CheckCircle2 className="h-4 w-4 text-[var(--mw-success)]" />
                      ) : null}
                    </div>
                    <div className="mt-1 text-sm text-[var(--neutral-600)]">
                      {step.description}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function applyExecutionMutations(
  snapshot: WorkOrderExecutionSnapshot,
  mutations: ExecutionMutation[]
) {
  let executionState = snapshot.executionState;
  let good = snapshot.quantity.good;
  let scrap = snapshot.quantity.scrap;
  let revisionAcknowledged = !snapshot.revisionRequiresAck;
  let firstOffPassed = !snapshot.inspection.firstOffDue;
  let inProcessPassed = false;
  let finalPassed = false;
  let handoverNote = '';
  let lastInspectionLabel = snapshot.inspection.lastRecordedLabel;
  const exceptions = [...snapshot.exceptions];

  const orderedMutations = [...mutations].sort(
    (left, right) => left.createdAt - right.createdAt
  );

  for (const mutation of orderedMutations) {
    switch (mutation.type) {
      case 'set-state':
        executionState = mutation.nextState;
        break;
      case 'quantity':
        if (mutation.bucket === 'good') {
          good = Math.max(0, good + mutation.delta);
        } else {
          scrap = Math.max(0, scrap + mutation.delta);
        }
        break;
      case 'ack-revision':
        revisionAcknowledged = true;
        break;
      case 'inspection':
        if (mutation.result === 'pass') {
          const inspector = mutation.inspectorName ?? snapshot.operatorName;
          lastInspectionLabel = `${capitalizeWords(mutation.gate.replace('_', ' '))} signed by ${inspector} at ${formatTimestamp(mutation.createdAt)}`;
          if (mutation.gate === 'first_off') {
            firstOffPassed = true;
            executionState = 'run';
          }
          if (mutation.gate === 'in_process') {
            inProcessPassed = true;
            executionState = 'run';
          }
          if (mutation.gate === 'final') {
            finalPassed = true;
            executionState = 'complete';
          }
        } else {
          executionState = 'blocked';
          lastInspectionLabel = `${capitalizeWords(mutation.gate.replace('_', ' '))} failed at ${formatTimestamp(mutation.createdAt)}`;
          exceptions.unshift({
            id: mutation.id,
            type: 'quality',
            title: `${capitalizeWords(mutation.gate.replace('_', ' '))} failed`,
            status: 'open',
            createdAtLabel: 'Just now',
          });
        }
        break;
      case 'issue':
        executionState = 'blocked';
        exceptions.unshift({
          id: mutation.id,
          type: mutation.issueType,
          title: mutation.title,
          note: mutation.note,
          status: 'open',
          createdAtLabel: 'Just now',
        });
        break;
      case 'handover':
        handoverNote = mutation.note;
        break;
      default:
        break;
    }
  }

  const firstOffDue =
    !firstOffPassed &&
    executionState !== 'complete' &&
    executionState !== 'blocked' &&
    good === 0;
  const inProcessDue =
    !inProcessPassed &&
    executionState === 'run' &&
    good > 0 &&
    good % 25 === 0 &&
    good < snapshot.quantity.target;
  const finalInspectionDue =
    !finalPassed &&
    executionState !== 'complete' &&
    good + scrap >= snapshot.quantity.target;

  const currentIndex = getCurrentStepIndex({
    executionState,
    firstOffDue,
    finalInspectionDue,
    good,
  });

  const routing = snapshot.routing.map((step) => ({
    ...step,
    status: (
      step.stepNumber < currentIndex
        ? 'previous'
        : step.stepNumber === currentIndex
          ? 'current'
          : 'next'
    ) as ExecutionWorkflowStep['status'],
  }));

  return {
    executionState,
    revisionAcknowledged,
    quantity: {
      good,
      scrap,
      target: snapshot.quantity.target,
    },
    inspection: {
      ...snapshot.inspection,
      firstOffDue,
      inProcessDue,
      finalInspectionDue,
      lastRecordedLabel:
        firstOffPassed || inProcessPassed || finalPassed
          ? lastInspectionLabel
          : snapshot.inspection.lastRecordedLabel,
    },
    exceptions,
    handoverNote,
    routing,
    currentStep:
      routing.find((step) => step.stepNumber === currentIndex) ??
      snapshot.currentStep,
    previousStep: routing.find(
      (step) => step.stepNumber === currentIndex - 1
    ),
    nextStep: routing.find((step) => step.stepNumber === currentIndex + 1),
    stepsSummary: {
      completed: routing.filter((step) => step.status === 'previous').length,
      total: routing.length,
    },
  };
}

function derivePrimaryAction(
  snapshot: WorkOrderExecutionSnapshot,
  derived: ReturnType<typeof applyExecutionMutations>
) {
  if (!derived.revisionAcknowledged && snapshot.revisionRequiresAck) {
    return {
      label: 'Acknowledge revision',
      description: 'Review the current revision before you continue the job.',
      type: 'ack-revision' as const,
      disabled: false,
    };
  }

  if (derived.executionState === 'blocked') {
    return {
      label: 'Resume after unblock',
      description:
        'Clear the issue with tooling, material, or quality before the job continues.',
      type: 'set-state' as const,
      nextState:
        derived.quantity.good > 0 || derived.quantity.scrap > 0
          ? ('run' as const)
          : ('inspect' as const),
      disabled: false,
    };
  }

  if (derived.executionState === 'setup') {
    return {
      label: 'Start setup',
      description:
        'Confirm the workstation setup and move straight into the first-off check.',
      type: 'set-state' as const,
      nextState: 'inspect' as const,
      disabled: false,
    };
  }

  if (derived.inspection.firstOffDue) {
    return {
      label: 'Record first-off',
      description:
        'A first-off check is required before the batch can run.',
      type: 'inspection' as const,
      gate: 'first_off' as const,
      disabled: false,
    };
  }

  if (derived.executionState === 'run' && derived.quantity.good + derived.quantity.scrap >= derived.quantity.target) {
    return {
      label: 'Record batch complete',
      description:
        'The target quantity is reached. Move to final confirmation and handover.',
      type: 'set-state' as const,
      nextState: 'inspect' as const,
      disabled: false,
    };
  }

  if (derived.inspection.finalInspectionDue) {
    return {
      label: 'Complete job',
      description:
        'Final confirmation is due before the work order can be marked complete.',
      type: 'inspection' as const,
      gate: 'final' as const,
      disabled: false,
    };
  }

  if (derived.inspection.inProcessDue) {
    return {
      label: 'Record in-process inspection',
      description:
        'The inspection interval has been reached. Record the in-process result now.',
      type: 'inspection' as const,
      gate: 'in_process' as const,
      disabled: false,
    };
  }

  if (derived.executionState === 'complete') {
    return {
      label: 'Job complete',
      description:
        'This operation is complete. Review the handover note or return to the queue.',
      type: 'none' as const,
      disabled: true,
    };
  }

  return {
    label: 'Record completed part',
    description:
      'Tap for each good part as it leaves the machine. Use Scrap +1 for rejected parts.',
    type: 'quantity' as const,
    bucket: 'good' as const,
    disabled: false,
  };
}

function getCurrentStepIndex({
  executionState,
  firstOffDue,
  finalInspectionDue,
  good,
}: {
  executionState: ExecutionState;
  firstOffDue: boolean;
  finalInspectionDue: boolean;
  good: number;
}) {
  if (executionState === 'setup') return 1;
  if (executionState === 'complete') return 5;
  if (executionState === 'blocked') return good > 0 ? 4 : 2;
  if (finalInspectionDue) return 5;
  if (firstOffDue || executionState === 'inspect') return 3;
  return good > 0 ? 4 : 2;
}

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function getSyncLabel(syncState: SyncState, lastSyncedAt: number) {
  if (syncState === 'offline') return 'Offline';
  if (syncState === 'degraded') return 'Syncing';
  return `Synced ${formatRelativeTimestamp(lastSyncedAt)}`;
}

function formatRelativeTimestamp(timestamp: number) {
  const diffSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (diffSeconds < 5) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.round(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

function createMutationId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function capitalizeWords(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildAiHandoverSummary({
  snapshot,
  derived,
  elapsedLabel,
  primaryActionLabel,
  completionPercent,
  requiredChecksComplete,
  requiredChecklistSignoff,
}: {
  snapshot: WorkOrderExecutionSnapshot;
  derived: ReturnType<typeof applyExecutionMutations>;
  elapsedLabel: string;
  primaryActionLabel: string;
  completionPercent: number;
  requiredChecksComplete: boolean;
  requiredChecklistSignoff: { signedBy: string; signedAt: number } | null;
}) {
  const openIssues = derived.exceptions.filter((issue) => issue.status === 'open');
  const currentState =
    derived.executionState === 'blocked'
      ? 'Blocked'
      : derived.executionState === 'complete'
        ? 'Complete'
        : derived.executionState === 'inspect'
          ? 'Inspection stage'
          : derived.executionState === 'setup'
            ? 'Setup'
            : 'Running';

  const signoffLine = requiredChecklistSignoff
    ? `Required checks signed off by ${requiredChecklistSignoff.signedBy} at ${new Date(
        requiredChecklistSignoff.signedAt
      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    : requiredChecksComplete
      ? 'Required checks completed this shift.'
      : 'Required checks are still incomplete.';

  const issueLine =
    openIssues.length > 0
      ? `Open issues: ${openIssues.length} (${openIssues
          .slice(0, 2)
          .map((issue) => issue.title)
          .join('; ')}).`
      : 'No open exceptions currently logged.';

  const inspectionLine = derived.inspection.lastRecordedLabel
    ? `Inspection status: ${derived.inspection.lastRecordedLabel}.`
    : '';

  return [
    `Current state: ${currentState}. ${snapshot.woNumber} (${snapshot.productName}) on ${snapshot.machineName}.`,
    `Achieved this shift: ${derived.quantity.good}/${derived.quantity.target} good (${completionPercent}%), ${derived.quantity.scrap} scrap, elapsed ${elapsedLabel}.`,
    `Last good part/checkpoint: ${signoffLine} ${inspectionLine}`.trim(),
    `Next action: ${primaryActionLabel}. ${issueLine}`,
  ].join('\n\n');
}
