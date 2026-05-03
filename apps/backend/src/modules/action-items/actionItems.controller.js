/**
 * @fileoverview Action Items controller.
 */

import { z } from "zod";
import * as actionItemsService from "./actionItems.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { emitToWorkspace } from "../../config/socket.js";
import { AUDIT_ACTION, SOCKET_EVENTS } from "../../lib/shared.js";

const actionItemSchema = z.object({
  workspaceId: z.string().uuid(),
  goalId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

/** POST /api/v1/action-items */
export const createActionItem = asyncHandler(async (req, res) => {
  const data = actionItemSchema.parse(req.body);
  const item = await actionItemsService.createActionItem(data);

  await createAuditLog({
    workspaceId: data.workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.ACTION_ITEM_CREATED,
    entityType: "ActionItem",
    entityId: item.id,
    entityTitle: item.title,
  });

  emitToWorkspace(data.workspaceId, SOCKET_EVENTS.ACTION_ITEM_CREATED, item);
  sendSuccess(res, 201, "Action item created.", { item });
});

/** GET /api/v1/action-items?workspaceId=&status=&goalId=&assigneeId= */
export const getActionItems = asyncHandler(async (req, res) => {
  const { workspaceId, status, goalId, assigneeId, priority } = req.query;
  const items = await actionItemsService.getActionItems(workspaceId, {
    status,
    goalId,
    assigneeId,
    priority,
  });
  sendSuccess(res, 200, "Action items retrieved.", { items });
});

/** GET /api/v1/action-items/:itemId */
export const getActionItem = asyncHandler(async (req, res) => {
  const item = await actionItemsService.getActionItem(req.params.itemId);
  sendSuccess(res, 200, "Action item retrieved.", { item });
});

/** PATCH /api/v1/action-items/:itemId */
export const updateActionItem = asyncHandler(async (req, res) => {
  const data = actionItemSchema
    .partial()
    .omit({ workspaceId: true })
    .parse(req.body);
  const prevItem = await actionItemsService.getActionItem(req.params.itemId);
  const item = await actionItemsService.updateActionItem(
    req.params.itemId,
    data,
  );

  if (data.status && data.status !== prevItem.status) {
    await createAuditLog({
      workspaceId: prevItem.workspaceId,
      actorId: req.user.id,
      action: AUDIT_ACTION.ACTION_ITEM_STATUS_CHANGED,
      entityType: "ActionItem",
      entityId: item.id,
      entityTitle: item.title,
      metadata: { from: prevItem.status, to: data.status },
    });
    emitToWorkspace(
      prevItem.workspaceId,
      SOCKET_EVENTS.ACTION_ITEM_STATUS_CHANGED,
      item,
    );
  } else {
    emitToWorkspace(
      prevItem.workspaceId,
      SOCKET_EVENTS.ACTION_ITEM_UPDATED,
      item,
    );
  }

  sendSuccess(res, 200, "Action item updated.", { item });
});

/** DELETE /api/v1/action-items/:itemId */
export const deleteActionItem = asyncHandler(async (req, res) => {
  const item = await actionItemsService.getActionItem(req.params.itemId);
  await actionItemsService.deleteActionItem(req.params.itemId);
  await createAuditLog({
    workspaceId: item.workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.ACTION_ITEM_DELETED,
    entityType: "ActionItem",
    entityId: item.id,
    entityTitle: item.title,
  });
  sendSuccess(res, 200, "Action item deleted.");
});
