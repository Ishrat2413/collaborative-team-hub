/**
 * @fileoverview Reusable UI primitive components.
 */

import { cn, getInitials } from '../../lib/utils';

// ─── Badge ────────────────────────────────────────────────────────────────────

/**
 * @param {{children: React.ReactNode, variant?: string, className?: string}} props
 */
export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <span className={cn('badge', variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

/**
 * @param {{user: Object, size?: 'xs'|'sm'|'md'|'lg'}} props
 */
export function Avatar({ user, size = 'sm' }) {
  const sizes = { xs: 'h-6 w-6 text-xs', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  if (!user) return null;
  return user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt={user.name}
      className={cn('rounded-full object-cover shrink-0', sizes[size])}
    />
  ) : (
    <div className={cn('flex items-center justify-center rounded-full bg-indigo-500 font-bold text-white shrink-0', sizes[size])}>
      {getInitials(user.name)}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

/** @param {{size?: 'sm'|'md'|'lg', className?: string}} props */
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <div className={cn('animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400', sizes[size], className)} />
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

/**
 * @param {{value: number, max?: number, color?: string, showLabel?: boolean}} props
 */
export function ProgressBar({ value = 0, max = 100, color, showLabel = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color || 'var(--accent-color)' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-right">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

/**
 * @param {{icon: React.ReactNode, title: string, description?: string, action?: React.ReactNode}} props
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-slate-300 dark:text-slate-600">{icon}</div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
