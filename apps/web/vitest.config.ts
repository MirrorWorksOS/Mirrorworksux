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
  },
});
