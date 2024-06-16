import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { RedisController } from './redis/redis.controller';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './auth/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    AuthModule,
    MailModule,
  ],
  controllers: [
    AppController,
    AuthController,
    RedisController,
  ],
  providers: [
    AppService,
    RedisService,
  ],
})
export class AppModule {}
