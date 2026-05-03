/**
 * @fileoverview Workspaces controller.
 */

import { z } from "zod";
import * as workspacesService from "./workspaces.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { AUDIT_ACTION } from "../../lib/shared.js";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

/** POST /api/v1/workspaces */
export const createWorkspace = asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const workspace = await workspacesService.createWorkspace(req.user.id, data);

  await createAuditLog({
    workspaceId: workspace.id,
    actorId: req.user.id,
    action: AUDIT_ACTION.WORKSPACE_CREATED,
    entityType: "Workspace",
    entityId: workspace.id,
    entityTitle: workspace.name,
  });

  sendSuccess(res, 201, "Workspace created.", { workspace });
});

/** GET /api/v1/workspaces */
export const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspacesService.getUserWorkspaces(req.user.id);
  sendSuccess(res, 200, "Workspaces retrieved.", { workspaces });
});

/** GET /api/v1/workspaces/:workspaceId */
export const getWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspacesService.getWorkspace(
    req.params.workspaceId,
    req.user.id,
  );
  sendSuccess(res, 200, "Workspace retrieved.", { workspace });
});

/** PATCH /api/v1/workspaces/:workspaceId */
export const updateWorkspace = asyncHandler(async (req, res) => {
  const data = createSchema.partial().parse(req.body);
  const workspace = await workspacesService.updateWorkspace(
    req.params.workspaceId,
    data,
  );

  await createAuditLog({
    workspaceId: workspace.id,
    actorId: req.user.id,
    action: AUDIT_ACTION.WORKSPACE_UPDATED,
    entityType: "Workspace",
    entityId: workspace.id,
    entityTitle: workspace.name,
    metadata: data,
  });

  sendSuccess(res, 200, "Workspace updated.", { workspace });
});

/** POST /api/v1/workspaces/:workspaceId/invite */
export const inviteMember = asyncHandler(async (req, res) => {
  const { email, role } = inviteSchema.parse(req.body);
  const membership = await workspacesService.inviteMember(
    req.params.workspaceId,
    email,
    role,
  );

  await createAuditLog({
    workspaceId: req.params.workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.MEMBER_INVITED,
    entityType: "User",
    entityId: membership.user.id,
    entityTitle: membership.user.email,
  });

  sendSuccess(res, 201, "Member invited.", { member: membership });
});

/** PATCH /api/v1/workspaces/:workspaceId/members/:userId/role */
export const changeMemberRole = asyncHandler(async (req, res) => {
  const { role } = z
    .object({ role: z.enum(["ADMIN", "MEMBER"]) })
    .parse(req.body);
  const membership = await workspacesService.changeMemberRole(
    req.params.workspaceId,
    req.params.userId,
    role,
  );

  await createAuditLog({
    workspaceId: req.params.workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.MEMBER_ROLE_CHANGED,
    entityType: "User",
    entityId: req.params.userId,
    metadata: { role },
  });

  sendSuccess(res, 200, "Member role updated.", { membership });
});

/** DELETE /api/v1/workspaces/:workspaceId/members/:userId */
export const removeMember = asyncHandler(async (req, res) => {
  await workspacesService.removeMember(
    req.params.workspaceId,
    req.params.userId,
  );

  await createAuditLog({
    workspaceId: req.params.workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.MEMBER_REMOVED,
    entityType: "User",
    entityId: req.params.userId,
  });

  sendSuccess(res, 200, "Member removed.");
});
