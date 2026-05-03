/**
 * @fileoverview Goals page — lists all goals for the active workspace
 * with status filtering, creation modal, and progress display.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useWorkspaceStore from '../../../stores/workspaceStore';
import useGoalStore from '../../../stores/goalStore';
import useAuthStore from '../../../stores/authStore';
import { Spinner, Badge, ProgressBar, EmptyState } from '../../../components/ui/index';
import Modal from '../../../components/ui/Modal';
import { goalStatusColor, statusLabel, formatDate, isOverdue, timeAgo } from '../../../lib/utils';
import { GOAL_STATUS } from '@team-hub/shared';
import toast from 'react-hot-toast';

// ─── Create Goal Modal ────────────────────────────────────────────────────────

function CreateGoalModal({ open, onClose, workspaceId, members }) {
  const { createGoal } = useGoalStore();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: '', description: '', status: 'NOT_STARTED', dueDate: '', ownerId: user?.id,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await createGoal({
      workspaceId,
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    });
    setLoading(false);
    if (result.success) {
      toast.success('Goal created!');
      onClose();
      setForm({ title: '', description: '', status: 'NOT_STARTED', dueDate: '', ownerId: user?.id });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Goal" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Enhanced UI - Better form layout */}
        <div className="form-group">
          <label className="form-label">Goal Title *</label>
          <input 
            className="input-base" 
            required 
            placeholder="e.g. Launch product v2.0" 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            className="input-base resize-none" 
            rows={3}
            placeholder="What does success look like? Add any relevant context..." 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
          />
          <p className="form-hint">Optional. Provide context for your team.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="input-base" 
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {Object.values(GOAL_STATUS).map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input 
              type="date" 
              className="input-base" 
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Owner</label>
          <select 
            className="input-base" 
            value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          >
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
            ))}
          </select>
        </div>

        {/* Enhanced UI - Better button layout */}
        <div className="flex gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }) {
  const overdue = isOverdue(goal.dueDate) && goal.status !== 'COMPLETED';
  /* Enhanced UI - Premium goal card with better visual hierarchy and hover effects */
  return (
    <Link href={`/dashboard/goals/${goal.id}`} className="card-elevated block transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{goal.description}</p>
          )}
        </div>
        {/* Enhanced UI - Better badge styling */}
        <Badge
          variant={
            goal.status === 'COMPLETED' ? 'success' :
            goal.status === 'AT_RISK' ? 'warning' :
            goal.status === 'CANCELLED' ? 'danger' :
            goal.status === 'IN_PROGRESS' ? 'info' : 'default'
          }
        >
          {statusLabel(goal.status)}
        </Badge>
      </div>

      {/* Enhanced UI - Better progress bar styling */}
      <div className="mb-4">
        <ProgressBar value={goal.progress} showLabel />
      </div>

      {/* Enhanced UI - Better footer with improved spacing */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          {goal.owner?.avatarUrl ? (
            <img src={goal.owner.avatarUrl} className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" alt="" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-xs text-white font-bold">
              {goal.owner?.name?.[0]}
            </div>
          )}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{goal.owner?.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {goal._count?.milestones > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {goal._count.milestones}
            </span>
          )}
          {goal.dueDate && (
            <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-semibold' : ''}`}>
              {overdue ? '⚠️' : '📅'}
              {formatDate(goal.dueDate, 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { goals, fetchGoals, isLoading } = useGoalStore();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!activeWorkspace) return;
    fetchGoals(activeWorkspace.id, statusFilter ? { status: statusFilter } : {});
    // Fetch members for owner selector
    import('../../../lib/api').then(({ default: api }) => {
      api.get(`/workspaces/${activeWorkspace.id}`).then((r) => setMembers(r.data.data.workspace.members));
    });
  }, [activeWorkspace?.id, statusFilter]);

  const statusFilters = ['', ...Object.values(GOAL_STATUS)];

  return (
    <div className="space-y-7 max-w-6xl">
      {/* Enhanced UI - Better header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Goals</h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-1">{goals.length} goal{goals.length !== 1 ? 's' : ''} in this workspace</p>
        </div>
        {/* Enhanced UI - Better create button */}
        <button className="btn-primary gap-2 w-full sm:w-auto justify-center sm:justify-start" onClick={() => setShowCreate(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Goal
        </button>
      </div>

      {/* Enhanced UI - Better filter pills styling */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              statusFilter === s
                ? 'bg-indigo-600 text-white shadow-md hover:shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {s ? statusLabel(s) : 'All Goals'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          title="No goals yet"
          description="Set your first team goal to start tracking progress."
          action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create first goal</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <CreateGoalModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        workspaceId={activeWorkspace?.id}
        members={members}
      />
    </div>
  );
}
