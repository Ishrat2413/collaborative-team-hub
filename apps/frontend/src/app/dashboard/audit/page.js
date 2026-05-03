/**
 * @fileoverview Audit Log page — Advanced Feature #1.
 * Filterable, paginated timeline of all workspace changes with CSV export.
 */

"use client";

import { useEffect, useState } from "react";
import useWorkspaceStore from "../../../stores/workspaceStore";
import api from "../../../lib/api";
import { Spinner, EmptyState, Avatar } from "../../../components/ui/index";
import { timeAgo, formatDate } from "../../../lib/utils";
import { AUDIT_ACTION } from "@team-hub/shared";
import toast from "react-hot-toast";

// ─── Action badge colors ──────────────────────────────────────────────────────

const actionColor = (action) => {
  if (action.includes("CREATED"))
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (action.includes("DELETED"))
    return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (action.includes("STATUS"))
    return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (action.includes("PINNED"))
    return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  if (action.includes("INVITED") || action.includes("MEMBER"))
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400";
};

const actionLabel = (action) =>
  action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

// ─── Audit Entry ──────────────────────────────────────────────────────────────

function AuditEntry({ log }) {
  return (
    <div className='flex gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0'>
      {/* Timeline dot */}
      <div className='flex flex-col items-center'>
        <div className='h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700'>
          <Avatar user={log.actor} size='xs' />
        </div>
      </div>

      <div className='flex-1 min-w-0 pt-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-slate-800 dark:text-slate-200'>
            {log.actor?.name}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColor(log.action)}`}>
            {actionLabel(log.action)}
          </span>
          {log.entityTitle && (
            <span className='text-sm text-slate-600 dark:text-slate-400 truncate'>
              &quot;{log.entityTitle}&quot;
            </span>
          )}
        </div>
        {log.metadata && (
          <p className='text-xs text-slate-400 mt-0.5'>
            {Object.entries(log.metadata)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" → ")}
          </p>
        )}
        <p className='text-xs text-slate-400 mt-1'>{timeAgo(log.createdAt)}</p>
      </div>

      <div className='shrink-0 text-xs text-slate-400 pt-1 hidden sm:block'>
        {formatDate(log.createdAt, "MMM d, HH:mm")}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    startDate: "",
    endDate: "",
  });
  const [exporting, setExporting] = useState(false);

  const fetchLogs = async (p = 1) => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        workspaceId: activeWorkspace.id,
        page: p,
        limit: 30,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      const res = await api.get(`/audit?${params}`);
      const { items, pagination } = res.data.data;
      setLogs(p === 1 ? items : [...logs, ...items]);
      setTotal(pagination.total);
      setPage(p);
    } catch {
      toast.error("Failed to load audit log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [activeWorkspace?.id, filters]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get(
        `/audit/export?workspaceId=${activeWorkspace.id}`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audit log exported!");
    } catch {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const entityTypes = [
    "Goal",
    "ActionItem",
    "Announcement",
    "Workspace",
    "User",
    "Milestone",
  ];
  const actionTypes = Object.values(AUDIT_ACTION);

  return (
    <div className='max-w-4xl space-y-5'>
      {/* Header */}
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
            Audit Log
          </h1>
          <p className='text-sm text-slate-500'>{total} events recorded</p>
        </div>
        <button
          className='btn-secondary text-sm gap-1.5'
          onClick={handleExport}
          disabled={exporting}>
          <svg
            className='w-4 h-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
            />
          </svg>
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Filters */}
      <div className='card p-3'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
          <div>
            <label className='block text-xs font-medium text-slate-500 mb-1'>
              Action type
            </label>
            <select
              className='input-base text-xs'
              value={filters.action}
              onChange={(e) =>
                setFilters({ ...filters, action: e.target.value })
              }>
              <option value=''>All actions</option>
              {actionTypes.map((a) => (
                <option key={a} value={a}>
                  {actionLabel(a)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-xs font-medium text-slate-500 mb-1'>
              Entity type
            </label>
            <select
              className='input-base text-xs'
              value={filters.entityType}
              onChange={(e) =>
                setFilters({ ...filters, entityType: e.target.value })
              }>
              <option value=''>All entities</option>
              {entityTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-xs font-medium text-slate-500 mb-1'>
              From date
            </label>
            <input
              type='date'
              className='input-base text-xs'
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className='block text-xs font-medium text-slate-500 mb-1'>
              To date
            </label>
            <input
              type='date'
              className='input-base text-xs'
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
        </div>
        {(filters.action ||
          filters.entityType ||
          filters.startDate ||
          filters.endDate) && (
          <button
            onClick={() =>
              setFilters({
                action: "",
                entityType: "",
                startDate: "",
                endDate: "",
              })
            }
            className='mt-2 text-xs text-indigo-600 hover:underline dark:text-indigo-400'>
            Clear filters
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className='card'>
        {loading && logs.length === 0 ? (
          <div className='flex justify-center py-12'>
            <Spinner size='lg' />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className='w-10 h-10'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            }
            title='No audit entries'
            description='Workspace activity will appear here.'
          />
        ) : (
          <>
            {logs.map((log) => (
              <AuditEntry key={log.id} log={log} />
            ))}
            {logs.length < total && (
              <div className='pt-3 text-center'>
                <button
                  onClick={() => fetchLogs(page + 1)}
                  disabled={loading}
                  className='btn-secondary text-sm'>
                  {loading
                    ? "Loading..."
                    : `Load more (${total - logs.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
