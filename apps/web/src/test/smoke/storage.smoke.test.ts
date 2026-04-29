import { describe, expect, it } from 'vitest';
import {
  buildStorageKey,
  readStorageJson,
  readStorageValue,
  removeStorageValue,
  writeStorageJson,
  writeStorageValue,
} from '@/lib/platform/storage';

describe('storage smoke', () => {
  it('writes and reads namespaced json values', () => {
    const key = buildStorageKey('dashboard_layout', 'sell', 'widgets');
    const payload = [{ id: 'w-1', title: 'Widget' }];

    writeStorageJson(key, payload);
    expect(readStorageJson(key, [])).toEqual(payload);

    removeStorageValue(key);
    expect(readStorageJson(key, [])).toEqual([]);
  });

  it('falls back safely for invalid json payloads', () => {
    const key = buildStorageKey('custom', 'invalid-json');
    writeStorageValue(key, '{bad');

    expect(readStorageJson(key, { ok: false })).toEqual({ ok: false });
    expect(readStorageValue(key)).toBeNull();
  });
});
