/**
 * @fileoverview Shared frontend utility functions.
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isPast } from 'date-fns';

/**
 * Merges Tailwind CSS classes intelligently (handles conflicts).
 * @param {...(string|undefined|null|false)} inputs
 * @returns {string}
 */
export const cn = (...inputs) => twMerge(clsx(inputs));

/**
 * Returns a human-readable relative time string.
 * @param {string|Date} date
 * @returns {string} e.g. "3 hours ago"
 */
export const timeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Formats a date as a readable string.
 * @param {string|Date} date
 * @param {string} [fmt='MMM d, yyyy']
 * @returns {string}
 */
export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '—';
  return format(new Date(date), fmt);
};

/**
 * Returns true if a date is in the past.
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isOverdue = (date) => {
  if (!date) return false;
  return isPast(new Date(date));
};

/**
 * Returns user initials from a full name.
 * @param {string} name
 * @returns {string} e.g. "Alex Rivera" → "AR"
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncates a string to a maximum length with ellipsis.
 * @param {string} str
 * @param {number} [maxLen=100]
 * @returns {string}
 */
export const truncate = (str, maxLen = 100) => {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
};

/**
 * Maps a GoalStatus to a Tailwind color class.
 * @param {string} status
 * @returns {string}
 */
export const goalStatusColor = (status) => {
  const map = {
    NOT_STARTED: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
    IN_PROGRESS: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    COMPLETED: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
    AT_RISK: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    CANCELLED: 'text-red-500 bg-red-50 dark:bg-red-900/30',
  };
  return map[status] || map.NOT_STARTED;
};

/**
 * Maps an ActionItemPriority to a Tailwind color class.
 * @param {string} priority
 * @returns {string}
 */
export const priorityColor = (priority) => {
  const map = {
    LOW: 'text-slate-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
  };
  return map[priority] || map.MEDIUM;
};

/**
 * Maps an ActionItemStatus to a display label.
 * @param {string} status
 * @returns {string}
 */
export const statusLabel = (status) => {
  const map = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
    NOT_STARTED: 'Not Started',
    COMPLETED: 'Completed',
    AT_RISK: 'At Risk',
    CANCELLED: 'Cancelled',
  };
  return map[status] || status;
};

/**
 * Extracts the error message from an Axios error response.
 * @param {Error} error
 * @param {string} [fallback='Something went wrong']
 * @returns {string}
 */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  return error?.response?.data?.message || error?.message || fallback;
};
