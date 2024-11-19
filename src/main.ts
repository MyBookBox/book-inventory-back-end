import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

const configService = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api/v1');
  await app.listen(configService.get<number>('PORT') ?? 3000);
}

bootstrap();
