import liveCamImage from 'figma:asset/f55352753708d5a1c04a6b5e7921ba6a691ec0b2.png';
import cadModelImage from 'figma:asset/d86adce230f818f3c37eb92d8f5d16a03ab446bd.png';
import instructionImage from 'figma:asset/752bff3fda929cfb03de2d177a91f0aef5f1478d.png';

import type {
  ExecutionState,
  ExecutionWorkflowStep,
  ReferenceView,
  WorkOrderExecutionSnapshot,
} from './types';

interface SnapshotSeed {
  id?: string;
  woNumber?: string;
  moNumber?: string;
  jobNumber?: string;
  productName?: string;
  customerName?: string;
  machineId?: string;
  machineName?: string;
  stationName?: string;
  operatorName?: string;
  operatorRole?: string;
  operatorInitials?: string;
  operation?: string;
  status?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  unitsCompleted?: number;
  totalUnits?: number;
  executionState?: ExecutionState;
  revision?: string;
  revisionRequiresAck?: boolean;
}

type OperationKind = 'laser' | 'bend' | 'weld' | 'finish' | 'generic';

interface OperationRecipe {
  referenceDefault: ReferenceView;
  revision: string;
  cycleTimeLabel: string;
  targetCycleTimeLabel: string;
  drawingSummary: string;
  instructionSummary: string;
  checklistItems: string[];
  setupChecklist: string[];
  runChecklist: string[];
  firstOffChecklist: string[];
  caution?: string;
}

const RECIPE_BY_KIND: Record<OperationKind, OperationRecipe> = {
  laser: {
    referenceDefault: 'drawing',
    revision: 'Rev C',
    cycleTimeLabel: '3:45',
    targetCycleTimeLabel: '3:20',
    drawingSummary:
      'Primary cut profile with start points, pierce order, and clamp-safe zones.',
    instructionSummary:
      'Use the traveler to confirm material, nozzle, focus, and cut program before you run.',
    checklistItems: [
      'Program loaded and matched to traveler',
      'Sheet material and thickness confirmed',
      'First 10 mm of cut path monitored',
    ],
    setupChecklist: [
      'Load correct sheet and align datum edge',
      'Confirm nozzle, lens, and gas settings',
      'Verify revision on traveler matches screen',
    ],
    runChecklist: [
      'Start program and watch first cut path',
      'Check part drop and slug clearance',
      'Keep offcuts clear between nests',
    ],
    firstOffChecklist: [
      'Measure first-off against key dimensions',
      'Confirm hole size and edge quality',
      'Sign traveler before batch run',
    ],
    caution: 'Check revision and focus settings before you start the program.',
  },
  bend: {
    referenceDefault: 'drawing',
    revision: 'Rev B',
    cycleTimeLabel: '2:20',
    targetCycleTimeLabel: '2:00',
    drawingSummary:
      'Bend sequence drawing with tool callouts, datum references, and bend order.',
    instructionSummary:
      'Set punches and dies per traveler, then verify first bend angle before continuing.',
    checklistItems: [
      'Tooling matches bend schedule',
      'Backgauge set to traveler dimensions',
      'First bend angle verified',
    ],
    setupChecklist: [
      'Install punch and die set from traveler',
      'Check backgauge and stop positions',
      'Review bend sequence on drawing',
    ],
    runChecklist: [
      'Run first bend slowly',
      'Confirm part orientation before each hit',
      'Stack finished parts clear of the brake',
    ],
    firstOffChecklist: [
      'Measure angle and flange length',
      'Check part twist against flat surface',
      'Record first-off before full batch',
    ],
    caution: 'Keep the drawing open while setting the bend order.',
  },
  weld: {
    referenceDefault: 'instructions',
    revision: 'Rev D',
    cycleTimeLabel: '5:10',
    targetCycleTimeLabel: '4:40',
    drawingSummary:
      'Assembly drawing with tack points, weld symbols, and finished orientation.',
    instructionSummary:
      'Instruction-first flow for fixture setup, tack order, and weld sequence.',
    checklistItems: [
      'Fixture and consumables ready',
      'Parts matched to traveler before tack',
      'First-off weld checked before full run',
    ],
    setupChecklist: [
      'Clean joint faces and fixture contact points',
      'Load assembly fixture and clamps',
      'Confirm weld symbols and sequence sheet',
    ],
    runChecklist: [
      'Tack in sequence before full weld',
      'Check fit-up after each joint group',
      'Keep traveler with assembly at station',
    ],
    firstOffChecklist: [
      'Confirm weld size and coverage',
      'Check distortion and fit-up after cooling',
      'Release batch only after inspector sign-off',
    ],
    caution: 'Instruction sheet takes priority over the camera view at this station.',
  },
  finish: {
    referenceDefault: 'instructions',
    revision: 'Rev A',
    cycleTimeLabel: '4:05',
    targetCycleTimeLabel: '3:50',
    drawingSummary:
      'Finish reference sheet with masking zones, coat spec, and inspection points.',
    instructionSummary:
      'Work from the finish checklist to avoid rework on masked or visible surfaces.',
    checklistItems: [
      'Surface prep complete',
      'Masking confirmed to traveler',
      'Final finish inspection ready',
    ],
    setupChecklist: [
      'Confirm color, coating, or finish spec',
      'Mask protected areas before loading rack',
      'Review cure or dwell notes on traveler',
    ],
    runChecklist: [
      'Run batch per finish instruction sheet',
      'Separate accepted and suspect parts',
      'Keep racks tagged by traveler number',
    ],
    firstOffChecklist: [
      'Check finish thickness or coverage',
      'Confirm visible faces are free of defects',
      'Approve first-off before full batch',
    ],
    caution: 'Use the instruction sheet as the source of truth for masking and finish zones.',
  },
  generic: {
    referenceDefault: 'checklist',
    revision: 'Rev A',
    cycleTimeLabel: '3:00',
    targetCycleTimeLabel: '2:45',
    drawingSummary:
      'Traveler and shop drawing for this work order. Keep the revision visible during execution.',
    instructionSummary:
      'Follow the work instruction checklist and confirm the revision before each batch.',
    checklistItems: [
      'Traveler matches screen revision',
      'Work area and tooling ready',
      'First-off approved before batch run',
    ],
    setupChecklist: [
      'Review traveler and revision note',
      'Prepare tooling and workstation',
      'Confirm material or kit before starting',
    ],
    runChecklist: [
      'Complete the current operation to traveler',
      'Record good and scrap quantity as you go',
      'Escalate any mismatch immediately',
    ],
    firstOffChecklist: [
      'Check first-off against drawing and traveler',
      'Record inspection result before continuing',
      'Keep the approved part at the station',
    ],
    caution: 'Keep the traveler open and visible while you work.',
  },
};

