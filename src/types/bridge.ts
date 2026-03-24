// ─── MirrorWorks Bridge Types (PLAT 01) ─────────────────────────────

export type SourceSystem =
  | 'spreadsheets'
  | 'jobboss'
  | 'e2shop'
  | 'fulcrum'
  | 'acumatica'
  | 'odoo'
  | 'xero'
  | 'other_erp'
  | 'pen_paper';

export type ImportPath = 'file_upload' | 'manual_entry';

export type BridgeStep =
  | 'source'
  | 'scope'
  | 'upload'
  | 'mapping'
  | 'manual_entry'
  | 'review'
  | 'results'
  | 'team_setup';

export type SessionStatus =
  | 'in_progress'
  | 'mapping'
  | 'reviewing'
  | 'importing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AnalysisStatus = 'pending' | 'analysing' | 'complete' | 'error';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export type MappingStatus =
  | 'suggested'
  | 'confirmed'
  | 'overridden'
  | 'skipped'
  | 'custom_field';

// ─── File & Upload ──────────────────────────────────────────────────

export interface BridgeFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: 'xlsx' | 'xls' | 'csv';
  detectedEntityType: string | null;
  headers: string[];
  sampleData: Record<string, string>[];
  rowCount: number;
  analysisStatus: AnalysisStatus;
}

// ─── Field Mapping ──────────────────────────────────────────────────

export interface FieldMapping {
  id: string;
  sourceColumn: string;
  sourceColumnIndex: number;
  targetTable: string | null;
  targetColumn: string | null;
  customFieldId: string | null;
  aiConfidence: number | null;
  aiReasoning: string | null;
  userConfirmed: boolean;
  mappingStatus: MappingStatus;
  sampleValues: string[];
}

export interface TargetFieldOption {
  table: string;
  column: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
  group: 'required' | 'optional' | 'custom';
}

// ─── Scope (Path C — Pen & Paper) ───────────────────────────────────

export interface ScopeAnswers {
  customerCount: string;
  productCount: string;
  machineCount: string;
  hasSuppliers: 'yes' | 'no' | 'sometimes';
  teamSize: string;
  hasOpenWork: 'yes' | 'no';
  tracksInventory: 'yes' | 'roughly' | 'no';
  workTypes: string[];
}

// ─── Preview & Import ───────────────────────────────────────────────

export interface PreviewRecord {
  rowNumber: number;
  data: Record<string, unknown>;
  warnings: string[];
  excluded: boolean;
}

export interface ImportSummary {
  created: Record<string, number>;
  flagged: Record<string, number>;
  skipped: Record<string, number>;
  errors: Record<string, number>;
}

export interface ImportProgress {
  entity: string;
  processed: number;
  total: number;
}

// ─── Team Setup ─────────────────────────────────────────────────────

export interface ModuleGroup {
  id: string;
  module: string;
  name: string;
  description: string;
  isDefault: boolean;
  memberCount: number;
}

export interface TeamSuggestion {
  employeeId: string;
  employeeName: string;
  importedTitle: string;
  suggestions: {
    module: string;
    groupName: string;
    groupId: string;
    confidence: number;
    reasoning: string;
  }[];
}

// ─── Store State ────────────────────────────────────────────────────

export interface BridgeState {
  sessionId: string | null;
  sourceSystem: SourceSystem | null;
  importPath: ImportPath | null;
  currentStep: BridgeStep;
  sessionStatus: SessionStatus;
  scopeAnswers: ScopeAnswers;
  files: BridgeFile[];
  mappings: Record<string, FieldMapping[]>;
  previewRecords: Record<string, PreviewRecord[]>;
  importProgress: ImportProgress | null;
  importSummary: ImportSummary | null;
  moduleGroups: Record<string, ModuleGroup[]>;
  teamSuggestions: TeamSuggestion[];

  // Actions
  setSourceSystem: (system: SourceSystem) => void;
  setImportPath: (path: ImportPath) => void;
  setCurrentStep: (step: BridgeStep) => void;
  setSessionStatus: (status: SessionStatus) => void;
  addFile: (file: BridgeFile) => void;
  removeFile: (fileId: string) => void;
  updateFileAnalysis: (fileId: string, update: Partial<BridgeFile>) => void;
  setMappings: (fileId: string, mappings: FieldMapping[]) => void;
  updateMapping: (fileId: string, mappingId: string, update: Partial<FieldMapping>) => void;
  setScopeAnswers: (answers: Partial<ScopeAnswers>) => void;
  setPreviewRecords: (entityType: string, records: PreviewRecord[]) => void;
  toggleRecordExclusion: (entityType: string, rowNumber: number) => void;
  setImportProgress: (progress: ImportProgress | null) => void;
  setImportSummary: (summary: ImportSummary | null) => void;
  setModuleGroups: (groups: Record<string, ModuleGroup[]>) => void;
  setTeamSuggestions: (suggestions: TeamSuggestion[]) => void;
  reset: () => void;
}
