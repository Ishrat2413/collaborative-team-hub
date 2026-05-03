/**
 * @fileoverview Announcements service.
 */

import prisma from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Creates a new announcement.
 */
export const createAnnouncement = async (workspaceId, authorId, data) => {
  return prisma.announcement.create({
    data: { workspaceId, authorId, ...data },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      reactions: { include: { user: { select: { id: true, name: true } } } },
      _count: { select: { comments: true } },
    },
  });
};

/**
 * Gets all announcements for a workspace.
 * Pinned announcements are always returned first.
 */
export const getAnnouncements = async (workspaceId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where: { workspaceId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        reactions: { include: { user: { select: { id: true, name: true } } } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.announcement.count({ where: { workspaceId } }),
  ]);

  return { announcements, total };
};

/**
 * Gets a single announcement with comments.
 */
export const getAnnouncement = async (announcementId) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      reactions: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      comments: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!announcement) throw new ApiError(404, 'Announcement not found.');
  return announcement;
};

/**
 * Toggles the pinned status of an announcement.
 */
export const togglePin = async (announcementId) => {
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (!announcement) throw new ApiError(404, 'Announcement not found.');

  return prisma.announcement.update({
    where: { id: announcementId },
    data: { isPinned: !announcement.isPinned },
  });
};

/**
 * Toggles a user's emoji reaction on an announcement.
 * If the reaction already exists, it is removed. Otherwise it is added.
 */
export const toggleReaction = async (announcementId, userId, emoji) => {
  const existing = await prisma.reaction.findUnique({
    where: { announcementId_userId_emoji: { announcementId, userId, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return { action: 'removed', emoji };
  }

  const reaction = await prisma.reaction.create({
    data: { announcementId, userId, emoji },
    include: { user: { select: { id: true, name: true } } },
  });
  return { action: 'added', reaction };
};

/**
 * Deletes an announcement.
 */
export const deleteAnnouncement = async (announcementId) => {
  await prisma.announcement.delete({ where: { id: announcementId } });
};
