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
  const tree = (
    <ThemeProvider defaultTheme="system" storageKey="mw-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
  return convexClient ? (
    <ConvexProvider client={convexClient}>{tree}</ConvexProvider>
  ) : (
    tree
  );
}
