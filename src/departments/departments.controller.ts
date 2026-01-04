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
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentFilterDto } from './dto/department-filter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleName } from '../shared/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@ApiTags('Departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN)
  create(@Body(ValidationPipe) createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  findAll(@Query(ValidationPipe) filterDto: DepartmentFilterDto) {
    return this.departmentsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(RoleName.ADMIN)
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(RoleName.ADMIN)
  update(@Param('id') id: string, @Body(ValidationPipe) updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN)
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}

