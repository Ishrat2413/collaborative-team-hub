/**
 * @fileoverview Helper for creating immutable audit log entries.
 * Called from controllers after any significant workspace action.
 */

import prisma from '../config/db.js';

/**
 * Creates an audit log entry in the database.
 *
 * @param {Object} params
 * @param {string} params.workspaceId
 * @param {string} params.actorId - User who performed the action
 * @param {string} params.action - AUDIT_ACTION constant value
 * @param {string} params.entityType - e.g. 'Goal', 'ActionItem'
 * @param {string} [params.entityId]
 * @param {string} [params.entityTitle]
 * @param {Object} [params.metadata] - Extra context (old/new values, etc.)
 * @returns {Promise<Object>} Created audit log entry
 */
export const createAuditLog = async ({
  workspaceId,
  actorId,
  action,
  entityType,
  entityId,
  entityTitle,
  metadata,
}) => {
  try {
    return await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId,
        action,
        entityType,
        entityId,
        entityTitle,
        metadata,
      },
    });
  } catch (error) {
    // Audit log failure should NEVER break the main operation
    console.error('Audit log creation failed:', error.message);
  }
};
