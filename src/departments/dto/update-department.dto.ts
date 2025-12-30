import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { TransformBoolean } from '../../shared/decorators/transform-boolean.decorator';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Software Engineering', description: 'The name of the department' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true })
  @TransformBoolean()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

