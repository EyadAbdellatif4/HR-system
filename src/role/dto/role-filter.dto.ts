import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';

/**
 * Filter DTO for Roles
 */
export class RoleFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by role name (partial match, case-insensitive)',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by creation date from (ISO date string)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date to (ISO date string)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  createdTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by update date from (ISO date string)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  updatedFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by update date to (ISO date string)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  updatedTo?: string;
}

