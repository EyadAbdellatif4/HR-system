import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleFilterDto } from './dto/role-filter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleName } from '../shared/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { 
  CreateRoleResponseDto, 
  FindAllRolesResponseDto, 
  FindOneRoleResponseDto, 
  UpdateRoleResponseDto, 
  DeleteRoleResponseDto 
} from './dto/role-response.dto';
import { 
  ValidationErrorDto, 
  UnauthorizedErrorDto, 
  ForbiddenErrorDto, 
  NotFoundErrorDto, 
  ConflictErrorDto,
  InternalServerErrorDto 
} from '../shared/dto/error-response.dto';


/**
 * RoleController is a controller that handles role-related requests
 */
@Controller('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Roles(RoleName.ADMIN)
@ApiTags('Roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Create a new role (admin only)
   * @param createRoleDto - The role data
   * @returns The created role
   */
  @Post()
  @ApiOperation({ 
    summary: 'Create a new role',
    description: 'Creates a new role with the provided information. Role name must be unique.'
  })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: CreateRoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid input data', type: ValidationErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token', type: UnauthorizedErrorDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required', type: ForbiddenErrorDto })
  @ApiResponse({ status: 409, description: 'Conflict - Role name already exists', type: ConflictErrorDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: InternalServerErrorDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  /**
   * Get all roles (admin only)
   * @returns The list of roles
   */
  @Get()
  @ApiOperation({ 
    summary: 'Get all roles',
    description: 'Retrieves all active roles in the system. Supports filtering by name, status, and date range.'
  })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: FindAllRolesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token', type: UnauthorizedErrorDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required', type: ForbiddenErrorDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: InternalServerErrorDto })
  async findAll(@Query(ValidationPipe) filterDto: RoleFilterDto) {
    return this.roleService.findAll(filterDto);
  }

  /**
   * Get role by ID (admin only)
   * @param id - The role ID
   * @returns The role
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a role by ID',
    description: 'Retrieves a specific role by its UUID.'
  })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully', type: FindOneRoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid UUID format', type: ValidationErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token', type: UnauthorizedErrorDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required', type: ForbiddenErrorDto })
  @ApiResponse({ status: 404, description: 'Not Found - Role not found', type: NotFoundErrorDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: InternalServerErrorDto })
  @ApiParam({ name: 'id', type: 'string', description: 'The role UUID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  /**
   * Update role (admin only)
   * @param id - The role ID
   * @param updateRoleDto - The role data
   * @returns The updated role
   */
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a role',
    description: 'Updates an existing role with new information.'
  })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: UpdateRoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid input data or UUID format', type: ValidationErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token', type: UnauthorizedErrorDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required', type: ForbiddenErrorDto })
  @ApiResponse({ status: 404, description: 'Not Found - Role not found', type: NotFoundErrorDto })
  @ApiResponse({ status: 409, description: 'Conflict - Role name already exists', type: ConflictErrorDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: InternalServerErrorDto })
  @ApiParam({ name: 'id', type: 'string', description: 'The role UUID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  async update(@Param('id') id: string, @Body(ValidationPipe) updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  /**
   * Delete role (admin only)
   * @param id - The role ID
   * @returns The deleted role
   */
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a role',
    description: 'Soft deletes a role by setting is_active to false.'
  })
  @ApiResponse({ status: 200, description: 'Role deleted successfully', type: DeleteRoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid UUID format', type: ValidationErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token', type: UnauthorizedErrorDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required', type: ForbiddenErrorDto })
  @ApiResponse({ status: 404, description: 'Not Found - Role not found', type: NotFoundErrorDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: InternalServerErrorDto })
  @ApiParam({ name: 'id', type: 'string', description: 'The role UUID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
