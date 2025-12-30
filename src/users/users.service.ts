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
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { Role } from '../role/entities/role.entity';
import { Department } from '../departments/entities/department.entity';
import { Attachment } from '../shared/database/entities/attachment.entity';
import { UserDepartment } from '../shared/database/entities/user-department.entity';
import { AttachmentUploadService } from '../shared/storage/attachment-upload.service';
import { RoleName } from '../shared/enums';
import * as crypto from 'crypto';

/**
 * Common includes for user queries to avoid repetition
 * Note: Attachments are fetched separately due to polymorphic relationship
 */
const getUserIncludes = () => [
  { model: Role, as: 'role', attributes: ['id', 'name'] },
  { model: Department, as: 'departments', attributes: ['id', 'name'], through: { attributes: [] } },
];

/**
 * Fetch attachments for a user (separate query for polymorphic relationship)
 * Time Complexity: O(1) - indexed lookup on entity_id and entity_type
 */
async function getUserAttachments(userId: string): Promise<Attachment[]> {
  return await Attachment.findAll({
    where: {
      entity_id: userId, // entity_id is VARCHAR, userId is UUID string - PostgreSQL handles conversion
      entity_type: 'users',
    },
    attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at'],
    order: [['created_at', 'DESC']],
  });
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    @InjectModel(Role)
    private roleRepository: typeof Role,
    @InjectConnection()
    private sequelize: Sequelize,
    private attachmentUploadService: AttachmentUploadService,
  ) {}

  /**
   * Create a new user
   * Optimized: O(1) validations, single transaction, batch operations
   * Time Complexity: O(1) for validations, O(n) for department associations where n = number of departments
   */
  async create(createUserDto: CreateUserDto, files?: Express.Multer.File[]) {
    const { department_ids, role, password, personal_phone, ...userData } = createUserDto;
    
    // Normalize department_ids: undefined if empty array
    const departmentIds = department_ids && department_ids.length > 0 ? department_ids : undefined;

    // Start transaction for atomicity
    const transaction = await this.sequelize.transaction();

    try {
      // Parallel validations: O(1) - all use indexed lookups
      const [existingUserByNumber, existingUserByUsername, userRole] = await Promise.all([
        this.userRepository.findOne({
          where: { user_number: userData.user_number },
          attributes: ['id'],
          transaction,
        }),
        this.userRepository.findOne({
          where: { username: userData.username },
          attributes: ['id'],
          transaction,
        }),
        this.roleRepository.findOne({
          where: { name: role },
          attributes: ['id', 'name'],
          transaction,
        }),
      ]);

      // Early validation failures - O(1)
      if (existingUserByNumber) {
        await transaction.rollback();
        throw new ConflictException({
          message: 'User with this user number already exists',
          error: 'Conflict',
          statusCode: 409,
        });
      }

      if (existingUserByUsername) {
        await transaction.rollback();
        throw new ConflictException({
          message: 'User with this username already exists',
          error: 'Conflict',
          statusCode: 409,
        });
      }

      if (!userRole) {
        await transaction.rollback();
        throw new NotFoundException({
          message: `Role '${role}' not found. Available roles: admin, user`,
          error: 'Not Found',
          statusCode: 404,
        });
      }

      // Validate departments if provided: O(n) where n = number of department_ids
      // Use Sequelize.where with cast to ensure proper UUID type handling in PostgreSQL
      if (departmentIds && departmentIds.length > 0) {
        // Cast each UUID string to UUID type using Sequelize.cast
        // UUIDs are validated by DTO @IsUUID decorator
        const existingDepartments = await Department.findAll({
          where: {
            id: {
              [Op.in]: departmentIds.map(id => 
                Sequelize.cast(id, 'UUID')
              )
            }
          },
          attributes: ['id'],
          transaction,
        });
        
        // O(n) comparison - but n is typically small (< 10)
        if (existingDepartments.length !== departmentIds.length) {
          await transaction.rollback();
          const foundIdsSet = new Set(existingDepartments.map(d => d.id));
          const missingIds = departmentIds.filter(id => !foundIdsSet.has(id));
          throw new NotFoundException({
            message: `Department(s) not found: ${missingIds.join(', ')}`,
            error: 'Not Found',
            statusCode: 404,
          });
        }
      }

      // Hash password: O(1)
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // Prepare user data: O(1)
      const userDataWithDates = {
        ...userData,
        password: hashedPassword,
        role_id: userRole.id,
        personal_phone: personal_phone && personal_phone.length > 0 ? personal_phone : null,
        join_date: userData.join_date ? new Date(userData.join_date) : undefined,
        contract_date: userData.contract_date ? new Date(userData.contract_date) : undefined,
        exit_date: userData.exit_date ? new Date(userData.exit_date) : undefined,
      };

      // Create user: O(1)
      const user = await this.userRepository.create(userDataWithDates as any, { transaction });

      // Batch create department associations: O(n) where n = number of departments
      if (departmentIds && departmentIds.length > 0) {
        const userDepartmentRecords = departmentIds.map(deptId => ({
          user_id: user.id,
          department_id: deptId,
        }));
        await UserDepartment.bulkCreate(userDepartmentRecords as any, { transaction });
      }

      // Commit transaction: O(1)
      await transaction.commit();

      // File uploads (non-blocking, outside transaction): O(m) where m = number of files
      if (files && files.length > 0) {
        try {
          const savedAttachments = await this.attachmentUploadService.uploadAndSaveAttachments(files, user.id, 'users');
          if (!savedAttachments || savedAttachments.length === 0) {
            console.error('Warning: Files uploaded but no attachment records created');
          }
        } catch (fileError) {
          console.error('File upload/attachment save failed:', fileError);
          // Don't throw - user is already created, just log the error
        }
      }

      // Fetch user with relations: O(1) with proper indexes
      const createdUser = await this.userRepository.findByPk(user.id, {
        include: getUserIncludes(),
        attributes: { exclude: ['password'] },
      });

      // Fetch attachments separately (polymorphic relationship): O(1)
      const attachments = await getUserAttachments(user.id);
      
      // Convert user to plain object and attach attachments for proper serialization
      const userResponse = createdUser ? createdUser.toJSON() : null;
      if (userResponse) {
        userResponse.attachments = attachments.map(att => att.toJSON());
      }

      return {
        message: 'User created successfully',
        user: userResponse,
      };
    } catch (error) {
      // Rollback on any error
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // Ignore rollback errors
      }
      throw error;
    }
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

      // Boolean filters - already transformed by TransformBoolean decorator
      if (filterDto?.social_insurance !== undefined) {
        where.social_insurance = filterDto.social_insurance;
      }

      if (filterDto?.medical_insurance !== undefined) {
        where.medical_insurance = filterDto.medical_insurance;
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

      // Fetch attachments for all users in parallel: O(n) where n = number of users
      // This is more efficient than N+1 queries
      if (users.length > 0) {
        const userIds = users.map(u => u.id);
        const allAttachments = await Attachment.findAll({
          where: {
            entity_id: { [Op.in]: userIds },
            entity_type: 'users',
          },
          attributes: ['id', 'path_URL', 'name', 'type', 'extension', 'entity_type', 'created_at', 'entity_id'],
          order: [['created_at', 'DESC']],
        });

        // Group attachments by user_id
        const attachmentsByUserId = new Map<string, Attachment[]>();
        allAttachments.forEach(attachment => {
          const userId = attachment.entity_id;
          if (!attachmentsByUserId.has(userId)) {
            attachmentsByUserId.set(userId, []);
          }
          attachmentsByUserId.get(userId)!.push(attachment);
        });

        // Attach attachments to each user
        users.forEach(user => {
          (user as any).attachments = attachmentsByUserId.get(user.id) || [];
        });
      }

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
   * Optimized: User query + separate attachment query
   * Note: UUID validation is handled by ParseUUIDPipe in controller
   */
  async findOne(id: string) {
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

    // Fetch attachments separately (polymorphic relationship): O(1)
    const attachments = await getUserAttachments(id);
    
    // Convert to plain object and attach attachments for proper serialization
    const userResponse = user.toJSON();
    userResponse.attachments = attachments.map(att => att.toJSON());

    return {
      message: 'User retrieved successfully',
      user: userResponse,
    };
  }

  /**
   * Update a user
   * Optimized: Check existence and conflict in parallel, single update query
   * Note: UUID validation is handled by ParseUUIDPipe in controller
   */
  async update(id: string, updateUserDto: UpdateUserDto) {

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

    // Start transaction
    const transaction = await this.sequelize.transaction();

    try {
      // Verify departments exist if provided - cast UUIDs properly
      if (department_ids !== undefined && department_ids.length > 0) {
        // Cast each UUID string to UUID type using Sequelize.cast
        // UUIDs validated by DTO @IsUUID decorator
        const existingDepartments = await Department.findAll({
          where: {
            id: {
              [Op.in]: department_ids.map(id => 
                Sequelize.cast(id, 'UUID')
              )
            }
          },
          attributes: ['id'],
          transaction,
        });
        if (existingDepartments.length !== department_ids.length) {
          await transaction.rollback();
          const foundIdsSet = new Set(existingDepartments.map(d => d.id));
          const missingIds = department_ids.filter(id => !foundIdsSet.has(id));
          throw new NotFoundException({
            message: `Department(s) not found: ${missingIds.join(', ')}`,
            error: 'Not Found',
            statusCode: 404,
          });
        }
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

      // Update user within transaction
      await this.userRepository.update(updateDataWithDates, { where: { id }, transaction });

      // Update departments if provided - use bulk operations to avoid UUID comparison issues
      if (department_ids !== undefined) {
        // Remove all existing associations
        await UserDepartment.destroy({
          where: { user_id: id },
          transaction,
        });
        // Add new associations if any
        if (department_ids.length > 0) {
          const userDepartmentRecords = department_ids.map(deptId => ({
            user_id: id,
            department_id: deptId,
          }));
          await UserDepartment.bulkCreate(userDepartmentRecords as any, { transaction });
        }
      }

      // Commit transaction
      await transaction.commit();
    } catch (error) {
      // Rollback transaction on any error
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // Transaction might already be rolled back, ignore
      }
      // Re-throw the error so NestJS can handle it
      throw error;
    }

    // Fetch updated user with relations (exclude password from response)
    const updatedUser = await this.userRepository.findByPk(id, {
      include: getUserIncludes(),
      attributes: { exclude: ['password'] },
    });

    // Fetch attachments separately (polymorphic relationship): O(1)
    const attachments = await getUserAttachments(id);
    
    // Convert to plain object and attach attachments for proper serialization
    const userResponse = updatedUser ? updatedUser.toJSON() : null;
    if (userResponse) {
      userResponse.attachments = attachments.map(att => att.toJSON());
    }

    return {
      message: 'User updated successfully',
      user: userResponse,
    };
  }

  /**
   * Soft delete a user
   * Optimized: Single update query
   * Note: UUID validation is handled by ParseUUIDPipe in controller
   */
  async remove(id: string) {

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
