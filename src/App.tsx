/**
 * App.tsx - Main application with React Router
 */

import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return <RouterProvider router={router} />;
}
