/**
 * ScanInput — Unified barcode scanning input for shop floor and warehouse.
 *
 * Replaces the repeated input+icon+button pattern used across FloorScanJob,
 * ShipScanToShip, and ShipPackaging. Wraps useBarcodeScan internally.
 *
 * Two size variants:
 *   - "default" — h-14 (56px touch target), standard for Ship contexts
 *   - "large"   — h-14 with icon box + larger text, kiosk/floor styling
 *
 * Optional features:
 *   - flash: green/red ring feedback on scan result
 *   - showCamera: camera icon button to open BarcodeScanner dialog
 *   - error: external error message display
 */

import { lazy, Suspense, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Camera, Search, ScanBarcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';
import { useBarcodeScan } from '@/hooks/useBarcodeScan';
import type { ScanSource } from '@/types/common';

const BarcodeScanner = lazy(() =>
  import('./BarcodeScanner').then((m) => ({ default: m.BarcodeScanner })),
);

export interface ScanInputHandle {
  /** Trigger a flash animation. Call from parent after determining match result. */
  flash: (result: 'ok' | 'err') => void;
  /** Clear the input value. */
  clear: () => void;
  /** Re-focus the input. */
  refocus: () => void;
}

export interface ScanInputProps {
  /** Called when a scan is completed (keyboard Enter or camera decode). */
  onScan: (value: string, source: ScanSource) => void;
  /** Placeholder text. */
  placeholder?: string;
  /** Show camera toggle button. Default: false */
  showCamera?: boolean;
  /** Size variant. Default: "default" */
  size?: 'default' | 'large';
  /** Button label. Default: "Scan" (default) or "Find" (large) */
  buttonLabel?: string;
  /** Whether to enable visual flash feedback. */
  flash?: boolean;
  /** External error message to display below the input. */
  error?: string | null;
  /** Clear error when user starts typing. */
  onErrorClear?: () => void;
  /** Additional className for the wrapper. */
  className?: string;
  /** Disabled state. */
  disabled?: boolean;
  /** Ref for imperative handle (flash, clear, refocus). */
  scanRef?: React.Ref<ScanInputHandle>;
}

export function ScanInput({
  onScan,
  placeholder,
  showCamera = false,
  size = 'default',
  buttonLabel,
  flash: flashEnabled = false,
  error,
  onErrorClear,
  className,
  disabled = false,
  scanRef,
}: ScanInputProps) {
  const [flashState, setFlashState] = useState<'none' | 'ok' | 'err'>('none');
  const [cameraOpen, setCameraOpen] = useState(false);

  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const scanReturnRef = useRef<ReturnType<typeof useBarcodeScan> | null>(null);

  const handleScan = useCallback(
    (value: string, source: ScanSource) => {
      onScanRef.current(value, source);
      // Clear input after scan — matches the behavior of all original
      // scan implementations (FloorScanJob, ShipScanToShip, ShipPackaging).
      scanReturnRef.current?.setValue('');
      scanReturnRef.current?.refocus();
    },
    [],
  );

  const scan = useBarcodeScan({
    onScan: handleScan,
    enabled: !disabled,
  });
  scanReturnRef.current = scan;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      scan.setValue(e.target.value);
      onErrorClear?.();
    },
    [scan, onErrorClear],
  );

  /** Trigger a flash animation (green or red ring). */
  const triggerFlash = useCallback((result: 'ok' | 'err') => {
    if (!flashEnabled) return;
    setFlashState(result);
    setTimeout(() => setFlashState('none'), 500);
  }, [flashEnabled]);

  // Expose imperative methods for parent components.
  useImperativeHandle(scanRef, () => ({
    flash: triggerFlash,
    clear: () => scan.setValue(''),
    refocus: scan.refocus,
  }), [triggerFlash, scan]);

  const handleCameraScan = useCallback(
    (value: string) => {
      setCameraOpen(false);
      scan.submitExternal(value, 'camera');
    },
    [scan],
  );

  const isLarge = size === 'large';
  const label = buttonLabel ?? (isLarge ? 'Find' : 'Scan');

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 rounded-[var(--shape-lg)] transition-all',
          isLarge
            ? 'p-2 bg-card border-2 border-[var(--neutral-200)] focus-within:border-[var(--mw-yellow-400)] focus-within:shadow-[var(--elevation-2)]'
            : 'relative',
          flashState === 'ok' && 'ring-2 ring-[var(--mw-success)]',
          flashState === 'err' && 'ring-2 ring-[var(--mw-error)]',
          className,
        )}
      >
        {/* Icon */}
        {isLarge ? (
          <div className="w-14 h-14 rounded-[var(--shape-md)] bg-[var(--neutral-100)] flex items-center justify-center shrink-0">
            <ScanBarcode className="w-7 h-7 text-[var(--neutral-800)]" />
          </div>
        ) : (
          <ScanBarcode
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--neutral-400)] z-10"
            strokeWidth={1.5}
          />
        )}

        {/* Input */}
        <Input
          ref={scan.inputRef as React.RefObject<HTMLInputElement>}
          value={scan.value}
          onChange={handleChange}
          onKeyDown={scan.inputProps.onKeyDown}
          placeholder={placeholder ?? 'Scan or type barcode…'}
          disabled={disabled}
          autoFocus
          spellCheck={false}
          autoCapitalize="characters"
          autoComplete="off"
          className={cn(
            isLarge
              ? 'flex-1 h-14 text-xl border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 placeholder:text-[var(--neutral-400)]'
              : 'min-h-[56px] pl-11 text-lg font-mono flex-1',
          )}
        />

        {/* Camera button */}
        {showCamera && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCameraOpen(true)}
            disabled={disabled}
            className={cn(
              'shrink-0',
              isLarge ? 'h-14 w-14' : 'min-h-[56px] min-w-[56px]',
            )}
          >
            <Camera className="w-5 h-5 text-[var(--neutral-500)]" />
          </Button>
        )}

        {/* Submit button */}
        <Button
          type="button"
          onClick={scan.submit}
          disabled={disabled || !scan.value.trim()}
          className={cn(
            'shrink-0 font-bold',
            isLarge
              ? 'h-14 px-6 bg-[var(--neutral-800)] hover:bg-[var(--neutral-900)] text-white'
              : 'min-h-[56px] px-8',
          )}
        >
          {isLarge && <Search className="w-5 h-5 mr-2" />}
          {!isLarge && <ScanBarcode className="mr-2 h-5 w-5" strokeWidth={1.5} />}
          {label}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-3 flex items-start gap-2 text-sm text-[var(--mw-error)]">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Camera scanner dialog */}
      {showCamera && (
        <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Scan Barcode</DialogTitle>
            </DialogHeader>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64 text-sm text-[var(--neutral-500)]">
                  Loading camera…
                </div>
              }
            >
              <BarcodeScanner
                onScan={handleCameraScan}
                active={cameraOpen}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
