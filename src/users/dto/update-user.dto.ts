import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDateString, IsUUID, IsEnum, IsArray, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformArray } from '../../shared/decorators/transform-array.decorator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'EMP001', description: 'User number' })
  @IsString()
  @IsOptional()
  user_number?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'User name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country', description: 'User address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ 
    example: 'hybrid', 
    description: 'Work location',
    enum: ['in-office', 'hybrid', 'remote']
  })
  @IsEnum(['in-office', 'hybrid', 'remote'])
  @IsOptional()
  work_location?: 'in-office' | 'hybrid' | 'remote';

  @ApiPropertyOptional({ example: true, description: 'Social insurance' })
  @IsBoolean()
  @IsOptional()
  social_insurance?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Medical insurance' })
  @IsBoolean()
  @IsOptional()
  medical_insurance?: boolean;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Join date' })
  @IsDateString()
  @IsOptional()
  join_date?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Contract date' })
  @IsDateString()
  @IsOptional()
  contract_date?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Exit date' })
  @IsDateString()
  @IsOptional()
  exit_date?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Role ID' })
  @IsUUID()
  @IsOptional()
  role_id?: string;

  @ApiPropertyOptional({ example: 'Software Engineer', description: 'User title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ 
    type: [String],
    description: 'Personal phone numbers as array. Can send as array or JSON string. Leave empty to omit',
    example: ['0145325235', '425235325453'],
    required: false,
    nullable: true
  })
  @IsOptional()
  @TransformArray()
  @IsArray()
  @IsString({ each: true })
  personal_phone?: string[];

  @ApiPropertyOptional({ 
    type: String,
    description: 'Department IDs. Can be: JSON array string ["uuid1", "uuid2"], comma-separated "uuid1,uuid2", or leave empty/uncheck to omit',
    example: '["uuid1", "uuid2"]',
    required: false,
    nullable: true
  })
  @IsOptional()
  @TransformArray()
  @IsArray({ message: 'department_ids must be an array. Use JSON format: ["uuid1", "uuid2"] or comma-separated: "uuid1,uuid2"' })
  @IsUUID(undefined, { each: true })
  department_ids?: string[];
}

