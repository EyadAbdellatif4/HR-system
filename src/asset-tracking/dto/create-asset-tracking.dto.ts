import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateAssetTrackingDto {
  @ApiProperty({ example: 1, description: 'Asset ID' })
  @IsInt()
  @IsNotEmpty()
  asset_id: number;

  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({ example: '2025-01-01T12:00:00Z', description: 'When the asset was assigned' })
  @IsDateString()
  @IsOptional()
  assigned_at?: string;

  @ApiPropertyOptional({ example: '2025-12-31T12:00:00Z', description: 'When the asset was removed' })
  @IsDateString()
  @IsOptional()
  removed_at?: string;
}

