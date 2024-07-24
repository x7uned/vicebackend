// src/app.module.ts
import { Module, MiddlewareConsumer, RequestMethod, Req } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { RedisController } from './redis/redis.controller';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './auth/email.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { JwtModule } from './jwt/jwt.module';
import { OrdersController } from './orders/orders.controller';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule,
    RedisModule,
    AuthModule,
    MailModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [
    AppController,
    RedisController,
  ],
  providers: [
    AppService,
    RedisService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'products', method: RequestMethod.POST },
        OrdersController,
        { path: 'auth/me', method: RequestMethod.ALL },
      );
  }
}
