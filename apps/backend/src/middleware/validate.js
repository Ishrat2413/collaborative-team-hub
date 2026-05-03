/**
 * @fileoverview Request validation middleware factory.
 *
 * This project handles Zod validation inline inside each controller
 * using schema.parse(req.body), which throws a ZodError on failure.
 * The global errorHandler in errorHandler.js catches ZodError and
 * returns a 422 response with field-level error details.
 *
 * This file is kept as a placeholder for a reusable validate() factory
 * if you prefer to centralise schema validation at the route level.
 *
 * @example
 * // Route-level usage (optional pattern):
 * import { validate } from '../middleware/validate.js';
 * import { z } from 'zod';
 *
 * const schema = z.object({ name: z.string().min(1) });
 * router.post('/', validate(schema), controller);
 */

import { ApiError } from '../utils/apiError.js';

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err); // ZodError → caught by errorHandler → 422 response
  }
};
