/**
 * Drag-and-drop file upload zone.
 * Accepts .xlsx, .xls, .csv up to 50MB.
 */
import { useState, useCallback, useRef } from 'react';
import { cn } from '@/components/ui/utils';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED = '.xlsx,.xls,.csv';
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploadZone({ onFilesSelected, disabled }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const valid = Array.from(fileList).filter((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['xlsx', 'xls', 'csv'].includes(ext || '') && f.size <= MAX_SIZE;
      });
      if (valid.length) onFilesSelected(valid);
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center min-h-[200px] rounded-xl border-2 border-dashed transition-all cursor-pointer',
        isDragOver
          ? 'border-[var(--mw-yellow-400)] bg-[color-mix(in_srgb,var(--mw-yellow-400)_8%,white)] dark:bg-[color-mix(in_srgb,var(--mw-yellow-400)_8%,var(--card))]'
          : 'border-muted-foreground/25 hover:border-muted-foreground/40',
        disabled && 'opacity-[0.38] cursor-not-allowed'
      )}
    >
      <Upload className="w-8 h-8 text-muted-foreground mb-3" />
      <p className="text-sm font-medium text-foreground">Drag files here or click to browse</p>
      <p className="text-xs text-muted-foreground mt-1">Accepts .xlsx, .xls, .csv up to 50MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}
