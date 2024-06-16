import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async setValue(key: string, value: string) {
    await this.redisClient.set(key, value);
  }

  async getValue(key: string): Promise<string> {
    return this.redisClient.get(key);
  }
}
