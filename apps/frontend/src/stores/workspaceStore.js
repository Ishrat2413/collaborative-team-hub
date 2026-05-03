/**
 * @fileoverview Workspace Zustand store.
 *
 * Manages the list of user workspaces and the currently active workspace.
 * The active workspace ID is persisted to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';

const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      /** @type {Object[]} All workspaces the user belongs to */
      workspaces: [],
      /** @type {Object|null} The currently active workspace */
      activeWorkspace: null,
      isLoading: false,

      /** Fetches all workspaces for the current user. */
      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/workspaces');
          const workspaces = res.data.data.workspaces;
          const current = get().activeWorkspace;

          // Auto-select the first workspace if none is active
          const active = workspaces.find((w) => w.id === current?.id) || workspaces[0] || null;

          set({ workspaces, activeWorkspace: active, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      /**
       * Sets the active workspace and injects its accent colour as a CSS variable.
       * @param {Object} workspace
       */
      setActiveWorkspace: (workspace) => {
        if (workspace?.accentColor && typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--accent-color', workspace.accentColor);
        }
        set({ activeWorkspace: workspace });
      },

      /**
       * Creates a new workspace.
       * @param {{name: string, description?: string, accentColor?: string}} data
       */
      createWorkspace: async (data) => {
        try {
          const res = await api.post('/workspaces', data);
          const workspace = res.data.data.workspace;
          set((state) => ({ workspaces: [...state.workspaces, workspace] }));
          return { success: true, workspace };
        } catch (error) {
          return { success: false, error: getErrorMessage(error) };
        }
      },

      /**
       * Updates a workspace's details.
       * @param {string} workspaceId
       * @param {Object} data
       */
      updateWorkspace: async (workspaceId, data) => {
        try {
          const res = await api.patch(`/workspaces/${workspaceId}`, data);
          const updated = res.data.data.workspace;
          set((state) => ({
            workspaces: state.workspaces.map((w) => (w.id === workspaceId ? updated : w)),
            activeWorkspace: state.activeWorkspace?.id === workspaceId ? updated : state.activeWorkspace,
          }));
          return { success: true };
        } catch (error) {
          return { success: false, error: getErrorMessage(error) };
        }
      },

      /**
       * Invites a member to the active workspace.
       * @param {string} workspaceId
       * @param {string} email
       * @param {string} role
       */
      inviteMember: async (workspaceId, email, role = 'MEMBER') => {
        try {
          await api.post(`/workspaces/${workspaceId}/invite`, { email, role });
          await get().fetchWorkspaceDetails(workspaceId);
          return { success: true };
        } catch (error) {
          return { success: false, error: getErrorMessage(error) };
        }
      },

      /**
       * Re-fetches a single workspace's full details (members, counts).
       * @param {string} workspaceId
       */
      fetchWorkspaceDetails: async (workspaceId) => {
        try {
          const res = await api.get(`/workspaces/${workspaceId}`);
          const workspace = res.data.data.workspace;
          set((state) => ({
            workspaces: state.workspaces.map((w) => (w.id === workspaceId ? { ...w, ...workspace } : w)),
            activeWorkspace:
              state.activeWorkspace?.id === workspaceId
                ? { ...state.activeWorkspace, ...workspace }
                : state.activeWorkspace,
          }));
        } catch {}
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({ activeWorkspace: state.activeWorkspace }),
    }
  )
);

export default useWorkspaceStore;
