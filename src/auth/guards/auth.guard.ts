import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../../role/entities/role.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../../shared/enums';

/**
 * AuthGuard - Handles JWT token authentication for Admin and User roles
 * 
 * This guard:
 * - Validates JWT tokens from Authorization header
 * - Extracts user information from token payload
 * - Checks role permissions
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    @InjectModel(Role)
    private roleRepository: typeof Role,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Validate JWT token
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    // Verify and extract user from JWT
    const user = await this.authenticateJWT(token);
    request.user = user;

    // Check role permissions
    return this.checkRolePermissions(context, request);
  }

  /**
   * Check if route is marked as public
   */
  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? false;
  }

  /**
   * Authenticate user using JWT token
   */
  private async authenticateJWT(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userRole = await this.roleRepository.findByPk(payload.role_id);
      if (!userRole) {
        throw new UnauthorizedException('Invalid user role');
      }

      // User number required for admin and user roles
      if ((userRole.name === RoleName.ADMIN || userRole.name === RoleName.USER) && !payload.user_number) {
        throw new UnauthorizedException('User number is required for admin and user roles');
      }

      return {
        id: payload.sub,
        user_number: payload.user_number,
        name: payload.name,
        role_id: payload.role_id,
        role_name: userRole.name,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Check if user has required role permissions
   */
  private checkRolePermissions(context: ExecutionContext, request: Request): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const userRole = (request as any).user?.role_name as RoleName;
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  /**
   * Extract JWT token from Authorization header
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

