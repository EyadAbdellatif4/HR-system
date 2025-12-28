import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering', description: 'The name of the department' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: true, description: 'The active status of the department', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

