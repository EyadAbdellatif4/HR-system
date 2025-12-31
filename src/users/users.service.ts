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
import { Op, Sequelize } from 'sequelize';
import { buildDateRangeClause, buildOrderClause, buildSearchClause } from '../shared/utils/filter.util';
import { calculateOffset, getPaginationParams, getPaginationMetadata } from '../shared/utils/pagination.util';
import { Role } from '../role/entities/role.entity';
import { Department } from '../departments/entities/department.entity';
import { UserDepartment } from '../shared/database/entities/user-department.entity';
import { AttachmentUploadService } from '../shared/storage/attachment-upload.service';
import { getEntityAttachments, getBatchEntityAttachments } from '../shared/utils/attachment.util';
import { softDeleteEntityAttachments } from '../shared/utils/soft-delete.util';
import { hashPassword } from '../shared/utils/password.util';
import { withTransaction } from '../shared/utils/transaction.util';

const getUserIncludes = () => [
  { model: Role, as: 'role', attributes: ['id', 'name'] },
  { model: Department, as: 'departments', attributes: ['id', 'name'], through: { attributes: [] } },
];

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

  async create(createUserDto: CreateUserDto, files?: Express.Multer.File[]) {
    const { department_ids, role, password, personal_phone, ...userData } = createUserDto;
    const departmentIds = department_ids && department_ids.length > 0 ? department_ids : undefined;

    return withTransaction(this.sequelize, async (transaction) => {
      await this.validateUserUniqueness(userData.user_number, userData.username, transaction);
      const userRole = await this.validateRole(role, transaction);
      await this.validateDepartments(departmentIds, transaction);

      const normalizedData = await this.normalizeUserData(userData, password, personal_phone, userRole.id);
      const user = await this.userRepository.create(normalizedData as any, { transaction });

      if (departmentIds && departmentIds.length > 0) {
        await this.createUserDepartments(user.id, departmentIds, transaction);
      }

      if (files && files.length > 0) {
        await this.handleFileUploads(files, user.id);
      }

      return this.buildUserResponse(user.id);
    });
  }

  async findAll(filterDto?: UserFilterDto) {
    try {
      const { page, limit } = getPaginationParams(filterDto?.page, filterDto?.limit);
      const offset = calculateOffset(page, limit);

      const where = await this.buildUserWhereClause(filterDto);
      const include = this.buildUserIncludes(filterDto?.department_id);
      const order = buildOrderClause(filterDto?.sortBy || 'createdAt', filterDto?.sortOrder || 'DESC');

      const { rows: users, count: total } = await this.userRepository.findAndCountAll({
        where,
        include,
        attributes: { exclude: ['password'] },
        order: order || [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      if (users.length > 0) {
        await this.attachUserAttachments(users);
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

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, is_active: true },
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

    const attachments = await getEntityAttachments(id, 'users');
    const userResponse = user.toJSON();
    userResponse.attachments = attachments.map(att => att.toJSON());

    return {
      message: 'User retrieved successfully',
      user: userResponse,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, files?: Express.Multer.File[]) {
    const { department_ids, ...updateData } = updateUserDto;

    const [user, conflictUser] = await Promise.all([
      this.userRepository.findOne({ where: { id, is_active: true }, attributes: ['id'] }),
      updateData.user_number ? this.userRepository.findOne({
        where: {
          id: { [Op.ne]: id },
          user_number: updateData.user_number,
          is_active: true,
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

    return withTransaction(this.sequelize, async (transaction) => {
      if (department_ids !== undefined && department_ids.length > 0) {
        await this.validateDepartments(department_ids, transaction);
      }

      const normalizedUpdateData = this.normalizeUpdateData(updateData);
      await this.userRepository.update(normalizedUpdateData, { where: { id }, transaction });

      if (department_ids !== undefined) {
        await this.updateUserDepartments(id, department_ids, transaction);
      }

      if (files && files.length > 0) {
        await softDeleteEntityAttachments(id, 'users', transaction);
      }

      if (files && files.length > 0) {
        await this.handleFileUploads(files, id);
      }

      return this.buildUserResponse(id);
    });
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, is_active: true },
      attributes: ['id'],
    });

    if (!user) {
      throw new NotFoundException({
        message: `User with ID ${id} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return withTransaction(this.sequelize, async (transaction) => {
      await this.userRepository.update(
        { deletedAt: new Date(), is_active: false },
        { where: { id, is_active: true }, transaction }
      );

      await softDeleteEntityAttachments(id, 'users', transaction);

      return {
        message: 'User deleted successfully',
        userId: id,
      };
    });
  }

  private async validateUserUniqueness(
    userNumber: string,
    username: string | null,
    transaction?: any
  ): Promise<void> {
    const [existingUserByNumber, existingUserByUsername] = await Promise.all([
      this.userRepository.findOne({
        where: { user_number: userNumber },
        attributes: ['id'],
        transaction,
      }),
      username ? this.userRepository.findOne({
        where: { username },
        attributes: ['id'],
        transaction,
      }) : Promise.resolve(null),
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
  }

  private async validateRole(roleName: string, transaction?: any): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      attributes: ['id', 'name'],
      transaction,
    });

    if (!role) {
      throw new NotFoundException({
        message: `Role '${roleName}' not found. Available roles: admin, user`,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    return role;
  }

  private async validateDepartments(departmentIds: string[] | undefined, transaction?: any): Promise<void> {
    if (!departmentIds || departmentIds.length === 0) {
      return;
    }

    const existingDepartments = await Department.findAll({
      where: {
        id: {
          [Op.in]: departmentIds.map(id => Sequelize.cast(id, 'UUID'))
        },
        is_active: true,
      },
      attributes: ['id'],
      transaction,
    });

    if (existingDepartments.length !== departmentIds.length) {
      const foundIdsSet = new Set(existingDepartments.map(d => d.id));
      const missingIds = departmentIds.filter(id => !foundIdsSet.has(id));
      throw new NotFoundException({
        message: `Department(s) not found: ${missingIds.join(', ')}`,
        error: 'Not Found',
        statusCode: 404,
      });
    }
  }

  private async normalizeUserData(
    userData: any,
    password: string,
    personalPhone: string[] | undefined,
    roleId: string
  ): Promise<any> {
    const hashedPassword = await hashPassword(password);
    
    const socialInsurance = this.normalizeBoolean(userData.social_insurance);
    const medicalInsurance = this.normalizeBoolean(userData.medical_insurance);

    return {
      ...userData,
      password: hashedPassword,
      role_id: roleId,
      personal_phone: personalPhone && personalPhone.length > 0 ? personalPhone : null,
      social_insurance: socialInsurance,
      medical_insurance: medicalInsurance,
      join_date: userData.join_date ? new Date(userData.join_date) : undefined,
      contract_date: userData.contract_date ? new Date(userData.contract_date) : undefined,
      exit_date: userData.exit_date ? new Date(userData.exit_date) : undefined,
    };
  }

  private normalizeUpdateData(updateData: any): any {
    const normalized: any = { ...updateData };

    if (updateData.join_date) {
      normalized.join_date = new Date(updateData.join_date);
    }
    if (updateData.contract_date) {
      normalized.contract_date = new Date(updateData.contract_date);
    }
    if (updateData.exit_date) {
      normalized.exit_date = new Date(updateData.exit_date);
    }

    if (updateData.social_insurance !== undefined) {
      normalized.social_insurance = this.normalizeBoolean(updateData.social_insurance);
    }

    if (updateData.medical_insurance !== undefined) {
      normalized.medical_insurance = this.normalizeBoolean(updateData.medical_insurance);
    }

    return normalized;
  }

  private async createUserDepartments(
    userId: string,
    departmentIds: string[],
    transaction: any
  ): Promise<void> {
    const userDepartmentRecords = departmentIds.map(deptId => ({
      user_id: userId,
      department_id: deptId,
    }));
    await UserDepartment.bulkCreate(userDepartmentRecords as any, { transaction });
  }

  private async updateUserDepartments(
    userId: string,
    departmentIds: string[],
    transaction: any
  ): Promise<void> {
    await UserDepartment.destroy({
      where: { user_id: userId },
      transaction,
    });

    if (departmentIds.length > 0) {
      await this.createUserDepartments(userId, departmentIds, transaction);
    }
  }

  private async buildUserWhereClause(filterDto?: UserFilterDto): Promise<any> {
    const where: any = { is_active: true };

    if (filterDto?.user_number) {
      where.user_number = { [Op.iLike]: `%${filterDto.user_number}%` };
    }

    if (filterDto?.name) {
      where.name = { [Op.iLike]: `%${filterDto.name}%` };
    }

    if (filterDto?.work_location) {
      where.work_location = filterDto.work_location;
    }

    if (filterDto?.social_insurance !== undefined && filterDto?.social_insurance !== null) {
      where.social_insurance = this.normalizeBoolean(filterDto.social_insurance);
    }

    if (filterDto?.medical_insurance !== undefined && filterDto?.medical_insurance !== null) {
      where.medical_insurance = this.normalizeBoolean(filterDto.medical_insurance);
    }

    if (filterDto?.title) {
      where.title = { [Op.iLike]: `%${filterDto.title}%` };
    }

    if (filterDto?.search) {
      const searchWhere = buildSearchClause(filterDto.search, ['user_number', 'name', 'address', 'title']);
      if (searchWhere) {
        Object.assign(where, searchWhere);
      }
    }

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

    return where;
  }

  private async applyRoleFilter(where: any, roleName: string): Promise<any> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName, is_active: true },
      attributes: ['id'],
    });

    if (!role) {
      return { ...where, id: { [Op.eq]: null } };
    }

    where.role_id = role.id;
    return where;
  }

  private buildUserIncludes(departmentId?: string): any[] {
    if (departmentId) {
      return [
        { model: Role, as: 'role', attributes: ['id', 'name'] },
        {
          model: Department,
          as: 'departments',
          where: { id: departmentId },
          required: true,
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ];
    }
    return getUserIncludes();
  }

  private async attachUserAttachments(users: User[]): Promise<void> {
    const userIds = users.map(u => u.id);
    const allAttachments = await getBatchEntityAttachments(userIds, 'users');

    const attachmentsByUserId = new Map<string, typeof allAttachments>();
    allAttachments.forEach(attachment => {
      const userId = attachment.entity_id;
      if (!attachmentsByUserId.has(userId)) {
        attachmentsByUserId.set(userId, []);
      }
      attachmentsByUserId.get(userId)!.push(attachment);
    });

    users.forEach(user => {
      const userAttachments = attachmentsByUserId.get(user.id) || [];
      (user as any).attachments = userAttachments.map(att => att.toJSON());
    });
  }

  private async buildUserResponse(userId: string) {
    const user = await this.userRepository.findByPk(userId, {
      include: getUserIncludes(),
      attributes: { exclude: ['password'] },
    });

    const attachments = await getEntityAttachments(userId, 'users');
    const userResponse = user ? user.toJSON() : null;
    
    if (userResponse) {
      userResponse.attachments = attachments.map(att => att.toJSON());
    }

    return {
      message: user ? 'User updated successfully' : 'User created successfully',
      user: userResponse,
    };
  }

  private async handleFileUploads(files: Express.Multer.File[], userId: string): Promise<void> {
    try {
      const savedAttachments = await this.attachmentUploadService.uploadAndSaveAttachments(files, userId, 'users');
      if (!savedAttachments || savedAttachments.length === 0) {
        console.error('Warning: Files uploaded but no attachment records created');
      }
    } catch (fileError) {
      console.error('File upload/attachment save failed:', fileError);
    }
  }

  private normalizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      return lowerValue === 'true' || lowerValue === '1';
    }
    return false;
  }
}