export function buildExecutionSnapshot(
  raw: SnapshotSeed,
  options?: {
    elapsedSeconds?: number;
    stationName?: string;
  }
): WorkOrderExecutionSnapshot {
  const operation = raw.operation ?? 'Run current operation';
  const kind = classifyOperation(operation);
  const recipe = RECIPE_BY_KIND[kind];
  const target = raw.totalUnits ?? 100;
  const good = clampCount(
    raw.unitsCompleted ?? inferInitialGoodCount(raw.status, target)
  );
  const scrap = clampCount(good > 0 ? Math.min(2, Math.floor(good / 12)) : 0);

  const executionState =
    raw.executionState ??
    deriveExecutionState(raw.status, raw.actualMinutes ?? 0, good);
  const revision = raw.revision ?? recipe.revision;
  const revisionRequiresAck =
    raw.revisionRequiresAck ?? (good === 0 && executionState !== 'complete');

  const firstOffDue =
    executionState !== 'complete' && executionState !== 'blocked' && good === 0;
  const inProcessDue =
    executionState === 'run' && good > 0 && good % 25 === 0 && good < target;
  const finalInspectionDue =
    executionState !== 'complete' && good + scrap >= target;

  const currentIndex = getCurrentStepIndex(executionState, good);
  const routing = buildRouting({
    operation,
    recipe,
    currentIndex,
  });

  const previousStep = routing.find((step) => step.stepNumber === currentIndex - 1);
  const currentStep =
    routing.find((step) => step.stepNumber === currentIndex) ?? routing[0];
  const nextStep = routing.find((step) => step.stepNumber === currentIndex + 1);

  const productName = raw.productName ?? 'Mounting Bracket Assembly';
  const machineName = raw.machineName ?? 'Workstation';
  const moNumber = raw.moNumber ?? 'MO-2026-0001';

  return {
    workOrderId: raw.id ?? 'wo-demo',
    woNumber: raw.woNumber ?? 'WO-2026-0001',
    moNumber,
    jobNumber: raw.jobNumber,
    productName,
    customerName: raw.customerName ?? 'TechCorp Industries',
    machineId: raw.machineId,
    machineName,
    stationName: options?.stationName ?? raw.stationName,
    operatorName: raw.operatorName ?? 'James Murray',
    operatorRole: raw.operatorRole ?? 'Shop floor operator',
    operatorInitials: raw.operatorInitials ?? 'JM',
    executionState,
    revision,
    revisionRequiresAck,
    referenceViewDefault: recipe.referenceDefault,
    references: {
      drawing: {
        view: 'drawing',
        title: `${productName} drawing`,
        documentLabel: `${moNumber} traveler drawing`,
        revision,
        summary: recipe.drawingSummary,
        helperText:
          'Keep the drawing open while you set up or verify the first-off.',
        previewSrc: cadModelImage,
        items: [
          'Key dimensions highlighted from traveler',
          'Revision visible next to document title',
          'Use this as the primary reference for machine setup',
        ],
        referenceRules: [
          'Keep the drawing open while setting up or verifying the first-off.',
          'Confirm revision before each rerun after a block or restart.',
          'Escalate any drawing mismatch before the batch continues.',
        ],
      },
      instructions: {
        view: 'instructions',
        title: `${operation} instructions`,
        documentLabel: `${machineName} operator guide`,
        revision,
        summary: recipe.instructionSummary,
        helperText:
          'Use the instruction-first view when the station relies on sequence more than geometry.',
        previewSrc: instructionImage,
        items: recipe.runChecklist,
        referenceRules: [
          'Follow instruction sequence in order unless a lead overrides it.',
          'If steps conflict with traveler revision, pause and escalate.',
          'Record deviations in handover notes before release.',
        ],
      },
      checklist: {
        view: 'checklist',
        title: 'Execution checklist',
        documentLabel: `${raw.woNumber ?? 'WO-2026-0001'} checklist`,
        revision,
        summary:
          'One place for setup, first-off, and batch confirmation items.',
        helperText:
          'Only the current step checklist needs attention. Future routing stays secondary.',
        items: recipe.checklistItems,
        referenceRules: [
          'Complete checklist items top-to-bottom for each active step.',
          'Do not bypass required checks because of schedule pressure.',
          'Add a note for any non-standard condition before handover.',
        ],
      },
      camera: {
        view: 'camera',
        title: 'Machine camera',
        documentLabel: `${machineName} live view`,
        revision,
        summary:
          'Camera is available as a secondary aid, not the primary source of truth.',
        helperText:
          'Use the camera to confirm machine posture or remote assistance, then return to the reference view.',
        previewSrc: liveCamImage,
        items: [
          'Secondary operator aid only',
          'Do not rely on camera instead of revision-controlled docs',
        ],
        referenceRules: [
          'Use camera for posture verification, not as primary instruction source.',
          'Return to drawing or instructions before setup-critical actions.',
          'If visual clarity is poor, pause and verify in-person.',
        ],
      },
    },
    currentStep,
    previousStep,
    nextStep,
    routing,
    stepsSummary: {
      completed: routing.filter((step) => step.status === 'previous').length,
      total: routing.length,
    },
    quantity: {
      good,
      scrap,
      target,
      lastChangeLabel: good > 0 ? `Last good part ${good}` : 'No quantity recorded yet',
    },
    inspection: {
      firstOffDue,
      inProcessDue,
      finalInspectionDue,
      frequencyLabel: 'Every 25 good parts',
      lastRecordedLabel: good > 0 ? 'First-off recorded 12 min ago' : 'No inspection recorded yet',
    },
    exceptions: executionState === 'blocked'
      ? [
          {
            id: 'issue-blocked',
            type: 'tooling',
            title: 'Blocked: tooling confirmation needed',
            status: 'open',
            createdAtLabel: 'Just now',
            note: 'Operator flagged tooling mismatch during setup.',
          },
        ]
      : [],
    elapsedSeconds:
      options?.elapsedSeconds ??
      Math.max(0, (raw.actualMinutes ?? inferActualMinutes(raw.status)) * 60),
    estimatedCompletionLabel: inferEstimatedCompletionLabel(executionState),
    cycleTimeLabel: recipe.cycleTimeLabel,
    targetCycleTimeLabel: recipe.targetCycleTimeLabel,
  };
}

