import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Op } from 'sequelize';
import * as crypto from 'crypto';
import { Role } from '../role/entities/role.entity';
import { RoleName, ResponseMessage, ErrorMessage } from '../shared/enums';

/**
 * AuthService is a service that provides methods to manage authentication
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    @InjectModel(Role)
    private roleRepository: typeof Role,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   * @param RegisterDto - The user data
   * @returns The registered user
   */
  /**
   * Register a new user
   * Optimized: Parallel validation queries, single user creation
   */
  async register(RegisterDto: RegisterDto) {
    const { 
      user_number, 
      name, 
      username, 
      password, 
      address, 
      work_location, 
      join_date, 
      social_insurance, 
      medical_insurance, 
      title, 
      departments 
    } = RegisterDto;

    // Parallel validation queries for better performance
    const [existingUserByUsername, existingUserByNumber, userRole] = await Promise.all([
      this.userRepository.findOne({
        where: { username },
        attributes: ['id'],
      }),
      this.userRepository.findOne({
        where: { user_number },
        attributes: ['id'],
      }),
      this.roleRepository.findOne({ 
        where: { name: RoleName.USER },
        attributes: ['id', 'name'],
      }),
    ]);

    if (existingUserByUsername) {
      throw new ConflictException({
        message: ErrorMessage.USERNAME_EXISTS,
        error: 'Conflict',
        statusCode: 409,
      });
    }

    if (existingUserByNumber) {
      throw new ConflictException({
        message: ErrorMessage.USER_NUMBER_EXISTS,
        error: 'Conflict',
        statusCode: 409,
      });
    }

    if (!userRole) {
      throw new ConflictException({
        message: ErrorMessage.DEFAULT_USER_ROLE_NOT_FOUND,
        error: 'Conflict',
        statusCode: 409,
      });
    }

    // Verify departments exist if provided - cast UUIDs properly
    if (departments && departments.length > 0) {
      const { Department } = await import('../departments/entities/department.entity');
      const { Sequelize } = await import('sequelize');
      // Cast each UUID string to UUID type using Sequelize.cast
      // UUIDs validated by DTO @IsUUID decorator
      const existingDepartments = await Department.findAll({
        where: {
          id: {
            [Op.in]: departments.map(id => 
              Sequelize.cast(id, 'UUID')
            )
          }
        },
        attributes: ['id'],
      });
      if (existingDepartments.length !== departments.length) {
        const foundIds = existingDepartments.map(d => d.id);
        const missingIds = departments.filter(id => !foundIds.includes(id));
        throw new ConflictException({
          message: `Department(s) not found: ${missingIds.join(', ')}`,
          error: 'Not Found',
          statusCode: 404,
        });
      }
    }

    // Hash password using SHA-256
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Create new user
    const newUser = await this.userRepository.create({
      user_number,
      username,
      password: hashedPassword,
      name,
      address,
      work_location,
      social_insurance,
      medical_insurance,
      join_date: new Date(join_date),
      role_id: userRole.id,
      title: title || null,
    } as any);

    // Associate departments if provided
    if (departments && departments.length > 0) {
      await newUser.$set('departments', departments);
    }

    // Fetch created user with relations
    const { Department } = await import('../departments/entities/department.entity');
    
    const createdUser = await this.userRepository.findByPk(newUser.id, {
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name'] },
        { model: Department, as: 'departments', attributes: ['id', 'name'], through: { attributes: [] } },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!createdUser) {
      throw new ConflictException({
        message: 'Failed to create user',
        error: 'Internal Server Error',
        statusCode: 500,
      });
    }

    return {
      message: ResponseMessage.USER_REGISTERED,
      user: {
        id: createdUser.id,
        user_number: createdUser.user_number,
        username: createdUser.username,
        name: createdUser.name,
        address: createdUser.address,
        work_location: createdUser.work_location,
        social_insurance: createdUser.social_insurance,
        medical_insurance: createdUser.medical_insurance,
        join_date: createdUser.join_date,
        role_id: createdUser.role_id,
        role_name: createdUser.role?.name,
        title: createdUser.title,
        departments: createdUser.departments?.map(dept => ({
          id: dept.id,
          name: dept.name,
        })),
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      },
    };
  }

  /**
   * Login a user
   * @param loginDto - The user data
   * @returns The logged in user with tokens
   */
  async login(loginDto: LoginDto) {
    if (!loginDto) {
      throw new UnauthorizedException(ErrorMessage.INVALID_CREDENTIALS);
    }
    const { username, password } = loginDto;

    // Find user by username
    const user = await this.userRepository.findOne({
      where: { username },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new UnauthorizedException({
        message: ErrorMessage.INVALID_CREDENTIALS,
        error: 'Unauthorized',
        statusCode: 401,
      });
    }

    // Verify password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      throw new UnauthorizedException({
        message: ErrorMessage.INVALID_CREDENTIALS,
        error: 'Unauthorized',
        statusCode: 401,
      });
    }

    // Check if user is active (not soft deleted)
    if (user.deletedAt) {
      throw new UnauthorizedException({
        message: ErrorMessage.USER_NOT_ACTIVE,
        error: 'Unauthorized',
        statusCode: 401,
      });
    }

    // Generate JWT tokens
    const payload = {
      sub: user.id,
      user_number: user.user_number,
      name: user.name,
      role_id: user.role_id,
      role_name: user.role?.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '24h',
    });

    const refreshTokenPayload = {
      ...payload,
      type: 'refresh',
    };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      message: ResponseMessage.USER_LOGGED_IN,
      user: {
        id: user.id,
        user_number: user.user_number,
        username: user.username,
        name: user.name,
        role_id: user.role_id,
        role_name: user.role?.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   * Implements refresh token rotation for enhanced security
   * @param refreshTokenDto - The refresh token data
   * @returns New access token and new refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Validate token type
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find user by ID from token
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        include: [{ model: Role, as: 'role' }],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const newPayload = {
        sub: user.id as string,
        user_number: user.user_number,
        name: user.name,
        role_id: user.role_id as string | number,
        role_name: user.role?.name,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '24h',
      });

      // Generate new refresh token (rotation)
      const newRefreshTokenPayload = {
        ...newPayload,
        type: 'refresh',
      };
      const newRefreshToken = this.jwtService.sign(newRefreshTokenPayload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      });

      // Note: Refresh token storage needs to be handled differently for new schema

      return {
        message: 'Token refreshed successfully',
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Handle JWT verification errors
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
