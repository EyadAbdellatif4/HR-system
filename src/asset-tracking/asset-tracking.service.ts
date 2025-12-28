import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateAssetTrackingDto } from './dto/create-asset-tracking.dto';
import { UpdateAssetTrackingDto } from './dto/update-asset-tracking.dto';
import { AssetTrackingFilterDto } from './dto/asset-tracking-filter.dto';
import { AssetTracking } from './entities/asset-tracking.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { Asset } from '../assets/entities/asset.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AssetTrackingService {
  constructor(
    @InjectModel(AssetTracking)
    private assetTrackingRepository: typeof AssetTracking,
  ) {}

  async create(createAssetTrackingDto: CreateAssetTrackingDto) {
    const { assigned_at, removed_at, ...trackingData } = createAssetTrackingDto;

    const tracking = await this.assetTrackingRepository.create({
      ...trackingData,
      assigned_at: assigned_at ? new Date(assigned_at) : new Date(),
      removed_at: removed_at ? new Date(removed_at) : null,
    } as any);

    const createdTracking = await this.assetTrackingRepository.findByPk(tracking.id, {
      include: [
        { model: Asset, as: 'asset' },
        { model: User, as: 'user' },
      ],
    });

    return {
      message: 'Asset tracking created successfully',
      assetTracking: createdTracking,
    };
  }

  async findAll(filterDto?: AssetTrackingFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where: any = {};

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

      const order = buildOrderClause(
        filterDto?.sortBy || 'createdAt',
        filterDto?.sortOrder || 'DESC'
      );

      const { rows: assetTrackings, count: total } = await this.assetTrackingRepository.findAndCountAll({
        where,
        include: [
          { model: Asset, as: 'asset' },
          { model: User, as: 'user' },
        ],
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
      throw new BadRequestException('Failed to retrieve asset trackings');
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid asset tracking ID');
    }

    const assetTracking = await this.assetTrackingRepository.findByPk(id, {
      include: [
        { model: Asset, as: 'asset' },
        { model: User, as: 'user' },
      ],
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
    if (!id) {
      throw new BadRequestException('Invalid asset tracking ID');
    }

    const updateData: any = { ...updateAssetTrackingDto };
    if (updateAssetTrackingDto.assigned_at) {
      updateData.assigned_at = new Date(updateAssetTrackingDto.assigned_at);
    }
    if (updateAssetTrackingDto.removed_at) {
      updateData.removed_at = new Date(updateAssetTrackingDto.removed_at);
    }

    const [affectedRows] = await this.assetTrackingRepository.update(updateData, {
      where: { id },
    });

    if (affectedRows === 0) {
      throw new NotFoundException(`Asset tracking with ID ${id} not found`);
    }

    const updatedTracking = await this.assetTrackingRepository.findByPk(id, {
      include: [
        { model: Asset, as: 'asset' },
        { model: User, as: 'user' },
      ],
    });

    return {
      message: 'Asset tracking updated successfully',
      assetTracking: updatedTracking,
    };
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid asset tracking ID');
    }

    const [affectedRows] = await this.assetTrackingRepository.update(
      { deletedAt: new Date() },
      { where: { id } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException(`Asset tracking with ID ${id} not found`);
    }

    return {
      message: 'Asset tracking deleted successfully',
      assetTrackingId: id,
    };
  }
}

