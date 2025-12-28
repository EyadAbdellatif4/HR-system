import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsUUID, IsOptional } from 'class-validator';

export class UpdatePhoneDto {
  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsOptional()
  number?: string;

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

  @ApiPropertyOptional({ example: true, description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 'uuid', description: 'User ID' })
  @IsUUID()
  @IsOptional()
  user_id?: string;
}

