/**
 * @fileoverview Audit log controller.
 */

import * as auditService from './audit.service.js';
import { sendPaginated } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { toCSV, setCsvHeaders } from '../../utils/csvExport.js';

/** GET /api/v1/audit?workspaceId=&action=&actorId=&entityType=&startDate=&endDate=&page= */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { workspaceId, action, actorId, entityType, startDate, endDate, page = '1', limit = '30' } = req.query;

  const { logs, total } = await auditService.getAuditLogs(workspaceId, {
    action, actorId, entityType, startDate, endDate,
    page: parseInt(page), limit: parseInt(limit),
  });

  sendPaginated(res, 'Audit logs retrieved.', logs, {
    page: parseInt(page), limit: parseInt(limit), total,
  });
});

/** GET /api/v1/audit/export?workspaceId= */
export const exportAuditCSV = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  const { logs } = await auditService.getAuditLogs(workspaceId, { limit: 1000 });

  const rows = logs.map((l) => ({
    date: l.createdAt.toISOString(),
    actor: l.actor.name,
    action: l.action,
    entityType: l.entityType,
    entityTitle: l.entityTitle || '',
    metadata: l.metadata ? JSON.stringify(l.metadata) : '',
  }));

  setCsvHeaders(res, `audit-log-${workspaceId}`);
  res.send(toCSV(rows));
});
