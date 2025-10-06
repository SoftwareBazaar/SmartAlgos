/**
 * Supabase Storage Service
 * Handles file uploads to Supabase Storage for persistent image storage
 */

const databaseService = require('./databaseService');
const { v4: uuidv4 } = require('uuid');

class SupabaseStorageService {
  constructor() {
    this.supabase = databaseService.supabase;
  }

  /**
   * Upload image to Supabase Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalFilename - Original filename
   * @param {string} mimetype - File MIME type
   * @param {string} bucket - Bucket name (default: 'ea-images')
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadImage(fileBuffer, originalFilename, mimetype, bucket = 'ea-images') {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const ext = originalFilename.split('.').pop();
      const filename = `image-${timestamp}-${random}.${ext}`;
      const filePath = filename;

      console.log(`[Storage] Uploading to Supabase: ${bucket}/${filePath}`);

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: mimetype,
          upsert: false
        });

      if (error) {
        console.error('[Storage] Upload failed:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      console.log(`[Storage] ✅ Upload successful:`, publicUrl);

      return {
        url: publicUrl,
        path: filePath,
        bucket: bucket
      };
    } catch (error) {
      console.error('[Storage] Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Upload EA file to Supabase Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalFilename - Original filename
   * @param {string} mimetype - File MIME type
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadEAFile(fileBuffer, originalFilename, mimetype) {
    return this.uploadImage(fileBuffer, originalFilename, mimetype, 'ea-files');
  }

  /**
   * Delete file from Supabase Storage
   * @param {string} filePath - File path in storage
   * @param {string} bucket - Bucket name
   */
  async deleteFile(filePath, bucket = 'ea-images') {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('[Storage] Delete failed:', error);
        throw error;
      }

      console.log(`[Storage] ✅ Deleted: ${bucket}/${filePath}`);
      return true;
    } catch (error) {
      console.error('[Storage] Error deleting file:', error);
      return false; // Don't throw - deletion failures are not critical
    }
  }

  /**
   * Get public URL for a stored file
   * @param {string} filePath - File path in storage
   * @param {string} bucket - Bucket name
   * @returns {string}
   */
  getPublicUrl(filePath, bucket = 'ea-images') {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

module.exports = new SupabaseStorageService();

