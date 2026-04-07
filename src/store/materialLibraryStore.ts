/**
 * Material Library Store — zustand state for the materials library.
 *
 * Persists to localStorage so the seeded list survives reloads and edits.
 * Mirrors the productBuilderStore pattern for consistency.
 */

import { create } from 'zustand';
import type { Material } from '@/lib/material-library/types';
import { MATERIAL_SEED } from '@/lib/material-library/seed';

const STORAGE_KEY = 'mw-material-library';

function loadMaterials(): Material[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Material[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MATERIAL_SEED));
  return MATERIAL_SEED;
}

function saveMaterials(materials: Material[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
}

interface MaterialLibraryState {
  materials: Material[];
  loadMaterials: () => void;
  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => Material;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  removeMaterial: (id: string) => void;
  resetToSeed: () => void;
}

export const useMaterialLibraryStore = create<MaterialLibraryState>((set, get) => ({
  materials: loadMaterials(),

  loadMaterials: () => {
    set({ materials: loadMaterials() });
  },

  addMaterial: (material) => {
    const now = new Date().toISOString();
    const next: Material = {
      ...material,
      id: `mat-${Math.random().toString(36).slice(2, 10)}`,
      createdAt: now,
      updatedAt: now,
    };
    const materials = [...get().materials, next];
    saveMaterials(materials);
    set({ materials });
    return next;
  },

  updateMaterial: (id, updates) => {
    const materials = get().materials.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m,
    );
    saveMaterials(materials);
    set({ materials });
  },

  removeMaterial: (id) => {
    const materials = get().materials.filter((m) => m.id !== id);
    saveMaterials(materials);
    set({ materials });
  },

  resetToSeed: () => {
    saveMaterials(MATERIAL_SEED);
    set({ materials: MATERIAL_SEED });
  },
}));
