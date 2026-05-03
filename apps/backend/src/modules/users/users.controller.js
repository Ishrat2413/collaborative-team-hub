/**
 * @fileoverview Users controller.
 */

import { z } from 'zod';
import * as usersService from './users.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/apiError.js';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
});

/** PATCH /api/v1/users/profile */
export const updateProfile = asyncHandler(async (req, res) => {
  const data = updateProfileSchema.parse(req.body);
  const user = await usersService.updateProfile(req.user.id, data);
  sendSuccess(res, 200, 'Profile updated.', { user });
});

/** PATCH /api/v1/users/avatar */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    throw new ApiError(400, 'No image file uploaded. Please attach an image with field name "avatar".');
  }
  const user = await usersService.updateAvatar(req.user.id, req.file.buffer);
  sendSuccess(res, 200, 'Avatar updated.', { user });
});

/** GET /api/v1/users/search?workspaceId=&q= */
export const searchMembers = asyncHandler(async (req, res) => {
  const { workspaceId, q = '' } = req.query;
  const members = await usersService.searchWorkspaceMembers(workspaceId, q);
  sendSuccess(res, 200, 'Members found.', { members: members.map((m) => m.user) });
});
