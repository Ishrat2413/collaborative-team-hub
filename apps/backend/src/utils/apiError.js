/**
 * @fileoverview Custom API error class for consistent error handling.
 */

/**
 * Represents an HTTP API error with a status code and message.
 * @extends Error
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500)
   * @param {string} message - Human-readable error message
   * @param {Array} [errors=[]] - Optional array of validation errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Distinguishes from programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}
