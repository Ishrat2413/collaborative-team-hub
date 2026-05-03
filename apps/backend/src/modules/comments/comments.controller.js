/**
 * @fileoverview Comments controller with @mention processing.
 */

import { z } from "zod";
import * as commentsService from "./comments.service.js";
import { processMentions } from "../../utils/mentions.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { emitToWorkspace } from "../../config/socket.js";
import { SOCKET_EVENTS } from "../../lib/shared.js";
import prisma from "../../config/db.js";

const createSchema = z.object({
  announcementId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

/** POST /api/v1/comments */
export const createComment = asyncHandler(async (req, res) => {
  const { announcementId, workspaceId, content } = createSchema.parse(req.body);
  const comment = await commentsService.createComment(
    announcementId,
    req.user.id,
    content,
  );

  // Get announcement title for notification body
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: { title: true },
  });

  // Process @mentions — creates notifications + emits socket events
  await processMentions({
    content,
    workspaceId,
    senderId: req.user.id,
    senderName: req.user.name,
    announcementId,
    announcementTitle: announcement?.title || "an announcement",
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.ANNOUNCEMENT_COMMENT, {
    announcementId,
    comment,
  });

  sendSuccess(res, 201, "Comment posted.", { comment });
});

/** DELETE /api/v1/comments/:commentId */
export const deleteComment = asyncHandler(async (req, res) => {
  await commentsService.deleteComment(req.params.commentId);
  sendSuccess(res, 200, "Comment deleted.");
});
