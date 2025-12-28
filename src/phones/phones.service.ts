import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { PhoneFilterDto } from './dto/phone-filter.dto';
import { Phone } from './entities/phone.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PhonesService {
  constructor(
    @InjectModel(Phone)
    private phoneRepository: typeof Phone,
  ) {}

  async create(createPhoneDto: CreatePhoneDto) {
    const { user_id, is_active = true, ...phoneData } = createPhoneDto;

    const phone = await this.phoneRepository.create({
      ...phoneData,
      user_id,
      is_active,
    } as any);

    const createdPhone = await this.phoneRepository.findByPk(phone.id, {
      include: [{ model: User, as: 'user' }],
    });

    return {
      message: 'Phone created successfully',
      phone: createdPhone,
    };
  }

  async findAll(filterDto?: PhoneFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where: any = {};

      if (filterDto?.number) {
        where.number = { [Op.iLike]: `%${filterDto.number}%` };
      }

      if (filterDto?.company) {
        where.company = { [Op.iLike]: `%${filterDto.company}%` };
      }

      if (filterDto?.is_active !== undefined) {
        where.is_active = filterDto.is_active;
      }

      if (filterDto?.user_id) {
        where.user_id = filterDto.user_id;
      }

      if (filterDto?.search) {
        const searchWhere = buildSearchClause(filterDto.search, ['number', 'company', 'legal_owner']);
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

      const { rows: phones, count: total } = await this.phoneRepository.findAndCountAll({
        where,
        include: [{ model: User, as: 'user' }],
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
      });

      const pagination = getPaginationMetadata(total, page, limit);

      return {
        message: 'Phones retrieved successfully',
        phones,
        count: phones.length,
        ...pagination,
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve phones');
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid phone ID');
    }

    const phone = await this.phoneRepository.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });

    if (!phone) {
      throw new NotFoundException(`Phone with ID ${id} not found`);
    }

    return {
      message: 'Phone retrieved successfully',
      phone,
    };
  }

  async update(id: string, updatePhoneDto: UpdatePhoneDto) {
    if (!id) {
      throw new BadRequestException('Invalid phone ID');
    }

    const [affectedRows] = await this.phoneRepository.update(updatePhoneDto, {
      where: { id },
    });

    if (affectedRows === 0) {
      throw new NotFoundException(`Phone with ID ${id} not found`);
    }

    const updatedPhone = await this.phoneRepository.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });

    return {
      message: 'Phone updated successfully',
      phone: updatedPhone,
    };
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid phone ID');
    }

    const [affectedRows] = await this.phoneRepository.update(
      { deletedAt: new Date() },
      { where: { id } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException(`Phone with ID ${id} not found`);
    }

    return {
      message: 'Phone deleted successfully',
      phoneId: id,
    };
  }
}

