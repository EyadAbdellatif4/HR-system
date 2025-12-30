import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { RoleFilterDto } from './dto/role-filter.dto';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';

/**
 * RoleService is a service that provides methods to manage roles
 */
@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role)
    private roleRepository: typeof Role,
  ) {}

  /**
   * Create a new role
   * @param createRoleDto - The role data
   * @returns The created role
   */
  async create(createRoleDto: CreateRoleDto) {
    const { name, is_active = true } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Create role
    const role = await this.roleRepository.create({
      name,
      is_active,
    } as Role);

    return {
      message: 'Role created successfully',
      role,
    };
  }

  /**
   * Get all roles with optional filtering
   * @param filterDto - Filter parameters
   * @returns Filtered roles with pagination
   */
  async findAll(filterDto?: RoleFilterDto) {
    try {
      // Get pagination parameters
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      // Build base where clause
      const where: any = {};

      // Always filter by is_active = true (unless explicitly filtered)
      if (filterDto?.is_active === undefined) {
        where.is_active = true;
      } else {
        where.is_active = filterDto.is_active;
      }

      // Apply general search across name field
      if (filterDto?.search) {
        const searchWhere = buildSearchClause(filterDto.search, ['name']);
        if (searchWhere) {
          Object.assign(where, searchWhere);
        }
      }

      // Build filter configuration
      const filterConfig: Record<string, any> = {
        name: { type: 'text', field: 'name' },
      };

      // Apply text filters
      const filterWhere = buildWhereClause(filterDto || {}, filterConfig);
      Object.assign(where, filterWhere);

      // Apply date range filter for createdAt
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

      // Apply date range filter for updatedAt
      if (filterDto?.updatedFrom || filterDto?.updatedTo) {
        const dateRangeWhere = buildDateRangeClause(
          filterDto.updatedFrom,
          filterDto.updatedTo,
          'updatedAt'
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

      // Get paginated roles and total count in a single query
      const { rows: roles, count: total } = await this.roleRepository.findAndCountAll({
        where,
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
      });

      // Get pagination metadata
      const pagination = getPaginationMetadata(total, page, limit);

      return {
        message: 'Roles retrieved successfully',
        roles,
        count: roles.length,
        ...pagination,
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve roles');
    }
  }

  /**
   * Get a role by ID
   * @param id - The role ID
   * @returns The role
   */
  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid role ID');
    }

    const role = await this.roleRepository.findOne({
      where: { id, is_active: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return {
      message: 'Role retrieved successfully',
      role,
    };
  }

  /**
   * Update a role
   * @param id - The role ID
   * @param updateRoleDto - The role data
   * @returns The updated role
   */
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    if (!id) {
      throw new BadRequestException('Invalid role ID');
    }

    // Check for name conflicts if updating name (before update)
    if (updateRoleDto.name) {
      const conflictRole = await this.roleRepository.findOne({
        where: {
          id: { [Op.ne]: id as any },
          name: updateRoleDto.name,
        },
        attributes: ['id'], // Optimize: Only fetch id field
      });

      if (conflictRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Optimize: Update directly and check affected rows instead of separate existence check
    const [affectedRows] = await this.roleRepository.update(updateRoleDto, {
      where: { id, is_active: true },
    });

    if (affectedRows === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Fetch updated role
    const updatedRole = await this.roleRepository.findOne({
      where: { id, is_active: true },
    });
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return {
      message: 'Role updated successfully',
      role: updatedRole,
    };
  }

  /**
   * Delete a role
   * @param id - The role ID
   * @returns The deleted role
   */
  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid role ID');
    }

    // Optimize: Update directly and check affected rows instead of separate existence check
    const [affectedRows] = await this.roleRepository.update(
      { is_active: false, deletedAt: new Date() },
      { where: { id, is_active: true } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return {
      message: 'Role deactivated successfully',
      roleId: id,
    };
  }
}
