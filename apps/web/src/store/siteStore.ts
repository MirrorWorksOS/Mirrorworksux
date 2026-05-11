import { create } from 'zustand';

export interface Site {
  id: string;
  name: string;
}

export const SITES: Site[] = [
  { id: 'sydney', name: 'Sydney Workshop' },
  { id: 'melbourne', name: 'Melbourne Workshop' },
  { id: 'brisbane', name: 'Brisbane Yard' },
];

interface SiteState {
  currentSiteId: string;
  setCurrentSiteId: (id: string) => void;
}

export const useSiteStore = create<SiteState>((set) => ({
  currentSiteId: SITES[0].id,
  setCurrentSiteId: (id) => set({ currentSiteId: id }),
}));

export function getSiteById(id: string): Site {
  return SITES.find((s) => s.id === id) ?? SITES[0];
}
