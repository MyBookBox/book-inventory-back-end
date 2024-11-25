import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ignoredRoutes = ['/api/v1/user/signin', '/api/v1/user/signup'];

    const request = context.switchToHttp().getRequest();

    if (ignoredRoutes.includes(request.url)) {
      return true;
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const hasRole = roles.some((role) => user.role.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('You do not have the required role');
    }

    return true;
  }
}
