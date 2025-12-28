import { IsOptional } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';
import { ApiProperty, PartialType as SwaggerPartialType } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/**
 * UpdateRoleDto is a DTO for updating a role
 */
export class UpdateRoleDto extends SwaggerPartialType(CreateRoleDto) {
    @ApiProperty({ example: true, description: 'The active status of the role' })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
