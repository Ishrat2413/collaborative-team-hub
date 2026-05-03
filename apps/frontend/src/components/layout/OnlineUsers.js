/**
 * @fileoverview OnlineUsers — shows which workspace members are currently online.
 * Data comes from Socket.io presence events via useUIStore.
 */

'use client';

import { useUIStore } from '../../stores/index';
import { getInitials } from '../../lib/utils';

export default function OnlineUsers() {
  const { onlineUsers } = useUIStore();

  if (onlineUsers.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
        Online · {onlineUsers.length}
      </p>
      <div className="space-y-1.5">
        {onlineUsers.slice(0, 5).map((u) => (
          <div key={u.userId} className="flex items-center gap-2">
            <div className="relative">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                  {getInitials(u.name)}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-400 dark:border-slate-800" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{u.name}</span>
          </div>
        ))}
        {onlineUsers.length > 5 && (
          <p className="text-xs text-slate-400">+{onlineUsers.length - 5} more</p>
        )}
      </div>
    </div>
  );
}
