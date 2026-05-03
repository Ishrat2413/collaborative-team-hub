/**
 * @fileoverview JWT token generation and verification utilities.
 */

import jwt from 'jsonwebtoken';

/**
 * Generates a short-lived JWT access token.
 * @param {Object} payload - Data to encode in the token
 * @param {string} payload.userId
 * @param {string} payload.email
 * @param {string} payload.name
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

/**
 * Generates a long-lived JWT refresh token.
 * @param {Object} payload - Data to encode
 * @param {string} payload.userId
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Verifies a JWT access token.
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

/**
 * Verifies a JWT refresh token.
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
