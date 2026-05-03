/**
 * @fileoverview Shared constants for the Collaborative Team Hub.
 * Used by both the frontend (Next.js) and backend (Express.js).
 */

// ─── Workspace Roles ────────────────────────────────────────────────────────

/** @enum {string} Roles a user can have within a workspace */
export const WORKSPACE_ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

// ─── Goal Statuses ──────────────────────────────────────────────────────────

/** @enum {string} Possible statuses for a Goal */
export const GOAL_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  AT_RISK: 'AT_RISK',
  CANCELLED: 'CANCELLED',
};

// ─── Action Item Statuses ────────────────────────────────────────────────────

/** @enum {string} Kanban column statuses for Action Items */
export const ACTION_ITEM_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
};

// ─── Action Item Priorities ──────────────────────────────────────────────────

/** @enum {string} Priority levels for Action Items */
export const ACTION_ITEM_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

// ─── Audit Actions ───────────────────────────────────────────────────────────

/** @enum {string} Audit log action types */
export const AUDIT_ACTION = {
  // Workspace
  WORKSPACE_CREATED: 'WORKSPACE_CREATED',
  WORKSPACE_UPDATED: 'WORKSPACE_UPDATED',
  MEMBER_INVITED: 'MEMBER_INVITED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  MEMBER_ROLE_CHANGED: 'MEMBER_ROLE_CHANGED',
  // Goals
  GOAL_CREATED: 'GOAL_CREATED',
  GOAL_UPDATED: 'GOAL_UPDATED',
  GOAL_STATUS_CHANGED: 'GOAL_STATUS_CHANGED',
  GOAL_DELETED: 'GOAL_DELETED',
  // Milestones
  MILESTONE_CREATED: 'MILESTONE_CREATED',
  MILESTONE_UPDATED: 'MILESTONE_UPDATED',
  MILESTONE_DELETED: 'MILESTONE_DELETED',
  // Announcements
  ANNOUNCEMENT_CREATED: 'ANNOUNCEMENT_CREATED',
  ANNOUNCEMENT_PINNED: 'ANNOUNCEMENT_PINNED',
  ANNOUNCEMENT_UNPINNED: 'ANNOUNCEMENT_UNPINNED',
  ANNOUNCEMENT_DELETED: 'ANNOUNCEMENT_DELETED',
  // Action Items
  ACTION_ITEM_CREATED: 'ACTION_ITEM_CREATED',
  ACTION_ITEM_STATUS_CHANGED: 'ACTION_ITEM_STATUS_CHANGED',
  ACTION_ITEM_ASSIGNED: 'ACTION_ITEM_ASSIGNED',
  ACTION_ITEM_DELETED: 'ACTION_ITEM_DELETED',
};

// ─── Socket Events ───────────────────────────────────────────────────────────

/** @enum {string} Socket.io event names for real-time communication */
export const SOCKET_EVENTS = {
  // Connection
  JOIN_WORKSPACE: 'join_workspace',
  LEAVE_WORKSPACE: 'leave_workspace',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  ONLINE_USERS: 'online_users',
  // Goals
  GOAL_CREATED: 'goal_created',
  GOAL_UPDATED: 'goal_updated',
  GOAL_STATUS_CHANGED: 'goal_status_changed',
  // Announcements
  ANNOUNCEMENT_CREATED: 'announcement_created',
  ANNOUNCEMENT_REACTION: 'announcement_reaction',
  ANNOUNCEMENT_PINNED: 'announcement_pinned',
  ANNOUNCEMENT_COMMENT: 'announcement_comment',
  // Action Items
  ACTION_ITEM_CREATED: 'action_item_created',
  ACTION_ITEM_UPDATED: 'action_item_updated',
  ACTION_ITEM_STATUS_CHANGED: 'action_item_status_changed',
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  // Activity
  ACTIVITY_UPDATE: 'activity_update',
};

// ─── Notification Types ──────────────────────────────────────────────────────

/** @enum {string} Types of in-app notifications */
export const NOTIFICATION_TYPE = {
  MENTION: 'MENTION',
  WORKSPACE_INVITE: 'WORKSPACE_INVITE',
  GOAL_UPDATE: 'GOAL_UPDATE',
  ACTION_ITEM_ASSIGNED: 'ACTION_ITEM_ASSIGNED',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
};

// ─── Emoji Reactions ─────────────────────────────────────────────────────────

/** @type {string[]} Available emoji reactions for announcements */
export const AVAILABLE_REACTIONS = ['👍', '❤️', '🎉', '🚀', '👀', '😮', '🔥', '✅'];

// ─── Pagination ───────────────────────────────────────────────────────────────

/** @type {number} Default page size for paginated endpoints */
export const DEFAULT_PAGE_SIZE = 20;

/** @type {number} Maximum page size allowed */
export const MAX_PAGE_SIZE = 100;
