import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ErrorMessage } from '../../shared/enums';
import { TransformArray } from '../../shared/decorators/transform-array.decorator';
import { TransformBoolean } from '../../shared/decorators/transform-boolean.decorator';
import { TransformNullable } from '../../shared/decorators/transform-nullable.decorator';
import { UserRole, WorkLocation } from '../enums';

export class CreateUserDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  user_number: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', format: 'email' })
  @IsEmail({}, { message: ErrorMessage.EMAIL_INVALID })
  @MaxLength(255, { message: ErrorMessage.USERNAME_MAX_LENGTH })
  @IsNotEmpty({ message: ErrorMessage.USERNAME_REQUIRED })
  username: string;

  @ApiProperty({ example: 'SecurePassword123!', format: 'password' })
  @IsString({ message: ErrorMessage.PASSWORD_MUST_BE_STRING })
  @MinLength(6, { message: ErrorMessage.PASSWORD_MIN_LENGTH })
  @MaxLength(255, { message: ErrorMessage.PASSWORD_MAX_LENGTH })
  @IsNotEmpty({ message: ErrorMessage.PASSWORD_REQUIRED })
  password: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ enum: WorkLocation })
  @IsEnum(WorkLocation)
  @IsNotEmpty()
  work_location: WorkLocation;

  @ApiProperty({ example: 'true', type: String })
  @TransformBoolean()
  @IsBoolean({ message: ErrorMessage.SOCIAL_INSURANCE_MUST_BE_BOOLEAN })
  social_insurance: boolean;

  @ApiProperty({ example: 'true', type: String })
  @TransformBoolean()
  @IsBoolean({ message: ErrorMessage.MEDICAL_INSURANCE_MUST_BE_BOOLEAN })
  medical_insurance: boolean;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  @IsNotEmpty()
  join_date: string;

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

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({ example: 'Software Engineer', nullable: true })
  @TransformNullable()
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @TransformArray()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  personal_phone?: string[];

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @TransformArray()
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  department_ids?: string[];

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  images?: Express.Multer.File[];
}

