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
    <Modal open={open} onClose={onClose} title="New goal" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input className="input-base" required placeholder="e.g. Launch v2.0"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea className="input-base resize-none" rows={3}
            placeholder="What does success look like?"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select className="input-base" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.values(GOAL_STATUS).map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Due date</label>
            <input type="date" className="input-base" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Owner</label>
          <select className="input-base" value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }) {
  const overdue = isOverdue(goal.dueDate) && goal.status !== 'COMPLETED';
  return (
    <Link href={`/dashboard/goals/${goal.id}`} className="card block hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{goal.description}</p>
          )}
        </div>
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

      <ProgressBar value={goal.progress} showLabel />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {goal.owner?.avatarUrl ? (
            <img src={goal.owner.avatarUrl} className="h-5 w-5 rounded-full object-cover" alt="" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-indigo-400 flex items-center justify-center text-xs text-white font-bold">
              {goal.owner?.name?.[0]}
            </div>
          )}
          <span className="text-xs text-slate-500">{goal.owner?.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {goal._count?.milestones > 0 && (
            <span>{goal._count.milestones} milestones</span>
          )}
          {goal.dueDate && (
            <span className={overdue ? 'text-red-500 font-medium' : ''}>
              {overdue ? '⚠ ' : ''}Due {formatDate(goal.dueDate, 'MMM d')}
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
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Goals</h1>
          <p className="text-sm text-slate-500">{goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New goal
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'
            }`}
          >
            {s ? statusLabel(s) : 'All'}
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
