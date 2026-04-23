/**
 * App.tsx - Main application with React Router
 */

import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mw-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
