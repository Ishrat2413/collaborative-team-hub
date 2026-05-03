/**
 * @fileoverview Goals Zustand store.
 *
 * Advanced Feature #2 — Optimistic UI:
 * State updates are applied immediately before the server responds.
 * On error, the previous state is restored via snapshot rollback.
 */

import { create } from 'zustand';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';

const useGoalStore = create((set, get) => ({
  /** @type {Object[]} */
  goals: [],
  /** @type {Object|null} */
  selectedGoal: null,
  isLoading: false,

  fetchGoals: async (workspaceId, filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ workspaceId, ...filters }).toString();
      const res = await api.get(`/goals?${params}`);
      set({ goals: res.data.data.goals, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchGoal: async (goalId, workspaceId) => {
    try {
      const res = await api.get(`/goals/${goalId}?workspaceId=${workspaceId}`);
      set({ selectedGoal: res.data.data.goal });
    } catch {}
  },

  /**
   * Creates a goal with optimistic UI — adds to list immediately, rolls back on error.
   * @param {Object} data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  createGoal: async (data) => {
    const optimisticGoal = {
      id: `optimistic-${Date.now()}`,
      ...data,
      progress: 0,
      status: 'NOT_STARTED',
      createdAt: new Date().toISOString(),
      _isOptimistic: true,
    };

    // 1. Optimistically add to state
    const snapshot = get().goals;
    set({ goals: [optimisticGoal, ...get().goals] });

    try {
      const res = await api.post('/goals', data);
      const realGoal = res.data.data.goal;

      // 2. Replace optimistic entry with real server response
      set((state) => ({
        goals: state.goals.map((g) => (g.id === optimisticGoal.id ? realGoal : g)),
      }));
      return { success: true, goal: realGoal };
    } catch (error) {
      // 3. Rollback on failure
      set({ goals: snapshot });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Updates a goal with optimistic UI.
   * @param {string} goalId
   * @param {Object} data
   */
  updateGoal: async (goalId, data) => {
    const snapshot = get().goals;

    // Optimistically update
    set((state) => ({
      goals: state.goals.map((g) => (g.id === goalId ? { ...g, ...data } : g)),
      selectedGoal: state.selectedGoal?.id === goalId ? { ...state.selectedGoal, ...data } : state.selectedGoal,
    }));

    try {
      const res = await api.patch(`/goals/${goalId}`, data);
      const updated = res.data.data.goal;
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? updated : g)),
        selectedGoal: state.selectedGoal?.id === goalId ? updated : state.selectedGoal,
      }));
      return { success: true };
    } catch (error) {
      set({ goals: snapshot });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  deleteGoal: async (goalId, workspaceId) => {
    const snapshot = get().goals;
    set((state) => ({ goals: state.goals.filter((g) => g.id !== goalId) }));

    try {
      await api.delete(`/goals/${goalId}?workspaceId=${workspaceId}`);
      return { success: true };
    } catch (error) {
      set({ goals: snapshot });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Appends a real-time goal update received from Socket.io. */
  onGoalUpdate: (updatedGoal) => {
    set((state) => ({
      goals: state.goals.some((g) => g.id === updatedGoal.id)
        ? state.goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
        : [updatedGoal, ...state.goals],
    }));
  },

  /** Appends an activity update to the selected goal's feed. */
  onActivityUpdate: (update) => {
    set((state) => ({
      selectedGoal: state.selectedGoal
        ? { ...state.selectedGoal, activityFeed: [update, ...(state.selectedGoal.activityFeed || [])] }
        : state.selectedGoal,
    }));
  },
}));

export default useGoalStore;
