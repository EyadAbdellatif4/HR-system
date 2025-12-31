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
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';
import { buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { withTransaction } from '../shared/utils/transaction.util';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department)
    private departmentRepository: typeof Department,
    @InjectConnection()
    private sequelize: Sequelize,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name, is_active = true } = createDepartmentDto;

    return withTransaction(this.sequelize, async (transaction) => {
      await this.validateDepartmentNameUniqueness(name, transaction);

      const department = await this.departmentRepository.create({
        name,
        is_active,
      } as Department, { transaction });

      return {
        message: 'Department created successfully',
        department,
      };
    });
  }

  async findAll(filterDto?: DepartmentFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where = this.buildDepartmentWhereClause(filterDto);
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
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to retrieve departments',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  async findOne(id: string) {
    this.validateDepartmentId(id);

    const department = await this.departmentRepository.findOne({
      where: { id, is_active: true },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return {
      message: 'Department retrieved successfully',
      department,
    };
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    this.validateDepartmentId(id);

    return withTransaction(this.sequelize, async (transaction) => {
      await this.checkDepartmentExists(id, transaction);

      if (updateDepartmentDto.name) {
        await this.validateDepartmentNameUniqueness(updateDepartmentDto.name, transaction, id);
      }

      await this.departmentRepository.update(updateDepartmentDto, {
        where: { id, is_active: true },
        transaction,
      });

      const updatedDepartment = await this.departmentRepository.findOne({
        where: { id, is_active: true },
        transaction,
      });

      if (!updatedDepartment) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }

      return {
        message: 'Department updated successfully',
        department: updatedDepartment,
      };
    });
  }

  async remove(id: string) {
    this.validateDepartmentId(id);

    return withTransaction(this.sequelize, async (transaction) => {
      const [affectedRows] = await this.departmentRepository.update(
        { deletedAt: new Date(), is_active: false },
        { where: { id, is_active: true }, transaction }
      );

      if (affectedRows === 0) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }

      return {
        message: 'Department deleted successfully',
        departmentId: id,
      };
    });
  }

  private validateDepartmentId(id: string): void {
    if (!id) {
      throw new BadRequestException('Invalid department ID');
    }
  }

  private async validateDepartmentNameUniqueness(
    name: string,
    transaction?: Transaction,
    excludeId?: string
  ): Promise<void> {
    const where: any = { name };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const existingDepartment = await this.departmentRepository.findOne({
      where,
      attributes: ['id'],
      transaction,
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }
  }

  private async checkDepartmentExists(id: string, transaction?: Transaction): Promise<void> {
    const department = await this.departmentRepository.findOne({
      where: { id, is_active: true },
      attributes: ['id'],
      transaction,
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  private buildDepartmentWhereClause(filterDto?: DepartmentFilterDto): any {
    const where: any = {};

    if (filterDto?.name) {
      where.name = { [Op.iLike]: `%${filterDto.name}%` };
    }

    if (filterDto?.is_active !== undefined) {
      where.is_active = filterDto.is_active;
    } else {
      where.is_active = true;
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

    return where;
  }
}
