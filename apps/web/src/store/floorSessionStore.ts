/**
 * floorSessionStore — Operator session state for kiosk / shop-floor mode.
 *
 * Persists across tablet refresh via localStorage so that a mid-shift reload
 * does not kick an operator out of their clocked-in session or their active
 * work order. Lives outside the main app state because floor mode is a
 * device-level posture, not a module-level feature.
 *
 * Session lifecycle:
 *   1. clockIn()        → operator authenticated at the tablet
 *   2. setStation()     → tablet knows which machine it is attached to
 *   3. startJob(woId)   → operator has picked a work order and is running it
 *   4. endJob()         → job done, back to scan/pick
 *   5. clockOut()       → full reset
 *
 * Station identity resolution (see FloorHome):
 *   - URL ?station=<machineId> takes precedence over session state
 *   - Otherwise the operator picks from FloorStationPicker after clock-in
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandStorage } from '@/lib/platform/storage';

export interface FloorSessionState {
  // Operator
  operatorId: string | null;
  operatorName: string | null;
  operatorRole: string | null;
  clockedInAt: number | null; // epoch ms

  // Station (machine this tablet is currently attached to)
  stationId: string | null;
  stationName: string | null;

  // Active job
  activeWorkOrderId: string | null;
  jobStartedAt: number | null; // epoch ms

  // Actions
  clockIn: (operator: { id: string; name: string; role: string }) => void;
  clockOut: () => void;
  switchOperator: () => void;
  setStation: (station: { id: string; name: string }) => void;
  clearStation: () => void;
  startJob: (workOrderId: string) => void;
  endJob: () => void;
  reset: () => void;
}

const initialState = {
  operatorId: null,
  operatorName: null,
  operatorRole: null,
  clockedInAt: null,
  stationId: null,
  stationName: null,
  activeWorkOrderId: null,
  jobStartedAt: null,
};

export const useFloorSession = create<FloorSessionState>()(
  persist(
    (set) => ({
      ...initialState,

      clockIn: (operator) =>
        set({
          operatorId: operator.id,
          operatorName: operator.name,
          operatorRole: operator.role,
          clockedInAt: Date.now(),
        }),

      clockOut: () => set({ ...initialState }),

      switchOperator: () =>
        set((state) => ({
          operatorId: null,
          operatorName: null,
          operatorRole: null,
          clockedInAt: null,
          activeWorkOrderId: null,
          jobStartedAt: null,
          stationId: state.stationId,
          stationName: state.stationName,
        })),

      setStation: (station) =>
        set({
          stationId: station.id,
          stationName: station.name,
        }),

      clearStation: () =>
        set({
          stationId: null,
          stationName: null,
        }),

      startJob: (workOrderId) =>
        set({
          activeWorkOrderId: workOrderId,
          jobStartedAt: Date.now(),
        }),

      endJob: () =>
        set({
          activeWorkOrderId: null,
          jobStartedAt: null,
        }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'mw.floor-session', // localStorage key
      storage: createJSONStorage(() => createZustandStorage('local')),
    }
  )
);
