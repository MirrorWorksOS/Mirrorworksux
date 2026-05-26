import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@convex': path.resolve(__dirname, './convex'),
      '@mirrorworks/contracts': path.resolve(__dirname, '../../packages/contracts/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.ts'],
    globals: true,
  },
  define: {
    'import.meta.env.DEV': true,
    // Vitest must use the mock service registry — remote adapters depend on
    // a live Convex/Bridge backend that the test runner can't talk to.
    // Without this override, .env.local's VITE_DATA_SOURCE=remote (set for
    // local dev against the demo Convex) bleeds into the smoke tests.
    'import.meta.env.VITE_DATA_SOURCE': JSON.stringify('mock'),
    'import.meta.env.VITE_CONVEX_URL': JSON.stringify(''),
  },
});
