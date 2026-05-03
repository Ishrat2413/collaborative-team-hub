/**
 * @fileoverview Dashboard analytics page.
 * Shows stats cards, goal completion chart (Recharts), and CSV export.
 */

'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import api from '../../../lib/api';
import useWorkspaceStore from '../../../stores/workspaceStore';
import { Spinner, EmptyState } from '../../../components/ui/index';
import { formatDate } from '../../../lib/utils';
import toast from 'react-hot-toast';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Export Button ────────────────────────────────────────────────────────────

function ExportButton({ workspaceId }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('goals');

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/export?workspaceId=${workspaceId}&type=${type}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch {
      toast.error('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        className="input-base w-auto text-xs"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="goals">Goals</option>
        <option value="action-items">Action Items</option>
        <option value="members">Members</option>
      </select>
      <button onClick={handleExport} disabled={loading} className="btn-secondary text-xs gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {loading ? 'Exporting...' : 'Export CSV'}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);
    api.get(`/analytics/dashboard?workspaceId=${activeWorkspace.id}`)
      .then((res) => setStats(res.data.data.stats))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [activeWorkspace?.id]);

  if (!activeWorkspace) {
    return (
      <EmptyState
        icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        title="No workspace selected"
        description="Select or create a workspace to see analytics."
      />
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }

  if (!stats) return null;

  const goalStatusData = Object.entries(stats.goalsByStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '), value,
  }));

  const actionStatusData = Object.entries(stats.actionItemsByStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '), value,
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{activeWorkspace.name} · Overview</p>
        </div>
        <ExportButton workspaceId={activeWorkspace.id} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Goals"
          value={stats.totalGoals}
          color="indigo"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <StatCard
          label="Completed This Week"
          value={stats.completedThisWeek}
          sub="Action items marked Done"
          color="emerald"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Overdue Items"
          value={stats.overdueCount}
          sub={stats.overdueCount > 0 ? 'Need attention' : 'All on track!'}
          color={stats.overdueCount > 0 ? 'red' : 'emerald'}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Team Members"
          value={stats.totalMembers}
          color="amber"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Goal Completion Trend */}
        <div className="card col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Goal Completion Trend (8 Weeks)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="var(--accent-color)"
                fill="url(#completedGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Goal Status Breakdown */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Goals by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={goalStatusData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="value" name="Goals" fill="var(--accent-color)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Activity</h2>
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No recent activity yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                {a.author?.avatarUrl ? (
                  <img src={a.author.avatarUrl} className="h-7 w-7 rounded-full object-cover shrink-0" alt="" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {a.author?.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">{a.author?.name}</span>{' '}
                    <span className="text-slate-500">posted an update on</span>{' '}
                    <span className="font-medium">{a.goal?.title}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{a.content}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{formatDate(a.createdAt, 'MMM d')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
