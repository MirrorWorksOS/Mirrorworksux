/**
 * BarcodeDisplay — Renders a barcode to a <canvas> via bwip-js.
 *
 * Supports all symbologies defined in BarcodeSymbology (Code 128, EAN-13,
 * QR Code, Data Matrix, Code 39). Renders at 2x scale for Retina displays.
 *
 * Usage:
 *   <BarcodeDisplay value="WO-2026-0002" />
 *   <BarcodeDisplay value="4006381333931" symbology="ean13" />
 *   <BarcodeDisplay value="https://mirrorworks.io/mo/123" symbology="qrcode" />
 */

import { useEffect, useRef } from 'react';
// Use the explicit /browser subpath — TypeScript's bundler resolution
// doesn't handle the "browser" condition in bwip-js's root exports.
import * as bwipjs from 'bwip-js/browser';
import { cn } from '@/components/ui/utils';
import { SYMBOLOGY_TO_BCID, is2D, detectSymbology, ean13WithCheckDigit } from './barcode-utils';
import type { BarcodeSymbology } from '@/types/common';

export interface BarcodeDisplayProps {
  /** The data to encode. */
  value: string;
  /** Symbology to use. Auto-detected if omitted. */
  symbology?: BarcodeSymbology;
  /** Width in mm (bwip-js units). Default: varies by type */
  width?: number;
  /** Height in mm (bwip-js units). Default: varies by type */
  height?: number;
  /** Show human-readable text below the barcode. Default: true for 1D */
  showText?: boolean;
  /** Scale factor for rendering. Default: 2 (retina) */
  scale?: number;
  /** Additional className for the wrapper. */
  className?: string;
}

export function BarcodeDisplay({
  value,
  symbology,
  width,
  height,
  showText,
  scale = 2,
  className,
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resolvedSymbology = symbology ?? detectSymbology(value);
  const bcid = SYMBOLOGY_TO_BCID[resolvedSymbology];
  const twoD = is2D(resolvedSymbology);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    // For EAN-13, auto-compute check digit if only 12 digits provided.
    let text = value;
    if (resolvedSymbology === 'ean13' && /^\d{12}$/.test(value)) {
      text = ean13WithCheckDigit(value) ?? value;
    }

    try {
      const opts: Parameters<typeof bwipjs.toCanvas>[1] = {
        bcid,
        text,
        scale,
        includetext: showText ?? !twoD,
        textxalign: 'center',
      };
      if (width != null) opts.width = width;
      if (height != null) opts.height = height;
      else if (!twoD) opts.height = 10;
      if (!twoD) opts.textyoffset = 1;

      bwipjs.toCanvas(canvas, opts);
    } catch {
      // Render error state on canvas.
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 200;
        canvas.height = 40;
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 200, 40);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Invalid barcode', 100, 24);
      }
    }
  }, [value, bcid, scale, showText, twoD, width, height, resolvedSymbology]);

  if (!value) return null;

  return (
    <div className={cn('inline-flex', className)}>
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
      />
    </div>
  );
}
