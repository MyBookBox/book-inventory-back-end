import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { UserService } from '../../user/user.service';
import { UserEntity } from '../../user/entities/user.entity';
import { verify } from 'jsonwebtoken';

dotenv.config();
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: UserEntity;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Token not provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET_KEY) as { id: number };

      if (!decoded || typeof decoded.id !== 'number') {
        throw new UnauthorizedException(
          'Invalid token payload: Missing or invalid ID',
        );
      }

      const user = await this.userService.findOne(decoded.id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req['user'] = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException(error.message || 'Invalid token');
    }
  }
}
