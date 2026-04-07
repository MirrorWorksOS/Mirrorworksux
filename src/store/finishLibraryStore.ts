/**
 * Finish Library Store — zustand state for the finishes library.
 *
 * Persists to localStorage. Mirrors materialLibraryStore exactly.
 */

import { create } from 'zustand';
import type { Finish } from '@/lib/finish-library/types';
import { FINISH_SEED } from '@/lib/finish-library/seed';

const STORAGE_KEY = 'mw-finish-library';

function loadFinishes(): Finish[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Finish[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(FINISH_SEED));
  return FINISH_SEED;
}

function saveFinishes(finishes: Finish[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(finishes));
}

interface FinishLibraryState {
  finishes: Finish[];
  loadFinishes: () => void;
  addFinish: (finish: Omit<Finish, 'id' | 'createdAt' | 'updatedAt'>) => Finish;
  updateFinish: (id: string, updates: Partial<Finish>) => void;
  removeFinish: (id: string) => void;
  resetToSeed: () => void;
}

export const useFinishLibraryStore = create<FinishLibraryState>((set, get) => ({
  finishes: loadFinishes(),

  loadFinishes: () => {
    set({ finishes: loadFinishes() });
  },

  addFinish: (finish) => {
    const now = new Date().toISOString();
    const next: Finish = {
      ...finish,
      id: `fin-${Math.random().toString(36).slice(2, 10)}`,
      createdAt: now,
      updatedAt: now,
    };
    const finishes = [...get().finishes, next];
    saveFinishes(finishes);
    set({ finishes });
    return next;
  },

  updateFinish: (id, updates) => {
    const finishes = get().finishes.map((f) =>
      f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f,
    );
    saveFinishes(finishes);
    set({ finishes });
  },

  removeFinish: (id) => {
    const finishes = get().finishes.filter((f) => f.id !== id);
    saveFinishes(finishes);
    set({ finishes });
  },

  resetToSeed: () => {
    saveFinishes(FINISH_SEED);
    set({ finishes: FINISH_SEED });
  },
}));
