import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LocalStorageService } from './local-storage.service';
import { AttachmentUploadService } from './attachment-upload.service';
import { Attachment } from '../database/entities/attachment.entity';

@Module({
  imports: [SequelizeModule.forFeature([Attachment])],
  providers: [LocalStorageService, AttachmentUploadService],
  exports: [LocalStorageService, AttachmentUploadService],
})
export class StorageModule {}

