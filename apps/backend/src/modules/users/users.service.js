/**
 * @fileoverview Users service — profile management and avatar uploads.
 */

import prisma from '../../config/db.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Updates a user's profile fields (name, bio).
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>} Updated user
 */
export const updateProfile = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, avatarUrl: true, bio: true, createdAt: true },
  });
};

/**
 * Uploads a new avatar to Cloudinary, saves the URL, and deletes the old avatar.
 * @param {string} userId
 * @param {Buffer} fileBuffer - Raw file buffer from multer memoryStorage
 * @returns {Promise<Object>} Updated user
 */
export const updateAvatar = async (userId, fileBuffer) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found.');

  // Delete old avatar from Cloudinary if it exists
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId).catch(console.error);
  }

  // Upload new avatar to Cloudinary with face-crop transformation
  const result = await uploadToCloudinary(fileBuffer, {
    folder: 'team-hub/avatars',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: result.secure_url,
      avatarPublicId: result.public_id,
    },
    select: { id: true, email: true, name: true, avatarUrl: true, bio: true, createdAt: true },
  });
};

/**
 * Finds users by name or email within a workspace (for @mention autocomplete).
 * @param {string} workspaceId
 * @param {string} query - Search string
 * @returns {Promise<Object[]>}
 */
export const searchWorkspaceMembers = async (workspaceId, query) => {
  return prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      user: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    take: 10,
  });
};
