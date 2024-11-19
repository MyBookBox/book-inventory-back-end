import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { isArray } from 'class-validator';
import { verify } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { UserService } from '../../user/user.service';
import { UserEntity } from '../../user/entities/user.entity';

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
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (
      !authHeader ||
      isArray(authHeader) ||
      !authHeader.startsWith('Bearer')
    ) {
      next();
    } else {
      const token = authHeader.split(' ')[1];
      const secretKey =
        process.env.ACCESS_TOKEN_SECRET_KEY ||
        'likujyhtgrfedwsedrftgyhujikolplokijuhygtrfedwsedrftghyujikolpplokijuhy';

      console.log(`Token: ${token}`);

      try {
        const decoded = <JwtPayload>await verify(token, secretKey);
        const { id } = decoded;

        // Log to verify the token decoding
        console.log(`Decoded ID: ${id}`);

        // Ensure the ID is a valid number
        const userId = Number(id);
        console.log(`Parsed user ID: ${userId}`);

        if (isNaN(userId)) {
          throw new Error('Invalid user ID from token');
        }

        req.currentUser = await this.userService.findOne(userId);
        next();
      } catch (error) {
        console.error('Error in LoggerMiddleware:', error);
        next();
      }
    }
  }
}

interface JwtPayload {
  id: number;
}
