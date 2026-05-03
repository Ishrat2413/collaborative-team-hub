/**
 * @fileoverview Goals controller.
 */

import { z } from "zod";
import * as goalsService from "./goals.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { emitToWorkspace } from "../../config/socket.js";
import { AUDIT_ACTION, SOCKET_EVENTS } from "../../lib/shared.js";

const goalSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "AT_RISK", "CANCELLED"])
    .optional(),
  dueDate: z.string().datetime().optional().nullable(),
  ownerId: z.string().uuid().optional(),
});

/** POST /api/v1/goals */
export const createGoal = asyncHandler(async (req, res) => {
  const { workspaceId, ...data } = goalSchema.parse(req.body);
  const goal = await goalsService.createGoal(workspaceId, req.user.id, data);

  await createAuditLog({
    workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.GOAL_CREATED,
    entityType: "Goal",
    entityId: goal.id,
    entityTitle: goal.title,
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.GOAL_CREATED, goal);
  sendSuccess(res, 201, "Goal created.", { goal });
});

/** GET /api/v1/goals?workspaceId=&status=&ownerId= */
export const getGoals = asyncHandler(async (req, res) => {
  const { workspaceId, status, ownerId } = req.query;
  const goals = await goalsService.getGoals(workspaceId, { status, ownerId });
  sendSuccess(res, 200, "Goals retrieved.", { goals });
});

/** GET /api/v1/goals/:goalId?workspaceId= */
export const getGoal = asyncHandler(async (req, res) => {
  const goal = await goalsService.getGoal(
    req.params.goalId,
    req.query.workspaceId,
  );
  sendSuccess(res, 200, "Goal retrieved.", { goal });
});

/** PATCH /api/v1/goals/:goalId */
export const updateGoal = asyncHandler(async (req, res) => {
  const data = goalSchema.partial().omit({ workspaceId: true }).parse(req.body);
  const prevGoal = await goalsService.getGoal(
    req.params.goalId,
    req.body.workspaceId || req.query.workspaceId,
  );
  const goal = await goalsService.updateGoal(req.params.goalId, data);

  // Audit status changes specifically
  if (data.status && data.status !== prevGoal.status) {
    await createAuditLog({
      workspaceId: prevGoal.workspaceId,
      actorId: req.user.id,
      action: AUDIT_ACTION.GOAL_STATUS_CHANGED,
      entityType: "Goal",
      entityId: goal.id,
      entityTitle: goal.title,
      metadata: { from: prevGoal.status, to: data.status },
    });
    emitToWorkspace(
      prevGoal.workspaceId,
      SOCKET_EVENTS.GOAL_STATUS_CHANGED,
      goal,
    );
  } else {
    emitToWorkspace(prevGoal.workspaceId, SOCKET_EVENTS.GOAL_UPDATED, goal);
  }

  sendSuccess(res, 200, "Goal updated.", { goal });
});

/** POST /api/v1/goals/:goalId/activity */
export const addActivity = asyncHandler(async (req, res) => {
  const { content } = z
    .object({ content: z.string().min(1).max(5000) })
    .parse(req.body);
  const update = await goalsService.addActivityUpdate(
    req.params.goalId,
    req.user.id,
    content,
  );
  emitToWorkspace(req.body.workspaceId, SOCKET_EVENTS.ACTIVITY_UPDATE, update);
  sendSuccess(res, 201, "Activity update posted.", { update });
});

/** DELETE /api/v1/goals/:goalId */
export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await goalsService.getGoal(
    req.params.goalId,
    req.query.workspaceId,
  );
  await goalsService.deleteGoal(req.params.goalId);
  await createAuditLog({
    workspaceId: goal.workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.GOAL_DELETED,
    entityType: "Goal",
    entityId: goal.id,
    entityTitle: goal.title,
  });
  sendSuccess(res, 200, "Goal deleted.");
});
