/**
 * @fileoverview Top header bar component.
 * Contains sidebar toggle, workspace name, notifications bell, theme toggle, and user menu.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "../../stores/authStore";
import useWorkspaceStore from "../../stores/workspaceStore";
import { useNotificationStore, useUIStore } from "../../stores/index";
import { getInitials } from "../../lib/utils";
import NotificationBell from "../notifications/NotificationBell";
import ThemeToggle from "../ui/ThemeToggle";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { toggleSidebar } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <header className='flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/95 px-6 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/95 dark:backdrop-blur-sm'>
      {/* Enhanced UI - Left section with better spacing */}
      <div className='flex items-center gap-4'>
        {/* Sidebar toggle with improved hover state */}
        <button
          onClick={toggleSidebar}
          className='rounded-lg p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
          aria-label='Toggle sidebar'>
          <svg
            className='w-5 h-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        </button>

        {/* Enhanced UI - Workspace indicator with improved styling */}
        {activeWorkspace && (
          <div className='flex items-center gap-3 px-3'>
            <span
              className='h-2.5 w-2.5 rounded-full shadow-sm'
              style={{ backgroundColor: activeWorkspace.accentColor }}
            />
            <span className='text-sm font-semibold text-slate-900 dark:text-white hidden sm:block'>
              {activeWorkspace.name}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced UI - Right section with improved spacing and alignment */}
      <div className='flex items-center gap-1'>
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell />

        {/* Enhanced UI - User menu with improved styling */}
        <div className='relative ml-2'>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className='flex items-center gap-2 rounded-lg p-1.5 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className='h-8 w-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700'
              />
            ) : (
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white ring-2 ring-indigo-100 dark:ring-indigo-900/50'>
                {getInitials(user?.name)}
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div className='absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200/60 bg-white shadow-lg dark:border-slate-700/60 dark:bg-slate-800 animate-slide-up'>
              {/* Enhanced UI - User profile section with gradient */}
              <div className='border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-700/30 dark:from-slate-700/20 dark:to-slate-700/10'>
                <p className='text-sm font-semibold text-slate-900 dark:text-white truncate'>
                  {user?.name}
                </p>
                <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>
                  {user?.email}
                </p>
              </div>

              {/* Enhanced UI - Menu items with better hover states */}
              <Link
                href='/dashboard/profile'
                className='flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                onClick={() => setUserMenuOpen(false)}>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className='flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
