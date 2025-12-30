import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Image } from '../database/entities/image.entity';
import { GcsService } from './gcs.service';

@Injectable()
export class ImageUploadService {
  constructor(
    private gcsService: GcsService,
    @InjectModel(Image)
    private imageRepository: typeof Image,
  ) {}

  /**
   * Upload images and save to database
   * Optimized: Parallel uploads, batch database insert
   */
  async uploadAndSaveImages(
    files: Express.Multer.File[],
    ownerId: string,
    ownerType: 'user' | 'asset',
  ): Promise<Image[]> {
    if (!files || files.length === 0) {
      return [];
    }

    // Upload all files to GCS in parallel
    const folder = ownerType === 'user' ? 'users' : 'assets';
    const imageUrls = await this.gcsService.uploadFiles(files, folder);

    // Create image records in batch
    const imageRecords = imageUrls.map(url => ({
      owner_id: ownerId,
      owner_type: ownerType,
      image_url: url,
    })) as any;

    const createdImages = await this.imageRepository.bulkCreate(imageRecords);
    return createdImages;
  }

  /**
   * Delete images from GCS and database
   * Optimized: Parallel deletions
   */
  async deleteImages(imageIds: number[]): Promise<void> {
    if (!imageIds || imageIds.length === 0) {
      return;
    }

    // Get image URLs before deletion
    const images = await this.imageRepository.findAll({
      where: { id: imageIds },
      attributes: ['id', 'image_url'],
    });

    // Delete from database
    await this.imageRepository.destroy({
      where: { id: imageIds },
    });

    // Delete from GCS in parallel
    const deletePromises = images.map(image => 
      this.gcsService.deleteFile(image.image_url)
    );
    await Promise.all(deletePromises);
  }
}

