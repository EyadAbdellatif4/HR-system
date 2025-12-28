import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsUUID, IsOptional } from 'class-validator';

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

  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}

