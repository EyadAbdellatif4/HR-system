import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsString } from 'class-validator';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';

export class AssetTrackingFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({ 
    example: '6ff43431-1516-4c36-85ef-4e14b2ab4dc4', 
    description: 'Filter by asset ID' 
  })
  @IsUUID()
  @IsOptional()
  asset_id?: string;

  @ApiPropertyOptional({ 
    example: '60483f66-bab3-442b-a3ca-bbf89943cbb5', 
    description: 'Filter by user ID' 
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Filter by assigned date from' })
  @IsDateString()
  @IsOptional()
  assignedFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Filter by assigned date to' })
  @IsDateString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Filter by creation date from' })
  @IsString()
  @IsOptional()
  createdFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Filter by creation date to' })
  @IsString()
  @IsOptional()
  createdTo?: string;
}

