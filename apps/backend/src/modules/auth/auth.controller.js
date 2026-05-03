/**
 * @fileoverview Authentication controller.
 * Handles HTTP layer for auth operations and delegates business logic to auth.service.js.
 */

import { z } from 'zod';
import * as authService from './auth.service.js';
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from '../../utils/cookie.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Registers a new user and sets auth cookies.
 */
export const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.registerUser(body);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  sendSuccess(res, 201, 'Account created successfully.', { user });
});

/**
 * POST /api/v1/auth/login
 * Authenticates a user and sets auth cookies.
 */
export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.loginUser(body);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  sendSuccess(res, 200, 'Logged in successfully.', { user });
});

/**
 * POST /api/v1/auth/refresh
 * Issues new tokens using the refresh token cookie.
 */
export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refreshTokens(incomingRefreshToken);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  sendSuccess(res, 200, 'Tokens refreshed.', { user });
});

/**
 * POST /api/v1/auth/logout
 * Clears auth cookies and logs the user out.
 */
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  sendSuccess(res, 200, 'Logged out successfully.');
});

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user's profile.
 * Requires the protect middleware.
 */
export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'User profile retrieved.', { user: req.user });
});
