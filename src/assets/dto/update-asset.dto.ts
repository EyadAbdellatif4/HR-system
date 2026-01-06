import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { AssetType, AssetStatus } from '../enums';

/**
 * Transforms empty strings to undefined for optional fields
 * This is needed for formData where empty fields are sent as empty strings
 */
const TransformEmptyToUndefined = () => Transform(({ value }) => 
  value === '' || value === null ? undefined : value
);

export class UpdateAssetDto {
  @ApiPropertyOptional({ example: 'Laptop-001', description: 'The label of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ example: 'Laptop', description: 'The type of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ enum: AssetType })
  @TransformEmptyToUndefined()
  @IsEnum(AssetType)
  @IsOptional()
  asset_type?: AssetType;

  @ApiPropertyOptional({ example: 'Dell XPS 15', description: 'The model of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 'SN123456789', description: 'The serial number of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  serial_number?: string;

  @ApiPropertyOptional({ example: '16GB', description: 'The RAM of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  ram?: string;

  // Laptop-specific fields
  @ApiPropertyOptional({ example: 'Intel i7-12700H', description: 'The laptop processor of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  laptop_processor?: string;

  @ApiPropertyOptional({ example: '512GB', description: 'The laptop SSD of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  laptop_ssd?: string;

  @ApiPropertyOptional({ example: '1TB', description: 'The laptop HDD of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  laptop_hdd?: string;

  @ApiPropertyOptional({ example: 'NVIDIA RTX 3060', description: 'The laptop graphics card of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  laptop_graphics_card?: string;

  @ApiPropertyOptional({ example: 'Dell 27" 4K', description: 'The laptop monitor of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  laptop_monitor?: string;

  // Mobile-specific fields
  @ApiPropertyOptional({ example: '123456789012345', description: 'The first mobile IMEI of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  mobile_imei_1?: string;

  @ApiPropertyOptional({ example: '123456789012346', description: 'The second mobile IMEI of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  mobile_imei_2?: string;

  @ApiPropertyOptional({ example: '128GB', description: 'The mobile internal memory of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  mobile_internal_memory?: string;

  @ApiPropertyOptional({ example: '256GB', description: 'The mobile external memory of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  mobile_external_memory?: string;

  // Phone-specific fields
  @ApiPropertyOptional({ example: '+1234567890', description: 'The phone number of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({ example: 'Verizon', description: 'The phone company of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  phone_company?: string;

  @ApiPropertyOptional({ example: 'Unlimited Plan', description: 'The phone current plan of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  phone_current_plan?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'The phone legal owner of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  phone_legal_owner?: string;

  @ApiPropertyOptional({ example: 'Company provided phone', description: 'The phone comment of the asset' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  phone_comment?: string;

  @ApiPropertyOptional({ enum: AssetStatus, example: AssetStatus.ACTIVE, description: 'The status of the asset' })
  @TransformEmptyToUndefined()
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @ApiPropertyOptional({ example: 'Additional details about the asset', description: 'Additional details' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  images?: Express.Multer.File[];
}
