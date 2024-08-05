import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { ChangeStatusDto } from 'src/orders/orders.dto';

@Injectable()
export class AdminService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis
    ) {}

    async me(userId: string) {
        const existingUsers = await this.redisClient.keys('user:*');
    
        for (const userKey of existingUsers) {
          const user = await this.redisClient.hgetall(userKey);
          if (user.id === userId || user.email === userId) {
            delete user.password;
            return { success: true, user };
          }
        }
    
        return { success: false };
    }

    async changeStatus(changeStatusDto: ChangeStatusDto) {
      try {
          const { id, newstatus } = changeStatusDto;

          const orderKey = `order:${id}`;
          const existingOrder = await this.redisClient.hgetall(orderKey);

          if (!existingOrder) {
          throw new NotFoundException('Order not found');
          }

          existingOrder.status = newstatus;

          await this.redisClient.hmset(orderKey, existingOrder);

          return { success: true, existingOrder };
      } catch (error) {
          console.error(error);
          return { success: false, message: error.message };
      }
  }
}
