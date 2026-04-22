import { create } from 'zustand';

export type TravellerStatus =
  | 'draft'
  | 'ready'
  | 'released'
  | 'in_progress'
  | 'hold'
  | 'complete';

export interface TravellerChecklist {
  routingComplete: boolean;
  drawingAttached: boolean;
  ncAttachedIfRequired: boolean;
  instructionsPresent: boolean;
  materialStatus: 'ready' | 'ordered' | 'missing';
  revisionLocked: boolean;
}

export interface TravellerPacket {
  id: string;
  travellerNumber: string;
  jobRef: string;
  workOrderRef: string;
  partName: string;
  drawingNumber: string;
  drawingRevision: string;
  quantityToMake: number;
  currentOperation: string;
  routeOperationStrip: string[];
  workstation: string;
  workCentre: string;
  linkedFiles: {
    drawing: string;
    nc: string;
    instructions: string;
    qc: string;
  };
  status: TravellerStatus;
  checklist: TravellerChecklist;
  releasedAt?: string;
}

interface TravellerState {
  travellers: TravellerPacket[];
  releaseTraveller: (id: string) => { ok: boolean; reason?: string };
  holdTraveller: (id: string) => void;
}

export function isTravellerReadyForRelease(packet: TravellerPacket): boolean {
  const checklist = packet.checklist;
  return (
    checklist.routingComplete &&
    checklist.drawingAttached &&
    checklist.ncAttachedIfRequired &&
    checklist.instructionsPresent &&
    checklist.revisionLocked &&
    (checklist.materialStatus === 'ready' || checklist.materialStatus === 'ordered')
  );
}

const initialTravellers: TravellerPacket[] = [
  {
    id: 'traveller-001',
    travellerNumber: 'TRV-2026-0015',
    jobRef: 'JOB-2026-0015',
    workOrderRef: 'WO-2026-0002',
    partName: 'Ring Gear · DF-RG-440',
    drawingNumber: 'DWG-DF-RG-440',
    drawingRevision: 'Rev C',
    quantityToMake: 1,
    currentOperation: 'Gear hobbing',
    routeOperationStrip: ['Prepare BOM', 'NC Files', 'Rough Turn', 'Gear Hobbing', 'Deburr', 'Case Harden', 'Finish Grind', 'CMM'],
    workstation: 'Gear Hobber 1',
    workCentre: 'Gear Cutting',
    linkedFiles: {
      drawing: 'DWG-DF-RG-440-RevC.pdf',
      nc: 'DF-RG-440_op1.nc',
      instructions: 'Hob_Sequence_M4.pdf',
      qc: 'CMM_RingGear_DF-RG-440.pdf',
    },
    status: 'ready',
    checklist: {
      routingComplete: true,
      drawingAttached: true,
      ncAttachedIfRequired: true,
      instructionsPresent: true,
      materialStatus: 'ready',
      revisionLocked: true,
    },
  },
  {
    id: 'traveller-002',
    travellerNumber: 'TRV-2026-0002',
    jobRef: 'JOB-2026-0012',
    workOrderRef: 'WO-2026-0002',
    partName: 'Mounting Bracket Kit',
    drawingNumber: 'DWG-MBK-110',
    drawingRevision: 'Rev B',
    quantityToMake: 120,
    currentOperation: 'Planning review',
    routeOperationStrip: ['Laser', 'Bend', 'Deburr', 'Pack'],
    workstation: 'Awaiting Release',
    workCentre: 'Planning',
    linkedFiles: {
      drawing: 'DWG-MBK-110-RevB.pdf',
      nc: 'Pending NC post',
      instructions: 'WI-MBK-110.pdf',
      qc: 'QC-MBK-110.pdf',
    },
    status: 'draft',
    checklist: {
      routingComplete: true,
      drawingAttached: true,
      ncAttachedIfRequired: false,
      instructionsPresent: true,
      materialStatus: 'ordered',
      revisionLocked: false,
    },
  },
  {
    id: 'traveller-003',
    travellerNumber: 'TRV-2026-0003',
    jobRef: 'JOB-2026-0011',
    workOrderRef: 'WO-2026-0003',
    partName: 'Cable Tray Support',
    drawingNumber: 'DWG-CTS-600',
    drawingRevision: 'Rev A',
    quantityToMake: 50,
    currentOperation: 'Press brake setup',
    routeOperationStrip: ['Laser', 'Bend', 'Drill', 'Final QC'],
    workstation: 'Press Brake 2',
    workCentre: 'Forming',
    linkedFiles: {
      drawing: 'DWG-CTS-600-RevA.pdf',
      nc: 'NC-CTS-600-LASER.ncx',
      instructions: 'WI-CTS-600.pdf',
      qc: 'QC-CTS-600.pdf',
    },
    status: 'released',
    checklist: {
      routingComplete: true,
      drawingAttached: true,
      ncAttachedIfRequired: true,
      instructionsPresent: true,
      materialStatus: 'ready',
      revisionLocked: true,
    },
    releasedAt: '2026-04-12T09:15:00Z',
  },
];

export const useTravellerStore = create<TravellerState>((set, get) => ({
  travellers: initialTravellers,
  releaseTraveller: (id) => {
    const packet = get().travellers.find((entry) => entry.id === id);
    if (!packet) {
      return { ok: false, reason: 'Traveller not found.' };
    }

    if (!isTravellerReadyForRelease(packet)) {
      return {
        ok: false,
        reason:
          'This traveller can only be issued once files, routing, and materials are ready.',
      };
    }

    set((state) => ({
      travellers: state.travellers.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: 'released',
              releasedAt: new Date().toISOString(),
            }
          : entry,
      ),
    }));

    return { ok: true };
  },
  holdTraveller: (id) =>
    set((state) => ({
      travellers: state.travellers.map((entry) =>
        entry.id === id ? { ...entry, status: 'hold' } : entry,
      ),
    })),
}));
