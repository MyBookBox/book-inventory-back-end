import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'src/db/data-source';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { LoggerMiddleware } from './utility/middlewares/current-user-middleware';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UserModule, BookModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
