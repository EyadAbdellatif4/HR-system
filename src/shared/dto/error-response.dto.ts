import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty({ 
    example: 400, 
    description: 'HTTP status code',
    type: 'number'
  })
  statusCode: number;

  @ApiProperty({ 
    example: ['email must be a valid email', 'password must be at least 6 characters'],
    description: 'Array of validation error messages',
    type: [String]
  })
  message: string[];

  @ApiProperty({ 
    example: 'Bad Request', 
    description: 'Error type',
    type: 'string'
  })
  error: string;

  @ApiProperty({ 
    example: '/api/users', 
    description: 'The request path that caused the error',
    type: 'string'
  })
  path?: string;

  @ApiProperty({ 
    example: 'POST', 
    description: 'The HTTP method that caused the error',
    type: 'string'
  })
  method?: string;

  @ApiProperty({ 
    example: '2023-01-01T12:00:00.000Z', 
    description: 'Timestamp when the error occurred',
    type: 'string',
    format: 'date-time'
  })
  timestamp?: string;
}

export class UnauthorizedErrorDto {
  @ApiProperty({ 
    example: 401, 
    description: 'HTTP status code',
    type: 'number'
  })
  statusCode: number;

  @ApiProperty({ 
    example: 'Access token is required', 
    description: 'Error message',
    type: 'string'
  })
  message: string;

  @ApiProperty({ 
    example: 'Unauthorized', 
    description: 'Error type',
    type: 'string'
  })
  error: string;

  @ApiProperty({ 
    example: '/api/users', 
    description: 'The request path that caused the error',
    type: 'string'
  })
  path?: string;

  @ApiProperty({ 
    example: 'GET', 
    description: 'The HTTP method that caused the error',
    type: 'string'
  })
  method?: string;

  @ApiProperty({ 
    example: '2023-01-01T12:00:00.000Z', 
    description: 'Timestamp when the error occurred',
    type: 'string',
    format: 'date-time'
  })
  timestamp?: string;
}

export class ForbiddenErrorDto {
  @ApiProperty({ 
    example: 403, 
    description: 'HTTP status code',
    type: 'number'
  })
  statusCode: number;

  @ApiProperty({ 
    example: 'Insufficient permissions', 
    description: 'Error message',
    type: 'string'
  })
  message: string;

  @ApiProperty({ 
    example: 'Forbidden', 
    description: 'Error type',
    type: 'string'
  })
  error: string;

  @ApiProperty({ 
    example: '/api/users', 
    description: 'The request path that caused the error',
    type: 'string'
  })
  path?: string;

  @ApiProperty({ 
    example: 'POST', 
    description: 'The HTTP method that caused the error',
    type: 'string'
  })
  method?: string;

  @ApiProperty({ 
    example: '2023-01-01T12:00:00.000Z', 
    description: 'Timestamp when the error occurred',
    type: 'string',
    format: 'date-time'
  })
  timestamp?: string;
}

export class NotFoundErrorDto {
  @ApiProperty({ 
    example: 404, 
    description: 'HTTP status code',
    type: 'number'
  })
  statusCode: number;

  @ApiProperty({ 
    example: 'User with ID a1b2c3d4-e5f6-7890-1234-567890abcdef not found', 
    description: 'Error message',
    type: 'string'
  })
  message: string;

  @ApiProperty({ 
    example: 'Not Found', 
    description: 'Error type',
    type: 'string'
  })
  error: string;

  @ApiProperty({ 
    example: '/api/users/a1b2c3d4-e5f6-7890-1234-567890abcdef', 
    description: 'The request path that caused the error',
    type: 'string'
  })
  path?: string;

  @ApiProperty({ 
    example: 'GET', 
    description: 'The HTTP method that caused the error',
    type: 'string'
  })
  method?: string;

  @ApiProperty({ 
    example: '2023-01-01T12:00:00.000Z', 
    description: 'Timestamp when the error occurred',
    type: 'string',
    format: 'date-time'
  })
  timestamp?: string;
}

export class ConflictErrorDto {
  @ApiProperty({ 
    example: 409, 
    description: 'HTTP status code',
    type: 'number'
  })
  statusCode: number;

  @ApiProperty({ 
    example: 'User is already assigned to this project', 
    description: 'Error message',
    type: 'string'
  })
  message: string;

  @ApiProperty({ 
    example: 'Conflict', 
    description: 'Error type',
    type: 'string'
  })
  error: string;

  @ApiProperty({ 
    example: '/api/projects/a1b2c3d4-e5f6-7890-1234-567890abcdef/assign-user/fedcba98-7654-3210-fedc-ba9876543210', 
    description: 'The request path that caused the error',
    type: 'string'
  })
  path?: string;

  @ApiProperty({ 
    example: 'POST', 
    description: 'The HTTP method that caused the error',
    type: 'string'
  })
  method?: string;

  @ApiProperty({ 
    example: '2023-01-01T12:00:00.000Z', 
    description: 'Timestamp when the error occurred',
    type: 'string',
    format: 'date-time'
  })
  timestamp?: string;
}

export class TooManyRequestsErrorDto {
  @ApiProperty({ 
    example: 429, 
    description: 'HTTP status code',
    type: 'number'
  })
  statusCode: number;

  @ApiProperty({ 
    example: 'ThrottlerException: Too Many Requests', 
    description: 'Error message',
    type: 'string'
  })
  message: string;

  @ApiProperty({ 
    example: 'Too Many Requests', 
    description: 'Error type',
    type: 'string'
  })
  error: string;

  @ApiProperty({ 
    example: '/api/auth/login', 
    description: 'The request path that caused the error',
    type: 'string'
  })
  path?: string;

  @ApiProperty({ 
    example: 'POST', 
    description: 'The HTTP method that caused the error',
    type: 'string'
  })
  method?: string;

  @ApiProperty({ 
    example: '2023-01-01T12:00:00.000Z', 
    description: 'Timestamp when the error occurred',
    type: 'string',
    format: 'date-time'
  })
  timestamp?: string;
}

export class InternalServerErrorDto {
  @ApiProperty({ 
    example: 500, 
    description: 'HTTP status code',
    type: 'number'
  })
  statusCode: number;

  @ApiProperty({ 
    example: 'Internal server error', 
    description: 'Error message',
    type: 'string'
  })
  message: string;

  @ApiProperty({ 
    example: 'Internal Server Error', 
    description: 'Error type',
    type: 'string'
  })
  error: string;

  @ApiProperty({ 
    example: '/api/users', 
    description: 'The request path that caused the error',
    type: 'string'
  })
  path?: string;

  @ApiProperty({ 
    example: 'POST', 
    description: 'The HTTP method that caused the error',
    type: 'string'
  })
  method?: string;

  @ApiProperty({ 
    example: '2023-01-01T12:00:00.000Z', 
    description: 'Timestamp when the error occurred',
    type: 'string',
    format: 'date-time'
  })
  timestamp?: string;
}
