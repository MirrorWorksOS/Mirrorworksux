/**
 * BarcodeScanner — Camera-based barcode scanning component.
 *
 * Wraps html5-qrcode's Html5Qrcode class for camera access and barcode
 * decoding. Lazy-loaded via React.lazy in ScanInput — the library only
 * loads when the user actually opens the camera dialog.
 *
 * Styling is fully controlled by us (we use the low-level Html5Qrcode
 * class, not the Html5QrcodeScanner which ships its own UI).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';

export interface BarcodeScannerProps {
  /** Called when a barcode is decoded from camera. */
  onScan: (value: string) => void;
  /** Called on scanner error. */
  onError?: (error: string) => void;
  /** Whether the scanner is active. Default: true */
  active?: boolean;
  /** Supported formats. Default: common 1D + 2D formats. */
  formats?: Html5QrcodeSupportedFormats[];
  /** Camera facing mode. Default: 'environment' (rear camera) */
  facingMode?: 'environment' | 'user';
  /** Additional className for the scanner viewport. */
  className?: string;
}

const DEFAULT_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
  Html5QrcodeSupportedFormats.CODE_39,
];

type ScannerState = 'initializing' | 'scanning' | 'error' | 'stopped';

export function BarcodeScanner({
  onScan,
  onError,
  active = true,
  formats = DEFAULT_FORMATS,
  facingMode = 'environment',
  className,
}: BarcodeScannerProps) {
  const [state, setState] = useState<ScannerState>('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const elementId = useRef(`barcode-scanner-${Date.now()}`);

  const stopScanner = useCallback(async () => {
    try {
      const scanner = scannerRef.current;
      if (scanner?.isScanning) {
        await scanner.stop();
      }
    } catch {
      // Ignore stop errors.
    }
  }, []);

  const startScanner = useCallback(async () => {
    setState('initializing');
    setErrorMessage('');

    try {
      // Ensure any previous instance is stopped.
      await stopScanner();

      const scanner = new Html5Qrcode(elementId.current, {
        formatsToSupport: formats,
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Haptic feedback on supported devices.
          if (navigator.vibrate) navigator.vibrate(100);
          onScanRef.current(decodedText);
        },
        () => {
          // Scan error (no barcode found in frame) — expected, ignore.
        },
      );

      setState('scanning');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to start camera';
      setState('error');
      setErrorMessage(msg);
      onError?.(msg);
    }
  }, [facingMode, formats, onError, stopScanner]);

  // Start/stop scanner based on active prop.
  useEffect(() => {
    if (active) {
      startScanner();
    } else {
      stopScanner();
      setState('stopped');
    }

    return () => {
      stopScanner();
    };
  }, [active, startScanner, stopScanner]);

  return (
    <div className={cn('relative', className)}>
      {/* Scanner viewport */}
      <div
        id={elementId.current}
        ref={containerRef}
        className="w-full rounded-[var(--shape-lg)] overflow-hidden bg-black min-h-[280px]"
      />

      {/* Targeting crosshair overlay */}
      {state === 'scanning' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[250px] h-[250px] border-2 border-white/40 rounded-lg">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-[var(--mw-yellow-400)] rounded-tl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-[var(--mw-yellow-400)] rounded-tr" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-[var(--mw-yellow-400)] rounded-bl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-[var(--mw-yellow-400)] rounded-br" />
          </div>
        </div>
      )}

      {/* Initializing state */}
      {state === 'initializing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-[var(--shape-lg)]">
          <Camera className="w-10 h-10 text-white/60 animate-pulse mb-3" />
          <p className="text-sm text-white/80">Starting camera…</p>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--neutral-50)] rounded-[var(--shape-lg)] p-6">
          <XCircle className="w-10 h-10 text-[var(--mw-error)]" />
          <p className="text-sm text-[var(--neutral-600)] text-center max-w-xs">
            {errorMessage || 'Camera access denied or unavailable.'}
          </p>
          <Button variant="outline" size="sm" onClick={startScanner}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Status bar */}
      {state === 'scanning' && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[var(--neutral-500)]">
          <span className="flex h-2 w-2 rounded-full bg-[var(--mw-success)] animate-pulse" />
          Point camera at a barcode
        </div>
      )}
    </div>
  );
}
