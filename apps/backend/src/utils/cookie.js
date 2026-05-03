/**
 * @fileoverview Helpers for setting and clearing httpOnly JWT cookies.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

/** @type {import('express').CookieOptions} Base options for secure cookies */
const BASE_OPTIONS = {
  httpOnly: true,         // Not accessible via document.cookie (XSS protection)
  secure: IS_PROD,       // HTTPS only in production
  sameSite: IS_PROD ? 'none' : 'lax', // Required for cross-site cookies in production
  path: '/',
};

/**
 * Sets the access token cookie on the response.
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setAccessTokenCookie = (res, token) => {
  res.cookie('accessToken', token, {
    ...BASE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Sets the refresh token cookie on the response.
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    ...BASE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clears both auth cookies (used during logout).
 * @param {import('express').Response} res
 */
export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', BASE_OPTIONS);
  res.clearCookie('refreshToken', BASE_OPTIONS);
};
