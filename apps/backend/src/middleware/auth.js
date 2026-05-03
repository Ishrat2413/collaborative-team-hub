/**
 * @fileoverview JWT authentication middleware.
 *
 * Reads the access token from httpOnly cookies (or Authorization header as fallback),
 * verifies it, and attaches the decoded user to req.user.
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../config/db.js';

/**
 * Express middleware that protects routes requiring authentication.
 * Attaches `req.user` with the full user record on success.
 *
 * @type {import('express').RequestHandler}
 */
export const protect = asyncHandler(async (req, res, next) => {
  // 1. Extract token from cookie or Authorization header
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  // 2. Verify the token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired. Please refresh.');
    }
    throw new ApiError(401, 'Invalid access token.');
  }

  // 3. Confirm user still exists in DB
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, 'User account no longer exists.');
  }

  req.user = user;
  next();
});
