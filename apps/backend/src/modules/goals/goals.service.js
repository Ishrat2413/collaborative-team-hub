/**
 * @fileoverview Goals service — CRUD and progress management.
 */

import prisma from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';

/** @typedef {import('@prisma/client').GoalStatus} GoalStatus */

/**
 * Creates a new goal in a workspace.
 * @param {string} workspaceId
 * @param {string} ownerId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createGoal = async (workspaceId, ownerId, data) => {
  return prisma.goal.create({
    data: { workspaceId, ownerId, ...data },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { milestones: true, actionItems: true } },
    },
  });
};

/**
 * Gets all goals for a workspace.
 * @param {string} workspaceId
 * @param {Object} filters - {status, ownerId}
 * @returns {Promise<Object[]>}
 */
export const getGoals = async (workspaceId, filters = {}) => {
  const where = { workspaceId };
  if (filters.status) where.status = filters.status;
  if (filters.ownerId) where.ownerId = filters.ownerId;

  return prisma.goal.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
      _count: { select: { actionItems: true, activityFeed: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Gets a single goal with full details.
 * @param {string} goalId
 * @param {string} workspaceId - Used to verify the goal belongs to the workspace
 * @returns {Promise<Object>}
 */
export const getGoal = async (goalId, workspaceId) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
      activityFeed: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
      actionItems: {
        include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!goal) throw new ApiError(404, 'Goal not found.');
  return goal;
};

/**
 * Updates a goal's fields.
 * @param {string} goalId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const updateGoal = async (goalId, data) => {
  return prisma.goal.update({
    where: { id: goalId },
    data,
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      milestones: true,
    },
  });
};

/**
 * Recalculates a goal's progress percentage based on its milestones.
 * @param {string} goalId
 * @returns {Promise<Object>} Updated goal
 */
export const recalculateProgress = async (goalId) => {
  const milestones = await prisma.milestone.findMany({ where: { goalId } });
  if (milestones.length === 0) return;

  const avg = Math.round(
    milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
  );

  return prisma.goal.update({
    where: { id: goalId },
    data: { progress: avg },
  });
};

/**
 * Posts a progress update to a goal's activity feed.
 * @param {string} goalId
 * @param {string} authorId
 * @param {string} content
 * @returns {Promise<Object>}
 */
export const addActivityUpdate = async (goalId, authorId, content) => {
  return prisma.activityUpdate.create({
    data: { goalId, authorId, content },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  });
};

/**
 * Deletes a goal and all related data (cascades via Prisma schema).
 * @param {string} goalId
 */
export const deleteGoal = async (goalId) => {
  await prisma.goal.delete({ where: { id: goalId } });
};
