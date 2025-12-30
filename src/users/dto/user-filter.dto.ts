import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';
import { TransformBoolean } from '../../shared/decorators/transform-boolean.decorator';
import { WorkLocation, UserRole } from '../enums';

export class UserFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({ example: 'EMP001', description: 'Search by user number' })
  @IsString()
  @IsOptional()
  user_number?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Search by name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: WorkLocation })
  @IsEnum(WorkLocation)
  @IsOptional()
  work_location?: WorkLocation;

  @ApiPropertyOptional({ example: true })
  @TransformBoolean()
  @IsOptional()
  social_insurance?: boolean;

  @ApiPropertyOptional({ example: true })
  @TransformBoolean()
  @IsOptional()
  medical_insurance?: boolean;

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Software Engineer', description: 'Filter by title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by department ID' })
  @IsUUID()
  @IsOptional()
  department_id?: string;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Filter by join date from' })
  @IsDateString()
  @IsOptional()
  joinDateFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Filter by join date to' })
  @IsDateString()
  @IsOptional()
  joinDateTo?: string;
}

