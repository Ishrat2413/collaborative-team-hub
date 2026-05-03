/**
 * @fileoverview Sidebar navigation component.
 *
 * Displays navigation links, workspace switcher, and online member count.
 * Collapses on mobile via the useUIStore sidebarCollapsed flag.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useWorkspaceStore from "../../stores/workspaceStore";
import { useUIStore } from "../../stores/index";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import OnlineUsers from "./OnlineUsers";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard/dashboard",
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        />
      </svg>
    ),
  },
  {
    label: "Goals",
    href: "/dashboard/goals",
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        />
      </svg>
    ),
  },
  {
    label: "Action Items",
    href: "/dashboard/action-items",
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
        />
      </svg>
    ),
  },
  {
    label: "Announcements",
    href: "/dashboard/announcements",
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
        />
      </svg>
    ),
  },
  {
    label: "Workspaces",
    href: "/dashboard/workspaces",
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
        />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
        />
      </svg>
    ),
  },
  {
    label: "Audit Log",
    href: "/dashboard/audit",
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200/60 bg-white/95 backdrop-blur-sm transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-800/95 dark:backdrop-blur-sm",
        sidebarCollapsed ? "w-16" : "w-60",
      )}>
      {/* Enhanced UI - Workspace Switcher section */}
      <div className='border-b border-slate-200/50 p-2 dark:border-slate-700/50'>
        <WorkspaceSwitcher collapsed={sidebarCollapsed} />
      </div>

      {/* Enhanced UI - Navigation with improved spacing and styling */}
      <nav className='flex-1 overflow-y-auto space-y-0.5 px-2.5 py-3'>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "sidebar-link group relative",
              pathname === item.href && "active",
            )}
            title={sidebarCollapsed ? item.label : undefined}>
            {/* Enhanced UI - Active indicator bar */}
            {pathname === item.href && (
              <div className='absolute left-0 top-0 bottom-0 w-1 rounded-r-lg bg-gradient-to-b from-indigo-500 to-indigo-600' />
            )}
            <span className='shrink-0 transition-transform group-hover:scale-110'>
              {item.icon}
            </span>
            {!sidebarCollapsed && (
              <span className='truncate'>{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Enhanced UI - Online Users section with better styling */}
      {!sidebarCollapsed && (
        <div className='border-t border-slate-200/50 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-900/30'>
          <OnlineUsers />
        </div>
      )}
    </aside>
  );
}
