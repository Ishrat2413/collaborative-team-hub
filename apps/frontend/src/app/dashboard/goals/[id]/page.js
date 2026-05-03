/**
 * @fileoverview Goal detail page.
 * Shows milestones, activity feed, and linked action items.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import useWorkspaceStore from "../../../../stores/workspaceStore";
import useGoalStore from "../../../../stores/goalStore";
import useAuthStore from "../../../../stores/authStore";
import api from "../../../../lib/api";
import {
  Badge,
  ProgressBar,
  Spinner,
  Avatar,
} from "../../../../components/ui/index";
import {
  goalStatusColor,
  statusLabel,
  formatDate,
  timeAgo,
  isOverdue,
} from "../../../../lib/utils";
import { GOAL_STATUS } from "../../../../constants/index.js";
import toast from "react-hot-toast";

// ─── Milestone Item ───────────────────────────────────────────────────────────

function MilestoneItem({ milestone, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [progress, setProgress] = useState(milestone.progress);

  const handleProgressChange = async (val) => {
    setProgress(val);
    await onUpdate(milestone.id, { progress: val, completed: val === 100 });
  };

  return (
    <div className='flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0'>
      <input
        type='checkbox'
        checked={milestone.completed}
        onChange={(e) =>
          onUpdate(milestone.id, {
            completed: e.target.checked,
            progress: e.target.checked ? 100 : 0,
          })
        }
        className='h-4 w-4 rounded accent-[var(--accent-color)]'
      />
      <div className='flex-1 min-w-0'>
        <p
          className={`text-sm ${milestone.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
          {milestone.title}
        </p>
        <div className='mt-1 flex items-center gap-2'>
          <input
            type='range'
            min='0'
            max='100'
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            onMouseUp={() => handleProgressChange(progress)}
            onTouchEnd={() => handleProgressChange(progress)}
            className='flex-1 h-1.5 accent-[var(--accent-color)]'
          />
          <span className='text-xs font-mono text-slate-500 w-8 text-right'>
            {progress}%
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(milestone.id)}
        className='p-1 text-slate-300 hover:text-red-400 transition-colors'>
        <svg
          className='w-3.5 h-3.5'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GoalDetailPage() {
  const { id } = useParams();
  const { activeWorkspace } = useWorkspaceStore();
  const { fetchGoal, selectedGoal, updateGoal, onActivityUpdate } =
    useGoalStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activityText, setActivityText] = useState("");
  const [postingActivity, setPostingActivity] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);

  useEffect(() => {
    if (!activeWorkspace || !id) return;
    setLoading(true);
    fetchGoal(id, activeWorkspace.id).finally(() => setLoading(false));
  }, [id, activeWorkspace?.id]);

  const handleStatusChange = async (status) => {
    const result = await updateGoal(id, { status });
    if (!result.success) toast.error(result.error);
    else toast.success("Status updated!");
  };

  const handlePostActivity = async (e) => {
    e.preventDefault();
    if (!activityText.trim()) return;
    setPostingActivity(true);
    try {
      await api.post(`/goals/${id}/activity`, {
        content: activityText,
        workspaceId: activeWorkspace.id,
      });
      setActivityText("");
      // Re-fetch to get updated feed
      await fetchGoal(id, activeWorkspace.id);
    } catch {
      toast.error("Failed to post update.");
    } finally {
      setPostingActivity(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.trim()) return;
    setAddingMilestone(true);
    try {
      await api.post("/milestones", {
        goalId: id,
        workspaceId: activeWorkspace.id,
        title: newMilestone,
      });
      setNewMilestone("");
      await fetchGoal(id, activeWorkspace.id);
    } catch {
      toast.error("Failed to add milestone.");
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleUpdateMilestone = async (milestoneId, data) => {
    try {
      await api.patch(`/milestones/${milestoneId}`, data);
      await fetchGoal(id, activeWorkspace.id);
    } catch {
      toast.error("Failed to update milestone.");
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await api.delete(`/milestones/${milestoneId}`);
      await fetchGoal(id, activeWorkspace.id);
    } catch {
      toast.error("Failed to delete milestone.");
    }
  };

  if (loading)
    return (
      <div className='flex justify-center py-20'>
        <Spinner size='lg' />
      </div>
    );
  if (!selectedGoal)
    return <p className='text-slate-500 py-10 text-center'>Goal not found.</p>;

  const goal = selectedGoal;

  return (
    <div className='max-w-5xl space-y-6'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-xs text-slate-400'>
        <Link
          href='/dashboard/goals'
          className='hover:text-slate-600 dark:hover:text-slate-300'>
          Goals
        </Link>
        <span>/</span>
        <span className='text-slate-600 dark:text-slate-300 truncate max-w-xs'>
          {goal.title}
        </span>
      </div>

      {/* Goal Header */}
      <div className='card'>
        <div className='flex items-start justify-between gap-4 flex-wrap'>
          <div className='flex-1 min-w-0'>
            <h1 className='text-xl font-bold text-slate-900 dark:text-white'>
              {goal.title}
            </h1>
            {goal.description && (
              <p className='text-sm text-slate-500 mt-1 leading-relaxed'>
                {goal.description}
              </p>
            )}
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <select
              value={goal.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className='input-base w-auto text-sm'>
              {Object.values(GOAL_STATUS).map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='mt-4'>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='text-xs font-medium text-slate-500'>
              Overall Progress
            </span>
            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              {goal.progress}%
            </span>
          </div>
          <ProgressBar value={goal.progress} />
        </div>

        <div className='flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500'>
          <div className='flex items-center gap-1.5'>
            <Avatar user={goal.owner} size='xs' />
            <span>{goal.owner?.name}</span>
          </div>
          {goal.dueDate && (
            <div
              className={`flex items-center gap-1 ${isOverdue(goal.dueDate) && goal.status !== "COMPLETED" ? "text-red-500" : ""}`}>
              <svg
                className='w-3.5 h-3.5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Due {formatDate(goal.dueDate)}
            </div>
          )}
          <div>{goal._count?.actionItems || 0} action items</div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Milestones */}
        <div className='card'>
          <h2 className='text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3'>
            Milestones ({goal.milestones?.length || 0})
          </h2>

          {goal.milestones?.length > 0 ? (
            <div className='mb-3'>
              {goal.milestones.map((m) => (
                <MilestoneItem
                  key={m.id}
                  milestone={m}
                  onUpdate={handleUpdateMilestone}
                  onDelete={handleDeleteMilestone}
                />
              ))}
            </div>
          ) : (
            <p className='text-sm text-slate-400 mb-3'>No milestones yet.</p>
          )}

          <form onSubmit={handleAddMilestone} className='flex gap-2'>
            <input
              className='input-base text-sm'
              placeholder='Add a milestone...'
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
            />
            <button
              type='submit'
              disabled={addingMilestone}
              className='btn-primary shrink-0 px-3'>
              {addingMilestone ? "..." : "+"}
            </button>
          </form>
        </div>

        {/* Activity Feed */}
        <div className='card'>
          <h2 className='text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3'>
            Activity Feed
          </h2>

          <form onSubmit={handlePostActivity} className='flex gap-2 mb-4'>
            <input
              className='input-base text-sm flex-1'
              placeholder='Post a progress update...'
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
            />
            <button
              type='submit'
              disabled={postingActivity || !activityText.trim()}
              className='btn-primary shrink-0 px-3 text-sm'>
              Post
            </button>
          </form>

          <div className='space-y-3 max-h-64 overflow-y-auto pr-1'>
            {(goal.activityFeed || []).length === 0 ? (
              <p className='text-sm text-slate-400 text-center py-4'>
                No activity yet. Post the first update!
              </p>
            ) : (
              (goal.activityFeed || []).map((a) => (
                <div key={a.id} className='flex gap-2.5'>
                  <Avatar user={a.author} size='xs' />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-xs font-semibold text-slate-800 dark:text-slate-200'>
                        {a.author?.name}
                      </span>
                      <span className='text-xs text-slate-400'>
                        {timeAgo(a.createdAt)}
                      </span>
                    </div>
                    <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed'>
                      {a.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Linked Action Items */}
      {goal.actionItems?.length > 0 && (
        <div className='card'>
          <h2 className='text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3'>
            Linked Action Items ({goal.actionItems.length})
          </h2>
          <div className='divide-y divide-slate-100 dark:divide-slate-700'>
            {goal.actionItems.map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between py-2.5'>
                <div className='flex items-center gap-2 min-w-0'>
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      item.status === "DONE"
                        ? "bg-emerald-400"
                        : item.status === "IN_PROGRESS"
                          ? "bg-blue-400"
                          : item.status === "IN_REVIEW"
                            ? "bg-amber-400"
                            : "bg-slate-300"
                    }`}
                  />
                  <span className='text-sm text-slate-700 dark:text-slate-300 truncate'>
                    {item.title}
                  </span>
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  {item.assignee && <Avatar user={item.assignee} size='xs' />}
                  <Badge
                    variant={item.status === "DONE" ? "success" : "default"}>
                    {statusLabel(item.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
