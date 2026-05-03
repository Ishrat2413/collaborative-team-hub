/**
 * @fileoverview Notification bell icon with unread count badge and dropdown.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotificationStore } from '../../stores/index';
import { timeAgo } from '../../lib/utils';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => { markAllRead(); }}
                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No notifications yet</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-2 dark:border-slate-700">
            <Link
              href="/dashboard/notifications"
              className="block w-full rounded-lg py-2 text-center text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
