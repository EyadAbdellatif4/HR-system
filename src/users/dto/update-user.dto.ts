import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDateString, IsUUID, IsEnum, IsArray, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformArray } from '../../shared/decorators/transform-array.decorator';
import { TransformBoolean } from '../../shared/decorators/transform-boolean.decorator';
import { TransformNullable } from '../../shared/decorators/transform-nullable.decorator';
import { WorkLocation } from '../enums';

/**
 * Transforms empty strings to undefined for optional fields
 * This is needed for formData where empty fields are sent as empty strings
 */
const TransformEmptyToUndefined = () => Transform(({ value }) => 
  value === '' || value === null ? undefined : value
);

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'EMP001', description: 'User number' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  user_number?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'User name' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country', description: 'User address' })
  @TransformEmptyToUndefined()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ enum: WorkLocation })
  @TransformEmptyToUndefined()
  @IsEnum(WorkLocation)
  @IsOptional()
  work_location?: WorkLocation;

  @ApiPropertyOptional({ example: true })
  @TransformBoolean()
  @IsBoolean()
  @IsOptional()
  social_insurance?: boolean;

  @ApiPropertyOptional({ example: true })
  @TransformBoolean()
  @IsBoolean()
  @IsOptional()
  medical_insurance?: boolean;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Join date' })
  @TransformEmptyToUndefined()
  @IsDateString()
  @IsOptional()
  join_date?: string;

  @ApiPropertyOptional({ example: '2025-12-31', nullable: true })
  @TransformNullable()
  @IsOptional()
  @IsDateString()
  contract_date?: string | null;

  @ApiPropertyOptional({ example: '2026-12-31', nullable: true })
  @TransformNullable()
  @IsOptional()
  @IsDateString()
  exit_date?: string | null;

  @ApiPropertyOptional({ example: 'uuid', description: 'Role ID' })
  @TransformEmptyToUndefined()
  @IsUUID()
  @IsOptional()
  role_id?: string;

  @ApiPropertyOptional({ example: 'Software Engineer', nullable: true })
  @TransformNullable()
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional({ 
    type: [String],
    description: 'Personal phone numbers as array',
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
    type: [String],
    description: 'Department IDs as array',
    example: ['uuid1', 'uuid2'],
    required: false,
    nullable: true
  })
  @IsOptional()
  @TransformArray()
  @IsArray({ message: 'department_ids must be an array' })
  @IsUUID(undefined, { each: true })
  department_ids?: string[];

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  images?: Express.Multer.File[];
}

