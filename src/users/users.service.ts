import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { Role } from '../role/entities/role.entity';
import { Department } from '../departments/entities/department.entity';
import { Image } from '../shared/database/entities/image.entity';
import { RoleName } from '../shared/enums';
import * as crypto from 'crypto';

/**
 * Common includes for user queries to avoid repetition
 */
const getUserIncludes = () => [
  { model: Role, as: 'role', attributes: ['id', 'name'] },
  { model: Department, as: 'departments', attributes: ['id', 'name'], through: { attributes: [] } },
  { 
    model: Image, 
    as: 'images', 
    attributes: ['id', 'image_url', 'owner_type', 'created_at'],
    required: false,
  },
];

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    @InjectModel(Role)
    private roleRepository: typeof Role,
    @InjectModel(Image)
    private imageRepository: typeof Image,
  ) {}

  /**
   * Create a new user
   * Optimized: Parallel validation queries, single user creation, batch department association
   */
  async create(createUserDto: CreateUserDto) {
    const { department_ids, role, password, images, ...userData } = createUserDto;

    // Parallel validation: check user_number, username uniqueness, and get role
    const [existingUserByNumber, existingUserByUsername, userRole] = await Promise.all([
      this.userRepository.findOne({
        where: { user_number: userData.user_number },
        attributes: ['id'],
      }),
      this.userRepository.findOne({
        where: { username: userData.username },
        attributes: ['id'],
      }),
      this.roleRepository.findOne({
        where: { name: role },
        attributes: ['id', 'name'],
      }),
    ]);

    if (existingUserByNumber) {
      throw new ConflictException({
        message: 'User with this user number already exists',
        error: 'Conflict',
        statusCode: 409,
      });
    }

    if (existingUserByUsername) {
      throw new ConflictException({
        message: 'User with this username already exists',
        error: 'Conflict',
        statusCode: 409,
      });
    }

    if (!userRole) {
      throw new NotFoundException({
        message: `Role '${role}' not found. Available roles: admin, user`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    // Verify departments exist if provided
    if (department_ids && department_ids.length > 0) {
      const existingDepartments = await Department.findAll({
        where: { id: department_ids },
        attributes: ['id'],
      });
      if (existingDepartments.length !== department_ids.length) {
        const foundIds = existingDepartments.map(d => d.id);
        const missingIds = department_ids.filter(id => !foundIds.includes(id));
        throw new NotFoundException({
          message: `Department(s) not found: ${missingIds.join(', ')}`,
          error: 'Not Found',
          statusCode: 404,
        });
      }
    }

    // Hash password using SHA-256 (same as auth service)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Convert date strings to Date objects
    const userDataWithDates = {
      ...userData,
      password: hashedPassword,
      role_id: userRole.id,
      join_date: userData.join_date ? new Date(userData.join_date) : undefined,
      contract_date: userData.contract_date ? new Date(userData.contract_date) : undefined,
      exit_date: userData.exit_date ? new Date(userData.exit_date) : undefined,
    };

    // Create user
    const user = await this.userRepository.create(userDataWithDates as any);

    // Associate departments if provided (batch operation)
    if (department_ids && department_ids.length > 0) {
      await user.$set('departments', department_ids);
    }

    // Create images if provided
    if (images && images.length > 0) {
      const imageRecords = images.map(imageUrl => ({
        owner_id: user.id, // Use UUID string directly
        owner_type: 'user' as const,
        image_url: imageUrl,
      })) as any;
      await this.imageRepository.bulkCreate(imageRecords);
    }

    // Reload user with relations in a single query (exclude password from response)
    const createdUser = await this.userRepository.findByPk(user.id, {
      include: getUserIncludes(),
      attributes: { exclude: ['password'] },
    });

    return {
      message: 'User created successfully',
      user: createdUser,
    };
  }

  /**
   * Get all users with optional filtering
   * Optimized: Single query with proper includes, distinct count
   */
  async findAll(filterDto?: UserFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where: any = {};

      // Get role_id if role filter is provided (optimized: single query upfront)
      let roleIdForFilter: string | null = null;
      if (filterDto?.role) {
        const role = await this.roleRepository.findOne({
          where: { name: filterDto.role },
          attributes: ['id'],
        });
        if (!role) {
          // If role doesn't exist, return empty result immediately
          return {
            message: 'Users retrieved successfully',
            users: [],
            count: 0,
            total: 0,
            page: 1,
            limit,
            totalPages: 0,
          };
        }
        roleIdForFilter = role.id;
      }

      // Apply filters (optimized: build where clause efficiently)
      if (filterDto?.user_number) {
        where.user_number = { [Op.iLike]: `%${filterDto.user_number}%` };
      }

      if (filterDto?.name) {
        where.name = { [Op.iLike]: `%${filterDto.name}%` };
      }

      if (filterDto?.work_location) {
        where.work_location = filterDto.work_location;
      }

      // Boolean filters - simple string to boolean conversion
      if (filterDto?.social_insurance) {
        where.social_insurance = filterDto.social_insurance === 'true';
      }

      if (filterDto?.medical_insurance) {
        where.medical_insurance = filterDto.medical_insurance === 'true';
      }

      // Role filter - use pre-fetched role_id
      if (roleIdForFilter) {
        where.role_id = roleIdForFilter;
      }

      if (filterDto?.title) {
        where.title = { [Op.iLike]: `%${filterDto.title}%` };
      }

      // Apply general search
      if (filterDto?.search) {
        const searchWhere = buildSearchClause(filterDto.search, ['user_number', 'name', 'address', 'title']);
        if (searchWhere) {
          Object.assign(where, searchWhere);
        }
      }

      // Apply join date range
      if (filterDto?.joinDateFrom || filterDto?.joinDateTo) {
        const dateRangeWhere = buildDateRangeClause(
          filterDto.joinDateFrom,
          filterDto.joinDateTo,
          'join_date'
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

      // Department filter (requires join)
      let include: any[] = getUserIncludes();
      if (filterDto?.department_id) {
        include = [
          { model: Role, as: 'role', attributes: ['id', 'name'] },
          {
            model: Department,
            as: 'departments',
            where: { id: filterDto.department_id },
            required: true,
            attributes: ['id', 'name'],
            through: { attributes: [] },
          },
        ];
      }

      // Single optimized query with all includes (exclude password from response)
      const { rows: users, count: total } = await this.userRepository.findAndCountAll({
        where,
        include,
        attributes: { exclude: ['password'] },
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true, // Important for count with joins
      });

      const pagination = getPaginationMetadata(total, page, limit);

      return {
        message: 'Users retrieved successfully',
        users,
        count: users.length,
        ...pagination,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  /**
   * Get a user by ID
   * Optimized: Single query with all relations
   */
  async findOne(id: string) {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException({
        message: 'Invalid user ID format. Expected UUID format.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    const user = await this.userRepository.findByPk(id, {
      include: getUserIncludes(),
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new NotFoundException({
        message: `User with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return {
      message: 'User retrieved successfully',
      user,
    };
  }

  /**
   * Update a user
   * Optimized: Check existence and conflict in parallel, single update query
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException({
        message: 'Invalid user ID format. Expected UUID format.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    const { department_ids, ...updateData } = updateUserDto;

    // Check if user exists and check for conflicts in parallel
    const [user, conflictUser] = await Promise.all([
      this.userRepository.findByPk(id, { attributes: ['id'] }),
      updateData.user_number ? this.userRepository.findOne({
        where: {
          id: { [Op.ne]: id },
          user_number: updateData.user_number,
        },
        attributes: ['id'],
      }) : Promise.resolve(null),
    ]);

    if (!user) {
      throw new NotFoundException({
        message: `User with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    if (conflictUser) {
      throw new ConflictException({
        message: 'User with this user number already exists',
        error: 'Conflict',
        statusCode: 409,
      });
    }

    // Convert date strings to Date objects if present
    const updateDataWithDates: any = { ...updateData };
    if (updateData.join_date) {
      updateDataWithDates.join_date = new Date(updateData.join_date);
    }
    if (updateData.contract_date) {
      updateDataWithDates.contract_date = new Date(updateData.contract_date);
    }
    if (updateData.exit_date) {
      updateDataWithDates.exit_date = new Date(updateData.exit_date);
    }

    // Update user and departments in parallel
    await Promise.all([
      this.userRepository.update(updateDataWithDates, { where: { id } }),
      department_ids !== undefined ? user.$set('departments', department_ids) : Promise.resolve(),
    ]);

    // Fetch updated user with relations (exclude password from response)
    const updatedUser = await this.userRepository.findByPk(id, {
      include: getUserIncludes(),
      attributes: { exclude: ['password'] },
    });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  /**
   * Soft delete a user
   * Optimized: Single update query
   */
  async remove(id: string) {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException({
        message: 'Invalid user ID format. Expected UUID format.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    const [affectedRows] = await this.userRepository.update(
      { deletedAt: new Date(), is_active: false },
      { where: { id } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException({
        message: `User with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return {
      message: 'User deleted successfully',
      userId: id,
    };
  }
}