function classifyOperation(operation: string): OperationKind {
  const value = operation.toLowerCase();
  if (value.includes('laser') || value.includes('cut') || value.includes('punch')) {
    return 'laser';
  }
  if (value.includes('bend') || value.includes('brake') || value.includes('form')) {
    return 'bend';
  }
  if (value.includes('weld') || value.includes('assembly')) {
    return 'weld';
  }
  if (
    value.includes('powder') ||
    value.includes('finish') ||
    value.includes('paint') ||
    value.includes('coat')
  ) {
    return 'finish';
  }
  return 'generic';
}

function deriveExecutionState(
  status = 'pending',
  actualMinutes: number,
  goodCount: number
): ExecutionState {
  if (status === 'blocked' || status === 'hold') return 'blocked';
  if (status === 'completed' || status === 'done') return 'complete';
  if (status === 'pending') return 'setup';
  if (goodCount === 0 && actualMinutes <= 60) return 'inspect';
  return 'run';
}

function inferInitialGoodCount(status = 'pending', target: number): number {
  if (status === 'completed' || status === 'done') return target;
  return 0;
}

function inferActualMinutes(status = 'pending'): number {
  if (status === 'completed' || status === 'done') return 180;
  if (status === 'in_progress' || status === 'progress') return 42;
  return 0;
}

