import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';

export class UserFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({ example: 'EMP001', description: 'Search by user number' })
  @IsString()
  @IsOptional()
  user_number?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Search by name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ 
    example: 'hybrid', 
    description: 'Filter by work location',
    enum: ['in-office', 'hybrid', 'remote']
  })
  @IsEnum(['in-office', 'hybrid', 'remote'])
  @IsOptional()
  work_location?: 'in-office' | 'hybrid' | 'remote';

  @ApiPropertyOptional({ 
    example: 'true', 
    description: 'Filter by social insurance. Accepts: "true" or "false"',
    type: String
  })
  @IsOptional()
  @IsString()
  social_insurance?: string;

  @ApiPropertyOptional({ 
    example: 'true', 
    description: 'Filter by medical insurance. Accepts: "true" or "false"',
    type: String
  })
  @IsOptional()
  @IsString()
  medical_insurance?: string;

  @ApiPropertyOptional({ 
    example: 'user', 
    description: 'Filter by role name',
    enum: ['admin', 'user']
  })
  @IsEnum(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';

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

