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
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleName } from '../shared/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { multerConfig } from '../shared/storage/multer.config';

@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Roles(RoleName.ADMIN)
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Creates a new user with username, password, and other information. Username must be a valid email and unique. Password will be hashed before storage. Role can be "admin" or "user". Can include personal phone numbers, departments, and attachment files (up to 10 files). Files will be stored locally.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid input data or file upload error' })
  @ApiResponse({ status: 404, description: 'Role or department not found' })
  @ApiResponse({ status: 409, description: 'User number or username already exists' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    console.log(createUserDto, "createUserDto");
    return this.usersService.create(createUserDto, files);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieves all users with optional filtering and pagination. Supports filtering by user number, name, work location, social/medical insurance (boolean), role (admin/user), title, department, and join date range.'
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid filter parameters' })
  findAll(@Query(ValidationPipe) filterDto: UserFilterDto) {
    return this.usersService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a user by ID',
    description: 'Retrieves a specific user by its UUID.'
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'The user UUID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Update a user',
    description: 'Updates an existing user with new information. Can include attachment files (up to 10 files) for updating user images.'
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'The user UUID' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.usersService.update(id, updateUserDto, files);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a user',
    description: 'Soft deletes a user by setting deletedAt timestamp.'
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'The user UUID' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}

