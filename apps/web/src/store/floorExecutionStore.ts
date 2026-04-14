import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createZustandStorage } from '@/lib/platform/storage';
import type {
  ExecutionMutation,
  InspectionGate,
  ReferenceView,
} from '@/components/floor/execution/types';

interface FloorExecutionState {
  referenceViews: Record<string, ReferenceView>;
  inspectionChecklistByGate: Record<string, Partial<Record<InspectionGate, string[]>>>;
  referenceRuleChecklistByView: Record<string, Partial<Record<ReferenceView, string[]>>>;
  requiredReferenceChecklistByView: Record<string, Partial<Record<ReferenceView, string[]>>>;
  referenceChecklistSignoffByView: Record<
    string,
    Partial<Record<ReferenceView, { signedBy: string; signedAt: number }>>
  >;
  handoverDrafts: Record<string, string>;
  handoverNotes: Record<string, string>;
  queuedMutations: ExecutionMutation[];
  syncedMutationIds: string[];
  pendingResumeWorkOrderId: string | null;
  lastSyncedAtByWorkOrder: Record<string, number>;

  setReferenceView: (workOrderId: string, view: ReferenceView) => void;
  setInspectionChecklist: (
    workOrderId: string,
    gate: InspectionGate,
    checkedItemIds: string[]
  ) => void;
  setReferenceRuleChecklist: (
    workOrderId: string,
    view: ReferenceView,
    checkedItemIds: string[]
  ) => void;
  setRequiredReferenceChecklist: (
    workOrderId: string,
    view: ReferenceView,
    checkedItemIds: string[]
  ) => void;
  setReferenceChecklistSignoff: (
    workOrderId: string,
    view: ReferenceView,
    signoff: { signedBy: string; signedAt: number } | null
  ) => void;
  setHandoverDraft: (workOrderId: string, note: string) => void;
  saveHandoverNote: (workOrderId: string, note: string) => void;
  acknowledgeHandoverNote: (workOrderId: string) => void;
  queueMutation: (mutation: ExecutionMutation) => void;
  markMutationsSynced: (workOrderId: string, mutationIds?: string[]) => void;
  markSynced: (workOrderId: string, timestamp?: number) => void;
  setPendingResumeWorkOrder: (workOrderId: string | null) => void;
  clearWorkOrderState: (workOrderId: string) => void;
}

