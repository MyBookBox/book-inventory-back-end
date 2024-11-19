import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../user/entities/user.entity';
import { BookEntity } from '../book/entities/book.entity';

dotenv.config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST') || 'localhost',
  port: +configService.get<number>('DATABASE_PORT') || 5432,
  username: configService.get<string>('DATABASE_USERNAME') || 'postgres',
  password: configService.get<string>('DATABASE_PASSWORD') || '123',
  database: configService.get<string>('DATABASE_NAME') || 'Book_Inventory',
  entities: [UserEntity, BookEntity],
  migrations: ['src/db/migrations/*.ts'],
  logging: false,
  synchronize: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
