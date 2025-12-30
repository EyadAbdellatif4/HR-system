import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class GcsService {
  private storage: Storage | null = null;
  private bucketName: string;
  private readonly logger = new Logger(GcsService.name);
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    const keyFilename = this.configService.get<string>('GCS_KEY_FILE');
    const projectId = this.configService.get<string>('GCP_PROJECT_ID');
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME') || '';

    // Check if GCS is configured
    if (keyFilename && projectId && this.bucketName) {
      try {
        // Verify key file exists
        const keyFilePath = path.resolve(keyFilename);
        if (!fs.existsSync(keyFilePath)) {
          this.logger.warn(`GCS key file not found at ${keyFilePath}. GCS uploads will be disabled.`);
          return;
        }

        // Initialize GCS client
        this.storage = new Storage({
          keyFilename: keyFilePath,
          projectId: projectId,
        });
        this.isConfigured = true;
        this.logger.log('GCS service initialized successfully');
      } catch (error) {
        this.logger.warn(`Failed to initialize GCS service: ${error instanceof Error ? error.message : 'Unknown error'}. GCS uploads will be disabled.`);
      }
    } else {
      this.logger.warn('GCS configuration is missing. Set GCS_KEY_FILE, GCP_PROJECT_ID, and GCS_BUCKET_NAME to enable GCS uploads.');
    }
  }

  /**
   * Upload a file to GCS and return the public URL
   * Optimized: Single upload operation with error handling
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    if (!this.isConfigured || !this.storage) {
      throw new BadRequestException({
        message: 'GCS is not configured. Please set GCS_KEY_FILE, GCP_PROJECT_ID, and GCS_BUCKET_NAME environment variables.',
        error: 'Configuration Error',
        statusCode: 400,
      });
    }

    try {
      const bucket = this.storage.bucket(this.bucketName);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folder}/${timestamp}-${randomString}${fileExtension}`;

      // Create file reference
      const fileRef = bucket.file(fileName);

      // Upload file
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
        public: true, // Make file publicly accessible
      });

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      
      return publicUrl;
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to upload file to GCS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Upload Error',
        statusCode: 400,
      });
    }
  }

  /**
   * Upload multiple files to GCS
   * Optimized: Parallel uploads using Promise.all
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    // Upload all files in parallel for better performance
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from GCS by URL
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.isConfigured || !this.storage) {
      this.logger.warn('GCS is not configured. Cannot delete file.');
      return;
    }

    try {
      const bucket = this.storage.bucket(this.bucketName);
      
      // Extract file path from URL
      const urlParts = fileUrl.split(`${this.bucketName}/`);
      if (urlParts.length < 2) {
        throw new Error('Invalid file URL');
      }
      
      const fileName = urlParts[1];
      await bucket.file(fileName).delete();
    } catch (error) {
      // Log error but don't throw - file might not exist
      this.logger.warn(`Failed to delete file from GCS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

