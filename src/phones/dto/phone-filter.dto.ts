import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { BaseFilterDto } from '../../shared/dto/base-filter.dto';

export class PhoneFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({ example: '+1234567890', description: 'Search by phone number' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({ example: 'Verizon', description: 'Search by company' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter by user ID' })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Filter by creation date from' })
  @IsString()
  @IsOptional()
  createdFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Filter by creation date to' })
  @IsString()
  @IsOptional()
  createdTo?: string;
}

