import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Software Engineering', description: 'The name of the department' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true, description: 'The active status of the department' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

