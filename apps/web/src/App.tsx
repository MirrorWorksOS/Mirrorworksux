/**
 * App.tsx - Main application with React Router
 */

import { RouterProvider } from 'react-router';
import { ConvexProvider } from 'convex/react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { convexClient } from '@/lib/convex-client';
import { router } from './routes';

export default function App() {
  // ConvexProvider always mounts so `useQuery` calls don't throw when no
  // VITE_CONVEX_URL is configured (e.g. fresh Netlify deploy). The
  // placeholder URL is never contacted because all useQuery callers gate
  // on VITE_DATA_SOURCE === 'remote'.
  return (
    <ConvexProvider client={convexClient}>
      <ThemeProvider defaultTheme="system" storageKey="mw-ui-theme">
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}
