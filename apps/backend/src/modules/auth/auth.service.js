/**
 * @fileoverview Authentication service.
 * Contains all business logic for user registration, login, and token refresh.
 */

import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

/**
 * Registers a new user account.
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
 */
export const registerUser = async ({ name, email, password }) => {
  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, email: true, name: true, avatarUrl: true, bio: true, createdAt: true },
  });

  const tokenPayload = { userId: user.id, email: user.email, name: user.name };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
};

/**
 * Authenticates a user and returns tokens.
 *
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
 */
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const { passwordHash, avatarPublicId, ...safeUser } = user;

  const tokenPayload = { userId: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { user: safeUser, accessToken, refreshToken };
};

/**
 * Issues new access and refresh tokens using a valid refresh token.
 * Implements refresh token rotation.
 *
 * @param {string} refreshToken - The incoming refresh token from cookie
 * @returns {Promise<{accessToken: string, refreshToken: string, user: Object}>}
 */
export const refreshTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token not provided.');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token. Please log in again.');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, avatarUrl: true, bio: true, createdAt: true },
  });

  if (!user) {
    throw new ApiError(401, 'User not found.');
  }

  // Rotate tokens — issue brand new pair
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
};
