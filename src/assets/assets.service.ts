import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetFilterDto } from './dto/asset-filter.dto';
import { Asset } from './entities/asset.entity';
import { Attachment } from '../shared/database/entities/attachment.entity';
import { AttachmentUploadService } from '../shared/storage/attachment-upload.service';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';
import { buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';

/**
 * Fetch attachments for an asset (separate query for polymorphic relationship)
 * Time Complexity: O(1) - indexed lookup on entity_id and entity_type
 */
async function getAssetAttachments(assetId: string): Promise<Attachment[]> {
  return await Attachment.findAll({
    where: {
      entity_id: assetId, // entity_id is VARCHAR, assetId is UUID string - PostgreSQL handles conversion
      entity_type: 'assets',
      is_active: true,
      [Op.and]: [
        Sequelize.literal('deleted_at IS NULL'),
      ],
    } as any,
    attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at'],
    order: [['created_at', 'DESC']],
    paranoid: false, // We're handling deleted_at manually
  });
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset)
    private assetRepository: typeof Asset,
    @InjectConnection()
    private sequelize: Sequelize,
    private attachmentUploadService: AttachmentUploadService,
  ) {}

  /**
   * Create a new asset
   * Optimized: Single insert query, parallel image upload
   */
  async create(createAssetDto: CreateAssetDto, files?: Express.Multer.File[]) {
    const asset = await this.assetRepository.create(createAssetDto as any);

    // Upload and save attachments if provided
    if (files && files.length > 0) {
      await this.attachmentUploadService.uploadAndSaveAttachments(files, asset.id, 'assets');
    }

    // Reload asset
    const createdAsset = await this.assetRepository.findOne({
      where: { id: asset.id, is_active: true },
    });

    // Fetch attachments separately (polymorphic relationship): O(1)
    const attachments = await getAssetAttachments(asset.id);
    
    // Convert asset to plain object and attach attachments for proper serialization
    const assetResponse = createdAsset ? createdAsset.toJSON() : null;
    if (assetResponse) {
      assetResponse.attachments = attachments.map(att => att.toJSON());
    }

    return {
      message: 'Asset created successfully',
      asset: assetResponse,
    };
  }

  /**
   * Get all assets with optional filtering
   * Optimized: Single query with efficient where clause building
   */
  async findAll(filterDto?: AssetFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where: any = {};

      // Apply filters (optimized: build where clause efficiently)
      if (filterDto?.label) {
        where.label = { [Op.iLike]: `%${filterDto.label}%` };
      }

      if (filterDto?.type) {
        where.type = { [Op.iLike]: `%${filterDto.type}%` };
      }

      if (filterDto?.asset_type) {
        where.asset_type = filterDto.asset_type;
      }

      if (filterDto?.model) {
        where.model = { [Op.iLike]: `%${filterDto.model}%` };
      }

      if (filterDto?.serial_number) {
        where.serial_number = { [Op.iLike]: `%${filterDto.serial_number}%` };
      }

      if (filterDto?.status) {
        where.status = filterDto.status;
      }

      // Apply general search across multiple fields
      if (filterDto?.search) {
        const searchWhere = buildSearchClause(filterDto.search, [
          'label', 'type', 'model', 'serial_number', 'laptop_processor', 'status', 
          'phone_number', 'phone_company', 'mobile_imei_1', 'mobile_imei_2'
        ]);
        if (searchWhere) {
          Object.assign(where, searchWhere);
        }
      }

      // Apply date range filter
      if (filterDto?.createdFrom || filterDto?.createdTo) {
        const dateRangeWhere = buildDateRangeClause(
          filterDto.createdFrom,
          filterDto.createdTo,
          'createdAt'
        );
        if (dateRangeWhere) {
          Object.assign(where, dateRangeWhere);
        }
      }

      // Build order clause
      const order = buildOrderClause(
        filterDto?.sortBy || 'createdAt',
        filterDto?.sortOrder || 'DESC'
      );

      // Always filter by is_active = true
      where.is_active = true;

      // Single optimized query
      const { rows: assets, count: total } = await this.assetRepository.findAndCountAll({
        where,
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
      });

      // Fetch attachments for all assets in parallel: O(n) where n = number of assets
      if (assets.length > 0) {
        const assetIds = assets.map(a => a.id);
        const allAttachments = await Attachment.findAll({
          where: {
            entity_id: { [Op.in]: assetIds },
            entity_type: 'assets',
            is_active: true,
            [Op.and]: [
              Sequelize.literal('deleted_at IS NULL'),
            ],
          } as any,
          attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at', 'entity_id'],
          order: [['created_at', 'DESC']],
          paranoid: false, // We're handling deleted_at manually
        });

        // Group attachments by asset_id
        const attachmentsByAssetId = new Map<string, Attachment[]>();
        allAttachments.forEach(attachment => {
          const assetId = attachment.entity_id;
          if (!attachmentsByAssetId.has(assetId)) {
            attachmentsByAssetId.set(assetId, []);
          }
          attachmentsByAssetId.get(assetId)!.push(attachment);
        });

        // Attach attachments to each asset (convert to plain objects for proper serialization)
        assets.forEach(asset => {
          const assetAttachments = attachmentsByAssetId.get(asset.id) || [];
          (asset as any).attachments = assetAttachments.map(att => att.toJSON());
        });
      }

      const pagination = getPaginationMetadata(total, page, limit);

      return {
        message: 'Assets retrieved successfully',
        assets,
        count: assets.length,
        ...pagination,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to retrieve assets',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  /**
   * Get an asset by ID
   * Optimized: Single query
   */
  async findOne(id: string) {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException({
        message: 'Invalid asset ID format. Expected UUID format.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    const asset = await this.assetRepository.findOne({
      where: { id, is_active: true },
    });

    if (!asset) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    // Fetch attachments separately (polymorphic relationship): O(1)
    const attachments = await getAssetAttachments(id);
    
    // Convert to plain object and attach attachments for proper serialization
    const assetResponse = asset.toJSON();
    assetResponse.attachments = attachments.map(att => att.toJSON());

    return {
      message: 'Asset retrieved successfully',
      asset: assetResponse,
    };
  }

  /**
   * Update an asset
   * Optimized: Check existence, single update query, soft delete old attachments
   * Note: UUID validation is handled by ParseUUIDPipe in controller
   */
  async update(id: string, updateAssetDto: UpdateAssetDto, files?: Express.Multer.File[]) {
    // Check if asset exists
    const asset = await this.assetRepository.findOne({
      where: { id, is_active: true },
      attributes: ['id'],
    });

    if (!asset) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    // Start transaction
    const transaction = await this.sequelize.transaction();

    try {
      // Update asset within transaction
      await this.assetRepository.update(updateAssetDto, { 
        where: { id, is_active: true }, 
        transaction 
      });

      // Soft delete old attachments if new files are being uploaded
      if (files && files.length > 0) {
        await Attachment.update(
          { deleted_at: new Date(), is_active: false },
          {
            where: {
              entity_id: id,
              entity_type: 'assets',
              is_active: true,
              [Op.and]: [
                Sequelize.literal('deleted_at IS NULL'),
              ],
            } as any,
            transaction,
            paranoid: false, // We're handling deleted_at manually
          }
        );
      }

      // Commit transaction
      await transaction.commit();

      // File uploads (non-blocking, outside transaction): O(m) where m = number of files
      if (files && files.length > 0) {
        try {
          const savedAttachments = await this.attachmentUploadService.uploadAndSaveAttachments(files, id, 'assets');
          if (!savedAttachments || savedAttachments.length === 0) {
            console.error('Warning: Files uploaded but no attachment records created');
          }
        } catch (fileError) {
          console.error('File upload/attachment save failed:', fileError);
          // Don't throw - asset is already updated, just log the error
        }
      }
    } catch (error) {
      // Rollback transaction on any error
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // Transaction might already be rolled back, ignore
      }
      // Re-throw the error so NestJS can handle it
      throw error;
    }

    // Fetch updated asset
    const updatedAsset = await this.assetRepository.findOne({
      where: { id, is_active: true },
    });
    if (!updatedAsset) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    // Fetch attachments separately (polymorphic relationship): O(1)
    const attachments = await getAssetAttachments(id);
    
    // Convert to plain object and attach attachments for proper serialization
    const assetResponse = updatedAsset.toJSON();
    assetResponse.attachments = attachments.map(att => att.toJSON());

    return {
      message: 'Asset updated successfully',
      asset: assetResponse,
    };
  }

  /**
   * Soft delete an asset
   * Optimized: Single update query, also soft deletes attachments
   * Note: UUID validation is handled by ParseUUIDPipe in controller
   */
  async remove(id: string) {
    // Check if asset exists
    const asset = await this.assetRepository.findOne({
      where: { id, is_active: true },
      attributes: ['id'],
    });

    if (!asset) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    // Start transaction for atomicity
    const transaction = await this.sequelize.transaction();

    try {
      // Soft delete asset - set both deletedAt and is_active
      await this.assetRepository.update(
        { deletedAt: new Date(), is_active: false },
        { where: { id, is_active: true }, transaction }
      );

      // Soft delete all attachments related to this asset
      await Attachment.update(
        { deleted_at: new Date(), is_active: false },
        {
          where: {
            entity_id: id,
            entity_type: 'assets',
            is_active: true,
            [Op.and]: [
              Sequelize.literal('deleted_at IS NULL'),
            ],
          } as any,
          transaction,
          paranoid: false, // We're handling deleted_at manually
        }
      );

      // Commit transaction
      await transaction.commit();

      return {
        message: 'Asset deleted successfully',
        assetId: id,
      };
    } catch (error) {
      // Rollback on any error
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // Ignore rollback errors
      }
      throw error;
    }
  }
}
