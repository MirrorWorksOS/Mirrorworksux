/**
 * Auto-bump label helper used by every MirrorView upload surface. Covers
 * the SMB-shop default ("Rev A → B → C"), edge-cases ("Rev Z → AA"),
 * mixed-case input ("rev a"), and noisy history (unrelated strings ignored).
 */
import { describe, expect, it } from 'vitest';
import { nextRevisionLabel } from '@/services/mirrorViewerUpload';

describe('nextRevisionLabel', () => {
  it('returns Rev A when history is empty', () => {
    expect(nextRevisionLabel([])).toBe('Rev A');
    expect(nextRevisionLabel([undefined, undefined])).toBe('Rev A');
  });

  it('bumps a single letter', () => {
    expect(nextRevisionLabel(['Rev A'])).toBe('Rev B');
    expect(nextRevisionLabel(['Rev A', 'Rev B'])).toBe('Rev C');
    expect(nextRevisionLabel(['Rev C'])).toBe('Rev D');
  });

  it('uses the highest label regardless of order', () => {
    expect(nextRevisionLabel(['Rev C', 'Rev A', 'Rev B'])).toBe('Rev D');
  });

  it('rolls Rev Z to Rev AA', () => {
    expect(nextRevisionLabel(['Rev Z'])).toBe('Rev AA');
  });

  it('handles AZ → BA', () => {
    expect(nextRevisionLabel(['Rev AZ'])).toBe('Rev BA');
  });

  it('is case-insensitive on input but emits canonical "Rev X"', () => {
    expect(nextRevisionLabel(['rev a', 'REV B'])).toBe('Rev C');
  });

  it('ignores noisy non-Rev strings in history', () => {
    expect(nextRevisionLabel(['Drawing X', 'BKT-001', undefined, 'Rev A'])).toBe(
      'Rev B',
    );
  });
});
