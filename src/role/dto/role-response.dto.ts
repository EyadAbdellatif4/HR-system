import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'The unique identifier of the role'
  })
  id: string;

  @ApiProperty({
    example: 'admin',
    description: 'The name of the role'
  })
  name: string;

  @ApiProperty({
    example: true,
    description: 'Whether the role is active'
  })
  is_active: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'The date and time when the role was created'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'The date and time when the role was last updated'
  })
  updatedAt: Date;
}

export class CreateRoleResponseDto {
  @ApiProperty({
    example: 'Role created successfully',
    description: 'Success message for role creation'
  })
  message: string;

  @ApiProperty({
    type: RoleResponseDto,
    description: 'The created role data'
  })
  role: RoleResponseDto;
}

export class FindAllRolesResponseDto {
  @ApiProperty({
    example: 'Roles retrieved successfully',
    description: 'Success message for retrieving all roles'
  })
  message: string;

  @ApiProperty({
    type: [RoleResponseDto],
    isArray: true,
    description: 'Array of all roles'
  })
  roles: RoleResponseDto[];

  @ApiProperty({
    example: 2,
    description: 'Total number of roles'
  })
  count: number;
}

export class FindOneRoleResponseDto {
  @ApiProperty({
    example: 'Role retrieved successfully',
    description: 'Success message for retrieving a role'
  })
  message: string;

  @ApiProperty({
    type: RoleResponseDto,
    description: 'The requested role data'
  })
  role: RoleResponseDto;
}

export class UpdateRoleResponseDto {
  @ApiProperty({
    example: 'Role updated successfully',
    description: 'Success message for role update'
  })
  message: string;

  @ApiProperty({
    type: RoleResponseDto,
    description: 'The updated role data'
  })
  role: RoleResponseDto;
}

export class DeleteRoleResponseDto {
  @ApiProperty({
    example: 'Role deactivated successfully',
    description: 'Success message for role deletion'
  })
  message: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'The ID of the deleted role'
  })
  roleId: string;
}
