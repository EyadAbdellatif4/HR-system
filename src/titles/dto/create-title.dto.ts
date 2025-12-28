import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateTitleDto {
  @ApiProperty({ example: 'Software Engineer', description: 'The name of the title' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: true, description: 'The active status of the title', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

