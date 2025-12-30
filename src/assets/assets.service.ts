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
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset)
    private assetRepository: typeof Asset,
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

    // Reload asset with attachments
    const createdAsset = await this.assetRepository.findByPk(asset.id, {
      include: [
        { 
          model: Attachment, 
          as: 'attachments', 
          attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at'],
          required: false,
        },
      ],
    });

    return {
      message: 'Asset created successfully',
      asset: createdAsset,
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

      // Single optimized query with attachments
      const { rows: assets, count: total } = await this.assetRepository.findAndCountAll({
        where,
        include: [
          { 
            model: Attachment, 
            as: 'attachments', 
            attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at'],
            required: false,
          },
        ],
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true, // Important for count with joins
      });

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

    const asset = await this.assetRepository.findByPk(id, {
      include: [
        { 
          model: Attachment, 
          as: 'attachments', 
          attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at'],
          required: false,
        },
      ],
    });

    if (!asset) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return {
      message: 'Asset retrieved successfully',
      asset,
    };
  }

  /**
   * Update an asset
   * Optimized: Single update query, then fetch
   */
  async update(id: string, updateAssetDto: UpdateAssetDto) {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException({
        message: 'Invalid asset ID format. Expected UUID format.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    const [affectedRows] = await this.assetRepository.update(updateAssetDto, {
      where: { id },
    });

    if (affectedRows === 0) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    const updatedAsset = await this.assetRepository.findByPk(id);
    if (!updatedAsset) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return {
      message: 'Asset updated successfully',
      asset: updatedAsset,
    };
  }

  /**
   * Soft delete an asset
   * Optimized: Single update query
   */
  async remove(id: string) {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException({
        message: 'Invalid asset ID format. Expected UUID format.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    const [affectedRows] = await this.assetRepository.update(
      { deletedAt: new Date() },
      { where: { id } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return {
      message: 'Asset deleted successfully',
      assetId: id,
    };
  }
}
