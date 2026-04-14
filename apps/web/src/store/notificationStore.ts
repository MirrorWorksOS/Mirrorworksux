/**
 * Notification Store — Zustand state management for the notification system.
 *
 * Persists notifications to localStorage (key: mw-notifications).
 * Provides actions for marking read, dismissing, adding, and filtering.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createZustandStorage } from '@/lib/platform/storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'system';
export type NotificationModule = 'sell' | 'buy' | 'plan' | 'make' | 'ship' | 'book' | 'control' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  module: NotificationModule;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  lastReadTimestamp: number;
  /** Flag that briefly goes true when a new notification arrives, for bell animation */
  hasNewArrival: boolean;

  // Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  dismissNotification: (id: string) => void;
  dismissMultiple: (ids: string[]) => void;
  markMultipleAsRead: (ids: string[]) => void;
  clearNewArrival: () => void;

  // Computed helpers (as functions to avoid stale closures)
  getUnreadCount: () => number;
  getLatest: (count: number) => AppNotification[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      lastReadTimestamp: 0,
      hasNewArrival: false,

      markAsRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          lastReadTimestamp: Date.now(),
        }));
      },

      addNotification: (partial) => {
        const notification: AppNotification = {
          ...partial,
          id: generateId(),
          timestamp: Date.now(),
          isRead: false,
        };
        set((s) => ({
          notifications: [notification, ...s.notifications],
          hasNewArrival: true,
        }));
      },

      dismissNotification: (id) => {
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        }));
      },

      dismissMultiple: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          notifications: s.notifications.filter((n) => !idSet.has(n.id)),
        }));
      },

      markMultipleAsRead: (ids) => {
        const idSet = new Set(ids);
        set((s) => ({
          notifications: s.notifications.map((n) =>
            idSet.has(n.id) ? { ...n, isRead: true } : n
          ),
        }));
      },

      clearNewArrival: () => {
        set({ hasNewArrival: false });
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      getLatest: (count) => {
        return get().notifications.slice(0, count);
      },
    }),
    {
      name: 'mw-notifications',
      storage: createJSONStorage(() => createZustandStorage('local')),
      // Only persist notifications and lastReadTimestamp, not ephemeral flags
      partialize: (state) => ({
        notifications: state.notifications,
        lastReadTimestamp: state.lastReadTimestamp,
      }),
    }
  )
);
