import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { TransformBoolean } from '../../shared/decorators/transform-boolean.decorator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering', description: 'The name of the department' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: true, default: true })
  @TransformBoolean()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

