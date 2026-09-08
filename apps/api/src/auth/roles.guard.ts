// ============================================================
// Roles Guard — RBAC & Account Status Enforcement
// ============================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor?.value ?? target);
    return descriptor ?? target;
  };
};

export const AdminOnly = () => Roles('ADMIN');

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    // If endpoint requires specific roles, user must be authenticated
    if (requiredRoles && !user) {
      throw new UnauthorizedException('Authentication required to access this resource.');
    }

    // Enforce account status: Suspended or Disabled accounts cannot access protected resources
    if (user && (user.status === 'SUSPENDED' || user.status === 'DISABLED')) {
      throw new ForbiddenException(
        `Account access is ${user.status.toLowerCase()}. Please contact platform administration.`,
      );
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.includes(user?.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Requires one of [${requiredRoles.join(', ')}], current role is '${user?.role || 'NONE'}'.`,
      );
    }

    return true;
  }
}
