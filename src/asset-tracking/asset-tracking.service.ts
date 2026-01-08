import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateAssetTrackingDto } from './dto/create-asset-tracking.dto';
import { UpdateAssetTrackingDto } from './dto/update-asset-tracking.dto';
import { AssetTrackingFilterDto } from './dto/asset-tracking-filter.dto';
import { AssetTracking } from './entities/asset-tracking.entity';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';
import { buildDateRangeClause, buildOrderClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { Asset } from '../assets/entities/asset.entity';
import { User } from '../users/entities/user.entity';
import { withTransaction } from '../shared/utils/transaction.util';

@Injectable()
export class AssetTrackingService {
  constructor(
    @InjectModel(AssetTracking)
    private assetTrackingRepository: typeof AssetTracking,
    @InjectConnection()
    private sequelize: Sequelize,
  ) {}

  async create(createAssetTrackingDto: CreateAssetTrackingDto) {
    const { assigned_at, removed_at, ...trackingData } = createAssetTrackingDto;

    return withTransaction(this.sequelize, async (transaction) => {
      const tracking = await this.assetTrackingRepository.create({
        ...trackingData,
        assigned_at: assigned_at ? new Date(assigned_at) : new Date(),
        removed_at: removed_at ? new Date(removed_at) : null,
      } as any, { transaction });

      const createdTracking = await this.assetTrackingRepository.unscoped().findByPk(tracking.id, {
        include: this.getTrackingIncludes(),
        transaction,
      });

      return {
        message: 'Asset tracking created successfully',
        assetTracking: createdTracking,
      };
    });
  }

  async findAll(filterDto?: AssetTrackingFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where = this.buildTrackingWhereClause(filterDto);
      const order = buildOrderClause(
        filterDto?.sortBy || 'createdAt',
        filterDto?.sortOrder || 'DESC'
      );

      // Use unscoped to get all records including removed ones for dashboard/listing
      const { rows: assetTrackings, count: total } = await this.assetTrackingRepository.unscoped().findAndCountAll({
        where,
        include: this.getTrackingIncludes(),
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      const pagination = getPaginationMetadata(total, page, limit);

      return {
        message: 'Asset trackings retrieved successfully',
        assetTrackings,
        count: assetTrackings.length,
        ...pagination,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to retrieve asset trackings',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  async findOne(id: string) {
    this.validateTrackingId(id);

    // Use unscoped to allow viewing removed assets by ID
    const assetTracking = await this.assetTrackingRepository.unscoped().findOne({
      where: { id, is_active: true },
      include: this.getTrackingIncludes(),
    });

    if (!assetTracking) {
      throw new NotFoundException(`Asset tracking with ID ${id} not found`);
    }

    return {
      message: 'Asset tracking retrieved successfully',
      assetTracking,
    };
  }

  async update(id: string, updateAssetTrackingDto: UpdateAssetTrackingDto) {
    this.validateTrackingId(id);

    return withTransaction(this.sequelize, async (transaction) => {
      await this.checkTrackingExists(id, transaction);

      const updateData = this.normalizeUpdateData(updateAssetTrackingDto);

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException('No fields provided to update');
      }

      await this.assetTrackingRepository.update(updateData, {
        where: { id, is_active: true },
        transaction,
      });

      const updatedTracking = await this.assetTrackingRepository.unscoped().findOne({
        where: { id, is_active: true },
        include: this.getTrackingIncludes(),
        transaction,
      });

      if (!updatedTracking) {
        throw new NotFoundException(`Asset tracking with ID ${id} not found`);
      }

      return {
        message: 'Asset tracking updated successfully',
        assetTracking: updatedTracking,
      };
    });
  }

  async remove(id: string) {
    this.validateTrackingId(id);

    return withTransaction(this.sequelize, async (transaction) => {
      const [affectedRows] = await this.assetTrackingRepository.update(
        { deletedAt: new Date(), is_active: false },
        { where: { id, is_active: true }, transaction }
      );

      if (affectedRows === 0) {
        throw new NotFoundException(`Asset tracking with ID ${id} not found`);
      }

      return {
        message: 'Asset tracking deleted successfully',
        assetTrackingId: id,
      };
    });
  }

  private validateTrackingId(id: string): void {
    if (!id) {
      throw new BadRequestException('Invalid asset tracking ID');
    }
  }

  private async checkTrackingExists(id: string, transaction?: Transaction): Promise<void> {
    const assetTracking = await this.assetTrackingRepository.unscoped().findOne({
      where: { id, is_active: true },
      attributes: ['id'],
      transaction,
    });

    if (!assetTracking) {
      throw new NotFoundException(`Asset tracking with ID ${id} not found`);
    }
  }

  private buildTrackingWhereClause(filterDto?: AssetTrackingFilterDto): any {
    const where: any = {
      is_active: true, // Always exclude inactive records (is_active = false)
    };

    // If activeOnly is true (used for asset tree), filter out removed assets
    // If activeOnly is false/undefined (used for dashboard), include all records including removed ones
    if (filterDto?.activeOnly === true) {
      where.removed_at = null;
    }

    if (filterDto?.asset_id) {
      where.asset_id = filterDto.asset_id;
    }

    if (filterDto?.user_id) {
      where.user_id = filterDto.user_id;
    }

    if (filterDto?.assignedFrom || filterDto?.assignedTo) {
      const dateRangeWhere = buildDateRangeClause(
        filterDto.assignedFrom,
        filterDto.assignedTo,
        'assigned_at'
      );
      if (dateRangeWhere) {
        Object.assign(where, dateRangeWhere);
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

  private normalizeUpdateData(updateDto: UpdateAssetTrackingDto): any {
    const updateData: any = {};

    if (updateDto.asset_id !== undefined) {
      updateData.asset_id = updateDto.asset_id;
    }

    if (updateDto.user_id !== undefined) {
      updateData.user_id = updateDto.user_id;
    }

    if (updateDto.assigned_at !== undefined) {
      updateData.assigned_at = updateDto.assigned_at === null || updateDto.assigned_at === ''
        ? null
        : new Date(updateDto.assigned_at);
    }

    if (updateDto.removed_at !== undefined) {
      updateData.removed_at = updateDto.removed_at === null || updateDto.removed_at === ''
        ? null
        : new Date(updateDto.removed_at);
    }

    return updateData;
  }

  private getTrackingIncludes() {
    return [
      { 
        model: Asset, 
        as: 'asset',
        required: false,
      },
      { 
        model: User, 
        as: 'user',
        required: false,
      },
    ];
  }
}
