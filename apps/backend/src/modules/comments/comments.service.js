/**
 * @fileoverview Comments service.
 */

import prisma from '../../config/db.js';

export const createComment = async (announcementId, authorId, content) => {
  return prisma.comment.create({
    data: { announcementId, authorId, content },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  });
};

export const deleteComment = async (commentId) => {
  await prisma.comment.delete({ where: { id: commentId } });
};
