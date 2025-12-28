import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class UpdateAssetTrackingDto {
  @ApiPropertyOptional({ example: 1, description: 'Asset ID' })
  @IsInt()
  @IsOptional()
  asset_id?: number;

  @ApiPropertyOptional({ example: 'uuid', description: 'User ID' })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({ example: '2025-01-01T12:00:00Z', description: 'When the asset was assigned' })
  @IsDateString()
  @IsOptional()
  assigned_at?: string;

  @ApiPropertyOptional({ example: '2025-12-31T12:00:00Z', description: 'When the asset was removed' })
  @IsDateString()
  @IsOptional()
  removed_at?: string;
}

