/**
 * Plan CAD Import — MirrorView CAD file import screen.
 * Supports .step, .stp, .iges, .dxf, .dwg with drag-and-drop upload,
 * file preview, import settings, and progress indication.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileBox,
  Trash2,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Eye,
  FileType,
  HardDrive,
  Ruler,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { toast } from 'sonner';

// ── Types ───────────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = ['.step', '.stp', '.iges', '.igs', '.dxf', '.dwg'];
const ACCEPTED_MIME_MAP: Record<string, string> = {
  '.step': 'STEP',
  '.stp': 'STEP',
  '.iges': 'IGES',
  '.igs': 'IGES',
  '.dxf': 'DXF',
  '.dwg': 'DWG',
};

type ImportStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
type UnitSystem = 'mm' | 'inch' | 'meter';
type ScaleOption = '1:1' | '1:10' | '1:100' | 'custom';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  status: ImportStatus;
  progress: number;
  addedAt: Date;
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.substring(dot).toLowerCase() : '';
}

function getFileFormat(ext: string): string {
  return ACCEPTED_MIME_MAP[ext] || 'Unknown';
}

// ── Component ───────────────────────────────────────────────────────

export function PlanCADImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [units, setUnits] = useState<UnitSystem>('mm');
  const [scale, setScale] = useState<ScaleOption>('1:1');
  const [customScale, setCustomScale] = useState('1');
  const [showSettings, setShowSettings] = useState(true);

  // Simulate file import with progress
  const simulateImport = useCallback((fileId: string) => {
    // Upload phase
    const uploadInterval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== fileId) return f;
          if (f.progress < 50) {
            return { ...f, status: 'uploading', progress: f.progress + Math.random() * 15 };
          }
          clearInterval(uploadInterval);
          return f;
        }),
      );
    }, 200);

    // Processing phase
    setTimeout(() => {
      clearInterval(uploadInterval);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'processing', progress: 60 } : f)),
      );

      const processInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id !== fileId) return f;
            if (f.progress < 100) {
              return { ...f, progress: Math.min(f.progress + Math.random() * 12, 100) };
            }
            clearInterval(processInterval);
            return { ...f, status: 'complete', progress: 100 };
          }),
        );
      }, 300);

      // Final complete
      setTimeout(() => {
        clearInterval(processInterval);
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'complete', progress: 100 } : f)),
        );
        toast.success('CAD file imported successfully');
      }, 3000);
    }, 2000);
  }, []);

  const addFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = getFileExtension(file.name);
        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
          toast.error(`Unsupported file type: ${ext}`);
          continue;
        }
        const id = `cad-${Date.now()}-${i}`;
        newFiles.push({
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          extension: ext,
          status: 'idle',
          progress: 0,
          addedAt: new Date(),
        });
      }
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
    },
    [addFiles],
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const importFile = useCallback(
    (fileId: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading', progress: 5 } : f)),
      );
      simulateImport(fileId);
    },
    [simulateImport],
  );

  const importAll = useCallback(() => {
    const idle = files.filter((f) => f.status === 'idle');
    idle.forEach((f) => importFile(f.id));
  }, [files, importFile]);

  const idleCount = files.filter((f) => f.status === 'idle').length;
  const completedCount = files.filter((f) => f.status === 'complete').length;
  const processingCount = files.filter((f) => f.status === 'uploading' || f.status === 'processing').length;

  return (
    <PageShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Plan', href: '/plan' },
          { label: 'NC Connect', href: '/plan/nc-connect' },
          { label: 'CAD Import' },
        ]}
        title="MirrorView CAD Import"
        subtitle="Import CAD files for viewing, nesting, and production planning"
        actions={
          files.length > 0 && idleCount > 0 ? (
            <Button
              className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] gap-2"
              onClick={importAll}
            >
              <Upload className="w-4 h-4" />
              Import All ({idleCount})
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column — Drop zone + file list */}
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <Card
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-[var(--shape-lg)] p-10 cursor-pointer transition-all duration-200 group',
              isDragOver
                ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/5 dark:bg-[var(--mw-yellow-400)]/10'
                : 'border-[var(--neutral-300)] dark:border-[var(--neutral-600)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-900)] hover:border-[var(--neutral-400)] dark:hover:border-[var(--neutral-500)]',
            )}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors',
                  isDragOver
                    ? 'bg-[var(--mw-yellow-400)]/20'
                    : 'bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] group-hover:bg-[var(--neutral-300)] dark:group-hover:bg-[var(--neutral-600)]',
                )}
              >
                <Upload
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isDragOver ? 'text-[var(--mw-yellow-400)]' : 'text-[var(--neutral-500)]',
                  )}
                />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragOver ? 'Drop files here' : 'Drag and drop CAD files here'}
              </p>
              <p className="text-xs text-[var(--neutral-500)] mb-4">
                or click to browse
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['.step', '.stp', '.iges', '.dxf', '.dwg'].map((ext) => (
                  <span
                    key={ext}
                    className="inline-flex items-center rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] px-2.5 py-0.5 text-xs font-medium text-[var(--neutral-500)] tabular-nums"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              multiple
              onChange={handleFileSelect}
            />
          </Card>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  Files ({files.length})
                </h2>
                {completedCount > 0 && (
                  <span className="text-xs text-[var(--mw-success)] font-medium">
                    {completedCount} imported
                  </span>
                )}
              </div>

              <AnimatePresence mode="popLayout">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border border-[var(--border)] bg-card rounded-[var(--shape-lg)] p-4">
                      <div className="flex items-center gap-4">
                        {/* File icon */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-[var(--shape-md)] flex items-center justify-center shrink-0',
                            file.status === 'complete'
                              ? 'bg-[var(--mw-success)]/10'
                              : file.status === 'error'
                                ? 'bg-[var(--mw-error)]/10'
                                : 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]',
                          )}
                        >
                          {file.status === 'complete' ? (
                            <CheckCircle2 className="w-5 h-5 text-[var(--mw-success)]" />
                          ) : file.status === 'error' ? (
                            <AlertTriangle className="w-5 h-5 text-[var(--mw-error)]" />
                          ) : file.status === 'uploading' || file.status === 'processing' ? (
                            <Loader2 className="w-5 h-5 text-[var(--mw-yellow-400)] animate-spin" />
                          ) : (
                            <FileBox className="w-5 h-5 text-[var(--neutral-500)]" />
                          )}
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.name}
                            </p>
                            <StatusBadge variant="neutral">
                              {getFileFormat(file.extension)}
                            </StatusBadge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[var(--neutral-500)]">
                            <span className="tabular-nums">{formatFileSize(file.size)}</span>
                            <span>{file.extension.toUpperCase().replace('.', '')}</span>
                            {file.status === 'uploading' && <span>Uploading...</span>}
                            {file.status === 'processing' && <span>Processing geometry...</span>}
                            {file.status === 'complete' && (
                              <span className="text-[var(--mw-success)]">Imported</span>
                            )}
                          </div>

                          {/* Progress bar */}
                          {(file.status === 'uploading' || file.status === 'processing') && (
                            <div className="mt-2 h-1.5 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-[var(--mw-yellow-400)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${file.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {file.status === 'idle' && (
                            <Button
                              size="sm"
                              className="h-8 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] gap-1.5 text-xs"
                              onClick={() => importFile(file.id)}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Import
                            </Button>
                          )}
                          {file.status === 'complete' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-[var(--border)] gap-1.5 text-xs"
                              onClick={() => toast('Opening 3D preview...')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Preview
                            </Button>
                          )}
                          {(file.status === 'idle' || file.status === 'complete' || file.status === 'error') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeFile(file.id)}
                            >
                              <Trash2 className="w-4 h-4 text-[var(--neutral-400)] hover:text-[var(--mw-error)]" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty state */}
          {files.length === 0 && (
            <Card className="border border-[var(--border)] bg-card rounded-[var(--shape-lg)] p-8">
              <div className="flex flex-col items-center text-center">
                <FileBox className="w-10 h-10 text-[var(--neutral-300)] dark:text-[var(--neutral-600)] mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">No files added</p>
                <p className="text-xs text-[var(--neutral-500)]">
                  Add CAD files using the drop zone above to get started
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Right column — Import settings */}
        <div className="space-y-6">
          <Card className="border border-[var(--border)] bg-card rounded-[var(--shape-lg)] overflow-hidden">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[var(--neutral-500)]" />
                <h3 className="text-sm font-medium text-foreground">Import Settings</h3>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-[var(--neutral-400)] transition-transform',
                  showSettings && 'rotate-180',
                )}
              />
            </button>

            {showSettings && (
              <div className="px-5 pb-5 space-y-5 border-t border-[var(--border)] pt-5">
                {/* Units */}
                <div>
                  <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-2 block">
                    Units
                  </label>
                  <div className="flex gap-1 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-[var(--shape-lg)] p-1">
                    {(['mm', 'inch', 'meter'] as UnitSystem[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnits(u)}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                          units === u
                            ? 'bg-card dark:bg-[var(--neutral-700)] text-foreground shadow-sm'
                            : 'text-[var(--neutral-500)] hover:text-foreground',
                        )}
                      >
                        {u === 'mm' ? 'Millimetres' : u === 'inch' ? 'Inches' : 'Metres'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider mb-2 block">
                    Scale
                  </label>
                  <div className="flex gap-1 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-[var(--shape-lg)] p-1">
                    {(['1:1', '1:10', '1:100', 'custom'] as ScaleOption[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors tabular-nums',
                          scale === s
                            ? 'bg-card dark:bg-[var(--neutral-700)] text-foreground shadow-sm'
                            : 'text-[var(--neutral-500)] hover:text-foreground',
                        )}
                      >
                        {s === 'custom' ? 'Custom' : s}
                      </button>
                    ))}
                  </div>
                  {scale === 'custom' && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-[var(--neutral-500)]">1 :</span>
                      <Input
                        type="number"
                        value={customScale}
                        onChange={(e) => setCustomScale(e.target.value)}
                        className="h-9 w-20 tabular-nums border-[var(--border)] bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-[var(--shape-md)] text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Import options */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider block">
                    Options
                  </label>
                  {[
                    { label: 'Auto-detect units from file', checked: true },
                    { label: 'Merge identical components', checked: false },
                    { label: 'Generate flat pattern (sheet metal)', checked: true },
                    { label: 'Extract BOM from assembly', checked: true },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        defaultChecked={opt.checked}
                        className="w-4 h-4 rounded border-[var(--border)] accent-[var(--mw-yellow-400)]"
                      />
                      <span className="text-sm text-foreground transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* File format reference */}
          <Card className="border border-[var(--border)] bg-card rounded-[var(--shape-lg)] p-5">
            <h3 className="text-sm font-medium text-foreground mb-3">Supported Formats</h3>
            <div className="space-y-3">
              {[
                { ext: '.step / .stp', label: 'STEP', desc: '3D solid/surface models (ISO 10303)', icon: FileBox },
                { ext: '.iges / .igs', label: 'IGES', desc: 'Legacy surface/wireframe exchange', icon: FileType },
                { ext: '.dxf', label: 'DXF', desc: '2D flat patterns, laser/punch profiles', icon: Ruler },
                { ext: '.dwg', label: 'DWG', desc: 'AutoCAD drawings and layouts', icon: HardDrive },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.ext} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[var(--shape-md)] bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[var(--neutral-500)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{f.label}</span>
                        <span className="text-xs tabular-nums text-[var(--neutral-400)]">{f.ext}</span>
                      </div>
                      <p className="text-xs text-[var(--neutral-500)]">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
