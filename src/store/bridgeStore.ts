import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BridgeState,
  BridgeStep,
  ImportPath,
  ImportProgress,
  ImportSummary,
  SessionStatus,
  SourceSystem,
  BridgeFile,
  FieldMapping,
  ModuleGroup,
  PreviewRecord,
  ScopeAnswers,
  TeamSuggestion,
} from '@/types/bridge';

const initialScopeAnswers: ScopeAnswers = {
  customerCount: '',
  productCount: '',
  machineCount: '',
  hasSuppliers: 'no',
  teamSize: '',
  hasOpenWork: 'no',
  tracksInventory: 'no',
  workTypes: [],
};

const initialState = {
  sessionId: null as string | null,
  sourceSystem: null as SourceSystem | null,
  importPath: null as ImportPath | null,
  currentStep: 'source' as BridgeStep,
  sessionStatus: 'in_progress' as SessionStatus,
  scopeAnswers: initialScopeAnswers,
  files: [] as BridgeFile[],
  mappings: {} as Record<string, FieldMapping[]>,
  previewRecords: {} as Record<string, PreviewRecord[]>,
  importProgress: null as ImportProgress | null,
  importSummary: null as ImportSummary | null,
  moduleGroups: {} as Record<string, ModuleGroup[]>,
  teamSuggestions: [] as TeamSuggestion[],
};

export const useBridgeStore = create<BridgeState>()(
  persist(
    (set) => ({
      ...initialState,

      setSourceSystem: (system: SourceSystem) => set({ sourceSystem: system }),
      setImportPath: (path: ImportPath) => set({ importPath: path }),
      setCurrentStep: (step: BridgeStep) => set({ currentStep: step }),
      setSessionStatus: (status: SessionStatus) => set({ sessionStatus: status }),

      addFile: (file: BridgeFile) =>
        set((state) => ({ files: [...state.files, file] })),

      removeFile: (fileId: string) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== fileId),
          mappings: (() => {
            const next = { ...state.mappings };
            delete next[fileId];
            return next;
          })(),
        })),

      updateFileAnalysis: (fileId: string, update: Partial<BridgeFile>) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId ? { ...f, ...update } : f
          ),
        })),

      setMappings: (fileId: string, mappings: FieldMapping[]) =>
        set((state) => ({
          mappings: { ...state.mappings, [fileId]: mappings },
        })),

      updateMapping: (fileId: string, mappingId: string, update: Partial<FieldMapping>) =>
        set((state) => ({
          mappings: {
            ...state.mappings,
            [fileId]: (state.mappings[fileId] || []).map((m) =>
              m.id === mappingId ? { ...m, ...update } : m
            ),
          },
        })),

      setScopeAnswers: (answers: Partial<ScopeAnswers>) =>
        set((state) => ({
          scopeAnswers: { ...state.scopeAnswers, ...answers },
        })),

      setPreviewRecords: (entityType: string, records: PreviewRecord[]) =>
        set((state) => ({
          previewRecords: { ...state.previewRecords, [entityType]: records },
        })),

      toggleRecordExclusion: (entityType: string, rowNumber: number) =>
        set((state) => ({
          previewRecords: {
            ...state.previewRecords,
            [entityType]: (state.previewRecords[entityType] || []).map((r) =>
              r.rowNumber === rowNumber ? { ...r, excluded: !r.excluded } : r
            ),
          },
        })),

      setImportProgress: (progress: ImportProgress | null) =>
        set({ importProgress: progress }),

      setImportSummary: (summary: ImportSummary | null) =>
        set({ importSummary: summary }),

      setModuleGroups: (groups: Record<string, ModuleGroup[]>) =>
        set({ moduleGroups: groups }),

      setTeamSuggestions: (suggestions: TeamSuggestion[]) =>
        set({ teamSuggestions: suggestions }),

      reset: () => set(initialState),
    }),
    {
      name: 'mirrorworks-bridge',
      partialize: (state) => ({
        sessionId: state.sessionId,
        sourceSystem: state.sourceSystem,
        importPath: state.importPath,
        currentStep: state.currentStep,
        scopeAnswers: state.scopeAnswers,
      }),
    }
  )
);
