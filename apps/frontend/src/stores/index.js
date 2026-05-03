/**
 * @fileoverview Announcements Zustand store.
 */

import { create } from "zustand";
import api from "../lib/api";
import { getErrorMessage } from "../lib/utils";

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  total: 0,
  page: 1,
  isLoading: false,

  fetchAnnouncements: async (workspaceId, page = 1) => {
    set({ isLoading: true });
    try {
      const res = await api.get(
        `/announcements?workspaceId=${workspaceId}&page=${page}&limit=20`,
      );
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
      const res = await api.post("/announcements", data);
      const announcement = res.data.data.announcement;
      set((state) => ({
        announcements: [announcement, ...state.announcements],
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Called from Socket.io when a new announcement arrives */
  onNewAnnouncement: (announcement) => {
    set((state) => ({
      announcements: [
        announcement,
        ...state.announcements.filter((a) => a.id !== announcement.id),
      ],
    }));
  },

  /** Toggles a reaction optimistically */
  toggleReaction: async (announcementId, emoji, workspaceId, userId) => {
    const snapshot = get().announcements;

    set((state) => ({
      announcements: state.announcements.map((a) => {
        if (a.id !== announcementId) return a;
        const hasReacted = a.reactions?.some(
          (r) => r.emoji === emoji && r.userId === userId,
        );
        return {
          ...a,
          reactions: hasReacted
            ? a.reactions.filter(
                (r) => !(r.emoji === emoji && r.userId === userId),
              )
            : [...(a.reactions || []), { emoji, userId, user: { id: userId } }],
        };
      }),
    }));

    try {
      await api.post(`/announcements/${announcementId}/reactions`, {
        emoji,
        workspaceId,
      });
    } catch {
      set({ announcements: snapshot });
    }
  },

  togglePin: async (announcementId, workspaceId) => {
    try {
      await api.patch(`/announcements/${announcementId}/pin`, { workspaceId });
      set((state) => ({
        announcements: state.announcements
          .map((a) =>
            a.id === announcementId ? { ...a, isPinned: !a.isPinned } : a,
          )
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
      const res = await api.get("/notifications");
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
    await api.patch("/notifications/read-all");
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
 *
 * Theme management:
 * - Supports 'light' and 'dark' modes
 * - Persists preference to localStorage
 * - Applies 'dark' class to html element for Tailwind dark mode
 */
export const useUIStore = create((set) => ({
  /** @type {'light'|'dark'} */
  theme: "light",
  sidebarCollapsed: false,
  /** @type {Object[]} Online users in the current workspace */
  onlineUsers: [],

  /**
   * Toggle between light and dark theme
   * Persists preference to localStorage
   */
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";

      // Apply to DOM
      document.documentElement.classList.toggle("dark", next === "dark");

      // Persist to localStorage
      localStorage.setItem("theme", next);

      return { theme: next };
    }),

  /**
   * Set theme to a specific value
   * @param {'light'|'dark'} mode
   */
  setTheme: (mode) =>
    set(() => {
      // Apply to DOM
      document.documentElement.classList.toggle("dark", mode === "dark");

      // Persist to localStorage
      localStorage.setItem("theme", mode);

      return { theme: mode };
    }),

  /**
   * Initialize theme on app load
   * Respects saved preference, then defaults to 'light'
   */
  initTheme: () => {
    // Check localStorage first
    const saved = localStorage.getItem("theme");

    if (saved && ["light", "dark"].includes(saved)) {
      // Use saved preference
      document.documentElement.classList.toggle("dark", saved === "dark");
      set({ theme: saved });
    } else {
      // Default to light
      document.documentElement.classList.toggle("dark", false);
      set({ theme: "light" });
      localStorage.setItem("theme", "light");
    }
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
