import type { AuthState } from '@mirrorworks/contracts';
import { buildMockAuthState } from '@/lib/contracts/mappers/control-people';

export interface AuthAdapter {
  getAuthState: (activeUserId?: string) => Promise<AuthState>;
  refresh: (activeUserId?: string) => Promise<AuthState>;
  signOut: () => Promise<void>;
}

export const mockAuthAdapter: AuthAdapter = {
  async getAuthState(activeUserId) {
    return buildMockAuthState(activeUserId);
  },
  async refresh(activeUserId) {
    return buildMockAuthState(activeUserId);
  },
  async signOut() {
    return;
  },
};
