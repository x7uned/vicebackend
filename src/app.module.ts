// src/app.module.ts
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './auth/email.module';
import { JwtModule } from './jwt/jwt.module';
import { OrdersController } from './orders/orders.controller';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { RedisController } from './redis/redis.controller';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    JwtModule,
    RedisModule,
    AuthModule,
    MailModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    UploadModule,
  ],
  controllers: [AppController, RedisController],
  providers: [AppService, RedisService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'products/create', method: RequestMethod.POST },
        OrdersController,
        { path: 'auth/me', method: RequestMethod.ALL },
        { path: 'auth/updateProfile', method: RequestMethod.ALL },
      );
  }
}
