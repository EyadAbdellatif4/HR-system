import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath: string;

  constructor() {
    // Get the base path - files folder outside HR-system-backend
    // __dirname in compiled JS: dist/shared/storage
    // __dirname in TS source: src/shared/storage
    // We need to go up to HR-system-backend root, then up one more level to find files folder
    const currentDir = __dirname;
    const isCompiled = currentDir.includes('dist');
    const backendPath = isCompiled 
      ? path.resolve(currentDir, '../../..') // dist/shared/storage -> HR-system-backend
      : path.resolve(currentDir, '../../..'); // src/shared/storage -> HR-system-backend
    this.basePath = path.resolve(backendPath, '..', 'files');
    
    // Ensure the base directory exists
    this.ensureDirectoryExists(this.basePath);
  }

  /**
   * Ensure a directory exists, create if it doesn't
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      this.logger.log(`Created directory: ${dirPath}`);
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.zip': 'application/zip',
      '.json': 'application/json',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Extract file extension from filename
   */
  private getExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
      return filename.substring(lastDotIndex);
    }
    return '';
  }

  /**
   * Get filename without extension
   */
  private getFileNameWithoutExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex > 0) {
      return filename.substring(0, lastDotIndex);
    }
    return filename;
  }

  /**
   * Upload a file to local storage and return the file path
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ filePath: string; name: string; type: string; extension: string }> {
    try {
      // Create folder path
      const folderPath = path.join(this.basePath, folder);
      this.ensureDirectoryExists(folderPath);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = this.getExtension(file.originalname) || path.extname(file.originalname);
      const fileName = `${timestamp}-${randomString}${extension}`;
      const filePath = path.join(folderPath, fileName);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Get file info
      const name = this.getFileNameWithoutExtension(file.originalname);
      const type = file.mimetype || this.getMimeType(extension);

      // Return relative path from basePath
      const relativePath = path.relative(this.basePath, filePath).replace(/\\/g, '/');

      return {
        filePath: relativePath,
        name,
        type,
        extension,
      };
    } catch (error) {
      throw new BadRequestException({
        message: `Failed to upload file to local storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'Upload Error',
        statusCode: 400,
      });
    }
  }

  /**
   * Upload multiple files to local storage
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<Array<{ filePath: string; name: string; type: string; extension: string }>> {
    if (!files || files.length === 0) {
      return [];
    }

    // Upload all files in parallel
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from local storage by relative path
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`Deleted file: ${fullPath}`);
      } else {
        this.logger.warn(`File not found: ${fullPath}`);
      }
    } catch (error) {
      // Log error but don't throw - file might not exist
      this.logger.warn(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get full file path for serving files
   */
  getFullPath(relativePath: string): string {
    return path.join(this.basePath, relativePath);
  }
}

