import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
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
      entity_id: entityId,
      entity_type: entityType,
      name: result.name,
      type: result.type,
      extension: result.extension,
      path_URL: result.filePath,
    })) as any;

    const createdAttachments = await this.attachmentRepository.bulkCreate(attachmentRecords);
    return createdAttachments;
  }

  /**
   * Delete attachments from local storage and database
   * Optimized: Parallel deletions
   */
  async deleteAttachments(attachmentIds: string[]): Promise<void> {
    if (!attachmentIds || attachmentIds.length === 0) {
      return;
    }

    // Get attachment file paths before deletion
    const attachments = await this.attachmentRepository.findAll({
      where: { id: attachmentIds },
      attributes: ['id', 'path_URL'],
    });

    // Delete from database
    await this.attachmentRepository.destroy({
      where: { id: attachmentIds },
    });

    // Delete from local storage in parallel
    const deletePromises = attachments.map(attachment => 
      this.localStorageService.deleteFile(attachment.path_URL)
    );
    await Promise.all(deletePromises);
  }
}

