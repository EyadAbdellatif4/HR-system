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

      // Always filter by is_active = true
      where.is_active = true;

      const { rows: assetTrackings, count: total } = await this.assetTrackingRepository.findAndCountAll({
        where,
        include: [
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

    const assetTracking = await this.assetTrackingRepository.findOne({
      where: { id, is_active: true },
      include: [
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

    // Check if asset tracking exists
    const assetTracking = await this.assetTrackingRepository.findOne({
      where: { id, is_active: true },
      attributes: ['id'],
    });

    if (!assetTracking) {
      throw new NotFoundException(`Asset tracking with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = {};
    
    // Only include fields that are provided
    if (updateAssetTrackingDto.asset_id !== undefined) {
      updateData.asset_id = updateAssetTrackingDto.asset_id;
    }
    if (updateAssetTrackingDto.user_id !== undefined) {
      updateData.user_id = updateAssetTrackingDto.user_id;
    }
    
    // Handle assigned_at - convert string to Date if provided, or set to null if explicitly null
    if (updateAssetTrackingDto.assigned_at !== undefined) {
      if (updateAssetTrackingDto.assigned_at === null || updateAssetTrackingDto.assigned_at === '') {
        updateData.assigned_at = null;
      } else {
        updateData.assigned_at = new Date(updateAssetTrackingDto.assigned_at);
      }
    }
    
    // Handle removed_at - convert string to Date if provided, or set to null if explicitly null/empty
    if (updateAssetTrackingDto.removed_at !== undefined) {
      if (updateAssetTrackingDto.removed_at === null || updateAssetTrackingDto.removed_at === '') {
        updateData.removed_at = null;
      } else {
        updateData.removed_at = new Date(updateAssetTrackingDto.removed_at);
      }
    }

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    // Update the record
    await this.assetTrackingRepository.update(updateData, {
      where: { id, is_active: true },
    });

    // Fetch updated tracking with relations
    const updatedTracking = await this.assetTrackingRepository.findOne({
      where: { id, is_active: true },
      include: [
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
      ],
    });

    if (!updatedTracking) {
      throw new NotFoundException(`Asset tracking with ID ${id} not found`);
    }

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
      { deletedAt: new Date(), is_active: false },
      { where: { id, is_active: true } }
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

