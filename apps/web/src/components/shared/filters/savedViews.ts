/**
 * Saved-views store — personal + group-shared + system presets.
 *
 * Backed by localStorage so the pilot is fully functional without server work.
 * The shape and API are server-ready: a future SavedView API can hydrate the
 * same record type without UI changes.
 *
 * Three-role access model in this app is **admin / lead / team**. Only a Lead
 * (or Admin) can share to a group. The current-user mock returns a Lead role
 * to demo the share flow; a real auth lookup will replace this later.
 */

import { useCallback, useEffect, useState } from "react";

import { type FilterState, type SavedView, type SavedViewScope } from "./schema";

const STORAGE_KEY = "mw.savedViews.v1";

/* ------------------------------------------------------------------ */
/*  Mock current-user / current-group identity                          */
/* ------------------------------------------------------------------ */

/** Single source of truth for "who's logged in" — replace with real auth later. */
export interface ViewerIdentity {
  userId: string;
  userName: string;
  role: "admin" | "lead" | "team";
  groupId?: string;
  groupName?: string;
}

const MOCK_VIEWER: ViewerIdentity = {
  userId: "u-001",
  userName: "Matt",
  role: "lead",
  groupId: "g-sales",
  groupName: "Sales Team",
};

export function getViewer(): ViewerIdentity {
  return MOCK_VIEWER;
}

export function canShareWithGroup(viewer: ViewerIdentity = getViewer()): boolean {
  return viewer.role === "admin" || viewer.role === "lead";
}

/* ------------------------------------------------------------------ */
/*  Storage                                                            */
/* ------------------------------------------------------------------ */

type Store = Record<string, SavedView[]>; // keyed by module id

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota / private-mode — silently degrade.
  }
}

const STORE_EVENT = "mw:savedViews:changed";

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORE_EVENT));
}

/* ------------------------------------------------------------------ */
/*  System presets — seeded for the pilot                              */
/* ------------------------------------------------------------------ */

const SYSTEM_PRESETS: Record<string, SavedView[]> = {};

export function registerSystemPresets(module: string, presets: Omit<SavedView, "id" | "module" | "scope" | "ownerId" | "createdAt" | "updatedAt" | "ownerName">[]) {
  SYSTEM_PRESETS[module] = presets.map((p, i) => ({
    id: `system.${module}.${i}`,
    module,
    scope: "system",
    ownerId: "system",
    ownerName: "MirrorWorks",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...p,
  }));
}

export function getSystemPresets(module: string): SavedView[] {
  return SYSTEM_PRESETS[module] ?? [];
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export interface SavePresetArgs {
  module: string;
  name: string;
  state: FilterState;
  scope: SavedViewScope;
  emoji?: string;
  pinned?: boolean;
  isDefault?: boolean;
}

export function listSavedViews(module: string): SavedView[] {
  const store = readStore();
  const stored = store[module] ?? [];
  const system = getSystemPresets(module);
  return [...system, ...stored];
}

export function getSavedView(module: string, id: string): SavedView | undefined {
  return listSavedViews(module).find((v) => v.id === id);
}

export function savePreset(args: SavePresetArgs): SavedView {
  const viewer = getViewer();
  const now = new Date().toISOString();
  const view: SavedView = {
    id: `${args.scope}.${args.module}.${Date.now().toString(36)}`,
    module: args.module,
    name: args.name,
    scope: args.scope,
    ownerId: viewer.userId,
    ownerName: viewer.userName,
    groupId: args.scope === "group" ? viewer.groupId : undefined,
    groupName: args.scope === "group" ? viewer.groupName : undefined,
    state: args.state,
    emoji: args.emoji,
    pinned: args.pinned,
    isDefault: args.isDefault,
    createdAt: now,
    updatedAt: now,
  };
  const store = readStore();
  const existing = store[args.module] ?? [];
  // If isDefault, unset on others (within same scope/owner).
  const normalised = view.isDefault
    ? existing.map((v) =>
        v.scope === view.scope && v.ownerId === view.ownerId
          ? { ...v, isDefault: false }
          : v,
      )
    : existing;
  store[args.module] = [...normalised, view];
  writeStore(store);
  emitChange();
  return view;
}

export function updatePreset(module: string, id: string, patch: Partial<SavedView>): SavedView | undefined {
  const store = readStore();
  const existing = store[module] ?? [];
  let updated: SavedView | undefined;
  store[module] = existing.map((v) => {
    if (v.id !== id) return v;
    updated = { ...v, ...patch, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (updated) {
    writeStore(store);
    emitChange();
  }
  return updated;
}

export function deletePreset(module: string, id: string): void {
  const store = readStore();
  const existing = store[module] ?? [];
  store[module] = existing.filter((v) => v.id !== id);
  writeStore(store);
  emitChange();
}

export function setDefaultPreset(module: string, id: string, viewer = getViewer()): void {
  const store = readStore();
  const existing = store[module] ?? [];
  store[module] = existing.map((v) => ({
    ...v,
    isDefault: v.id === id ? true : v.ownerId === viewer.userId ? false : v.isDefault,
  }));
  writeStore(store);
  emitChange();
}

/* ------------------------------------------------------------------ */
/*  React hook                                                         */
/* ------------------------------------------------------------------ */

export function useSavedViews(module: string): SavedView[] {
  const [views, setViews] = useState<SavedView[]>(() => listSavedViews(module));

  useEffect(() => {
    const handler = () => setViews(listSavedViews(module));
    window.addEventListener(STORE_EVENT, handler);
    window.addEventListener("storage", handler); // cross-tab sync
    return () => {
      window.removeEventListener(STORE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [module]);

  return views;
}

/** Convenience: returns the default preset for this user on this module, if any. */
export function useDefaultPreset(module: string): SavedView | undefined {
  const all = useSavedViews(module);
  const viewer = getViewer();
  return all.find((v) => v.isDefault && (v.scope !== "personal" || v.ownerId === viewer.userId));
}

/** Imperative reload — useful for ad-hoc refreshes after navigation. */
export function useSavedViewsActions() {
  return {
    save: useCallback(savePreset, []),
    update: useCallback(updatePreset, []),
    delete: useCallback(deletePreset, []),
    setDefault: useCallback(setDefaultPreset, []),
  };
}
