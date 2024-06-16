import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post('set')
  async setValue(@Body('key') key: string, @Body('value') value: string) {
    await this.redisService.setValue(key, value);
    return 'Value set successfully';
  }

  @Get('get/:key')
  async getValue(@Param('key') key: string) {
    const value = await this.redisService.getValue(key);
    return { key, value };
  }
}
