/**
 * @fileoverview Analytics service — dashboard stats and CSV export.
 */

import prisma from '../../config/db.js';

/**
 * Returns aggregated analytics for a workspace dashboard.
 * @param {string} workspaceId
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async (workspaceId) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    totalGoals,
    goalsByStatus,
    completedThisWeek,
    overdueCount,
    totalActionItems,
    actionItemsByStatus,
    totalMembers,
    recentActivity,
  ] = await Promise.all([
    prisma.goal.count({ where: { workspaceId } }),

    prisma.goal.groupBy({
      by: ['status'],
      where: { workspaceId },
      _count: { id: true },
    }),

    prisma.actionItem.count({
      where: {
        workspaceId,
        status: 'DONE',
        updatedAt: { gte: startOfWeek },
      },
    }),

    prisma.actionItem.count({
      where: {
        workspaceId,
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
    }),

    prisma.actionItem.count({ where: { workspaceId } }),

    prisma.actionItem.groupBy({
      by: ['status'],
      where: { workspaceId },
      _count: { id: true },
    }),

    prisma.workspaceMember.count({ where: { workspaceId } }),

    prisma.activityUpdate.findMany({
      where: { goal: { workspaceId } },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        goal: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  // Build goal completion chart data (last 8 weeks)
  const chartData = await buildGoalChartData(workspaceId);

  return {
    totalGoals,
    goalsByStatus: goalsByStatus.reduce((acc, g) => ({ ...acc, [g.status]: g._count.id }), {}),
    completedThisWeek,
    overdueCount,
    totalActionItems,
    actionItemsByStatus: actionItemsByStatus.reduce((acc, a) => ({ ...acc, [a.status]: a._count.id }), {}),
    totalMembers,
    recentActivity,
    chartData,
  };
};

/**
 * Builds weekly goal completion chart data for the past 8 weeks.
 * @param {string} workspaceId
 * @returns {Promise<Array>}
 */
async function buildGoalChartData(workspaceId) {
  const weeks = [];
  const now = new Date();

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const [completed, total] = await Promise.all([
      prisma.goal.count({
        where: {
          workspaceId,
          status: 'COMPLETED',
          updatedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      prisma.goal.count({
        where: {
          workspaceId,
          createdAt: { lt: weekEnd },
        },
      }),
    ]);

    weeks.push({
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return weeks;
}

/**
 * Exports all workspace data as flat arrays for CSV generation.
 * @param {string} workspaceId
 * @returns {Promise<Object>}
 */
export const getExportData = async (workspaceId) => {
  const [goals, actionItems, members] = await Promise.all([
    prisma.goal.findMany({
      where: { workspaceId },
      include: { owner: { select: { name: true, email: true } } },
    }),
    prisma.actionItem.findMany({
      where: { workspaceId },
      include: {
        assignee: { select: { name: true, email: true } },
        goal: { select: { title: true } },
      },
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return {
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      status: g.status,
      progress: g.progress,
      owner: g.owner.name,
      ownerEmail: g.owner.email,
      dueDate: g.dueDate?.toISOString().split('T')[0] || '',
      createdAt: g.createdAt.toISOString().split('T')[0],
    })),
    actionItems: actionItems.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      priority: a.priority,
      assignee: a.assignee?.name || 'Unassigned',
      goal: a.goal?.title || '',
      dueDate: a.dueDate?.toISOString().split('T')[0] || '',
      createdAt: a.createdAt.toISOString().split('T')[0],
    })),
    members: members.map((m) => ({
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.joinedAt.toISOString().split('T')[0],
    })),
  };
};
