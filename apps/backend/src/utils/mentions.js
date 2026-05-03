/**
 * @fileoverview Utility for parsing @mentions from comment text
 * and creating in-app notifications for mentioned users.
 */

import prisma from '../config/db.js';
import { extractMentions } from '@team-hub/shared';
import { emitToUser } from '../config/socket.js';
import { SOCKET_EVENTS, NOTIFICATION_TYPE } from '@team-hub/shared';

/**
 * Parses @mentions in a comment and creates notifications for mentioned users.
 *
 * @param {Object} options
 * @param {string} options.content - The comment text to parse
 * @param {string} options.workspaceId - The workspace the comment belongs to
 * @param {string} options.senderId - The user who wrote the comment
 * @param {string} options.senderName - Display name of the sender
 * @param {string} options.announcementId - The announcement being commented on
 * @param {string} options.announcementTitle - Title for the notification body
 * @returns {Promise<void>}
 */
export const processMentions = async ({
  content,
  workspaceId,
  senderId,
  senderName,
  announcementId,
  announcementTitle,
}) => {
  const mentionedNames = extractMentions(content);
  if (mentionedNames.length === 0) return;

  // Find workspace members whose names match the mentions
  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
  });

  const mentionedUsers = workspaceMembers.filter((m) =>
    mentionedNames.some(
      (mention) =>
        m.user.name.toLowerCase().includes(mention.toLowerCase()) &&
        m.userId !== senderId // Don't notify yourself
    )
  );

  // Create a notification for each mentioned user
  const notifications = await Promise.all(
    mentionedUsers.map((m) =>
      prisma.notification.create({
        data: {
          recipientId: m.userId,
          senderId,
          workspaceId,
          type: NOTIFICATION_TYPE.MENTION,
          title: `${senderName} mentioned you`,
          body: `In: "${announcementTitle}" — "${content.slice(0, 100)}${content.length > 100 ? '...' : ''}"`,
          link: `/dashboard/announcements?highlight=${announcementId}`,
        },
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      })
    )
  );

  // Push real-time notification to each mentioned user
  notifications.forEach((notification) => {
    emitToUser(notification.recipientId, SOCKET_EVENTS.NEW_NOTIFICATION, notification);
  });
};
