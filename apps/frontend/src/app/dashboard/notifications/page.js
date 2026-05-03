/**
 * @fileoverview Notifications page — full list of in-app notifications.
 */

'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '../../../stores/index';
import { Spinner, EmptyState, Avatar } from '../../../components/ui/index';
import { timeAgo } from '../../../lib/utils';
import { NOTIFICATION_TYPE } from '@team-hub/shared';
import api from '../../../lib/api';

const typeIcon = (type) => {
  const icons = {
    MENTION: '💬',
    WORKSPACE_INVITE: '🏢',
    GOAL_UPDATE: '🎯',
    ACTION_ITEM_ASSIGNED: '✅',
    ANNOUNCEMENT: '📢',
  };
  return icons[type] || '🔔';
};

export default function NotificationsPage() {
  const { notifications, isLoading, fetchNotifications, markAllRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500">{notifications.length} total</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button className="btn-secondary text-sm" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
          title="You're all caught up!"
          description="Notifications from @mentions, invites, and updates will appear here."
        />
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700 p-0 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3.5 ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
            >
              <div className="text-xl shrink-0 mt-0.5">{typeIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
