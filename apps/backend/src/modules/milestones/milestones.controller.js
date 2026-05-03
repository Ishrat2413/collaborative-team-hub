/**
 * @fileoverview Milestones controller.
 */

import { z } from 'zod';
import * as milestonesService from './milestones.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { createAuditLog } from '../../utils/auditLog.js';
import { AUDIT_ACTION } from '@team-hub/shared';

const milestoneSchema = z.object({
  title: z.string().min(1).max(200),
  progress: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

/** POST /api/v1/milestones */
export const createMilestone = asyncHandler(async (req, res) => {
  const { goalId, workspaceId, ...data } = z
    .object({ goalId: z.string().uuid(), workspaceId: z.string().uuid() })
    .merge(milestoneSchema)
    .parse(req.body);

  const milestone = await milestonesService.createMilestone(goalId, data);

  await createAuditLog({
    workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.MILESTONE_CREATED,
    entityType: 'Milestone',
    entityId: milestone.id,
    entityTitle: milestone.title,
  });

  sendSuccess(res, 201, 'Milestone created.', { milestone });
});

/** PATCH /api/v1/milestones/:milestoneId */
export const updateMilestone = asyncHandler(async (req, res) => {
  const data = milestoneSchema.partial().parse(req.body);
  const milestone = await milestonesService.updateMilestone(req.params.milestoneId, data);
  sendSuccess(res, 200, 'Milestone updated.', { milestone });
});

/** DELETE /api/v1/milestones/:milestoneId */
export const deleteMilestone = asyncHandler(async (req, res) => {
  await milestonesService.deleteMilestone(req.params.milestoneId);
  sendSuccess(res, 200, 'Milestone deleted.');
});
