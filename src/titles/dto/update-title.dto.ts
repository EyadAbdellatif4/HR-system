import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateTitleDto {
  @ApiPropertyOptional({ example: 'Senior Software Engineer', description: 'The name of the title' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true, description: 'The active status of the title' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

