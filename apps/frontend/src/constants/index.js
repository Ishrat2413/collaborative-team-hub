/**
 * @fileoverview Frontend-specific constants.
 * Re-exports shared constants and adds frontend-only values.
 */

export * from '@team-hub/shared';

/** @type {string} Local storage key for theme preference */
export const THEME_STORAGE_KEY = 'team-hub-theme';

/** @type {number} Sidebar collapsed width in px */
export const SIDEBAR_COLLAPSED_WIDTH = 64;

/** @type {number} Sidebar expanded width in px */
export const SIDEBAR_EXPANDED_WIDTH = 240;

/** @type {string[]} Kanban column order */
export const KANBAN_COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

/** Priority display metadata */
export const PRIORITY_META = {
  LOW:    { label: 'Low',    color: 'text-slate-500', dot: 'bg-slate-300' },
  MEDIUM: { label: 'Medium', color: 'text-blue-500',  dot: 'bg-blue-400'  },
  HIGH:   { label: 'High',   color: 'text-orange-500',dot: 'bg-orange-400' },
  URGENT: { label: 'Urgent', color: 'text-red-500',   dot: 'bg-red-500'   },
};

/** Goal status display metadata */
export const GOAL_STATUS_META = {
  NOT_STARTED: { label: 'Not Started', variant: 'default' },
  IN_PROGRESS:  { label: 'In Progress', variant: 'info'    },
  COMPLETED:    { label: 'Completed',   variant: 'success' },
  AT_RISK:      { label: 'At Risk',     variant: 'warning' },
  CANCELLED:    { label: 'Cancelled',   variant: 'danger'  },
};
