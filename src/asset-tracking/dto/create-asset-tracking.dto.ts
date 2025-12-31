import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateAssetTrackingDto {
  @ApiProperty({ 
    example: '6ff43431-1516-4c36-85ef-4e14b2ab4dc4', 
    description: 'Asset ID' 
  })
  @IsUUID()
  @IsNotEmpty()
  asset_id: string;

  @ApiProperty({ 
    example: '60483f66-bab3-442b-a3ca-bbf89943cbb5', 
    description: 'User ID' 
  })
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

