import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Attachment } from '../database/entities/attachment.entity';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class AttachmentUploadService {
  constructor(
    private localStorageService: LocalStorageService,
    @InjectModel(Attachment)
    private attachmentRepository: typeof Attachment,
  ) {}

  /**
   * Upload attachments and save to database
   * Optimized: Parallel uploads, batch database insert
   */
  async uploadAndSaveAttachments(
    files: Express.Multer.File[],
    entityId: string,
    entityType: 'users' | 'assets',
  ): Promise<Attachment[]> {
    if (!files || files.length === 0) {
      return [];
    }

    // Upload all files to local storage in parallel
    const folder = entityType === 'users' ? 'users' : 'assets';
    const uploadResults = await this.localStorageService.uploadFiles(files, folder);

    // Create attachment records in batch
    const attachmentRecords = uploadResults.map(result => ({
      entity_id: String(entityId), // Ensure string for VARCHAR column
      entity_type: entityType,
      name: result.name || 'unnamed',
      type: result.type || 'application/octet-stream',
      extension: result.extension || '',
      path_URL: result.filePath,
    }));

    // Bulk create with returning: true to ensure we get the created records
    const createdAttachments = await this.attachmentRepository.bulkCreate(attachmentRecords as any, {
      returning: true,
    });
    
    if (!createdAttachments || createdAttachments.length === 0) {
      throw new Error(`Failed to create attachment records. Expected ${attachmentRecords.length}, got 0`);
    }

    return createdAttachments;
  }

  /**
   * Delete attachments from local storage and database
   * Optimized: O(n) - single query for paths, single delete, parallel file deletions
   */
  async deleteAttachments(attachmentIds: string[]): Promise<void> {
    if (!attachmentIds || attachmentIds.length === 0) {
      return;
    }

    // Get attachment file paths before deletion - cast UUIDs properly
    const { Sequelize } = await import('sequelize');
    // Cast each UUID string to UUID type using Sequelize.cast
    // UUIDs should be validated before calling this method
    const attachments = await this.attachmentRepository.findAll({
      where: {
        id: {
          [Op.in]: attachmentIds.map(id => 
            Sequelize.cast(id, 'UUID')
          )
        }
      },
      attributes: ['id', 'path_URL'],
    });

    // Delete from database - cast UUIDs properly
    await this.attachmentRepository.destroy({
      where: {
        id: {
          [Op.in]: attachmentIds.map(id => 
            Sequelize.cast(id, 'UUID')
          )
        }
      },
    });

    // Delete from local storage in parallel
    const deletePromises = attachments.map(attachment => 
      this.localStorageService.deleteFile(attachment.path_URL)
    );
    await Promise.all(deletePromises);
  }
}

