import { create } from 'zustand';

interface CommandPaletteState {
  open: boolean;
  initialQuery: string;
  setOpen: (open: boolean, initialQuery?: string) => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  open: false,
  initialQuery: '',
  setOpen: (open, initialQuery = '') => set({ open, initialQuery }),
}));
