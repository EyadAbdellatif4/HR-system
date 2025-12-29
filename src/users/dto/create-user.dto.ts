import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsDateString, IsEnum, IsArray, IsOptional, IsUUID, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ErrorMessage } from '../../shared/enums';

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

  @ApiProperty({ example: true, description: 'Social insurance' })
  @IsBoolean()
  @IsNotEmpty()
  social_insurance: boolean;

  @ApiProperty({ example: true, description: 'Medical insurance' })
  @IsBoolean()
  @IsNotEmpty()
  medical_insurance: boolean;

  @ApiProperty({ example: '2025-01-01', description: 'Join date' })
  @IsDateString()
  @IsNotEmpty()
  join_date: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Contract date' })
  @IsDateString()
  @IsOptional()
  contract_date?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Exit date' })
  @IsDateString()
  @IsOptional()
  exit_date?: string;

  @ApiProperty({ 
    example: 'user', 
    description: 'User role',
    enum: ['admin', 'user']
  })
  @IsEnum(['admin', 'user'])
  @IsNotEmpty()
  role: 'admin' | 'user';

  @ApiPropertyOptional({ example: 'Software Engineer', description: 'User title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ 
    type: [String], 
    description: 'Personal phone numbers as JSON array',
    example: ['0145325235', '425235325453']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  personal_phone?: string[];

  @ApiPropertyOptional({ 
    type: [String], 
    description: 'Department IDs',
    example: ['uuid1', 'uuid2']
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  department_ids?: string[];

  @ApiPropertyOptional({ 
    type: [String], 
    description: 'Image URLs to associate with the user',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

