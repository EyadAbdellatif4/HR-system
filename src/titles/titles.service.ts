import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { TitleFilterDto } from './dto/title-filter.dto';
import { Title } from './entities/title.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';

@Injectable()
export class TitlesService {
  constructor(
    @InjectModel(Title)
    private titleRepository: typeof Title,
  ) {}

  async create(createTitleDto: CreateTitleDto) {
    const { name, is_active = true } = createTitleDto;

    const existingTitle = await this.titleRepository.findOne({
      where: { name },
      attributes: ['id'],
    });

    if (existingTitle) {
      throw new ConflictException('Title with this name already exists');
    }

    const title = await this.titleRepository.create({
      name,
      is_active,
    } as Title);

    return {
      message: 'Title created successfully',
      title,
    };
  }

  async findAll(filterDto?: TitleFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where: any = {};

      if (filterDto?.name) {
        where.name = { [Op.iLike]: `%${filterDto.name}%` };
      }

      if (filterDto?.is_active !== undefined) {
        where.is_active = filterDto.is_active;
      }

      if (filterDto?.search) {
        const searchWhere = buildSearchClause(filterDto.search, ['name']);
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

      const { rows: titles, count: total } = await this.titleRepository.findAndCountAll({
        where,
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
      });

      const pagination = getPaginationMetadata(total, page, limit);

      return {
        message: 'Titles retrieved successfully',
        titles,
        count: titles.length,
        ...pagination,
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve titles');
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid title ID');
    }

    const title = await this.titleRepository.findByPk(id);

    if (!title) {
      throw new NotFoundException(`Title with ID ${id} not found`);
    }

    return {
      message: 'Title retrieved successfully',
      title,
    };
  }

  async update(id: string, updateTitleDto: UpdateTitleDto) {
    if (!id) {
      throw new BadRequestException('Invalid title ID');
    }

    if (updateTitleDto.name) {
      const conflictTitle = await this.titleRepository.findOne({
        where: {
          id: { [Op.ne]: id },
          name: updateTitleDto.name,
        },
        attributes: ['id'],
      });

      if (conflictTitle) {
        throw new ConflictException('Title with this name already exists');
      }
    }

    const [affectedRows] = await this.titleRepository.update(updateTitleDto, {
      where: { id },
    });

    if (affectedRows === 0) {
      throw new NotFoundException(`Title with ID ${id} not found`);
    }

    const updatedTitle = await this.titleRepository.findByPk(id);
    if (!updatedTitle) {
      throw new NotFoundException(`Title with ID ${id} not found`);
    }

    return {
      message: 'Title updated successfully',
      title: updatedTitle,
    };
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid title ID');
    }

    const [affectedRows] = await this.titleRepository.update(
      { deletedAt: new Date() },
      { where: { id } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException(`Title with ID ${id} not found`);
    }

    return {
      message: 'Title deleted successfully',
      titleId: id,
    };
  }
}

