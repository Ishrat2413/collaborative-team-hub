/**
 * @fileoverview Announcements controller.
 */

import { z } from "zod";
import * as announcementsService from "./announcements.service.js";
import { sendSuccess, sendPaginated } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { emitToWorkspace } from "../../config/socket.js";
import {
  AUDIT_ACTION,
  SOCKET_EVENTS,
  AVAILABLE_REACTIONS,
} from "../../lib/shared.js";

const createSchema = z.object({
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

/** POST /api/v1/announcements */
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { workspaceId, ...data } = createSchema.parse(req.body);
  const announcement = await announcementsService.createAnnouncement(
    workspaceId,
    req.user.id,
    data,
  );

  await createAuditLog({
    workspaceId,
    actorId: req.user.id,
    action: AUDIT_ACTION.ANNOUNCEMENT_CREATED,
    entityType: "Announcement",
    entityId: announcement.id,
    entityTitle: announcement.title,
  });

  emitToWorkspace(
    workspaceId,
    SOCKET_EVENTS.ANNOUNCEMENT_CREATED,
    announcement,
  );
  sendSuccess(res, 201, "Announcement created.", { announcement });
});

/** GET /api/v1/announcements?workspaceId=&page=&limit= */
export const getAnnouncements = asyncHandler(async (req, res) => {
  const { workspaceId, page = "1", limit = "20" } = req.query;
  const { announcements, total } = await announcementsService.getAnnouncements(
    workspaceId,
    {
      page: parseInt(page),
      limit: parseInt(limit),
    },
  );
  sendPaginated(res, "Announcements retrieved.", announcements, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
  });
});

/** GET /api/v1/announcements/:announcementId */
export const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementsService.getAnnouncement(
    req.params.announcementId,
  );
  sendSuccess(res, 200, "Announcement retrieved.", { announcement });
});

/** PATCH /api/v1/announcements/:announcementId/pin */
export const togglePin = asyncHandler(async (req, res) => {
  const announcement = await announcementsService.togglePin(
    req.params.announcementId,
  );

  await createAuditLog({
    workspaceId: req.body.workspaceId,
    actorId: req.user.id,
    action: announcement.isPinned
      ? AUDIT_ACTION.ANNOUNCEMENT_PINNED
      : AUDIT_ACTION.ANNOUNCEMENT_UNPINNED,
    entityType: "Announcement",
    entityId: announcement.id,
    entityTitle: announcement.title,
  });

  emitToWorkspace(
    req.body.workspaceId,
    SOCKET_EVENTS.ANNOUNCEMENT_PINNED,
    announcement,
  );
  sendSuccess(
    res,
    200,
    `Announcement ${announcement.isPinned ? "pinned" : "unpinned"}.`,
    { announcement },
  );
});

/** POST /api/v1/announcements/:announcementId/reactions */
export const toggleReaction = asyncHandler(async (req, res) => {
  const { emoji, workspaceId } = z
    .object({
      emoji: z.enum(AVAILABLE_REACTIONS),
      workspaceId: z.string().uuid(),
    })
    .parse(req.body);

  const result = await announcementsService.toggleReaction(
    req.params.announcementId,
    req.user.id,
    emoji,
  );

  emitToWorkspace(workspaceId, SOCKET_EVENTS.ANNOUNCEMENT_REACTION, {
    announcementId: req.params.announcementId,
    ...result,
    userId: req.user.id,
  });

  sendSuccess(res, 200, "Reaction toggled.", result);
});

/** DELETE /api/v1/announcements/:announcementId */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementsService.deleteAnnouncement(req.params.announcementId);
  sendSuccess(res, 200, "Announcement deleted.");
});
