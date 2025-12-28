import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';

export class TitleFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({ example: 'Engineer', description: 'Search by name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Filter by creation date from' })
  @IsString()
  @IsOptional()
  createdFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Filter by creation date to' })
  @IsString()
  @IsOptional()
  createdTo?: string;
}

