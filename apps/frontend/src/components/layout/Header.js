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
    <header className='flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800'>
      {/* Left: sidebar toggle + workspace name */}
      <div className='flex items-center gap-3'>
        <button
          onClick={toggleSidebar}
          className='rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
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
        {activeWorkspace && (
          <div className='flex items-center gap-2'>
            <span
              className='h-2 w-2 rounded-full'
              style={{ backgroundColor: activeWorkspace.accentColor }}
            />
            <span className='text-sm font-semibold text-slate-900 dark:text-white hidden sm:block'>
              {activeWorkspace.name}
            </span>
          </div>
        )}
      </div>

      {/* Right: theme, notifications, user */}
      <div className='flex items-center gap-2'>
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <div className='relative'>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className='flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700'>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className='h-7 w-7 rounded-full object-cover'
              />
            ) : (
              <div className='flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white'>
                {getInitials(user?.name)}
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div className='absolute right-0 top-10 z-50 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800 animate-slide-up'>
              <div className='px-3 py-2 border-b border-slate-100 dark:border-slate-700'>
                <p className='text-sm font-medium text-slate-900 dark:text-white truncate'>
                  {user?.name}
                </p>
                <p className='text-xs text-slate-500 truncate'>{user?.email}</p>
              </div>
              <Link
                href='/dashboard/profile'
                className='flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                onClick={() => setUserMenuOpen(false)}>
                Profile settings
              </Link>
              <button
                onClick={handleLogout}
                className='flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
