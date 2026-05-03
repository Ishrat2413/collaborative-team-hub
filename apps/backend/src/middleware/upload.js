/**
 * @fileoverview Multer upload middleware using memoryStorage + Cloudinary v2 upload_stream.
 *
 * Strategy:
 *  1. Multer buffers the file in memory (no disk writes, works on Railway/serverless)
 *  2. The controller calls uploadToCloudinary(req.file.buffer, options) to push to Cloudinary
 *
 * This avoids the multer-storage-cloudinary package which only supports Cloudinary v1.
 */

import multer from 'multer';
import { ApiError } from '../utils/apiError.js';

/** Maximum file size: 5 MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Store files in memory — buffer is available as req.file.buffer */
const memStorage = multer.memoryStorage();

/**
 * Generic multer instance with memory storage.
 * @param {string[]} [allowedMimes] - Array of allowed MIME type prefixes
 */
const createUpload = (allowedMimes) =>
  multer({
    storage: memStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      if (!allowedMimes || allowedMimes.some((m) => file.mimetype.startsWith(m))) {
        cb(null, true);
      } else {
        cb(new ApiError(400, `File type not allowed. Accepted: ${allowedMimes.join(', ')}`));
      }
    },
  });

/** Multer error handler middleware */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size exceeds the 5 MB limit.'));
    }
    return next(new ApiError(400, `Upload error: ${err.message}`));
  }
  next(err);
};

/**
 * Middleware for uploading a single user avatar (images only).
 * File is available as req.file.buffer after this middleware runs.
 * Field name: "avatar"
 */
export const uploadAvatar = [
  createUpload(['image/']).single('avatar'),
  handleMulterError,
];

/**
 * Middleware for uploading a single announcement attachment.
 * Field name: "attachment"
 */
export const uploadAttachment = [
  createUpload(['image/', 'application/pdf']).single('attachment'),
  handleMulterError,
];