function inferEstimatedCompletionLabel(executionState: ExecutionState): string {
  if (executionState === 'complete') return 'Completed for this operation';
  if (executionState === 'blocked') return 'Waiting on issue resolution';
  if (executionState === 'inspect') return 'Inspection due before batch run';
  return 'Est. finish 2:45 PM';
}

function getCurrentStepIndex(
  executionState: ExecutionState,
  goodCount: number
): number {
  if (executionState === 'setup') return 1;
  if (executionState === 'inspect') return 3;
  if (executionState === 'complete') return 5;
  if (executionState === 'blocked') return goodCount > 0 ? 4 : 2;
  return goodCount > 0 ? 4 : 2;
}

function buildRouting({
  operation,
  recipe,
  currentIndex,
}: {
  operation: string;
  recipe: OperationRecipe;
  currentIndex: number;
}): ExecutionWorkflowStep[] {
  const steps: Omit<ExecutionWorkflowStep, 'status'>[] = [
    {
      id: 'setup',
      stepNumber: 1,
      title: 'Confirm revision and setup',
      description:
        'Check the revision, load the right tooling or program, and prepare the workstation.',
      caution: recipe.caution,
      requiredReference: recipe.referenceDefault,
      checklist: recipe.setupChecklist.map((item, index) => ({
        id: `setup-${index + 1}`,
        label: item,
        completed: currentIndex > 1,
      })),
    },
    {
      id: 'run',
      stepNumber: 2,
      title: operation,
      description:
        'Run the current operation to the active traveler and keep the required reference visible.',
      requiredReference: recipe.referenceDefault,
      checklist: recipe.runChecklist.map((item, index) => ({
        id: `run-${index + 1}`,
        label: item,
        completed: currentIndex > 2,
      })),
    },
    {
      id: 'inspect',
      stepNumber: 3,
      title: 'Record first-off inspection',
      description:
        'Complete the first-off inspection before continuing the batch.',
      requiredReference: 'checklist',
      inspectionGate: 'first_off',
      checklist: recipe.firstOffChecklist.map((item, index) => ({
        id: `inspect-${index + 1}`,
        label: item,
        completed: currentIndex > 3,
      })),
    },
    {
      id: 'batch',
      stepNumber: 4,
      title: 'Continue batch and monitor',
      description:
        'Run the remaining quantity, watch for drift, and update good and scrap counts.',
      requiredReference: recipe.referenceDefault,
      inspectionGate: 'in_process',
      checklist: [
        {
          id: 'batch-1',
          label: 'Record quantity at the machine as parts complete',
          completed: currentIndex > 4,
        },
        {
          id: 'batch-2',
          label: 'Escalate issues immediately instead of bypassing them',
          completed: currentIndex > 4,
        },
      ],
    },
    {
      id: 'complete',
      stepNumber: 5,
      title: 'Complete and hand over',
      description:
        'Confirm final quantity, add a handover note if needed, and release the work order.',
      requiredReference: 'checklist',
      inspectionGate: 'final',
      checklist: [
        {
          id: 'complete-1',
          label: 'Final quantity and traveler complete',
          completed: currentIndex > 5,
        },
        {
          id: 'complete-2',
          label: 'Next operator or next station note recorded',
          completed: currentIndex > 5,
        },
      ],
    },
  ];

  return steps.map((step) => ({
    ...step,
    status:
      step.stepNumber < currentIndex
        ? 'previous'
        : step.stepNumber === currentIndex
          ? 'current'
          : 'next',
  }));
}

function clampCount(value: number): number {
  return Math.max(0, value);
}
