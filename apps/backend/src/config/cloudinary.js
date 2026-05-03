/**
 * @fileoverview Cloudinary SDK v2 configuration.
 *
 * Uses Cloudinary's native upload_stream API instead of multer-storage-cloudinary
 * (which only supports Cloudinary v1). Multer stores files in memory, then we
 * pipe the buffer to Cloudinary's upload stream.
 */

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// ─── Configure Cloudinary SDK ─────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 *
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Cloudinary upload options
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} [options.resource_type='image'] - 'image' | 'raw' | 'auto'
 * @param {Array}  [options.transformation] - Cloudinary transformation array
 * @returns {Promise<Object>} Cloudinary upload result (includes .secure_url and .public_id)
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || 'image',
        folder: options.folder || 'team-hub',
        transformation: options.transformation,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Convert buffer to readable stream and pipe into Cloudinary
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary by its public ID.
 * @param {string} publicId - The Cloudinary public_id of the file to delete
 * @returns {Promise<Object>} Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
