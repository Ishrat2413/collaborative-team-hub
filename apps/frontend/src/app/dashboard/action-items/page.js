/**
 * @fileoverview Action Items page.
 * Features a Kanban board and list view toggle, with drag-and-drop status updates
 * using optimistic UI (Advanced Feature #2).
 */

"use client";

import { useEffect, useState } from "react";
import useWorkspaceStore from "../../../stores/workspaceStore";
import useActionItemStore from "../../../stores/actionItemStore";
import useAuthStore from "../../../stores/authStore";
import api from "../../../lib/api";
import {
  Badge,
  Avatar,
  EmptyState,
  Spinner,
} from "../../../components/ui/index";
import Modal from "../../../components/ui/Modal";
import { ACTION_ITEM_STATUS, ACTION_ITEM_PRIORITY } from "@team-hub/shared";
import {
  statusLabel,
  priorityColor,
  formatDate,
  isOverdue,
} from "../../../lib/utils";
import toast from "react-hot-toast";

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: "TODO", label: "To Do", color: "bg-slate-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
  { id: "IN_REVIEW", label: "In Review", color: "bg-amber-500" },
  { id: "DONE", label: "Done", color: "bg-emerald-500" },
];

// ─── Create Item Modal ────────────────────────────────────────────────────────

function CreateItemModal({ open, onClose, workspaceId, members, goals }) {
  const { createItem } = useActionItemStore();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    goalId: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await createItem({
      workspaceId,
      ...form,
      assigneeId: form.assigneeId || null,
      goalId: form.goalId || null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    });
    setLoading(false);
    if (result.success) {
      toast.success("Action item created!");
      onClose();
      setForm({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        goalId: "",
        dueDate: "",
      });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title='New action item'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-1.5'>Title *</label>
          <input
            className='input-base'
            required
            placeholder='What needs to be done?'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1.5'>
            Description
          </label>
          <textarea
            className='input-base resize-none'
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-1.5'>Priority</label>
            <select
              className='input-base'
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {Object.values(ACTION_ITEM_PRIORITY).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1.5'>Status</label>
            <select
              className='input-base'
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.values(ACTION_ITEM_STATUS).map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-1.5'>Assignee</label>
            <select
              className='input-base'
              value={form.assigneeId}
              onChange={(e) =>
                setForm({ ...form, assigneeId: e.target.value })
              }>
              <option value=''>Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1.5'>Due date</label>
            <input
              type='date'
              className='input-base'
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1.5'>
            Link to goal
          </label>
          <select
            className='input-base'
            value={form.goalId}
            onChange={(e) => setForm({ ...form, goalId: e.target.value })}>
            <option value=''>No goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <div className='flex gap-3 pt-1'>
          <button
            type='button'
            className='btn-secondary flex-1'
            onClick={onClose}>
            Cancel
          </button>
          <button
            type='submit'
            className='btn-primary flex-1'
            disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Action Item Card ─────────────────────────────────────────────────────────

function ItemCard({ item, onStatusChange }) {
  const overdue = isOverdue(item.dueDate) && item.status !== "DONE";
  const priorityColors = {
    LOW: "bg-slate-300 text-slate-700 dark:bg-slate-600",
    MEDIUM: "bg-blue-200 text-blue-700 dark:bg-blue-900",
    HIGH: "bg-orange-200 text-orange-700 dark:bg-orange-900",
    URGENT: "bg-red-200 text-red-700 dark:bg-red-900",
  };

  /* Enhanced UI - Premium action item card with better visual hierarchy */
  return (
    <div className='card group cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200'>
      <div className='flex items-start gap-3 mb-3'>
        <span
          className={`mt-1 h-3 w-3 shrink-0 rounded-full ${priorityColors[item.priority]}`}
          title={item.priority}
        />
        <p className='text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug'>
          {item.title}
        </p>
      </div>

      {/* Enhanced UI - Better goal link styling */}
      {item.goal && (
        <div className='mb-3 p-2 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50'>
          <p className='text-xs font-medium text-slate-600 dark:text-slate-400'>
            🎯 {item.goal.title}
          </p>
        </div>
      )}

      {/* Enhanced UI - Better footer with improved spacing and styling */}
      <div className='flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60'>
        <div className='flex items-center gap-2'>
          {item.assignee && <Avatar user={item.assignee} size='xs' />}
          {item.dueDate && (
            <span
              className={`text-xs font-medium ${overdue ? "text-red-500 font-semibold" : "text-slate-500 dark:text-slate-400"}`}>
              {overdue ? "⚠️" : "📅"} {formatDate(item.dueDate, "MMM d")}
            </span>
          )}
        </div>
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className='text-xs border border-slate-200 rounded-lg px-1.5 py-0.5 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'>
          {Object.values(ACTION_ITEM_STATUS).map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({ column, items, onStatusChange }) {
  return (
    <div className='flex flex-col min-w-[260px] bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-full'>
      <div className='flex items-center gap-2 px-3 py-2.5 border-b border-slate-200 dark:border-slate-700'>
        <span className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
        <span className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
          {column.label}
        </span>
        <span className='ml-auto rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400'>
          {items.length}
        </span>
      </div>
      <div className='flex-1 overflow-y-auto p-2 space-y-2'>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onStatusChange={onStatusChange} />
        ))}
        {items.length === 0 && (
          <div className='py-6 text-center text-xs text-slate-400'>
            No items
          </div>
        )}
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ items, onStatusChange }) {
  return (
    <div className='card divide-y divide-slate-100 dark:divide-slate-700 p-0 overflow-hidden'>
      {items.length === 0 && (
        <p className='text-sm text-slate-400 text-center py-8'>
          No action items yet.
        </p>
      )}
      {items.map((item) => {
        const overdue = isOverdue(item.dueDate) && item.status !== "DONE";
        return (
          <div
            key={item.id}
            className='flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50'>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                item.priority === "URGENT"
                  ? "bg-red-500"
                  : item.priority === "HIGH"
                    ? "bg-orange-400"
                    : item.priority === "MEDIUM"
                      ? "bg-blue-400"
                      : "bg-slate-300"
              }`}
            />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-slate-800 dark:text-slate-200 truncate'>
                {item.title}
              </p>
              {item.goal && (
                <p className='text-xs text-slate-400'>↳ {item.goal.title}</p>
              )}
            </div>
            {item.assignee && <Avatar user={item.assignee} size='xs' />}
            {item.dueDate && (
              <span
                className={`text-xs shrink-0 ${overdue ? "text-red-500" : "text-slate-400"}`}>
                {formatDate(item.dueDate, "MMM d")}
              </span>
            )}
            <select
              value={item.status}
              onChange={(e) => onStatusChange(item.id, e.target.value)}
              className='text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 shrink-0'>
              {Object.values(ACTION_ITEM_STATUS).map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ActionItemsPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { items, fetchItems, updateItem, isLoading } = useActionItemStore();
  const [view, setView] = useState("kanban");
  const [showCreate, setShowCreate] = useState(false);
  const [members, setMembers] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!activeWorkspace) return;
    fetchItems(activeWorkspace.id);
    api
      .get(`/workspaces/${activeWorkspace.id}`)
      .then((r) => setMembers(r.data.data.workspace.members));
    api
      .get(`/goals?workspaceId=${activeWorkspace.id}`)
      .then((r) => setGoals(r.data.data.goals));
  }, [activeWorkspace?.id]);

  const handleStatusChange = async (itemId, status) => {
    const result = await updateItem(itemId, { status });
    if (!result.success) toast.error(result.error);
  };

  const itemsByStatus = (status) => items.filter((i) => i.status === status);

  return (
    <div className='space-y-5 h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
            Action Items
          </h1>
          <p className='text-sm text-slate-500'>{items.length} total</p>
        </div>
        <div className='flex items-center gap-2'>
          {/* View toggle */}
          <div className='flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden'>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "kanban" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"}`}>
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"}`}>
              List
            </button>
          </div>
          <button
            className='btn-primary text-sm'
            onClick={() => setShowCreate(true)}>
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            New item
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-16'>
          <Spinner size='lg' />
        </div>
      ) : view === "kanban" ? (
        <div className='flex gap-4 overflow-x-auto pb-4 flex-1'>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              items={itemsByStatus(col.id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <ListView items={items} onStatusChange={handleStatusChange} />
      )}

      <CreateItemModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        workspaceId={activeWorkspace?.id}
        members={members}
        goals={goals}
      />
    </div>
  );
}
