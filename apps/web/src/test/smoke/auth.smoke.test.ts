import { describe, expect, it } from 'vitest';
import { mockAuthAdapter } from '@/lib/auth/auth-adapter';

describe('auth smoke', () => {
  it('returns a signed in state with membership and permissions', async () => {
    const state = await mockAuthAdapter.getAuthState();

    expect(state.status).toBe('signed_in');
    expect(state.viewer).toBeTruthy();
    expect(state.activeMembership).toBeTruthy();
    expect(state.effectivePermissions.length).toBeGreaterThan(0);
    expect(state.organizations.length).toBeGreaterThan(0);
  });
});
