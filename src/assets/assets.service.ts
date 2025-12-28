import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetFilterDto } from './dto/asset-filter.dto';
import { Asset } from './entities/asset.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset)
    private assetRepository: typeof Asset,
  ) {}

  async create(createAssetDto: CreateAssetDto) {
    const asset = await this.assetRepository.create(createAssetDto as any);

    return {
      message: 'Asset created successfully',
      asset,
    };
  }

  async findAll(filterDto?: AssetFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where: any = {};

      if (filterDto?.label) {
        where.label = { [Op.iLike]: `%${filterDto.label}%` };
      }

      if (filterDto?.type) {
        where.type = filterDto.type;
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
          'label', 'type', 'model', 'serial_number', 'processor', 'status'
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

      const pagination = getPaginationMetadata(total, page, limit);

      return {
        message: 'Assets retrieved successfully',
        assets,
        count: assets.length,
        ...pagination,
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve assets');
    }
  }

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('Invalid asset ID');
    }

    const asset = await this.assetRepository.findByPk(id);

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return {
      message: 'Asset retrieved successfully',
      asset,
    };
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    if (!id) {
      throw new BadRequestException('Invalid asset ID');
    }

    const [affectedRows] = await this.assetRepository.update(updateAssetDto, {
      where: { id },
    });

    if (affectedRows === 0) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    const updatedAsset = await this.assetRepository.findByPk(id);
    if (!updatedAsset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return {
      message: 'Asset updated successfully',
      asset: updatedAsset,
    };
  }

  async remove(id: number) {
    if (!id) {
      throw new BadRequestException('Invalid asset ID');
    }

    const [affectedRows] = await this.assetRepository.update(
      { deletedAt: new Date() },
      { where: { id } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return {
      message: 'Asset deleted successfully',
      assetId: id,
    };
  }
}

