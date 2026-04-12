/**
 * barcode-utils — Symbology helpers, validation, and format detection.
 */

import type { BarcodeSymbology } from '@/types/common';

/** Maps our symbology names to bwip-js encoder IDs. */
export const SYMBOLOGY_TO_BCID: Record<BarcodeSymbology, string> = {
  code128: 'code128',
  ean13: 'ean13',
  qrcode: 'qrcode',
  datamatrix: 'datamatrix',
  code39: 'code39',
};

/** Whether the symbology is 2D (QR, DataMatrix) vs 1D. */
export function is2D(symbology: BarcodeSymbology): boolean {
  return symbology === 'qrcode' || symbology === 'datamatrix';
}

/**
 * Compute EAN-13 check digit for a 12-digit string.
 * Returns the full 13-digit code, or null if input is invalid.
 */
export function ean13WithCheckDigit(digits12: string): string | null {
  if (!/^\d{12}$/.test(digits12)) return null;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits12[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return digits12 + check;
}

/** Validate that a string is a valid EAN-13 (13 digits, correct check). */
export function isValidEan13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  const recomputed = ean13WithCheckDigit(code.slice(0, 12));
  return recomputed === code;
}

/**
 * Auto-detect the most likely symbology from a barcode value.
 * Used when no explicit symbology is specified.
 */
export function detectSymbology(value: string): BarcodeSymbology {
  // 13 digits → EAN-13
  if (/^\d{13}$/.test(value)) return 'ean13';
  // 12 digits (could be EAN-13 without check digit) → EAN-13
  if (/^\d{12}$/.test(value)) return 'ean13';
  // URLs or long strings → QR
  if (value.startsWith('http') || value.length > 40) return 'qrcode';
  // Default for internal IDs (WO-xxxx, MO-xxxx, SKUs)
  return 'code128';
}

/** Human-readable label for a symbology. */
export const SYMBOLOGY_LABELS: Record<BarcodeSymbology, string> = {
  code128: 'Code 128',
  ean13: 'EAN-13',
  qrcode: 'QR Code',
  datamatrix: 'Data Matrix',
  code39: 'Code 39',
};
