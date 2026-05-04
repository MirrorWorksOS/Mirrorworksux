export type ExecutionState =
  | 'setup'
  | 'run'
  | 'inspect'
  | 'blocked'
  | 'complete';

export type ReferenceView =
  | 'drawing'
  | 'instructions'
  | 'checklist'
  | 'camera';

export type IssueType =
  | 'quality'
  | 'material'
  | 'tooling'
  | 'drawing'
  | 'safety';

export type SyncState = 'online' | 'degraded' | 'offline';

export type InspectionGate = 'first_off' | 'in_process' | 'final';

export interface ExecutionChecklistItem {
  id: string;
  label: string;
  detail?: string;
  completed: boolean;
}

export interface ExecutionReference {
  view: ReferenceView;
  title: string;
  documentLabel: string;
  revision: string;
  summary: string;
  helperText?: string;
  previewSrc?: string;
  items?: string[];
  referenceRules?: string[];
}

export interface ExecutionWorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  caution?: string;
  status: 'previous' | 'current' | 'next';
  requiredReference: ReferenceView;
  checklist: ExecutionChecklistItem[];
  inspectionGate?: InspectionGate;
}

export interface ExecutionQuantitySummary {
  good: number;
  scrap: number;
  target: number;
  lastChangeLabel?: string;
}

export interface ExecutionInspectionSummary {
  firstOffDue: boolean;
  inProcessDue: boolean;
  finalInspectionDue: boolean;
  frequencyLabel: string;
  lastRecordedLabel: string;
}

export interface ExecutionExceptionSummary {
  id: string;
  type: IssueType;
  title: string;
  status: 'open' | 'resolved';
  createdAtLabel: string;
  note?: string;
}

export interface ExecutionSyncSummary {
  state: SyncState;
  lastSyncedAt: number;
  pendingActions: number;
  cachedLocally: boolean;
}

export interface PickListRow {
  id: string;
  partNumber: string;
  description: string;
  requiredQty: number;
  unit: string;
  binLocation: string;
  picked: boolean;
  pickedAtLabel?: string;
}

export interface TimeSummary {
  setupEstMin: number;
  setupActualMin: number;
  runEstMin: number;
  runActualMin: number;
  firstOffEstMin: number;
  firstOffActualMin: number;
}

export interface ScrapReportRow {
  id: string;
  workOrderId: string;
  qty: number;
  reason: string;
  notes?: string;
  createdAtLabel: string;
}

export interface NcrRecord {
  id: string;
  workOrderId: string;
  defectType: string;
  affectedQty: number;
  measurement?: string;
  notes?: string;
  createdAtLabel: string;
}

export interface LabelPrintEvent {
  id: string;
  workOrderId: string;
  template: string;
  qty: number;
  printer: string;
  createdAtLabel: string;
}

export type AndonStatus = 'running' | 'setup' | 'blocked' | 'idle';

export interface WorkOrderExecutionSnapshot {
  workOrderId: string;
  woNumber: string;
  moNumber: string;
  jobNumber?: string;
  productName: string;
  customerName: string;
  machineId?: string;
  machineName: string;
  stationName?: string;
  operatorName: string;
  operatorRole: string;
  operatorInitials: string;
  executionState: ExecutionState;
  revision: string;
  revisionRequiresAck: boolean;
  referenceViewDefault: ReferenceView;
  references: Record<ReferenceView, ExecutionReference>;
  currentStep: ExecutionWorkflowStep;
  previousStep?: ExecutionWorkflowStep;
  nextStep?: ExecutionWorkflowStep;
  routing: ExecutionWorkflowStep[];
  stepsSummary: {
    completed: number;
    total: number;
  };
  quantity: ExecutionQuantitySummary;
  inspection: ExecutionInspectionSummary;
  exceptions: ExecutionExceptionSummary[];
  elapsedSeconds: number;
  estimatedCompletionLabel: string;
  cycleTimeLabel?: string;
  targetCycleTimeLabel?: string;
  pickList: PickListRow[];
  timeSummary: TimeSummary;
  scrapReasons: string[];
  scrapReports: ScrapReportRow[];
  ncrs: NcrRecord[];
  labelPrints: LabelPrintEvent[];
  customerInitial: string;
  woCreatedAtLabel: string;
  modelSrc: string;
}

export type ExecutionMutation =
  | {
      id: string;
      workOrderId: string;
      type: 'pick';
      pickListRowId: string;
      qty: number;
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'pick-all';
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'scrap';
      qty: number;
      reason: string;
      notes?: string;
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'ncr';
      defectType: string;
      affectedQty: number;
      measurement?: string;
      notes?: string;
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'print-label';
      template: string;
      qty: number;
      printer: string;
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'set-state';
      nextState: ExecutionState;
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'quantity';
      bucket: 'good' | 'scrap';
      delta: number;
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'ack-revision';
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'inspection';
      gate: InspectionGate;
      result: 'pass' | 'fail';
      inspectorName?: string;
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'issue';
      issueType: IssueType;
      title: string;
      note: string;
      createdAt: number;
    }
  | {
      id: string;
      workOrderId: string;
      type: 'handover';
      note: string;
      createdAt: number;
    };
