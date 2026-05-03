/**
 * @fileoverview Action Items Zustand store with optimistic UI.
 * Status changes apply instantly; rollback on error.
 */

import { create } from 'zustand';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';

const useActionItemStore = create((set, get) => ({
  /** @type {Object[]} */
  items: [],
  isLoading: false,

  fetchItems: async (workspaceId, filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ workspaceId, ...filters }).toString();
      const res = await api.get(`/action-items?${params}`);
      set({ items: res.data.data.items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createItem: async (data) => {
    const optimistic = { id: `opt-${Date.now()}`, ...data, _isOptimistic: true };
    const snapshot = get().items;
    set({ items: [optimistic, ...get().items] });

    try {
      const res = await api.post('/action-items', data);
      const real = res.data.data.item;
      set((state) => ({ items: state.items.map((i) => (i.id === optimistic.id ? real : i)) }));
      return { success: true, item: real };
    } catch (error) {
      set({ items: snapshot });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Optimistically updates an action item's status (for Kanban drag-and-drop).
   * @param {string} itemId
   * @param {Object} data
   */
  updateItem: async (itemId, data) => {
    const snapshot = get().items;
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)),
    }));

    try {
      const res = await api.patch(`/action-items/${itemId}`, data);
      const updated = res.data.data.item;
      set((state) => ({ items: state.items.map((i) => (i.id === itemId ? updated : i)) }));
      return { success: true };
    } catch (error) {
      set({ items: snapshot });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  deleteItem: async (itemId) => {
    const snapshot = get().items;
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
    try {
      await api.delete(`/action-items/${itemId}`);
      return { success: true };
    } catch (error) {
      set({ items: snapshot });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Handles real-time Socket.io updates */
  onItemUpdate: (updatedItem) => {
    set((state) => ({
      items: state.items.some((i) => i.id === updatedItem.id)
        ? state.items.map((i) => (i.id === updatedItem.id ? updatedItem : i))
        : [updatedItem, ...state.items],
    }));
  },
}));

export default useActionItemStore;
