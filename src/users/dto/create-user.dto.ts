import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsDateString, IsUUID, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePhoneDto {
  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({ example: 'Verizon', description: 'Phone company' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: 'Unlimited Plan', description: 'Current plan' })
  @IsString()
  @IsOptional()
  current_plan?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Legal owner' })
  @IsString()
  @IsOptional()
  legal_owner?: string;

  @ApiPropertyOptional({ example: 'Company provided phone', description: 'Comment' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ example: true, description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class CreateUserDto {
  @ApiProperty({ example: 'EMP001', description: 'User number' })
  @IsString()
  @IsNotEmpty()
  user_number: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({ example: 'uuid', description: 'Role ID' })
  @IsUUID()
  @IsNotEmpty()
  role_id: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'Title ID' })
  @IsUUID()
  @IsOptional()
  title_id?: string;

  @ApiPropertyOptional({ 
    type: [CreatePhoneDto], 
    description: 'User phones',
    example: [{ number: '+1234567890', company: 'Verizon' }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhoneDto)
  @IsOptional()
  phones?: CreatePhoneDto[];

  @ApiPropertyOptional({ 
    type: [String], 
    description: 'Department IDs',
    example: ['uuid1', 'uuid2']
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  department_ids?: string[];
}

