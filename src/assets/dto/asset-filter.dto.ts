import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';
import { AssetType } from '../enums';

export class AssetFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({ example: 'Laptop-001', description: 'Search by label' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ example: 'Laptop', description: 'Filter by type' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ enum: AssetType })
  @IsEnum(AssetType)
  @IsOptional()
  asset_type?: AssetType;

  @ApiPropertyOptional({ example: 'Dell XPS 15', description: 'Search by model' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 'SN123456789', description: 'Search by serial number' })
  @IsString()
  @IsOptional()
  serial_number?: string;

  @ApiPropertyOptional({ example: 'Active', description: 'Filter by status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Filter by creation date from' })
  @IsString()
  @IsOptional()
  createdFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Filter by creation date to' })
  @IsString()
  @IsOptional()
  createdTo?: string;
}

