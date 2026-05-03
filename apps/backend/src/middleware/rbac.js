/**
 * @fileoverview Role-Based Access Control (RBAC) middleware.
 * Advanced Feature #4 — Permission matrix for workspace operations.
 *
 * Verifies the authenticated user has the required role within a workspace.
 * The workspaceId must be available as req.params.workspaceId or req.body.workspaceId.
 */

import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { WORKSPACE_ROLES } from "../lib/shared.js";

/**
 * Factory function that returns middleware requiring a specific workspace role.
 *
 * @param {string[]} allowedRoles - Array of roles permitted (e.g. ['ADMIN'])
 * @returns {import('express').RequestHandler}
 *
 * @example
 * // Only workspace admins can post announcements
 * router.post('/', protect, requireWorkspaceRole([WORKSPACE_ROLES.ADMIN]), createAnnouncement);
 */
export const requireWorkspaceRole = (allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    const workspaceId =
      req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      throw new ApiError(400, "workspaceId is required for this operation.");
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ApiError(403, "You are not a member of this workspace.");
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new ApiError(
        403,
        `This action requires one of the following roles: ${allowedRoles.join(", ")}.`,
      );
    }

    // Attach membership info for downstream use
    req.membership = membership;
    next();
  });

/**
 * Middleware that verifies the user is a member of the workspace (any role).
 * @type {import('express').RequestHandler}
 */
export const requireWorkspaceMember = requireWorkspaceRole([
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.MEMBER,
]);

/**
 * Middleware that verifies the user is a workspace admin.
 * @type {import('express').RequestHandler}
 */
export const requireWorkspaceAdmin = requireWorkspaceRole([
  WORKSPACE_ROLES.ADMIN,
]);
