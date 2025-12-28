import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/create-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterResponseDto, LoginResponseDto, RefreshTokenResponseDto } from './dto/auth-response.dto';
import { 
  ValidationErrorDto, 
  ConflictErrorDto, 
  UnauthorizedErrorDto, 
  TooManyRequestsErrorDto,
  InternalServerErrorDto 
} from '../shared/dto/error-response.dto'; 

@Controller('auth')
@ApiTags('Auth')
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    /**
     * Register a new user
     * @param registerDto - The user data
     * @returns The registered user
     */
  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided information. Username must be unique.'
  })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid input data', type: ValidationErrorDto })
  @ApiResponse({ status: 409, description: 'Conflict - Username already exists', type: ConflictErrorDto })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded', type: TooManyRequestsErrorDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: InternalServerErrorDto })
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

    /**
     * Login a user
     * @param loginDto - The user data
     * @returns The logged in user
     */
  @Post('login')
  @ApiOperation({ 
    summary: 'Login a user',
    description: 'Authenticates a user with username and password, returns JWT access token and refresh token.'
  })
  @ApiResponse({ status: 200, description: 'User logged in successfully', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid input data', type: ValidationErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials', type: UnauthorizedErrorDto })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded', type: TooManyRequestsErrorDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: InternalServerErrorDto })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh access token
   * @param refreshTokenDto - The refresh token
   * @returns New access token and new refresh token
   */
  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Refreshes the access token using a valid refresh token. Returns a new access token and a new rotated refresh token for enhanced security.'
  })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: RefreshTokenResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error - Invalid input data', type: ValidationErrorDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired refresh token', type: UnauthorizedErrorDto })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded', type: TooManyRequestsErrorDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: InternalServerErrorDto })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  refresh(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

}
