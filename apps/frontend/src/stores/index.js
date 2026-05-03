/**
 * @fileoverview Announcements Zustand store.
 */

import { create } from 'zustand';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  total: 0,
  page: 1,
  isLoading: false,

  fetchAnnouncements: async (workspaceId, page = 1) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/announcements?workspaceId=${workspaceId}&page=${page}&limit=20`);
      const { items, pagination } = res.data.data;
      set((state) => ({
        announcements: page === 1 ? items : [...state.announcements, ...items],
        total: pagination.total,
        page,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  createAnnouncement: async (data) => {
    try {
      const res = await api.post('/announcements', data);
      const announcement = res.data.data.announcement;
      set((state) => ({ announcements: [announcement, ...state.announcements] }));
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Called from Socket.io when a new announcement arrives */
  onNewAnnouncement: (announcement) => {
    set((state) => ({
      announcements: [announcement, ...state.announcements.filter((a) => a.id !== announcement.id)],
    }));
  },

  /** Toggles a reaction optimistically */
  toggleReaction: async (announcementId, emoji, workspaceId, userId) => {
    const snapshot = get().announcements;

    set((state) => ({
      announcements: state.announcements.map((a) => {
        if (a.id !== announcementId) return a;
        const hasReacted = a.reactions?.some((r) => r.emoji === emoji && r.userId === userId);
        return {
          ...a,
          reactions: hasReacted
            ? a.reactions.filter((r) => !(r.emoji === emoji && r.userId === userId))
            : [...(a.reactions || []), { emoji, userId, user: { id: userId } }],
        };
      }),
    }));

    try {
      await api.post(`/announcements/${announcementId}/reactions`, { emoji, workspaceId });
    } catch {
      set({ announcements: snapshot });
    }
  },

  togglePin: async (announcementId, workspaceId) => {
    try {
      await api.patch(`/announcements/${announcementId}/pin`, { workspaceId });
      set((state) => ({
        announcements: state.announcements
          .map((a) => (a.id === announcementId ? { ...a, isPinned: !a.isPinned } : a))
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)),
      }));
    } catch {}
  },
}));

/**
 * @fileoverview Notifications Zustand store.
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications');
      set({
        notifications: res.data.data.items,
        unreadCount: res.data.data.unreadCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAllRead: async () => {
    await api.patch('/notifications/read-all');
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  /** Adds a real-time notification received from Socket.io */
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

/**
 * @fileoverview UI state store (theme, sidebar, modals).
 */
export const useUIStore = create((set) => ({
  /** @type {'light'|'dark'} */
  theme: 'light',
  sidebarCollapsed: false,
  /** @type {Object[]} Online users in the current workspace */
  onlineUsers: [],

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),

  initTheme: () => {
    const saved = localStorage.getItem('theme') || 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved === 'system' ? (prefersDark ? 'dark' : 'light') : saved;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
