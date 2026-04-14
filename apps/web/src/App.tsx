/**
 * App.tsx - Main application with React Router
 */

import React from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mw-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
