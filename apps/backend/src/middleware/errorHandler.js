/**
 * @fileoverview Global Express error handler.
 *
 * Catches all errors forwarded via next(err) and sends a consistent
 * JSON error response. Handles:
 * - ApiError (operational errors with known status codes)
 * - Prisma errors (database constraint violations, etc.)
 * - JWT errors
 * - Generic/unexpected errors
 */

import { ApiError } from '../utils/apiError.js';

/**
 * Global error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 *
 * @type {import('express').ErrorRequestHandler}
 */
export const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // ─── Prisma Error Handling ────────────────────────────────────────────────

  if (err.code === 'P2002') {
    // Unique constraint violation
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists.`;
  } else if (err.code === 'P2025') {
    // Record not found
    statusCode = 404;
    message = 'Record not found.';
  } else if (err.code === 'P2003') {
    // Foreign key constraint
    statusCode = 400;
    message = 'Related record not found.';
  }

  // ─── JWT Error Handling ───────────────────────────────────────────────────

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  // ─── Zod Validation Errors ────────────────────────────────────────────────

  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed.';
    errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
  }

  // Log unexpected errors
  if (statusCode === 500) {
    console.error('💥 Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
