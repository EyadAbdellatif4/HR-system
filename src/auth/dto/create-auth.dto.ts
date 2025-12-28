import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsBoolean, IsDateString, IsUUID, IsEnum, IsArray } from 'class-validator';
import { ValidationPattern, ErrorMessage } from '../../shared/enums';

/**
 * RegisterDto is a DTO for registering a new user
 */
export class RegisterDto {
  
  @ApiProperty({ 
    example: 'EMP001', 
    description: 'The user number (must be unique)'
  })
  @IsNotEmpty({ message: ErrorMessage.USER_NUMBER_REQUIRED })
  @IsString({ message: ErrorMessage.USER_NUMBER_MUST_BE_STRING })
  user_number: string;

  @ApiProperty({ 
    example: 'John Doe', 
    description: 'The full name of the user',
    minLength: 3,
    maxLength: 100,
    pattern: ValidationPattern.NAME
  })
  @IsNotEmpty({ message: ErrorMessage.NAME_REQUIRED })
  @IsString({ message: ErrorMessage.NAME_MUST_BE_STRING })
  @MinLength(3, { message: ErrorMessage.NAME_MIN_LENGTH })
  @MaxLength(100, { message: ErrorMessage.NAME_MAX_LENGTH })
  name: string;

  @ApiProperty({ 
    example: 'john.doe@example.com', 
    description: 'The username/email address of the user (must be unique)',
    format: 'email',
    maxLength: 255
  })
  @IsNotEmpty({ message: ErrorMessage.USERNAME_REQUIRED })
  @IsEmail({}, { message: ErrorMessage.EMAIL_INVALID })
  @MaxLength(255, { message: ErrorMessage.USERNAME_MAX_LENGTH })
  username: string;

  @ApiProperty({ 
    example: '123 Main St, City, Country', 
    description: 'The address of the user'
  })
  @IsNotEmpty({ message: ErrorMessage.ADDRESS_REQUIRED })
  @IsString({ message: ErrorMessage.ADDRESS_MUST_BE_STRING })
  address: string;

  @ApiProperty({ 
    example: 'hybrid', 
    description: 'The work location type',
    enum: ['in-office', 'hybrid', 'remote']
  })
  @IsEnum(['in-office', 'hybrid', 'remote'], { message: ErrorMessage.WORK_LOCATION_MUST_BE_ENUM })
  @IsNotEmpty({ message: ErrorMessage.WORK_LOCATION_REQUIRED })
  work_location: 'in-office' | 'hybrid' | 'remote';

  @ApiProperty({ 
    example: '2025-01-01', 
    description: 'The join date of the user'
  })
  @IsDateString({}, { message: ErrorMessage.JOIN_DATE_MUST_BE_DATE })
  @IsNotEmpty({ message: ErrorMessage.JOIN_DATE_REQUIRED })
  join_date: string;

  @ApiProperty({ 
    example: true, 
    description: 'Whether the user has social insurance'
  })
  @IsBoolean({ message: ErrorMessage.SOCIAL_INSURANCE_MUST_BE_BOOLEAN })
  @IsNotEmpty({ message: ErrorMessage.SOCIAL_INSURANCE_REQUIRED })
  social_insurance: boolean;

  @ApiProperty({ 
    example: true, 
    description: 'Whether the user has medical insurance'
  })
  @IsBoolean({ message: ErrorMessage.MEDICAL_INSURANCE_MUST_BE_BOOLEAN })
  @IsNotEmpty({ message: ErrorMessage.MEDICAL_INSURANCE_REQUIRED })
  medical_insurance: boolean;

  @ApiProperty({ 
    example: 'uuid', 
    description: 'The ID of the title'
  })
  @IsUUID(undefined, { message: ErrorMessage.TITLE_ID_MUST_BE_UUID })
  @IsNotEmpty({ message: ErrorMessage.TITLE_ID_REQUIRED })
  title_id: string;

  @ApiProperty({ 
    example: ['uuid1', 'uuid2'], 
    description: 'Array of department IDs',
    type: [String]
  })
  @IsArray({ message: 'Departments must be an array' })
  @IsUUID(undefined, { each: true, message: ErrorMessage.DEPARTMENT_ID_MUST_BE_UUID })
  @IsNotEmpty({ message: ErrorMessage.DEPARTMENT_ID_REQUIRED })
  departments: string[];

  @ApiProperty({ 
    example: 'SecurePassword123!', 
    description: 'The password for the user account',
    minLength: 6,
    maxLength: 255,
    format: 'password'
  })
  @IsNotEmpty({ message: ErrorMessage.PASSWORD_REQUIRED })
  @IsString({ message: ErrorMessage.PASSWORD_MUST_BE_STRING })
  @MinLength(6, { message: ErrorMessage.PASSWORD_MIN_LENGTH })
  @MaxLength(255, { message: ErrorMessage.PASSWORD_MAX_LENGTH })
  password: string;

}

/**
 * LoginDto is a DTO for logging in a user
 */
export class LoginDto {
  @ApiProperty({ 
    example: 'eyad@gmail.com', 
    description: 'The username/email address of the user',
    format: 'email'
  })
  @IsNotEmpty({ message: ErrorMessage.USERNAME_REQUIRED })
  @IsEmail({}, { message: ErrorMessage.EMAIL_INVALID })
  username: string;

  @ApiProperty({ 
    example: '1q2w3e4r5t', 
    description: 'The password for the user account',
    format: 'password'
  })
  @IsNotEmpty({ message: ErrorMessage.PASSWORD_REQUIRED })
  @IsString({ message: ErrorMessage.PASSWORD_MUST_BE_STRING })
  password: string;
}