export const useFloorExecutionStore = create<FloorExecutionState>()(
  persist(
    (set) => ({
      referenceViews: {},
      inspectionChecklistByGate: {},
      referenceRuleChecklistByView: {},
      requiredReferenceChecklistByView: {},
      referenceChecklistSignoffByView: {},
      handoverDrafts: {},
      handoverNotes: {},
      queuedMutations: [],
      syncedMutationIds: [],
      pendingResumeWorkOrderId: null,
      lastSyncedAtByWorkOrder: {},

      setReferenceView: (workOrderId, view) =>
        set((state) => ({
          referenceViews: {
            ...state.referenceViews,
            [workOrderId]: view,
          },
        })),

      setInspectionChecklist: (workOrderId, gate, checkedItemIds) =>
        set((state) => ({
          inspectionChecklistByGate: {
            ...state.inspectionChecklistByGate,
            [workOrderId]: {
              ...state.inspectionChecklistByGate[workOrderId],
              [gate]: checkedItemIds,
            },
          },
        })),

      setReferenceRuleChecklist: (workOrderId, view, checkedItemIds) =>
        set((state) => ({
          referenceRuleChecklistByView: {
            ...state.referenceRuleChecklistByView,
            [workOrderId]: {
              ...state.referenceRuleChecklistByView[workOrderId],
              [view]: checkedItemIds,
            },
          },
        })),

      setRequiredReferenceChecklist: (workOrderId, view, checkedItemIds) =>
        set((state) => ({
          requiredReferenceChecklistByView: {
            ...state.requiredReferenceChecklistByView,
            [workOrderId]: {
              ...state.requiredReferenceChecklistByView[workOrderId],
              [view]: checkedItemIds,
            },
          },
        })),

      setReferenceChecklistSignoff: (workOrderId, view, signoff) =>
        set((state) => {
          const current = state.referenceChecklistSignoffByView[workOrderId] ?? {};
          const nextForWorkOrder = { ...current };

          if (signoff) {
            nextForWorkOrder[view] = signoff;
          } else {
            delete nextForWorkOrder[view];
          }

          return {
            referenceChecklistSignoffByView: {
              ...state.referenceChecklistSignoffByView,
              [workOrderId]: nextForWorkOrder,
            },
          };
        }),

      setHandoverDraft: (workOrderId, note) =>
        set((state) => ({
          handoverDrafts: {
            ...state.handoverDrafts,
            [workOrderId]: note,
          },
        })),

      saveHandoverNote: (workOrderId, note) =>
        set((state) => ({
          handoverNotes: {
            ...state.handoverNotes,
            [workOrderId]: note,
          },
          handoverDrafts: {
            ...state.handoverDrafts,
            [workOrderId]: note,
          },
        })),

      acknowledgeHandoverNote: (workOrderId) =>
        set((state) => {
          const nextNotes = { ...state.handoverNotes };
          delete nextNotes[workOrderId];

          return { handoverNotes: nextNotes };
        }),

      queueMutation: (mutation) =>
        set((state) => ({
          queuedMutations: [...state.queuedMutations, mutation],
          syncedMutationIds: state.syncedMutationIds.filter(
            (id) => id !== mutation.id
          ),
        })),

      markMutationsSynced: (workOrderId, mutationIds) =>
        set((state) => {
          const idsToMark =
            mutationIds ??
            state.queuedMutations
              .filter((mutation) => mutation.workOrderId === workOrderId)
              .map((mutation) => mutation.id);

          return {
            syncedMutationIds: Array.from(
              new Set([...state.syncedMutationIds, ...idsToMark])
            ),
          };
        }),

      markSynced: (workOrderId, timestamp = Date.now()) =>
        set((state) => ({
          lastSyncedAtByWorkOrder: {
            ...state.lastSyncedAtByWorkOrder,
            [workOrderId]: timestamp,
          },
        })),

      setPendingResumeWorkOrder: (workOrderId) =>
        set({
          pendingResumeWorkOrderId: workOrderId,
        }),

      clearWorkOrderState: (workOrderId) =>
        set((state) => {
          const nextReferenceViews = { ...state.referenceViews };
          const nextInspectionChecklistByGate = { ...state.inspectionChecklistByGate };
          const nextReferenceRuleChecklistByView = {
            ...state.referenceRuleChecklistByView,
          };
          const nextRequiredReferenceChecklistByView = {
            ...state.requiredReferenceChecklistByView,
          };
          const nextReferenceChecklistSignoffByView = {
            ...state.referenceChecklistSignoffByView,
          };
          const nextHandoverDrafts = { ...state.handoverDrafts };
          const nextLastSyncedAt = { ...state.lastSyncedAtByWorkOrder };

          delete nextReferenceViews[workOrderId];
          delete nextInspectionChecklistByGate[workOrderId];
          delete nextReferenceRuleChecklistByView[workOrderId];
          delete nextRequiredReferenceChecklistByView[workOrderId];
          delete nextReferenceChecklistSignoffByView[workOrderId];
          delete nextHandoverDrafts[workOrderId];
          delete nextLastSyncedAt[workOrderId];

          return {
            referenceViews: nextReferenceViews,
            inspectionChecklistByGate: nextInspectionChecklistByGate,
            referenceRuleChecklistByView: nextReferenceRuleChecklistByView,
            requiredReferenceChecklistByView: nextRequiredReferenceChecklistByView,
            referenceChecklistSignoffByView: nextReferenceChecklistSignoffByView,
            handoverDrafts: nextHandoverDrafts,
            lastSyncedAtByWorkOrder: nextLastSyncedAt,
            queuedMutations: state.queuedMutations.filter(
              (mutation) => mutation.workOrderId !== workOrderId
            ),
            syncedMutationIds: state.syncedMutationIds.filter(
              (id) =>
                !state.queuedMutations.some(
                  (mutation) =>
                    mutation.workOrderId === workOrderId && mutation.id === id
                )
            ),
            pendingResumeWorkOrderId:
              state.pendingResumeWorkOrderId === workOrderId
                ? null
                : state.pendingResumeWorkOrderId,
          };
        }),
    }),
    {
      name: 'mw.floor-execution',
      storage: createJSONStorage(() => createZustandStorage('local')),
    }
  )
);
