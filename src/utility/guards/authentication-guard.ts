import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ignoredRoutes = ['/api/v1/user/signin', '/api/v1/user/signup'];

    if (ignoredRoutes.includes(request.path)) {
      return true;
    }

    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided. Please log in.');
    }

    try {
      this.jwtService.verify(token);
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
