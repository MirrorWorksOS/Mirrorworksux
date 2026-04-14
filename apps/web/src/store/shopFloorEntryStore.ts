import { create } from 'zustand';

import { MACHINE_GRID_MOCKS } from '@/components/make/shop-floor/mockMachines';
import type { Machine } from '@/components/make/shop-floor/types';

interface ShopFloorEntryState {
  machines: Machine[];
  selectedMachineId: string | null;
  setMachines: (machines: Machine[]) => void;
  openMachine: (machineId: string) => void;
  closeMachine: () => void;
}

export const useShopFloorEntryStore = create<ShopFloorEntryState>((set) => ({
  machines: MACHINE_GRID_MOCKS,
  selectedMachineId: null,

  setMachines: (machines) => set({ machines }),

  openMachine: (machineId) => set({ selectedMachineId: machineId }),

  closeMachine: () => set({ selectedMachineId: null }),
}));
