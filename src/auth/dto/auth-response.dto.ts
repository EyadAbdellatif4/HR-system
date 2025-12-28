import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'The unique identifier of the user'
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user'
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The username/email address of the user'
  })
  username: string;

  @ApiProperty({
    example: 'EMP001',
    description: 'The user number'
  })
  user_number: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'The ID of the role assigned to the user'
  })
  role_id: string;

  @ApiProperty({
    example: 'admin',
    description: 'The role name of the user'
  })
  role_name: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'The date and time when the user was created'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'The date and time when the user was last updated'
  })
  updatedAt: Date;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: 'User registered successfully',
    description: 'Success message for user registration'
  })
  message: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'The registered user data (password excluded)'
  })
  user: UserResponseDto;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'Login successful',
    description: 'Success message for user login'
  })
  message: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'The logged-in user data (password excluded)'
  })
  user: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtMTIzNC01Njc4OTBhYmNkZiIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlX2lkIjoiYTFhMmEzYTQtZTVmNi03ODkwLTEyMzQtNTY3ODkwYWJjZGYiLCJpYXQiOjE3MDUzMjQ2MDAsImV4cCI6MTcwNTQxMTAwMH0.example_signature',
    description: 'JWT access token for authentication'
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtMTIzNC01Njc4OTBhYmNkZiIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA1MzI0NjAwLCJleHAiOjE3MDYxODg2MDB9.example_signature',
    description: 'JWT refresh token for obtaining new access tokens (long-lived)'
  })
  refresh_token: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    example: 'Token refreshed successfully',
    description: 'Success message for token refresh'
  })
  message: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtMTIzNC01Njc4OTBhYmNkZiIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlX2lkIjoiYTFhMmEzYTQtZTVmNi03ODkwLTEyMzQtNTY3ODkwYWJjZGYiLCJpYXQiOjE3MDUzMjQ2MDAsImV4cCI6MTcwNTQxMTAwMH0.example_signature',
    description: 'New JWT access token for authentication'
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtMTIzNC01Njc4OTBhYmNkZiIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzA1MzI0NjAwLCJleHAiOjE3MDYxODg2MDB9.example_signature',
    description: 'New rotated JWT refresh token (old refresh token is invalidated)'
  })
  refresh_token: string;
}
