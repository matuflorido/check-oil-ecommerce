/**
 * Cloudinary Image Service (Task 11)
 * Handles image upload and deletion for products
 */

import cloudinary from 'cloudinary';
import env from '../config/environment.js';

class CloudinaryService {
  constructor() {
    cloudinary.v2.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload image to Cloudinary
   * @param {Buffer|string} fileData - File buffer or base64 string
   * @param {Object} options - { folder?, publicId?, width?, height?, quality? }
   * @returns {Promise<Object>} { success, url, publicId, error? }
   */
  async uploadImage(fileData, options = {}) {
    try {
      const uploadOptions = {
        folder: options.folder || 'check-oil/productos',
        public_id: options.publicId,
        resource_type: 'auto',
        overwrite: true,
      };

      // Add transformation options if provided
      if (options.width || options.height) {
        uploadOptions.width = options.width;
        uploadOptions.height = options.height;
        uploadOptions.crop = 'fill';
      }

      if (options.quality) {
        uploadOptions.quality = options.quality;
      }

      // Upload to Cloudinary
      const result = await cloudinary.v2.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) throw error;
          return result;
        },
      );

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload image from base64 string
   * @param {string} base64String - Base64 encoded image
   * @param {Object} options - { folder?, publicId?, width?, height? }
   * @returns {Promise<Object>}
   */
  async uploadBase64(base64String, options = {}) {
    try {
      const uploadOptions = {
        folder: options.folder || 'check-oil/productos',
        public_id: options.publicId,
        resource_type: 'auto',
        overwrite: true,
      };

      if (options.width || options.height) {
        uploadOptions.width = options.width;
        uploadOptions.height = options.height;
        uploadOptions.crop = 'fill';
      }

      const result = await cloudinary.v2.uploader.upload(
        base64String,
        uploadOptions,
      );

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Error uploading base64 image to Cloudinary:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete image from Cloudinary by public ID
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} { success, error? }
   */
  async deleteImage(publicId) {
    try {
      if (!publicId) {
        return {
          success: false,
          error: 'Public ID is required',
        };
      }

      const result = await cloudinary.v2.uploader.destroy(publicId);

      if (result.result === 'ok') {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: `Failed to delete image: ${result.result}`,
      };
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get image metadata from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>}
   */
  async getImageMetadata(publicId) {
    try {
      const result = await cloudinary.v2.api.resource(publicId);

      return {
        success: true,
        data: {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format,
        },
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate optimized image URL with transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} transformations - { width, height, quality, format }
   * @returns {string} Transformed image URL
   */
  getOptimizedUrl(publicId, transformations = {}) {
    const options = {
      secure: true,
      width: transformations.width,
      height: transformations.height,
      crop: transformations.crop || 'fill',
      quality: transformations.quality || 'auto',
      format: transformations.format || 'auto',
    };

    return cloudinary.v2.url(publicId, options);
  }
}

export default new CloudinaryService();
