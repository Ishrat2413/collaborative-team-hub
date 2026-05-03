/**
 * @fileoverview Async route handler wrapper.
 *
 * Wraps async Express route handlers to automatically catch Promise rejections
 * and forward them to the global error handler via next().
 *
 * @example
 * // Instead of:
 * router.get('/users', async (req, res, next) => {
 *   try { ... } catch (e) { next(e); }
 * });
 *
 * // Use:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   ...
 * }));
 *
 * @param {Function} fn - Async Express route handler
 * @returns {Function} Wrapped handler that catches errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
