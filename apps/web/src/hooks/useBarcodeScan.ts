/**
 * useBarcodeScan — Unified hook for barcode scanner input handling.
 *
 * Extracts the common pattern shared by FloorScanJob, ShipScanToShip,
 * and ShipPackaging: controlled input, Enter-key submission, auto-focus,
 * and value normalization. Works with hardware USB/Bluetooth barcode
 * scanners (which act as keyboards) and manual typing alike.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScanSource } from '@/types/common';

export interface UseBarcodeScanOptions {
  /** Called when a scan is completed (Enter key or camera decode). */
  onScan: (value: string, source: ScanSource) => void;
  /** Auto-focus the input on mount. Default: true */
  autoFocus?: boolean;
  /** Normalize scan value (trim + uppercase). Default: true */
  normalize?: boolean;
  /** Minimum characters to accept as a valid scan. Default: 1 */
  minLength?: number;
  /** Whether this hook is currently active. Default: true */
  enabled?: boolean;
}

export interface UseBarcodeScanReturn {
  /** Ref to attach to the <Input> element. */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Current input value (controlled). */
  value: string;
  /** Set the input value (for clearing, prefilling). */
  setValue: (v: string) => void;
  /** Manually trigger a scan with the current value. */
  submit: () => void;
  /** Re-focus the input (after modal close, error dismiss, etc.). */
  refocus: () => void;
  /** Accept a value from an external source (e.g. camera scanner). */
  submitExternal: (val: string, source: ScanSource) => void;
  /** Props to spread onto the <Input> element. */
  inputProps: {
    ref: React.RefObject<HTMLInputElement | null>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    autoFocus: boolean;
    spellCheck: false;
    autoCapitalize: 'characters';
    autoComplete: 'off';
  };
}

export function useBarcodeScan(options: UseBarcodeScanOptions): UseBarcodeScanReturn {
  const {
    onScan,
    autoFocus = true,
    normalize = true,
    minLength = 1,
    enabled = true,
  } = options;

  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  // Auto-focus on mount.
  useEffect(() => {
    if (autoFocus && enabled) {
      inputRef.current?.focus();
    }
  }, [autoFocus, enabled]);

  const doScan = useCallback(
    (raw: string, source: ScanSource) => {
      if (!enabled) return;
      const processed = normalize ? raw.trim().toUpperCase() : raw.trim();
      if (processed.length < minLength) return;
      onScanRef.current(processed, source);
    },
    [enabled, normalize, minLength],
  );

  const submit = useCallback(() => {
    doScan(value, 'keyboard');
  }, [value, doScan]);

  const refocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /** Accept a value from an external source (e.g. camera scanner). */
  const submitExternal = useCallback(
    (val: string, source: ScanSource) => {
      doScan(val, source);
    },
    [doScan],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  return {
    inputRef,
    value,
    setValue,
    submit,
    refocus,
    submitExternal,
    inputProps: {
      ref: inputRef,
      value,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      autoFocus,
      spellCheck: false as const,
      autoCapitalize: 'characters' as const,
      autoComplete: 'off' as const,
    },
  };
}
