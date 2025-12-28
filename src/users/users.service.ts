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
import { Phone } from '../phones/entities/phone.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { buildWhereClause, buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { Role } from '../role/entities/role.entity';
import { Title } from '../titles/entities/title.entity';
import { Department } from '../departments/entities/department.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    @InjectModel(Phone)
    private phoneRepository: typeof Phone,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto) {
    const { phones, department_ids, ...userData } = createUserDto;

    // Check if user_number already exists
    const existingUser = await this.userRepository.findOne({
      where: { user_number: userData.user_number },
      attributes: ['id'],
    });

    if (existingUser) {
      throw new ConflictException('User with this user number already exists');
    }

    // Convert date strings to Date objects
    const userDataWithDates = {
      ...userData,
      join_date: userData.join_date ? new Date(userData.join_date) : undefined,
      contract_date: userData.contract_date ? new Date(userData.contract_date) : undefined,
      exit_date: userData.exit_date ? new Date(userData.exit_date) : undefined,
    };

    // Create user with phones and departments
    const user = await this.userRepository.create(userDataWithDates as any);

    // Create phones if provided
    if (phones && phones.length > 0) {
      await this.phoneRepository.bulkCreate(
        phones.map(phone => ({
          number: phone.number,
          company: phone.company,
          current_plan: phone.current_plan,
          legal_owner: phone.legal_owner,
          comment: phone.comment,
          user_id: user.id,
          is_active: phone.is_active ?? true,
        })) as any
      );
    }

    // Associate departments if provided
    if (department_ids && department_ids.length > 0) {
      await user.$set('departments', department_ids);
    }

    // Reload user with relations
    const createdUser = await this.userRepository.findByPk(user.id, {
      include: [
        { model: Role, as: 'role' },
        { model: Title, as: 'title' },
        { model: Phone, as: 'phones' },
        { model: Department, as: 'departments' },
      ],
    });

    return {
      message: 'User created successfully',
      user: createdUser,
    };
  }

  /**
   * Get all users with optional filtering
   */
  async findAll(filterDto?: UserFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where: any = {};

      // Apply filters
      if (filterDto?.user_number) {
        where.user_number = { [Op.iLike]: `%${filterDto.user_number}%` };
      }

      if (filterDto?.name) {
        where.name = { [Op.iLike]: `%${filterDto.name}%` };
      }

      if (filterDto?.work_location) {
        where.work_location = filterDto.work_location;
      }

      if (filterDto?.social_insurance !== undefined) {
        where.social_insurance = filterDto.social_insurance;
      }

      if (filterDto?.medical_insurance !== undefined) {
        where.medical_insurance = filterDto.medical_insurance;
      }

      if (filterDto?.role_id) {
        where.role_id = filterDto.role_id;
      }

      if (filterDto?.title_id) {
        where.title_id = filterDto.title_id;
      }

      // Apply general search
      if (filterDto?.search) {
        const searchWhere = buildSearchClause(filterDto.search, ['user_number', 'name', 'address']);
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
      const include: any[] = [
        { model: Role, as: 'role' },
        { model: Title, as: 'title' },
        { model: Phone, as: 'phones' },
        { model: Department, as: 'departments' },
      ];

      if (filterDto?.department_id) {
        include.push({
          model: Department,
          as: 'departments',
          where: { id: filterDto.department_id },
          required: true,
        });
      }

      const { rows: users, count: total } = await this.userRepository.findAndCountAll({
        where,
        include: include.length > 4 ? include : [
          { model: Role, as: 'role' },
          { model: Title, as: 'title' },
          { model: Phone, as: 'phones' },
          { model: Department, as: 'departments' },
        ],
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
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  /**
   * Get a user by ID
   */
  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findByPk(id, {
      include: [
        { model: Role, as: 'role' },
        { model: Title, as: 'title' },
        { model: Phone, as: 'phones' },
        { model: Department, as: 'departments' },
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      message: 'User retrieved successfully',
      user,
    };
  }

  /**
   * Update a user
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!id) {
      throw new BadRequestException('Invalid user ID');
    }

    const { department_ids, ...updateData } = updateUserDto;

    // Check if user exists
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for user_number conflict if updating
    if (updateData.user_number) {
      const conflictUser = await this.userRepository.findOne({
        where: {
          id: { [Op.ne]: id },
          user_number: updateData.user_number,
        },
        attributes: ['id'],
      });

      if (conflictUser) {
        throw new ConflictException('User with this user number already exists');
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

    // Update user
    await this.userRepository.update(updateDataWithDates, {
      where: { id },
    });

    // Update departments if provided
    if (department_ids !== undefined) {
      await user.$set('departments', department_ids);
    }

    // Fetch updated user
    const updatedUser = await this.userRepository.findByPk(id, {
      include: [
        { model: Role, as: 'role' },
        { model: Title, as: 'title' },
        { model: Phone, as: 'phones' },
        { model: Department, as: 'departments' },
      ],
    });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  /**
   * Soft delete a user
   */
  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Invalid user ID');
    }

    const [affectedRows] = await this.userRepository.update(
      { deletedAt: new Date() },
      { where: { id } }
    );

    if (affectedRows === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      message: 'User deleted successfully',
      userId: id,
    };
  }
}

