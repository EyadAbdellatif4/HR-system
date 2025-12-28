import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateAssetDto {
  @ApiPropertyOptional({ example: 'Laptop-001', description: 'The label of the asset' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ example: 'Laptop', description: 'The type of the asset' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'Dell XPS 15', description: 'The model of the asset' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 'SN123456789', description: 'The serial number of the asset' })
  @IsString()
  @IsOptional()
  serial_number?: string;

  @ApiPropertyOptional({ example: 'Intel i7-12700H', description: 'The processor of the asset' })
  @IsString()
  @IsOptional()
  processor?: string;

  @ApiPropertyOptional({ example: '512GB', description: 'The SSD of the asset' })
  @IsString()
  @IsOptional()
  ssd?: string;

  @ApiPropertyOptional({ example: '1TB', description: 'The HDD of the asset' })
  @IsString()
  @IsOptional()
  hdd?: string;

  @ApiPropertyOptional({ example: '16GB', description: 'The RAM of the asset' })
  @IsString()
  @IsOptional()
  ram?: string;

  @ApiPropertyOptional({ example: 'NVIDIA RTX 3060', description: 'The graphics card of the asset' })
  @IsString()
  @IsOptional()
  graphics_card?: string;

  @ApiPropertyOptional({ example: 'Dell 27" 4K', description: 'The monitor of the asset' })
  @IsString()
  @IsOptional()
  monitor?: string;

  @ApiPropertyOptional({ example: 'Active', description: 'The status of the asset' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '123456789012345', description: 'The first IMEI of the asset' })
  @IsString()
  @IsOptional()
  imei_1?: string;

  @ApiPropertyOptional({ example: '123456789012346', description: 'The second IMEI of the asset' })
  @IsString()
  @IsOptional()
  imei_2?: string;

  @ApiPropertyOptional({ example: '128GB', description: 'The internal memory of the asset' })
  @IsString()
  @IsOptional()
  internal_memory?: string;

  @ApiPropertyOptional({ example: '256GB', description: 'The external memory of the asset' })
  @IsString()
  @IsOptional()
  external_memory?: string;

  @ApiPropertyOptional({ example: 'Additional details about the asset', description: 'Additional details' })
  @IsString()
  @IsOptional()
  details?: string;
}

