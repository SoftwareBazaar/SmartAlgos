/**
 * Supabase Storage Service
 * Handles file uploads to Supabase Storage for persistent image storage
 */

const databaseService = require('./databaseService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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
      // Normalize MIME type to standard formats
      const normalizeMimeType = (mime) => {
        if (!mime) return 'application/octet-stream';
        
        const lowerMime = mime.toLowerCase();
        
        // Normalize to standard MIME types (don't convert jpeg to jpg - jpg is invalid!)
        const mimeMap = {
          'image/jpg': 'image/jpeg',  // Convert invalid jpg to valid jpeg
          'image/x-jpeg': 'image/jpeg',
          'image/pjpeg': 'image/jpeg',
          'image/x-png': 'image/png',
        };
        
        return mimeMap[lowerMime] || mime;
      };

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const ext = originalFilename.split('.').pop();
      const filename = `image-${timestamp}-${random}.${ext}`;
      const filePath = filename;

      console.log(`[Storage] Uploading to Supabase: ${bucket}/${filePath} (${fileBuffer.length} bytes, type: ${mimetype})`);

      // Don't specify contentType - let Supabase auto-detect or use bucket's allowed types
      // This avoids MIME type restrictions
      const uploadPromise = this.supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          upsert: false
          // Removed contentType to avoid MIME type restrictions
        });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase Storage upload timeout after 15s')), 15000)
      );

      // Upload with 15 second timeout
      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

      if (error) {
        console.error('[Storage] Upload failed:', error);
        throw error;
      }

      // Get public URL (no await needed - synchronous)
      // CRITICAL: getPublicUrl returns { data: { publicUrl: ... } }
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      // Validate URL format
      if (!publicUrl || !publicUrl.startsWith('https://')) {
        console.error('[Storage] ❌ Invalid public URL returned:', publicUrl);
        throw new Error('Invalid public URL returned from Supabase Storage');
      }

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
    try {
      console.log(`[SupabaseStorage] Uploading EA file: ${originalFilename}`);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(originalFilename);
      const fileName = `ea-${timestamp}-${randomSuffix}${fileExtension}`;
      const filePath = `ea-files/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('ea-files')
        .upload(filePath, fileBuffer, {
          contentType: mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('[SupabaseStorage] EA file upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('ea-files')
        .getPublicUrl(filePath);

      console.log(`[SupabaseStorage] ✅ EA file uploaded: ${publicUrl}`);

      return {
        url: publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('[SupabaseStorage] EA file upload failed:', error);
      throw error;
    }
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

  /**
   * Download file from Supabase Storage
   * @param {string} fileUrl - Public URL or file path
   * @returns {Promise<Buffer>}
   */
  async downloadFile(fileUrl) {
    try {
      // Extract bucket and file path from URL
      // URL format: https://[PROJECT].supabase.co/storage/v1/object/public/[BUCKET]/[PATH]
      const urlParts = fileUrl.split('/storage/v1/object/public/');
      
      if (urlParts.length !== 2) {
        throw new Error('Invalid Supabase Storage URL format');
      }

      const [bucket, ...pathParts] = urlParts[1].split('/');
      const filePath = pathParts.join('/');

      console.log(`[Storage] Downloading from bucket: ${bucket}, path: ${filePath}`);

      const { data, error } = await this.supabase.storage
        .from(bucket)
        .download(filePath);

      if (error) {
        console.error('[Storage] Download failed:', error);
        throw error;
      }

      // Convert Blob to Buffer
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`[Storage] ✅ Downloaded ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      console.error('[Storage] Error downloading file:', error);
      throw error;
    }
  }
}

module.exports = new SupabaseStorageService();

