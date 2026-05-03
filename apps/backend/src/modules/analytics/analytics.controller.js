/**
 * @fileoverview Analytics controller.
 */

import * as analyticsService from './analytics.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { toCSV, setCsvHeaders } from '../../utils/csvExport.js';

/** GET /api/v1/analytics/dashboard?workspaceId= */
export const getDashboard = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  const stats = await analyticsService.getDashboardStats(workspaceId);
  sendSuccess(res, 200, 'Analytics retrieved.', { stats });
});

/** GET /api/v1/analytics/export?workspaceId=&type=goals|action-items|members */
export const exportCSV = asyncHandler(async (req, res) => {
  const { workspaceId, type = 'goals' } = req.query;
  const data = await analyticsService.getExportData(workspaceId);

  const exportMap = {
    goals: data.goals,
    'action-items': data.actionItems,
    members: data.members,
  };

  const rows = exportMap[type] || data.goals;
  setCsvHeaders(res, `${type}-export-${Date.now()}`);
  res.send(toCSV(rows));
});
