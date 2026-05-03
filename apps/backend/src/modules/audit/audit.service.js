/**
 * @fileoverview Audit log service — Advanced Feature #1.
 * Provides filterable, paginated access to the immutable audit log.
 */

import prisma from '../../config/db.js';

/**
 * Retrieves audit log entries for a workspace with optional filters.
 * @param {string} workspaceId
 * @param {Object} filters
 * @param {string} [filters.action] - Filter by action type
 * @param {string} [filters.actorId] - Filter by actor user ID
 * @param {string} [filters.entityType] - Filter by entity type
 * @param {string} [filters.startDate]
 * @param {string} [filters.endDate]
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=30]
 * @returns {Promise<{logs: Object[], total: number}>}
 */
export const getAuditLogs = async (workspaceId, filters = {}) => {
  const { action, actorId, entityType, startDate, endDate, page = 1, limit = 30 } = filters;
  const skip = (page - 1) * limit;

  const where = { workspaceId };
  if (action) where.action = action;
  if (actorId) where.actorId = actorId;
  if (entityType) where.entityType = entityType;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
};
