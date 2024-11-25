import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from './entities/book.entity';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { JwtAuthGuard } from '../utility/guards/authentication-guard';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([BookEntity]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME },
    }),
  ],
  controllers: [BookController],
  providers: [BookService, JwtAuthGuard],
})
export class BookModule {}
