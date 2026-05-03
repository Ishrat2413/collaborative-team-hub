/**
 * @fileoverview Dashboard layout shell.
 *
 * Wraps all authenticated pages with:
 * - Auth guard (redirects to login if not authenticated)
 * - Sidebar navigation
 * - Top header bar
 * - Socket.io connection management
 * - Theme initialisation
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/authStore';
import useWorkspaceStore from '../../stores/workspaceStore';
import { useNotificationStore, useUIStore } from '../../stores/index';
import useSocket from '../../hooks/useSocket';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const { fetchWorkspaces, activeWorkspace } = useWorkspaceStore();
  const { fetchNotifications } = useNotificationStore();
  const { initTheme } = useUIStore();

  // Initialise Socket.io (must be in a component so hooks work)
  useSocket();

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    fetchWorkspaces();
    fetchNotifications();
  }, [isHydrated, user]);

  // Apply accent color CSS variable when workspace changes
  useEffect(() => {
    if (activeWorkspace?.accentColor) {
      document.documentElement.style.setProperty('--accent-color', activeWorkspace.accentColor);
    }
  }, [activeWorkspace?.accentColor]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          {/* Enhanced UI - Better loading animation */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
