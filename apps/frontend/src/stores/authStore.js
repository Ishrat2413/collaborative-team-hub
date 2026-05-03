/**
 * @fileoverview Authentication Zustand store.
 *
 * Manages the authenticated user state, login/logout flows, and
 * profile update actions. Persists user data to localStorage for
 * fast initial hydration.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { destroySocket } from '../lib/socket';
import { getErrorMessage } from '../lib/utils';

/**
 * @typedef {Object} AuthState
 * @property {Object|null} user - The authenticated user object
 * @property {boolean} isLoading - Whether an auth operation is in progress
 * @property {boolean} isHydrated - Whether the store has been hydrated from storage
 */

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isHydrated: false,

      /** Marks store as hydrated after client-side mount */
      setHydrated: () => set({ isHydrated: true }),

      /**
       * Registers a new user account.
       * @param {{name: string, email: string, password: string}} data
       */
      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          set({ user: res.data.data.user, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: getErrorMessage(error) };
        }
      },

      /**
       * Logs in an existing user.
       * @param {{email: string, password: string}} credentials
       */
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', credentials);
          set({ user: res.data.data.user, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: getErrorMessage(error) };
        }
      },

      /** Logs out and clears all state. */
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        destroySocket();
        set({ user: null });
      },

      /** Fetches and syncs the current user from the API. */
      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data.user });
        } catch {}
      },

      /**
       * Updates the user in the store (after profile edit or avatar upload).
       * @param {Object} updatedUser
       */
      setUser: (updatedUser) => set({ user: updatedUser }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export default useAuthStore;
