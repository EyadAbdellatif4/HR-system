import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationPattern, ErrorMessage, DefaultValues } from '../../shared/enums';

/**
 * CreateRoleDto is a DTO for creating a new role
 */
export class CreateRoleDto {
    @ApiProperty({ 
      example: 'admin', 
      description: 'The name of the role (must be unique)',
      minLength: 2,
      maxLength: 50,
      pattern: ValidationPattern.ROLE_NAME
    })
    @IsString({ message: ErrorMessage.ROLE_NAME_MUST_BE_STRING })
    @IsNotEmpty({ message: ErrorMessage.ROLE_NAME_REQUIRED })
    name: string;

    @ApiProperty({ 
      example: true, 
      description: 'Whether the role is active (defaults to true)',
      default: true
    })
    @IsOptional()
    @IsBoolean({ message: ErrorMessage.IS_ACTIVE_MUST_BE_BOOLEAN })
    is_active?: boolean = DefaultValues.IS_ACTIVE;
}
