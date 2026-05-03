/**
 * @fileoverview Standard API response shaper.
 * Ensures all API responses follow a consistent JSON structure.
 */

/**
 * Sends a successful API response.
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} [data] - Response payload
 */
export const sendSuccess = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Sends a paginated API response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {Array} items - The page of items
 * @param {Object} pagination - Pagination metadata
 * @param {number} pagination.page
 * @param {number} pagination.limit
 * @param {number} pagination.total
 */
export const sendPaginated = (res, message, items, { page, limit, total }) => {
  return res.json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  });
};
