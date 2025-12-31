import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetFilterDto } from './dto/asset-filter.dto';
import { Asset } from './entities/asset.entity';
import { AttachmentUploadService } from '../shared/storage/attachment-upload.service';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { getEntityAttachments, getBatchEntityAttachments } from '../shared/utils/attachment.util';
import { softDeleteEntityAttachments } from '../shared/utils/soft-delete.util';
import { withTransaction } from '../shared/utils/transaction.util';

const GENERAL_FIELDS = ['label', 'type', 'asset_type', 'model', 'serial_number', 'ram', 'status', 'details'];

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset)
    private assetRepository: typeof Asset,
    @InjectConnection()
    private sequelize: Sequelize,
    private attachmentUploadService: AttachmentUploadService,
  ) {}

  async create(createAssetDto: CreateAssetDto, files?: Express.Multer.File[]) {
    this.validateAssetTypeFields(createAssetDto);
    const filteredDto = this.filterAssetFieldsByType(createAssetDto);
    
    const asset = await this.assetRepository.create(filteredDto as any);

    if (files && files.length > 0) {
      await this.handleFileUploads(files, asset.id);
    }

    return this.buildAssetResponse(asset.id, 'Asset created successfully');
  }

  async findAll(filterDto?: AssetFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where = this.buildAssetWhereClause(filterDto);
      const order = buildOrderClause(
        filterDto?.sortBy || 'createdAt',
        filterDto?.sortOrder || 'DESC'
      );

      const { rows: assets, count: total } = await this.assetRepository.findAndCountAll({
        where,
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
      });

      if (assets.length > 0) {
        await this.attachAssetAttachments(assets);
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

  async findOne(id: string) {
    this.validateAssetId(id);

    const asset = await this.assetRepository.findOne({
      where: { 
        id,
        [Op.and]: [
          Sequelize.literal('"deletedAt" IS NULL'),
        ],
      } as any,
    });

    if (!asset) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    const attachments = await getEntityAttachments(id, 'assets');
    const assetResponse = asset.toJSON();
    assetResponse.attachments = attachments.map(att => att.toJSON());

    return {
      message: 'Asset retrieved successfully',
      asset: assetResponse,
    };
  }

  async update(id: string, updateAssetDto: UpdateAssetDto, files?: Express.Multer.File[]) {
    await this.checkAssetExists(id);

    return withTransaction(this.sequelize, async (transaction) => {
      await this.assetRepository.update(updateAssetDto, { 
        where: { 
          id,
          [Op.and]: [
            Sequelize.literal('"deletedAt" IS NULL'),
          ],
        } as any, 
        transaction 
      });

      if (files && files.length > 0) {
        await softDeleteEntityAttachments(id, 'assets', transaction);
      }

      if (files && files.length > 0) {
        await this.handleFileUploads(files, id);
      }

      return this.buildAssetResponse(id, 'Asset updated successfully');
    });
  }

  async remove(id: string) {
    await this.checkAssetExists(id);

    return withTransaction(this.sequelize, async (transaction) => {
      await this.assetRepository.update(
        { 
          status: 'in_active',
          deletedAt: new Date() 
        },
        { 
          where: { 
            id,
            [Op.and]: [
              Sequelize.literal('"deletedAt" IS NULL'),
            ],
          } as any, 
          transaction 
        }
      );

      await softDeleteEntityAttachments(id, 'assets', transaction);

      return {
        message: 'Asset deleted successfully',
        assetId: id,
      };
    });
  }

  private filterAssetFieldsByType(createAssetDto: CreateAssetDto): Partial<CreateAssetDto> {
    const { asset_type } = createAssetDto;
    
    if (!asset_type) {
      return createAssetDto;
    }

    const assetTypePrefix = `${asset_type}_`;
    const filtered: any = {};
    
    Object.keys(createAssetDto).forEach(field => {
      const value = (createAssetDto as any)[field];
      
      // Always include general fields, asset_type, and images
      if (GENERAL_FIELDS.includes(field) || field === 'asset_type' || field === 'images') {
        filtered[field] = value;
        return;
      }
      
      // Only include fields that start with the asset_type prefix and have actual values
      if (field.startsWith(assetTypePrefix)) {
        // Include if value is not empty, null, undefined, or just the field name (placeholder)
        if (value !== null && value !== undefined && value !== '' && value !== field) {
          filtered[field] = value;
        }
      }
    });
    
    return filtered;
  }

  private validateAssetTypeFields(createAssetDto: CreateAssetDto): void {
    const { asset_type } = createAssetDto;
    
    if (!asset_type) {
      return;
    }

    const assetTypePrefix = `${asset_type}_`;
    const providedFields = Object.keys(createAssetDto);
    
    const invalidFields: string[] = [];
    
    providedFields.forEach(field => {
      // Skip general fields, asset_type, and images
      if (GENERAL_FIELDS.includes(field) || field === 'asset_type' || field === 'images') {
        return;
      }
      
      // Check if field has an actual value (not empty, null, undefined, or placeholder)
      const value = (createAssetDto as any)[field];
      const hasValue = value !== null && value !== undefined && value !== '' && String(value).trim() !== '' && value !== field;
      
      // If field has a value, it must start with the asset_type prefix
      if (hasValue && !field.startsWith(assetTypePrefix)) {
        invalidFields.push(field);
      }
    });
    
    if (invalidFields.length > 0) {
      throw new BadRequestException({
        message: `Invalid fields for asset_type '${asset_type}': ${invalidFields.join(', ')}. Only fields starting with '${assetTypePrefix}' and general fields (${GENERAL_FIELDS.join(', ')}) are allowed.`,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
  }

  private validateAssetId(id: string): void {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException({
        message: 'Invalid asset ID format. Expected UUID format.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }
  }

  private async checkAssetExists(id: string): Promise<void> {
    const asset = await this.assetRepository.findOne({
      where: { 
        id,
        [Op.and]: [
          Sequelize.literal('"deletedAt" IS NULL'),
        ],
      } as any,
      attributes: ['id'],
    });

    if (!asset) {
      throw new NotFoundException({
        message: `Asset with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }
  }

  private buildAssetWhereClause(filterDto?: AssetFilterDto): any {
    const where: any = {
      [Op.and]: [
        Sequelize.literal('"deletedAt" IS NULL'),
      ],
    };

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

    if (filterDto?.search) {
      const searchWhere = buildSearchClause(filterDto.search, [
        'label', 'type', 'model', 'serial_number', 'laptop_processor', 'status', 
        'phone_number', 'phone_company', 'mobile_imei_1', 'mobile_imei_2'
      ]);
      if (searchWhere) {
        Object.assign(where, searchWhere);
      }
    }

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

    return where;
  }

  private async attachAssetAttachments(assets: Asset[]): Promise<void> {
    const assetIds = assets.map(a => a.id);
    const allAttachments = await getBatchEntityAttachments(assetIds, 'assets');

    const attachmentsByAssetId = new Map<string, typeof allAttachments>();
    allAttachments.forEach(attachment => {
      const assetId = attachment.entity_id;
      if (!attachmentsByAssetId.has(assetId)) {
        attachmentsByAssetId.set(assetId, []);
      }
      attachmentsByAssetId.get(assetId)!.push(attachment);
    });

    assets.forEach(asset => {
      const assetAttachments = attachmentsByAssetId.get(asset.id) || [];
      (asset as any).attachments = assetAttachments.map(att => att.toJSON());
    });
  }

  private async buildAssetResponse(assetId: string, message: string) {
    const asset = await this.assetRepository.findOne({
      where: { 
        id: assetId,
        [Op.and]: [
          Sequelize.literal('"deletedAt" IS NULL'),
        ],
      } as any,
    });

    const attachments = await getEntityAttachments(assetId, 'assets');
    const assetResponse = asset ? asset.toJSON() : null;
    
    if (assetResponse) {
      assetResponse.attachments = attachments.map(att => att.toJSON());
    }

    return {
      message,
      asset: assetResponse,
    };
  }

  private async handleFileUploads(files: Express.Multer.File[], assetId: string): Promise<void> {
    try {
      const savedAttachments = await this.attachmentUploadService.uploadAndSaveAttachments(files, assetId, 'assets');
      if (!savedAttachments || savedAttachments.length === 0) {
        console.error('Warning: Files uploaded but no attachment records created');
      }
    } catch (fileError) {
      console.error('File upload/attachment save failed:', fileError);
    }
  }
}
