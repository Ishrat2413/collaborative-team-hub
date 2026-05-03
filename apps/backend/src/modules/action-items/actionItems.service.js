/**
 * @fileoverview Action Items service — kanban board tasks management.
 */

import prisma from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';

export const createActionItem = async (data) => {
  return prisma.actionItem.create({
    data,
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } },
    },
  });
};

export const getActionItems = async (workspaceId, filters = {}) => {
  const where = { workspaceId };
  if (filters.status) where.status = filters.status;
  if (filters.goalId) where.goalId = filters.goalId;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters.priority) where.priority = filters.priority;

  return prisma.actionItem.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
};

export const getActionItem = async (actionItemId) => {
  const item = await prisma.actionItem.findUnique({
    where: { id: actionItemId },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } },
    },
  });
  if (!item) throw new ApiError(404, 'Action item not found.');
  return item;
};

export const updateActionItem = async (actionItemId, data) => {
  return prisma.actionItem.update({
    where: { id: actionItemId },
    data,
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } },
    },
  });
};

export const deleteActionItem = async (actionItemId) => {
  await prisma.actionItem.delete({ where: { id: actionItemId } });
};
