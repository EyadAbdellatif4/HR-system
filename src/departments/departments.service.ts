import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentFilterDto } from './dto/department-filter.dto';
import { Department } from './entities/department.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department)
    private departmentRepository: typeof Department,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name, is_active = true } = createDepartmentDto;

    const existingDepartment = await this.departmentRepository.findOne({
      where: { name },
      attributes: ['id'],
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }

    const department = await this.departmentRepository.create({
      name,
      is_active,
    } as Department);

    return {
      message: 'Department created successfully',
      department,
    };
  }

  async findAll(filterDto?: DepartmentFilterDto) {
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

      const { rows: departments, count: total } = await this.departmentRepository.findAndCountAll({
        where,
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
      });

      const pagination = getPaginationMetadata(total, page, limit);

      return {
        message: 'Departments retrieved successfully',
        departments,
        count: departments.length,
        ...pagination,
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve departments');
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.departmentRepository.findByPk(id);

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return {
      message: 'Department retrieved successfully',
      department,
    };
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    if (!id) {
      throw new BadRequestException('Invalid department ID');
    }

    if (updateDepartmentDto.name) {
      const conflictDepartment = await this.departmentRepository.findOne({
        where: {
          id: { [Op.ne]: id },
          name: updateDepartmentDto.name,
        },
        attributes: ['id'],
      });

      if (conflictDepartment) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    const [affectedRows] = await this.departmentRepository.update(updateDepartmentDto, {
      where: { id },
    });

    if (affectedRows === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const updatedDepartment = await this.departmentRepository.findByPk(id);
    if (!updatedDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return {
      message: 'Department updated successfully',
      department: updatedDepartment,
    };
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid department ID');
    }

    const [affectedRows] = await this.departmentRepository.update(
      { deletedAt: new Date() },
      { where: { id } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return {
      message: 'Department deleted successfully',
      departmentId: id,
    };
  }
}

