import type { ExecutionState } from '@/components/floor/execution/types';

export type MachineStatus = 'idle' | 'running' | 'blocked' | 'setup';

export type WorkOrderStatus = 'pending' | 'in_progress' | 'blocked';

export type WorkOrder = {
  id: string;
  woNumber: string;
  moNumber: string;
  productName: string;
  operation: string;
  customerName: string;
  status: WorkOrderStatus;
  estimatedMinutes: number;
  actualMinutes: number;
  unitsCompleted: number;
  totalUnits: number;
  dueDate: string;
  executionState?: ExecutionState;
  revisionRequiresAck?: boolean;
  revision?: string;
};

export type Machine = {
  id: string;
  name: string;
  status: MachineStatus;
  currentJob?: WorkOrder;
  nextJob?: WorkOrder;
  blockingIssue?: string;
  cycleTimeLabel?: string;
  overdue?: boolean;
  stationGroup?: string;
};

export type PrimaryActionLabel =
  | 'Start Job'
  | 'Resume Job'
  | 'Resolve Issue'
  | 'Resume Setup';

export function getPrimaryActionLabel(status: MachineStatus): PrimaryActionLabel {
  switch (status) {
    case 'blocked':
      return 'Resolve Issue';
    case 'running':
      return 'Resume Job';
    case 'setup':
      return 'Resume Setup';
    case 'idle':
    default:
      return 'Start Job';
  }
}

export function getMachineDetailWorkOrder(machine: Machine): WorkOrder | undefined {
  if (machine.status === 'running' || machine.status === 'blocked' || machine.status === 'setup') {
    return machine.currentJob ?? machine.nextJob;
  }

  return machine.nextJob ?? machine.currentJob;
}
