/**
 * @fileoverview Workspaces service — workspace CRUD, member management.
 */

import prisma from "../../config/db.js";
import { ApiError } from "../../utils/apiError.js";
import { WORKSPACE_ROLES } from "../../lib/shared.js";

/**
 * Creates a new workspace and makes the creator an admin.
 * @param {string} userId - Creator's user ID
 * @param {Object} data - {name, description, accentColor}
 * @returns {Promise<Object>} Created workspace with member count
 */
export const createWorkspace = async (
  userId,
  { name, description, accentColor },
) => {
  return prisma.workspace.create({
    data: {
      name,
      description,
      accentColor: accentColor || "#6366f1",
      members: {
        create: { userId, role: WORKSPACE_ROLES.ADMIN },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });
};

/**
 * Gets all workspaces for a user.
 * @param {string} userId
 * @returns {Promise<Object[]>}
 */
export const getUserWorkspaces = async (userId) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, goals: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
  }));
};

/**
 * Gets a single workspace by ID (verifies membership).
 * @param {string} workspaceId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const getWorkspace = async (workspaceId, userId) => {
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!membership) throw new ApiError(403, "Not a member of this workspace.");

  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { goals: true, actionItems: true } },
    },
  });
};

/**
 * Updates workspace details (admin only).
 * @param {string} workspaceId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const updateWorkspace = async (workspaceId, data) => {
  return prisma.workspace.update({
    where: { id: workspaceId },
    data,
  });
};

/**
 * Invites a user to a workspace by email.
 * @param {string} workspaceId
 * @param {string} email - Email of user to invite
 * @param {string} role - WORKSPACE_ROLES value
 * @returns {Promise<Object>} New membership record
 */
export const inviteMember = async (
  workspaceId,
  email,
  role = WORKSPACE_ROLES.MEMBER,
) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "No user found with that email address.");

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
  });
  if (existing)
    throw new ApiError(409, "User is already a member of this workspace.");

  return prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId, role },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });
};

/**
 * Changes a workspace member's role.
 * @param {string} workspaceId
 * @param {string} targetUserId
 * @param {string} role
 */
export const changeMemberRole = async (workspaceId, targetUserId, role) => {
  return prisma.workspaceMember.update({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

/**
 * Removes a member from a workspace.
 * @param {string} workspaceId
 * @param {string} targetUserId
 */
export const removeMember = async (workspaceId, targetUserId) => {
  await prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
  });
};
