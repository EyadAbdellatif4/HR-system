import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformNullable } from '../../shared/decorators/transform-nullable.decorator';

/**
 * Transforms empty strings to undefined for optional fields
 * This is needed for formData where empty fields are sent as empty strings
 */
const TransformEmptyToUndefined = () => Transform(({ value }) => 
  value === '' || value === null ? undefined : value
);

export class UpdateAssetTrackingDto {
  @ApiPropertyOptional({ 
    example: '6ff43431-1516-4c36-85ef-4e14b2ab4dc4', 
    description: 'Asset ID' 
  })
  @TransformEmptyToUndefined()
  @IsUUID()
  @IsOptional()
  asset_id?: string;

  @ApiPropertyOptional({ 
    example: '60483f66-bab3-442b-a3ca-bbf89943cbb5', 
    description: 'User ID' 
  })
  @TransformEmptyToUndefined()
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({ example: '2025-01-01T12:00:00Z', description: 'When the asset was assigned', nullable: true })
  @TransformNullable()
  @IsDateString()
  @IsOptional()
  assigned_at?: string | null;

  @ApiPropertyOptional({ example: '2025-12-31T12:00:00Z', description: 'When the asset was removed', nullable: true })
  @TransformNullable()
  @IsDateString()
  @IsOptional()
  removed_at?: string | null;
}

