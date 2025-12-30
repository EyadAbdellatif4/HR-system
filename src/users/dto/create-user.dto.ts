import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsDateString, IsEnum, IsArray, IsOptional, IsUUID, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ErrorMessage } from '../../shared/enums';
import { Type, Transform } from 'class-transformer';
import { TransformArray } from '../../shared/decorators/transform-array.decorator';

export class CreateUserDto {
  @ApiProperty({ example: 'EMP001', description: 'User number (must be unique)' })
  @IsString()
  @IsNotEmpty()
  user_number: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: 'john.doe@example.com', 
    description: 'Username/email address (must be unique)',
    format: 'email'
  })
  @IsEmail({}, { message: ErrorMessage.EMAIL_INVALID })
  @IsNotEmpty({ message: ErrorMessage.USERNAME_REQUIRED })
  @MaxLength(255, { message: ErrorMessage.USERNAME_MAX_LENGTH })
  username: string;

  @ApiProperty({ 
    example: 'SecurePassword123!', 
    description: 'Password for the user account',
    minLength: 6,
    maxLength: 255,
    format: 'password'
  })
  @IsString({ message: ErrorMessage.PASSWORD_MUST_BE_STRING })
  @IsNotEmpty({ message: ErrorMessage.PASSWORD_REQUIRED })
  @MinLength(6, { message: ErrorMessage.PASSWORD_MIN_LENGTH })
  @MaxLength(255, { message: ErrorMessage.PASSWORD_MAX_LENGTH })
  password: string;

  @ApiProperty({ example: '123 Main St, City, Country', description: 'User address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ 
    example: 'hybrid', 
    description: 'Work location',
    enum: ['in-office', 'hybrid', 'remote']
  })
  @IsEnum(['in-office', 'hybrid', 'remote'])
  @IsNotEmpty()
  work_location: 'in-office' | 'hybrid' | 'remote';

  @ApiProperty({ 
    example: 'true', 
    description: 'Social insurance. Accepts: "true", "false", true, false',
    type: String
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsNotEmpty()
  social_insurance: boolean;

  @ApiProperty({ 
    example: 'true', 
    description: 'Medical insurance. Accepts: "true", "false", true, false',
    type: String
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsNotEmpty()
  medical_insurance: boolean;

  @ApiProperty({ example: '2025-01-01', description: 'Join date' })
  @IsDateString()
  @IsNotEmpty()
  join_date: string;

  @ApiPropertyOptional({ 
    example: '2025-12-31', 
    description: 'Contract date (optional). Leave empty or uncheck to send null',
    required: false,
    nullable: true
  })
  @Transform(({ value }) => value === '' || value === null || value === undefined ? null : value)
  @IsDateString()
  @IsOptional()
  contract_date?: string | null;

  @ApiPropertyOptional({ 
    example: '2026-12-31', 
    description: 'Exit date (optional). Leave empty or uncheck to send null',
    required: false,
    nullable: true
  })
  @Transform(({ value }) => value === '' || value === null || value === undefined ? null : value)
  @IsDateString()
  @IsOptional()
  exit_date?: string | null;

  @ApiProperty({ 
    example: 'user', 
    description: 'User role',
    enum: ['admin', 'user']
  })
  @IsEnum(['admin', 'user'])
  @IsNotEmpty()
  role: 'admin' | 'user';

  @ApiPropertyOptional({ 
    example: 'Software Engineer', 
    description: 'User title (optional). Leave empty or uncheck to send null',
    required: false,
    nullable: true
  })
  @Transform(({ value }) => value === '' || value === null || value === undefined ? null : value)
  @IsString()
  @IsOptional()
  title?: string | null;

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

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Attachment files to upload (up to 10 files, max 10MB each). Accepted formats: images (jpg, jpeg, png, gif, webp), documents (pdf, doc, docx, xls, xlsx), text files (txt, html), and more.',
  })
  @IsOptional()
  images?: any[];
}

