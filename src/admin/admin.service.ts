import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

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
}
